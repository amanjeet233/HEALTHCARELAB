import React from 'react';
import { useNavigate } from 'react-router-dom';
import CategoryTile from './CategoryTile';
import { getCategoryIcon } from '../../assets/categoryIcons';

const WOMEN_CATEGORIES = [
  { label: 'PCOD Screening', category: 'hormones',        iconBg: '#FDF4FF' },
  { label: 'Blood Studies',  category: 'cbc',             iconBg: '#FEF2F2' },
  { label: 'Pregnancy',      category: 'pregnancy',       iconBg: '#FFF0F6' },
  { label: 'Iron Studies',   category: 'iron-deficiency', iconBg: '#F8FAFC' },
  { label: 'Vitamin',        category: 'vitamin',         iconBg: '#FFFBEB' },
];

const toSlug = (cat: string) =>
  cat.toLowerCase().replace(/[\s'/]+/g, '-').replace(/[^\w-]/g, '');

/* ─── Decorative Wellness SVG Banner ─────────────────────────────── */
const WellnessBanner = () => (
  <svg
    viewBox="0 0 900 120"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className="w-full h-auto"
    preserveAspectRatio="xMidYMid meet"
    aria-hidden="true"
  >
    <rect width="900" height="120" fill="#FFF0F3" />
    <ellipse cx="150" cy="90" rx="130" ry="30" fill="#FFD6DF" fillOpacity="0.4" />
    <ellipse cx="750" cy="30" rx="110" ry="25" fill="#FFC1CB" fillOpacity="0.35" />
    {/* Woman yoga figure */}
    <circle cx="450" cy="28" r="13" fill="#F9A8D4" />
    <path d="M450 41 L450 75" stroke="#F472B6" strokeWidth="5" strokeLinecap="round"/>
    <path d="M450 50 L418 38" stroke="#F472B6" strokeWidth="4" strokeLinecap="round"/>
    <path d="M450 50 L482 38" stroke="#F472B6" strokeWidth="4" strokeLinecap="round"/>
    <circle cx="418" cy="35" r="4" fill="#F9A8D4" />
    <circle cx="482" cy="35" r="4" fill="#F9A8D4" />
    <path d="M450 75 Q430 95 415 110" stroke="#F472B6" strokeWidth="4" strokeLinecap="round"/>
    <path d="M450 75 Q470 95 485 110" stroke="#F472B6" strokeWidth="4" strokeLinecap="round"/>
    <ellipse cx="450" cy="112" rx="40" ry="6" fill="#FECDD3" fillOpacity="0.7"/>
    {/* Decorative elements */}
    <circle cx="80" cy="40" r="18" fill="#FECDD3" fillOpacity="0.55"/>
    <circle cx="60" cy="80" r="10" fill="#FDA4AF" fillOpacity="0.35"/>
    <circle cx="820" cy="50" r="22" fill="#FECDD3" fillOpacity="0.5"/>
    <circle cx="845" cy="88" r="12" fill="#FDA4AF" fillOpacity="0.3"/>
    <ellipse cx="170" cy="55" rx="22" ry="9" fill="#FDE8EC" fillOpacity="0.7" transform="rotate(-30 170 55)"/>
    <ellipse cx="730" cy="65" rx="22" ry="9" fill="#FDE8EC" fillOpacity="0.7" transform="rotate(25 730 65)"/>
    <path d="M300 30 L302 36 L308 36 L303 40 L305 46 L300 42 L295 46 L297 40 L292 36 L298 36Z" fill="#FBCFE8" fillOpacity="0.8"/>
    <path d="M600 25 L602 31 L608 31 L603 35 L605 41 L600 37 L595 41 L597 35 L592 31 L598 31Z" fill="#FBCFE8" fillOpacity="0.7"/>
    <line x1="0" y1="119" x2="900" y2="119" stroke="#F9A8D4" strokeWidth="1.5" strokeDasharray="6 4" />
  </svg>
);

const WomenCareSection: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full px-4 md:px-6 py-2">
      <div className="rounded-2xl overflow-hidden border border-pink-100 shadow-sm">

        {/* Category tiles using CategoryTile component */}
        <div
          className="px-5 py-4 flex gap-3 overflow-x-auto no-scrollbar"
          style={{ background: '#FFF7F9' }}
        >
          {WOMEN_CATEGORIES.map((cat) => (
            <CategoryTile
              key={cat.label}
              src={getCategoryIcon(cat.label)}
              label={cat.label}
              href={`/lab-tests-category/${toSlug(cat.category)}`}
              iconBg={cat.iconBg}
              size="sm"
            />
          ))}
        </div>

        {/* Wellness illustration strip */}
        <WellnessBanner />
      </div>
    </div>
  );
};

export default WomenCareSection;
