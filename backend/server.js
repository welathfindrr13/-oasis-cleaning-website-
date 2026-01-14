require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const app = express();
const PORT = process.env.PORT || 3000;

// Data storage paths
const DATA_DIR = path.join(__dirname, 'data');
const LEADS_FILE = path.join(DATA_DIR, 'quote-leads.jsonl');

function ensureDataDir() {
  if (!fs.existsSync(DATA_DIR)) {
    fs.mkdirSync(DATA_DIR, { recursive: true });
  }
}

// Trust proxy - required when behind DigitalOcean's load balancer
app.set('trust proxy', true);

// Validate Brevo configuration
if (!process.env.BREVO_API_KEY) {
  console.warn('WARNING: BREVO_API_KEY not set. Email sending will fail.');
}

// Security middleware
app.use(helmet());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// CORS configuration
const allowedOrigins = process.env.ALLOWED_ORIGIN 
  ? process.env.ALLOWED_ORIGIN.split(',')
  : ['http://localhost:8000', 'http://127.0.0.1:8000'];

app.use(cors({
  origin: function(origin, callback) {
    // Allow requests with no origin (mobile apps, curl, etc)
    if (!origin) return callback(null, true);
    
    if (allowedOrigins.indexOf(origin) === -1) {
      const msg = 'The CORS policy for this site does not allow access from the specified Origin.';
      return callback(new Error(msg), false);
    }
    return callback(null, true);
  },
  credentials: true
}));

// Rate limiting: 5 requests per 15 minutes per IP (for legacy /quote endpoint)
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many quote requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// More lenient rate limiting for new quote-lead endpoint: 30 requests per minute
const quoteleadLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 30,
  message: { error: 'Too many requests, please try again shortly.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ 
    status: 'ok', 
    timestamp: new Date().toISOString(),
    emailProvider: 'Brevo',
    brevoConfigured: !!process.env.BREVO_API_KEY
  });
});

// Quote submission endpoint
app.post('/quote', limiter, async (req, res) => {
  try {
    const {
      full_name,
      email,
      phone,
      postcode,
      service_type,
      frequency,
      property_type,
      bedrooms,
      message,
      preferred_contact,
      honeypot // Spam trap field
    } = req.body;

    // Honeypot spam protection
    if (honeypot) {
      console.log('Spam detected via honeypot');
      return res.status(200).json({ success: true }); // Fake success to fool bots
    }

    // Validation
    if (!full_name || !email || !phone || !postcode || !service_type || !frequency) {
      return res.status(400).json({ 
        error: 'Missing required fields',
        required: ['full_name', 'email', 'phone', 'postcode', 'service_type', 'frequency']
      });
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ error: 'Invalid email format' });
    }

    // UK postcode validation
    const postcodeRegex = /^([Gg][Ii][Rr] 0[Aa]{2})|((([A-Za-z][0-9]{1,2})|(([A-Za-z][A-Ha-hJ-Yj-y][0-9]{1,2})|(([A-Za-z][0-9][A-Za-z])|([A-Za-z][A-Ha-hJ-Yj-y][0-9]?[A-Za-z]))))\s?[0-9][A-Za-z]{2})$/;
    if (!postcodeRegex.test(postcode.trim())) {
      return res.status(400).json({ error: 'Invalid UK postcode format' });
    }

    // Construct email content
    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4CAF50; border-bottom: 3px solid #4CAF50; padding-bottom: 10px;">
          New Quote Request
        </h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #444; margin-top: 0;">Contact Details</h3>
          <p><strong>Name:</strong> ${full_name}</p>
          <p><strong>Email:</strong> <a href="mailto:${email}">${email}</a></p>
          <p><strong>Phone:</strong> <a href="tel:${phone}">${phone}</a></p>
          <p><strong>Postcode:</strong> ${postcode}</p>
          <p><strong>Preferred Contact:</strong> ${preferred_contact || 'Not specified'}</p>
        </div>

        <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #444; margin-top: 0;">Service Requirements</h3>
          <p><strong>Service Type:</strong> ${service_type}</p>
          <p><strong>Frequency:</strong> ${frequency}</p>
          <p><strong>Property Type:</strong> ${property_type || 'Not specified'}</p>
          <p><strong>Number of Bedrooms/Rooms:</strong> ${bedrooms || 'Not specified'}</p>
        </div>

        ${message ? `
        <div style="background-color: #f0f8f0; padding: 20px; border-left: 4px solid #4CAF50; margin: 20px 0;">
          <h3 style="color: #444; margin-top: 0;">Additional Information</h3>
          <p style="white-space: pre-wrap;">${message}</p>
        </div>
        ` : ''}

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 12px; color: #666;">
          <p><strong>Submitted:</strong> ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} GMT</p>
          <p><strong>IP Address:</strong> ${req.ip || 'Unknown'}</p>
        </div>
      </div>
    `;

    const emailText = `
