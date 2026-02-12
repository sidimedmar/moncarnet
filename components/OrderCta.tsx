import React, { useState, useEffect } from 'react';
import { ShieldCheck } from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const OrderCta: React.FC = () => {
  const { t } = useLanguage();
  const [formData, setFormData] = useState({
    fullName: '',
    shopName: '',
    whatsappNumber: ''
  });
  
  const [devWhatsapp, setDevWhatsapp] = useState("40000000"); // Default without country code

  useEffect(() => {
    const loadConfig = () => {
      const savedConfig = localStorage.getItem('dev_contact_config');
      if (savedConfig) {
        try {
          const config = JSON.parse(savedConfig);
          if (config.whatsapp) {
            setDevWhatsapp(config.whatsapp);
          }
        } catch (e) {
          console.error("Failed to parse contact config for CTA", e);
        }
      }
    };

    loadConfig(); // Charger la config au montage

    window.addEventListener('config-updated', loadConfig); // Écouter les mises à jour

    return () => {
      window.removeEventListener('config-updated', loadConfig); // Nettoyer l'écouteur
    };
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    const message = t.cta.whatsappMessage
      .replace('{fullName}', formData.fullName)
      .replace('{shopName}', formData.shopName)
      .replace('{whatsappNumber}', formData.whatsappNumber);
    
    // Add country code prefix consistently
    const whatsappUrl = `https://wa.me/222${devWhatsapp}?text=${encodeURIComponent(message)}`;
    
    window.open(whatsappUrl, '_blank');
  };

  return (
    <div className="bg-primary-800 rounded-2xl p-6 sm:p-8 text-white shadow-lg my-8">
      <div className="flex items-center gap-3 mb-2">
        <ShieldCheck className="text-amber-400" size={28} />
        <h2 className="text-2xl font-bold">{t.cta.title}</h2>
      </div>
      <p className="text-primary-100 mb-6">{t.cta.subtitle}</p>

      <form onSubmit={handleSubmit} className="space-y-4">
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleInputChange}
          placeholder={t.cta.fullName}
          required
          className="w-full bg-white/90 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 border-2 border-transparent focus:border-amber-400 focus:ring-0 outline-none transition"
        />
        <input
          type="text"
          name="shopName"
          value={formData.shopName}
          onChange={handleInputChange}
          placeholder={t.cta.shopName}
          required
          className="w-full bg-white/90 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 border-2 border-transparent focus:border-amber-400 focus:ring-0 outline-none transition"
        />
        <input
          type="tel"
          name="whatsappNumber"
          value={formData.whatsappNumber}
          onChange={handleInputChange}
          placeholder={t.cta.whatsappNumber}
          required
          className="w-full bg-white/90 text-slate-800 placeholder-slate-400 rounded-xl px-4 py-3 border-2 border-transparent focus:border-amber-400 focus:ring-0 outline-none transition"
        />
        <button
          type="submit"
          className="w-full bg-amber-400 text-primary-900 font-extrabold text-lg py-4 rounded-xl shadow-lg hover:brightness-105 transition-all active:scale-95 transform"
        >
          {t.cta.orderButton} 🚀
        </button>
      </form>
    </div>
  );
};

export default OrderCta;