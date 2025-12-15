import React, { useState, useEffect, useMemo } from 'react';
import { 
  Wallet, 
  TrendingUp, 
  TrendingDown, 
  PiggyBank, 
  Plus, 
  Trash2, 
  Menu,
  CheckCircle2,
  AlertTriangle,
  Target
} from 'lucide-react';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';

import { Transaction, TransactionType, FinancialSummary } from './types';
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
  const [activeTab, setActiveTab] = useState<'dashboard' | 'entries' | 'advisor'>('dashboard');
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
      type
    };
    setTransactions(prev => [...prev, newTx]);
  };

  const removeTransaction = (id: string) => {
    setTransactions(prev => prev.filter(t => t.id !== id));
  };

  const summary: FinancialSummary = useMemo(() => {
    const totalIncome = transactions
      .filter(t => t.type === 'income')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const totalExpense = transactions
      .filter(t => t.type === 'expense')
      .reduce((acc, curr) => acc + curr.amount, 0);

    const balance = totalIncome - totalExpense;
    const remainingAfterSavings = balance - savingsGoal;

    let status: FinancialSummary['status'] = 'balanced';
    if (balance < 0) status = 'deficit';
    else if (remainingAfterSavings < 0) status = 'danger'; // Have money, but not enough for savings
    else if (remainingAfterSavings > 0) status = 'surplus';

    return { totalIncome, totalExpense, balance, savingsGoal, remainingAfterSavings, status };
  }, [transactions, savingsGoal]);

  const handleSaveSavings = () => {
    const val = parseFloat(tempSavings.replace(',', '.'));
    if (!isNaN(val)) {
      setSavingsGoal(val);
    }
    setEditingSavings(false);
  };

  // --- Chart Data ---
  const chartData = [
    { name: 'Entradas', value: summary.totalIncome, color: '#059669' }, // emerald-600
    { name: 'Saídas', value: summary.totalExpense, color: '#e11d48' }, // rose-600
  ].filter(d => d.value > 0);

  // --- Render ---
  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 pb-24 md:pb-0">
      
      {/* Header */}
      <header className="bg-white sticky top-0 z-30 border-b border-slate-200 shadow-sm">
        <div className="max-w-2xl mx-auto px-4 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="bg-indigo-600 p-2 rounded-lg">
               <Wallet className="text-white w-5 h-5" />
            </div>
            <h1 className="text-xl font-bold tracking-tight text-slate-900">Saldo<span className="text-indigo-600">Fixo</span></h1>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => setIsModalOpen(true)}
              className="bg-slate-900 text-white px-4 py-2 rounded-lg text-sm font-medium hover:bg-slate-800 transition-colors flex items-center gap-2"
            >
              <Plus size={16} /> <span className="hidden sm:inline">Adicionar</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-2xl mx-auto p-4 space-y-6">
        
        {/* Navigation Tabs (Mobile optimized) */}
        <div className="flex p-1 bg-white rounded-xl border border-slate-200 shadow-sm overflow-x-auto no-scrollbar">
          {(['dashboard', 'entries', 'advisor'] as const).map(tab => (
            <button
              key={tab}
              onClick={() => setActiveTab(tab)}
              className={`flex-1 py-2 px-4 text-sm font-medium rounded-lg whitespace-nowrap transition-all ${
                activeTab === tab 
                  ? 'bg-slate-100 text-slate-900 shadow-sm' 
                  : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              {tab === 'dashboard' && 'Visão Geral'}
              {tab === 'entries' && 'Lançamentos'}
              {tab === 'advisor' && 'Consultor IA'}
            </button>
          ))}
        </div>

        {/* DASHBOARD VIEW */}
        {activeTab === 'dashboard' && (
          <div className="space-y-6 animate-fade-in">
            {/* Status Banner */}
            <div className={`p-4 rounded-xl border flex items-start gap-3 ${
              summary.status === 'deficit' ? 'bg-red-50 border-red-100 text-red-800' :
              summary.status === 'danger' ? 'bg-orange-50 border-orange-100 text-orange-800' :
              'bg-emerald-50 border-emerald-100 text-emerald-800'
            }`}>
              {summary.status === 'deficit' && <AlertTriangle className="w-5 h-5 mt-0.5" />}
              {summary.status === 'danger' && <AlertTriangle className="w-5 h-5 mt-0.5" />}
              {summary.status === 'surplus' && <CheckCircle2 className="w-5 h-5 mt-0.5" />}
              {summary.status === 'balanced' && <CheckCircle2 className="w-5 h-5 mt-0.5" />}
              
              <div>
                <h3 className="font-semibold">
                  {summary.status === 'deficit' && 'Atenção: Você está gastando mais do que ganha.'}
                  {summary.status === 'danger' && 'Alerta: Saldo positivo, mas abaixo da meta de poupança.'}
                  {summary.status === 'surplus' && 'Parabéns! Suas finanças estão saudáveis.'}
                  {summary.status === 'balanced' && 'Orçamento equilibrado.'}
                </h3>
                <p className="text-sm opacity-90 mt-1">
                  {summary.status === 'deficit' && `Faltam R$ ${Math.abs(summary.balance).toFixed(2)} para fechar o mês.`}
                  {summary.status === 'danger' && `Faltam R$ ${Math.abs(summary.remainingAfterSavings).toFixed(2)} para atingir sua meta de poupança.`}
                  {summary.status === 'surplus' && `Você tem R$ ${summary.remainingAfterSavings.toFixed(2)} livres após poupar.`}
                </p>
              </div>
            </div>

            {/* Savings Goal Input */}
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100">
              <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-2 text-indigo-600 font-medium">
                  <Target className="w-5 h-5" />
                  <h2>Meta de Poupança Mensal</h2>
                </div>
                {!editingSavings ? (
                   <button onClick={() => { setTempSavings(savingsGoal.toString()); setEditingSavings(true); }} className="text-sm text-slate-400 hover:text-indigo-600 underline">Alterar</button>
                ) : (
                   <button onClick={handleSaveSavings} className="text-sm text-indigo-600 font-bold">Salvar</button>
                )}
              </div>
              
              {!editingSavings ? (
                 <p className="text-3xl font-bold text-slate-800">R$ {savingsGoal.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
              ) : (
                <input 
                  autoFocus
                  type="number" 
                  className="w-full text-3xl font-bold text-slate-800 border-b-2 border-indigo-500 focus:outline-none bg-transparent"
                  value={tempSavings}
                  onChange={(e) => setTempSavings(e.target.value)}
                  onBlur={handleSaveSavings}
                  onKeyDown={(e) => e.key === 'Enter' && handleSaveSavings()}
                />
              )}
              <div className="w-full bg-slate-100 h-2 mt-4 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-500 ${summary.remainingAfterSavings >= 0 ? 'bg-indigo-500' : 'bg-red-400'}`} 
                  style={{ width: `${Math.min(100, Math.max(0, (summary.balance / (savingsGoal || 1)) * 100))}%` }}
                ></div>
              </div>
              <p className="text-xs text-slate-400 mt-2">
                {summary.balance >= savingsGoal ? 'Meta atingida!' : `${Math.round((summary.balance / (savingsGoal || 1)) * 100)}% da meta alcançada com o saldo atual.`}
              </p>
            </div>

            {/* Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <SummaryCard 
                title="Entradas Fixas" 
                amount={summary.totalIncome} 
                icon={TrendingUp} 
                colorClass="text-emerald-600" 
              />
              <SummaryCard 
                title="Saídas Fixas" 
                amount={summary.totalExpense} 
                icon={TrendingDown} 
                colorClass="text-rose-600" 
              />
              <SummaryCard 
                title="Saldo Final" 
                amount={summary.balance} 
                icon={Wallet} 
                colorClass={summary.balance >= 0 ? "text-indigo-600" : "text-red-600"}
                subtitle="Após pagar todas as contas"
              />
              <SummaryCard 
                title="Disponível Real" 
                amount={summary.remainingAfterSavings} 
                icon={PiggyBank} 
                colorClass={summary.remainingAfterSavings >= 0 ? "text-slate-700" : "text-orange-600"}
                subtitle="Após separar a poupança"
              />
            </div>

            {/* Simple Chart */}
            {chartData.length > 0 && (
              <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-100 h-64 flex flex-col items-center justify-center">
                 <h3 className="text-sm font-medium text-slate-500 w-full mb-2">Proporção</h3>
                 <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={chartData}
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="value"
                      >
                        {chartData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip formatter={(value: number) => `R$ ${value.toFixed(2)}`} />
                    </PieChart>
                 </ResponsiveContainer>
              </div>
            )}
          </div>
        )}

        {/* ENTRIES LIST VIEW */}
        {activeTab === 'entries' && (
          <div className="bg-white rounded-2xl shadow-sm border border-slate-100 overflow-hidden animate-fade-in">
             <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <h3 className="font-semibold text-slate-700">Histórico de Lançamentos</h3>
                <span className="text-xs text-slate-500">{transactions.length} itens</span>
             </div>
             
             {transactions.length === 0 ? (
               <div className="p-10 text-center text-slate-400">
                 <p>Nenhuma entrada ou saída cadastrada.</p>
                 <button onClick={() => setIsModalOpen(true)} className="mt-2 text-indigo-600 font-medium">Cadastrar agora</button>
               </div>
             ) : (
               <div className="divide-y divide-slate-100">
                 {transactions.map(t => (
                   <div key={t.id} className="p-4 flex items-center justify-between group hover:bg-slate-50 transition-colors">
                     <div className="flex items-center gap-3">
                       <div className={`p-2 rounded-full ${t.type === 'income' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                         {t.type === 'income' ? <TrendingUp size={16} /> : <TrendingDown size={16} />}
                       </div>
                       <div>
                         <p className="font-medium text-slate-800">{t.name}</p>
                         <p className="text-xs text-slate-400 capitalize">{t.type === 'income' ? 'Entrada' : 'Saída Fixa'}</p>
                       </div>
                     </div>
                     <div className="flex items-center gap-4">
                       <span className={`font-semibold ${t.type === 'income' ? 'text-emerald-600' : 'text-rose-600'}`}>
                         {t.type === 'income' ? '+' : '-'} R$ {t.amount.toFixed(2)}
                       </span>
                       <button 
                        onClick={() => removeTransaction(t.id)}
                        className="text-slate-300 hover:text-rose-500 transition-colors"
                        title="Remover"
                       >
                         <Trash2 size={16} />
                       </button>
                     </div>
                   </div>
                 ))}
               </div>
             )}
          </div>
        )}

        {/* AI ADVISOR VIEW */}
        {activeTab === 'advisor' && (
          <div className="animate-fade-in space-y-4">
            <FinancialAdvisor summary={summary} transactions={transactions} />
            
            {/* Context about monetization/product purpose */}
            <div className="bg-slate-100 p-6 rounded-2xl text-slate-600 text-sm">
               <h4 className="font-bold text-slate-800 mb-2">Sobre este Micro SaaS</h4>
               <p className="mb-2">Este produto foi desenhado para simplicidade extrema. Monetização sugerida:</p>
               <ul className="list-disc pl-4 space-y-1">
                 <li>Freemium: Até 5 saídas fixas grátis.</li>
                 <li>Premium (R$ 9,90/mês): Saídas ilimitadas + Consultor IA (Gemini).</li>
                 <li>Marketplace: Sugestão de cartões ou investimentos baseados no saldo (afiliados).</li>
               </ul>
            </div>
          </div>
        )}

      </main>

      {/* Floating Action Button (Mobile) - Only visible if not in modal */}
      <div className="fixed bottom-6 right-6 md:hidden">
        <button
          onClick={() => setIsModalOpen(true)}
          className="bg-indigo-600 text-white p-4 rounded-full shadow-xl hover:bg-indigo-700 active:scale-90 transition-all"
        >
          <Plus size={24} />
        </button>
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