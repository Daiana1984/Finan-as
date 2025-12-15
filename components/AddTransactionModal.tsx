import React, { useState } from 'react';
import { X } from 'lucide-react';
import { TransactionType } from '../types';

interface AddTransactionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onAdd: (name: string, amount: number, type: TransactionType) => void;
  defaultType?: TransactionType;
}

export const AddTransactionModal: React.FC<AddTransactionModalProps> = ({ isOpen, onClose, onAdd, defaultType = 'expense' }) => {
  const [name, setName] = useState('');
  const [amount, setAmount] = useState('');
  const [type, setType] = useState<TransactionType>(defaultType);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name || !amount) return;
    
    onAdd(name, parseFloat(amount.replace(',', '.')), type); // Basic handling for PT-BR comma
    setName('');
    setAmount('');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
      <div className="bg-white rounded-2xl w-full max-w-sm shadow-xl overflow-hidden animate-fade-in">
        <div className="flex justify-between items-center p-4 border-b border-slate-100">
          <h3 className="font-semibold text-slate-800">Nova Movimentação</h3>
          <button onClick={onClose} className="p-1 hover:bg-slate-100 rounded-full text-slate-500">
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-5 space-y-4">
          
          {/* Type Toggle */}
          <div className="flex bg-slate-100 p-1 rounded-lg mb-4">
            <button
              type="button"
              onClick={() => setType('income')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                type === 'income' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Entrada
            </button>
            <button
              type="button"
              onClick={() => setType('expense')}
              className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                type === 'expense' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-700'
              }`}
            >
              Saída Fixa
            </button>
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Nome</label>
            <input
              type="text"
              placeholder={type === 'income' ? "Ex: Salário, Pensão" : "Ex: Aluguel, Internet"}
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-1">Valor (R$)</label>
            <input
              type="number"
              step="0.01"
              placeholder="0,00"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              className="w-full p-3 bg-slate-50 border border-slate-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-indigo-500 text-lg font-medium"
              required
            />
          </div>

          <button
            type="submit"
            className={`w-full py-3.5 rounded-xl text-white font-semibold shadow-lg shadow-indigo-500/20 active:scale-[0.98] transition-all ${
              type === 'income' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
            }`}
          >
            Adicionar {type === 'income' ? 'Entrada' : 'Saída'}
          </button>
        </form>
      </div>
    </div>
  );
};