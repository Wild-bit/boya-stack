import { useAppStore } from '@/stores';
import { useEffect } from 'react';
import { Outlet } from 'react-router-dom';
import { Breadcrumbs } from '@/components/Breadcrumbs';
import { AccountAvatar } from '@/components/AccountAvatar';

export function MainLayout() {
  const { teams, fetchTeams } = useAppStore();

  useEffect(() => {
    if (!teams.length) fetchTeams();
  }, [teams.length]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-slate-100">
      <header className="bg-white flex sticky top-0 z-10 border-b border-slate-200/80">
        <div className="max-w-[1400px] mx-auto container h-20 flex items-center justify-between px-4">
          <Breadcrumbs />
          <div className="flex-1 flex justify-end">
            <AccountAvatar />
          </div>
        </div>
      </header>
      <main className="flex-1 mt-5">
        <Outlet />
      </main>
    </div>
  );
}
