const fs = require('fs');
const path = require('path');

const dir = __dirname;
console.log(`Scanning directory: ${dir}`);
const files = fs.readdirSync(dir).filter(f => f.endsWith('.md'));
console.log(`Found ${files.length} markdown files.`);

let modifiedCount = 0;

files.forEach((file, index) => {
    // console.log(`Processing ${file} (${index + 1}/${files.length})...`);
    const filePath = path.join(dir, file);
    let content = fs.readFileSync(filePath, 'utf-8');
    const lines = content.split(/\r?\n/);
    let newLines = [];
    
    let inFrontmatter = false;
    let frontmatterDone = false;
    let inCodeBlock = false;
    let removedCount = 0;

    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        const trimmed = line.trim();
        const isHr = /^---$/.test(trimmed); // Strict --- check
        const isCodeFence = trimmed.startsWith('```');

        // 1. Handle Frontmatter (Only at start of file)
        if (i === 0 && isHr) {
            inFrontmatter = true;
            newLines.push(line);
            continue;
        }
        if (inFrontmatter) {
            newLines.push(line);
            if (isHr) {
                inFrontmatter = false;
                frontmatterDone = true;
            }
            continue;
        }

        // 2. Handle Code Blocks
        if (isCodeFence) {
            inCodeBlock = !inCodeBlock;
            newLines.push(line);
            continue;
        }
        if (inCodeBlock) {
            newLines.push(line);
            continue;
        }

        // 3. Handle Tables (Lines with pipes)
        if (line.includes('|')) {
            newLines.push(line);
            continue;
        }

        // 4. Handle Separator HR (The target)
        if (isHr) {
            // Found a loose --- separator. REMOVE IT.
            removedCount++;
            continue;
        }

        newLines.push(line);
    }

    if (removedCount > 0) {
        const newContent = newLines.join('\n');
        // Clean up triple newlines caused by deletion
        // \n\n\n+ -> \n\n
        const cleanedContent = newContent.replace(/\n{3,}/g, '\n\n');
        
        fs.writeFileSync(filePath, cleanedContent, 'utf-8');
        console.log(`Cleaned ${file}: Removed ${removedCount} HRs`);
        modifiedCount++;
    }
});

console.log(`\n✅ Processed all files. Modified ${modifiedCount} files.`);
