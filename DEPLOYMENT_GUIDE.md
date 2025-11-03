# 🚀 Oasis Cleaning Quote Form - Deployment Guide

This guide walks you through deploying the quote form backend to DigitalOcean App Platform with SendGrid email integration.

---

## 📋 Prerequisites

Before you begin, ensure you have:

1. ✅ A DigitalOcean account ([Sign up](https://www.digitalocean.com/))
2. ✅ A SendGrid account ([Sign up](https://sendgrid.com/))
3. ✅ A GitHub account with your project repository
4. ✅ Domain verified with SendGrid (or use SendGrid's free sender verification)

---

## 🔧 Part 1: SendGrid Setup

### Step 1: Create SendGrid Account & Get API Key

1. **Sign up for SendGrid** at https://sendgrid.com/
   - Free tier: 100 emails/day (sufficient for most small businesses)
   - Paid plans available if you need more volume

2. **Create an API Key**:
   - Go to Settings → API Keys
   - Click "Create API Key"
   - Name: `oasis-cleaning-quote-api`
   - Permission: "Full Access" (or at minimum "Mail Send" permission)
   - Click "Create & View"
   - **⚠️ IMPORTANT**: Copy the API key immediately - you won't see it again!
   - Store it securely (you'll need it for DigitalOcean)

### Step 2: Verify Sender Identity

**Option A: Single Sender Verification** (Quickest, Free)

1. Go to Settings → Sender Authentication
2. Click "Verify a Single Sender"
3. Fill in your details:
   - From Name: `Oasis Cleaning Services`
   - From Email: `noreply@oasisinternationalcleaningservices.com`
   - Reply To: `info@oasisinternationalcleaningservices.com`
   - Company Address: Your business address
4. Click "Create"
5. Check your email and click the verification link
6. ✅ Once verified, you can send emails from this address

**Option B: Domain Authentication** (Better for production, requires DNS access)

1. Go to Settings → Sender Authentication
2. Click "Authenticate Your Domain"
3. Follow wizard to add DNS records
4. Wait for DNS propagation (15 minutes - 48 hours)
5. Verify domain authentication

---

## 🌊 Part 2: DigitalOcean Deployment

### Step 1: Push Code to GitHub

1. **Create a new repository** on GitHub (e.g., `oasis-cleaning-website`)

2. **Initialize git in your project** (if not already done):
   ```bash
   cd "/Users/tyreeseedwards/oasis international cleaning services"
   git init
   git add .
   git commit -m "Initial commit with quote form backend"
   ```

3. **Add remote and push**:
   ```bash
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO.git
   git branch -M main
   git push -u origin main
   ```

### Step 2: Update App Configuration

1. **Edit `.do/app.yaml`**:
   - Replace `YOUR_GITHUB_USERNAME/YOUR_REPO_NAME` with your actual GitHub username and repo name
   - Example: `tyreeseedwards/oasis-cleaning-website`

2. **Commit changes**:
   ```bash
   git add .do/app.yaml
   git commit -m "Update GitHub repo in app.yaml"
   git push
   ```

### Step 3: Deploy to DigitalOcean

1. **Go to DigitalOcean Apps**:
   - Visit https://cloud.digitalocean.com/apps
   - Click "Create App"

2. **Choose GitHub as source**:
   - Click "GitHub"
   - Authorize DigitalOcean to access your repositories
   - Select your repository
   - Select branch: `main`
   - Autodeploy: ✅ Enable

3. **Import app spec**:
   - Click "Edit Your App Spec"
   - Paste the contents of `.do/app.yaml`
   - Click "Save"

4. **Configure environment variables**:
   - In the app settings, find the `quote-api` service
   - Click "Edit" next to Environment Variables
   - Add the following SECRET variables:
     ```
     SENDGRID_API_KEY = [paste your SendGrid API key]
     ```
   - All other variables should auto-populate from app.yaml

5. **Review and create**:
   - App Name: `oasis-cleaning-quote-api`
   - Region: London (`lon1`)
   - Instance Size: Basic (smallest tier is sufficient)
   - Monthly cost estimate: ~$12-15/month
   - Click "Create Resources"

6. **Wait for deployment** (5-10 minutes):
   - DigitalOcean will:
     - Build your backend
     - Deploy your static site
     - Assign public URLs
   - Monitor the build logs for any errors

### Step 4: Get Your API Endpoint

1. Once deployed, go to your app dashboard
2. Find the `quote-api` service
3. Copy the **Public URL** (e.g., `https://quote-api-xxxxx.ondigitalocean.app`)
4. This is your API endpoint!

### Step 5: Update Frontend Configuration

**Option A: Using Environment Variable (Recommended)**

1. In DigitalOcean App dashboard, go to `oasis-cleaning-frontend` component
2. Add environment variable:
   ```
   QUOTE_API_ENDPOINT = https://quote-api-xxxxx.ondigitalocean.app/api/quote
   ```
3. This will be automatically injected into your frontend as `window.QUOTE_API_ENDPOINT`

**Option B: Manual Update (If environment variable doesn't work)**

1. Edit `scripts.js` locally:
   ```javascript
   // Change this line:
   const API_ENDPOINT = window.QUOTE_API_ENDPOINT || 'http://localhost:3000/api/quote';
   
   // To:
   const API_ENDPOINT = window.QUOTE_API_ENDPOINT || 'https://quote-api-xxxxx.ondigitalocean.app/api/quote';
   ```

2. Commit and push:
   ```bash
   git add scripts.js
   git commit -m "Update API endpoint for production"
   git push
   ```

---

## ✅ Part 3: Testing

### Test 1: Backend Health Check

1. Open your browser
2. Visit: `https://quote-api-xxxxx.ondigitalocean.app/health`
3. You should see:
   ```json
   {
     "status": "ok",
     "timestamp": "2025-03-11T10:26:00.000Z"
   }
   ```
4. ✅ If you see this, your backend is running!

### Test 2: CORS Check

1. Open your browser's developer console (F12)
2. Go to your live website: `https://oasis-cleaning-frontend-xxxxx.ondigitalocean.app`
3. Fill out the quote form with test data:
   - Name: `Test User`
   - Email: `test@example.com`
   - Phone: `020 3750 8878`
   - Postcode: `SW1A 1AA`
   - Service Type: `Residential Cleaning`
   - Frequency: `One-off`
4. Submit the form
5. Check console for errors - you should see no CORS errors

### Test 3: Email Delivery

1. Fill out the quote form with **your real email address**
2. Submit the form
3. Check `info@oasisinternationalcleaningservices.com` inbox
4. You should receive an email within 30 seconds
5. ✅ Verify all form data appears correctly in the email

### Test 4: Spam Protection

1. Open browser developer tools
2. In the console, type:
   ```javascript
   document.getElementById('honeypot').value = 'spam';
   ```
3. Submit the form
4. You should see success message, but NO email should be received
5. ✅ This confirms honeypot is working

---

## 🔍 Part 4: Monitoring & Logs

### View Application Logs

1. Go to DigitalOcean App dashboard
2. Click on `quote-api` service
3. Go to "Runtime Logs" tab
4. You'll see:
   - Server startup messages
   - Each quote submission
   - Any errors

### Check SendGrid Email Activity

1. Go to SendGrid dashboard
2. Click "Activity" in sidebar
3. You'll see:
   - All sent emails
   - Delivery status
   - Bounce/spam reports
   - Open rates (if tracking enabled)

### Set Up Alerts

**DigitalOcean Alerts**:
1. Go to App → Settings → Alerts
2. Set up alerts for:
   - App down
   - High CPU usage
   - High memory usage
   - Error rate threshold

**SendGrid Alerts**:
1. Go to Settings → Mail Settings → Event Webhook
2. Configure webhook to receive delivery notifications

---

## 🔄 Part 5: Redeployment Instructions

### Automatic Deployment (Recommended)

Since autodeploy is enabled, any push to `main` branch will automatically trigger deployment:

```bash
# Make your changes locally
git add .
git commit -m "Your change description"
git push

# DigitalOcean will automatically:
# 1. Detect the push
# 2. Build the application
# 3. Run tests
# 4. Deploy if successful
# 5. Rollback if failed
```

### Manual Deployment

1. Go to DigitalOcean App dashboard
2. Click "Actions" → "Force Rebuild and Deploy"
3. Wait for build to complete

### Rollback to Previous Version

1. Go to DigitalOcean App dashboard
2. Go to "Deployments" tab
3. Click "..." on a previous successful deployment
4. Click "Redeploy"

---

## 🐛 Part 6: Troubleshooting

### Problem: Form submits but no email received

**Check 1: SendGrid API Key**
- Go to DigitalOcean → App → Settings → Environment Variables
- Verify `SENDGRID_API_KEY` is set correctly
- Try regenerating the API key in SendGrid if needed

**Check 2: Sender Verification**
- Go to SendGrid → Settings → Sender Authentication
- Ensure your sender email is verified
- Check spam/junk folder

**Check 3: Application Logs**
- Go to DigitalOcean → App → Runtime Logs
- Look for errors like:
  - `SendGrid Error: Unauthorized`
  - `SendGrid Error: Forbidden sender`

**Solution**:
```bash
# Test SendGrid locally first
cd backend
npm install
# Create .env file with your credentials
node -e "
const sgMail = require('@sendgrid/mail');
sgMail.setApiKey('YOUR_API_KEY');
sgMail.send({
  to: 'test@example.com',
  from: 'noreply@oasisinternationalcleaningservices.com',
  subject: 'Test',
  text: 'Test'
}).then(() => console.log('Success!')).catch(e => console.error(e));
"
```

### Problem: CORS error in browser console

**Error message**: `Access to fetch at 'https://quote-api-xxxxx.ondigitalocean.app' from origin 'https://oasis-cleaning-frontend-xxxxx.ondigitalocean.app' has been blocked by CORS policy`

**Solution**:
1. Go to DigitalOcean App dashboard
2. Check `quote-api` environment variables
3. Verify `ALLOWED_ORIGIN` is set to your frontend URL
4. If using multiple domains, use comma-separated list:
   ```
   ALLOWED_ORIGIN=https://domain1.com,https://domain2.com
   ```
5. Redeploy the app

### Problem: Form submission gives 500 error

**Check Application Logs**:
1. Go to DigitalOcean → App → Runtime Logs
2. Look for the error stack trace
3. Common issues:
   - Missing environment variable
   - SendGrid rate limit exceeded
   - Invalid postcode/email format

**Solution**:
- Check all environment variables are set
- Verify SendGrid account is active
- Check SendGrid dashboard for quota limits

### Problem: Honeypot not working (spam getting through)

**Check**:
1. View page source of quote.html
2. Verify honeypot field exists:
   ```html
   <input type="text" name="honeypot" id="honeypot" style="position: absolute; left: -9999px;">
   ```
3. Check backend logs for "Spam detected" messages

**Solution**:
- Ensure honeypot field has `position: absolute; left: -9999px;`
- Check bots aren't executing JavaScript (may need server-side rendering)

### Problem: Slow form submission (>5 seconds)

**Causes**:
- Cold start (first request after inactivity)
- SendGrid API latency
- Database query slow (if added later)

**Solutions**:
1. Upgrade to higher tier instance (less cold starts)
2. Add loading spinner to improve UX
3. Consider async processing with queue

---

## 💰 Part 7: Cost Breakdown

### DigitalOcean App Platform
- **Basic Instance**: ~$5-12/month
- **Bandwidth**: Included (1TB/month)
- **Build Minutes**: Included
- **Total**: ~$12/month

### SendGrid
- **Free Tier**: $0 (100 emails/day = 3,000/month)
- **Essentials**: $19.95/month (50,000 emails)
- **Pro**: $89.95/month (100,000+ emails)
- **Recommended**: Start with free tier

### Domain & DNS (if needed)
- **Domain**: $10-15/year
- **DNS**: Free with DigitalOcean

**Total Monthly Cost**: ~$12-15/month

---

## 🔐 Part 8: Security Best Practices

### Environment Variables
- ✅ Never commit `.env` files to git
- ✅ Use DigitalOcean's encrypted secrets
- ✅ Rotate API keys every 90 days
- ✅ Use different keys for dev/staging/production

### Rate Limiting
- ✅ Currently set to 5 requests per 15 minutes per IP
- Adjust in `backend/server.js` if needed:
  ```javascript
  max: 10,  // Increase limit
  windowMs: 15 * 60 * 1000  // Time window
  ```

### CORS
- ✅ Only allow your domain(s)
- ❌ Never use `*` (allow all) in production

### Spam Protection
- ✅ Honeypot field implemented
- ✅ Server-side validation active
- Consider adding: reCAPTCHA for heavy spam

---

## 📧 Part 9: Email Customization

### Customize Email Template

Edit `backend/server.js`, find the `emailHtml` variable:

```javascript
const emailHtml = `
  <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
    <!-- Add your branding here -->
    <img src="YOUR_LOGO_URL" alt="Oasis Cleaning" style="height: 60px;">
    
    <!-- Rest of template -->
  </div>
`;
```

### Add Auto-Reply to Customer

After `await sgMail.send(msg);`, add:

```javascript
// Send confirmation email to customer
await sgMail.send({
  to: email,
  from: process.env.SENDGRID_FROM_EMAIL,
  subject: 'Quote Request Received - Oasis Cleaning',
  html: `
    <h2>Thank you for your quote request!</h2>
    <p>We've received your request and will respond within 24 hours.</p>
    <p>Reference: ${Date.now()}</p>
  `
});
```

---

## 🎯 Part 10: Next Steps

### Immediate Priorities
1. ✅ Test form submission end-to-end
2. ✅ Monitor first 10 submissions carefully
3. ✅ Add Google Analytics event tracking
4. ✅ Set up email forwarding rules

### Week 2 Enhancements
- [ ] Add Google Analytics/GA4 tracking
- [ ] Implement email auto-reply to customers
- [ ] Add CRM integration (HubSpot, Salesforce)
- [ ] Create admin dashboard to view submissions

### Month 2 Improvements
- [ ] A/B test form variations
- [ ] Add instant price calculator
- [ ] Implement lead scoring
- [ ] Set up automated follow-up emails

---

## 📞 Support Resources

- **DigitalOcean Docs**: https://docs.digitalocean.com/products/app-platform/
- **SendGrid Docs**: https://docs.sendgrid.com/
- **Node.js Docs**: https://nodejs.org/docs/
- **Express.js Docs**: https://expressjs.com/

### Get Help
- DigitalOcean Community: https://www.digitalocean.com/community
- SendGrid Support: https://support.sendgrid.com/

---

## ✨ Congratulations!

Your quote form is now live and capturing leads! 🎉

**What you've accomplished**:
- ✅ Functional backend API with email delivery
- ✅ Spam protection with honeypot
- ✅ CORS security configured
- ✅ Rate limiting to prevent abuse
- ✅ Professional email templates
- ✅ Automated deployment pipeline
- ✅ Production monitoring and logs

**Your website is now making money!** 💰

Every form submission is a potential customer that won't be lost anymore.

---

*Last updated: March 11, 2025*
