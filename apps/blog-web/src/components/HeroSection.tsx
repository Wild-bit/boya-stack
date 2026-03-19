import GitHubContributions from './GitHubContributions';

export default function HeroSection() {
  return (
    <section id="about" className="max-w-[960px] mx-auto px-8 pt-40 pb-20 flex flex-col items-center text-center">
      {/* Avatar */}
      <div className="w-[120px] h-[120px] rounded-full bg-gradient-to-r from-purple-400 to-pink-400 p-[3px] mb-8">
        <div className="w-full h-full rounded-full bg-dark flex items-center justify-center text-[2.5rem]">
          👨‍💻
        </div>
      </div>

      <span className="inline-block text-[0.7rem] font-semibold uppercase tracking-[2px] px-4 py-1.5 rounded-full glass text-purple-400 mb-6">
        Full Stack Developer
      </span>

      <h1 className="text-[3.5rem] sm:text-[2.2rem] md:text-[3.5rem] font-extrabold tracking-[-2px] leading-[1.1] mb-6">
        Hi, 我是 <span className="text-gradient">Lance</span> &nbsp;<span className="animate-wave" role="img" aria-labelledby="wave">👋🏻</span>
      </h1>

      <p className="text-[1.1rem] text-white/50 max-w-[520px]">
        一个热爱技术的全栈开发者，专注于构建美观且高性能的 Web 应用。我相信学习某件事的最佳方法就是动手实践。
      </p>

      <div className="flex gap-4 mt-10">
        <a
          href="#projects"
          className="px-8 py-3 rounded-full text-[0.85rem] font-semibold bg-gradient-to-r from-purple-400 to-pink-400 text-white transition-all hover:-translate-y-0.5 hover:shadow-[0_8px_30px_rgba(167,139,250,0.3)]"
        >
          探索项目
        </a>
        <a
          href="#contact"
          className="px-8 py-3 rounded-full text-[0.85rem] font-semibold glass text-white transition-all hover:bg-glass-strong"
        >
          联系我
        </a>
      </div>

      <GitHubContributions />
    </section>
  );
}
