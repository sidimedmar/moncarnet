import React from 'react';
import { TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface SummaryCardProps {
  totalAmount: number;
  totalCount: number;
}

const SummaryCard: React.FC<SummaryCardProps> = ({ totalAmount, totalCount }) => {
  const { t } = useLanguage();

  return (
    <div className="bg-gradient-to-br from-primary-700 to-primary-900 rounded-2xl p-6 text-white shadow-lg relative overflow-hidden">
      {/* Decorative circles - flipped for RTL using logical properties if supported, but simple absolute positioning needs manual flip or 'inset-inline-start/end' which tailwind supports via start/end */}
      <div className="absolute top-0 end-0 -me-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
      <div className="absolute bottom-0 start-0 -ms-8 -mb-8 w-24 h-24 rounded-full bg-white/5 blur-xl pointer-events-none"></div>
      
      <div className="relative z-10">
        <div className="flex justify-between items-start mb-6">
          <div>
            <p className="text-primary-100 text-sm font-medium uppercase tracking-wider mb-1">{t.totalRecover}</p>
            <h2 className="text-4xl font-extrabold tracking-tight">
              {totalAmount.toLocaleString()} <span className="text-2xl font-semibold text-primary-200">{t.currency}</span>
            </h2>
          </div>
          <div className="bg-white/10 p-2 rounded-lg backdrop-blur-sm">
            <TrendingUp size={24} className="text-white" />
          </div>
        </div>

        <div className="flex items-center gap-2 text-primary-100 text-sm bg-white/10 w-fit px-3 py-1.5 rounded-full backdrop-blur-sm">
          <Users size={14} />
          <span>{totalCount} {t.pendingClients}</span>
        </div>
      </div>
    </div>
  );
};

export default SummaryCard;