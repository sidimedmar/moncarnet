import React from 'react';
import { MessageCircle, X } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface ReminderConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  message: string;
}

const ReminderConfirmModal: React.FC<ReminderConfirmModalProps> = ({ isOpen, onClose, onConfirm, message }) => {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm" onClick={onClose}></div>
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden animate-[scale-in_0.2s_ease-out]">
        <div className="p-6">
          <div className="flex items-start gap-4 mb-4">
            <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center shrink-0">
              <MessageCircle className="text-emerald-600" size={20} />
            </div>
            <div>
              <h3 className="text-lg font-bold text-slate-800">{t.reminderConfirm.title}</h3>
              <p className="text-sm text-slate-500">{t.reminderConfirm.subtitle}</p>
            </div>
          </div>
          <p className="text-sm text-slate-600 bg-slate-50 p-4 rounded-lg border border-slate-200 whitespace-pre-wrap mb-6">
            {message}
          </p>
          <div className="flex gap-3">
            <button onClick={onClose} className="flex-1 py-2.5 px-4 bg-slate-100 text-slate-700 rounded-xl font-medium hover:bg-slate-200 transition-colors">
              {t.cancel}
            </button>
            <button onClick={() => { onConfirm(); onClose(); }} className="flex-1 py-2.5 px-4 bg-emerald-600 text-white rounded-xl font-medium hover:bg-emerald-700 transition-colors shadow-lg shadow-emerald-500/30">
              {t.reminderConfirm.send}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReminderConfirmModal;