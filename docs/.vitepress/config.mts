import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'

export default defineConfig({
    title: "JavaScript Zero to Hero",
    description: "A comprehensive, bilingual JavaScript course from zero to hero.",
    lang: 'th-TH',
    cleanUrls: true,
    ignoreDeadLinks: true,
    base: '/javascript-vitepress/',
    markdown: {
        config: (md) => {
            md.use(mathjax3)
        }
    },
    themeConfig: {
        nav: [
            { text: 'หน้าแรก (Home)', link: '/' },
            { text: '📘 JavaScript', link: '/javascript/' },
            { text: '📗 Node.js', link: '/node/' },
            { text: '⚛️ React.js', link: '/react/' },
        ],

        sidebar: {
            '/javascript/': [
                {
                    text: 'Module 0: Preparation',
                    items: [
                        { text: '00 - Setup Environment', link: '/javascript/00-setup' }
                    ]
                },
                {
                    text: 'Module 1: Introduction',
                    items: [
                        { text: '1.1 - History & Standards', link: '/javascript/01-01-history' },
                        { text: '1.2 - Hello World & Console', link: '/javascript/01-02-hello-world' },
                        { text: '1.3 - Syntax Basics', link: '/javascript/01-03-syntax-basics' },
                        { text: '🎨 Project 1: Console Artist', link: '/javascript/01-project-artist' },
                        { text: '📜 Project 2: My Biography', link: '/javascript/01-project-bio' }
                    ]
                },
                {
                    text: 'Module 2: Variables & Memory',
                    items: [
                        { text: '2.1 - Variables Deep Dive', link: '/javascript/02-01-variables' },
                        { text: '2.2 - Data Types', link: '/javascript/02-02-data-types' },
                        { text: '2.3 - Operators', link: '/javascript/02-03-operators' },
                        { text: '2.4 - Type Conversion', link: '/javascript/02-04-type-conversion' },
                        { text: '2.5 - Memory & References', link: '/javascript/02-05-memory-management' },
                        { text: '⚖️ Project 3: BMI Calculator', link: '/javascript/02-project-bmi' }
                    ]
                },
                {
                    text: 'Module 3: Control Flow',
                    items: [
                        { text: '3.1 - Conditionals', link: '/javascript/03-01-conditionals' },
                        { text: '3.2 - Loops', link: '/javascript/03-02-loops' },
                        { text: '🐝 Project 4: FizzBuzz', link: '/javascript/03-project-fizzbuzz' }
                    ]
                },
                {
                    text: 'Module 4: Functions & Context',
                    items: [
                        { text: '4.1 - Functions Basics', link: '/javascript/04-01-functions' },
                        { text: '4.2 - Data Flow & Params', link: '/javascript/04-02-data-flow' },
                        { text: '4.3 - Scope & Closures', link: '/javascript/04-03-scope-closures' },
                        { text: '4.4 - Function Context (this)', link: '/javascript/04-04-function-context' },
                        { text: '🧮 Project 5: Calculator', link: '/javascript/04-project-calculator' }
                    ]
                },
                {
                    text: 'Module 5: Data Structures',
                    items: [
                        { text: '5.1 - Arrays', link: '/javascript/05-01-arrays' },
                        { text: '5.2 - Array Iteration', link: '/javascript/05-02-array-iteration' },
                        { text: '5.3 - Objects', link: '/javascript/05-03-objects' },
                        { text: '5.4 - Maps & Sets', link: '/javascript/05-04-maps-sets' },
                        { text: '5.5 - Strings, Math, Date', link: '/javascript/05-05-strings-math-dates' },
                        { text: '5.6 - Regex', link: '/javascript/05-06-regex' },
                        { text: '5.7 - JSON', link: '/javascript/05-07-json-fundamentals' },
                        { text: '5.8 - Typed Arrays', link: '/javascript/05-08-typed-arrays' },
                        { text: '🧹 Project 6: Data Cleanser', link: '/javascript/05-project-data-cleanser' },
                        { text: '⌨️ Project 7: Typing Logic', link: '/javascript/05-project-typing-logic' }
                    ]
                },
                {
                    text: 'Module 6: Async JavaScript',
                    items: [
                        { text: '6.1 - Event Loop', link: '/javascript/06-01-event-loop' },
                        { text: '6.2 - Promises', link: '/javascript/06-02-promises' },
                        { text: '6.3 - Async/Await', link: '/javascript/06-03-async-await' },
                        { text: '🌤️ Project 8: Async Fetcher', link: '/javascript/06-project-data-fetcher' }
                    ]
                },
                {
                    text: 'Module 7: ES6+ & Advanced Control',
                    items: [
                        { text: '7.1 - Destructuring', link: '/javascript/07-01-destructuring' },
                        { text: '7.2 - Spread & Rest', link: '/javascript/07-02-spread-rest' },
                        { text: '7.3 - Iterators & Generators', link: '/javascript/07-03-iterators-generators' },
                        { text: '👨‍🎓 Project 9: Data Transformer', link: '/javascript/07-project-data-transformer' }
                    ]
                },
                {
                    text: 'Module 8: OOP & Metaprogramming',
                    items: [
                        { text: '8.1 - Prototypes', link: '/javascript/08-01-prototypes' },
                        { text: '8.2 - Classes', link: '/javascript/08-02-classes' },
                        { text: '8.3 - Inheritance', link: '/javascript/08-03-inheritance' },
                        { text: '8.4 - Metaprogramming', link: '/javascript/08-04-metaprogramming' },
                        { text: '8.5 - Event Emitters', link: '/javascript/08-05-event-emitter' },
                        { text: '🛡️ Project 10: Reactive Proxy', link: '/javascript/08-project-reactive-proxy' },
                        { text: '⚔️ Project 11: RPG Logic', link: '/javascript/08-project-rpg-logic' }
                    ]
                },
                {
                    text: 'Module 9: Error Handling & Debugging',
                    items: [
                        { text: '9.1 - Error Handling', link: '/javascript/09-01-error-handling' },
                        { text: '9.2 - Debugging', link: '/javascript/09-02-debugging' },
                        { text: '📋 Project 12: Validator', link: '/javascript/09-project-validator' }
                    ]
                },
                {
                    text: 'Module 10: Modules System',
                    items: [
                        { text: '10.1 - ES Modules', link: '/javascript/10-01-es-modules' }
                    ]
                },
                {
                    text: 'Module 11: DOM Manipulation',
                    items: [
                        { text: '11.1 - DOM Basics', link: '/javascript/11-01-dom-basics' },
                        { text: '11.2 - DOM Events', link: '/javascript/11-02-dom-events' },
                        { text: '11.3 - DOM Mutations', link: '/javascript/11-03-dom-mutations' },
                        { text: '🎴 Project 13: Interactive UI', link: '/javascript/11-project-interactive-ui' }
                    ]
                },
                {
                    text: 'Module 12: Web Storage & APIs',
                    items: [
                        { text: '12.1 - Browser Storage', link: '/javascript/12-01-browser-storage' },
                        { text: '12.2 - Browser APIs', link: '/javascript/12-02-browser-apis' },
                        { text: '🏆 Capstone: Task Manager', link: '/javascript/12-capstone-project' }
                    ]
                }
            ],
            '/node/': [
                {
                    text: '📗 Node.js Backend',
                    items: [
                        { text: '🏠 หน้าแรก Node.js', link: '/node/' }
                    ]
                },
                {
                    text: 'Module 1: Node.js Basics & Environment',
                    items: [
                        { text: '1.1 - Node.js Architecture', link: '/node/01-01-node-architecture' },
                        { text: '1.2 - npm & Packages', link: '/node/01-02-npm-and-packages' },
                        { text: '🎯 Project: CLI Tool', link: '/node/01-project-cli-tool' }
                    ]
                },
                {
                    text: 'Module 2: Module Systems & Core APIs',
                    items: [
                        { text: '2.1 - Module Systems', link: '/node/02-01-module-systems' },
                        { text: '2.2 - File System', link: '/node/02-02-file-system' },
                        { text: '2.3 - Buffers & Streams', link: '/node/02-03-buffers-streams' },
                        { text: '📁 Project: Stream File Manager', link: '/node/02-project-file-manager' }
                    ]
                },
                {
                    text: 'Module 3: Native HTTP & API Tools 🔍',
                    items: [
                        { text: '3.1 - API Testing Tools', link: '/node/03-01-api-testing-tools' },
                        { text: '3.2 - Native HTTP Reference', link: '/node/03-02-native-http-reference' }
                    ]
                },
                {
                    text: 'Module 4: Express.js Fundamentals',
                    items: [
                        { text: '4.1 - Express Setup', link: '/node/04-01-express-setup' },
                        { text: '4.2 - Handling Requests', link: '/node/04-02-handling-requests' },
                        { text: '4.3 - Environment Variables', link: '/node/04-03-environment-variables' },
                        { text: '🛣️ Project: Basic CRUD', link: '/node/04-project-basic-crud' }
                    ]
                },
                {
                    text: 'Module 5: Middleware & Clean Architecture',
                    items: [
                        { text: '5.1 - Middleware Concept', link: '/node/05-01-middleware-concept' },
                        { text: '5.2 - Layered Architecture', link: '/node/05-02-layered-architecture' },
                        { text: '🏗️ Project: Refactored API', link: '/node/05-project-refactored-api' }
                    ]
                },
                {
                    text: 'Module 6: Relational Database (MySQL)',
                    items: [
                        { text: '6.1 - SQL Fundamentals', link: '/node/06-01-sql-fundamentals' },
                        { text: '6.2 - Node.js + MySQL', link: '/node/06-02-node-mysql' },
                        { text: '6.3 - Advanced SQL', link: '/node/06-03-advanced-sql' },
                        { text: '🗃️ Project: Inventory API', link: '/node/06-project-inventory-api' }
                    ]
                },
                {
                    text: 'Module 7: NoSQL Database (MongoDB)',
                    items: [
                        { text: '7.1 - MongoDB Basics', link: '/node/07-01-mongodb-basics' },
                        { text: '7.2 - Mongoose ODM', link: '/node/07-02-mongoose-odm' },
                        { text: '7.3 - Mongoose Relations', link: '/node/07-03-mongoose-relations' },
                        { text: '🍃 Project: Blog API', link: '/node/07-project-blog-api' }
                    ]
                },
                {
                    text: 'Module 8: Authentication & Authorization',
                    items: [
                        { text: '8.1 - Password Hashing', link: '/node/08-01-password-hashing' },
                        { text: '8.2 - JWT Fundamentals', link: '/node/08-02-jwt-fundamentals' },
                        { text: '8.3 - Auth Middleware', link: '/node/08-03-auth-middleware' },
                        { text: '🔐 Project: Auth System', link: '/node/08-project-auth-system' }
                    ]
                },
                {
                    text: 'Module 9: File Upload & Cloud Storage',
                    items: [
                        { text: '9.1 - Multer Upload', link: '/node/09-01-multer-upload' },
                        { text: '9.2 - Cloud Storage', link: '/node/09-02-cloud-storage' },
                        { text: '📤 Project: Gallery API', link: '/node/09-project-gallery-api' }
                    ]
                },
                {
                    text: 'Module 10: Validation, Errors & Security',
                    items: [
                        { text: '10.1 - Input Validation', link: '/node/10-01-input-validation' },
                        { text: '10.2 - Centralized Errors', link: '/node/10-02-centralized-errors' },
                        { text: '10.3 - Security Hardening', link: '/node/10-03-security-hardening' },
                        { text: '🛡️ Project: Secure API', link: '/node/10-project-secure-api' }
                    ]
                },
                {
                    text: 'Module 11: Caching & Performance',
                    items: [
                        { text: '11.1 - Caching Concepts', link: '/node/11-01-caching-concepts' },
                        { text: '11.2 - Redis Integration', link: '/node/11-02-redis-integration' },
                        { text: '🚀 Project: Fast API', link: '/node/11-project-fast-api' }
                    ]
                },
                {
                    text: 'Module 12: Real-time Communication',
                    items: [
                        { text: '12.1 - WebSockets Intro', link: '/node/12-01-websockets-intro' },
                        { text: '12.2 - Socket.io', link: '/node/12-02-socket-io' },
                        { text: '💬 Project: Chat API', link: '/node/12-project-chat-api' }
                    ]
                },
                {
                    text: 'Module 13: Automated Testing',
                    items: [
                        { text: '13.1 - Unit Testing (Jest)', link: '/node/13-01-unit-testing-jest' },
                        { text: '13.2 - API Testing (Supertest)', link: '/node/13-02-api-testing-supertest' },
                        { text: '🧪 Project: Tested API', link: '/node/13-project-tested-api' }
                    ]
                },
                {
                    text: 'Module 14: Containerization & Deployment',
                    items: [
                        { text: '14.1 - Process Managers', link: '/node/14-01-process-managers' },
                        { text: '14.2 - Docker Basics', link: '/node/14-02-docker-basics' },
                        { text: '🚢 Project: Deployment', link: '/node/14-project-deployment' }
                    ]
                },
                {
                    text: 'Module 15: Capstone Project',
                    items: [
                        { text: '15.1 - Capstone Overview', link: '/node/15-01-capstone' },
                        { text: '🏆 Project: E-Commerce API', link: '/node/15-project-ecommerce-api' }
                    ]
                }
            ],
            '/react/': [
                {
                    text: '⚛️ React.js Frontend',
                    items: [
                        { text: '🏠 หน้าแรก React.js', link: '/react/' }
                    ]
                },
                {
                    text: 'Module 1: Introduction',
                    items: [
                        { text: '1.1 - Intro to React & JSX', link: '/react/01-01-intro-jsx' },
                        { text: '🎨 Project: JSX Art Gallery', link: '/react/01-project-jsx-art' }
                    ]
                },
                {
                    text: 'Module 2: Components & Props',
                    items: [
                        { text: '2.1 - Components & Props', link: '/react/02-01-components-props' },
                        { text: '👤 Project: User Profile Card', link: '/react/02-project-user-profile' }
                    ]
                },
                {
                    text: 'Module 3: State & Events',
                    items: [
                        { text: '3.1 - State & Events', link: '/react/03-01-state-events' },
                        { text: '🔢 Project: Counter & Toggler', link: '/react/03-project-counter-toggler' }
                    ]
                },
                {
                    text: 'Module 4: Lists & Keys',
                    items: [
                        { text: '4.1 - Lists & Keys', link: '/react/04-01-lists-keys' },
                        { text: '📝 Project: Simple Todo List', link: '/react/04-project-simple-todo' }
                    ]
                },
                {
                    text: 'Module 5: Forms',
                    items: [
                        { text: '5.1 - Forms & Controlled Components', link: '/react/05-01-forms' },
                        { text: '📋 Project: Registration Form', link: '/react/05-project-registration-form' }
                    ]
                },
                {
                    text: 'Module 6: Effects & Lifecycle',
                    items: [
                        { text: '6.1 - Effects & Lifecycle', link: '/react/06-01-effects-lifecycle' },
                        { text: '⏱️ Project: Digital Clock', link: '/react/06-project-digital-clock' }
                    ]
                },
                {
                    text: 'Module 7: API Integration',
                    items: [
                        { text: '7.1 - API Integration', link: '/react/07-01-api-integration' },
                        { text: '📉 Project: Crypto Price Tracker', link: '/react/07-project-crypto-tracker' }
                    ]
                },
                {
                    text: 'Module 8: Context API',
                    items: [
                        { text: '8.1 - Context API', link: '/react/08-01-context-api' },
                        { text: '🌗 Project: Theme Switcher', link: '/react/08-project-theme-context' }
                    ]
                },
                {
                    text: 'Module 9: React Router',
                    items: [
                        { text: '9.1 - React Router', link: '/react/09-01-react-router' },
                        { text: '🌏 Project: Multi-page Portfolio', link: '/react/09-project-portfolio' }
                    ]
                },
                {
                    text: 'Module 10: Deployment',
                    items: [
                        { text: '10.1 - Deployment Guide', link: '/react/10-01-deployment' },
                        { text: '🚀 Project: Hosting on Vercel', link: '/react/10-project-hosting' }
                    ]
                },
                {
                    text: 'Module 11: Optimization',
                    items: [
                        { text: '11.1 - Performance Optimization', link: '/react/11-01-performance' },
                        { text: '⚡ Project: Optimization Challenge', link: '/react/11-project-optimization' }
                    ]
                },
                {
                    text: 'Module 12: Capstone Project',
                    items: [
                        { text: '12.1 - Capstone Overview', link: '/react/12-01-capstone' },
                        { text: '🛍️ Project: E-Commerce Shop', link: '/react/12-project-ecommerce' }
                    ]
                }
            ]
        },

        socialLinks: [
            { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
        ],

        footer: {
            // message: 'Released under the MIT License.',
            copyright: 'Copyright © 2025-present JavaScript Zero to Hero'
        }
    }
})
