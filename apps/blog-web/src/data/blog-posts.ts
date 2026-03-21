import monorepoGuide from '@/content/blog/monorepo-setup-guide.md?raw';
import rscGuide from '@/content/blog/react-server-components.md?raw';
import typescriptGuide from '@/content/blog/typescript-advanced-types.md?raw';
import websocketGuide from '@/content/blog/websocket-architecture.md?raw';
import nestjsGuide from '@/content/blog/solution-for-achieving-seamless-refresh.md?raw';
import axiosHttpClientGuide from '@/content/blog/axios-http-client.md?raw';
import teamInviteDesign from '@/content/blog/team-invite-design.md?raw';
import i18nKeyTrie from '@/content/blog/i18n-key-trie.md?raw';

export interface BlogPost {
  slug: string;
  date: string;
  title: string;
  desc: string;
  content: string;
  tags?: string[];
  category?: string;
}

export const blogPosts: BlogPost[] = [
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
