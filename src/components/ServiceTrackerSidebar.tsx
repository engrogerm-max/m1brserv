import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { 
  Activity, 
  User, 
  Settings, 
  CheckCircle2, 
  Clock, 
  AlertTriangle, 
  Shield, 
  HelpCircle, 
  ChevronRight, 
  X, 
  Layers, 
  Sparkles, 
  DollarSign, 
  Wrench,
  Navigation,
  ThumbsUp
} from 'lucide-react';

export const ServiceTrackerSidebar: React.FC = () => {
  const { 
    services, 
    currentRole, 
    setCurrentRole,
    clientAcceptServicePrice,
    clientRejectServicePrice,
    providerAcceptDispatchedService,
    providerRejectDispatchedService,
    markProviderArrived,
    startServiceExecution,
    submitPhotoReport,
    approveReportAndPay,
    providers
  } = useApp();

  const [isOpen, setIsOpen] = useState(true);

  // Filter out older completed services to keep monitor clean, but show active/recent ones
  const activeServices = services.filter(s => s.status !== 'cancelado');

  const getStepNumber = (status: string): { step: number; label: string; color: string; desc: string } => {
    switch (status) {
      case 'solicitado':
      case 'aguardando_despacho_admin':
        return { 
          step: 1, 
          label: 'Passo 1: 🕒 Triagem', 
          color: 'text-rose-400 border-rose-500/20 bg-rose-500/10',
          desc: 'Aguardando Admin triar e enviar para profissional'
        };
      case 'despachado_prestador':
        return { 
          step: 2, 
          label: 'Passo 2: 🛠️ Negociação', 
          color: 'text-cyan-400 border-cyan-500/20 bg-cyan-500/10',
          desc: 'Aguardando Prestador aceitar ou recusar chamado'
        };
      case 'aceito_pelo_prestador':
        return { 
          step: 3, 
          label: 'Passo 3: 💰 Aprovação Final', 
          color: 'text-amber-400 border-amber-500/20 bg-amber-500/10',
          desc: 'Aguardando Cliente aprovar preço e tempo'
        };
      case 'em_deslocamento':
      case 'chegou_ao_local':
      case 'em_execucao':
      case 'relatorio_enviado':
        return { 
          step: 4, 
          label: 'Passo 4: ⚡ Atendimento', 
          color: 'text-purple-400 border-purple-500/20 bg-purple-500/10',
          desc: 'Profissional a caminho, no local ou em execução'
        };
      case 'concluido_pago':
        return { 
          step: 5, 
          label: 'Passo 5: ✅ Finalizado', 
          color: 'text-emerald-400 border-emerald-500/20 bg-emerald-500/10',
          desc: 'Atendimento concluído, pago e avaliado'
        };
      default:
        return { 
          step: 0, 
          label: 'Status Desconhecido', 
          color: 'text-slate-400 border-slate-500/20 bg-slate-500/10',
          desc: status 
        };
    }
  };

  return (
    <>
      {/* Floating Badge Button to Toggle Tracker */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="fixed bottom-20 right-4 z-40 bg-slate-900 border border-slate-800 hover:border-slate-700 text-cyan-400 font-bold text-xs px-4 py-3 rounded-full shadow-2xl flex items-center gap-2 transition-all hover:scale-105 cursor-pointer"
        id="m1-tracker-toggle-btn"
      >
        <Activity className={`w-4 h-4 text-cyan-400 ${activeServices.some(s => s.status !== 'concluido_pago') ? 'animate-pulse' : ''}`} />
        <span>Monitor M1 ({activeServices.length})</span>
      </button>

      {/* Centered Modal Panel Overlay */}
      {isOpen && (
        <div className="fixed inset-0 bg-black/75 backdrop-blur-sm z-50 flex items-center justify-center p-4" onClick={() => setIsOpen(false)}>
          <div 
            className="w-full max-w-xl bg-slate-950 border border-slate-800/80 shadow-2xl rounded-3xl flex flex-col max-h-[85vh] animate-scale-in overflow-hidden"
            id="m1-tracker-panel"
            onClick={(e) => e.stopPropagation()}
          >
          {/* Header Panel */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
            <div className="flex items-center gap-2">
              <Activity className="w-5 h-5 text-cyan-400" />
              <div>
                <h3 className="text-xs font-black text-white uppercase tracking-wider font-mono">
                  Monitor Ativo de Atividades
                </h3>
                <p className="text-[10px] text-slate-400">Fluxo operacional live da Central M1</p>
              </div>
            </div>
            <button
              onClick={() => setIsOpen(false)}
              className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Service Requests List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {activeServices.length === 0 ? (
              <div className="text-center py-12 px-4 space-y-3">
                <HelpCircle className="w-10 h-10 text-slate-700 mx-auto" />
                <p className="text-xs text-slate-500 font-bold">Nenhum chamado ativo no sistema.</p>
                <p className="text-[11px] text-slate-600">
                  Para testar, mude para o perfil **Cliente** e clique em **"Solicitar Reparo"**.
                </p>
              </div>
            ) : (
              activeServices.map(srv => {
                const workflow = getStepNumber(srv.status);
                
                return (
                  <div 
                    key={srv.id}
                    className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3 shadow-md hover:border-slate-700 transition-all"
                  >
                    {/* Client & Code details */}
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="flex items-center gap-1.5">
                          <span className="font-mono text-xs font-black text-rose-400">{srv.code}</span>
                          <span className={`px-2 py-0.5 rounded text-[8px] font-black uppercase tracking-wider ${workflow.color}`}>
                            {workflow.label}
                          </span>
                        </div>
                        <h4 className="text-xs font-bold text-slate-100 mt-1">{srv.title}</h4>
                        <p className="text-[10px] text-slate-400">
                          Cliente: <strong className="text-slate-200">{srv.clientName}</strong> ({srv.clientPhone})
                        </p>
                      </div>
                      
                      <div className="text-right">
                        <span className="font-mono text-emerald-400 text-xs font-black">
                          R$ {srv.estimatedPrice.toFixed(2)}
                        </span>
                        <span className="block text-[8px] text-slate-500 font-bold">Valor Atual</span>
                      </div>
                    </div>

                    {/* Progress visual steps */}
                    <div className="space-y-1 bg-slate-950/60 p-2.5 rounded-lg border border-slate-900">
                      <p className="text-[9px] text-slate-400 font-bold">{workflow.desc}</p>
                      
                      {/* Workflow track visual bullets */}
                      <div className="flex items-center justify-between pt-1 gap-1">
                        {[1, 2, 3, 4, 5, 6].map((num) => (
                          <div key={num} className="flex-1 flex items-center">
                            <div 
                              className={`h-1.5 w-full rounded-full transition-all ${
                                workflow.step >= num 
                                  ? num === 6 ? 'bg-emerald-500' : 'bg-cyan-500'
                                  : 'bg-slate-800'
                              }`} 
                            />
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Quick interactive test shortcuts */}
                    <div className="border-t border-slate-800 pt-2.5 space-y-1.5">
                      <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">
                        Controle Rápido de Teste (Simular Fluxo):
                      </p>

                      <div className="flex flex-wrap gap-1.5">
                        {/* STEP 1 ACTION: Admin organizes / edits */}
                        {workflow.step === 1 && (
                          <button
                            onClick={() => {
                              setCurrentRole('admin');
                            }}
                            className="bg-rose-500 hover:bg-rose-400 text-slate-950 font-black text-[9px] px-2.5 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer flex items-center gap-1"
                          >
                            <Shield className="w-3 h-3" />
                            <span>Organizar como Admin</span>
                          </button>
                        )}

                        {/* STEP 2 ACTION: Provider accepts or rejects */}
                        {workflow.step === 2 && (
                          <>
                            <button
                              onClick={() => {
                                providerAcceptDispatchedService(srv.id, 15);
                                setCurrentRole('provider');
                              }}
                              className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-[9px] px-2.5 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              🛠️ Aceitar (Prestador)
                            </button>
                            <button
                              onClick={() => {
                                providerRejectDispatchedService(srv.id, 'Recusado pelo prestador via monitor');
                              }}
                              className="bg-rose-500/20 hover:bg-rose-500/30 text-rose-400 font-black text-[9px] px-2 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Recusar (Prestador)
                            </button>
                          </>
                        )}

                        {/* STEP 3 ACTION: Client accepts or rejects proposed price & ETA */}
                        {workflow.step === 3 && (
                          <>
                            <button
                              onClick={() => {
                                clientAcceptServicePrice(srv.id);
                                setCurrentRole('client');
                              }}
                              className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] px-2.5 py-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              👍 Aprovar Match (Cliente)
                            </button>
                            <button
                              onClick={() => {
                                clientRejectServicePrice(srv.id);
                              }}
                              className="bg-red-500/20 hover:bg-red-500/30 text-red-400 font-black text-[9px] px-2 px-1.5 rounded uppercase tracking-wider transition-colors cursor-pointer"
                            >
                              Recusar (Cliente)
                            </button>
                          </>
                        )}

                        {/* STEP 4 ACTIONS: Simulate Provider lifecycle easily */}
                        {workflow.step === 4 && (
                          <div className="flex flex-wrap gap-1">
                            {srv.status === 'em_deslocamento' && (
                              <button
                                onClick={() => {
                                  markProviderArrived(srv.id);
                                  setCurrentRole('provider');
                                }}
                                className="bg-purple-500 hover:bg-purple-400 text-white font-black text-[9px] px-2 py-1.5 rounded uppercase tracking-wider cursor-pointer"
                              >
                                📍 Cheguei ao Local
                              </button>
                            )}
                            {srv.status === 'chegou_ao_local' && (
                              <button
                                onClick={() => {
                                  startServiceExecution(srv.id, []);
                                  setCurrentRole('provider');
                                }}
                                className="bg-purple-500 hover:bg-purple-400 text-white font-black text-[9px] px-2 py-1.5 rounded uppercase tracking-wider cursor-pointer"
                              >
                                ⚡ Iniciar Reparo
                              </button>
                            )}
                            {srv.status === 'em_execucao' && (
                              <button
                                onClick={() => {
                                  // Submit simulated report before/after photos
                                  submitPhotoReport(srv.id, {
                                    beforePhotos: [
                                      { id: 'b1', type: 'photo', url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80', timestamp: '14:30', caption: 'Antes' }
                                    ],
                                    afterPhotos: [
                                      { id: 'a1', type: 'photo', url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80', timestamp: '15:15', caption: 'Depois' }
                                    ],
                                    notes: 'Substituição da fiação rompida do disjuntor do chuveiro realizada com sucesso e testado elétrico.',
                                    checklist: [
                                      { id: 'c1', label: 'Verificar disjuntor', completed: true },
                                      { id: 'c2', label: 'Trocar fiação do chuveiro', completed: true },
                                      { id: 'c3', label: 'Testar vazamento de água', completed: true }
                                    ],
                                    timeSpentMinutes: 45,
                                    submittedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                                  });
                                  setCurrentRole('client');
                                }}
                                className="bg-purple-500 hover:bg-purple-400 text-white font-black text-[9px] px-2 py-1.5 rounded uppercase tracking-wider cursor-pointer"
                              >
                                📸 Enviar Relatório (Fim)
                              </button>
                            )}
                            {srv.status === 'relatorio_enviado' && (
                              <button
                                onClick={() => {
                                  approveReportAndPay(srv.id, {
                                    id: 'r-' + Date.now(),
                                    serviceId: srv.id,
                                    serviceCode: srv.code,
                                    serviceTitle: srv.title,
                                    clientId: srv.clientId,
                                    clientName: srv.clientName,
                                    providerId: srv.providerId || srv.assignedProviderId || 'simulated-provider',
                                    providerName: srv.providerName || srv.assignedProviderName || 'Simulado',
                                    score: 5,
                                    comment: 'Excelente trabalho, resolvido rápido!',
                                    tags: [],
                                    tipAmount: 0,
                                    createdAt: new Date().toLocaleDateString('pt-BR')
                                  });
                                  setCurrentRole('client');
                                }}
                                className="bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[9px] px-2 py-1.5 rounded uppercase tracking-wider cursor-pointer"
                                id="approve-payment-tracker"
                              >
                                💰 Confirmar Pagamento (Cliente)
                              </button>
                            )}
                          </div>
                        )}

                        {/* STEP 6 ACTION: Just show rating */}
                        {workflow.step === 6 && (
                          <span className="text-[9px] text-emerald-400 font-bold flex items-center gap-1">
                            <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                            <span>Atendimento concluído perfeitamente!</span>
                          </span>
                        )}

                        {/* Quick switch shortcut to view this service */}
                        <button
                          onClick={() => {
                            if (srv.status === 'aguardando_confirmacao_cliente' || srv.status === 'relatorio_enviado') {
                              setCurrentRole('client');
                            } else if (srv.status === 'despachado_prestador' || srv.status === 'em_deslocamento' || srv.status === 'chegou_ao_local' || srv.status === 'em_execucao') {
                              setCurrentRole('provider');
                            } else {
                              setCurrentRole('admin');
                            }
                          }}
                          className="bg-slate-850 hover:bg-slate-800 border border-slate-700 text-slate-300 font-black text-[8px] px-2 py-1.5 rounded uppercase tracking-wider cursor-pointer"
                        >
                          Ver Detalhes
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </div>
      )}
    </>
  );
};