NEW QUOTE REQUEST

Contact Details:
- Name: ${full_name}
- Email: ${email}
- Phone: ${phone}
- Postcode: ${postcode}
- Preferred Contact: ${preferred_contact || 'Not specified'}

Service Requirements:
- Service Type: ${service_type}
- Frequency: ${frequency}
- Property Type: ${property_type || 'Not specified'}
- Number of Bedrooms/Rooms: ${bedrooms || 'Not specified'}

${message ? `Additional Information:\n${message}\n` : ''}

Submitted: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} GMT
IP Address: ${req.ip || 'Unknown'}
    `;

    // Send email via Brevo (Sendinblue) API
    const brevoPayload = {
      sender: {
        name: 'Oasis Cleaning Services',
        email: process.env.QUOTES_FROM_EMAIL || 'tyreeseedwards@gmail.com'
      },
      to: [
        {
          email: process.env.QUOTES_TO_EMAIL || 'tyreeseedwards@gmail.com',
          name: 'Oasis Cleaning Admin'
        }
      ],
      replyTo: {
        email: email,
        name: full_name
      },
      subject: `New Quote Request from ${full_name} - ${service_type}`,
      htmlContent: emailHtml,
      textContent: emailText,
      tags: ['quote-request', service_type.toLowerCase().replace(/\s+/g, '-')]
    };

    const brevoResponse = await axios.post(
      'https://api.brevo.com/v3/smtp/email',
      brevoPayload,
      {
        headers: {
          'api-key': process.env.BREVO_API_KEY?.trim() || '',
          'Content-Type': 'application/json',
          'accept': 'application/json'
        }
      }
    );

    console.log(`Quote request sent successfully via Brevo for ${email}`);
    console.log(`Brevo Message ID: ${brevoResponse.data.messageId}`);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Quote request received successfully. We will contact you within 24 hours.',
      data: {
        name: full_name,
        email: email,
        service: service_type,
        messageId: brevoResponse.data.messageId
      }
    });

  } catch (error) {
    console.error('Error processing quote request:', error);
    
    // Brevo specific error handling
    if (error.response) {
      console.error('Brevo API Error:', {
        status: error.response.status,
        data: error.response.data
      });
    }

    res.status(500).json({
      error: 'Failed to process quote request. Please try again or call us directly.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
});

// ============================================
// NEW: Quote Lead Endpoint (Smart Estimator)
// ============================================
app.post('/api/quote-lead', quoteleadLimiter, async (req, res) => {
  try {
    const payload = req.body;

    // Honeypot spam protection
    if (payload?.botField && String(payload.botField).trim() !== '') {
      console.log('Spam detected via honeypot');
      return res.status(200).json({ ok: true }); // Fake success to fool bots
    }

    // Validation
    if (!payload) {
      return res.status(400).json({ error: 'Missing payload' });
    }
    if (!payload.serviceType) {
      return res.status(400).json({ error: 'Missing serviceType' });
    }
    if (!payload.postcode) {
      return res.status(400).json({ error: 'Missing postcode' });
    }
    if (!payload.contact || (!payload.contact.email && !payload.contact.phone)) {
      return res.status(400).json({ error: 'Missing contact.email or contact.phone' });
    }

    // For non-office quotes, require quote details
    if (payload.serviceType !== 'OFFICE') {
      if (!payload.quote || typeof payload.quote.clientTotal !== 'number') {
        return res.status(400).json({ error: 'Missing quote.clientTotal' });
      }
      if (typeof payload.quote.hours !== 'number') {
        return res.status(400).json({ error: 'Missing quote.hours' });
      }
      if (typeof payload.quote.rate !== 'number') {
        return res.status(400).json({ error: 'Missing quote.rate' });
      }
    }

    // Ensure data directory exists
    ensureDataDir();

    // Generate unique ID and create record
    const id = crypto.randomUUID();
    const record = {
      id,
      receivedAt: new Date().toISOString(),
      ip: req.ip || 'Unknown',
      ...payload
    };

    // Save to JSONL file (append)
    fs.appendFileSync(LEADS_FILE, JSON.stringify(record) + '\n', 'utf8');
    console.log(`Quote lead saved: ${id}`);

    // Send email notification via Brevo
    const total = record.quote?.clientTotal != null 
      ? `£${record.quote.clientTotal.toFixed(2)}` 
      : 'Office (survey required)';
    
    const subject = `New Quote Lead: ${record.serviceType} | ${record.postcode} | ${total}`;

    const emailText = `
