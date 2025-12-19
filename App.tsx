import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Plus, 
  Trash2, 
  LayoutDashboard,
  ClipboardList,
  ArrowUpCircle,
  ArrowDownCircle,
  Receipt,
  Target,
  Menu,
  X,
  CheckCircle2,
  AlertTriangle
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { Transaction, TransactionType, FinancialSummary, AppTab } from './types';
import { SummaryCard } from './components/SummaryCard';
import { AddTransactionModal } from './components/AddTransactionModal';
import { FinancialAdvisor } from './components/FinancialAdvisor';

function App() {
  // --- State ---
  const [transactions, setTransactions] = useState<Transaction[]>(() => {
    const saved = localStorage.getItem('saldoFixo_transactions');
    return saved ? JSON.parse(saved) : [];
  });

  const [savingsGoal, setSavingsGoal] = useState<number>(() => {
    const saved = localStorage.getItem('saldoFixo_savings');
    return saved ? parseFloat(saved) : 0;
  });

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<AppTab>('dashboard');
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);
  const [editingSavings, setEditingSavings] = useState(false);
  const [tempSavings, setTempSavings] = useState('');

  // --- Effects ---
  useEffect(() => {
    localStorage.setItem('saldoFixo_transactions', JSON.stringify(transactions));
  }, [transactions]);

  useEffect(() => {
    localStorage.setItem('saldoFixo_savings', savingsGoal.toString());
  }, [savingsGoal]);

  // --- Logic ---
  const handleAddTransaction = (name: string, amount: number, type: TransactionType) => {
    const newTx: Transaction = {
      id: crypto.randomUUID(),
      name,
      amount,
      type,
      date: new Date().toISOString()
    };
    setTransactions(prev => [newTx, ...prev]);
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const summary: FinancialSummary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalFixedExpense = transactions
      .filter(t => t.type === 'fixed_expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalVariableExpense = transactions
      .filter(t => t.type === 'variable_expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = totalFixedExpense + totalVariableExpense;
    const balance = totalIncome - totalExpense;
    const remainingAfterSavings = balance - savingsGoal;

    let status: FinancialSummary['status'] = 'balanced';
    if (balance < 0) status = 'deficit';
    else if (remainingAfterSavings < 0) status = 'danger';
    else if (remainingAfterSavings > 0) status = 'surplus';

    return { 
      totalIncome, 
      totalFixedExpense, 
      totalVariableExpense, 
      totalExpense, 
      balance, 
      savingsGoal, 
      remainingAfterSavings, 
      status 
    };
  }, [transactions, savingsGoal]);

  const handleSaveSavings = () => {
    const val = parseFloat(tempSavings.replace(',', '.'));
    if (!isNaN(val)) setSavingsGoal(val);
    setEditingSavings(false);
  };

  // --- Filtered Data for Views ---
  const filteredTransactions = useMemo(() => {
    switch (activeTab) {
      case 'incomes': return transactions.filter(t => t.type === 'income');
      case 'fixed': return transactions.filter(t => t.type === 'fixed_expense');
      case 'variable': return transactions.filter(t => t.type === 'variable_expense');
      default: return transactions;
    }
  }, [transactions, activeTab]);

  const chartData = [
    { name: 'Entradas', value: summary.totalIncome, color: '#059669' },
    { name: 'Fixos', value: summary.totalFixedExpense, color: '#e11d48' },
    { name: 'Variáveis', value: summary.totalVariableExpense, color: '#f59e0b' },
  ].filter(d => d.value > 0);

  // --- Components ---
  const NavItem = ({ id, label, icon: Icon }: { id: AppTab; label: string; icon: any }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 ${
        activeTab === id 
          ? 'bg-indigo-50 text-indigo-700 font-semibold shadow-sm' 
          : 'text-slate-500 hover:bg-slate-50 hover:text-slate-700'
      }`}
    >
      <Icon size={20} className={activeTab === id ? 'text-indigo-600' : 'text-slate-400'} />
      <span className="text-sm">{label}</span>
    </button>
  );

  return (
    <div className="flex min-h-screen bg-slate-50 text-slate-800">
      
      {/* Sidebar Desktop */}
      <aside className={`fixed inset-y-0 left-0 z-40 w-64 bg-white border-r border-slate-200 transform transition-transform duration-300 lg:relative lg:translate-x-0 ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full'}`}>
        <div className="flex flex-col h-full p-4">
          <div className="flex items-center gap-3 px-2 py-6 mb-4">
            <div className="bg-indigo-600 p-2 rounded-lg shadow-lg shadow-indigo-200">
               <Wallet className="text-white w-6 h-6" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Saldo<span className="text-indigo-600">Fixo</span></h1>
          </div>

          <nav className="flex-1 space-y-1">
            <NavItem id="dashboard" label="Início" icon={LayoutDashboard} />
            <NavItem id="statement" label="Extrato" icon={ClipboardList} />
            <NavItem id="incomes" label="Entradas" icon={ArrowUpCircle} />
            <NavItem id="fixed" label="Fixos" icon={Receipt} />
            <NavItem id="variable" label="Variáveis" icon={ArrowDownCircle} />
            <NavItem id="goals" label="Metas" icon={Target} />
          </nav>

          <div className="mt-auto pt-6 border-t border-slate-100">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="w-full flex items-center justify-center gap-2 bg-slate-900 text-white py-3 rounded-xl font-semibold hover:bg-slate-800 transition-all shadow-md active:scale-95"
            >
              <Plus size={18} /> Novo Lançamento
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        
        {/* Top Header Mobile */}
        <header className="bg-white border-b border-slate-200 lg:hidden px-4 py-3 flex items-center justify-between sticky top-0 z-30">
          <div className="flex items-center gap-2">
            <button onClick={() => setIsSidebarOpen(!isSidebarOpen)} className="p-2 -ml-2 text-slate-500">
              {isSidebarOpen ? <X size={20} /> : <Menu size={20} />}
            </button>
            <span className="font-bold text-slate-900">SaldoFixo</span>
          </div>
          <button onClick={() => setIsModalOpen(true)} className="p-2 bg-indigo-600 text-white rounded-lg">
            <Plus size={20} />
          </button>
        </header>

        <main className="flex-1 overflow-y-auto p-4 md:p-8">
          <div className="max-w-4xl mx-auto space-y-6">
            
            {/* View Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-2">
               <h2 className="text-2xl font-bold text-slate-900 capitalize">
                 {activeTab === 'dashboard' && 'Visão Geral'}
                 {activeTab === 'statement' && 'Extrato Completo'}
                 {activeTab === 'incomes' && 'Minhas Entradas'}
                 {activeTab === 'fixed' && 'Despesas Fixas'}
                 {activeTab === 'variable' && 'Despesas Variáveis'}
                 {activeTab === 'goals' && 'Minhas Metas'}
               </h2>
               <div className="text-sm text-slate-500 font-medium">
                 {new Date().toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
               </div>
            </div>

            {/* Render Based on activeTab */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6 animate-fade-in">
                {/* Status Banner */}
                <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                  summary.status === 'deficit' ? 'bg-red-50 border-red-100 text-red-800' :
                  summary.status === 'danger' ? 'bg-orange-50 border-orange-100 text-orange-800' :
                  'bg-emerald-50 border-emerald-100 text-emerald-800'
                }`}>
                  <div className="mt-1">
                    {summary.status === 'surplus' ? <CheckCircle2 size={20} /> : <AlertTriangle size={20} />}
                  </div>
                  <div>
                    <h3 className="font-semibold">
                      {summary.status === 'deficit' && 'Déficit no Orçamento'}
                      {summary.status === 'danger' && 'Alerta de Reserva'}
                      {summary.status === 'surplus' && 'Saúde Financeira OK'}
                      {summary.status === 'balanced' && 'Orçamento Equilibrado'}
                    </h3>
                    <p className="text-sm opacity-90">
                      {summary.status === 'deficit' && `Você está R$ ${Math.abs(summary.balance).toFixed(2)} abaixo do planejado.`}
                      {summary.status === 'danger' && `Saldo positivo, mas faltam R$ ${Math.abs(summary.remainingAfterSavings).toFixed(2)} para a meta.`}
                      {summary.status === 'surplus' && `R$ ${summary.remainingAfterSavings.toFixed(2)} disponíveis após sua meta de poupança.`}
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <SummaryCard title="Entradas" amount={summary.totalIncome} icon={ArrowUpCircle} colorClass="text-emerald-600" />
                  <SummaryCard title="Fixos" amount={summary.totalFixedExpense} icon={Receipt} colorClass="text-rose-600" />
                  <SummaryCard title="Variáveis" amount={summary.totalVariableExpense} icon={ArrowDownCircle} colorClass="text-amber-600" />
                  <SummaryCard title="Saldo" amount={summary.balance} icon={Wallet} colorClass={summary.balance >= 0 ? "text-indigo-600" : "text-red-600"} />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  <div className="lg:col-span-2 bg-white p-6 rounded-2xl shadow-sm border border-slate-100">
                    <h3 className="font-bold mb-4 text-slate-700">Meta de Poupança</h3>
                    <div className="flex items-center justify-between mb-4">
                      <div className="text-3xl font-bold text-indigo-600">
                        R$ {summary.balance.toFixed(2)} <span className="text-sm text-slate-400 font-normal">de R$ {savingsGoal.toFixed(2)}</span>
                      </div>
                      <button onClick={() => setActiveTab('goals')} className="text-xs font-bold text-indigo-600 hover:underline">Ajustar Meta</button>
                    </div>
                    <div className="w-full bg-slate-100 h-3 rounded-full overflow-hidden">
                       <div 
                         className="h-full bg-indigo-500 transition-all duration-700" 
                         style={{ width: `${Math.min(100, Math.max(0, (summary.balance / (savingsGoal || 1)) * 100))}%` }}
                       ></div>
                    </div>
                  </div>
                  <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 flex flex-col items-center">
                    <h3 className="font-bold mb-2 text-slate-700 w-full text-left">Composição</h3>
                    <ResponsiveContainer width="100%" height={160}>
                      <PieChart>
                        <Pie data={chartData} innerRadius={50} outerRadius={70} paddingAngle={5} dataKey="value">
                          {chartData.map((entry, index) => <Cell key={`cell-${index}`} fill={entry.color} />)}
                        </Pie>
                        <Tooltip />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}

            {(activeTab === 'statement' || activeTab === 'incomes' || activeTab === 'fixed' || activeTab === 'variable') && (
              <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
                {filteredTransactions.length === 0 ? (
                  <div className="p-20 text-center text-slate-400">
                    <ClipboardList className="w-12 h-12 mx-auto mb-4 opacity-20" />
                    <p>Nenhum registro encontrado nesta categoria.</p>
                  </div>
                ) : (
                  <div className="divide-y divide-slate-100">
                    {filteredTransactions.map(t => (
                      <div key={t.id} className="p-4 flex items-center justify-between hover:bg-slate-50 transition-colors">
                        <div className="flex items-center gap-4">
                          <div className={`p-2.5 rounded-xl ${
                            t.type === 'income' ? 'bg-emerald-50 text-emerald-600' : 
                            t.type === 'fixed_expense' ? 'bg-rose-50 text-rose-600' : 'bg-amber-50 text-amber-600'
                          }`}>
                            {t.type === 'income' ? <ArrowUpCircle size={20} /> : t.type === 'fixed_expense' ? <Receipt size={20} /> : <ArrowDownCircle size={20} />}
                          </div>
                          <div>
                            <p className="font-semibold text-slate-800">{t.name}</p>
                            <p className="text-xs text-slate-400">
                              {new Date(t.date).toLocaleDateString('pt-BR')} • {
                                t.type === 'income' ? 'Entrada' : t.type === 'fixed_expense' ? 'Fixo' : 'Variável'
                              }
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center gap-6">
                           <span className={`font-bold text-lg ${t.type === 'income' ? 'text-emerald-600' : 'text-slate-800'}`}>
                             {t.type === 'income' ? '+' : '-'} R$ {t.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                           </span>
                           <button onClick={() => removeTransaction(t.id)} className="text-slate-300 hover:text-rose-500 p-2 transition-colors">
                             <Trash2 size={18} />
                           </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            )}

            {activeTab === 'goals' && (
              <div className="space-y-6 animate-fade-in">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-slate-100">
                  <h3 className="text-xl font-bold mb-6 text-slate-800">Definição de Metas</h3>
                  <div className="space-y-4 max-w-md">
                    <label className="block text-sm font-medium text-slate-600">Quanto você deseja poupar por mês?</label>
                    <div className="flex gap-3">
                      <div className="relative flex-1">
                        <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                        <input 
                          type="number" 
                          value={tempSavings || savingsGoal}
                          onChange={(e) => setTempSavings(e.target.value)}
                          className="w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-200 rounded-2xl text-xl font-bold focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        />
                      </div>
                      <button 
                        onClick={handleSaveSavings}
                        className="bg-indigo-600 text-white px-8 rounded-2xl font-bold shadow-lg shadow-indigo-100 hover:bg-indigo-700"
                      >
                        Salvar
                      </button>
                    </div>
                  </div>
                </div>
                
                <FinancialAdvisor summary={summary} transactions={transactions} />
              </div>
            )}

          </div>
        </main>
      </div>

      <AddTransactionModal 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        onAdd={handleAddTransaction}
      />
    </div>
  );
}

export default App;