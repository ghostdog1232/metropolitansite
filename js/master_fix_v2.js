const fs = require('fs');
const path = require('path');

const directoryPath = 'C:\\Users\\denis\\.gemini\antigravity\\scratch\\METROPOLITAN_AGENCY_FINAL';
const base64Logo = fs.readFileSync(path.join(directoryPath, 'logo_base64.txt'), 'utf8').trim();
const logoSrc = `data:image/png;base64,${base64Logo}`;

const files = fs.readdirSync(directoryPath);

files.forEach(file => {
    if (path.extname(file) === '.html') {
        const filePath = path.join(directoryPath, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // 1. Embed Logo
        content = content.replace(/<img[^>]*src="assets\/logo\.png[^>]*>/g, `<img src="${logoSrc}" alt="Metropolitan Logo" height="50">`);
        content = content.replace(/<img[^>]*src="assets\/footer_logo\.png[^>]*>/g, `<img src="${logoSrc}" alt="Metropolitan Logo" height="50">`);

        // 2. Kill Cache (Rename CSS link)
        content = content.replace(/href="styles\.css[^"]*"/g, 'href="styles.css?v=ULTRA_FINAL_100"');

        fs.writeFileSync(filePath, content);
        console.log(`Master Fixed: ${file}`);
    }
});
