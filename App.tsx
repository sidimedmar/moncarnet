import React, { useState, useMemo, useEffect } from 'react';
import { Plus, Search, Filter, Calendar, FileDown, Trash2, X, CheckSquare, Bell } from 'lucide-react';
import Header from './components/Header';
import SummaryCard from './components/SummaryCard';
import DebtCard from './components/DebtCard';
import AddDebtModal from './components/AddDebtModal';
import PaymentModal from './components/PaymentModal';
import ConfirmModal from './components/ConfirmModal';
import AboutModal from './components/AboutModal';
import DebtDetailsModal from './components/DebtDetailsModal';
import OrderCta from './components/OrderCta';
import ReminderConfirmModal from './components/ReminderConfirmModal';
import { Debt, SortOption } from './types';
import { LanguageProvider, useLanguage } from './contexts/LanguageContext';

const daysAgo = (days: number) => {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return d.toISOString().split('T')[0];
};

const INITIAL_DATA: Debt[] = [
  { id: 1, nom: "Ahmed Ould Sidi", montant: 5500, date: daysAgo(45), tel: "22244444444", status: 'ACTIVE', isPaid: false, transactions: [{ id: 101, type: 'CREDIT', amount: 6000, date: daysAgo(45), description: "Riz 50kg, Sucre 10kg" }, { id: 102, type: 'PAYMENT', amount: 500, date: daysAgo(10) }] },
  { id: 2, nom: "Mariem Mint Ahmed", montant: 1200, date: daysAgo(12), tel: "22233333333", status: 'ACTIVE', isPaid: false, transactions: [{ id: 201, type: 'CREDIT', amount: 1200, date: daysAgo(12), description: "Voile" }] },
  { id: 3, nom: "Oumar Diop", montant: 8000, date: daysAgo(25), tel: "22222222222", status: 'ACTIVE', isPaid: false, transactions: [{ id: 301, type: 'CREDIT', amount: 8000, date: daysAgo(25), description: "Ciment" }] },
];

