import React from 'react';
import { EtatPaiement, NatureFormation, LieuAffectationSalarie } from '../../types';

interface BadgeProps {
  children: React.ReactNode;
  variant?: 'success' | 'warning' | 'danger' | 'info' | 'neutral' | 'indigo';
  size?: 'sm' | 'md';
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'sm',
  className = '',
}) => {
  const variantStyles = {
    success: 'bg-emerald-50 text-emerald-700 border border-emerald-200/80',
    warning: 'bg-amber-50 text-amber-700 border border-amber-200/80',
    danger: 'bg-rose-50 text-rose-700 border border-rose-200/80',
    info: 'bg-blue-50 text-blue-700 border border-blue-200/80',
    indigo: 'bg-indigo-50 text-indigo-700 border border-indigo-200/80',
    neutral: 'bg-slate-100 text-slate-700 border border-slate-200',
  };

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-0.5 font-medium rounded-md',
    md: 'text-xs px-3 py-1 font-medium rounded-md',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 whitespace-nowrap ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      <span
        className={`w-1.5 h-1.5 rounded-full ${
          variant === 'success'
            ? 'bg-emerald-500'
            : variant === 'warning'
            ? 'bg-amber-500'
            : variant === 'danger'
            ? 'bg-rose-500'
            : variant === 'info'
            ? 'bg-blue-500'
            : variant === 'indigo'
            ? 'bg-indigo-500'
            : 'bg-slate-400'
        }`}
      />
      {children}
    </span>
  );
};

export const EtatPaiementBadge: React.FC<{ etat: EtatPaiement }> = ({ etat }) => {
  if (etat === 'Payé') {
    return <Badge variant="success">PAYÉ</Badge>;
  }
  if (etat === 'En cours') {
    return <Badge variant="warning">EN COURS</Badge>;
  }
  return <Badge variant="danger">NON PAYÉ</Badge>;
};

export const NatureFormationBadge: React.FC<{ nature: NatureFormation }> = ({ nature }) => {
  if (nature === 'Disciplinaire') {
    return (
      <span className="inline-flex items-center text-xs font-medium text-blue-700 bg-blue-50 border border-blue-200/70 px-2 py-0.5 rounded">
        Disciplinaire
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-xs font-medium text-slate-700 bg-slate-100 border border-slate-200 px-2 py-0.5 rounded">
      Complémentaire
    </span>
  );
};

export const LieuAffectationBadge: React.FC<{
  lieu: LieuAffectationSalarie;
  precision?: string;
}> = ({ lieu, precision }) => {
  const styles: Record<LieuAffectationSalarie, { bg: string; text: string; border: string }> = {
    'Centre pédagogique': { bg: 'bg-teal-50', text: 'text-teal-800', border: 'border-teal-200' },
    'Laboratoire': { bg: 'bg-emerald-50', text: 'text-emerald-800', border: 'border-emerald-200' },
    'Administration': { bg: 'bg-slate-100', text: 'text-slate-800', border: 'border-slate-300' },
    "Centre d'Excellence": { bg: 'bg-cyan-50', text: 'text-cyan-800', border: 'border-cyan-200' },
    'Autre': { bg: 'bg-amber-50', text: 'text-amber-800', border: 'border-amber-200' },
  };

  const style = styles[lieu] || styles['Autre'];

  return (
    <span
      className={`inline-flex items-center gap-1 text-[11px] font-semibold px-2 py-0.5 rounded-md border ${style.bg} ${style.text} ${style.border}`}
      title={precision ? `Précision : ${precision}` : undefined}
    >
      <span>{lieu}</span>
      {precision && (
        <span className="text-[10px] font-normal opacity-85 truncate max-w-[120px]">
          ({precision})
        </span>
      )}
    </span>
  );
};
