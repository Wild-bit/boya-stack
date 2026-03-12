import type { ProjectInfo } from '@/api/organization/types';
import { Empty } from '@/components/Empty';
import { usePaginatedFetch } from '@/hooks';
import { PlusOutlined, GlobalOutlined, UnorderedListOutlined } from '@ant-design/icons';
import { PaginatedResponse, PaginationParams } from '@packages/shared/types';
import { Button, Input, Pagination, Skeleton } from 'antd';
import { useCallback, useRef, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '@/stores';
import { CreateProjectModal } from '../components/CreateProjectModal';

const PAGE_SIZE = 12;

const LOCALE_LABEL: Record<string, string> = {
  'zh-cn': '中文', 'zh-CN': '中文',
  'zh-tw': '繁体中文', 'zh-TW': '繁体中文',
  'en': '英语',
  'ja': '日语',
  'ko': '韩语',
  'fr': '法语',
  'de': '德语',
  'es': '西班牙语',
  'pt': '葡萄牙语',
  'ru': '俄语',
  'ar': '阿拉伯语',
  'th': '泰语',
  'vi': '越南语',
  'it': '意大利语',
  'id': '印尼语',
};

function getLocaleLabel(code: string) {
  return LOCALE_LABEL[code] || code;
}

function ProjectCardSkeleton() {
  return (
    <div className="rounded-lg border border-slate-200 bg-slate-100 p-5 space-y-4">
      <Skeleton.Input active size="small" style={{ width: 120 }} />
      <Skeleton.Input active size="small" style={{ width: '100%' }} />
      <Skeleton.Input active size="small" style={{ width: 100 }} />
    </div>
  );
}

function ProjectCard({ project, teamSlug }: { project: ProjectInfo; teamSlug: string }) {
  const navigate = useNavigate();

  const sourceLabel = getLocaleLabel(project.sourceLocale);
  const targetLabels = project.targetLanguages.map(getLocaleLabel).join(', ');

  return (
    <div
      onClick={() => navigate(`/${teamSlug}/${project.slug}`)}
      className="group rounded-lg bg-slate-100 border border-slate-200 p-5 cursor-pointer
        transition-all duration-200 ease-in-out
        hover:bg-slate-50 hover:border-slate-300"
    >
      <div className="text-[16px] font-semibold text-slate-800 truncate group-hover:text-brand-600 transition-colors duration-200">
        {project.name}
      </div>

      <div className="mt-4 flex items-center gap-1.5 text-sm text-slate-500">
        <GlobalOutlined className="text-brand-300 shrink-0" />
        <span className="font-medium text-slate-600">{sourceLabel}</span>
        <span className="text-slate-300 mx-0.5">&gt;</span>
        <span className="truncate">{targetLabels}</span>
      </div>

      <div className="mt-2.5 flex items-center gap-1.5 text-sm text-slate-500">
        <UnorderedListOutlined className="text-brand-300 shrink-0" />
        <span>共 {project.keyCount} 条文案</span>
      </div>
    </div>
  );
}

export function TeamDetailPage() {
  const currentTeam = useAppStore((s) => s.currentTeam)!;
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const searchTimerRef = useRef<ReturnType<typeof setTimeout>>();

  const { data: projects, isLoading, mutate } = usePaginatedFetch<
    PaginatedResponse<ProjectInfo>,
    PaginationParams & { teamSlug: string; search?: string }
  >('/projects/list', {
    teamSlug: currentTeam.slug,
    page,
    pageSize: PAGE_SIZE,
    ...(search ? { search } : {}),
  }, {
    revalidateOnFocus: false,
    shouldRetryOnError: false,
  });

  const isEmpty = !isLoading && (!projects?.items || projects.items.length === 0);
  const hasData = !isLoading && projects?.items && projects.items.length > 0;
  const showPagination = projects && projects.totalPages > 1;

  const handleSearch = useCallback((value: string) => {
    clearTimeout(searchTimerRef.current);
    searchTimerRef.current = setTimeout(() => {
      setSearch(value.trim());
      setPage(1);
    }, 300);
  }, []);

  const handlePageChange = useCallback((newPage: number) => {
    setPage(newPage);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, []);

  return (
    <div className="flex flex-col flex-1 min-h-0">
      <div className="flex-1 px-6 py-6">
        {/* Toolbar */}
        <div className="flex items-center justify-between gap-3">
          <Input.Search
            placeholder="搜索项目名称..."
            allowClear
            onChange={(e) => handleSearch(e.target.value)}
            className="max-w-xs"
          />
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setModalOpen(true)}
            className="cursor-pointer"
          >
            创建项目
          </Button>
        </div>

        {/* Loading skeleton grid */}
        {isLoading && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Array.from({ length: 8 }).map((_, i) => (
              <ProjectCardSkeleton key={i} />
            ))}
          </div>
        )}

        {/* Empty state */}
        {isEmpty && !search && (
          <Empty
            title="还没有项目"
            description="创建你的第一个国际化项目，开始管理多语言翻译"
            action={
              <Button
                type="primary"
                icon={<PlusOutlined />}
                onClick={() => setModalOpen(true)}
                className="cursor-pointer"
              >
                创建项目
              </Button>
            }
          />
        )}

        {/* Search empty state */}
        {isEmpty && search && (
          <Empty
            title="未找到匹配的项目"
            description={`没有找到与"${search}"相关的项目`}
          />
        )}

        {/* Project card grid */}
        {hasData && (
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {projects.items.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                teamSlug={currentTeam.slug}
              />
            ))}
          </div>
        )}
      </div>

      {/* Pagination — 固定在容器底部 */}
      {showPagination && (
        <div className="shrink-0 border-t border-slate-100 px-6 py-4 flex justify-end">
          <Pagination
            current={page}
            total={projects.total}
            pageSize={PAGE_SIZE}
            onChange={handlePageChange}
            showSizeChanger={false}
            showTotal={(total) => `共 ${total} 个项目`}
          />
        </div>
      )}

      <CreateProjectModal
        open={modalOpen}
        teamId={currentTeam.id}
        onClose={() => setModalOpen(false)}
        onSuccess={() => {
          mutate();
          setPage(1);
        }}
      />
    </div>
  );
}
