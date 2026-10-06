import React, { useState, startTransition } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Sidebar, TabKey } from './components/layout/Sidebar';
import { Header } from './components/layout/Header';
import { ToastContainer } from './components/common/ToastContainer';

// Vues principales Formations
import { DashboardView } from './components/dashboard/DashboardView';
import { MarchesView } from './components/marches/MarchesView';
import { FormationsView } from './components/formations/FormationsView';
import { IntervenantsView } from './components/intervenants/IntervenantsView';
import { InterventionsView } from './components/interventions/InterventionsView';
import { PaiementsView } from './components/paiements/PaiementsView';
import { DecomptesView } from './components/decomptes/DecomptesView';
import { RapportsView } from './components/rapports/RapportsView';

// Vues principales Salaires
import { DashboardSalairesView } from './components/salaires/dashboard/DashboardSalairesView';
import { MarchesSalairesView } from './components/salaires/marches/MarchesSalairesView';
import { SalariesView } from './components/salaires/salaries/SalariesView';
import { PointageSalairesView } from './components/salaires/pointage/PointageSalairesView';
import { DecomptesSalairesView } from './components/salaires/decomptes/DecomptesSalairesView';
import { PaiementsSalariesView } from './components/salaires/paiements/PaiementsSalariesView';

// Modales globales rapides Formations
import { MarcheFormModal } from './components/marches/MarcheFormModal';
import { FormationFormModal } from './components/formations/FormationFormModal';
import { IntervenantFormModal } from './components/intervenants/IntervenantFormModal';
import { InterventionFormModal } from './components/interventions/InterventionFormModal';
import { PaiementFormModal } from './components/paiements/PaiementFormModal';
import { DecompteFormModal } from './components/decomptes/DecompteFormModal';

// Modales globales rapides Salaires
import { MarcheSalaireFormModal } from './components/salaires/marches/MarcheSalaireFormModal';
import { SalarieFormModal } from './components/salaires/salaries/SalarieFormModal';
import { DecompteSalaireFormModal } from './components/salaires/decomptes/DecompteSalaireFormModal';
import { PaiementSalarieFormModal } from './components/salaires/paiements/PaiementSalarieFormModal';

