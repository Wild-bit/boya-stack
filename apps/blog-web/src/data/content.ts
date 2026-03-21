import { CDN_URL } from './contant';

export const navLinks = [
  { label: '关于我', href: '/about' },
  { label: '项目', href: '/projects' },
  { label: '简历', href: '/resume' },
  { label: '文章', href: '/blog' },
];

export const projects = [
  {
    preview: `${CDN_URL}/images/boya.png`,
    title: 'i18n 国际化平台',
    desc: '一站式多语言管理平台，集中管理多语言文案，告别 Excel 混乱时代，在线翻译 & AI 赋能。',
    tips: '登录即注册 ,可以体验完整功能',
    tags: ['React', 'Fastify', 'PostgreSQL', 'NestJS', 'Ant Design', 'TailwindCSS'],
    github: 'https://github.com/Wild-bit/boya-stack',
    website: 'https://app.boya.fit',
  },
  {
    preview: `${CDN_URL}/images/nav-preview.png`,
    title: '导航工具网站',
    desc: '导航工具网站，收集各种实用工具以及自定义工具，方便快捷地找到需要的工具。',
    tags: [
      'React',
      'TailwindCSS',
      'TypeScript',
      'Next',
      'Vercel',
      'Vercel',
      'Supabase',
      'shadcn/ui',
    ],
    website: 'https://navtools.rfcont.uk',
    tips: '体验账号：visitor  密码：123456!',
    github: '',
  },
  {
    title: '个人博客网站',
    preview: `${CDN_URL}/images/blog.png`,
    desc: '个人博客，记录个人学习历程，分享技术文章，记录生活点滴，记录工作心得。',
    tags: ['React', 'TailwindCSS', 'TypeScript', 'Tencent Cloud Pages', 'Markdown'],
    github: 'https://github.com/Wild-bit/my-monorepo-project/tree/main/apps/blog-web',
    website: 'https://blog.lancespace.club',
  },
  {
    title: '基于Axios 封装的 请求工具 http-client',
    preview: `${CDN_URL}/images/http-client.png`,
    desc: '类型安全，将相关的 API 定义组织到模块中，使代码结构更清晰、更易于维护。',
    tags: ['TypeScript', 'Axios'],
    github: 'https://github.com/Wild-bit/http-client',
  },
];

export const experiences = [
  {
    period: '2023 — 至今',
    title: '高级前端工程师',
    company: '某科技公司',
    desc: '负责核心产品前端架构设计，主导微前端改造，性能优化提升 40%。带领 5 人团队完成多个重要项目交付。',
  },
  {
    period: '2021 — 2023',
    title: '全栈开发工程师',
    company: '某互联网公司',
    desc: '独立负责多个 B 端产品的全栈开发，设计并实现了公司内部的国际化解决方案。',
  },
  {
    period: '2019 — 2021',
    title: '前端开发工程师',
    company: '某创业公司',
    desc: '参与公司核心产品从 0 到 1 的搭建，负责前端技术选型和基础设施建设。',
  },
];

export const skills = [
  {
    name: 'JavaScript',
    icon: 'static/images/js.svg',
  },
  {
    name: 'TypeScript',
    icon: 'static/images/ts.svg',
  },
  {
    name: 'React',
    icon: 'static/images/react.svg',
  },
  {
    name: 'Vue',
    icon: 'static/images/vue.svg',
  },
  {
    name: 'Next.js',
    icon: 'static/images/next.svg',
  },
  {
    name: 'Nest.js',
    icon: 'static/images/nest.svg',
  },
  {
    name: 'Node.js',
    icon: 'static/images/node.svg',
  },
  {
    name: 'PostgreSQL',
    icon: 'static/images/pg.svg',
  },
  {
    name: 'Docker',
    icon: 'static/images/docker.svg',
  },
  {
    name: 'TailwindCSS',
    icon: 'static/images/tailwindcss.svg',
  },
  {
    name: 'Git',
    icon: 'static/images/git.svg',
  },
  {
    name: 'Zustand',
    icon: 'static/images/zustand.svg',
  },
  {
    name: 'pinia',
    icon: 'static/images/pinia.svg',
  },
];

export const contactLinks = [
  { icon: '✉️', text: 'lzh32534@gmail.com', type: 'email' },
  { icon: '🐙', text: 'GitHub', type: 'github', link: 'https://github.com/Wild-bit' },
  { icon: '💬', text: '微信', type: 'wechat' },
  { icon: '📍', text: '中国 · 广州', type: 'location' },
];
