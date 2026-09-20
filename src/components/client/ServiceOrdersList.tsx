import React, { useState } from 'react';
import { ServiceRequest, CategoryInfo } from '../../types';
import { 
  FileText, AlertCircle, ChevronDown, Calendar, CreditCard, 
  MapPin, ShieldCheck, Phone, MessageSquare, CheckCircle2, 
  X, Sparkles, Clock, Zap, Star, ShieldAlert, Award, FileSpreadsheet,
  ExternalLink
} from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface ServiceOrdersListProps {
  clientRequests: ServiceRequest[];
  activeService: ServiceRequest | undefined;
  categories: CategoryInfo[];
  expandedRequestId: string | null;
  onToggleExpand: (id: string | null) => void;
  clientConfirmProviderArrival: (id: string) => void;
  clientAcknowledgeService: (id: string) => void;
  clientAcceptServicePrice: (id: string) => void;
  clientRejectServicePrice: (id: string) => void;
  cancelServiceRequest: (id: string, reason: string) => void;
  editServiceDetails: (id: string, updates: any) => void;
  setRatingModalService: (service: ServiceRequest | null) => void;
  setInspectingReport: (service: ServiceRequest | null) => void;
  getWhatsAppLinkForClient: (service: ServiceRequest) => string;
  settings: any;
  onSelectTab: (tab: 'inicio' | 'pedidos' | 'mensagens' | 'perfil') => void;
}

