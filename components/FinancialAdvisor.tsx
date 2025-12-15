import React, { useState } from 'react';
import { Sparkles, Loader2, Lock } from 'lucide-react';
import { FinancialSummary, Transaction } from '../types';
import { getFinancialAdvice } from '../services/geminiService';
import ReactMarkdown from 'react-markdown';

interface FinancialAdvisorProps {
  summary: FinancialSummary;
  transactions: Transaction[];
  isPro?: boolean; // Mock for monetization feature
}

export const FinancialAdvisor: React.FC<FinancialAdvisorProps> = ({ summary, transactions, isPro = true }) => {
  const [advice, setAdvice] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleAnalyze = async () => {
    if (!process.env.API_KEY) {
      setAdvice("**Erro de Configuração:** API Key não encontrada. Adicione sua chave no ambiente.");
      return;
    }
    setLoading(true);
    const result = await getFinancialAdvice(summary, transactions);
    setAdvice(result);
    setLoading(false);
  };

  return (
    <div className="bg-gradient-to-br from-indigo-600 to-violet-700 rounded-2xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
      {/* Decorative background elements */}
      <div className="absolute top-0 right-0 -mt-4 -mr-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-yellow-300" />
          <h3 className="text-xl font-bold">Consultor IA</h3>
          <span className="text-xs bg-white/20 px-2 py-0.5 rounded-full border border-white/10 uppercase tracking-wider font-semibold">Premium</span>
        </div>

        {!advice && !loading && (
          <div>
            <p className="text-indigo-100 mb-6">
              Receba uma análise inteligente das suas finanças. Descubra onde cortar gastos e como atingir sua meta de poupança mais rápido.
            </p>
            <button
              onClick={handleAnalyze}
              className="w-full bg-white text-indigo-700 py-3 rounded-xl font-bold hover:bg-indigo-50 transition-colors shadow-lg active:scale-95 flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              Analisar Minhas Finanças
            </button>
          </div>
        )}

        {loading && (
          <div className="flex flex-col items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-white mb-3" />
            <p className="text-indigo-100 text-sm animate-pulse">Consultando especialistas...</p>
          </div>
        )}

        {advice && !loading && (
          <div className="animate-fade-in">
            <div className="prose prose-invert prose-sm max-w-none bg-white/10 p-4 rounded-xl border border-white/10">
               <ReactMarkdown>{advice}</ReactMarkdown>
            </div>
            <button
              onClick={() => setAdvice(null)}
              className="mt-4 text-sm text-indigo-200 hover:text-white underline"
            >
              Nova Análise
            </button>
          </div>
        )}
      </div>

      {/* Monetization Teaser (if not pro) */}
      {!isPro && (
        <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center z-20">
          <div className="bg-white/10 p-4 rounded-full mb-3">
             <Lock className="w-8 h-8 text-white" />
          </div>
          <h3 className="text-lg font-bold mb-1">Recurso Premium</h3>
          <p className="text-sm text-slate-200 mb-4">Desbloqueie a IA para receber dicas personalizadas.</p>
          <button className="px-6 py-2 bg-yellow-400 text-yellow-900 rounded-full font-bold text-sm">
            Assinar PRO por R$ 9,90/mês
          </button>
        </div>
      )}
    </div>
  );
};