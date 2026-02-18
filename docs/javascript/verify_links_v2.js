const fs = require('fs');
const path = require('path');

const docDir = __dirname;
const files = fs.readdirSync(docDir).filter(f => f.endsWith('.md'));

console.log(`Scanning ${files.length} files for broken links...\n`);

let brokenLinks = [];
let checkedLinks = 0;

files.forEach(file => {
    const content = fs.readFileSync(path.join(docDir, file), 'utf-8');
    const regex = /\[.*?\]\((.*?)\)/g;
    let match;

    while ((match = regex.exec(content)) !== null) {
        checkedLinks++;
        let link = match[1];

        // Skip external links
        if (link.startsWith('http') || link.startsWith('https')) continue;
        
        // Skip anchor links (same page)
        if (link.startsWith('#')) continue;

        // Skip mailto
        if (link.startsWith('mailto:')) continue;

        let targetFile = link;
        
        // Handle absolute path from root (/javascript/...)
        if (link.startsWith('/javascript/')) {
            targetFile = link.replace('/javascript/', '');
        } else if (link.startsWith('/')) {
             // Assuming / points to root of docs, but here we are checking relative to javascript/ folder for simplicity 
             // or mapping /filename to filename if it's in the same dir
             targetFile = link.substring(1);
        }

        // Remove anchor tags from target (.md#section)
        const anchorIndex = targetFile.indexOf('#');
        if (anchorIndex !== -1) {
            targetFile = targetFile.substring(0, anchorIndex);
        }

        // Add .md if missing (VitePress usually handles this, but for file existence check we need it)
        // VitePress links often omit extension or use .html
        // We assume source files are .md
        let fsCheckPath = targetFile;
        if (!fsCheckPath.endsWith('.md')) {
             fsCheckPath += '.md';
        }

        const fullPath = path.join(docDir, fsCheckPath);
        
        if (!fs.existsSync(fullPath)) {
             // Try check if it is a directory (VitePress might look for index.md)
             const idxPath = path.join(docDir, targetFile, 'index.md');
             if (!fs.existsSync(idxPath)) {
                 brokenLinks.push({
                     source: file,
                     link: link,
                     resolvedPath: fsCheckPath
                 });
             }
        }
    }
});

if (brokenLinks.length > 0) {
    console.log(`❌ Found ${brokenLinks.length} broken links:`);
    brokenLinks.forEach(b => {
        console.log(`  File: ${b.source}`);
        console.log(`  Link: ${b.link}`);
        console.log(`  Tried: ${b.resolvedPath}`);
        console.log('---');
    });
} else {
    console.log(`✅ All ${checkedLinks} links verified successfully!`);
}
