#!/usr/bin/env node
/**
 * Internal Link Checker for Oasis International Cleaning Services
 * Validates that all internal href/src links in HTML files resolve to existing files.
 * Ignores: external http(s), mailto, tel links
 */

const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '../..');
const HTML_EXTENSIONS = ['.html'];

// Collect all HTML files
function getHtmlFiles(dir, files = []) {
  const items = fs.readdirSync(dir);
  for (const item of items) {
    const fullPath = path.join(dir, item);
    const stat = fs.statSync(fullPath);
    if (stat.isDirectory()) {
      // Skip node_modules, .git, _audit, backend
      if (!['node_modules', '.git', '_audit', 'backend', '.do'].includes(item)) {
        getHtmlFiles(fullPath, files);
      }
    } else if (HTML_EXTENSIONS.includes(path.extname(item).toLowerCase())) {
      files.push(fullPath);
    }
  }
  return files;
}

// Extract links from HTML content
function extractLinks(content) {
  const links = [];
  
  // Match href="..." and src="..."
  const hrefRegex = /(?:href|src)=["']([^"']+)["']/gi;
  let match;
  
  while ((match = hrefRegex.exec(content)) !== null) {
    links.push(match[1]);
  }
  
  return links;
}

// Check if link is internal and should be validated
function isInternalLink(link) {
  // Skip external links
  if (link.startsWith('http://') || link.startsWith('https://')) return false;
  // Skip mailto and tel
  if (link.startsWith('mailto:') || link.startsWith('tel:')) return false;
  // Skip javascript
  if (link.startsWith('javascript:')) return false;
  // Skip anchors only
  if (link.startsWith('#')) return false;
  // Skip data URIs
  if (link.startsWith('data:')) return false;
  
  return true;
}

// Resolve link to file path
function resolveLink(link, sourceFile) {
  // Remove query string and hash
  let cleanLink = link.split('?')[0].split('#')[0];
  
  // Handle root-relative links
  if (cleanLink.startsWith('/')) {
    return path.join(ROOT_DIR, cleanLink);
  }
  
  // Handle relative links
  const sourceDir = path.dirname(sourceFile);
  return path.resolve(sourceDir, cleanLink);
}

// Main check function
function checkLinks() {
  const htmlFiles = getHtmlFiles(ROOT_DIR);
  const results = {
    totalFiles: htmlFiles.length,
    totalLinks: 0,
    brokenLinks: [],
    validLinks: 0
  };
  
  console.log('Internal Link Check Report');
  console.log('==========================');
  console.log(`Date: ${new Date().toISOString()}`);
  console.log(`Root: ${ROOT_DIR}`);
  console.log(`HTML files found: ${htmlFiles.length}`);
  console.log('');
  
  for (const file of htmlFiles) {
    const relativePath = path.relative(ROOT_DIR, file);
    const content = fs.readFileSync(file, 'utf8');
    const links = extractLinks(content);
    
    for (const link of links) {
      if (!isInternalLink(link)) continue;
      
      results.totalLinks++;
      const resolvedPath = resolveLink(link, file);
      
      if (!fs.existsSync(resolvedPath)) {
        results.brokenLinks.push({
          source: relativePath,
          link: link,
          resolved: path.relative(ROOT_DIR, resolvedPath)
        });
      } else {
        results.validLinks++;
      }
    }
  }
  
  console.log('RESULTS');
  console.log('-------');
  console.log(`Total internal links checked: ${results.totalLinks}`);
  console.log(`Valid links: ${results.validLinks}`);
  console.log(`Broken links: ${results.brokenLinks.length}`);
  console.log('');
  
  if (results.brokenLinks.length > 0) {
    console.log('BROKEN LINKS:');
    console.log('');
    for (const broken of results.brokenLinks) {
      console.log(`  Source: ${broken.source}`);
      console.log(`  Link: ${broken.link}`);
      console.log(`  Resolved to: ${broken.resolved}`);
      console.log('');
    }
  } else {
    console.log('No broken internal links found.');
  }
  
  return results;
}

// Run
checkLinks();
