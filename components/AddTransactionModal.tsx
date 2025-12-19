import React, { useState } from 'react';
import { X, ArrowUpCircle, Receipt, ArrowDownCircle } from 'lucide-react';
import { TransactionType } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, amount: number, type: TransactionType) => void;
  defaultType?: TransactionType;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd, defaultType = 'fixed_expense' }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(defaultType);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    
    onAdd(name, parseFloat(amount.replace(',', '.')), type);
    setName('');
    setAmount('');
    onClose();
  };

  const types: { id: TransactionType; label: string; icon: any; color: string }[] = [
    { id: 'income', label: 'Entrada', icon: ArrowUpCircle, color: 'text-emerald-600' },
    { id: 'fixed_expense', label: 'Fixo', icon: Receipt, color: 'text-rose-600' },
    { id: 'variable_expense', label: 'Variável', icon: ArrowDownCircle, color: 'text-amber-600' },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4">
      <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl overflow-hidden animate-fade-in border border-white/20">
        <div className="flex justify-between items-center p-6 border-b border-slate-100 bg-slate-50/50">
          <h3 className="text-xl font-bold text-slate-800">Novo Lançamento</h3>
          <button onClick={onClose} className="p-2 hover:bg-slate-200 rounded-full text-slate-400 transition-colors">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          
          <div className="grid grid-cols-3 gap-2">
            {types.map(t => (
              <button
                key={t.id}
                type="button"
                onClick={() => setType(t.id)}
                className={`flex flex-col items-center gap-2 p-3 rounded-2xl border-2 transition-all ${
                  type === t.id 
                    ? `bg-slate-50 border-indigo-600 ${t.color}` 
                    : 'border-slate-100 text-slate-400 hover:border-slate-200'
                }`}
              >
                <t.icon size={24} />
                <span className="text-xs font-bold">{t.label}</span>
              </button>
            ))}
          </div>

          <div className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Descrição</label>
              <input
                type="text"
                placeholder="Ex: Salário, Aluguel, Mercado..."
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full p-4 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Valor</label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 font-bold text-slate-400">R$</span>
                <input
                  type="number"
                  step="0.01"
                  placeholder="0,00"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  className="w-full p-4 pl-12 bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-2xl font-bold"
                  required
                />
              </div>
            </div>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-indigo-600 text-white rounded-2xl font-bold shadow-lg shadow-indigo-200 hover:bg-indigo-700 active:scale-95 transition-all text-lg"
          >
            Confirmar Lançamento
          </button>
        </form>
      </div>
    </div>
  );
};