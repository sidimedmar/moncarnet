import React, { useState } from 'react';
import { X, Calendar, Share2, TrendingDown, TrendingUp, Check } from 'lucide-react';
import { Debt } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface DebtDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
}

const DebtDetailsModal: React.FC<DebtDetailsModalProps> = ({ isOpen, onClose, debt }) => {
  const { t } = useLanguage();
  const [copied, setCopied] = useState(false);

  if (!isOpen || !debt) return null;

  const handleShare = () => {
    // Génération d'un texte formaté "Reçu"
    const lines = [
      `*🧾 REÇU DE SITUATION - ${t.appTitle}*`,
      `-------------------`,
      `👤 Client: ${debt.nom}`,
      `📅 Date: ${new Date().toLocaleDateString()}`,
      `💰 *Reste à payer: ${debt.montant.toLocaleString()} ${t.currency}*`,
      `-------------------`,
      `*Dernières opérations:*`
    ];

    debt.transactions.slice(0, 5).forEach(tr => {
      const type = tr.type === 'CREDIT' ? '🔴 Crédit' : '🟢 Paiement';
      lines.push(`${type}: ${tr.amount.toLocaleString()} ${t.currency} (${new Date(tr.date).toLocaleDateString()})`);
    });

    lines.push(`-------------------`);
    lines.push(`Merci de votre confiance.`);

    const text = lines.join('\n');
    
    // Essayer de copier ou partager
    if (navigator.share) {
      navigator.share({
        title: `Reçu ${debt.nom}`,
        text: text
      }).catch(console.error);
    } else {
      navigator.clipboard.writeText(text).then(() => {
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      });
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden flex flex-col max-h-[85vh] animate-[scale-in_0.2s_ease-out]">
        
        {/* Header */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-slate-800">{t.details}</h2>
          <button onClick={onClose} className="p-2 -me-2 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto">
          
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-slate-800">{debt.nom}</h3>
            <p className="text-slate-500 text-sm mb-4">{debt.tel}</p>
            <div className="inline-block bg-primary-50 text-primary-700 px-6 py-3 rounded-2xl border border-primary-100">
              <span className="text-sm block text-primary-500 font-medium mb-1">{t.payment.newBalance}</span>
              <span className="text-3xl font-black tracking-tight">{debt.montant.toLocaleString()} <span className="text-lg">{t.currency}</span></span>
            </div>
          </div>

          <div className="mb-4 flex items-center justify-between">
            <h4 className="font-bold text-slate-700 text-sm uppercase tracking-wide">{t.history}</h4>
          </div>

          <div className="space-y-3 relative">
             {/* Ligne verticale de timeline */}
             <div className="absolute start-4 top-2 bottom-2 w-0.5 bg-slate-100"></div>

            {[...debt.transactions].reverse().map((tr) => (
              <div key={tr.id} className="relative flex items-center bg-white border border-slate-100 p-3 rounded-xl shadow-sm z-10">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 me-3 ${
                  tr.type === 'CREDIT' ? 'bg-red-50 text-red-500' : 'bg-green-50 text-green-500'
                }`}>
                  {tr.type === 'CREDIT' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-bold text-slate-800">
                    {tr.type === 'CREDIT' ? t.transaction.credit : t.transaction.payment}
                  </p>
                  <p className="text-xs text-slate-400 flex items-center gap-1">
                    <Calendar size={10} />
                    {new Date(tr.date).toLocaleDateString()}
                  </p>
                </div>
                <div className={`font-bold text-sm ${
                  tr.type === 'CREDIT' ? 'text-red-600' : 'text-green-600'
                }`}>
                  {tr.type === 'CREDIT' ? '+' : '-'}{tr.amount.toLocaleString()}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="p-4 border-t border-slate-100 bg-slate-50 shrink-0">
          <button 
            onClick={handleShare}
            className={`w-full py-3.5 rounded-xl font-bold flex items-center justify-center gap-2 transition-all ${
              copied 
                ? 'bg-emerald-600 text-white' 
                : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-50'
            }`}
          >
            {copied ? <Check size={20} /> : <Share2 size={20} />}
            {copied ? t.receiptCopied : t.shareReceipt}
          </button>
        </div>

      </div>
    </div>
  );
};

export default DebtDetailsModal;