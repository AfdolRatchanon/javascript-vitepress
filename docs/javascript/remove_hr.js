const fs = require('fs');
const path = require('path');

const dir = __dirname;
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

let modifiedCount = 0;

files.forEach(file => {
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    
    // Pattern: --- followed by newline(s) and then ##
    // We want to remove the --- and just keep the space.
    // Regex: \n---\s*\n+##
    
    const regex = /\n---\s*\n+(## )/g;
    
    if (regex.test(content)) {
        // Replace with just \n\n##
        // We use function to preserve the ## 
        const newContent = content.replace(regex, '\n\n$1');
        
        if (newContent !== content) {
            fs.writeFileSync(filePath, newContent, 'utf-8');
            console.log(`Updated: ${file}`);
            modifiedCount++;
        }
    }
});

console.log(`\n✅ Removed horizontal rules from ${modifiedCount} files.`);
