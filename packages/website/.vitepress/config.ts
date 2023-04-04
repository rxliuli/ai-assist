import { defineConfig } from 'vitepress'

export default defineConfig({
  title: 'AI Assist',
  description: '基于 chatgpt 实现的一些周边工具',
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Chat', link: '/chat/' },
    ],

    sidebar: [{ text: 'Chat', link: '/chat/' }],

    socialLinks: [{ icon: 'github', link: 'https://github.com/rxliuli/ai-assist' }],

    editLink: {
      pattern: 'https://github.com/rxliuli/ai-assist/edit/master/packages/website/:path',
      text: 'Edit this page on GitHub',
    },
  },
  ignoreDeadLinks: true,
})
