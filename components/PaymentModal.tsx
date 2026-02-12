import React, { useState, useEffect } from 'react';
import { X, DollarSign, ArrowRight, FileText, QrCode } from 'lucide-react';
import { Debt } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
  onConfirm: (amount: number, description?: string) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, debt, onConfirm }) => {
  const { t, dir, formatMoney } = useLanguage();
  const [amount, setAmount] = useState('');
  const [note, setNote] = useState('');
  const [showQR, setShowQR] = useState(false);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen && debt) {
      setAmount(''); 
      setNote('');
      setShowQR(false);
    }
  }, [isOpen, debt]);

  if (!isOpen || !debt) return null;

  const currentDebt = debt.montant;
  const payAmount = Number(amount) || 0;
  const remaining = Math.max(0, currentDebt - payAmount);
  
  // URL de l'API QR Code (simple et efficace)
  const qrData = `TEL:${debt.tel};AMOUNT:${payAmount > 0 ? payAmount : currentDebt}`;
  const qrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=${encodeURIComponent(qrData)}&color=0f172a`;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount > 0) {
      onConfirm(payAmount, note);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden animate-[scale-in_0.2s_ease-out]">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-lg font-bold text-slate-800">{t.payment.title}</h2>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6">
          <div className="mb-6 bg-primary-50 p-4 rounded-xl border border-primary-100 text-center">
            <p className="text-sm text-primary-600 mb-1">{t.payment.currentDebt}</p>
            <p className="text-3xl font-black text-primary-900">{formatMoney(currentDebt)}</p>
            <p className="text-sm text-primary-700 font-medium mt-1">{debt.nom}</p>
          </div>

          <div className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-slate-700">{t.payment.amountRecieved}</label>
                <button
                  type="button"
                  onClick={() => setAmount(debt.montant.toString())}
                  className="text-xs font-bold text-primary-600 bg-primary-100 px-2 py-1 rounded-md hover:bg-primary-200 transition-colors"
                >
                  {t.payment.payFull}
                </button>
              </div>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                  <DollarSign size={20} className="text-slate-400" />
                </div>
                <input
                  type="number"
                  required
                  min="1"
                  max={currentDebt}
                  autoFocus
                  className="block w-full ps-10 pe-3 py-3 text-lg font-bold border-2 border-slate-200 rounded-xl focus:ring-4 focus:ring-primary-100 focus:border-primary-500 outline-none transition-all"
                  value={amount}
                  placeholder="0.00"
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
            </div>
            
            <div>
               <div className="relative">
                 <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                   <FileText size={18} className="text-slate-400" />
                 </div>
                 <input
                   type="text"
                   className="block w-full ps-10 pe-3 py-2 text-sm border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 outline-none transition-all"
                   value={note}
                   placeholder={t.transaction.notePlaceholder}
                   onChange={e => setNote(e.target.value)}
                 />
               </div>
            </div>
            
            <div className="flex justify-center">
                 <button type="button" onClick={() => setShowQR(!showQR)} className="text-xs flex items-center gap-1 text-slate-500 hover:text-primary-600 transition-colors">
                    <QrCode size={14} /> {showQR ? 'Masquer QR Bankily' : 'Afficher QR Bankily'}
                 </button>
            </div>
            
            {showQR && (
                <div className="flex flex-col items-center justify-center p-4 bg-slate-50 rounded-xl border border-slate-200 animate-fade-in">
                    <img src={qrUrl} alt="Bankily QR" className="w-32 h-32 mb-2 rounded-lg mix-blend-multiply" />
                    <p className="text-[10px] text-slate-400 text-center">Scan pour Bankily/Masrvi<br/>Montant: {payAmount || currentDebt}</p>
                </div>
            )}

            <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{t.payment.amountPaid}</span>
                <span className="font-bold text-slate-800">
                  {formatMoney(payAmount)}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">{t.payment.newBalance}</span>
                <span className={`text-lg font-bold ${remaining === 0 && payAmount > 0 ? 'text-green-600' : 'text-slate-800'}`}>
                  {remaining === 0 && payAmount > 0 ? t.payment.fullyPaid : formatMoney(remaining)}
                </span>
              </div>
            </div>
          </div>

          <button 
            type="submit"
            disabled={payAmount <= 0}
            className="w-full bg-slate-900 text-white font-bold py-3.5 rounded-xl hover:bg-slate-800 transition-colors shadow-lg shadow-slate-900/20 mt-6 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span>{t.payment.confirm}</span>
            {dir === 'rtl' ? <ArrowRight className="rotate-180" size={18} /> : <ArrowRight size={18} />}
          </button>
        </form>
      </div>
    </div>
  );
};

export default PaymentModal;