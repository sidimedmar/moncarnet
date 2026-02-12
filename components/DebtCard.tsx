import React from 'react';
import { Phone, MessageCircle, Calendar, Trash2, Wallet2, ChevronRight, Check, AlertOctagon, MapPin, Archive } from 'lucide-react';
import { Debt } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DebtCardProps {
  debt: Debt;
  onPay: (id: number) => void;
  onDelete: (id: number) => void;
  onViewDetails: (id: number) => void;
  onRemind: (id: number, type: 'soft' | 'firm') => void;
  isSelectionMode: boolean;
  isSelected: boolean;
  onToggleSelect: (id: number) => void;
}

const DebtCard: React.FC<DebtCardProps> = ({ debt, onPay, onDelete, onViewDetails, onRemind, isSelectionMode, isSelected, onToggleSelect }) => {
  const { t, dir, formatMoney } = useLanguage();

  const calculerJours = (dateDette: string) => {
    const diff = new Date().getTime() - new Date(dateDette).getTime();
    return Math.floor(diff / (1000 * 60 * 60 * 24));
  };

  const jours = calculerJours(debt.date);
  const isContentious = debt.status === 'CONTENTIOUS';
  const isPaid = debt.status === 'PAID' || debt.isPaid;

  const getUrgencyStyles = (jours: number) => {
    if (isPaid) return {
      badge: 'bg-emerald-600 text-white border-emerald-700',
      border: 'border-s-emerald-500', 
      text: t.status.paid,
      bg: 'bg-emerald-50/50'
    };
    if (isContentious) return {
      badge: 'bg-red-600 text-white border-red-700',
      border: 'border-s-red-600', 
      text: "CONTENTIEUX",
      bg: 'bg-red-50/30'
    };
    if (jours > 30) return {
      badge: 'bg-red-100 text-red-700 border-red-200',
      border: 'border-s-red-400', 
      text: t.status.critical,
      bg: 'bg-white'
    };
    if (jours > 15) return {
      badge: 'bg-orange-100 text-orange-700 border-orange-200',
      border: 'border-s-orange-400', 
      text: t.status.medium,
      bg: 'bg-white'
    };
    return {
      badge: 'bg-green-100 text-green-700 border-green-200',
      border: 'border-s-green-400', 
      text: t.status.recent,
      bg: 'bg-white'
    };
  };

  const style = getUrgencyStyles(jours);

  const handleWhatsApp = (e: React.MouseEvent, type: 'soft' | 'firm') => {
    e.stopPropagation();
    onRemind(debt.id, type);
  };

  const handleCardClick = () => {
    if (isSelectionMode) {
      onToggleSelect(debt.id);
    } else {
      onViewDetails(debt.id);
    }
  };

  return (
    <div 
      onClick={handleCardClick}
      className={`relative rounded-xl shadow-sm border border-slate-100 border-s-4 ${style.border} overflow-hidden transition-all duration-200 cursor-pointer group ${isSelectionMode ? (isSelected ? 'shadow-lg ring-2 ring-primary-500' : 'hover:bg-slate-50') : 'hover:shadow-md active:scale-[0.99]'} ${style.bg}`}
    >
      {/* Overlay de sélection */}
      {isSelectionMode && (
        <div className={`absolute top-3 ${dir === 'rtl' ? 'left-3' : 'right-3'} z-10`}>
          <div className={`w-6 h-6 rounded-full flex items-center justify-center border-2 transition-all ${isSelected ? 'bg-primary-600 border-primary-600' : 'bg-white/50 backdrop-blur-sm border-slate-300'}`}>
            {isSelected && <Check size={16} className="text-white" />}
          </div>
        </div>
      )}

      <div className={`p-4 sm:p-5 transition-opacity ${isSelectionMode && !isSelected ? 'opacity-70' : 'opacity-100'}`}>
        <div className="flex justify-between items-start mb-4">
          <div className="min-w-0 flex-1 pe-4"> 
            <div className="flex flex-wrap items-center gap-2 mb-1">
              {isContentious && <AlertOctagon size={18} className="text-red-600" />}
              {isPaid && <Check size={18} className="text-emerald-600" />}
              <h3 className={`font-bold text-lg truncate max-w-full transition-colors ${isPaid ? 'text-slate-500 line-through' : 'text-slate-800 group-hover:text-primary-600'}`}>{debt.nom}</h3>
              <span className={`text-[10px] uppercase font-bold px-2 py-0.5 rounded-full border shrink-0 ${style.badge}`}>
                {style.text}
              </span>
            </div>
            <div className="flex flex-wrap items-center text-slate-500 text-xs sm:text-sm gap-x-3 gap-y-1">
                <div className="flex items-center gap-1">
                    <Calendar size={14} />
                    <span>{new Date(debt.date).toLocaleDateString('fr-FR')}</span>
                </div>
                {debt.location && (
                  <>
                  <span className="text-slate-300">•</span>
                  <div className="flex items-center gap-1 text-primary-600">
                    <MapPin size={14} />
                    <span>GPS</span>
                  </div>
                  </>
                )}
                {!isPaid && (
                  <>
                    <span className="hidden sm:inline text-slate-300">•</span>
                    <span className={`${jours > 0 ? "text-slate-500" : "text-slate-400"}`}>
                        {jours > 0 ? `${t.daysLate} ${jours} ${t.days}` : t.today}
                    </span>
                  </>
                )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="text-end shrink-0">
              <p className={`text-lg sm:text-xl font-black tracking-tight ${isPaid ? 'text-emerald-600' : 'text-slate-800'}`}>{formatMoney(debt.montant).split(' ')[0]}</p>
              <p className="text-[10px] sm:text-xs text-slate-400 font-medium">{t.currency}</p>
            </div>
            {!isSelectionMode && <ChevronRight size={20} className={`text-slate-300 ${dir === 'rtl' ? 'rotate-180' : ''}`} />}
          </div>
        </div>

        {/* Actions - Cachées si mode sélection ou si dette payée */}
        {!isSelectionMode && !isPaid && (
          <>
            <div className="grid grid-cols-2 gap-3 mb-4">
              <button 
                onClick={(e) => handleWhatsApp(e, 'soft')}
                className="flex items-center justify-center gap-2 py-3 sm:py-2.5 px-2 sm:px-4 bg-emerald-50 text-emerald-700 hover:bg-emerald-100 rounded-lg text-xs sm:text-sm font-semibold transition-colors border border-emerald-100 active:scale-95 transform duration-100"
              >
                <MessageCircle size={16} className="shrink-0" />
                <span className="truncate">{t.softReminder}</span>
              </button>
              <button 
                onClick={(e) => handleWhatsApp(e, 'firm')}
                className="flex items-center justify-center gap-2 py-3 sm:py-2.5 px-2 sm:px-4 bg-rose-50 text-rose-700 hover:bg-rose-100 rounded-lg text-xs sm:text-sm font-semibold transition-colors border border-rose-100 active:scale-95 transform duration-100"
              >
                <span className="flex items-center justify-center w-4 h-4 bg-rose-200 rounded-full text-[10px] shrink-0">!</span>
                <span className="truncate">{t.firmReminder}</span>
              </button>
            </div>
            <div className="flex items-center justify-between pt-4 border-t border-slate-50 gap-2">
                <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(debt.id); }}
                    className="p-2 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-full transition-colors active:bg-red-100 shrink-0"
                    title={t.delete}
                >
                    <Trash2 size={18} />
                </button>
                <div className="flex flex-1 justify-end">
                    <button 
                        onClick={(e) => { e.stopPropagation(); onPay(debt.id); }}
                        className="flex-1 sm:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-900 text-white rounded-lg text-sm font-bold hover:bg-slate-800 transition-colors shadow-sm active:bg-slate-700 active:scale-95 transform duration-100 truncate"
                    >
                        <Wallet2 size={16} className="shrink-0" />
                        <span>{t.makePayment}</span>
                    </button>
                </div>
            </div>
          </>
        )}
        
        {/* Actions simplifiées pour les archives */}
        {!isSelectionMode && isPaid && (
             <div className="flex items-center justify-between pt-4 border-t border-emerald-100 gap-2 mt-2">
                 <div className="flex items-center gap-2 text-emerald-700 text-xs font-bold">
                    <Archive size={14} />
                    <span>Dossier Archivé</span>
                 </div>
                 <button 
                    onClick={(e) => { e.stopPropagation(); onDelete(debt.id); }}
                    className="flex items-center gap-1 px-3 py-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors text-xs font-medium"
                >
                    <Trash2 size={14} />
                    <span>{t.delete}</span>
                </button>
             </div>
        )}
      </div>
    </div>
  );
};

export default DebtCard;