import React, { useState, useEffect, startTransition } from 'react';
import {
  LayoutDashboard,
  Briefcase,
  BookOpen,
  Users2,
  FileCheck2,
  CreditCard,
  BarChart3,
  GraduationCap,
  Users,
  Wallet,
  CalendarCheck2,
} from 'lucide-react';
import { useApp } from '../../context/AppContext';

export type TabKey =
  | 'dashboard'
  | 'marches'
  | 'formations'
  | 'intervenants'
  | 'interventions'
  | 'decomptes'
  | 'paiements'
  | 'rapports'
  | 'salaires-dashboard'
  | 'marches-salaires'
  | 'salaries'
  | 'pointage-salaires'
  | 'decomptes-salaires'
  | 'paiements-salaires';

export interface NavItem {
  key: TabKey;
  label: string;
  icon: React.ComponentType<{ className?: string; strokeWidth?: number }>;
  count?: number;
  alertCount?: number;
}

interface SidebarProps {
  activeTab: TabKey;
  setActiveTab: (tab: TabKey) => void;
  isOpen: boolean;
  onClose: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeTab,
  setActiveTab,
  isOpen,
  onClose,
}) => {
  const {
    marches,
    formations,
    intervenants,
    decomptes,
    paiements,
    marchesSalaires,
    salaries,
    decomptesSalaires,
    paiementsSalaires,
    activeModule,
    setActiveModule,
    salairesAlerteRetard,
  } = useApp();

  // État optimiste pour réactivité visuelle instantanée du sélecteur
  const [optimisticModule, setOptimisticModule] = useState<'formations' | 'salaires'>(activeModule);

  useEffect(() => {
    setOptimisticModule(activeModule);
  }, [activeModule]);

  const displayModule = optimisticModule || activeModule;

  // Navigation Items Formations
  const navItemsFormations: NavItem[] = [
    {
      key: 'dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      key: 'marches',
      label: 'Marchés',
      icon: Briefcase,
      count: marches.length,
    },
    {
      key: 'formations',
      label: 'Formations',
      icon: BookOpen,
      count: formations.length,
    },
    {
      key: 'intervenants',
      label: 'Intervenants',
      icon: Users2,
      count: intervenants.length,
    },
    {
      key: 'decomptes',
      label: 'Décomptes',
      icon: FileCheck2,
      count: decomptes.length,
    },
    {
      key: 'paiements',
      label: 'Paiements',
      icon: CreditCard,
      count: paiements.length,
    },
    {
      key: 'rapports',
      label: 'Rapports',
      icon: BarChart3,
    },
  ];

  // Navigation Items Salaires
  const navItemsSalaires: NavItem[] = [
    {
      key: 'salaires-dashboard',
      label: 'Tableau de bord',
      icon: LayoutDashboard,
    },
    {
      key: 'marches-salaires',
      label: 'Marchés',
      icon: Briefcase,
      count: marchesSalaires.length,
    },
    {
      key: 'salaries',
      label: 'Salariés',
      icon: Users,
      count: salaries.length,
      alertCount: salairesAlerteRetard.isRetard ? salairesAlerteRetard.nbSalariesEnRetard : undefined,
    },
    {
      key: 'pointage-salaires',
      label: 'Pointage',
      icon: CalendarCheck2,
    },
    {
      key: 'decomptes-salaires',
      label: 'Décomptes',
      icon: FileCheck2,
      count: decomptesSalaires.length,
    },
    {
      key: 'paiements-salaires',
      label: 'Paiements',
      icon: Wallet,
      count: paiementsSalaires.length,
      alertCount: salairesAlerteRetard.isRetard ? salairesAlerteRetard.nbSalariesEnRetard : undefined,
    },
  ];

  const currentNavItems =
    displayModule === 'salaires' ? navItemsSalaires : navItemsFormations;

  const handleModuleSwitch = (mod: 'formations' | 'salaires') => {
    if (mod === displayModule) return;

    // 1. Réactivité visuelle immédiate du sélecteur sans aucun freeze
    setOptimisticModule(mod);

    // 2. Transition d'état non-bloquante pour le rendu lourd de la vue
    startTransition(() => {
      setActiveModule(mod);
      if (mod === 'salaires') {
        if (
          [
            'dashboard',
            'marches',
            'formations',
            'intervenants',
            'interventions',
            'decomptes',
            'paiements',
            'rapports',
          ].includes(activeTab)
        ) {
          setActiveTab('salaires-dashboard');
        }
      } else {
        if (
          [
            'salaires-dashboard',
            'marches-salaires',
            'salaries',
            'pointage-salaires',
            'decomptes-salaires',
            'paiements-salaires',
          ].includes(activeTab)
        ) {
          setActiveTab('dashboard');
        }
      }
    });
  };

  return (
    <>
      {/* Mobile backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 z-40 bg-slate-950/60 backdrop-blur-xs lg:hidden"
          onClick={onClose}
        />
      )}

      {/* Sidebar container */}
      <aside
        className={`fixed top-0 bottom-0 left-0 z-40 w-60 bg-[#0C1E36] text-slate-200 border-r border-[#162D4E] flex flex-col transition-transform duration-200 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* En-tête Sidebar : Écusson / Logo selon le module actif */}
        <div className="pt-5 pb-4 px-5 flex flex-col items-center border-b border-[#162D4E]/80">
          <div
            className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-md transition-transform hover:scale-105 ${
              displayModule === 'salaires'
                ? 'bg-teal-500 text-white'
                : 'bg-white text-[#0C1E36]'
            }`}
          >
            {displayModule === 'salaires' ? (
              <Users className="w-6 h-6 text-white" strokeWidth={2.2} />
            ) : (
              <GraduationCap className="w-7 h-7 text-[#0C1E36]" strokeWidth={2.2} />
            )}
          </div>
          <span className="mt-2 text-xs font-bold uppercase tracking-wider text-white">
            {displayModule === 'salaires' ? 'Gestion Salaires' : 'Formation Pro'}
          </span>
          <span className="text-[10px] text-slate-400 font-medium">
            Administration Publique
          </span>

          {/* Module Switcher Segmented Control */}
          <div className="w-full mt-3.5 p-0.5 bg-[#081526] rounded-lg border border-[#1A3459] flex items-center gap-1">
            <button
              type="button"
              onClick={() => handleModuleSwitch('formations')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-bold tracking-tight transition-all cursor-pointer text-center ${
                displayModule === 'formations'
                  ? 'bg-[#1E70E0] text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              Formations
            </button>
            <button
              type="button"
              onClick={() => handleModuleSwitch('salaires')}
              className={`flex-1 py-1.5 px-2 rounded-md text-[10px] font-bold tracking-tight transition-all cursor-pointer text-center relative flex items-center justify-center gap-1.5 ${
                displayModule === 'salaires'
                  ? 'bg-teal-600 text-white shadow-xs'
                  : 'text-slate-400 hover:text-white hover:bg-white/5'
              }`}
            >
              <span>Salaires</span>
              {salairesAlerteRetard.isRetard && (
                <span
                  className="px-1.5 py-0.5 rounded-full bg-amber-400 text-slate-950 font-extrabold text-[9px] font-mono leading-none animate-pulse shadow-xs"
                  title={`${salairesAlerteRetard.nbSalariesEnRetard} salarié(s) non réglé(s) pour ${salairesAlerteRetard.moisEchu}`}
                >
                  {salairesAlerteRetard.nbSalariesEnRetard}
                </span>
              )}
            </button>
          </div>
        </div>

        {/* Liste des menus de navigation */}
        <div className="flex-1 px-3 py-3.5 space-y-1 overflow-y-auto">
          {currentNavItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.key;
            const isSalairesMod = displayModule === 'salaires';
            const alertCount = item.alertCount;

            return (
              <button
                key={item.key}
                onClick={() => {
                  startTransition(() => {
                    setActiveTab(item.key);
                  });
                  onClose();
                }}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  isActive
                    ? isSalairesMod
                      ? 'bg-teal-600 text-white shadow-md shadow-teal-900/30'
                      : 'bg-[#1E70E0] text-white shadow-md shadow-blue-900/30'
                    : 'text-slate-300 hover:text-white hover:bg-[#162D4E]/60'
                }`}
              >
                <div className="flex items-center gap-3 min-w-0">
                  <Icon
                    className={`w-4 h-4 shrink-0 ${
                      isActive ? 'text-white' : 'text-slate-400'
                    }`}
                    strokeWidth={isActive ? 2.3 : 1.8}
                  />
                  <span className="truncate">{item.label}</span>
                </div>

                <div className="flex items-center gap-1.5 shrink-0">
                  {alertCount && alertCount > 0 && (
                    <span
                      className="px-1.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500 text-slate-950 flex items-center gap-1 shadow-xs animate-pulse font-mono"
                      title={`${alertCount} salarié(s) en attente de règlement`}
                    >
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-950" />
                      {alertCount}
                    </span>
                  )}

                  {item.count !== undefined && (
                    <span
                      className={`text-[10px] px-1.5 py-0.5 rounded font-mono font-bold tabular-nums ${
                        isActive
                          ? 'bg-white/20 text-white'
                          : 'bg-[#162D4E] text-slate-300'
                      }`}
                    >
                      {item.count}
                    </span>
                  )}
                </div>
              </button>
            );
          })}
        </div>
      </aside>
    </>
  );
};

