# Assets List - Oasis International Cleaning Services

## Required Assets Inventory

### Logo Files
- **logo.svg** - Full color logo (primary, 200x60px recommended)
- **logo-white.svg** - White version for dark backgrounds (footer)
- **favicon.ico** - 32x32px, 16x16px sizes
- **favicon-192.png** - Android Chrome icon
- **favicon-512.png** - Android Chrome icon (large)
- **apple-touch-icon.png** - 180x180px iOS icon

### Hero Images
- **hero.jpg** - Homepage hero (1920x1080px, bright interior, center-weighted composition)
  - Alt: "Bright, clean modern interior"
  - Format: WebP with JPG fallback
  - Optimize: 80% quality, max 300KB

### Service Category Icons (Line SVG, gold stroke #D4AF37)
All located in `assets/icons/`:
- **home.svg** - Residential cleaning icon
- **office.svg** - Office/commercial icon  
- **sparkles.svg** - Deep cleaning icon
- **key.svg** - End of tenancy icon
- **shield.svg** - Specialist cleans icon

### Gallery Images (Before & After Pairs)
All located in `assets/images/gallery/`:

**Format:** JPG or WebP, 800x600px, optimized

1. **kitchen-worktop-before.jpg** / **kitchen-worktop-after.jpg**
   - Alt: "Kitchen worktop before deep clean – limescale visible" / "after deep clean – surfaces polished"

2. **bathroom-tap-before.jpg** / **bathroom-tap-after.jpg**
   - Alt: "Bathroom tap before limescale removal – dull finish" / "after – chrome reflective"

3. **hob-before.jpg** / **hob-after.jpg**
   - Alt: "Kitchen hob before degrease – grease residue" / "after – no residue visible"

4. **office-desk-before.jpg** / **office-desk-after.jpg**
   - Alt: "Office reception desk before clean" / "after – high-touch surfaces sanitised"

5. **handrail-before.jpg** / **handrail-after.jpg**
   - Alt: "Stair handrail before sanitise – dust visible" / "after – wood grain visible"

6. **skirting-before.jpg** / **skirting-after.jpg**
   - Alt: "Skirting boards before dusting" / "after – floor edge detailed"

7. **fridge-before.jpg** / **fridge-after.jpg**
   - Alt: "Fridge interior before clean" / "after – shelves clear"

8. **window-before.jpg** / **window-after.jpg**
   - Alt: "Internal window glass before clean – smudges" / "after – smudge-free"

9. **extractor-before.jpg** / **extractor-after.jpg**
   - Alt: "Extractor surround before detail" / "after – grease removed"

10. **entrance-mat-before.jpg** / **entrance-mat-after.jpg**
    - Alt: "Entrance mat before vacuum – debris visible" / "after – debris removed"

11. **meeting-room-before.jpg** / **meeting-room-after.jpg**
    - Alt: "Meeting room table before wipe" / "after – cable ports dust-free"

12. **tiles-before.jpg** / **tiles-after.jpg**
    - Alt: "Bathroom tiles before clean – grout stained" / "after – grout brightened"

### OpenGraph Images (for social sharing)
All 1200x630px, JPG format, <300KB:
- **og-home.jpg** - Homepage share image
- **og-about.jpg** - About page
- **og-services.jpg** - Services overview
- **og-residential.jpg** - Residential service
- **og-office.jpg** - Office service
- **og-deep.jpg** - Deep cleaning
- **og-tenancy.jpg** - End of tenancy
- **og-specialist.jpg** - Specialist cleans
- **og-gallery.jpg** - Gallery page
- **og-contact.jpg** - Contact page

### Service Page Images (Optional but recommended)
All located in `assets/images/services/`, 1200x800px:
- **residential-hero.jpg** - Clean modern home interior
- **office-hero.jpg** - Professional office space
- **deep-cleaning-hero.jpg** - Detailed cleaning in progress
- **tenancy-hero.jpg** - Empty property interior
- **specialist-hero.jpg** - Medical/clinical space or construction site

### Placeholder Content
If real assets unavailable, use:
- **placeholder.com** for temporary images
- **via.placeholder.com/1920x1080/4CAF50/FFFFFF?text=Hero+Image**
- Logo: Text-based SVG with company name

## Image Optimization Guidelines

### Formats
- **Photos:** WebP with JPG fallback
- **Logos/Icons:** SVG (vector)
- **Fallback:** JPG for compatibility

### Compression
- JPG: 80-85% quality
- WebP: 75-80% quality
- PNG: Use TinyPNG or similar
- Max file sizes:
  - Hero: 300KB
  - Gallery: 150KB per image
  - Icons: 10KB
  - OG images: 300KB

### Responsive Images
Use srcset for different screen sizes:
```html
<img 
  src="hero.jpg" 
  srcset="hero-480.jpg 480w, hero-800.jpg 800w, hero-1200.jpg 1200w, hero-1920.jpg 1920w"
  sizes="100vw"
  alt="Description"
  width="1920"
  height="1080"
  loading="lazy">
```

### Naming Conventions
- Lowercase, hyphen-separated
- Descriptive: `bathroom-tap-after.jpg` not `img001.jpg`
- Include size suffix if multiple: `logo-192.png`, `logo-512.png`

## Icon Attribution
If using third-party icon sets:
- **Heroicons** (MIT): https://heroicons.com/
- **Lucide** (ISC): https://lucide.dev/
- **Phosphor** (MIT): https://phosphoricons.com/

Credit in footer or humans.txt if required by license.

## Asset Checklist

### Critical (Launch Blockers)
- [ ] logo.svg
- [ ] logo-white.svg
- [ ] favicon.ico
- [ ] hero.jpg
- [ ] 5× service icons

### High Priority
- [ ] 12× gallery image pairs (24 total)
- [ ] All OG images (10 total)
- [ ] Mobile app icons (3 sizes)

### Nice to Have
- [ ] Service page hero images (5)
- [ ] Blog post featured images
- [ ] Team photos (if adding team section)

## Delivery Format
Provide assets in organized ZIP:
```
oasis-assets.zip
├── logos/
├── icons/
├── images/
│   ├── gallery/
│   ├── services/
│   └── og/
└── favicons/
```

## Notes
- All images should be rights-cleared (owned or licensed)
- Avoid stock photos with watermarks
- Prefer authentic photos of actual cleaning work
- Maintain consistent lighting/color grading across gallery images
- Test all images on retina displays for clarity