const AppContent: React.FC = () => {
  const { t, dir, formatMoney } = useLanguage();
  
  const [debts, setDebts] = useState<Debt[]>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('debts_v2');
      if (saved) {
        try { return JSON.parse(saved); } catch (e) { console.error("Failed to parse debts", e); }
      }
    }
    return INITIAL_DATA;
  });

  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isAboutModalOpen, setIsAboutModalOpen] = useState(false);
  const [paymentModalDebtId, setPaymentModalDebtId] = useState<number | null>(null);
  const [deleteModalDebtId, setDeleteModalDebtId] = useState<number | null>(null);
  const [detailsModalDebtId, setDetailsModalDebtId] = useState<number | null>(null);
  const [isBulkDeleteModalOpen, setIsBulkDeleteModalOpen] = useState(false);
  const [reminderModalData, setReminderModalData] = useState<{ debt: Debt; type: 'soft' | 'firm' } | null>(null);
  
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('date-asc');
  const [dateRange, setDateRange] = useState({ start: '', end: '' });
  const [statusFilter, setStatusFilter] = useState<'ALL' | 'ACTIVE' | 'CONTENTIOUS' | 'PAID'>('ALL');

  const [isSelectionMode, setIsSelectionMode] = useState(false);
  const [selectedDebtIds, setSelectedDebtIds] = useState<Set<number>>(new Set());

  useEffect(() => {
    localStorage.setItem('debts_v2', JSON.stringify(debts));
  }, [debts]);
  
  // Toast Timer
  useEffect(() => {
    if (toastMessage) {
      const timer = setTimeout(() => setToastMessage(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toastMessage]);

  const showToast = (msg: string) => setToastMessage(msg);

  const addDebt = (newDebt: Omit<Debt, 'id' | 'isPaid' | 'transactions' | 'status'> & { description: string }) => {
    const debt: Debt = {
      ...newDebt,
      id: Date.now(),
      status: 'ACTIVE',
      isPaid: false,
      transactions: [{ 
        id: Date.now(), 
        type: 'CREDIT', 
        amount: newDebt.montant, 
        date: newDebt.date,
        description: newDebt.description 
      }]
    };
    setDebts(prev => [debt, ...prev]);
    showToast("Nouveau crédit ajouté !");
  };

  const handlePayment = (amountPaid: number, description?: string) => {
    if (paymentModalDebtId === null) return;
    setDebts(prev => prev.map(d => {
      if (d.id !== paymentModalDebtId) return d;
      const newAmount = d.montant - amountPaid;
      const newTransaction = { 
        id: Date.now(), 
        type: 'PAYMENT' as const, 
        amount: amountPaid, 
        date: new Date().toISOString(),
        description: description 
      };
      return { 
          ...d, 
          montant: Math.max(0, newAmount), 
          isPaid: newAmount <= 0, 
          status: newAmount <= 0 ? 'PAID' : d.status,
          transactions: [...d.transactions, newTransaction] 
      };
    }));
    setPaymentModalDebtId(null);
    showToast(`Paiement de ${formatMoney(amountPaid)} enregistré !`);
  };
  
  const toggleContentious = (id: number) => {
      setDebts(prev => prev.map(d => {
          if (d.id !== id) return d;
          const newStatus = d.status === 'CONTENTIOUS' ? 'ACTIVE' : 'CONTENTIOUS';
          return { ...d, status: newStatus };
      }));
  };

  const initiateDelete = (id: number) => setDeleteModalDebtId(id);
  const confirmDelete = () => {
    if (deleteModalDebtId !== null) {
      setDebts(prev => prev.filter(d => d.id !== deleteModalDebtId));
      setDeleteModalDebtId(null);
      showToast("Dette supprimée.");
    }
  };
  
  const filteredDebts = useMemo(() => {
    return debts
      .filter(d => {
          if (statusFilter === 'ALL') return !d.isPaid && d.status !== 'PAID'; // Show active & contentious
          if (statusFilter === 'PAID') return d.isPaid || d.status === 'PAID';
          return d.status === statusFilter;
      })
      .filter(d => {
          const search = searchTerm.toLowerCase();
          const inTransactions = d.transactions.some(t => t.description?.toLowerCase().includes(search));
          return d.nom.toLowerCase().includes(search) || 
                 d.tel.includes(search) ||
                 d.date.includes(search) ||
                 inTransactions;
      })
      .filter(d => {
        if (!dateRange.start || !dateRange.end) return true;
        const debtDate = new Date(d.date).getTime();
        const startDate = new Date(dateRange.start).getTime();
        const endDate = new Date(dateRange.end).getTime() + (24 * 60 * 60 * 1000 - 1);
        return debtDate >= startDate && debtDate <= endDate;
      })
      .sort((a, b) => {
        switch (sortBy) {
          case 'amount-desc': return b.montant - a.montant;
          case 'amount-asc': return a.montant - b.montant;
          case 'date-desc': return new Date(b.date).getTime() - new Date(a.date).getTime();
          case 'date-credit-asc': {
            const dateA = a.transactions.find(tx => tx.type === 'CREDIT')?.date || a.date;
            const dateB = b.transactions.find(tx => tx.type === 'CREDIT')?.date || b.date;
            return new Date(dateA).getTime() - new Date(dateB).getTime();
          }
          case 'date-credit-desc': {
            const dateA = a.transactions.find(tx => tx.type === 'CREDIT')?.date || a.date;
            const dateB = b.transactions.find(tx => tx.type === 'CREDIT')?.date || b.date;
            return new Date(dateB).getTime() - new Date(dateA).getTime();
          }
          case 'date-asc':
          default:
            return new Date(a.date).getTime() - new Date(b.date).getTime();
        }
      });
  }, [debts, searchTerm, sortBy, dateRange, statusFilter]);

  const handleToggleSelectDebt = (id: number) => {
    setSelectedDebtIds(prev => {
      const newSet = new Set(prev);
      if (newSet.has(id)) newSet.delete(id);
      else newSet.add(id);
      return newSet;
    });
  };

  const handleConfirmBulkDelete = () => {
    setDebts(prev => prev.filter(d => !selectedDebtIds.has(d.id)));
    setIsSelectionMode(false);
    setSelectedDebtIds(new Set());
    setIsBulkDeleteModalOpen(false);
    showToast("Sélection supprimée.");
  };
  
  const handleExportCSV = () => {
    const headers = ["ID", "Nom", "Montant Restant", "Date", "Téléphone"];
    const rows = filteredDebts.map(d => [d.id, `"${d.nom.replace(/"/g, '""')}"`, d.montant, d.date, d.tel].join(','));
    const csvContent = "data:text/csv;charset=utf-8," + [headers.join(','), ...rows].join('\n');
    const link = document.createElement("a");
    link.setAttribute("href", encodeURI(csvContent));
    link.setAttribute("download", `dettes_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleInitiateReminder = (debtId: number, type: 'soft' | 'firm') => {
    const debt = debts.find(d => d.id === debtId);
    if (debt) {
      setReminderModalData({ debt, type });
    }
  };
  
  const getReminderMessage = (debt: Debt, type: 'soft' | 'firm') => {
    const jours = Math.floor((new Date().getTime() - new Date(debt.date).getTime()) / (1000 * 60 * 60 * 24));
    let messageTemplate = type === 'soft' ? t.whatsapp.soft : t.whatsapp.firm;
    return messageTemplate
      .replace('{name}', debt.nom)
      .replace('{amount}', debt.montant.toString())
      .replace('{days}', jours.toString());
  };

  const handleSendReminder = () => {
    if (!reminderModalData) return;
    const { debt, type } = reminderModalData;
    const message = getReminderMessage(debt, type);
    const url = `https://wa.me/${debt.tel}?text=${encodeURIComponent(message)}`;
    window.open(url, '_blank');
  };

  const totalAmount = debts.filter(d => d.status !== 'PAID').reduce((acc, d) => acc + d.montant, 0);
  const totalCount = debts.filter(d => d.status !== 'PAID').length;

  // Calcul des statistiques du jour
  const today = new Date().toISOString().split('T')[0];
  const stats = useMemo(() => {
    let collected = 0;
    let credited = 0;
    debts.forEach(d => {
        d.transactions.forEach(t => {
            if (t.date.startsWith(today)) {
                if (t.type === 'PAYMENT') collected += t.amount;
                if (t.type === 'CREDIT') credited += t.amount;
            }
        });
    });
    return { collected, credited };
  }, [debts, today]);

  const selectedDebtForPayment = debts.find(d => d.id === paymentModalDebtId) || null;
  const selectedDebtForDetails = debts.find(d => d.id === detailsModalDebtId) || null;

  return (
    <div className="min-h-screen bg-slate-50 font-sans pb-48" dir={dir}>
      <Header onOpenAbout={() => setIsAboutModalOpen(true)} />
      
      {toastMessage && (
          <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 animate-fade-in-down">
              <div className="bg-slate-900 text-white px-6 py-3 rounded-full shadow-xl flex items-center gap-3">
                  <Bell size={18} className="text-amber-400" />
                  <span className="font-bold text-sm">{toastMessage}</span>
              </div>
          </div>
      )}
      
      <main className="max-w-3xl mx-auto px-4 pt-6 space-y-6">
        <SummaryCard 
            totalAmount={totalAmount} 
            totalCount={totalCount} 
            collectedToday={stats.collected}
            creditedToday={stats.credited}
        />

        <div className="space-y-4 sticky top-20 bg-slate-50/95 backdrop-blur z-10 py-2 -mx-4 px-4 sm:mx-0 sm:px-0">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400" size={20} />
              <input type="text" placeholder={t.searchPlaceholder} className="w-full ps-10 pe-4 py-3 bg-white border border-slate-200 rounded-xl focus:ring-2 focus:ring-primary-500 focus:border-transparent outline-none shadow-sm text-base" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
            </div>
            <div className="relative">
               <div className="absolute start-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none"><Filter size={16} /></div>
               <select className="w-full sm:w-auto appearance-none bg-white border border-slate-200 rounded-xl ps-10 pe-8 py-3 focus:ring-2 focus:ring-primary-500 outline-none shadow-sm text-base font-medium text-slate-700 cursor-pointer hover:border-slate-300" value={sortBy} onChange={(e) => setSortBy(e.target.value as SortOption)}>
                  <option value="date-asc">{t.sort.recentDelay}</option>
                  <option value="date-desc">{t.sort.oldest}</option>
                  <option value="amount-desc">{t.sort.amountDesc}</option>
                  <option value="amount-asc">{t.sort.amountAsc}</option>
                  <option value="date-credit-asc">{t.sort.oldestCredit}</option>
               </select>
            </div>
          </div>
          
          <div className="flex gap-2 overflow-x-auto pb-2 hide-scrollbar">
              <button onClick={() => setStatusFilter('ALL')} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap border ${statusFilter === 'ALL' ? 'bg-slate-800 text-white border-slate-800' : 'bg-white text-slate-500 border-slate-200'}`}>Tous</button>
              <button onClick={() => setStatusFilter('ACTIVE')} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap border ${statusFilter === 'ACTIVE' ? 'bg-primary-600 text-white border-primary-600' : 'bg-white text-slate-500 border-slate-200'}`}>En cours</button>
              <button onClick={() => setStatusFilter('CONTENTIOUS')} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap border ${statusFilter === 'CONTENTIOUS' ? 'bg-red-600 text-white border-red-600' : 'bg-white text-slate-500 border-slate-200'}`}>Contentieux</button>
              <button onClick={() => setStatusFilter('PAID')} className={`px-4 py-1.5 rounded-full text-sm font-bold whitespace-nowrap border ${statusFilter === 'PAID' ? 'bg-green-600 text-white border-green-600' : 'bg-white text-slate-500 border-slate-200'}`}>Payés/Archivés</button>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 items-center">
            <div className="flex-1 w-full sm:w-auto"><label className="text-xs font-bold text-slate-500 ms-1">{t.from}</label><input type="date" className="w-full bg-white border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm" value={dateRange.start} onChange={e => setDateRange({...dateRange, start: e.target.value})} /></div>
            <div className="flex-1 w-full sm:w-auto"><label className="text-xs font-bold text-slate-500 ms-1">{t.to}</label><input type="date" className="w-full bg-white border border-slate-200 rounded-xl p-2 focus:ring-2 focus:ring-primary-500 outline-none text-sm" value={dateRange.end} onChange={e => setDateRange({...dateRange, end: e.target.value})} /></div>
            <div className="flex self-end gap-2">
                <button onClick={() => setDateRange({start: '', end: ''})} className="px-3 py-2 bg-white border border-slate-200 text-slate-600 rounded-xl text-sm font-medium hover:bg-slate-50 h-full">{t.clear}</button>
                <button onClick={handleExportCSV} className="p-2 bg-white border border-slate-200 text-slate-600 rounded-xl hover:bg-slate-50" title={t.exportCSV}><FileDown size={20}/></button>
                <button onClick={() => setIsSelectionMode(!isSelectionMode)} className={`p-2 rounded-xl border font-medium flex items-center gap-2 ${isSelectionMode ? 'bg-red-50 text-red-700 border-red-200' : 'bg-white text-slate-600 border-slate-200'}`}><CheckSquare size={20}/> <span className="hidden sm:inline">{isSelectionMode ? t.cancelSelection : t.select}</span></button>
            </div>
          </div>
        </div>

        <div className="space-y-4">
          {filteredDebts.length > 0 ? (
            filteredDebts.map(debt => <DebtCard key={debt.id} debt={debt} onPay={(id) => setPaymentModalDebtId(id)} onDelete={initiateDelete} onViewDetails={setDetailsModalDebtId} onRemind={handleInitiateReminder} isSelectionMode={isSelectionMode} isSelected={selectedDebtIds.has(debt.id)} onToggleSelect={handleToggleSelectDebt} />)
          ) : (
            <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-slate-200">
              <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4"><Search className="text-slate-300" size={32} /></div>
              <h3 className="text-lg font-medium text-slate-800">{t.emptyState.title}</h3><p className="text-slate-400 text-sm mt-1">{t.emptyState.desc}</p>
            </div>
          )}
        </div>
        
        <OrderCta />

      </main>

      {!isSelectionMode && <button onClick={() => setIsAddModalOpen(true)} className="fixed bottom-6 end-6 bg-slate-900 text-white p-4 rounded-full shadow-xl hover:bg-slate-800 transition-transform hover:scale-105 active:scale-95 flex items-center justify-center z-40 active:shadow-md" aria-label={t.addDebt}><Plus size={24} /></button>}
      
      {isSelectionMode && selectedDebtIds.size > 0 && (
        <div className="fixed bottom-0 left-0 right-0 z-40 p-4 bg-white/80 backdrop-blur-sm border-t border-slate-200 shadow-lg animate-[slide-up_0.3s_ease-out]">
          <div className="max-w-3xl mx-auto flex justify-between items-center gap-4">
            <span className="text-sm font-bold text-slate-800">{t.itemsSelected.replace('{count}', selectedDebtIds.size.toString())}</span>
            <button onClick={() => setIsBulkDeleteModalOpen(true)} className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-xl text-sm font-bold hover:bg-red-700 shadow-md shadow-red-500/30"><Trash2 size={16}/> {t.deleteSelected}</button>
          </div>
        </div>
      )}

      <AddDebtModal isOpen={isAddModalOpen} onClose={() => setIsAddModalOpen(false)} onAdd={addDebt} />
      <PaymentModal isOpen={paymentModalDebtId !== null} debt={selectedDebtForPayment} onClose={() => setPaymentModalDebtId(null)} onConfirm={handlePayment} />
      <ConfirmModal isOpen={deleteModalDebtId !== null} onClose={() => setDeleteModalDebtId(null)} onConfirm={confirmDelete} />
      <AboutModal isOpen={isAboutModalOpen} onClose={() => setIsAboutModalOpen(false)} />
      <DebtDetailsModal isOpen={detailsModalDebtId !== null} onClose={() => setDetailsModalDebtId(null)} debt={selectedDebtForDetails} onToggleContentious={toggleContentious} />
      <ReminderConfirmModal 
        isOpen={reminderModalData !== null}
        onClose={() => setReminderModalData(null)}
        onConfirm={handleSendReminder}
        message={reminderModalData ? getReminderMessage(reminderModalData.debt, reminderModalData.type) : ''}
      />
      
      <ConfirmModal 
        isOpen={isBulkDeleteModalOpen}
        onClose={() => setIsBulkDeleteModalOpen(false)}
        onConfirm={handleConfirmBulkDelete}
        title={t.confirmDeleteSelectedTitle}
        message={t.confirmDeleteSelectedMessage.replace('{count}', selectedDebtIds.size.toString())}
      />
    </div>
  );
};

const App: React.FC = () => (<LanguageProvider><AppContent /></LanguageProvider>);
export default App;