NEW QUOTE LEAD RECEIVED

Contact:
- Name: ${record.contact?.name || '—'}
- Phone: ${record.contact?.phone || '—'}
- Email: ${record.contact?.email || '—'}

Job:
- Service: ${record.serviceType}
- Postcode: ${record.postcode}

${record.quote ? `Quote:
- Total: ${total}
- Hours: ${record.quote.hours}
- Team size: ${record.quote.teamSize || '—'}
- On-site duration: ${record.quote.onsiteDuration ? record.quote.onsiteDuration.toFixed(1) + ' hrs' : '—'}
- Rate: £${record.quote.rate}/hr
` : ''}
${record.property ? `Property:
- Type: ${record.property.type || '—'}
- Bedrooms: ${record.property.bedrooms || '—'}
- Bathrooms: ${record.property.bathrooms || '—'}
- Condition: ${record.property.condition || '—'}
- Frequency: ${record.property.frequency || '—'}
` : ''}
${record.office ? `Office:
- Size: ${record.office.size || '—'}
- Desks/Rooms: ${record.office.desksRooms || '—'}
- Toilets: ${record.office.toilets || '—'}
- Kitchens: ${record.office.kitchens || '—'}
- Frequency: ${record.office.frequency || '—'}
- Out-of-hours: ${record.office.outOfHours || '—'}
` : ''}
${record.addOns?.length ? `Add-ons: ${record.addOns.join(', ')}` : ''}

${record.eotDetails ? `EOT Details:
- Date: ${record.eotDetails.preferredDate || '—'} (${record.eotDetails.arrivalWindow || '—'})
- Deadline: ${record.eotDetails.deadline || '—'}
- Floor: ${record.eotDetails.floorLevel || '—'} | Lift: ${record.eotDetails.liftAvailable || '—'}
- Occupancy: ${record.eotDetails.occupancy || '—'}
- Appliances: ${record.eotDetails.appliances?.join(', ') || 'None'}
` : ''}