const AppContent: React.FC = () => {
  const { marches, marchesSalaires, toasts, removeToast } = useApp();

  const [activeTab, setActiveTab] = useState<TabKey>('dashboard');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [selectedMarcheFilter, setSelectedMarcheFilter] = useState<string | null>(null);
  const [selectedMarcheSalaireFilter, setSelectedMarcheSalaireFilter] = useState<string | null>(null);

  // Modales déclenchées de façon transversale - Formations
  const [isNewMarcheModalOpen, setIsNewMarcheModalOpen] = useState(false);
  const [isNewFormationModalOpen, setIsNewFormationModalOpen] = useState(false);
  const [formationDefaultMarcheId, setFormationDefaultMarcheId] = useState<string | undefined>(undefined);
  const [isNewIntervenantModalOpen, setIsNewIntervenantModalOpen] = useState(false);
  const [isNewInterventionModalOpen, setIsNewInterventionModalOpen] = useState(false);
  const [interventionDefaultFormationId, setInterventionDefaultFormationId] = useState<string | undefined>(undefined);
  const [isNewPaiementModalOpen, setIsNewPaiementModalOpen] = useState(false);
  const [paiementDefaultInterventionId, setPaiementDefaultInterventionId] = useState<string | undefined>(undefined);
  const [isNewDecompteModalOpen, setIsNewDecompteModalOpen] = useState(false);
  const [decompteDefaultMarcheId, setDecompteDefaultMarcheId] = useState<string | undefined>(undefined);

  // Modales déclenchées de façon transversale - Salaires
  const [isNewMarcheSalaireModalOpen, setIsNewMarcheSalaireModalOpen] = useState(false);
  const [isNewSalarieModalOpen, setIsNewSalarieModalOpen] = useState(false);
  const [isNewDecompteSalaireModalOpen, setIsNewDecompteSalaireModalOpen] = useState(false);
  const [decompteSalaireDefaultMarcheId, setDecompteSalaireDefaultMarcheId] = useState<string | undefined>(undefined);
  const [isNewPaiementSalarieModalOpen, setIsNewPaiementSalarieModalOpen] = useState(false);
  const [paiementSalarieDefaultMarcheId, setPaiementSalarieDefaultMarcheId] = useState<string | undefined>(undefined);

  // Recherche du libellé du marché filtré
  const activeMarcheObj = selectedMarcheFilter
    ? marches.find((m) => m.id === selectedMarcheFilter)
    : null;

  const activeMarcheSalaireObj = selectedMarcheSalaireFilter
    ? marchesSalaires.find((m) => m.id === selectedMarcheSalaireFilter)
    : null;

  // Handlers transversaux Formations
  const handleOpenAddFormation = (marcheId?: string) => {
    setFormationDefaultMarcheId(marcheId);
    setIsNewFormationModalOpen(true);
  };

  const handleOpenAddIntervention = (formationId?: string) => {
    setInterventionDefaultFormationId(formationId);
    setIsNewInterventionModalOpen(true);
  };

  const handleOpenAddPaiement = (interventionId?: string) => {
    setPaiementDefaultInterventionId(interventionId);
    setIsNewPaiementModalOpen(true);
  };

  const handleOpenAddDecompte = (marcheId?: string) => {
    setDecompteDefaultMarcheId(marcheId);
    setIsNewDecompteModalOpen(true);
  };

  const handleSelectMarcheFilter = (marcheId: string) => {
    setSelectedMarcheFilter(marcheId);
  };

  const handleNavigateToFormationsOfMarche = (marcheId: string) => {
    setSelectedMarcheFilter(marcheId);
    startTransition(() => {
      setActiveTab('formations');
    });
  };

  return (
    <div className="min-h-screen bg-slate-50 flex">
      {/* Barre latérale de navigation */}
      <Sidebar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        isOpen={isMobileMenuOpen}
        onClose={() => setIsMobileMenuOpen(false)}
      />

      {/* Conteneur principal */}
      <div className="flex-1 flex flex-col min-w-0 lg:pl-60 bg-[#F0F4F8] min-h-screen">
        {/* En-tête */}
        <Header
          activeTab={activeTab}
          onOpenMobileMenu={() => setIsMobileMenuOpen(true)}
          selectedMarcheRef={
            activeMarcheSalaireObj?.reference || activeMarcheObj?.reference || null
          }
          onClearMarcheFilter={() => {
            setSelectedMarcheFilter(null);
            setSelectedMarcheSalaireFilter(null);
          }}
        />

        {/* Corps de la page */}
        <main className="flex-1 p-4 sm:p-6 lg:p-7 max-w-[1500px] w-full mx-auto">
          {/* Module Formations */}
          {activeTab === 'dashboard' && (
            <DashboardView
              onNavigate={(tab, filterId) => {
                if (filterId) {
                  setSelectedMarcheFilter(filterId);
                }
                startTransition(() => {
                  setActiveTab(tab);
                });
              }}
            />
          )}

          {activeTab === 'marches' && (
            <MarchesView
              onSelectMarcheFilter={handleSelectMarcheFilter}
              onOpenAddFormation={handleOpenAddFormation}
              onOpenAddDecompte={handleOpenAddDecompte}
            />
          )}

          {activeTab === 'formations' && (
            <FormationsView
              initialMarcheFilter={selectedMarcheFilter}
              onOpenAddIntervention={handleOpenAddIntervention}
            />
          )}

          {activeTab === 'intervenants' && <IntervenantsView />}

          {activeTab === 'interventions' && (
            <InterventionsView onOpenAddPaiement={handleOpenAddPaiement} />
          )}

          {activeTab === 'paiements' && <PaiementsView />}

          {activeTab === 'decomptes' && (
            <DecomptesView initialMarcheFilter={selectedMarcheFilter} />
          )}

          {activeTab === 'rapports' && <RapportsView />}

          {/* Module Salaires */}
          {activeTab === 'salaires-dashboard' && (
            <DashboardSalairesView
              onNavigate={(tab, filterId) => {
                if (filterId) {
                  setSelectedMarcheFilter(null);
                  setSelectedMarcheSalaireFilter(filterId);
                }
                startTransition(() => {
                  setActiveTab(tab as TabKey);
                });
              }}
              onOpenAddMarche={() => setIsNewMarcheSalaireModalOpen(true)}
              onOpenAddSalarie={() => setIsNewSalarieModalOpen(true)}
              onOpenAddDecompte={() => setIsNewDecompteSalaireModalOpen(true)}
              onOpenAddPaiement={() => setIsNewPaiementSalarieModalOpen(true)}
            />
          )}

          {activeTab === 'marches-salaires' && (
            <MarchesSalairesView
              onOpenAddDecompte={(marcheId) => {
                setDecompteSalaireDefaultMarcheId(marcheId);
                setIsNewDecompteSalaireModalOpen(true);
              }}
              onOpenAddPaiement={(marcheId) => {
                setPaiementSalarieDefaultMarcheId(marcheId);
                setIsNewPaiementSalarieModalOpen(true);
              }}
            />
          )}

          {activeTab === 'salaries' && <SalariesView />}

          {activeTab === 'pointage-salaires' && <PointageSalairesView />}

          {activeTab === 'decomptes-salaires' && (
            <DecomptesSalairesView
              initialMarcheFilter={selectedMarcheSalaireFilter}
            />
          )}

          {activeTab === 'paiements-salaires' && (
            <PaiementsSalariesView
              initialMarcheFilter={selectedMarcheSalaireFilter}
            />
          )}
        </main>
      </div>

      {/* Modales transversales rapides - Formations */}
      <MarcheFormModal
        isOpen={isNewMarcheModalOpen}
        onClose={() => setIsNewMarcheModalOpen(false)}
      />

      <FormationFormModal
        isOpen={isNewFormationModalOpen}
        onClose={() => {
          setIsNewFormationModalOpen(false);
          setFormationDefaultMarcheId(undefined);
        }}
        defaultMarcheId={formationDefaultMarcheId}
      />

      <IntervenantFormModal
        isOpen={isNewIntervenantModalOpen}
        onClose={() => setIsNewIntervenantModalOpen(false)}
      />

      <InterventionFormModal
        isOpen={isNewInterventionModalOpen}
        onClose={() => {
          setIsNewInterventionModalOpen(false);
          setInterventionDefaultFormationId(undefined);
        }}
        defaultFormationId={interventionDefaultFormationId}
      />

      <PaiementFormModal
        isOpen={isNewPaiementModalOpen}
        onClose={() => {
          setIsNewPaiementModalOpen(false);
          setPaiementDefaultInterventionId(undefined);
        }}
        defaultInterventionId={paiementDefaultInterventionId}
      />

      <DecompteFormModal
        isOpen={isNewDecompteModalOpen}
        onClose={() => {
          setIsNewDecompteModalOpen(false);
          setDecompteDefaultMarcheId(undefined);
        }}
        defaultMarcheId={decompteDefaultMarcheId}
      />

      {/* Modales transversales rapides - Salaires */}
      <MarcheSalaireFormModal
        isOpen={isNewMarcheSalaireModalOpen}
        onClose={() => setIsNewMarcheSalaireModalOpen(false)}
      />

      <SalarieFormModal
        isOpen={isNewSalarieModalOpen}
        onClose={() => setIsNewSalarieModalOpen(false)}
      />

      <DecompteSalaireFormModal
        isOpen={isNewDecompteSalaireModalOpen}
        onClose={() => {
          setIsNewDecompteSalaireModalOpen(false);
          setDecompteSalaireDefaultMarcheId(undefined);
        }}
        defaultMarcheId={decompteSalaireDefaultMarcheId}
      />

      <PaiementSalarieFormModal
        isOpen={isNewPaiementSalarieModalOpen}
        onClose={() => {
          setIsNewPaiementSalarieModalOpen(false);
          setPaiementSalarieDefaultMarcheId(undefined);
        }}
        defaultMarcheId={paiementSalarieDefaultMarcheId}
      />

      {/* Système de notifications Toast */}
      <ToastContainer />
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <AppContent />
    </AppProvider>
  );
}
