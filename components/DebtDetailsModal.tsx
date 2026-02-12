import React, { useState, useEffect } from 'react';
import { X, Calendar, Share2, TrendingDown, TrendingUp, Check, FileDown, Printer, Store, Receipt, AlertOctagon, ShieldAlert } from 'lucide-react';
import { Debt, MerchantConfig } from '../types';
import { useLanguage } from '../contexts/LanguageContext';
import { jsPDF } from "jspdf";

interface DebtDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  debt: Debt | null;
  onToggleContentious: (id: number) => void;
}

const DebtDetailsModal: React.FC<DebtDetailsModalProps> = ({ isOpen, onClose, debt, onToggleContentious }) => {
  const { t, dir, formatMoney } = useLanguage();
  const [merchantConfig, setMerchantConfig] = useState<MerchantConfig>({ name: "", phone: "", whatsapp: "" });
  const [viewMode, setViewMode] = useState<'INVOICE' | 'TICKET'>('INVOICE');

  useEffect(() => {
    if (isOpen) {
      const savedConfig = localStorage.getItem('dev_contact_config');
      if (savedConfig) {
        try {
          setMerchantConfig(JSON.parse(savedConfig));
        } catch (e) { console.error("Error loading config", e); }
      }
    }
  }, [isOpen]);

  if (!isOpen || !debt) return null;

  const handleShare = () => {
    const shopName = merchantConfig.name || "Mon Carnet Pro";
    const text = `*FACTURE ${shopName}*\nClient: ${debt.nom}\nReste: ${formatMoney(debt.montant)}`;
    window.open(`https://wa.me/${debt.tel}?text=${encodeURIComponent(text)}`, '_blank');
  };
  
  const handlePrint = () => window.print();

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    const shopName = merchantConfig.name || "Mon Carnet Pro";
    
    // Simple PDF generation using standard fonts
    doc.setFontSize(22);
    doc.text(shopName, 20, 20);
    
    doc.setFontSize(12);
    doc.text(`Date: ${new Date().toLocaleDateString()}`, 20, 30);
    doc.text(`Client: ${debt.nom}`, 20, 40);
    doc.text(`Tel: ${debt.tel}`, 20, 46);
    
    doc.line(20, 50, 190, 50);
    
    let y = 60;
    doc.setFontSize(10);
    doc.text("Date", 20, y);
    doc.text("Description", 60, y);
    doc.text("Montant", 150, y);
    y += 5;
    
    // Sort transactions by date (newest first)
    const sortedTransactions = [...debt.transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

    sortedTransactions.forEach(tr => {
      const type = tr.type === 'CREDIT' ? '+' : '-';
      doc.text(new Date(tr.date).toLocaleDateString(), 20, y);
      const desc = tr.description ? tr.description.substring(0, 30) : (tr.type === 'CREDIT' ? t.transaction.credit : t.transaction.payment);
      doc.text(desc, 60, y);
      doc.text(`${type} ${tr.amount}`, 150, y);
      y += 7;
    });
    
    doc.line(20, y, 190, y);
    y += 10;
    doc.setFontSize(14);
    doc.text(`TOTAL A PAYER: ${debt.montant} MRU`, 20, y);
    
    doc.save(`Facture_${debt.nom}.pdf`);
  };

  const isContentious = debt.status === 'CONTENTIOUS';

  return (
    <>
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 print:p-0 print:static print:block print:bg-white">
      <div 
        className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity print:hidden" 
        onClick={onClose}
      ></div>
      
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-lg relative z-10 overflow-hidden flex flex-col max-h-[90vh] animate-[scale-in_0.2s_ease-out] print:shadow-none print:max-h-none print:animate-none print:w-full print:max-w-none print:rounded-none">
        
        {/* Header Actions - Hidden in Print */}
        <div className="bg-slate-50 px-6 py-4 border-b border-slate-100 flex justify-between items-center shrink-0 print:hidden">
          <div className="flex gap-2">
            <button 
                onClick={() => setViewMode('INVOICE')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'INVOICE' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
            >
                Facture A4
            </button>
            <button 
                onClick={() => setViewMode('TICKET')}
                className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all ${viewMode === 'TICKET' ? 'bg-slate-800 text-white' : 'bg-white text-slate-500 border border-slate-200'}`}
            >
                Ticket
            </button>
          </div>
          <button onClick={onClose} className="p-2 -me-2 text-slate-400 hover:text-slate-600">
            <X size={24} />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto bg-slate-100 print:bg-white print:overflow-visible h-full flex justify-center p-4">
            
            {viewMode === 'INVOICE' ? (
                /* Invoice Layout (A4 style) */
                <div className="bg-white p-8 shadow-sm border border-slate-200 rounded-none w-full max-w-[210mm] min-h-[297mm] print:w-full print:border-none print:shadow-none print:p-8">
                    {/* Invoice Header */}
                    <div className="flex justify-between items-start border-b-2 border-slate-100 pb-6 mb-6">
                        <div className="flex items-start gap-4">
                            {merchantConfig.logo ? (
                                <img src={merchantConfig.logo} alt="Logo" className="w-20 h-20 object-contain rounded-lg border border-slate-100 print:w-24 print:h-24" />
                            ) : (
                                <div className="w-16 h-16 bg-slate-100 rounded-lg flex items-center justify-center text-slate-400 print:hidden">
                                    <Store size={32}/>
                                </div>
                            )}
                            <div>
                                <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">{merchantConfig.name || "Mon Magasin"}</h1>
                                <div className="text-sm text-slate-500 mt-1 space-y-0.5">
                                    {merchantConfig.address && <p>{merchantConfig.address}</p>}
                                    {merchantConfig.phone && <p>{merchantConfig.phone}</p>}
                                </div>
                            </div>
                        </div>
                        <div className="text-end">
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-wider">{t.invoiceTitle}</p>
                            <p className="text-2xl font-black text-slate-900">{new Date().toLocaleDateString()}</p>
                        </div>
                    </div>

                    {/* Customer Info */}
                    <div className="mb-8 p-4 bg-slate-50 rounded-lg border border-slate-100 print:bg-transparent print:border-slate-200">
                        <div className="flex justify-between items-center">
                            <div>
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">CLIENT</p>
                                <h3 className="text-xl font-bold text-slate-800">{debt.nom}</h3>
                                <p className="text-slate-600">{debt.tel}</p>
                            </div>
                            {isContentious && (
                                <div className="px-4 py-2 bg-red-100 text-red-700 border border-red-200 rounded-lg text-sm font-bold uppercase flex items-center gap-2">
                                    <AlertOctagon size={16} /> CONTENTIEUX
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Transaction Table */}
                    <table className="w-full text-sm text-left mb-8">
                        <thead className="text-xs text-slate-500 uppercase bg-slate-50 border-b border-slate-200 print:bg-transparent">
                            <tr>
                                <th className="px-3 py-3 font-bold">{t.fields.date}</th>
                                <th className="px-3 py-3 font-bold">{t.fields.description}</th>
                                <th className="px-3 py-3 font-bold text-end">{t.fields.amount}</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {[...debt.transactions].sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).map((tr) => (
                                <tr key={tr.id}>
                                    <td className="px-3 py-3 text-slate-500 whitespace-nowrap">{new Date(tr.date).toLocaleDateString()}</td>
                                    <td className="px-3 py-3 text-slate-800 font-medium">
                                        <div className="flex items-center gap-2">
                                            <span className={`w-2 h-2 rounded-full ${tr.type === 'CREDIT' ? 'bg-red-500' : 'bg-green-500'}`}></span>
                                            {tr.type === 'CREDIT' ? t.transaction.credit : t.transaction.payment}
                                            {tr.description && <span className="text-slate-500 font-normal"> - {tr.description}</span>}
                                        </div>
                                    </td>
                                    <td className={`px-3 py-3 text-end font-bold ${tr.type === 'CREDIT' ? 'text-red-600' : 'text-green-600'}`}>
                                        {tr.type === 'CREDIT' ? '+' : '-'}{formatMoney(tr.amount)}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {/* Total Footer */}
                    <div className="flex justify-end border-t-2 border-slate-900 pt-4">
                        <div className="text-end">
                            <p className="text-sm font-bold text-slate-500 uppercase">{t.payment.newBalance}</p>
                            <p className="text-4xl font-black text-slate-900 tracking-tighter">{formatMoney(debt.montant)}</p>
                        </div>
                    </div>
                </div>
            ) : (
                /* Ticket Layout (Thermal Printer Style) */
                <div className="bg-white p-4 shadow-sm w-[80mm] min-h-[100mm] font-mono text-xs print:w-[80mm] print:shadow-none mx-auto">
                    <div className="text-center mb-4 border-b border-dashed border-black pb-4">
                         <h2 className="text-lg font-bold">{merchantConfig.name}</h2>
                         <p>{merchantConfig.phone}</p>
                         <p>{new Date().toLocaleString()}</p>
                    </div>
                    <div className="mb-4">
                        <p>Client: {debt.nom}</p>
                        <p>Tel: {debt.tel}</p>
                    </div>
                    <div className="border-b border-dashed border-black mb-2"></div>
                    {debt.transactions.sort((a,b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 8).map(tr => (
                        <div key={tr.id} className="flex justify-between mb-1">
                            <span>{tr.type === 'CREDIT' ? 'Dette' : 'Payé'}</span>
                            <span>{tr.amount}</span>
                        </div>
                    ))}
                    <div className="border-b border-dashed border-black my-2"></div>
                    <div className="flex justify-between text-lg font-bold">
                        <span>TOTAL</span>
                        <span>{debt.montant}</span>
                    </div>
                    <div className="text-center mt-6">
                        <p>Merci de votre visite!</p>
                    </div>
                </div>
            )}
        </div>

        {/* Actions Footer - Hidden in Print */}
        <div className="p-4 border-t border-slate-100 bg-white shrink-0 grid grid-cols-2 gap-3 print:hidden">
             <button 
                onClick={() => onToggleContentious(debt.id)}
                className={`py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all border ${isContentious ? 'bg-slate-50 text-slate-600 border-slate-200' : 'bg-red-50 text-red-600 border-red-100 hover:bg-red-100'}`}
                title="Déclarer contentieux"
            >
                <ShieldAlert size={18} />
                <span className="hidden sm:inline">{isContentious ? 'Retirer Contentieux' : 'Contentieux'}</span>
            </button>
            <button 
                onClick={handlePrint}
                className="py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-slate-900 text-white hover:bg-slate-800 shadow-lg"
            >
                {viewMode === 'INVOICE' ? <Printer size={18} /> : <Receipt size={18} />}
                <span>{viewMode === 'INVOICE' ? 'Imprimer' : 'Imprimer Ticket'}</span>
            </button>
            <button 
                onClick={handleDownloadPDF}
                className="py-3 rounded-xl font-bold flex items-center justify-center gap-2 transition-all bg-emerald-600 text-white hover:bg-emerald-700 shadow-emerald-500/20 shadow-lg col-span-2"
            >
                <FileDown size={18} />
                <span>Générer Facture PDF</span>
            </button>
        </div>

      </div>
    </div>
    
    <style>{`
        @media print {
            body > *:not(#root) { display: none; }
            #root > *:not(.fixed) { display: none; }
            @page { margin: 0; }
        }
    `}</style>
    </>
  );
};

export default DebtDetailsModal;