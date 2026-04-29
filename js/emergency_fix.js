const fs = require('fs');
const path = require('path');

const directoryPath = 'C:\\Users\\denis\\.gemini\\antigravity\\scratch\\METROPOLITAN_AGENCY_FINAL';
const files = fs.readdirSync(directoryPath);

const calendlyCode = `
<!-- Calendly badge widget begin -->
<link href="https://assets.calendly.com/assets/external/widget.css" rel="stylesheet">
<script src="https://assets.calendly.com/assets/external/widget.js" type="text/javascript" async></script>
<script type="text/javascript">
    window.onload = function() {
        // Init Badge
        Calendly.initBadgeWidget({
            url: 'https://calendly.com/denis-zhelyazkov2/30min',
            text: 'Запази консултация',
            color: '#224766',
            textColor: '#ffffff',
            branding: true
        });

        // Auto Popup after 30s
        setTimeout(function() {
            if (!sessionStorage.getItem('calendly_popup_shown')) {
                Calendly.initPopupWidget({ url: 'https://calendly.com/denis-zhelyazkov2/30min' });
                sessionStorage.setItem('calendly_popup_shown', 'true');
            }
        }, 30000);
    }
</script>
<!-- Calendly badge widget end -->
`;

files.forEach(file => {
    if (path.extname(file) === '.html') {
        const filePath = path.join(directoryPath, file);
        let content = fs.readFileSync(filePath, 'utf8');

        // 1. Fix Logos (Remove mix-blend-mode and add cache buster)
        content = content.replace(/assets\/logo\.png/g, 'images/logo.png?v=fixed_v3');
        content = content.replace(/assets\/footer_logo\.png/g, 'images/footer_logo.png?v=fixed_v3');
        content = content.replace(/mix-blend-mode:\s*multiply;/g, '');

        // 2. Inject Calendly (Remove old ones first)
        content = content.replace(/<!-- Calendly badge widget begin -->[\s\S]*?<!-- Calendly badge widget end -->/g, '');
        content = content.replace(/<\/body>/, calendlyCode + '\n</body>');

        fs.writeFileSync(filePath, content);
        console.log(`Fixed: ${file}`);
    }
});
