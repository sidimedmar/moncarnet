import React from 'react';
import { Wallet, Languages, Info } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

interface HeaderProps {
  onOpenAbout: () => void;
}

const Header: React.FC<HeaderProps> = ({ onOpenAbout }) => {
  const { t, language, setLanguage } = useLanguage();

  return (
    <header className="bg-white shadow-sm sticky top-0 z-20">
      <div className="max-w-3xl mx-auto px-4 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="bg-primary-100 p-2 rounded-lg text-primary-600 shadow-sm shadow-primary-500/10">
            <Wallet size={24} />
          </div>
          <h1 className="text-xl font-bold text-slate-800 tracking-tight">{t.appTitle}</h1>
        </div>
        
        <div className="flex items-center gap-2">
          <button 
            onClick={() => setLanguage(language === 'fr' ? 'ar' : 'fr')}
            className="flex items-center gap-2 px-3 py-2 rounded-full bg-slate-50 text-slate-600 hover:bg-slate-100 transition-colors text-sm font-medium border border-slate-200 active:scale-95 transform"
          >
            <Languages size={18} />
            <span className="hidden xs:inline">{language === 'fr' ? 'ع' : 'Fr'}</span>
          </button>

          <button 
            onClick={onOpenAbout}
            className="p-2 rounded-full bg-slate-50 text-slate-600 hover:bg-primary-50 hover:text-primary-600 transition-colors border border-slate-200 active:scale-95 transform"
            title={t.about.title}
          >
            <Info size={20} />
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;