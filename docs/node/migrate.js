
const fs = require('fs');
const path = require('path');

const moves = [
    // Module 1
    { old: '01-01-what-is-node.md', new: '01-01-node-architecture.md' },
    { old: '01-02-npm-basics.md', new: '01-02-npm-and-packages.md' },
    // Module 2
    { old: '02-01-commonjs-esm.md', new: '02-01-module-systems.md' },
    { old: '02-02-npm-packages.md', new: 'archive/02-02-npm-packages.md' },
    { old: '02-project-utility-package.md', new: 'archive/02-project-utility-package.md' },
    { old: '03-01-filesystem.md', new: '02-02-file-system.md' },
    { old: '03-02-path-streams.md', new: '02-03-buffers-streams.md' },
    { old: '03-project-file-manager.md', new: '02-project-file-manager.md' },
    // Module 3
    { old: '04-01-http-basics.md', new: '03-02-native-http-reference.md' },
    // Module 4
    { old: '05-01-express-setup.md', new: '04-01-express-setup.md' },
    { old: '04-02-basic-routing.md', new: '04-02-handling-requests.md' },
    { old: '04-project-simple-api.md', new: '04-project-basic-crud.md' },
    // Module 5
    { old: '05-02-middleware.md', new: '05-01-middleware-concept.md' },
    { old: '05-project-rest-api.md', new: '05-project-refactored-api.md' },
    // Module 6
    { old: '07-01-sql-fundamentals.md', new: '06-01-sql-fundamentals.md' },
    { old: '07-02-node-mysql.md', new: '06-02-node-mysql.md' },
    { old: '07-03-advanced-sql.md', new: '06-03-advanced-sql.md' },
    { old: '07-project-student-db.md', new: '06-project-inventory-api.md' },
    { old: '06-01-rest-api-concepts.md', new: 'archive/06-01-rest-api-concepts.md' },
    { old: '06-02-api-design-best-practices.md', new: 'archive/06-02-api-design-best-practices.md' },
    { old: '06-project-memory-api.md', new: 'archive/06-project-memory-api.md' },
    // Module 7
    { old: '08-01-nosql-mongodb.md', new: '07-01-mongodb-basics.md' },
    { old: '08-02-mongoose-odm.md', new: '07-02-mongoose-odm.md' },
    { old: '08-project-blog-api.md', new: '07-project-blog-api.md' },
    { old: '08-01-mongodb-basics.md', new: 'archive/08-01-mongodb-basics.md' },
    // Module 8
    { old: '09-01-password-security.md', new: '08-01-password-hashing.md' },
    { old: '09-02-jwt-auth.md', new: '08-02-jwt-fundamentals.md' },
    { old: '09-project-auth-system.md', new: '08-project-auth-system.md' },
    { old: '09-01-auth-jwt.md', new: 'archive/09-01-auth-jwt.md' },
    // Module 9
    { old: '10-01-file-upload.md', new: '09-01-multer-upload.md' },
    { old: '10-project-upload-api.md', new: '09-project-gallery-api.md' },
    // Module 10
    { old: '10-02-input-validation.md', new: '10-01-input-validation.md' },
    { old: '11-02-security-tools.md', new: '10-03-security-hardening.md' },
    { old: '11-project-secure-api.md', new: '10-project-secure-api.md' },
    { old: '11-01-security-fundamentals.md', new: 'archive/11-01-security-fundamentals.md' },
    { old: '11-01-security.md', new: 'archive/11-01-security.md' },
    // Module 15
    { old: '12-01-capstone.md', new: '15-01-capstone.md' },
    { old: '12-project-ecommerce-api.md', new: '15-project-ecommerce-api.md' }
];

if (!fs.existsSync('archive')) {
    try {
        fs.mkdirSync('archive');
    } catch (e) { console.log('Failed to create archive dir', e); }
}

moves.forEach(m => {
    if (fs.existsSync(m.old)) {
        try {
            // 1. Copy
            fs.copyFileSync(m.old, m.new);
            console.log(`Copied: ${m.old} -> ${m.new}`);
            
            // 2. Deprecate Old
            const deprecationText = `# MOVED\n\nThis content has been moved to [${m.new}](./${path.basename(m.new)}).`;
            fs.writeFileSync(m.old, deprecationText);
            console.log(`Depreated: ${m.old}`);
            
        } catch (err) {
            console.error(`Error processing ${m.old}: ${err.message}`);
        }
    } else {
        console.log(`Skipped (not found): ${m.old}`);
    }
});
