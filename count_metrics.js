const fs = require('fs');
const path = require('path');

const files = [
    'docs/node/01-01-what-is-node.md',
    'docs/node/01-02-npm-basics.md',
    'docs/node/02-01-commonjs-esm.md',
    'docs/node/02-02-npm-packages.md',
    'docs/node/03-01-filesystem.md',
    'docs/node/03-02-path-streams.md'
];

console.log('File|Lines|Characters');
let totalLines = 0;
let totalChars = 0;

files.forEach(file => {
    try {
        const content = fs.readFileSync(file, 'utf-8');
        const lines = content.split('\n').length;
        const chars = content.length;
        
        console.log(`${path.basename(file)}|${lines}|${chars}`);
        
        totalLines += lines;
        totalChars += chars;
    } catch (err) {
        console.error(`Error reading ${file}: ${err.message}`);
    }
});

const avgLines = Math.round(totalLines / files.length);
const avgChars = Math.round(totalChars / files.length);

console.log('---');
console.log(`Average Lines: ${avgLines}`);
console.log(`Average Characters: ${avgChars}`);
