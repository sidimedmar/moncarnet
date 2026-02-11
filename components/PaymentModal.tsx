import React, { useState, useEffect } from 'react';
import { X, DollarSign, ArrowRight } from 'lucide-react';
import { Debt } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
  onConfirm: (amount: number) => void;
}

const PaymentModal: React.FC<PaymentModalProps> = ({ isOpen, onClose, debt, onConfirm }) => {
  const { t, dir } = useLanguage();
  const [amount, setAmount] = useState('');

  // Reset amount when modal opens
  useEffect(() => {
    if (isOpen && debt) {
      setAmount(''); // Start with an empty field
    }
  }, [isOpen, debt]);

  if (!isOpen || !debt) return null;

  const currentDebt = debt.montant;
  const payAmount = Number(amount) || 0;
  const remaining = Math.max(0, currentDebt - payAmount);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (payAmount > 0) {
      onConfirm(payAmount);
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
            <p className="text-3xl font-black text-primary-900">{currentDebt.toLocaleString()} <span className="text-lg font-bold">{t.currency}</span></p>
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
                  placeholder="0"
                  onChange={e => setAmount(e.target.value)}
                />
              </div>
            </div>

            <div className="space-y-2 p-3 bg-slate-50 rounded-lg border border-slate-100">
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-500 font-medium">{t.payment.amountPaid}</span>
                <span className="font-bold text-slate-800">
                  {payAmount.toLocaleString()} {t.currency}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm text-slate-500 font-medium">{t.payment.newBalance}</span>
                <span className={`text-lg font-bold ${remaining === 0 && payAmount > 0 ? 'text-green-600' : 'text-slate-800'}`}>
                  {remaining === 0 && payAmount > 0 ? t.payment.fullyPaid : `${remaining.toLocaleString()} ${t.currency}`}
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