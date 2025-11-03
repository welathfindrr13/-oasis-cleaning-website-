# Oasis Cleaning Quote API

A Node.js/Express backend API for handling quote form submissions with SendGrid email integration.

## 🚀 Features

- ✅ RESTful API endpoint for quote submissions
- ✅ SendGrid email integration
- ✅ CORS security with whitelist
- ✅ Rate limiting (5 requests per 15 minutes)
- ✅ Honeypot spam protection
- ✅ UK postcode validation
- ✅ Email format validation
- ✅ Phone number validation
- ✅ Professional HTML email templates
- ✅ Health check endpoint
- ✅ Error handling and logging

## 📋 Prerequisites

- Node.js 18.x or higher
- npm or yarn
- SendGrid API key
- SendGrid verified sender email

## 🔧 Local Development Setup

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Create environment file**:
   ```bash
   cp .env.example .env
   ```

3. **Configure environment variables** in `.env`:
   ```
   SENDGRID_API_KEY=your_sendgrid_api_key_here
   SENDGRID_FROM_EMAIL=noreply@oasisinternationalcleaningservices.com
   QUOTE_TO_EMAIL=info@oasisinternationalcleaningservices.com
   ALLOWED_ORIGIN=http://localhost:8000
   PORT=3000
   NODE_ENV=development
   ```

4. **Start development server**:
   ```bash
   npm run dev
   ```

5. **Test the API**:
   - Health check: `http://localhost:3000/health`
   - Should return: `{"status":"ok","timestamp":"..."}`

## 🧪 Testing

### Test with cURL

```bash
curl -X POST http://localhost:3000/api/quote \
  -H "Content-Type: application/json" \
  -d '{
    "full_name": "Test User",
    "email": "test@example.com",
    "phone": "020 3750 8878",
    "postcode": "SW1A 1AA",
    "service_type": "Residential Cleaning",
    "frequency": "Weekly",
    "property_type": "Flat/Apartment",
    "bedrooms": "2",
    "message": "Test message",
    "preferred_contact": "Email"
  }'
```

### Expected Response

**Success (200)**:
```json
{
  "success": true,
  "message": "Quote request received successfully. We will contact you within 24 hours.",
  "data": {
    "name": "Test User",
    "email": "test@example.com",
    "service": "Residential Cleaning"
  }
}
```

**Validation Error (400)**:
```json
{
  "error": "Missing required fields",
  "required": ["full_name", "email", "phone", "postcode", "service_type", "frequency"]
}
```

**Rate Limit (429)**:
```json
{
  "error": "Too many quote requests from this IP, please try again later."
}
```

## 📝 API Documentation

### POST /api/quote

Submit a quote request that will be emailed to the business.

**Headers**:
- `Content-Type: application/json`

**Request Body**:
```json
{
  "full_name": "string (required, min 2 chars)",
  "email": "string (required, valid email)",
  "phone": "string (required, UK phone)",
  "postcode": "string (required, UK postcode)",
  "service_type": "string (required)",
  "frequency": "string (required)",
  "property_type": "string (optional)",
  "bedrooms": "string (optional)",
  "message": "string (optional, max 1000 chars)",
  "preferred_contact": "string (optional)",
  "honeypot": "string (leave empty)"
}
```

**Service Types**:
- Residential Cleaning
- Office & Commercial Cleaning
- Deep Cleaning
- End of Tenancy Cleaning
- Specialist Cleans

**Frequencies**:
- One-off
- Weekly
- Fortnightly
- Monthly
- Other

**Response Codes**:
- `200`: Success
- `400`: Validation error
- `429`: Rate limit exceeded
- `500`: Server error

### GET /health

Check API health status.

**Response**:
```json
{
  "status": "ok",
  "timestamp": "2025-03-11T10:26:00.000Z"
}
```

## 🔒 Security Features

### Rate Limiting
- 5 requests per 15 minutes per IP address
- Configurable in `server.js`

### CORS
- Whitelist-based origin validation
- Configured via `ALLOWED_ORIGIN` environment variable
- Supports multiple origins (comma-separated)

### Honeypot Spam Protection
- Hidden form field that bots tend to fill
- If `honeypot` field has value, request is silently discarded

### Input Validation
- Email format validation (RFC 5322)
- UK postcode format validation
- UK phone number validation
- Maximum message length (1000 chars)

## 🌐 Deployment

See [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md) in the project root for complete deployment instructions to DigitalOcean App Platform.

### Quick Deploy to DigitalOcean

1. Push code to GitHub
2. Connect GitHub repo to DigitalOcean App Platform
3. Import `.do/app.yaml` configuration
4. Set environment variables in DigitalOcean dashboard
5. Deploy!

## 📊 Monitoring

### View Logs

**Local**:
```bash
npm start
# Logs will appear in console
```

**Production (DigitalOcean)**:
1. Go to App dashboard
2. Click on `quote-api` service
3. View "Runtime Logs" tab

### SendGrid Email Activity

1. Login to SendGrid dashboard
2. Go to "Activity" section
3. View email delivery status, opens, clicks, etc.

## 🐛 Troubleshooting

### Issue: Email not sending

**Check**:
1. `SENDGRID_API_KEY` is correct
2. Sender email is verified in SendGrid
3. Check application logs for SendGrid errors
4. Verify SendGrid account is active (not suspended)

**Solution**:
```bash
# Test SendGrid connection
node -e "
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('YOUR_API_KEY');
sgMail.send({
  to: 'test@example.com',
  from: 'verified@yourdomain.com',
  subject: 'Test',
  text: 'Test email'
}).then(() => console.log('✅ Email sent!')).catch(console.error);
"
```

### Issue: CORS errors

**Error**: `Access to fetch... has been blocked by CORS policy`

**Solution**:
1. Check `ALLOWED_ORIGIN` environment variable
2. Ensure it matches your frontend URL exactly
3. For multiple origins, use comma separation:
   ```
   ALLOWED_ORIGIN=https://site1.com,https://site2.com
   ```

### Issue: Rate limit too restrictive

**Solution**: Edit `server.js`:
```javascript
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 10, // Increase from 5 to 10
  // ...
});
```

## 📦 Dependencies

- **express**: Web framework
- **cors**: CORS middleware
- **helmet**: Security headers
- **@sendgrid/mail**: SendGrid email client
- **express-rate-limit**: Rate limiting middleware
- **dotenv**: Environment variable management

## 📄 License

MIT

## 🤝 Support

For issues or questions:
1. Check [DEPLOYMENT_GUIDE.md](../DEPLOYMENT_GUIDE.md)
2. Review application logs
3. Check SendGrid dashboard
4. Contact: info@oasisinternationalcleaningservices.com

---

**Last updated**: March 11, 2025
