import React, { useState, useEffect, useCallback } from 'react';
import { Header } from './components/Header';
import { Navigation } from './components/Navigation';
import { QuickActionModal } from './components/QuickActionModal';
import { NewBatchModal } from './components/NewBatchModal';
import { VisionAnalysisModal } from './components/VisionAnalysisModal';
import { VoiceAssistantModal } from './components/VoiceAssistantModal';
import { ErrorBoundary } from './components/ErrorBoundary';
import { DashboardView } from './views/DashboardView';
import { PondsView } from './views/PondsView';
import { BatchesView } from './views/BatchesView';
import { FeedingView } from './views/FeedingView';
import { WaterQualityView } from './views/WaterQualityView';
import { MortalityView } from './views/MortalityView';
import { HarvestView } from './views/HarvestView';
import { AICopilotView } from './views/AICopilotView';
import { InventoryView } from './views/InventoryView';
import { WhatsAppView } from './views/WhatsAppView';
import { FiscalView } from './views/FiscalView';
import { EquipmentView } from './views/EquipmentView';
import { CommercialView } from './views/CommercialView';
import { ReportsView } from './views/ReportsView';
import { HarvestForecastView } from './views/HarvestForecastView';
import { MyFarmView } from './views/MyFarmView';
import {
  DashboardSummary,
  Pond,
  ShrimpBatch,
  BiometryLog,
  FeedInventory,
  FeedingLog,
  FeedingTrayLog,
  WaterQualityLog,
  MortalityLog,
  HarvestLog,
} from './types';
import { api } from './services/api';

