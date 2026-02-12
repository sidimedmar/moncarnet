import React, { useState, useRef } from 'react';
import { X, Store, Phone, MessageCircle, Check, Image as ImageIcon, Trash, Cloud, Download, Upload } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';
import { MerchantConfig } from '../types';

interface AboutModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const AboutModal: React.FC<AboutModalProps> = ({ isOpen, onClose }) => {
  const { t } = useLanguage();
  const [saved, setSaved] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const backupInputRef = useRef<HTMLInputElement>(null);

  const [config, setConfig] = useState<MerchantConfig>(() => {
    if (typeof window !== 'undefined') {
      const savedConfig = localStorage.getItem('dev_contact_config');
      if (savedConfig) {
        try {
          return JSON.parse(savedConfig);
        } catch (e) { console.error("Failed to parse config", e); }
      }
    }
    return { name: "Mon Magasin", phone: "", whatsapp: "", address: "" };
  });

  const handleSave = () => {
    localStorage.setItem('dev_contact_config', JSON.stringify(config));
    window.dispatchEvent(new Event('config-updated'));
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setConfig({ ...config, [e.target.name]: e.target.value });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onloadend = () => {
        setConfig(prev => ({ ...prev, logo: reader.result as string }));
      };
      reader.readAsDataURL(file);
    }
  };

  const removeLogo = () => {
    setConfig(prev => ({ ...prev, logo: undefined }));
    if (fileInputRef.current) fileInputRef.current.value = '';
  };
  
  const handleExportData = () => {
    const data = {
        debts: localStorage.getItem('debts_v2'),
        config: localStorage.getItem('dev_contact_config')
    };
    const blob = new Blob([JSON.stringify(data)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `backup_carnet_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  const handleImportData = (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) {
          const reader = new FileReader();
          reader.onload = (event) => {
              try {
                  const data = JSON.parse(event.target?.result as string);
                  if(data.debts) localStorage.setItem('debts_v2', data.debts);
                  if(data.config) localStorage.setItem('dev_contact_config', data.config);
                  window.location.reload(); // Reload to apply changes
              } catch (err) {
                  alert("Fichier de sauvegarde invalide");
              }
          };
          reader.readAsText(file);
      }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity" 
        onClick={onClose}
      ></div>
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-sm relative z-10 overflow-hidden animate-[scale-in_0.2s_ease-out] max-h-[90vh] flex flex-col">
        <div className="bg-slate-900 px-6 py-4 flex justify-between items-center text-white shrink-0">
          <div className="flex items-center gap-2">
            <Store size={20} className="text-amber-400"/>
            <h2 className="text-lg font-bold">{t.about.title}</h2>
          </div>
          <button onClick={onClose} className="text-white/70 hover:text-white bg-white/10 rounded-full p-1">
            <X size={20} />
          </button>
        </div>

        <div className="p-6 overflow-y-auto">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 mb-4 space-y-4">
            <div className="text-center mb-4">
              <label className="block text-xs font-bold text-slate-500 uppercase mb-2">{t.about.logoLabel}</label>
              <div className="flex justify-center">
                {config.logo ? (
                  <div className="relative group">
                    <img src={config.logo} alt="Logo" className="w-24 h-24 object-contain rounded-lg border border-slate-200 bg-white" />
                    <button onClick={removeLogo} className="absolute -top-2 -right-2 bg-red-500 text-white p-1 rounded-full shadow-md hover:bg-red-600 transition-colors">
                      <Trash size={14} />
                    </button>
                  </div>
                ) : (
                  <button 
                    onClick={() => fileInputRef.current?.click()}
                    className="w-24 h-24 rounded-lg border-2 border-dashed border-slate-300 flex flex-col items-center justify-center text-slate-400 hover:border-primary-500 hover:text-primary-500 hover:bg-primary-50 transition-all"
                  >
                    <ImageIcon size={24} className="mb-1" />
                    <span className="text-[10px] font-medium">{t.about.uploadLogo}</span>
                  </button>
                )}
                <input ref={fileInputRef} type="file" accept="image/*" onChange={handleLogoUpload} className="hidden" />
              </div>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 ms-1">{t.about.shopName}</label>
              <input type="text" name="name" value={config.name} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm font-bold text-slate-800" placeholder="Ma Boutique"/>
            </div>

            <div>
              <label className="text-xs font-bold text-slate-500 ms-1">{t.about.address}</label>
              <input type="text" name="address" value={config.address} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm" placeholder="Nouakchott, TVZ"/>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-xs font-bold text-slate-500 ms-1">{t.about.phoneLabel}</label>
                <input type="tel" name="phone" value={config.phone} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm" placeholder="Ex: 40..." style={{ direction: 'ltr' }}/>
              </div>
              <div>
                <label className="text-xs font-bold text-slate-500 ms-1">{t.about.whatsappLabel}</label>
                <input type="tel" name="whatsapp" value={config.whatsapp} onChange={handleChange} className="w-full bg-white border border-slate-200 rounded-lg p-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm" placeholder="Ex: 40..." style={{ direction: 'ltr' }}/>
              </div>
            </div>
            
             <button onClick={handleSave} className={`w-full py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all shadow-md ${saved ? 'bg-emerald-600 text-white' : 'bg-slate-900 text-white hover:bg-slate-800'}`}>
                {saved ? <Check size={18}/> : null} {saved ? t.about.settingsSaved : t.about.saveSettings}
             </button>
          </div>
          
          <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 mb-4">
               <div className="flex items-center gap-2 mb-3">
                   <Cloud className="text-blue-600" size={18} />
                   <h3 className="font-bold text-blue-900 text-sm">Sauvegarde Cloud / Admin</h3>
               </div>
               <div className="grid grid-cols-2 gap-3">
                   <button onClick={handleExportData} className="flex flex-col items-center justify-center gap-1 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                       <Download size={16} className="text-blue-500"/>
                       <span className="text-xs font-bold text-blue-700">Exporter</span>
                   </button>
                   <button onClick={() => backupInputRef.current?.click()} className="flex flex-col items-center justify-center gap-1 p-3 bg-white border border-blue-200 rounded-lg hover:bg-blue-50 transition-colors">
                       <Upload size={16} className="text-blue-500"/>
                       <span className="text-xs font-bold text-blue-700">Importer</span>
                   </button>
                   <input ref={backupInputRef} type="file" accept=".json" onChange={handleImportData} className="hidden" />
               </div>
          </div>
          
          <div className="mt-8 border-t border-slate-100 pt-6">
            <p className="text-xs text-center text-slate-400 mb-4 uppercase font-bold tracking-widest">{t.about.developer}</p>
            <div className="grid grid-cols-2 gap-3">
              <a href="tel:22241000000" className="flex flex-col items-center justify-center gap-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:border-primary-500 hover:text-primary-600 hover:bg-white transition-all active:scale-95">
                <Phone size={18} />
                <span className="text-xs font-bold">{t.about.contactBtn}</span>
              </a>
              <a href="https://wa.me/22241000000" target="_blank" rel="noreferrer" className="flex flex-col items-center justify-center gap-2 py-3 bg-slate-50 border border-slate-200 rounded-xl text-slate-600 hover:border-emerald-500 hover:text-emerald-600 hover:bg-white transition-all active:scale-95">
                <MessageCircle size={18} />
                <span className="text-xs font-bold">{t.about.whatsappBtn}</span>
              </a>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AboutModal;