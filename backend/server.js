require('dotenv').config();
const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const sgMail = require('@sendgrid/mail');

const app = express();
const PORT = process.env.PORT || 3000;

// Configure SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

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

// Rate limiting: 5 requests per 15 minutes per IP
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 5,
  message: { error: 'Too many quote requests from this IP, please try again later.' },
  standardHeaders: true,
  legacyHeaders: false,
});

// Health check endpoint
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Quote submission endpoint
app.post('/api/quote', limiter, async (req, res) => {
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

    // Send email via SendGrid
    const msg = {
      to: process.env.QUOTE_TO_EMAIL || 'info@oasisinternationalcleaningservices.com',
      from: process.env.SENDGRID_FROM_EMAIL || 'noreply@oasisinternationalcleaningservices.com',
      replyTo: email,
      subject: `New Quote Request from ${full_name} - ${service_type}`,
      text: emailText,
      html: emailHtml,
    };

    await sgMail.send(msg);

    console.log(`Quote request sent successfully for ${email}`);

    // Send success response
    res.status(200).json({
      success: true,
      message: 'Quote request received successfully. We will contact you within 24 hours.',
      data: {
        name: full_name,
        email: email,
        service: service_type
      }
    });

  } catch (error) {
    console.error('Error processing quote request:', error);
    
    // SendGrid specific error handling
    if (error.response) {
      console.error('SendGrid Error:', error.response.body);
    }

    res.status(500).json({
      error: 'Failed to process quote request. Please try again or call us directly.',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
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
  console.log(`CORS allowed origins: ${allowedOrigins.join(', ')}`);
});
