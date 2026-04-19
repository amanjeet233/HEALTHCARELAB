import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

type CrumbItem = {
  label: string;
  to?: string;
};

type MOBreadcrumbsProps = {
  items: CrumbItem[];
};

const MOBreadcrumbs: React.FC<MOBreadcrumbsProps> = ({ items }) => {
  return (
    <nav aria-label="Breadcrumb" className="inline-flex flex-wrap items-center gap-2 text-[10px] font-black uppercase tracking-[0.16em] text-cyan-800/50">
      {items.map((item, idx) => {
        const isLast = idx === items.length - 1;
        return (
          <React.Fragment key={`${item.label}-${idx}`}>
            {item.to && !isLast ? (
              <Link to={item.to} className="hover:text-cyan-700 transition-colors">
                {item.label}
              </Link>
            ) : (
              <span className={isLast ? 'text-cyan-700' : ''}>{item.label}</span>
            )}
            {!isLast && <ChevronRight size={12} className="text-cyan-700/40" />}
          </React.Fragment>
        );
      })}
    </nav>
  );
};

export default MOBreadcrumbs;
