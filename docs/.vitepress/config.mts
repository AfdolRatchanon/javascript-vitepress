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
            { text: 'บทเรียน (Lessons)', link: '/00-setup' },
            { text: 'เฉลย (Solutions)', link: '/solutions/03-sol' }
        ],

        sidebar: [
            {
                text: 'Module 0: Preparation',
                items: [
                    { text: '00 - Setup Environment', link: '/00-setup' }
                ]
            },
            {
                text: 'Module 1: Introduction',
                items: [
                    { text: '1.1 - History & Standards', link: '/01-01-history' },
                    { text: '1.2 - Hello World & Console', link: '/01-02-hello-world' },
                    { text: '1.3 - Syntax Basics', link: '/01-03-syntax-basics' },
                    { text: '🎨 Project 1: Console Artist', link: '/01-project-artist' },
                    { text: '📜 Project 2: My Biography', link: '/01-project-bio' }
                ]
            },
            {
                text: 'Module 2: Variables & Types',
                items: [
                    { text: '2.1 - Variables Deep Dive', link: '/02-01-variables' },
                    { text: '2.2 - Data Types & Memory', link: '/02-02-data-types' },
                    { text: '2.3 - Type Conversion', link: '/02-03-type-conversion' },
                    { text: '2.4 - Operators (Math & Logic)', link: '/02-04-operators' },
                    { text: '⚖️ Project 3: BMI Calculator', link: '/02-project-bmi' }
                ]
            },
            {
                text: 'Module 3: Control Flow',
                items: [
                    { text: '3.1 - Conditionals (Logic)', link: '/03-01-conditionals' },
                    { text: '3.2 - Loops (Repetition)', link: '/03-02-loops' },
                    { text: '🐝 Project 4: FizzBuzz', link: '/03-project-fizzbuzz' }
                ]
            },
            {
                text: 'Module 4: Functions & Scope',
                items: [
                    { text: '4.1 - Functions Basics', link: '/04-01-functions' },
                    { text: '4.2 - Data Flow & Params', link: '/04-02-data-flow' },
                    { text: '4.3 - Scope & Closures', link: '/04-03-scope-closures' },
                    { text: '🧮 Project 5: Calculator', link: '/04-project-calculator' }
                ]
            },
            {
                text: 'Module 5: Arrays & Objects',
                items: [
                    { text: '5.1 - Arrays (Lists)', link: '/05-01-arrays' },
                    { text: '5.2 - Objects (Key-Value)', link: '/05-02-objects' },
                    { text: '5.3 - Reference vs Value', link: '/05-03-reference-vs-value' },
                    { text: '✅ Project 6: Todo List', link: '/05-project-todo' }
                ]
            }
        ],

        socialLinks: [
            { icon: 'github', link: 'https://github.com/vuejs/vitepress' }
        ],

        footer: {
            message: 'Released under the MIT License.',
            copyright: 'Copyright © 2024-present JavaScript Zero to Hero'
        }
    }
})
