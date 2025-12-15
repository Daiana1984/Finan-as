import React from 'react';
import { LucideIcon } from 'lucide-react';

interface SummaryCardProps {
  title: string;
  amount: number;
  icon: LucideIcon;
  colorClass: string;
  subtitle?: string;
}

export const SummaryCard: React.FC<SummaryCardProps> = ({ title, amount, icon: Icon, colorClass, subtitle }) => {
  return (
    <div className="bg-white p-5 rounded-2xl shadow-sm border border-slate-100 flex items-start justify-between transition-all hover:shadow-md">
      <div>
        <p className="text-sm font-medium text-slate-500 mb-1">{title}</p>
        <h3 className={`text-2xl font-bold tracking-tight ${colorClass}`}>
          R$ {amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </h3>
        {subtitle && <p className="text-xs text-slate-400 mt-1">{subtitle}</p>}
      </div>
      <div className={`p-3 rounded-xl opacity-90 ${colorClass.replace('text-', 'bg-').replace('600', '100').replace('700', '100')}`}>
        <Icon className={`w-6 h-6 ${colorClass}`} />
      </div>
    </div>
  );
};