Submitted: ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} GMT
IP: ${req.ip || 'Unknown'}
Lead ID: ${id}
    `;

    const emailHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #2F7D5A; border-bottom: 3px solid #2F7D5A; padding-bottom: 10px;">
          New Quote Lead: ${record.serviceType}
        </h2>
        
        <div style="background-color: #f9f9f9; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #444; margin-top: 0;">Contact</h3>
          <p><strong>Name:</strong> ${record.contact?.name || '—'}</p>
          <p><strong>Phone:</strong> <a href="tel:${record.contact?.phone}">${record.contact?.phone || '—'}</a></p>
          <p><strong>Email:</strong> <a href="mailto:${record.contact?.email}">${record.contact?.email || '—'}</a></p>
          <p><strong>Postcode:</strong> ${record.postcode}</p>
        </div>

        ${record.quote ? `
        <div style="background-color: #E6F1EC; padding: 20px; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #2F7D5A; margin-top: 0;">Quote Summary</h3>
          <p style="font-size: 24px; font-weight: bold; color: #2F7D5A;">${total}</p>
          <p><strong>Hours:</strong> ${record.quote.hours}</p>
          <p><strong>Team size:</strong> ${record.quote.teamSize || '—'}</p>
          <p><strong>On-site duration:</strong> ${record.quote.onsiteDuration ? record.quote.onsiteDuration.toFixed(1) + ' hrs' : '—'}</p>
          <p><strong>Rate:</strong> £${record.quote.rate}/hr</p>
        </div>
        ` : ''}

        ${record.property ? `
        <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #444; margin-top: 0;">Property Details</h3>
          <p><strong>Type:</strong> ${record.property.type || '—'}</p>
          <p><strong>Bedrooms:</strong> ${record.property.bedrooms || '—'}</p>
          <p><strong>Bathrooms:</strong> ${record.property.bathrooms || '—'}</p>
          <p><strong>Condition:</strong> ${record.property.condition || '—'}</p>
          <p><strong>Frequency:</strong> ${record.property.frequency || '—'}</p>
        </div>
        ` : ''}

        ${record.office ? `
        <div style="background-color: #fff; padding: 20px; border: 1px solid #ddd; border-radius: 5px; margin: 20px 0;">
          <h3 style="color: #444; margin-top: 0;">Office Details</h3>
          <p><strong>Size:</strong> ${record.office.size || '—'}</p>
          <p><strong>Desks/Rooms:</strong> ${record.office.desksRooms || '—'}</p>
          <p><strong>Toilets:</strong> ${record.office.toilets || '—'}</p>
          <p><strong>Kitchens:</strong> ${record.office.kitchens || '—'}</p>
          <p><strong>Frequency:</strong> ${record.office.frequency || '—'}</p>
          <p><strong>Out-of-hours:</strong> ${record.office.outOfHours || '—'}</p>
        </div>
        ` : ''}

        ${record.addOns?.length ? `
        <div style="margin: 20px 0;">
          <p><strong>Add-ons:</strong> ${record.addOns.join(', ')}</p>
        </div>
        ` : ''}

        ${record.eotDetails ? `
        <div style="background-color: #FFF8E6; padding: 20px; border-left: 4px solid #C6A756; margin: 20px 0;">
          <h3 style="color: #444; margin-top: 0;">End of Tenancy Details</h3>
          <p><strong>Date:</strong> ${record.eotDetails.preferredDate || '—'} (${record.eotDetails.arrivalWindow || '—'})</p>
          <p><strong>Deadline:</strong> ${record.eotDetails.deadline || '—'}</p>
          <p><strong>Floor:</strong> ${record.eotDetails.floorLevel || '—'} | <strong>Lift:</strong> ${record.eotDetails.liftAvailable || '—'}</p>
          <p><strong>Occupancy:</strong> ${record.eotDetails.occupancy || '—'}</p>
          <p><strong>Appliances:</strong> ${record.eotDetails.appliances?.join(', ') || 'None selected'}</p>
        </div>
        ` : ''}

        <div style="background-color: #f5f5f5; padding: 15px; border-radius: 5px; margin-top: 20px; font-size: 12px; color: #666;">
          <p><strong>Lead ID:</strong> ${id}</p>
          <p><strong>Submitted:</strong> ${new Date().toLocaleString('en-GB', { timeZone: 'Europe/London' })} GMT</p>
          <p><strong>IP:</strong> ${req.ip || 'Unknown'}</p>
        </div>
      </div>
    `;

    // Send email via Brevo (best-effort, don't fail if email fails)
    try {
      if (process.env.BREVO_API_KEY && process.env.QUOTES_TO_EMAIL) {
        const brevoPayload = {
          sender: {
            name: 'Oasis Quote System',
            email: process.env.QUOTES_FROM_EMAIL || 'quotes@oasisinternationalcleaningservices.com'
          },
          to: [
            {
              email: process.env.QUOTES_TO_EMAIL,
              name: 'Oasis Cleaning Admin'
            }
          ],
          replyTo: record.contact?.email ? {
            email: record.contact.email,
            name: record.contact.name || 'Customer'
          } : undefined,
          subject: subject,
          htmlContent: emailHtml,
          textContent: emailText,
          tags: ['quote-lead', record.serviceType.toLowerCase()]
        };

        const brevoResponse = await axios.post(
          'https://api.brevo.com/v3/smtp/email',
          brevoPayload,
          {
            headers: {
              'api-key': process.env.BREVO_API_KEY.trim(),
              'Content-Type': 'application/json',
              'accept': 'application/json'
            }
          }
        );
        console.log(`Quote lead email sent via Brevo: ${brevoResponse.data.messageId}`);
      } else {
        console.log('Brevo not configured, skipping email notification');
      }
    } catch (emailError) {
      console.error('Email notification failed (lead still saved):', emailError.message);
    }

    return res.json({ ok: true, id });

  } catch (error) {
    console.error('Error processing quote lead:', error);
    return res.status(500).json({ error: 'Server error' });
  }
});

// 404 handler
app.use((req, res) => {
  res.status(404).json({ error: 'Endpoint not found' });
});

// Error handler
app.use((err, req, res, next) => {
  console.error('Server error:', err);
  res.status(500).json({ 
    error: 'Internal server error',
    details: process.env.NODE_ENV === 'development' ? err.message : undefined
  });
});

// Start server
app.listen(PORT, () => {
  console.log(`Quote API server running on port ${PORT}`);
  console.log(`Environment: ${process.env.NODE_ENV || 'development'}`);
  console.log(`Email Provider: Brevo (Sendinblue)`);
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
  console.log(`From Email: ${process.env.QUOTES_FROM_EMAIL || 'Not configured'}`);
  console.log(`To Email: ${process.env.QUOTES_TO_EMAIL || 'Not configured'}`);
});
