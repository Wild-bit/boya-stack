import { blogPosts } from '@/data/blog-posts';
import dayjs from 'dayjs';
import { ArrowRight } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

export default function BlogSection() {
  const recentBlogPosts = blogPosts.sort((a, b) => dayjs(b.date).diff(dayjs(a.date))).slice(0, 3);
  const navigate = useNavigate();
  return (
    <section id="blog" className="container mx-auto px-6 sm:px-8 lg:px-16 py-20">
      <div className="text-center mb-12">
        <span className="inline-block text-[0.7rem] font-semibold uppercase tracking-[2px] px-4 py-1.5 rounded-full glass text-purple-400">
          Blog
        </span>
        <h2 className="text-[2rem] font-bold tracking-[-1px] mt-4">最新文章</h2>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        {recentBlogPosts.map((post, index) => (
          <article
            key={post.slug}
            onClick={() => navigate(`/blog/${post.slug}`)}
            className="group glass p-8 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:border-purple-400/30 relative overflow-hidden"
            style={{
              animationDelay: `${index * 100}ms`,
            }}
          >
            {/* 背景装饰 */}
            <div className="absolute inset-0 bg-gradient-to-br from-purple-500/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

            {/* 日期 */}
            <time className="text-[0.75rem] text-pink-400 font-medium">
              {post.date}
            </time>

            {/* 标题 */}
            <h2 className="text-[1.15rem] font-semibold mt-3 mb-3 leading-snug group-hover:text-purple-300 transition-colors">
              {post.title}
            </h2>

            {/* 描述 */}
            <p className="text-[0.85rem] text-white/50 leading-relaxed line-clamp-2">
              {post.desc}
            </p>

            {/* 标签 */}
            {post.tags && (
              <div className="flex flex-wrap gap-2 mt-4">
                {post.tags.map((tag) => (
                  <span
                    key={tag}
                    className="text-[0.65rem] px-2.5 py-1 rounded-full bg-purple-400/10 text-purple-400 font-medium"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}

            {/* 阅读全文 */}
            <div className="flex items-center gap-2 mt-6 text-pink-400 text-[0.85rem] font-medium group-hover:gap-3 transition-all">
              <span>阅读全文</span>
              <ArrowRight className="w-4 h-4" />
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
