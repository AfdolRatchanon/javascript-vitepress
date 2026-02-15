import { defineConfig } from 'vitepress'
import mathjax3 from 'markdown-it-mathjax3'

export default defineConfig({
    title: "JavaScript Zero to Hero",
    description: "A comprehensive, bilingual JavaScript course from zero to hero.",
    lang: 'th-TH',
    cleanUrls: true,
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
