import { navLinks } from '@/data/content';
import { cn } from '@/lib/utils';
import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';

export default function Navbar() {
  const location = useLocation();
  const [open, setOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const isActive = (href: string) => location.pathname === href;

  // 路由变化时关闭菜单
  useEffect(() => {
    setOpen(false);
  }, [location.pathname]);

  // 点击外部关闭菜单
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setOpen(false);
      }
    };
    if (open) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [open]);

  return (
    <div ref={menuRef} className="fixed top-4 left-1/2 -translate-x-1/2 z-[100]">
      <nav className="px-6 sm:px-8 py-3 rounded-full glass flex items-center gap-6 sm:gap-10">
        <a href="/" className="font-bold text-base text-gradient">Lance</a>

        {/* 桌面端菜单 */}
        <ul className="hidden sm:flex list-none gap-6">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={cn(
                  'text-[0.8rem] text-white/50 font-medium transition-colors hover:text-white',
                  isActive(link.href) && 'text-white',
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>

        <a
          href="https://github.com/Wild-bit/boya-stack/tree/main/apps/blog-web"
          target="_blank"
          rel="noopener noreferrer"
          className="text-[0.8rem] hover:scale-110 transition-all text-white/50 font-medium transition-colors hover:text-white"
        >
          <img src="static/images/github.svg" alt="GitHub" className="w-4 h-4" />
        </a>

        {/* 移动端汉堡按钮 */}
        <button
          className="sm:hidden flex flex-col justify-center items-center w-5 h-5 gap-[4px]"
          onClick={() => setOpen(!open)}
          aria-label="Toggle menu"
        >
          <span
            className={cn(
              'block w-4 h-[1.5px] bg-white/70 rounded-full transition-all duration-300',
              open && 'translate-y-[5.5px] rotate-45',
            )}
          />
          <span
            className={cn(
              'block w-4 h-[1.5px] bg-white/70 rounded-full transition-all duration-300',
              open && 'opacity-0',
            )}
          />
          <span
            className={cn(
              'block w-4 h-[1.5px] bg-white/70 rounded-full transition-all duration-300',
              open && '-translate-y-[5.5px] -rotate-45',
            )}
          />
        </button>
      </nav>

      {/* 移动端下拉菜单 */}
      <div
        className={cn(
          'sm:hidden mt-2 rounded-2xl glass overflow-hidden transition-all duration-300',
          open ? 'max-h-60 opacity-100' : 'max-h-0 opacity-0',
        )}
      >
        <ul className="list-none py-3 px-6 flex flex-col gap-1">
          {navLinks.map((link) => (
            <li key={link.href}>
              <a
                href={link.href}
                className={cn(
                  'block py-2 text-[0.85rem] text-white/50 font-medium transition-colors hover:text-white',
                  isActive(link.href) && 'text-white',
                )}
              >
                {link.label}
              </a>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
