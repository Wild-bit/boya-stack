import type { ReactNode } from 'react';

interface EmptyProps {
  title?: string;
  description?: string;
  action?: ReactNode;
  variant?: 'v1' | 'v2' | 'v3';
}

function EmptyIllustration() {
  return (
    <svg
      width="220"
      height="200"
      viewBox="0 0 220 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      <defs>
        <linearGradient id="planetGrad" x1="80" y1="60" x2="140" y2="140">
          <stop offset="0%" stopColor="#818cf8" />
          <stop offset="100%" stopColor="#6366f1" />
        </linearGradient>
        <linearGradient id="ringGrad" x1="40" y1="100" x2="180" y2="100">
          <stop offset="0%" stopColor="#c7d2fe" stopOpacity="0.2" />
          <stop offset="50%" stopColor="#a5b4fc" stopOpacity="0.6" />
          <stop offset="100%" stopColor="#c7d2fe" stopOpacity="0.2" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="3" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Background soft glow */}
      <circle cx="110" cy="100" r="70" fill="#eef2ff" opacity="0.5" />

      {/* Orbit rings */}
      <ellipse cx="110" cy="105" rx="80" ry="28" stroke="url(#ringGrad)" strokeWidth="1.2" strokeDasharray="4 6" />
      <ellipse cx="110" cy="105" rx="56" ry="20" stroke="#c7d2fe" strokeWidth="0.8" opacity="0.4" />

      {/* Planet */}
      <circle cx="110" cy="96" r="32" fill="url(#planetGrad)" />
      <circle cx="110" cy="96" r="32" fill="white" opacity="0.06" />
      {/* Planet surface lines */}
      <ellipse cx="110" cy="96" rx="16" ry="32" stroke="white" strokeWidth="0.8" opacity="0.2" />
      <line x1="78" y1="96" x2="142" y2="96" stroke="white" strokeWidth="0.8" opacity="0.2" />
      <ellipse cx="110" cy="86" rx="28" ry="8" stroke="white" strokeWidth="0.6" opacity="0.15" />
      <ellipse cx="110" cy="106" rx="28" ry="8" stroke="white" strokeWidth="0.6" opacity="0.15" />
      {/* Planet highlight */}
      <circle cx="98" cy="84" r="8" fill="white" opacity="0.12" />

      {/* Speech bubble — top-left "A" */}
      <g filter="url(#glow)">
        <rect x="28" y="42" rx="10" ry="10" width="36" height="30" fill="white" stroke="#e0e7ff" strokeWidth="1" />
        <polygon points="50,72 54,72 48,80" fill="white" stroke="#e0e7ff" strokeWidth="1" strokeLinejoin="round" />
        <rect x="48" y="71" width="7" height="3" fill="white" />
        <text x="46" y="62" textAnchor="middle" fontSize="14" fontWeight="600" fill="#6366f1">A</text>
      </g>

      {/* Speech bubble — top-right "文" */}
      <g filter="url(#glow)">
        <rect x="156" y="34" rx="10" ry="10" width="36" height="30" fill="white" stroke="#e0e7ff" strokeWidth="1" />
        <polygon points="168,64 164,64 170,72" fill="white" stroke="#e0e7ff" strokeWidth="1" strokeLinejoin="round" />
        <rect x="163" y="63" width="8" height="3" fill="white" />
        <text x="174" y="54" textAnchor="middle" fontSize="13" fontWeight="500" fill="#3b82f6">文</text>
      </g>

      {/* Speech bubble — bottom-left "あ" */}
      <g filter="url(#glow)">
        <rect x="36" y="118" rx="10" ry="10" width="36" height="30" fill="white" stroke="#e0e7ff" strokeWidth="1" />
        <polygon points="58,118 62,118 56,110" fill="white" stroke="#e0e7ff" strokeWidth="1" strokeLinejoin="round" />
        <rect x="55" y="116" width="8" height="4" fill="white" />
        <text x="54" y="138" textAnchor="middle" fontSize="13" fontWeight="500" fill="#8b5cf6">あ</text>
      </g>

      {/* Speech bubble — bottom-right "ñ" */}
      <g filter="url(#glow)">
        <rect x="152" y="112" rx="10" ry="10" width="36" height="30" fill="white" stroke="#e0e7ff" strokeWidth="1" />
        <polygon points="166,112 162,112 168,104" fill="white" stroke="#e0e7ff" strokeWidth="1" strokeLinejoin="round" />
        <rect x="161" y="110" width="8" height="4" fill="white" />
        <text x="170" y="132" textAnchor="middle" fontSize="14" fontWeight="600" fill="#ec4899">ñ</text>
      </g>

      {/* Sparkles */}
      <g fill="#a5b4fc" opacity="0.7">
        <circle cx="148" cy="58" r="2" />
        <circle cx="70" cy="72" r="1.5" />
        <circle cx="158" cy="92" r="1.5" />
        <circle cx="62" cy="108" r="2" />
        <circle cx="85" cy="140" r="1.5" />
        <circle cx="138" cy="142" r="1.8" />
      </g>

      {/* Small orbiting dots */}
      <circle cx="42" cy="98" r="3" fill="#818cf8" opacity="0.5" />
      <circle cx="178" cy="108" r="2.5" fill="#6366f1" opacity="0.4" />

      {/* Ground shadow */}
      <ellipse cx="110" cy="174" rx="50" ry="6" fill="#c7d2fe" opacity="0.3" />
    </svg>
  );
}

