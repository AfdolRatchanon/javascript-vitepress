@echo off
mkdir archive 2>nul

echo Moving Module 1...
ren "01-01-what-is-node.md" "01-01-node-architecture.md"
ren "01-02-npm-basics.md" "01-02-npm-and-packages.md"

echo Moving Module 2...
ren "02-01-commonjs-esm.md" "02-01-module-systems.md"
move "02-02-npm-packages.md" "archive\02-02-npm-packages.md"
move "02-project-utility-package.md" "archive\02-project-utility-package.md"
move "03-01-filesystem.md" "02-02-file-system.md"
move "03-02-path-streams.md" "02-03-buffers-streams.md"
move "03-project-file-manager.md" "02-project-file-manager.md"

echo Moving Module 3...
move "04-01-http-basics.md" "03-02-native-http-reference.md"

echo Moving Module 4...
move "05-01-express-setup.md" "04-01-express-setup.md"
ren "04-02-basic-routing.md" "04-02-handling-requests.md"
move "04-project-simple-api.md" "04-project-basic-crud.md"

echo Moving Module 5...
move "05-02-middleware.md" "05-01-middleware-concept.md"
move "05-project-rest-api.md" "05-project-refactored-api.md"

echo Moving Module 6...
move "07-01-sql-fundamentals.md" "06-01-sql-fundamentals.md"
move "07-02-node-mysql.md" "06-02-node-mysql.md"
move "07-03-advanced-sql.md" "06-03-advanced-sql.md"
move "07-project-student-db.md" "06-project-inventory-api.md"
move "06-01-rest-api-concepts.md" "archive\06-01-rest-api-concepts.md"
move "06-02-api-design-best-practices.md" "archive\06-02-api-design-best-practices.md"
move "06-project-memory-api.md" "archive\06-project-memory-api.md"

echo Moving Module 7...
move "08-01-nosql-mongodb.md" "07-01-mongodb-basics.md"
move "08-02-mongoose-odm.md" "07-02-mongoose-odm.md"
move "08-project-blog-api.md" "07-project-blog-api.md"
move "08-01-mongodb-basics.md" "archive\08-01-mongodb-basics.md"

echo Moving Module 8...
move "09-01-password-security.md" "08-01-password-hashing.md"
move "09-02-jwt-auth.md" "08-02-jwt-fundamentals.md"
move "09-project-auth-system.md" "08-project-auth-system.md"
move "09-01-auth-jwt.md" "archive\09-01-auth-jwt.md"

echo Moving Module 9...
move "10-01-file-upload.md" "09-01-multer-upload.md"
move "10-project-upload-api.md" "09-project-gallery-api.md"

echo Moving Module 10...
move "10-02-input-validation.md" "10-01-input-validation.md"
move "11-02-security-tools.md" "10-03-security-hardening.md"
move "11-project-secure-api.md" "10-project-secure-api.md"
move "11-01-security-fundamentals.md" "archive\11-01-security-fundamentals.md"
move "11-01-security.md" "archive\11-01-security.md"

echo Moving Module 15...
move "12-01-capstone.md" "15-01-capstone.md"
move "12-project-ecommerce-api.md" "15-project-ecommerce-api.md"

echo Done.
