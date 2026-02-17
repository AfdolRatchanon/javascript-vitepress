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
                    text: 'Module 2: Variables & Types',
                    items: [
                        { text: '2.1 - Variables Deep Dive', link: '/javascript/02-01-variables' },
                        { text: '2.2 - Data Types & Memory', link: '/javascript/02-02-data-types' },
                        { text: '2.3 - Type Conversion', link: '/javascript/02-03-type-conversion' },
                        { text: '2.4 - Operators (Math & Logic)', link: '/javascript/02-04-operators' },
                        { text: '⚖️ Project 3: BMI Calculator', link: '/javascript/02-project-bmi' }
                    ]
                },
                {
                    text: 'Module 3: Control Flow',
                    items: [
                        { text: '3.1 - Conditionals (Logic)', link: '/javascript/03-01-conditionals' },
                        { text: '3.2 - Loops (Repetition)', link: '/javascript/03-02-loops' },
                        { text: '🐝 Project 4: FizzBuzz', link: '/javascript/03-project-fizzbuzz' }
                    ]
                },
                {
                    text: 'Module 4: Functions & Scope',
                    items: [
                        { text: '4.1 - Functions Basics', link: '/javascript/04-01-functions' },
                        { text: '4.2 - Data Flow & Params', link: '/javascript/04-02-data-flow' },
                        { text: '4.3 - Scope & Closures', link: '/javascript/04-03-scope-closures' },
                        { text: '🧮 Project 5: Calculator', link: '/javascript/04-project-calculator' }
                    ]
                },
                {
                    text: 'Module 5: Arrays & Objects',
                    items: [
                        { text: '5.1 - Arrays (Lists)', link: '/javascript/05-01-arrays' },
                        { text: '5.2 - Objects (Key-Value)', link: '/javascript/05-02-objects' },
                        { text: '5.3 - Reference vs Value', link: '/javascript/05-03-reference-vs-value' },
                        { text: '✅ Project 6: Todo List', link: '/javascript/05-project-todo' }
                    ]
                },
                {
                    text: 'Module 6: DOM Manipulation',
                    items: [
                        { text: '6.1 - DOM Basics', link: '/javascript/06-01-dom-basics' },
                        { text: '6.2 - DOM Events', link: '/javascript/06-02-dom-events' },
                        { text: '6.3 - DOM Manipulation', link: '/javascript/06-03-dom-manipulation' },
                        { text: '🎴 Project 7: Interactive Card', link: '/javascript/06-project-interactive-card' }
                    ]
                },
                {
                    text: 'Module 7: Async JavaScript',
                    items: [
                        { text: '7.1 - Async Concepts', link: '/javascript/07-01-async-concepts' },
                        { text: '7.2 - Promises', link: '/javascript/07-02-promises' },
                        { text: '7.3 - Async/Await & Fetch', link: '/javascript/07-03-async-await' },
                        { text: '🌤️ Project 8: Weather App', link: '/javascript/07-project-weather-app' }
                    ]
                },
                {
                    text: 'Module 8: ES6+ Modern Features',
                    items: [
                        { text: '8.1 - Destructuring', link: '/javascript/08-01-destructuring' },
                        { text: '8.2 - Spread & Rest', link: '/javascript/08-02-spread-rest' },
                        { text: '8.3 - Modules (import/export)', link: '/javascript/08-03-modules' },
                        { text: '👨‍🎓 Project 9: Student Manager', link: '/javascript/08-project-student-manager' }
                    ]
                },
                {
                    text: 'Module 9: OOP',
                    items: [
                        { text: '9.1 - Classes', link: '/javascript/09-01-classes' },
                        { text: '9.2 - Inheritance', link: '/javascript/09-02-inheritance' },
                        { text: '9.3 - Prototypes', link: '/javascript/09-03-prototypes' },
                        { text: '⚔️ Project 10: RPG Game', link: '/javascript/09-project-rpg-game' }
                    ]
                },
                {
                    text: 'Module 10: Error Handling & Debugging',
                    items: [
                        { text: '10.1 - Error Handling', link: '/javascript/10-01-error-handling' },
                        { text: '10.2 - Debugging', link: '/javascript/10-02-debugging' },
                        { text: '📋 Project 11: Form Validator', link: '/javascript/10-project-form-validator' }
                    ]
                },
                {
                    text: 'Module 11: Web Storage & Browser APIs',
                    items: [
                        { text: '11.1 - Web Storage', link: '/javascript/11-01-web-storage' },
                        { text: '11.2 - Browser APIs', link: '/javascript/11-02-browser-apis' },
                        { text: '📝 Project 12: Note App', link: '/javascript/11-project-note-app' }
                    ]
                },
                {
                    text: 'Module 12: Capstone Project',
                    items: [
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
                    text: 'Module 1: Node.js Introduction',
                    items: [
                        { text: '1.1 - Node.js คืออะไร?', link: '/node/01-01-what-is-node' },
                        { text: '1.2 - npm & package.json', link: '/node/01-02-npm-basics' },
                        { text: '🎯 Project: CLI Tool', link: '/node/01-project-cli-tool' }
                    ]
                },
                {
                    text: 'Module 2: Modules System',
                    items: [
                        { text: '2.1 - CommonJS vs ESM', link: '/node/02-01-commonjs-esm' },
                        { text: '2.2 - npm Packages', link: '/node/02-02-npm-packages' },
                        { text: '📦 Project: Utility Package', link: '/node/02-project-utility-package' }
                    ]
                },
                {
                    text: 'Module 3: File System & Path',
                    items: [
                        { text: '3.1 - File System (fs)', link: '/node/03-01-filesystem' },
                        { text: '3.2 - Path & Streams', link: '/node/03-02-path-streams' },
                        { text: '📁 Project: File Manager', link: '/node/03-project-file-manager' }
                    ]
                },
                {
                    text: 'Module 4: HTTP & Server Basics',
                    items: [
                        { text: '4.1 - HTTP Basics & Status Codes', link: '/node/04-01-http-basics' },
                        { text: '4.2 - Basic Routing', link: '/node/04-02-basic-routing' },
                        { text: '🌐 Project: Simple API', link: '/node/04-project-simple-api' }
                    ]
                },
                {
                    text: 'Module 5: Express.js Basics',
                    items: [
                        { text: '5.1 - Express Setup', link: '/node/05-01-express-setup' },
                        { text: '5.2 - Middleware', link: '/node/05-02-middleware' },
                        { text: '🛣️ Project: REST API', link: '/node/05-project-rest-api' }
                    ]
                },
                {
                    text: 'Module 6: REST API Design',
                    items: [
                        { text: '6.1 - REST Concepts', link: '/node/06-01-rest-api-concepts' },
                        { text: '6.2 - Best Practices', link: '/node/06-02-api-design-best-practices' },
                        { text: '📡 Project: Memory API', link: '/node/06-project-memory-api' }
                    ]
                },
                {
                    text: 'Module 7: MySQL & SQL',
                    items: [
                        { text: '7.1 - MySQL Basics', link: '/node/07-01-mysql-basics' },
                        { text: '🗃️ Project: Student DB', link: '/node/07-project-student-db' }
                    ]
                },
                {
                    text: 'Module 8: MongoDB & NoSQL',
                    items: [
                        { text: '8.1 - MongoDB Basics', link: '/node/08-01-mongodb-basics' },
                        { text: '🍃 Project: Blog API', link: '/node/08-project-blog-api' }
                    ]
                },
                {
                    text: 'Module 9: Authentication',
                    items: [
                        { text: '9.1 - Auth & JWT basics', link: '/node/09-01-auth-jwt' },
                        { text: '🔐 Project: Auth System', link: '/node/09-project-auth-system' }
                    ]
                },
                {
                    text: 'Module 10: File Upload',
                    items: [
                        { text: '10.1 - File Upload Basics', link: '/node/10-01-file-upload' },
                        { text: '📤 Project: Upload API', link: '/node/10-project-upload-api' }
                    ]
                },
                {
                    text: 'Module 11: Security',
                    items: [
                        { text: '11.1 - Security Best Practices', link: '/node/11-01-security' },
                        { text: '🛡️ Project: Secure API', link: '/node/11-project-secure-api' }
                    ]
                },
                {
                    text: 'Module 12: Capstone Project',
                    items: [
                        { text: '12.1 - E-Commerce API Intro', link: '/node/12-01-capstone' },
                        { text: '🏆 Final Project: E-Commerce', link: '/node/12-project-ecommerce-api' }
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
