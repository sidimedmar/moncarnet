import React, { useState, useEffect } from 'react';
import { X, Code, Phone, MessageCircle, Check } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);

  const [config, setConfig] = useState(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('dev_contact_config');
      if (savedConfig) {
        try {
          return JSON.parse(savedConfig);
        } catch (e) { console.error("Failed to parse config", e); }
      }
    }
    return { name: "Agence Digitale MRU", phone: "40000000", whatsapp: "40000000" };
  });

  const handleSave = () => {
    localStorage.setItem('dev_contact_config', JSON.stringify(config));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden animate-[scale-in_0.2s_ease-out] max-h-[90vh] flex flex-col">
        <div className="bg-gradient-to-br from-primary-800 to-primary-900 px-6 py-8 text-white text-center relative overflow-hidden">
          <div className="absolute top-0 end-0 -me-8 -mt-8 w-32 h-32 rounded-full bg-white/10 blur-2xl pointer-events-none"></div>
          
          <button 
            onClick={onClose} 
            className="absolute top-4 end-4 text-white/70 hover:text-white transition-colors bg-white/10 rounded-full p-1"
          >
            <X size={20} />
          </button>

          <div className="bg-white/20 w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-4 backdrop-blur-sm shadow-lg transform rotate-3">
            <Code size={32} className="text-white" />
          </div>
          <h2 className="text-xl font-bold mb-1">{t.appTitle}</h2>
          <p className="text-slate-300 text-sm font-medium">{t.about.version}</p>
        </div>

        <div className="p-6 overflow-y-auto">
          <p className="text-slate-600 text-center mb-6 text-sm leading-relaxed">
            {t.about.desc}
          </p>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4">
            <p className="text-xs text-slate-400 font-bold uppercase tracking-wider text-center mb-3">
              {t.about.settings}
            </p>
            <div className="space-y-3">
              <div>
                <label className="text-xs font-bold text-slate-500 ms-1">{t.about.phoneLabel}</label>
                <input type="tel" name="phone" value={config.phone} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"/>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 ms-1">{t.about.whatsappLabel}</label>
                <input type="tel" name="whatsapp" value={config.whatsapp} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm"/>
              </div>
            </div>
             <button onClick={handleSave} className={`w-full mt-3 py-2.5 rounded-lg font-bold flex items-center justify-center gap-2 transition-all ${saved ? 'bg-emerald-600 text-white' : 'bg-primary-600 text-white hover:bg-primary-700'}`}>
                {saved ? <Check size={16}/> : null} {saved ? t.about.settingsSaved : t.about.saveSettings}
             </button>
          </div>
          
          <div className="grid grid-cols-2 gap-3 mb-4">
              <a href={`tel:222${config.phone}`} className="flex flex-col items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-primary-500 hover:text-primary-600 hover:bg-primary-50 transition-all group active:scale-95">
                <Phone size={20} className="text-slate-400 group-hover:text-primary-500" />
                <span className="text-xs font-bold">{t.about.contactBtn}</span>
              </a>
              <a href={`https://wa.me/222${config.whatsapp}?text=${encodeURIComponent("Salam, je suis intéressé par votre application de gestion de dettes.")}`} target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2 py-3 bg-white border border-slate-200 rounded-lg text-slate-700 hover:border-emerald-500 hover:text-emerald-600 hover:bg-emerald-50 transition-all group active:scale-95">
                <MessageCircle size={20} className="text-slate-400 group-hover:text-emerald-500" />
                <span className="text-xs font-bold">{t.about.whatsappBtn}</span>
              </a>
            </div>

          <button 
            onClick={onClose}
            className="w-full py-3 bg-slate-100 text-slate-600 font-bold rounded-xl hover:bg-slate-200 transition-colors"
          >
            {t.cancel}
          </button>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;