export const ServiceOrdersList: React.FC<ServiceOrdersListProps> = ({
  clientRequests,
  activeService,
  categories,
  expandedRequestId,
  onToggleExpand,
  clientConfirmProviderArrival,
  clientAcknowledgeService,
  clientAcceptServicePrice,
  clientRejectServicePrice,
  cancelServiceRequest,
  editServiceDetails,
  setRatingModalService,
  setInspectingReport,
  getWhatsAppLinkForClient,
  settings,
  onSelectTab
}) => {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [inspectingCompleted, setInspectingCompleted] = useState<ServiceRequest | null>(null);
  const [cancelFeeAgreed, setCancelFeeAgreed] = useState<Record<string, boolean>>({});
  const [termAlertTriggered, setTermAlertTriggered] = useState<Record<string, boolean>>({});
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;

  const totalPages = Math.ceil(clientRequests.length / itemsPerPage);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedRequests = clientRequests.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  const getActiveStep = (status: string) => {
    if (['solicitado', 'aguardando_despacho_admin'].includes(status)) return 0;
    if (['aguardando_confirmacao_cliente', 'valor_aprovado_cliente'].includes(status)) return 1;
    if (status === 'despachado_prestador') return 2;
    if (['em_deslocamento', 'chegou_ao_local'].includes(status)) return 3;
    if (['em_execucao', 'relatorio_enviado', 'concluido_pago', 'concluido'].includes(status)) return 4;
    return 0;
  };

  const handleCopyPix = (srvId: string) => {
    // Standard simulation of PIX Copia e Cola code
    const fakePix = `00020126360014br.gov.bcb.pix0114rogerio@m1br.com.br5204000053039865405150.005802BR5910M1_SERVICOS6009Sao_Paulo62070503***63041A2D`;
    navigator.clipboard.writeText(fakePix);
    setCopiedId(srvId);
    setTimeout(() => setCopiedId(null), 2500);
  };

  return (
    <div className="space-y-4">
      {/* Title Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
          <FileText className="w-5 h-5 text-red-500" />
          <span>Meus Pedidos de Atendimento</span>
        </h2>
        <span className="px-2.5 py-1 rounded-full bg-slate-900 border border-slate-800 text-[11px] text-slate-400 font-bold">
          Total: {clientRequests.length}
        </span>
      </div>

      {clientRequests.length === 0 ? (
        <div className="p-10 rounded-2xl bg-slate-900 border border-slate-800 text-center space-y-4">
          <AlertCircle className="w-10 h-10 text-slate-600 mx-auto" />
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-white">Nenhuma solicitação cadastrada</h3>
            <p className="text-xs text-slate-500">Quando você solicitar um atendimento, ele será listado aqui para acompanhamento.</p>
          </div>
          <button
            onClick={() => onSelectTab('inicio')}
            className="px-4 py-2 rounded-xl bg-red-600 hover:bg-red-500 text-white font-bold text-xs uppercase cursor-pointer transition-colors"
          >
            Fazer Nova Solicitação
          </button>
        </div>
      ) : (
        <div className="space-y-3">
          {paginatedRequests.map((srv) => {
            const isExpanded = expandedRequestId === srv.id;
            const catInfo = categories.find(c => c.id === srv.category);
            const activeStep = getActiveStep(srv.status);

            const iconKey = (catInfo?.iconName || catInfo?.icon || 'Wrench') as string;
            const normalizedIconKey = iconKey.charAt(0).toUpperCase() + iconKey.slice(1);
            const IconComponent = (LucideIcons as any)[normalizedIconKey] || (LucideIcons as any)[iconKey] || LucideIcons.Wrench;

            if (srv.status === 'concluido_pago') {
              return (
                <div
                  key={srv.id}
                  className="rounded-2xl border bg-slate-900/65 border-emerald-500/25 hover:border-emerald-500/50 transition-all overflow-hidden animate-in fade-in-50 duration-200"
                >
                  <div className="p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-left">
                    <div className="flex items-center gap-3.5 min-w-0 flex-1">
                      {/* Activity Specific Icon */}
                      <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 shrink-0">
                        <IconComponent className="w-5 h-5 stroke-[2]" />
                      </div>

                      <div className="space-y-1.5 min-w-0 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="text-[9px] font-mono font-black text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20 uppercase tracking-wider">
                            Concluído M1
                          </span>
                          <span className="text-[10px] font-mono font-black text-slate-400 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                            #{srv.code}
                          </span>
                          <span className="text-[10px] font-bold text-slate-400">
                            {catInfo?.name || srv.category}
                          </span>
                        </div>
                        <h3 className="text-sm font-extrabold text-white truncate font-sans leading-tight">{srv.title}</h3>
                        <p className="text-[11px] text-slate-500 font-sans">
                          Profissional: <strong className="text-slate-300">{srv.providerName || 'Profissional Credenciado'}</strong> • Finalizado em {srv.completedAt || 'Recentemente'}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => setInspectingCompleted(srv)}
                      className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500 text-emerald-400 hover:text-slate-950 font-black text-[10.5px] uppercase tracking-wider rounded-xl transition-all border border-emerald-500/30 flex items-center gap-1.5 cursor-pointer justify-center self-start sm:self-center shrink-0 shadow-sm"
                    >
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                      <span>Ver Dados do Serviço</span>
                    </button>
                  </div>
                </div>
              );
            }

            return (
              <div
                key={srv.id}
                className={`rounded-2xl border transition-all overflow-hidden ${
                  isExpanded 
                    ? 'bg-slate-900/90 border-red-500/30 shadow-lg shadow-red-500/5' 
                    : 'bg-slate-900 border-slate-800/80 hover:border-slate-700'
                }`}
              >
                {/* Accordion Collapsed Trigger */}
                <div
                  onClick={() => onToggleExpand(isExpanded ? null : srv.id)}
                  className="p-4 sm:p-5 flex items-center justify-between gap-4 cursor-pointer select-none"
                >
                  <div className="flex items-center gap-3.5 flex-1 min-w-0">
                    {/* Activity Specific Icon */}
                    <div className="w-10 h-10 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center justify-center text-red-400 shrink-0">
                      <IconComponent className="w-5 h-5 stroke-[2]" />
                    </div>

                    <div className="flex-1 space-y-1.5 min-w-0">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="text-[10px] font-mono font-black text-slate-400 bg-slate-950 px-2 py-0.5 rounded-lg border border-slate-800">
                          {srv.code}
                        </span>
                        <span className="text-[10px] font-bold text-slate-400">
                          {catInfo?.name || srv.category}
                        </span>
                      </div>

                      <h3 className="text-sm sm:text-base font-bold text-white truncate">{srv.title}</h3>

                    <div className="flex items-center gap-3 text-xs">
                      {['solicitado', 'aguardando_despacho_admin'].includes(srv.status) || srv.estimatedPrice === 0 ? (
                        <span className="text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded-lg border border-amber-500/20">
                          Orçamento: Central M1 avaliando
                        </span>
                      ) : (
                        <span className="text-emerald-400 font-extrabold bg-emerald-500/10 px-2 py-0.5 rounded-lg border border-emerald-500/20">
                          R$ {srv.estimatedPrice.toFixed(2)}
                        </span>
                      )}
                      <span className="text-slate-500">•</span>
                      <span className="text-slate-500 flex items-center gap-1 font-medium">
                        <Calendar className="w-3.5 h-3.5" />
                        {srv.urgency === 'imediato' ? '⚡ Urgente' : '📅 Agendado'}
                      </span>
                    </div>
                  </div>
                </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Status Badge */}
                    <div>
                      {srv.status === 'solicitado' && (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-slate-800 text-slate-300">
                          Enviado
                        </span>
                      )}
                      {(srv.status === 'aguardando_despacho_admin' || srv.status === 'despachado_prestador') && (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-yellow-500/10 text-yellow-400 border border-yellow-500/20 animate-pulse">
                          Buscando
                        </span>
                      )}
                      {srv.status === 'negociando' && (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-blue-500/15 text-blue-300 border border-blue-500/30">
                          Em Proposta
                        </span>
                      )}
                      {srv.status === 'proposta_aceita' && (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-indigo-500/15 text-indigo-300 border border-indigo-500/30">
                          Aceito
                        </span>
                      )}
                      {srv.status === 'em_deslocamento' && (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-sky-500/15 text-sky-300 border border-sky-500/30 animate-pulse">
                          A Caminho
                        </span>
                      )}
                      {srv.status === 'chegou_ao_local' && (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-teal-500/15 text-teal-300 border border-teal-500/30 animate-pulse">
                          No Local
                        </span>
                      )}
                      {srv.status === 'em_execucao' && (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-500/15 text-emerald-300 border border-emerald-500/30 animate-pulse">
                          Em Serviço
                        </span>
                      )}
                      {srv.status === 'relatorio_enviado' && (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-purple-500/20 text-purple-300 border border-purple-500/40 animate-pulse">
                          Pagar Laudo
                        </span>
                      )}
                      {srv.status === 'aguardando_confirmacao_pagamento' && (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-yellow-500/25 text-yellow-400 border border-yellow-500/30 animate-pulse">
                          Aguardando Taxa de Serviço
                        </span>
                      )}
                      {srv.status === 'concluido_pago' && (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-emerald-500 text-slate-950">
                          Concluído
                        </span>
                      )}
                      {srv.status === 'cancelado' && (
                        <span className="px-2.5 py-1 rounded-full text-[9px] font-black uppercase bg-red-500/15 text-red-400 border border-red-500/30">
                          Cancelado
                        </span>
                      )}
                    </div>

                    <ChevronDown className={`w-5 h-5 text-slate-500 transition-transform duration-250 ${isExpanded ? 'rotate-180 text-white' : ''}`} />
                  </div>
                </div>

                {/* Expanded Accordion Body */}
                {isExpanded && (
                  <div className="px-4 pb-5 pt-1 sm:px-5 sm:pb-6 border-t border-slate-800/60 space-y-5 animate-fade-in text-xs">
                    
                    {srv.status === 'concluido_pago' ? (
                      <div className="space-y-4 pt-2">
                        <div className="bg-emerald-500/5 border border-emerald-500/10 rounded-2xl p-4 space-y-3">
                          <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <div>
                              <h4 className="text-xs font-black uppercase text-emerald-400 font-black">Atendimento Encerrado com Sucesso</h4>
                              <p className="text-[10px] text-slate-400">Este chamado foi executado, auditado e concluído.</p>
                            </div>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                            <div className="space-y-1">
                              <p className="text-slate-500 text-[10px] uppercase font-bold">🛠️ Serviço Executado</p>
                              <p className="text-white font-bold">{srv.title}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-500 text-[10px] uppercase font-bold">👨🏼‍🔧 Profissional Credenciado</p>
                              <p className="text-white font-bold">{srv.providerName || 'Profissional Parceiro'}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-500 text-[10px] uppercase font-bold">💰 Valor Pago</p>
                              <p className="text-emerald-400 font-mono font-extrabold text-sm">R$ {srv.payment?.totalAmount ? srv.payment.totalAmount.toFixed(2) : srv.estimatedPrice.toFixed(2)}</p>
                            </div>
                            <div className="space-y-1">
                              <p className="text-slate-500 text-[10px] uppercase font-bold">📅 Data de Conclusão</p>
                              <p className="text-slate-300 font-bold">{srv.completedAt || 'Hoje'}</p>
                            </div>
                          </div>

                          {srv.rating && (
                            <div className="border-t border-slate-800/60 pt-3 space-y-1.5">
                              <p className="text-slate-500 text-[10px] uppercase font-bold">⭐ Sua Avaliação</p>
                              <div className="flex items-center gap-1">
                                {[1, 2, 3, 4, 5].map((star) => (
                                  <Star key={star} className={`w-4 h-4 ${star <= (srv.rating?.score || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-700'}`} />
                                ))}
                                <span className="text-[11px] text-slate-400 font-medium ml-1">({srv.rating.score}/5)</span>
                              </div>
                              {srv.rating.comment && (
                                <p className="text-[11px] text-slate-300 bg-slate-950/40 p-2.5 rounded-xl italic font-sans border border-slate-800">
                                  "{srv.rating.comment}"
                                </p>
                              )}
                            </div>
                          )}

                          {srv.photoReport?.photos && srv.photoReport.photos.length > 0 && (
                            <div className="border-t border-slate-800/60 pt-3">
                              <button
                                type="button"
                                onClick={() => setInspectingReport(srv)}
                                className="px-3.5 py-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-850 text-[10.5px] text-slate-300 font-bold rounded-lg transition-colors cursor-pointer flex items-center gap-1.5"
                              >
                                <FileSpreadsheet className="w-3.5 h-3.5 text-emerald-400" />
                                Visualizar Laudo Fotográfico Técnico M1
                              </button>
                            </div>
                          )}
                        </div>
                      </div>
                    ) : (
                      <>
                        {/* TELA DE VER DADOS DO SERVIÇO */}
                        <div className="bg-slate-950/60 p-4 rounded-2xl border border-slate-800/80 flex items-center justify-between gap-3 animate-fade-in" id="ver-dados-servico-header">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center justify-center text-amber-400">
                              <FileText className="w-4 h-4 text-amber-400" />
                            </div>
                            <div>
                              <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider block">Você está visualizando os</span>
                              <h4 className="text-xs font-black text-white uppercase tracking-wide leading-tight">Dados Gerais do Serviço</h4>
                            </div>
                          </div>
                          <span className="px-2.5 py-1 rounded-full text-[9px] font-mono font-bold bg-slate-900 border border-slate-800 text-slate-400 uppercase tracking-wider">
                            ID #{srv.code}
                          </span>
                        </div>

                    {/* DADOS GERAIS DO CHAMADO */}
                    <div className="space-y-2.5">
                      <div>
                        <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Descrição Detalhada:</h4>
                        <p className="text-slate-300 leading-relaxed font-sans mt-0.5">{srv.description}</p>
                      </div>

                      <div className="bg-slate-950/60 p-3 rounded-xl border border-slate-800/80 space-y-1.5">
                        <div className="flex items-start gap-1.5 text-[11px]">
                          <MapPin className="w-4 h-4 text-red-500 shrink-0 mt-0.5" />
                          <div>
                            <p className="font-bold text-slate-200">
                              {srv.address.street}, nº {srv.address.number}
                            </p>
                            <p className="text-[10px] text-slate-400">
                              Bairro: {srv.address.neighborhood} | {srv.address.city} - {srv.address.state || 'SP'} {srv.address.complement && `(${srv.address.complement})`}
                            </p>
                          </div>
                        </div>
                      </div>

                      {/* Mídias enviadas */}
                      {srv.media && srv.media.length > 0 && (
                        <div className="space-y-1.5">
                          <span className="text-[10px] font-black uppercase text-slate-400">Fotos / Vídeos Enviados ({srv.media.length}):</span>
                          <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                            {srv.media.map((m, idx) => {
                              const key = m && typeof m === 'object' && m.id ? m.id : `media-${idx}`;
                              const url = m && typeof m === 'object' ? m.url : String(m);
                              return (
                                <img
                                  key={key}
                                  src={url}
                                  alt="Mídia de Atendimento"
                                  onError={(e) => {
                                    (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=150&q=80';
                                  }}
                                  className="w-16 h-16 rounded-xl object-cover border border-slate-800 shrink-0 hover:scale-105 transition-transform"
                                />
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>

                    {/* BUSCANDO PRESTADOR REAJUSTE COMPATIBILITY */}
                    {(srv.status === 'aguardando_despacho_admin' || srv.status === 'solicitado') && (
                      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2.5">
                          <Clock className="w-4 h-4 text-amber-400 animate-spin" />
                          <span className="text-[11px] font-black uppercase text-amber-400">Central Buscando Prestador</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">
                          A Central M1 está indicando um credenciado. Para atrair atendimento expresso com máxima prioridade, você pode reajustar seu chamado.
                        </p>
                        <button
                          type="button"
                          onClick={() => {
                            const newPrice = srv.estimatedPrice + 50;
                            editServiceDetails(srv.id, {
                              estimatedPrice: newPrice,
                              createdEpoch: Date.now(),
                              status: 'aguardando_despacho_admin'
                            });
                            alert(`Proposta reajustada com prioridade para R$ ${newPrice.toFixed(2)}!`);
                          }}
                          className="w-full py-2.5 bg-emerald-500 text-slate-950 font-black text-[10px] uppercase rounded-xl hover:bg-emerald-400 cursor-pointer transition-colors"
                        >
                          ⚡ ACELERAR CHAMADO (+ R$ 50,00)
                        </button>
                      </div>
                    )}

                    {/* MÓDULO DE CONFIANÇA DO PRESTADOR */}
                    {(srv.providerId || srv.assignedProviderId) && (
                      <div className="p-4 bg-slate-950/60 rounded-2xl border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <div className="flex items-center gap-1.5">
                            <Award className="w-4 h-4 text-emerald-400" />
                            <span className="text-[10px] font-black uppercase text-slate-400">Profissional M1 Credenciado</span>
                          </div>
                          <div className="flex items-center gap-1 bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded text-[9px] font-bold">
                            <Star className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                            <span>Nota 4.95</span>
                          </div>
                        </div>

                        <div className="flex items-center justify-between gap-3 flex-wrap">
                          <div className="flex items-center gap-2.5">
                            <img
                              src={srv.providerAvatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80'}
                              alt="Avatar do Prestador"
                              className="w-11 h-11 rounded-full object-cover border border-emerald-500/30 shrink-0"
                            />
                            <div className="space-y-0.5">
                              <p className="text-sm font-black text-white">{srv.providerName || srv.assignedProviderName || 'Carlos Eduardo Silva'}</p>
                              <p className="text-[10px] text-slate-400">M1 ID: #{srv.providerId?.slice(-5) || '14285'}</p>
                              {srv.providerVehicle && (
                                <p className="text-[9.5px] text-slate-500 font-mono">Furgão: {srv.providerVehicle} | {srv.providerPlate || 'M1B-2026'}</p>
                              )}
                            </div>
                          </div>

                          <div className="flex items-center gap-2">
                            <a
                              href="tel:11962122694"
                              className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-slate-700 text-slate-300 hover:text-white transition-colors flex items-center gap-1.5"
                              title="Ligar para Central M1 (Dúvidas/Suporte)"
                            >
                              <Phone className="w-4 h-4 text-rose-400" />
                              <span className="text-[10px] font-bold">Suporte</span>
                            </a>
                            <a
                              href={getWhatsAppLinkForClient(srv)}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="px-3 py-2 rounded-xl bg-green-500 hover:bg-green-600 text-white font-black text-[10px] uppercase flex items-center gap-1.5 transition-colors"
                              title="Falar com a Central M1 no WhatsApp"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>Suporte M1</span>
                            </a>
                          </div>
                        </div>
                      </div>
                    )}

                    {/* CIÊNTE AGUARDANDO NO LOCAL WORKFLOW TRANSITION */}
                    {(srv.status === 'em_deslocamento' || srv.status === 'chegou_ao_local') && !srv.clientAcknowledgedAwaiting && (
                      <div className="p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-emerald-400">
                          <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                          <span className="text-[10px] font-black uppercase">Aguardando seu Sinal</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">
                          O credenciado já aceitou e está se preparando. Por favor, confirme que está ciente e aguardando no endereço indicado para liberar o monitoramento total.
                        </p>
                        <button
                          type="button"
                          onClick={() => clientAcknowledgeService(srv.id)}
                          className="w-full py-3 bg-emerald-500 text-slate-950 font-black text-xs uppercase rounded-xl hover:bg-emerald-400 cursor-pointer shadow-md"
                        >
                          ✓ Ciente, Aguardando no Local
                        </button>
                      </div>
                    )}

                    {/* CONFIRMAR CHEGADA DO PRESTADOR */}
                    {srv.status === 'chegou_ao_local' && srv.clientAcknowledgedAwaiting && !srv.clientConfirmedArrival && (
                      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3">
                        <div className="flex items-center gap-2 text-amber-400">
                          <MapPin className="w-4 h-4 text-amber-400" />
                          <span className="text-[10px] font-black uppercase">O Profissional Chegou ao Endereço?</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">
                          O credenciado informou que se encontra em frente à sua residência. Confirme a chegada segura para iniciar a execução do laudo/serviço.
                        </p>
                        <button
                          type="button"
                          onClick={() => clientConfirmProviderArrival(srv.id)}
                          className="w-full py-3 bg-amber-500 text-slate-950 font-black text-xs uppercase rounded-xl hover:bg-amber-400 cursor-pointer shadow-md"
                        >
                          ✓ Confirmar Chegada no Local
                        </button>
                      </div>
                    )}

                    {/* ORÇAMENTO OR NEGOCIANDO PROPOSALS (APROVAÇÃO FINAL DO CLIENTE) */}
                    {srv.status === 'aceito_pelo_prestador' && (
                      <div className="p-4 bg-amber-500/5 border border-amber-500/20 rounded-2xl space-y-3 animate-pulse">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <span className="text-[10px] font-black uppercase text-amber-400">Aprovação Final de Orçamento & Tempo</span>
                          <span className="text-[10.5px] text-white font-mono font-black">R$ {srv.estimatedPrice.toFixed(2)}</span>
                        </div>
                        <div className="space-y-1.5 text-xs">
                          <p className="text-[11px] text-slate-300 leading-tight">
                            Um profissional credenciado aceitou o chamado e estimou a chegada em:
                          </p>
                          <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 flex items-center justify-between">
                            <span className="text-slate-400 text-[10px] uppercase font-bold">Tempo Estimado de Chegada:</span>
                            <span className="text-amber-400 font-mono font-black text-sm">{srv.estimatedArrivalMinutes || 15} minutos</span>
                          </div>
                          <p className="text-[10px] text-slate-500 italic">
                            🔒 Ao aprovar, o match será efetuado. O endereço completo será enviado ao profissional e a identificação do profissional (veículo, placa e telefone) será exibida para você.
                          </p>
                        </div>
                        {/* 🚨 ALARME VISUAL OBRIGATÓRIO: TERMO DE TAXA DE 15% */}
                        <div 
                          className={`p-3 rounded-xl border-2 transition-all text-left ${
                            cancelFeeAgreed[srv.id]
                              ? 'bg-amber-950/40 border-amber-400'
                              : termAlertTriggered[srv.id]
                                ? 'bg-red-950/90 border-red-500 ring-2 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                                : 'bg-yellow-500/15 border-yellow-400 animate-pulse'
                          }`}
                        >
                          <label className="flex items-start gap-2.5 cursor-pointer select-none">
                            <input
                              type="checkbox"
                              checked={!!cancelFeeAgreed[srv.id]}
                              onChange={(e) => {
                                const checked = e.target.checked;
                                setCancelFeeAgreed(prev => ({ ...prev, [srv.id]: checked }));
                                if (checked) {
                                  setTermAlertTriggered(prev => ({ ...prev, [srv.id]: false }));
                                }
                              }}
                              className="mt-0.5 w-4 h-4 rounded accent-yellow-400 text-yellow-400 cursor-pointer shrink-0"
                            />
                            <div className="space-y-0.5">
                              <span className="text-[11px] font-black text-yellow-300 uppercase tracking-wide leading-tight block">
                                "ESTOU CIENTE QUE EM CASO DE CANCELAMENTO TEREI QUE PAGAR A TAXA DE 15% DO VALOR DO SERVIÇO"
                              </span>
                              <span className="text-[9.5px] text-slate-400 block">
                                Termo regulamentar M1 para aceite deste chamado.
                              </span>
                            </div>
                          </label>
                        </div>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => {
                              if (confirm('Deseja mesmo recusar esta proposta? O chamado será cancelado.')) {
                                clientRejectServicePrice(srv.id);
                              }
                            }}
                            className="flex-1 py-2.5 bg-red-600/10 hover:bg-red-600/20 border border-red-500/30 text-red-400 font-bold uppercase rounded-xl cursor-pointer"
                          >
                            Recusar
                          </button>
                          <button
                            type="button"
                            onClick={() => {
                              if (!cancelFeeAgreed[srv.id]) {
                                setTermAlertTriggered(prev => ({ ...prev, [srv.id]: true }));
                                alert('Por favor, confirme a concordância com o termo da taxa de 15% em caso de cancelamento antes de aprovar.');
                                return;
                              }
                              clientAcceptServicePrice(srv.id);
                            }}
                            className={`flex-1 py-2.5 font-black uppercase rounded-xl cursor-pointer shadow-md ${
                              cancelFeeAgreed[srv.id]
                                ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
                                : 'bg-emerald-500/40 text-slate-950/60'
                            }`}
                          >
                            Aprovar & Match
                          </button>
                        </div>
                      </div>
                    )}

                    {/* FLUXO DE FINALIZAÇÃO (AVALIAÇÃO E PAGAMENTO VIA PIX) */}
                    {srv.status === 'relatorio_enviado' && (
                      <div className="p-4 bg-purple-500/5 border border-purple-500/20 rounded-2xl space-y-4">
                        <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                          <div className="flex items-center gap-1.5 text-purple-400">
                            <Sparkles className="w-4 h-4 text-purple-400 fill-purple-400/20" />
                            <span className="text-[10px] font-black uppercase">Laudo de Conclusão M1 Enviado!</span>
                          </div>
                          <span className="text-xs font-mono font-black text-emerald-400">Valor Final: R$ {srv.estimatedPrice.toFixed(2)}</span>
                        </div>

                        <p className="text-[11px] text-slate-300 leading-tight">
                          O profissional credenciado concluiu a atividade e emitiu o Laudo Técnico de Engenharia com as fotos de conclusão correspondentes.
                        </p>

                        <div className="flex gap-2">
                          <button
                            type="button"
                            onClick={() => setInspectingReport(srv)}
                            className="flex-1 py-2 bg-slate-900 border border-slate-800 hover:border-slate-700 text-white font-bold rounded-lg cursor-pointer"
                          >
                            🔍 Ver Fotos / Laudo
                          </button>
                        </div>

                        {/* Pagamento Direto ao Prestador de Serviço */}
                        <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800 space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-[9.5px] font-black uppercase text-slate-400">Pagamento Direto ao Prestador</span>
                            <span className="text-[10px] font-bold text-emerald-400">100% ao Profissional</span>
                          </div>

                          <div className="text-[10px] text-slate-400 font-sans leading-relaxed space-y-1">
                            <p><strong>Favorecido:</strong> <span className="text-white font-bold">{srv.providerName || srv.assignedProviderName || 'Profissional Credenciado'}</span></p>
                            <p><strong>Chave PIX / Contato:</strong> <span className="font-mono text-emerald-400">{srv.providerPixKey || srv.providerPhone || '(11) 96212-2694'}</span></p>
                            <p className="text-[9.5px] text-slate-400 italic pt-0.5">
                              * O pagamento é feito diretamente ao prestador ao final da execução. O prestador transferirá a porcentagem da taxa à M1 e o Admin validará a conclusão.
                            </p>
                          </div>

                          <button
                            type="button"
                            onClick={() => {
                              const key = srv.providerPixKey || srv.providerPhone || 'pix-prestador@m1br.com.br';
                              navigator.clipboard.writeText(key);
                              setCopiedId(srv.id);
                              setTimeout(() => setCopiedId(null), 2500);
                            }}
                            className={`w-full py-2 rounded-lg font-black text-[10px] uppercase flex items-center justify-center gap-1 cursor-pointer transition-all ${
                              copiedId === srv.id 
                                ? 'bg-emerald-500 text-slate-950 shadow-md' 
                                : 'bg-slate-900 hover:bg-slate-800 border border-slate-800 text-emerald-400'
                            }`}
                          >
                            <CreditCard className="w-3.5 h-3.5" />
                            <span>{copiedId === srv.id ? 'Chave Pix Copiada!' : 'Copiar Chave Pix do Prestador'}</span>
                          </button>
                        </div>

                        <button
                          type="button"
                          onClick={() => setRatingModalService(srv)}
                          className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 font-black text-xs uppercase rounded-xl cursor-pointer shadow-md flex items-center justify-center gap-1.5"
                        >
                          <CheckCircle2 className="w-4 h-4 text-slate-950" />
                          <span>Pagar Diretamente ao Prestador & Avaliar ⭐</span>
                        </button>
                      </div>
                    )}

                    {srv.status === 'aguardando_confirmacao_pagamento' && (
                      <div className="p-4 bg-yellow-500/5 border border-yellow-500/20 rounded-2xl space-y-3">
                        <div className="flex items-center gap-1.5 text-yellow-400 border-b border-slate-900 pb-2">
                          <Clock className="w-4 h-4 animate-spin shrink-0" />
                          <span className="text-[10px] font-black uppercase">Pagamento em Validação de Segurança</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">
                          Você registrou e concluiu a transferência direta ao prestador. Nossa equipe M1 Brasil está confirmando a transação para emitir o laudo de conclusão oficial e ativar a garantia técnica de 90 dias.
                        </p>
                        <div className="bg-slate-950 p-3 rounded-xl border border-slate-850 text-[10.5px] text-slate-400 space-y-1">
                          <p><strong>Favorecido:</strong> <span className="text-white font-bold">{srv.providerName || 'Profissional Parceiro'}</span></p>
                          <p><strong>Valor:</strong> <span className="text-emerald-400 font-bold">R$ {srv.estimatedPrice.toFixed(2)}</span></p>
                        </div>
                      </div>
                    )}

                    {/* GENERAL CANCEL BUTTON */}
                    {['solicitado', 'aguardando_despacho_admin', 'despachado_prestador', 'negociando'].includes(srv.status) && (
                      <button
                        type="button"
                        onClick={() => {
                          if (confirm('Deseja realmente cancelar esta solicitação de atendimento?')) {
                            cancelServiceRequest(srv.id, 'Cancelado pelo cliente no portal');
                            alert('QUE PENA QUE VOCÊ CANCELOU, JÁ ESTAVAMOS BUSCANDO UM PROFISSIONAL QUALIFICADO PARA ATENDER A SUA NECESSIDADE, SE QUISER PODERÁ ABRIR UM NOVO CHAMADO!');
                          }
                        }}
                        className="w-full py-2 bg-red-600/10 hover:bg-red-600/20 text-red-400 border border-red-500/20 rounded-xl font-bold uppercase text-[9.5px] cursor-pointer"
                      >
                        Cancelar Chamado de Atendimento
                      </button>
                    )}

                    {srv.status === 'cancelado' && (
                      <div className="p-4 bg-red-500/5 border border-red-500/20 rounded-2xl space-y-2">
                        <div className="flex items-center gap-1.5 text-red-400">
                          <AlertCircle className="w-4 h-4 shrink-0" />
                          <span className="text-[10px] font-black uppercase">Chamado Cancelado</span>
                        </div>
                        <p className="text-[11px] text-slate-300 leading-tight">
                          {srv.cancelledBy === 'Cliente' || srv.cancellationReason === 'Cancelado pelo cliente no portal'
                            ? "QUE PENA QUE VOCÊ CANCELOU, JÁ ESTAVAMOS BUSCANDO UM PROFISSIONAL QUALIFICADO PARA ATENDER A SUA NECESSIDADE, SE QUISER PODERÁ ABRIR UM NOVO CHAMADO!"
                            : (srv.cancellationReason || "Este chamado de atendimento foi cancelado ou recusado pela Central M1.")
                          }
                        </p>
                      </div>
                    )}
                      </>
                    )}

                  </div>
                )}
              </div>
            );
          })}
          
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 mt-4 border-t border-slate-800" id="client-requests-pagination">
              <button
                type="button"
                disabled={activePage === 1}
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                className="px-3.5 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-bold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Anterior
              </button>
              <span className="text-xs font-semibold text-slate-400 font-mono">
                Página {activePage} de {totalPages}
              </span>
              <button
                type="button"
                disabled={activePage === totalPages}
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                className="px-3.5 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-xs font-bold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
              >
                Próximo
              </button>
            </div>
          )}
        </div>
      )}

      {/* 🏁 COMPLETED SERVICE DETAILS MODAL OVERLAY */}
      {inspectingCompleted && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-xl z-[99999] flex items-start justify-center pt-8 sm:pt-14 pb-12 p-3 sm:p-5 overflow-y-auto animate-fade-in" id="completed-service-details-modal">
          <div className="bg-slate-900 border-2 border-emerald-500/50 w-full max-w-xl rounded-3xl flex flex-col shadow-2xl relative text-white max-h-[85vh] overflow-hidden">
            
            {/* Header - Pinned */}
            <div className="p-5 border-b border-slate-800 shrink-0 bg-slate-900 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                </div>
                <div className="text-left">
                  <span className="text-[9px] tracking-[0.1em] font-black text-emerald-400 uppercase block">
                    🎉 ATENDIMENTO CONCLUÍDO E AVALIADO
                  </span>
                  <h2 className="text-base font-black text-white leading-tight uppercase font-sans">
                    Dados do Serviço Executado
                  </h2>
                </div>
              </div>
              
              <button
                type="button"
                onClick={() => setInspectingCompleted(null)}
                className="p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-full transition-colors cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-200 text-left">
              <div className="text-center sm:text-left pb-2">
                <p className="text-xs text-slate-400">
                  Chamado Código <strong className="text-white">#{inspectingCompleted.code}</strong> • Finalizado com garantia M1 Brasil
                </p>
              </div>

              {/* Service details & technical description */}
              <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-left space-y-4">
                <div>
                  <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Título do Atendimento</h4>
                  <p className="text-white font-extrabold text-sm font-sans mt-0.5">{inspectingCompleted.title}</p>
                </div>

                <div className="border-t border-slate-800/60 pt-3">
                  <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Descrição do Problema / Necessidade</h4>
                  <p className="text-slate-300 font-sans text-xs leading-relaxed mt-0.5 whitespace-pre-wrap">{inspectingCompleted.description}</p>
                </div>

                {inspectingCompleted.address && (
                  <div className="border-t border-slate-800/60 pt-3">
                    <h4 className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Endereço de Execução</h4>
                    <p className="text-slate-300 font-sans text-xs mt-0.5 font-bold">
                      {inspectingCompleted.address.street}, nº {inspectingCompleted.address.number}
                    </p>
                    <p className="text-[10px] text-slate-400 font-sans">
                      Bairro: {inspectingCompleted.address.neighborhood} | {inspectingCompleted.address.city} - {inspectingCompleted.address.state || 'SP'} {inspectingCompleted.address.complement && `• Complemento: ${inspectingCompleted.address.complement}`}
                    </p>
                  </div>
                )}
              </div>

              {/* Professional HUD & Execution Summary */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-1.5">
                  <p className="text-slate-500 text-[10px] uppercase font-bold">👨🏼‍🔧 Profissional Credenciado</p>
                  <p className="text-white font-extrabold text-xs">{inspectingCompleted.providerName || 'Especialista Credenciado'}</p>
                  <p className="text-[10px] text-slate-400">Parceiro credenciado e homologado M1</p>
                </div>

                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-1.5">
                  <p className="text-slate-500 text-[10px] uppercase font-bold">💰 Detalhes Financeiros</p>
                  <p className="text-emerald-400 font-mono font-extrabold text-xs">
                    R$ {inspectingCompleted.payment?.totalAmount ? inspectingCompleted.payment.totalAmount.toFixed(2) : inspectingCompleted.estimatedPrice.toFixed(2)}
                  </p>
                  <p className="text-[9px] text-slate-400">Pago integralmente via PIX seguro M1</p>
                </div>
              </div>

              {/* Photo Report / Evidence if any */}
              {inspectingCompleted.photoReport?.photos && inspectingCompleted.photoReport.photos.length > 0 && (
                <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 text-left space-y-2.5">
                  <span className="text-[10px] font-black uppercase text-slate-400 block">Laudo Fotográfico Técnico</span>
                  <div className="flex gap-2 overflow-x-auto pb-1.5 scrollbar-thin">
                    {inspectingCompleted.photoReport.photos.map((photo, i) => (
                      <div key={i} className="flex flex-col items-center gap-1 shrink-0">
                        <img
                          src={photo.url}
                          alt={`Laudo ${photo.type}`}
                          className="w-20 h-20 rounded-xl object-cover border border-slate-800 hover:scale-105 transition-transform cursor-pointer"
                        />
                        <span className="text-[8px] uppercase font-black px-1.5 py-0.5 rounded bg-slate-900 border border-slate-800 text-slate-400">
                          {photo.type === 'before' ? 'Antes' : 'Depois'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Customer Rating Section */}
              {inspectingCompleted.rating && (
                <div className="bg-slate-950/80 p-5 rounded-2xl border border-slate-800 text-left space-y-3">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Sua Avaliação do Atendimento</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star key={star} className={`w-4 h-4 ${star <= (inspectingCompleted.rating?.score || 5) ? 'text-amber-400 fill-amber-400' : 'text-slate-850'}`} />
                    ))}
                    <span className="text-xs font-black text-slate-300 ml-1.5">({inspectingCompleted.rating.score} / 5)</span>
                  </div>
                  {inspectingCompleted.rating.comment && (
                    <p className="text-[11px] text-slate-300 italic bg-slate-900 p-3 rounded-xl border border-slate-850">
                      "{inspectingCompleted.rating.comment}"
                    </p>
                  )}
                </div>
              )}
            </div>

            {/* Footer - Pinned */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
              <button
                type="button"
                onClick={() => setInspectingCompleted(null)}
                className="w-full py-3.5 bg-slate-800 hover:bg-slate-750 text-slate-200 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer hover:text-white transition-colors"
              >
                Fechar Visualização
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
