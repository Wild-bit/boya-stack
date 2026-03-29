import monorepoGuide from '@/content/blog/monorepo-setup-guide.md?raw';
import rscGuide from '@/content/blog/react-server-components.md?raw';
import typescriptGuide from '@/content/blog/typescript-advanced-types.md?raw';
import websocketGuide from '@/content/blog/websocket-architecture.md?raw';
import nestjsGuide from '@/content/blog/solution-for-achieving-seamless-refresh.md?raw';
import axiosHttpClientGuide from '@/content/blog/axios-http-client.md?raw';
import teamInviteDesign from '@/content/blog/team-invite-design.md?raw';
import i18nKeyTrie from '@/content/blog/i18n-key-trie.md?raw';
import shedcli from '@/content/blog/shedcli.md?raw';
import jsbridge from '@/content/blog/jsbridge.md?raw';
import claudeCodeSkills from '@/content/blog/claude-code-skills.md?raw';
import claudeCodeMcpVsSkills from '@/content/blog/claude-code-mcp-vs-skills.md?raw';
import nextJsConceptsAndPractices from '@/content/blog/next-js-concepts-and-practices.md?raw';
import guangzhouInterviewPreparation from '@/content/interview-experiences/guangzhou-interview-preparation.md?raw';
import aiConceptsTranslationIntegration from '@/content/interview-experiences/ai-concepts-translation-integration.md?raw';
import reactCorePrinciples from '@/content/interview-experiences/react-core-principles.md?raw';
import reactTsHighFrequencyQuestions from '@/content/interview-experiences/react-ts-high-frequency-questions.md?raw';
export interface BlogPost {
  slug: string;
  date: string;
  title: string;
  desc: string;
  content: string;
  tags?: string[];
  category?: string;
}

export const interviewExperiences: BlogPost[] = [
  {
    slug: 'react-ts-high-frequency-questions',
    date: '2026-03-24',
    title: 'React + TypeScript 高频面试题深度解答',
    desc: 'React + TypeScript 高频面试题深度解答',
    content: reactTsHighFrequencyQuestions,
    tags: ['React', 'TypeScript', '高频面试题', '深度解答'],
    category: 'React',
  },
  {
    slug: 'react-core-principles',
    date: '2026-03-24',
    title: 'React 核心原理整理',
    desc: 'React 核心原理整理',
    content: reactCorePrinciples,
    tags: ['React', '核心原理', '整理'],
    category: 'React',
  },
  {
    slug: 'ai-concepts-translation-integration',
    date: '2026-03-24',
    title: 'AI 核心概念整理',
    desc: 'AI 核心概念整理',
    content: aiConceptsTranslationIntegration,
    tags: ['AI', '概念', '整理'],
    category: 'AI',
  },
  {
    slug: 'guangzhou-interview-preparation',
    date: '2026-03-24',
    title: '广州面试准备',
    desc: '广州面试准备',
    content: guangzhouInterviewPreparation,
    tags: ['面试', '广州', '准备'],
    category: '面试',
  },
];