function EmptyIllustrationV2() {
  return (
    <svg
      width="240"
      height="200"
      viewBox="0 0 240 200"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Central clipboard */}
      <rect x="80" y="32" rx="6" width="80" height="108" fill="#E0E7FF" />
      <rect x="100" y="26" rx="4" width="40" height="14" fill="#6366F1" />
      <circle cx="120" cy="33" r="3" fill="#E0E7FF" />
      {/* Clipboard lines (empty state — dashed) */}
      <line x1="96" y1="60" x2="144" y2="60" stroke="#A5B4FC" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
      <line x1="96" y1="74" x2="136" y2="74" stroke="#A5B4FC" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
      <line x1="96" y1="88" x2="140" y2="88" stroke="#A5B4FC" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
      <line x1="96" y1="102" x2="130" y2="102" stroke="#A5B4FC" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />
      <line x1="96" y1="116" x2="144" y2="116" stroke="#A5B4FC" strokeWidth="2" strokeDasharray="4 4" strokeLinecap="round" />

      {/* Language tag — top-left: EN */}
      <rect x="16" y="40" rx="14" width="44" height="28" fill="#6366F1" />
      <text x="38" y="59" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">EN</text>
      <line x1="60" y1="54" x2="80" y2="60" stroke="#C7D2FE" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Language tag — top-right: 中 */}
      <rect x="178" y="34" rx="14" width="44" height="28" fill="#818CF8" />
      <text x="200" y="53" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">中</text>
      <line x1="178" y1="48" x2="160" y2="56" stroke="#C7D2FE" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Language tag — left: あ */}
      <rect x="22" y="96" rx="14" width="40" height="28" fill="#10B981" />
      <text x="42" y="115" textAnchor="middle" fontSize="13" fontWeight="600" fill="white">あ</text>
      <line x1="62" y1="110" x2="80" y2="102" stroke="#C7D2FE" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Language tag — right: ES */}
      <rect x="180" y="90" rx="14" width="40" height="28" fill="#F59E0B" />
      <text x="200" y="109" textAnchor="middle" fontSize="13" fontWeight="600" fill="#1E1B4B">ES</text>
      <line x1="180" y1="104" x2="160" y2="96" stroke="#C7D2FE" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Language tag — bottom-left: KO */}
      <rect x="32" y="148" rx="14" width="40" height="28" fill="#6366F1" opacity="0.6" />
      <text x="52" y="167" textAnchor="middle" fontSize="12" fontWeight="600" fill="white">KO</text>
      <line x1="72" y1="156" x2="96" y2="140" stroke="#C7D2FE" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Language tag — bottom-right: FR */}
      <rect x="170" y="146" rx="14" width="40" height="28" fill="#818CF8" opacity="0.6" />
      <text x="190" y="165" textAnchor="middle" fontSize="12" fontWeight="600" fill="white">FR</text>
      <line x1="170" y1="154" x2="146" y2="140" stroke="#C7D2FE" strokeWidth="1.5" strokeDasharray="3 3" />

      {/* Decorative dots — flat, no glow */}
      <circle cx="70" cy="72" r="3" fill="#C7D2FE" />
      <circle cx="172" cy="70" r="3" fill="#C7D2FE" />
      <circle cx="120" cy="160" r="3" fill="#E0E7FF" />
      <circle cx="14" cy="130" r="2" fill="#A5B4FC" />
      <circle cx="228" cy="126" r="2" fill="#A5B4FC" />

      {/* Small plus signs — "add translation" hint */}
      <g stroke="#A5B4FC" strokeWidth="1.5" strokeLinecap="round">
        <line x1="30" y1="70" x2="30" y2="78" />
        <line x1="26" y1="74" x2="34" y2="74" />
        <line x1="210" y1="130" x2="210" y2="138" />
        <line x1="206" y1="134" x2="214" y2="134" />
      </g>
    </svg>
  );
}

