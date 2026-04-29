const fs = require('fs');

const indexContent = fs.readFileSync('index.html', 'utf8');
const footerRegex = /<div class="footer-links-grid">[\s\S]*?<\/div>\s*<\/div>\s*<div class="footer-bottom/i;
const match = indexContent.match(footerRegex);

if (!match) {
    console.error("Footer not found in index.html");
    process.exit(1);
}

// match[0] contains <div class="footer-links-grid"> ... </div> </div> <div class="footer-bottom
let targetFooter = match[0].replace('</div>\n        <div class="footer-bottom', '</div>');
targetFooter = targetFooter.replace('</div>\n    <div class="footer-bottom', '</div>');
targetFooter = targetFooter.replace(/<div class="footer-bottom$/,'');

const files = fs.readdirSync('.').filter(f => f.endsWith('.html') && f !== 'index.html' && f !== 'admin.html');

for (const file of files) {
    let content = fs.readFileSync(file, 'utf8');
    
    const fileMatch = content.match(/<div class="footer-links-grid">[\s\S]*?<\/div>\s*<\/div>\s*<div class="footer-bottom/i);
    if(fileMatch) {
         content = content.replace(/<div class="footer-links-grid">[\s\S]*?<\/div>\s*<\/div>/i, targetFooter);
         fs.writeFileSync(file, content);
         console.log('Updated ' + file);
    } else {
         console.log('Skipped ' + file + ' (no matching footer pattern)');
    }
}