export const blogPosts: BlogPost[] = [
  {
    slug: 'next-js-concepts-and-practices',
    date: '2026-03-23',
    title: 'Next.js 相关概念与实践',
    desc: 'Next.js 相关概念与实践',
    content: nextJsConceptsAndPractices,
    tags: ['Next.js', 'SSG', 'ISR', 'SSR'],
    category: 'NextJS',
  },
  {
    slug: 'claude-code-mcp-vs-skills',
    date: '2026-02-25',
    title: 'Claude Code 中 MCP 与 Skills 的区别：选对工具，事半功倍',
    desc: '理清 MCP 和 Skills 的定位差异，推荐实用的 MCP Server，以及如何组合使用发挥最大效果。',
    content: claudeCodeMcpVsSkills,
    tags: ['Claude Code', 'MCP', 'Skills'],
    category: 'AI',
  },
  {
    slug: 'claude-code-skills',
    date: '2026-03-10',
    title: 'Claude Code Skills 实用指南：提升你的 AI 编程效率',
    desc: '深入介绍 Claude Code 的 Skills 机制，推荐实用的内置 Skills 和社区 Skills，以及如何创建自定义 Skill。',
    content: claudeCodeSkills,
    tags: ['Claude Code', 'AI', 'Skills'],
    category: 'AI',
  },
  {
    slug: 'i18n-key-trie',
    date: '2026-03-22',
    title: 'i18n Key 冲突校验',
    desc: '分享如何使用 Trie（前缀树） 校验 i18n Key 是否冲突。',
    content: i18nKeyTrie,
    tags: ['i18n', 'Trie', '冲突校验'],
    category: 'NestJS',
  },
  {
    slug: 'team-invite-design',
    date: '2026-03-15',
    title: '团队邀请设计',
    desc: '分享如何设计团队邀请功能。',
    content: teamInviteDesign,
    tags: ['团队邀请', 'NestJS'],
    category: 'NestJS',
  },
  {
    slug: 'axios-http-client',
    date: '2026-01-02',
    title: '基于 Axios 封装的 HTTP 客户端',
    desc: '分享如何使用 Axios 封装 HTTP 客户端。',
    content: axiosHttpClientGuide,
    tags: ['Axios', 'HTTP'],
    category: '基建工程',
  },
  {
    slug: 'monorepo-setup-guide',
    date: '2025-12-15',
    title: '从零搭建企业级 Monorepo 工程体系',
    desc: '分享如何使用 pnpm + Turborepo 构建高效的 monorepo 开发体验。',
    content: monorepoGuide,
    tags: ['Monorepo', 'pnpm', 'Turborepo'],
    category: '工程化',
  },
  {
    slug: 'react-server-components',
    date: '2025-11-08',
    title: '深入理解 React Server Components',
    desc: 'RSC 的工作原理、使用场景以及与传统 SSR 的区别。',
    content: rscGuide,
    tags: ['React', 'RSC', 'SSR'],
    category: 'React',
  },
  {
    slug: 'typescript-advanced-types',
    date: '2025-10-22',
    title: 'TypeScript 类型体操实战指南',
    desc: '从基础到进阶，掌握 TypeScript 高级类型编程技巧。',
    content: typescriptGuide,
    tags: ['TypeScript', '类型系统'],
    category: 'TypeScript',
  },
  {
    slug: 'websocket-architecture',
    date: '2025-09-14',
    title: 'WebSocket 实时通信架构设计',
    desc: '如何设计一个可靠的实时通信系统，处理断线重连和消息可靠性。',
    content: websocketGuide,
    tags: ['WebSocket', '实时通信', '架构设计'],
    category: 'JavaScript',
  },
  {
    slug: 'shedcli',
    date: '2023-03-22',
    title: '基于Vue项目的脚手架工具shedcli',
    desc: '从零打造一个 Vue 项目脚手架：我的实践与思考',
    content: shedcli,
    tags: ['shedcli', '脚手架', 'Vue'],
    category: 'Vue',
  },
  {
    slug: 'jsbridge',
    date: '2023-04-22',
    title: 'H5 与客户端通信机制：JSBridge 实战',
    desc: '分享如何使用 JSBridge 通信机制。',
    content: jsbridge,
    tags: ['JSBridge', '通信机制'],
    category: 'JavaScript',
  },
  {
    slug: 'solution-for-achieving-seamless-refresh-with-nestjs',
    date: '2026-03-15',
    title: 'NestJS 实现无感刷新解决方案',
    desc: '分享如何使用 NestJS 实现无感刷新解决方案。',
    content: nestjsGuide,
    tags: ['NestJS', '无感刷新', '解决方案'],
    category: 'NestJS',
  },
];

export function getBlogPostBySlug(slug: string): BlogPost | undefined {
  return blogPosts.find((post) => post.slug === slug);
}

export function getInterviewExperienceBySlug(slug: string): BlogPost | undefined {
  return interviewExperiences.find((post) => post.slug === slug);
}