function EmptyIllustrationV3() {
  return (
    <svg
      width="240"
      height="210"
      viewBox="0 0 240 210"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className="mx-auto"
    >
      {/* Orbit ring — behind planet */}
      <ellipse cx="120" cy="108" rx="90" ry="24" stroke="#E0E7FF" strokeWidth="1.5" />

      {/* Planet */}
      <circle cx="120" cy="100" r="38" fill="#6366F1" />
      {/* Flat continent shapes */}
      <rect x="104" y="76" rx="3" width="20" height="14" fill="#818CF8" />
      <rect x="128" y="86" rx="2" width="14" height="10" fill="#818CF8" />
      <rect x="98" y="96" rx="3" width="18" height="12" fill="#A5B4FC" />
      <rect x="120" y="102" rx="2" width="22" height="10" fill="#818CF8" />
      <rect x="108" y="116" rx="2" width="12" height="8" fill="#A5B4FC" />
      {/* Equator line */}
      <line x1="82" y1="100" x2="158" y2="100" stroke="#A5B4FC" strokeWidth="1" opacity="0.5" />

      {/* Orbiting satellite — small flat rocket */}
      <g transform="translate(196, 84) rotate(30)">
        <rect x="-3" y="0" rx="2" width="6" height="14" fill="#10B981" />
        <polygon points="0,-4 -4,2 4,2" fill="#10B981" />
        <rect x="-5" y="10" width="2" height="4" fill="#6366F1" />
        <rect x="3" y="10" width="2" height="4" fill="#6366F1" />
      </g>

      {/* Language tag — top-left: EN */}
      <rect x="10" y="30" rx="4" width="42" height="26" fill="#6366F1" />
      <text x="31" y="48" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">EN</text>
      <line x1="52" y1="43" x2="86" y2="78" stroke="#C7D2FE" strokeWidth="1.5" />
      <circle cx="86" cy="78" r="2.5" fill="#C7D2FE" />

      {/* Language tag — top-right: 中 */}
      <rect x="186" y="24" rx="4" width="42" height="26" fill="#10B981" />
      <text x="207" y="42" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">中</text>
      <line x1="186" y1="37" x2="154" y2="78" stroke="#C7D2FE" strokeWidth="1.5" />
      <circle cx="154" cy="78" r="2.5" fill="#C7D2FE" />

      {/* Language tag — left: あ */}
      <rect x="6" y="100" rx="4" width="38" height="26" fill="#F59E0B" />
      <text x="25" y="118" textAnchor="middle" fontSize="13" fontWeight="700" fill="#1E1B4B">あ</text>
      <line x1="44" y1="113" x2="82" y2="104" stroke="#C7D2FE" strokeWidth="1.5" />
      <circle cx="82" cy="104" r="2.5" fill="#C7D2FE" />

      {/* Language tag — right: ES */}
      <rect x="196" y="104" rx="4" width="38" height="26" fill="#EC4899" />
      <text x="215" y="122" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">ES</text>
      <line x1="196" y1="117" x2="158" y2="108" stroke="#C7D2FE" strokeWidth="1.5" />
      <circle cx="158" cy="108" r="2.5" fill="#C7D2FE" />

      {/* Language tag — bottom-left: 한 */}
      <rect x="28" y="156" rx="4" width="38" height="26" fill="#818CF8" />
      <text x="47" y="174" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">한</text>
      <line x1="56" y1="156" x2="100" y2="132" stroke="#C7D2FE" strokeWidth="1.5" />
      <circle cx="100" cy="132" r="2.5" fill="#C7D2FE" />

      {/* Language tag — bottom-right: FR */}
      <rect x="172" y="152" rx="4" width="38" height="26" fill="#6366F1" opacity="0.7" />
      <text x="191" y="170" textAnchor="middle" fontSize="13" fontWeight="700" fill="white">FR</text>
      <line x1="178" y1="152" x2="142" y2="128" stroke="#C7D2FE" strokeWidth="1.5" />
      <circle cx="142" cy="128" r="2.5" fill="#C7D2FE" />

      {/* Orbiting dots on the ring */}
      <circle cx="32" cy="116" r="4" fill="#10B981" />
      <circle cx="210" cy="96" r="3" fill="#6366F1" opacity="0.5" />

      {/* Small decorative elements */}
      <rect x="68" y="48" width="5" height="5" rx="1" fill="#E0E7FF" transform="rotate(45 70.5 50.5)" />
      <rect x="170" y="58" width="5" height="5" rx="1" fill="#E0E7FF" transform="rotate(45 172.5 60.5)" />
      <circle cx="120" cy="170" r="2" fill="#C7D2FE" />
      <circle cx="58" cy="76" r="2" fill="#A5B4FC" />
      <circle cx="180" cy="142" r="2" fill="#A5B4FC" />

      {/* Signal waves from planet — "broadcasting translations" */}
      <path d="M164 72 Q172 68 168 60" stroke="#A5B4FC" strokeWidth="1.2" fill="none" strokeLinecap="round" />
      <path d="M170 76 Q180 70 174 58" stroke="#C7D2FE" strokeWidth="1" fill="none" strokeLinecap="round" />
    </svg>
  );
}

export function Empty({ title, description, action, variant = 'v3' }: EmptyProps) {
  const illustrations = { v1: EmptyIllustration, v2: EmptyIllustrationV2, v3: EmptyIllustrationV3 };
  const Illustration = illustrations[variant];

  return (
    <div className="flex flex-col items-center justify-center py-16 px-4 select-none">
      <Illustration />
      <div className="text-center">
        {title && (
          <h3 className="text-base font-medium text-slate-700 mb-1.5">
            {title}
          </h3>
        )}
        {description && (
          <p className="text-sm text-slate-400 leading-relaxed max-w-xs mx-auto">
            {description}
          </p>
        )}
      </div>
      {action && <div className="mt-2">{action}</div>}
    </div>
  );
}