export function App() {
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Domain states
  const [summary, setSummary] = useState<DashboardSummary | null>(null);
  const [ponds, setPonds] = useState<Pond[]>([]);
  const [batches, setBatches] = useState<ShrimpBatch[]>([]);
  const [biometries, setBiometries] = useState<BiometryLog[]>([]);
  const [feedInventory, setFeedInventory] = useState<FeedInventory[]>([]);
  const [feedingLogs, setFeedingLogs] = useState<FeedingLog[]>([]);
  const [feedingTrays, setFeedingTrays] = useState<FeedingTrayLog[]>([]);
  const [waterLogs, setWaterLogs] = useState<WaterQualityLog[]>([]);
  const [mortalities, setMortalities] = useState<MortalityLog[]>([]);
  const [harvests, setHarvests] = useState<HarvestLog[]>([]);

  // Modals
  const [isQuickActionOpen, setIsQuickActionOpen] = useState(false);
  const [isNewBatchModalOpen, setIsNewBatchModalOpen] = useState(false);
  const [isVoiceAssistantOpen, setIsVoiceAssistantOpen] = useState(false);
  const [isVisionModalOpen, setIsVisionModalOpen] = useState(false);
  const [preSelectedPondId, setPreSelectedPondId] = useState<number | undefined>(undefined);

  const loadData = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      const results = await Promise.allSettled([
        api.getDashboardSummary(),
        api.getPonds(),
        api.getBatches(),
        api.getBiometries(),
        api.getFeedInventory(),
        api.getFeedingLogs(),
        api.getFeedingTrays(),
        api.getWaterLogs(),
        api.getMortalities(),
        api.getHarvests(),
      ]);

      const [
        sumRes,
        pondsRes,
        batchesRes,
        bioRes,
        invRes,
        feedRes,
        trayRes,
        waterRes,
        mortRes,
        harvRes,
      ] = results;

      if (sumRes.status === 'fulfilled') setSummary(sumRes.value);
      if (pondsRes.status === 'fulfilled') setPonds(pondsRes.value || []);
      if (batchesRes.status === 'fulfilled') setBatches(batchesRes.value || []);
      if (bioRes.status === 'fulfilled') setBiometries(bioRes.value || []);
      if (invRes.status === 'fulfilled') setFeedInventory(invRes.value || []);
      if (feedRes.status === 'fulfilled') setFeedingLogs(feedRes.value || []);
      if (trayRes.status === 'fulfilled') setFeedingTrays(trayRes.value || []);
      if (waterRes.status === 'fulfilled') setWaterLogs(waterRes.value || []);
      if (mortRes.status === 'fulfilled') setMortalities(mortRes.value || []);
      if (harvRes.status === 'fulfilled') setHarvests(harvRes.value || []);

      // If key dashboard data failed, alert gently
      if (sumRes.status === 'rejected') {
        console.warn('Dashboard summary call failed:', sumRes.reason);
        setError('Não foi possível carregar os dados principais. Verifique se o servidor backend está online.');
      }
    } catch (err: any) {
      console.error('Erro ao carregar dados:', err);
      setError('Não foi possível conectar ao servidor da API. Verifique se o backend está em execução na porta 8000.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  const handleOpenNewBatch = (pondId?: number) => {
    setPreSelectedPondId(pondId);
    setIsNewBatchModalOpen(true);
  };

  return (
    <div style={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', background: 'var(--bg-primary)' }}>
      {/* Header */}
      <Header
        activeTab={activeTab}
        onRefresh={loadData}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
        onOpenVoice={() => setIsVoiceAssistantOpen(true)}
        onOpenVision={() => setIsVisionModalOpen(true)}
        criticalAlerts={(summary?.critical_water_alerts || 0) + (summary?.critical_alkalinity_alerts || 0) + (summary?.low_feed_alerts || 0)}
        onNavigateTab={(tab) => setActiveTab(tab)}
      />

      {/* Main Body with Sidebar + View */}
      <div style={{ display: 'flex', flex: 1 }}>
        <Navigation
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          criticalWaterCount={summary?.critical_water_alerts}
          criticalAlkalinityCount={summary?.critical_alkalinity_alerts}
          lowFeedCount={summary?.low_feed_alerts}
        />

        <main className="main-content" style={{ flex: 1, padding: '24px 28px', maxWidth: 1400, margin: '0 auto', width: '100%' }}>
          <ErrorBoundary fallbackTitle="Erro ao renderizar o painel ou módulo">
            {error && (
              <div style={{
                background: 'rgba(244, 63, 94, 0.15)',
                border: '1px solid rgba(244, 63, 94, 0.4)',
                color: 'var(--rose-400)',
                padding: '14px 18px',
                borderRadius: 'var(--radius-md)',
                marginBottom: '20px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between',
              }}>
                <span>{error}</span>
                <button onClick={loadData} className="btn btn-secondary btn-sm">
                  Tentar Novamente
                </button>
              </div>
            )}

            {loading && !summary ? (
              <div style={{ padding: '60px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                <div style={{ fontSize: '1.2rem', marginBottom: '8px', color: '#ffffff' }}>Carregando dados da carcinicultura...</div>
                <span style={{ fontSize: '0.85rem' }}>Conectando aos viveiros e sensores do Meu Pescado</span>
              </div>
            ) : (
              <>
                {activeTab === 'dashboard' && summary && (
                  <DashboardView
                    summary={summary}
                    ponds={ponds}
                    batches={batches}
                    waterLogs={waterLogs}
                    onSelectPond={() => setActiveTab('ponds')}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                    onQuickAction={() => setIsQuickActionOpen(true)}
                  />
                )}

                {activeTab === 'ai' && (
                  <AICopilotView
                    ponds={ponds}
                    batches={batches}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'ponds' && (
                  <PondsView
                    ponds={ponds}
                    onRefresh={loadData}
                    onSelectPond={() => {}}
                    onOpenNewBatchModal={handleOpenNewBatch}
                  />
                )}

                {activeTab === 'batches' && (
                  <BatchesView
                    batches={batches}
                    biometries={biometries}
                    onRefresh={loadData}
                    onOpenNewBatchModal={handleOpenNewBatch}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'feeding' && (
                  <FeedingView
                    inventory={feedInventory}
                    logs={feedingLogs}
                    trays={feedingTrays}
                    batches={batches}
                    onRefresh={loadData}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'water' && (
                  <WaterQualityView
                    logs={waterLogs}
                    ponds={ponds}
                    onRefresh={loadData}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'mortality' && (
                  <MortalityView
                    logs={mortalities}
                    batches={batches}
                    onRefresh={loadData}
                  />
                )}

                {activeTab === 'harvest' && (
                  <HarvestView
                    logs={harvests}
                    batches={batches}
                    onRefresh={loadData}
                  />
                )}

                {activeTab === 'inventory' && (
                  <InventoryView
                    onRefresh={loadData}
                    onNavigateTab={(tab) => setActiveTab(tab)}
                  />
                )}

                {activeTab === 'whatsapp' && (
                  <WhatsAppView />
                )}

                {activeTab === 'fiscal' && (
                  <FiscalView />
                )}

                {activeTab === 'equipment' && (
                  <EquipmentView />
                )}

                {activeTab === 'commercial' && (
                  <CommercialView />
                )}

                {activeTab === 'reports' && (
                  <ReportsView />
                )}

                {activeTab === 'forecast' && (
                  <HarvestForecastView />
                )}

                {activeTab === 'farm' && (
                  <MyFarmView />
                )}
              </>
            )}
          </ErrorBoundary>
        </main>
      </div>

      {/* Quick Action Modal */}
      <QuickActionModal
        isOpen={isQuickActionOpen}
        onClose={() => setIsQuickActionOpen(false)}
        onActionSelect={(tab) => setActiveTab(tab)}
      />

      {/* New Batch Modal */}
      <NewBatchModal
        isOpen={isNewBatchModalOpen}
        onClose={() => setIsNewBatchModalOpen(false)}
        ponds={ponds}
        preSelectedPondId={preSelectedPondId}
        onBatchCreated={loadData}
      />

      {/* Multimodal Computer Vision (Smartphone Camera & Upload) */}
      <VisionAnalysisModal
        isOpen={isVisionModalOpen}
        onClose={() => setIsVisionModalOpen(false)}
        ponds={ponds}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onRefreshData={loadData}
      />

      {/* Voice Assistant Modal (Voice Commands for the whole system) */}
      <VoiceAssistantModal
        isOpen={isVoiceAssistantOpen}
        onClose={() => setIsVoiceAssistantOpen(false)}
        onNavigateTab={(tab) => setActiveTab(tab)}
        onOpenQuickAction={() => setIsQuickActionOpen(true)}
        onOpenNewBatch={() => setIsNewBatchModalOpen(true)}
        onOpenVision={() => setIsVisionModalOpen(true)}
        onRefresh={loadData}
      />
    </div>
  );
}

export default App;
