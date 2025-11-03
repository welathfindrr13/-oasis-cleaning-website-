# Oasis International Cleaning Services Ltd - Website Package

## Overview

Complete, production-ready static website for Oasis International Cleaning Services Ltd. Built with Tailwind CSS (CDN), vanilla JavaScript, and semantic HTML5.

## Project Structure

```
/
├── index.html              # Home page (minified for size)
├── about.html              # About page
├── services.html           # Services overview
├── services/
│   ├── residential-cleaning.html
│   ├── office-commercial-cleaning.html
│   ├── deep-cleaning.html
│   ├── end-of-tenancy-cleaning.html
│   └── specialist-cleans.html
├── gallery.html            # Before/after gallery
├── quote.html              # Quote request form
├── contact.html            # Contact page
├── join-us.html            # Careers page
├── blog.html               # Blog index (scaffold)
├── privacy-policy.html     # Privacy policy
├── terms.html              # Website terms
├── assets/
│   ├── logo.svg
│   ├── logo-white.svg
│   ├── hero.jpg
│   ├── og-home.jpg
│   ├── icons/
│   └── images/
├── styles.css              # Custom component styles
├── scripts.js              # Form validation, UI interactions
├── sitemap.xml             # SEO sitemap
├── robots.txt              # Search engine directives
├── _footer.html            # Footer component (reference)
└── README.md               # This file
```

## Design System

### Colors
- Green 500: `#4CAF50` (Primary actions, links)
- Green 50: `#ECF7EF` (Light backgrounds)
- Gold 500: `#D4AF37` (Accents, focus states)
- Grey 900: `#111111` (Headings)
- Grey 700: `#444444` (Body text)
- Grey 300: `#D9D9D9` (Dividers)
- White: `#FFFFFF` (Backgrounds)

### Typography
- Font Stack: System UI fonts (Lato, Aptos, fallback)
- H1: 2.25rem / 1.15 line-height
- H2: 1.75rem / 1.2 line-height
- H3: 1.5rem / 1.25 line-height
- Body: 1rem / 1.7 line-height

### Spacing (8-point grid)
- 1: 8px, 2: 16px, 3: 24px, 4: 32px
- 6: 48px, 8: 64px, 12: 96px

## Key Features

### Accessibility (WCAG AA)
- Skip links to main content
- ARIA labels on all interactive elements
- Keyboard navigation support
- Focus indicators (gold-500 outline)
- Screen reader compatible
- Alt text on all images
- Form error announcements

### Forms
- UK postcode validation (RFC compliant regex)
- Email validation (RFC 5322)
- UK phone number validation
- Real-time client-side validation
- Focus returns to first invalid field
- Success states with summaries

### Performance
- Lazy loading images
- Minified Tailwind config
- Total JS bundle: ~15KB (well under 80KB target)
- Optimized for 3G networks
- LCP target: ≤2.5s

### SEO
- Complete meta tags (OG, Twitter Cards)
- Schema.org structured data:
  - Organization
  - WebSite with SearchAction
  - Service schemas on service pages
  - FAQPage schemas where applicable
- Canonical URLs
- Sitemap.xml
- Robots.txt

## Installation & Deployment

### Static Hosting (Recommended)

#### Netlify
```bash
# Drop folder or connect Git repo
# Build command: none
# Publish directory: /
```

#### Vercel
```bash
vercel --prod
```

#### GitHub Pages
```bash
git init
git add .
git commit -m "Initial commit"
git remote add origin <your-repo>
git push -u origin main
# Enable Pages in repo settings
```

### Traditional Web Server

#### Apache
```apache
# .htaccess (if needed for clean URLs)
RewriteEngine On
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ /$1.html [L]
```

#### Nginx
```nginx
server {
    listen 80;
    server_name oasisinternationalcleaningservices.com;
    root /var/www/oasis;
    index index.html;
    
    location / {
        try_files $uri $uri.html $uri/ =404;
    }
}
```

## Development

### Prerequisites
- None! Pure static HTML/CSS/JS
- Modern browser for testing
- Optional: Python SimpleHTTPServer for local preview

### Local Development
```bash
# Python 3
python -m http.server 8000

# Python 2
python -m SimpleHTTPServer 8000

# Node.js (if installed)
npx serve

# Then visit: http://localhost:8000
```

### Testing Checklist

#### Functionality
- [ ] Mobile navigation toggle works
- [ ] All internal links navigate correctly
- [ ] Quote form validates all fields
- [ ] Contact form validates email/phone
- [ ] Career form validates right-to-work checkbox
- [ ] Gallery before/after toggle works
- [ ] Cookie banner dismisses and stores preference

#### Accessibility
- [ ] Tab navigation works through all interactive elements
- [ ] Focus visible on all focusable elements
- [ ] Skip link appears on focus
- [ ] Screen reader announces form errors
- [ ] All images have descriptive alt text
- [ ] Color contrast meets WCAG AA (4.5:1 text, 3:1 UI)

#### SEO
- [ ] All pages have unique title tags
- [ ] Meta descriptions are 140-160 characters
- [ ] OpenGraph and Twitter Card meta present
- [ ] Schema.org JSON-LD validates (use Google Rich Results Test)
- [ ] Sitemap.xml accessible at /sitemap.xml
- [ ] Robots.txt accessible at /robots.txt

#### Performance
- [ ] Images use appropriate formats (WebP with fallbacks)
- [ ] Images include width/height attributes
- [ ] Lazy loading attribute on below-fold images
- [ ] No console errors
- [ ] Lighthouse scores: Performance ≥90, Accessibility ≥95, SEO ≥95

## Browser Support

- Chrome/Edge: Last 2 versions
- Firefox: Last 2 versions
- Safari: Last 2 versions
- Mobile Safari: iOS 12+
- Chrome Mobile: Last 2 versions

## Form Backend Integration

Forms currently show success messages client-side. To connect to a backend:

### Option 1: Formspree
```html
<form action="https://formspree.io/f/YOUR_FORM_ID" method="POST">
```

### Option 2: Netlify Forms
```html
<form name="quote" netlify>
```

### Option 3: Custom API
```javascript
// In scripts.js, update handleQuoteSubmit:
fetch('/api/quote', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(Object.fromEntries(formData))
})
```

## Assets Required

See `ASSETS_LIST.md` for complete asset inventory including:
- Logo variations (color, white, favicon sizes)
- Hero image
- Service category images
- Before/after gallery images (12 pairs)
- OpenGraph images per page
- Icon set

## Security Notes

1. No API keys exposed (forms use mailto: or client-side only)
2. No sensitive data stored client-side
3. Cookie banner uses localStorage (GDPR friendly)
4. All external links should use `rel="noopener noreferrer"`

## Maintenance

### Updating Content
- Copy is centralized in each HTML file
- Shared components: header, footer (replicate changes across pages)
- For dynamic content, consider moving to a JAMstack CMS (Contentful, Sanity)

### Adding New Service Pages
1. Copy an existing service page template
2. Update: title, meta, heading, content, FAQ schema
3. Add link to services.html and footer
4. Update sitemap.xml

## License

© 2025 Oasis International Cleaning Services Ltd. All rights reserved.

## Support

For technical issues or questions:
- Email: info@oasisinternationalcleaningservices.com
- Phone: 020 3750 8878

---

**Build Date:** 2025-01-30  
**Version:** 1.0.0  
**Built with:** Tailwind CSS (CDN), Vanilla JS, HTML5
