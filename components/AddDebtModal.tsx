import React, { useState } from 'react';
import { X, Calendar, User, DollarSign, Phone } from 'lucide-react';
import { Debt } from '../types';
import { useLanguage } from '../contexts/LanguageContext';

interface AddDebtModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (debt: Omit<Debt, 'id' | 'isPaid'>) => void;
}

const AddDebtModal: React.FC<AddDebtModalProps> = ({ isOpen, onClose, onAdd }) => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    nom: '',
    montant: '',
    date: new Date().toISOString().split('T')[0],
    tel: '222'
  });

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.nom || !formData.montant || !formData.tel) return;

    onAdd({
      nom: formData.nom,
      montant: Number(formData.montant),
      date: formData.date,
      tel: formData.tel
    });
    
    // Reset and close
    setFormData({
        nom: '',
        montant: '',
        date: new Date().toISOString().split('T')[0],
        tel: '222'
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md relative z-10 overflow-hidden animate-[scale-in_0.2s_ease-out] flex flex-col max-h-[90vh]">
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0">
          <h2 className="text-lg font-bold text-slate-800">{t.addDebt}</h2>
          <button onClick={onClose} className="p-2 -me-2 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-6 space-y-4 overflow-y-auto">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.fields.name}</label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                <User size={18} className="text-slate-400" />
              </div>
              <input
                type="text"
                required
                className="block w-full ps-10 pe-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base"
                placeholder={t.fields.namePlaceholder}
                value={formData.nom}
                onChange={e => setFormData({...formData, nom: e.target.value})}
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">{t.fields.amount}</label>
            <div className="relative">
              <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                <DollarSign size={18} className="text-slate-400" />
              </div>
              <input
                type="number"
                required
                min="1"
                className="block w-full ps-10 pe-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base"
                placeholder="0"
                value={formData.montant}
                onChange={e => setFormData({...formData, montant: e.target.value})}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.fields.date}</label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                  <Calendar size={18} className="text-slate-400" />
                </div>
                <input
                  type="date"
                  required
                  className="block w-full ps-10 pe-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base"
                  value={formData.date}
                  onChange={e => setFormData({...formData, date: e.target.value})}
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-700 mb-1">{t.fields.phone}</label>
              <div className="relative">
                <div className="absolute inset-y-0 start-0 ps-3 flex items-center pointer-events-none">
                  <Phone size={18} className="text-slate-400" />
                </div>
                <input
                  type="tel"
                  required
                  className="block w-full ps-10 pe-3 py-3 border border-slate-200 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none transition-all text-base"
                  style={{ direction: 'ltr' }} 
                  value={formData.tel}
                  onChange={e => setFormData({...formData, tel: e.target.value})}
                />
              </div>
            </div>
          </div>

          <button 
            type="submit"
            className="w-full bg-primary-600 text-white font-bold py-3.5 rounded-xl hover:bg-primary-700 transition-colors shadow-lg shadow-primary-500/30 mt-2 active:scale-[0.98] transform"
          >
            {t.save}
          </button>
        </form>
      </div>
    </div>
  );
};

export default AddDebtModal;