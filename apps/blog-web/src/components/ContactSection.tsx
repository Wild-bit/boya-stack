import { contactLinks } from '@/data/content';

export default function ContactSection() {
  return (
    <section id="contact" className="max-w-[960px] mx-auto px-8 py-20 text-center">
      <span className="inline-block text-[0.7rem] font-semibold uppercase tracking-[2px] px-4 py-1.5 rounded-full glass text-purple-400">
        Contact
      </span>
      <h2 className="text-[2rem] font-bold tracking-[-1px] mt-4">联系我</h2>
      <p className="text-white/50 mb-10 max-w-[480px] mx-auto mt-4">
        如果你有合作意向、技术交流，欢迎随时联系我。
      </p>

      <div className="flex justify-center gap-4 flex-wrap">
        {contactLinks.map((c) => (
          <a
            key={c.text}
            className="glass px-6 py-3 rounded-full flex items-center gap-2.5 text-[0.85rem] font-medium transition-all cursor-pointer hover:-translate-y-0.5 hover:border-[rgba(167,139,250,0.4)]"
          >
            <span className="text-[1.1rem]">{c.icon}</span>
            {c.text}
          </a>
        ))}
      </div>
    </section>
  );
}
