const fs = require('fs');
const path = require('path');

const dir = 'docs/node';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));

let hasError = false;

files.forEach(file => {
    const content = fs.readFileSync(path.join(dir, file), 'utf-8');
    const lines = content.split('\n');
    let inCodeBlock = false;
    let detailsOpen = 0;

    lines.forEach((line, index) => {
        const trimmed = line.trim();
        
        // Check Code Blocks
        if (trimmed.startsWith('```')) {
            inCodeBlock = !inCodeBlock;
        }

        // Check Custom Containers (only if not in code block)
        if (!inCodeBlock) {
            if (trimmed.startsWith('::: details')) {
                detailsOpen++;
            } else if (trimmed === ':::') {
                detailsOpen--;
            }
        }
    });

    if (inCodeBlock) {
        console.error(`❌ Error in ${file}: Unclosed code block (\`\`\`)`);
        hasError = true;
    }

    if (detailsOpen !== 0) {
        console.error(`❌ Error in ${file}: Unclosed '::: details' block (Open: ${detailsOpen})`);
        hasError = true;
    }
});

if (!hasError) {
    console.log('✅ No obvious structural errors found in docs/node/*.md');
}
