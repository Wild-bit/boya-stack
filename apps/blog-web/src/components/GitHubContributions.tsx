import { useEffect, useState, useRef } from 'react';

interface ContributionDay {
  date: string;
  count: number;
  level: 0 | 1 | 2 | 3 | 4;
}

interface ContributionWeek {
  days: ContributionDay[];
}

interface ApiResponse {
  total: Record<string, number>;
  contributions: ContributionDay[];
}

interface Tooltip {
  text: string;
  x: number;
  y: number;
}

const GITHUB_USERNAME = 'Wild-bit';
const API_BASE = 'https://github-contributions-api.jogruber.de/v4';

const LEVEL_COLORS = [
  'rgba(255,255,255,0.06)',
  'rgba(167,139,250,0.25)',
  'rgba(167,139,250,0.45)',
  'rgba(167,139,250,0.7)',
  'rgba(167,139,250,1)',
];

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const DAY_SUFFIXES = ['th', 'st', 'nd', 'rd'] as const;

function formatDateLabel(dateStr: string): string {
  const date = new Date(dateStr);
  const month = MONTHS[date.getMonth()]!;
  const day = date.getDate();
  const suffix = day % 10 <= 3 && ![11, 12, 13].includes(day)
    ? DAY_SUFFIXES[day % 10]!
    : 'th';
  return `${month} ${day}${suffix}`;
}

function formatTooltip(day: ContributionDay): string {
  if (!day.date) return '';
  const label = formatDateLabel(day.date);
  if (day.count === 0) return `No contributions on ${label}.`;
  return `${day.count} contribution${day.count > 1 ? 's' : ''} on ${label}.`;
}

function groupIntoWeeks(contributions: ContributionDay[]): ContributionWeek[] {
  const weeks: ContributionWeek[] = [];
  let currentWeek: ContributionDay[] = [];

  // 第一天补齐到周日开始
  if (contributions.length > 0) {
    const firstDay = new Date(contributions[0]!.date).getDay();
    for (let i = 0; i < firstDay; i++) {
      currentWeek.push({ date: '', count: 0, level: 0 });
    }
  }

  for (const day of contributions) {
    currentWeek.push(day);
    if (currentWeek.length === 7) {
      weeks.push({ days: currentWeek });
      currentWeek = [];
    }
  }

  if (currentWeek.length > 0) {
    while (currentWeek.length < 7) {
      currentWeek.push({ date: '', count: 0, level: 0 });
    }
    weeks.push({ days: currentWeek });
  }

  return weeks;
}

function getMonthLabels(weeks: ContributionWeek[]) {
  const labels: { label: string; col: number }[] = [];
  let lastMonth = -1;
  weeks.forEach((week, i) => {
    const firstDay = week.days.find((d) => d.date);
    if (firstDay?.date) {
      const month = new Date(firstDay.date).getMonth();
      if (month !== lastMonth) {
        labels.push({ label: MONTHS[month]!, col: i });
        lastMonth = month;
      }
    }
  });
  return labels;
}

export default function GitHubContributions() {
  const [weeks, setWeeks] = useState<ContributionWeek[]>([]);
  const [total, setTotal] = useState(0);
  const [loading, setLoading] = useState(true);
  const [tooltip, setTooltip] = useState<Tooltip | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const fetchContributions = async () => {
      try {
        const res = await fetch(`${API_BASE}/${GITHUB_USERNAME}?y=last`);
        const data: ApiResponse = await res.json();
        const grouped = groupIntoWeeks(data.contributions);
        setWeeks(grouped);
        setTotal(data.total['lastYear'] ?? 0);
      } catch {
        // 静默失败，不显示组件
      } finally {
        setLoading(false);
      }
    };
    fetchContributions();
  }, []);

  if (loading) {
    return (
      <div className="mt-14 glass rounded-2xl p-6 sm:p-8 text-center text-white/30 text-sm">
        Loading contributions...
      </div>
    );
  }

  if (weeks.length === 0) return null;

  const monthLabels = getMonthLabels(weeks);

  return (
    <div className="mt-14 glass rounded-2xl p-6 sm:p-8 overflow-hidden" ref={containerRef}>
      <h3 className="text-center text-lg font-semibold mb-6 tracking-wide">
        Days I <span className="text-gradient">Code</span>
      </h3>

      <div className="relative min-w-[720px] overflow-visible">
        {/* Tooltip */}
        {tooltip && (
          <div
            className="absolute z-50 px-3 py-1.5 rounded-md bg-[#1b1f23] border border-white/10 text-[0.75rem] text-white whitespace-nowrap pointer-events-none"
            style={{
              left: `clamp(60px, ${tooltip.x}px, calc(100% - 60px))`,
              top: `${tooltip.y}px`,
              transform: 'translate(-50%, -100%)',
            }}
          >
            {tooltip.text}
          </div>
        )}

        {/* Month labels */}
        <div className="flex ml-8 mb-1.5">
          {monthLabels.map((m) => (
            <span
              key={`${m.label}-${m.col}`}
              className="text-[0.65rem] text-white/40 absolute"
              style={{ left: `${m.col * 15 + 32}px` }}
            >
              {m.label}
            </span>
          ))}
        </div>

        {/* Grid */}
        <div className="flex gap-[3px] mt-6">
          {/* Day labels */}
          <div className="flex flex-col gap-[3px] mr-1.5 justify-start">
            {['', 'Mon', '', 'Wed', '', 'Fri', ''].map((d, i) => (
              <div key={i} className="h-[13px] text-[0.6rem] text-white/30 leading-[13px] w-6 text-right pr-1">
                {d}
              </div>
            ))}
          </div>

          {weeks.map((week, wi) => (
            <div key={wi} className="flex flex-col gap-[3px]">
              {week.days.map((day, di) => (
                <div
                  key={`${wi}-${di}`}
                  className="w-[13px] h-[13px] rounded-[3px] transition-colors cursor-pointer"
                  style={{ backgroundColor: LEVEL_COLORS[day.level] }}
                  onMouseEnter={(e) => {
                    if (!day.date || !containerRef.current) return;
                    const rect = containerRef.current.getBoundingClientRect();
                    const cellRect = e.currentTarget.getBoundingClientRect();
                    setTooltip({
                      text: formatTooltip(day),
                      x: cellRect.left - rect.left + cellRect.width / 2,
                      y: cellRect.top - rect.top - 8,
                    });
                  }}
                  onMouseLeave={() => setTooltip(null)}
                />
              ))}
            </div>
          ))}
        </div>

        {/* Footer */}
        <div className="flex justify-between items-center mt-4 text-[0.7rem] text-white/40">
          <a
            href={`https://github.com/${GITHUB_USERNAME}`}
            target="_blank"
            rel="noopener noreferrer"
            className="hover:text-white/60 transition-colors"
          >
            {total} contributions in the last year
          </a>
          <div className="flex items-center gap-1.5">
            <span>Less</span>
            {LEVEL_COLORS.map((color, i) => (
              <div
                key={i}
                className="w-[13px] h-[13px] rounded-[3px]"
                style={{ backgroundColor: color }}
              />
            ))}
            <span>More</span>
          </div>
        </div>
      </div>
    </div>
  );
}
