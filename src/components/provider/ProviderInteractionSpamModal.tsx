import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import {
  ServiceRequest,
  ProviderProfile,
  PhotoReport,
  MediaItem
} from '../../types';
import {
  MapPin,
  Navigation,
  CheckCircle2,
  Clock,
  Phone,
  MessageSquare,
  AlertTriangle,
  Camera,
  Video,
  Upload,
  Send,
  Sparkles,
  Layers,
  ChevronDown,
  Minimize2,
  Maximize2,
  ExternalLink,
  DollarSign,
  User,
  ShieldCheck,
  FileText,
  X,
  Plus
} from 'lucide-react';

interface ProviderInteractionSpamModalProps {
  job: ServiceRequest;
  provider: ProviderProfile;
  isOpen: boolean;
  onClose: () => void;
  onArrived: (serviceId: string) => void;
  onStartExecution: (serviceId: string) => void;
  onSubmitReport: (serviceId: string, report: PhotoReport) => void;
  onUpdateEta?: (serviceId: string, minutes: number) => void;
  onNotifyFeeTransferred?: (serviceId: string) => void;
}

export const ProviderInteractionSpamModal: React.FC<ProviderInteractionSpamModalProps> = ({
  job,
  provider,
  isOpen,
  onClose,
  onArrived,
  onStartExecution,
  onSubmitReport,
  onUpdateEta,
  onNotifyFeeTransferred
}) => {
  const [isMinimized, setIsMinimized] = useState(false);
  const { settings } = useApp();
  
  // Report Form State
  const [reportNotes, setReportNotes] = useState(job.photoReport?.notes || '');
  const [materialsUsed, setMaterialsUsed] = useState(job.photoReport?.materialsUsed || '');
  const [futureRecommendations, setFutureRecommendations] = useState(job.photoReport?.futureRecommendations || '');
  const [timeSpent, setTimeSpent] = useState<number>(job.photoReport?.timeSpentMinutes || 45);
  
  // Media State
  const [beforePhotos, setBeforePhotos] = useState<MediaItem[]>(
    job.photoReport?.beforePhotos || job.media || []
  );
  const [afterPhotos, setAfterPhotos] = useState<MediaItem[]>(
    job.photoReport?.afterPhotos || []
  );
  const [videoUrl, setVideoUrl] = useState<string>(job.photoReport?.videoUrl || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [validationError, setValidationError] = useState('');

  // Sync if job changes
  useEffect(() => {
    if (job.photoReport) {
      setReportNotes(job.photoReport.notes || '');
      setMaterialsUsed(job.photoReport.materialsUsed || '');
      setFutureRecommendations(job.photoReport.futureRecommendations || '');
      setTimeSpent(job.photoReport.timeSpentMinutes || 45);
      if (job.photoReport.beforePhotos?.length) setBeforePhotos(job.photoReport.beforePhotos);
      if (job.photoReport.afterPhotos?.length) setAfterPhotos(job.photoReport.afterPhotos);
      if (job.photoReport.videoUrl) setVideoUrl(job.photoReport.videoUrl);
    } else {
      if (job.media?.length && beforePhotos.length === 0) {
        setBeforePhotos(job.media);
      }
    }
  }, [job.id, job.status, job.photoReport]);

  if (!isOpen) return null;

  // Minimized floating banner
  if (isMinimized) {
    return (
      <div className="fixed bottom-4 right-4 z-[999980] modal-crisp">
        <button
          onClick={() => setIsMinimized(false)}
          className="bg-emerald-600 hover:bg-emerald-500 text-white p-4 rounded-2xl shadow-[0_0_30px_rgba(16,185,129,0.4)] border-2 border-emerald-400 flex items-center gap-3 cursor-pointer transition-all"
        >
          <span className="w-3 h-3 rounded-full bg-white animate-ping" />
          <div className="text-left text-xs">
            <p className="font-black uppercase tracking-wider">SPAM Interação Ativo</p>
            <p className="font-medium text-emerald-100">Chamado #{job.code} • {job.status.replace('_', ' ').toUpperCase()}</p>
          </div>
          <Maximize2 className="w-4 h-4 ml-2" />
        </button>
      </div>
    );
  }

  // Handle Photo Upload
  const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>, type: 'before' | 'after') => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file: File, idx: number) => {
      const reader = new FileReader();
      reader.onload = (event) => {
        const newPhoto: MediaItem = {
          id: `media-${Date.now()}-${idx}-${Math.random().toString(36).substring(7)}`,
          url: event.target?.result as string,
          type: 'photo',
          caption: type === 'before' ? 'Foto da chegada / inicial' : 'Serviço concluído / final',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };

        if (type === 'before') {
          setBeforePhotos(prev => [...prev, newPhoto]);
        } else {
          setAfterPhotos(prev => [...prev, newPhoto]);
        }
      };
      reader.readAsDataURL(file);
    });
  };

  // Handle Video Upload
  const handleVideoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      setVideoUrl(event.target?.result as string);
    };
    reader.readAsDataURL(file);
  };

  // Quick Preset Sample Photos (for testing if user has no camera/files)
  const handleAddSamplePhotos = () => {
    const sampleAfter: MediaItem = {
      id: `sample-after-${Date.now()}`,
      url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
      type: 'photo',
      caption: 'Instalação / Reparo finalizado com sucesso e testado',
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };
    setAfterPhotos(prev => [...prev, sampleAfter]);
    if (beforePhotos.length === 0) {
      setBeforePhotos([
        {
          id: `sample-before-${Date.now()}`,
          url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
          type: 'photo',
          caption: 'Problema diagnosticado no início',
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }
  };

  // Submit Final Report
  const handleSubmitReportForm = () => {
    setValidationError('');
    if (!reportNotes.trim()) {
      setValidationError('Por favor, descreva o relatório em texto do serviço realizado.');
      return;
    }

    setIsSubmitting(true);

    const finalReport: PhotoReport = {
      beforePhotos: beforePhotos.length > 0 ? beforePhotos : (job.media || []),
      afterPhotos: afterPhotos.length > 0 ? afterPhotos : (beforePhotos.length > 0 ? beforePhotos : (job.media || [])),
      notes: reportNotes.trim(),
      materialsUsed: materialsUsed.trim(),
      futureRecommendations: futureRecommendations.trim(),
      videoUrl: videoUrl || undefined,
      checklist: [
        { id: '1', label: 'Inspeção de segurança realizada', completed: true },
        { id: '2', label: 'Execução do serviço técnico conforme normas', completed: true },
        { id: '3', label: 'Limpeza e organização da área de trabalho', completed: true },
        { id: '4', label: 'Testes operacionais finais aprovados', completed: true }
      ],
      timeSpentMinutes: timeSpent,
      submittedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    onSubmitReport(job.id, finalReport);
    setIsSubmitting(false);
  };

  // Navigation URLs
  const encodedAddress = encodeURIComponent(
    `${job.address.street}, ${job.address.number || ''}, ${job.address.neighborhood || ''}, ${job.address.city}`
  );
  const googleMapsUrl = `https://www.google.com/maps/dir/?api=1&destination=${encodedAddress}`;
  const wazeUrl = `https://waze.com/ul?q=${encodedAddress}&navigate=yes`;
  const cleanPhone = job.clientPhone.replace(/\D/g, '');
  const whatsappUrl = `https://wa.me/55${cleanPhone}?text=${encodeURIComponent(
    `Olá ${job.clientName}, sou o técnico ${provider.name} da M1 Brasil. Estou a caminho para realizar seu chamado #${job.code} (${job.title}).`
  )}`;

  const isEmDeslocamento = job.status === 'em_deslocamento';
  const isChegouAoLocal = job.status === 'chegou_ao_local';
  const isEmExecucao = job.status === 'em_execucao';
  const isRelatorioEnviado = job.status === 'relatorio_enviado';
  const isAguardandoPagamento = job.status === 'aguardando_confirmacao_pagamento';

  return (
    <div className="fixed inset-0 z-[999980] bg-black/92 backdrop-blur-md flex justify-center items-start p-2 sm:p-4 md:p-6 overflow-y-auto animate-fade-in">
      <div className="bg-slate-950 border-2 border-emerald-500 w-full max-w-4xl rounded-3xl shadow-[0_0_80px_rgba(16,185,129,0.3)] overflow-hidden my-auto sm:my-8 flex flex-col modal-crisp">
        
        {/* TOP STATUS BAR (Flashing Siren Interaction HUD) */}
        <div className={`p-4 sm:p-5 text-white flex items-center justify-between gap-4 border-b border-slate-800 ${
          isEmDeslocamento
            ? 'bg-gradient-to-r from-emerald-900/90 via-slate-900 to-teal-900/90'
            : isChegouAoLocal
            ? 'bg-gradient-to-r from-cyan-900/90 via-slate-900 to-blue-900/90'
            : isEmExecucao
            ? 'bg-gradient-to-r from-violet-900/90 via-slate-900 to-indigo-900/90'
            : isAguardandoPagamento
            ? 'bg-gradient-to-r from-amber-900/90 via-slate-900 to-orange-900/90'
            : 'bg-gradient-to-r from-teal-900/90 via-slate-900 to-slate-900/90'
        }`}>
          <div className="flex items-center gap-3">
            <div className="relative flex items-center justify-center w-11 h-11 rounded-2xl bg-black/50 border border-white/20">
              <span className="w-3.5 h-3.5 rounded-full bg-emerald-400 animate-ping absolute" />
              <Navigation className={`w-6 h-6 ${isEmDeslocamento ? 'text-emerald-400 animate-pulse' : 'text-cyan-400'}`} />
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-red-600 text-white text-[10px] font-black uppercase tracking-widest animate-pulse shadow-md">
                  🚨 SPAM INTERAÇÃO TEMPO REAL
                </span>
                <span className="text-xs text-slate-300 font-mono font-bold">
                  Chamado #{job.code}
                </span>
              </div>
              <h2 className="text-base sm:text-lg font-black text-white uppercase tracking-tight mt-0.5">
                {isEmDeslocamento && '🚗 VOCÊ ESTÁ A CAMINHO DO LOCAL'}
                {isChegouAoLocal && '📍 PRESENÇA CONFIRMADA NO LOCAL DO CLIENTE'}
                {isEmExecucao && '⚡ ATENDIMENTO TÉCNICO EM ANDAMENTO'}
                {isRelatorioEnviado && '✅ RELATÓRIO TÉCNICO ENVIADO AO CLIENTE'}
                {isAguardandoPagamento && '💰 REPASSE DE TAXA DA CENTRAL M1 PENDENTE'}
              </h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(true)}
              className="p-2 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-colors cursor-pointer"
              title="Minimizar SPAM"
            >
              <Minimize2 className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-xl transition-colors cursor-pointer"
              title="Fechar janela"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* SCROLLABLE CONTENT BODY */}
        <div className="p-4 sm:p-6 overflow-y-auto space-y-6 flex-1 text-slate-200">

          {/* SECTION 1: CLIENT & ROUTE HUD ("A CAMINHO") */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Client Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-4 h-4 text-emerald-400" />
                  Dados do Cliente
                </span>
                <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 text-[10px] font-bold border border-emerald-500/20">
                  Cliente Verificado
                </span>
              </div>

              <div>
                <p className="text-base font-black text-white">{job.clientName}</p>
                <p className="text-xs text-slate-400 mt-0.5">{job.clientPhone}</p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={`tel:${cleanPhone}`}
                  className="flex-1 py-2 px-3 bg-slate-800 hover:bg-slate-750 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-slate-700 transition-colors"
                >
                  <Phone className="w-3.5 h-3.5 text-blue-400" />
                  <span>Ligar</span>
                </a>
                <a
                  href={whatsappUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 shadow-md shadow-emerald-600/30 transition-colors"
                >
                  <MessageSquare className="w-3.5 h-3.5" />
                  <span>WhatsApp</span>
                </a>
              </div>
            </div>

            {/* Address & Navigation Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 space-y-3">
              <div className="flex items-center justify-between border-b border-slate-800 pb-2">
                <span className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-4 h-4 text-rose-400" />
                  Endereço do Local
                </span>
                <span className="text-xs text-emerald-400 font-bold flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5" />
                  Previsão: {job.estimatedArrivalMinutes || 15} min
                </span>
              </div>

              <div>
                <p className="text-sm font-bold text-white">
                  {job.address.street}, {job.address.number}
                  {job.address.complement ? ` - ${job.address.complement}` : ''}
                </p>
                <p className="text-xs text-slate-400">
                  {job.address.neighborhood} • {job.address.city}/{job.address.state || 'SP'}
                </p>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <a
                  href={googleMapsUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-blue-500/40 shadow-sm transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-blue-200" />
                  <span>Google Maps</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
                <a
                  href={wazeUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2 px-3 bg-cyan-600/90 hover:bg-cyan-600 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 border border-cyan-500/40 shadow-sm transition-colors"
                >
                  <Navigation className="w-3.5 h-3.5 text-cyan-200" />
                  <span>Waze</span>
                  <ExternalLink className="w-3 h-3 opacity-60" />
                </a>
              </div>
            </div>
          </div>

          {/* Financial & Job Details Banner */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 flex flex-wrap items-center justify-between gap-4">
            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-wider text-slate-400">
                Atividade Solicitada
              </span>
              <p className="text-sm font-black text-white">{job.title}</p>
              <p className="text-xs text-slate-400 line-clamp-2 max-w-xl">{job.description}</p>
            </div>

            <div className="bg-slate-950 border border-slate-850 px-4 py-2.5 rounded-xl text-right">
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
                Valor Total do Serviço
              </span>
              <div className="text-base font-black text-emerald-400 font-mono">
                R$ {job.payment.totalAmount.toFixed(2)}
              </div>
              <span className="text-[10px] text-slate-400">
                Seu repasse líquido: <strong className="text-emerald-300 font-mono">R$ {job.payment.providerPayoutAmount.toFixed(2)}</strong>
              </span>
            </div>
          </div>

          {/* WORKFLOW PHASE ACTIONS */}

          {/* 1. EM DESLOCAMENTO -> Action: "CHEGUEI NO LOCAL" */}
          {isEmDeslocamento && (
            <div className="p-5 rounded-3xl bg-emerald-950/40 border-2 border-emerald-500/60 text-center space-y-4 shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-500/40">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                Deslocamento em Tempo Real
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Assim que chegar no endereço do cliente, confirme abaixo:
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  O cliente receberá uma notificação instantânea e som de aviso comunicando sua chegada no portão/recepção.
                </p>
              </div>

              <button
                onClick={() => onArrived(job.id)}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all transform hover:scale-102 active:scale-98"
              >
                <MapPin className="w-5 h-5 text-slate-950" />
                <span>📍 CHEGUEI NO LOCAL (CONFIRMAR PRESENÇA)</span>
              </button>
            </div>
          )}

          {/* 2. CHEGOU AO LOCAL -> Action: "INICIAR ATIVIDADE & PREPARAR RELATÓRIO" */}
          {isChegouAoLocal && (
            <div className="p-5 rounded-3xl bg-cyan-950/40 border-2 border-cyan-500/60 text-center space-y-4 shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-cyan-500/20 text-cyan-300 rounded-full text-xs font-black uppercase tracking-wider border border-cyan-500/40">
                <CheckCircle2 className="w-3.5 h-3.5 text-cyan-400" />
                Presença Registrada ({job.arrivedAt || 'Hoje'})
              </div>

              <div>
                <h3 className="text-lg sm:text-xl font-black text-white">
                  Você está no local! Inicie a execução técnica da atividade:
                </h3>
                <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                  Clique abaixo para marcar o início do atendimento e habilitar o preenchimento do relatório fotográfico e de materiais.
                </p>
              </div>

              <button
                onClick={() => onStartExecution(job.id)}
                className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-cyan-500/30 flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all transform hover:scale-102 active:scale-98"
              >
                <Sparkles className="w-5 h-5 text-slate-950" />
                <span>⚡ INICIAR ATIVIDADE & PREPARAR RELATÓRIO</span>
              </button>
            </div>
          )}

          {/* 3. EM EXECUÇÃO -> Form: Relatório em texto, materiais, orientações futuras, fotos, vídeo curto & "ENVIAR RELATÓRIO" */}
          {(isEmExecucao || isChegouAoLocal) && (
            <div className="bg-slate-900/90 border border-slate-800 rounded-3xl p-5 sm:p-6 space-y-6">
              <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base sm:text-lg font-black text-white flex items-center gap-2">
                    <FileText className="w-5 h-5 text-emerald-400" />
                    <span>Relatório da Atividade Executada</span>
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Preencha o laudo para que o cliente confirme, realize o pagamento via Pix e avalie o serviço.
                  </p>
                </div>

                <button
                  type="button"
                  onClick={handleAddSamplePhotos}
                  className="text-xs px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-750 text-slate-300 border border-slate-700 font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span>Carregar Fotos Modelo (Teste)</span>
                </button>
              </div>

              {validationError && (
                <div className="p-3 bg-red-950/60 border border-red-500/50 rounded-xl text-red-300 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                  <span>{validationError}</span>
                </div>
              )}

              {/* Field 1: Relatório em Texto da Atividade */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>1. Relatório em Texto da Atividade Executada *</span>
                  <span className="text-slate-500 font-normal lowercase">Obrigatório</span>
                </label>
                <textarea
                  value={reportNotes}
                  onChange={(e) => setReportNotes(e.target.value)}
                  placeholder="Ex: Realizado diagnóstico no circuito elétrico, identificado curto-circuito no disjuntor principal. Substituído o disjuntor bipolar de 32A, reapertadas todas as conexões do quadro geral e efetuados testes de carga em todas as tomadas. Sistema normalizado com medição de 220V estável."
                  rows={3}
                  className="w-full bg-slate-950 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                />
              </div>

              {/* Field 2: Materiais Utilizados */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center justify-between">
                  <span>2. Materiais, Peças e Insumos Utilizados</span>
                  <span className="text-slate-500 font-normal lowercase">Opcional</span>
                </label>
                <input
                  type="text"
                  value={materialsUsed}
                  onChange={(e) => setMaterialsUsed(e.target.value)}
                  placeholder="Ex: 1x Disjuntor bipolar 32A Steck, 2m fio rígido 4mm, 4x conectores Wago, fita isolante 3M"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-all"
                />
              </div>

              {/* Field 3: Observações e Orientações Futuras da Atividade (OPCIONAL) */}
              <div className="space-y-2">
                <label className="text-xs font-black uppercase tracking-wider text-amber-400 flex items-center justify-between">
                  <span className="flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                    3. Observações e Orientações Futuras da Atividade (OPCIONAL)
                  </span>
                  <span className="text-amber-500/80 font-normal lowercase">Recomendações técnicas</span>
                </label>
                <textarea
                  value={futureRecommendations}
                  onChange={(e) => setFutureRecommendations(e.target.value)}
                  placeholder="Ex: Recomenda-se realizar revisão preventiva anual no quadro de disjuntores. Evitar ligar chuveiro e aquecedor elétrico simultaneamente no mesmo circuito. Garantia do serviço executado de 90 dias pela M1 Brasil."
                  rows={2}
                  className="w-full bg-slate-950 border border-amber-500/30 rounded-2xl p-3.5 text-xs text-amber-200/90 placeholder-slate-600 outline-none focus:border-amber-500 transition-all"
                />
              </div>

              {/* Field 4: Fotos da Atividade (Antes e Depois) */}
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Camera className="w-4 h-4 text-emerald-400" />
                    4. Fotos da Atividade (Antes & Concluído)
                  </label>
                  <span className="text-xs text-slate-400">
                    {beforePhotos.length + afterPhotos.length} foto(s) anexada(s)
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* Upload Antes */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-rose-500" />
                        Fotos do Antes ({beforePhotos.length})
                      </span>
                      <label className="cursor-pointer px-2.5 py-1 bg-slate-800 hover:bg-slate-750 text-slate-200 rounded-lg text-[11px] font-bold flex items-center gap-1 border border-slate-700">
                        <Plus className="w-3 h-3" />
                        <span>Adicionar</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handlePhotoUpload(e, 'before')}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-3 gap-2 min-h-[70px]">
                      {beforePhotos.map((p, idx) => (
                        <div key={p.id || idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 border border-slate-800 group">
                          <img src={p.url} alt="Antes" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setBeforePhotos(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-1 rounded bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {beforePhotos.length === 0 && (
                        <div className="col-span-3 py-4 text-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-xl">
                          Nenhuma foto inicial anexada
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Upload Depois / Concluído */}
                  <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5">
                        <span className="w-2 h-2 rounded-full bg-emerald-500" />
                        Fotos do Serviço Concluído ({afterPhotos.length})
                      </span>
                      <label className="cursor-pointer px-2.5 py-1 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-[11px] font-bold flex items-center gap-1 shadow-sm">
                        <Plus className="w-3 h-3" />
                        <span>Adicionar</span>
                        <input
                          type="file"
                          accept="image/*"
                          multiple
                          onChange={(e) => handlePhotoUpload(e, 'after')}
                          className="hidden"
                        />
                      </label>
                    </div>

                    <div className="grid grid-cols-3 gap-2 min-h-[70px]">
                      {afterPhotos.map((p, idx) => (
                        <div key={p.id || idx} className="relative aspect-square rounded-lg overflow-hidden bg-slate-900 border border-slate-800 group">
                          <img src={p.url} alt="Depois" className="w-full h-full object-cover" />
                          <button
                            type="button"
                            onClick={() => setAfterPhotos(prev => prev.filter((_, i) => i !== idx))}
                            className="absolute top-1 right-1 p-1 rounded bg-red-600/80 hover:bg-red-600 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        </div>
                      ))}
                      {afterPhotos.length === 0 && (
                        <div className="col-span-3 py-4 text-center text-xs text-slate-600 border border-dashed border-slate-800 rounded-xl">
                          Nenhuma foto final anexada
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>

              {/* Field 5: Vídeo Curto Comprovatório */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-300 flex items-center gap-1.5">
                    <Video className="w-4 h-4 text-blue-400" />
                    5. Vídeo Curto Comprovatório da Atividade
                  </label>
                  <span className="text-slate-500 text-xs">MP4, WebM ou gravação rápida</span>
                </div>

                <div className="p-4 bg-slate-950 rounded-2xl border border-slate-850 flex flex-col sm:flex-row items-center justify-between gap-4">
                  {videoUrl ? (
                    <div className="w-full space-y-2">
                      <div className="flex items-center justify-between text-xs text-emerald-400 font-bold">
                        <span>✓ Vídeo curto carregado</span>
                        <button
                          type="button"
                          onClick={() => setVideoUrl('')}
                          className="text-red-400 hover:text-red-300 underline text-xs"
                        >
                          Remover vídeo
                        </button>
                      </div>
                      <video
                        src={videoUrl}
                        controls
                        className="w-full max-h-48 rounded-xl bg-black border border-slate-800"
                      />
                    </div>
                  ) : (
                    <label className="w-full py-6 border-2 border-dashed border-slate-800 hover:border-slate-700 rounded-2xl flex flex-col items-center justify-center gap-2 cursor-pointer transition-colors text-slate-400 hover:text-slate-300">
                      <Upload className="w-6 h-6 text-blue-400" />
                      <span className="text-xs font-bold">Clique para gravar ou selecionar vídeo curto</span>
                      <span className="text-[11px] text-slate-500">Comprovação do equipamento ou instalação funcionando</span>
                      <input
                        type="file"
                        accept="video/*"
                        onChange={handleVideoUpload}
                        className="hidden"
                      />
                    </label>
                  )}
                </div>
              </div>

              {/* Field 6: Tempo Gasto */}
              <div className="flex items-center justify-between bg-slate-950 p-3.5 rounded-xl border border-slate-850 text-xs">
                <span className="text-slate-400 font-bold flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  Duração estimada do atendimento:
                </span>
                <div className="flex items-center gap-2">
                  <input
                    type="number"
                    min={10}
                    max={360}
                    step={5}
                    value={timeSpent}
                    onChange={(e) => setTimeSpent(Number(e.target.value) || 30)}
                    className="w-20 bg-slate-900 border border-slate-700 rounded-lg px-2 py-1 text-center font-bold text-white outline-none focus:border-emerald-500"
                  />
                  <span className="text-slate-400 font-medium">minutos</span>
                </div>
              </div>

              {/* ACTION BUTTON: "ENVIAR RELATÓRIO" */}
              <button
                type="button"
                onClick={handleSubmitReportForm}
                disabled={isSubmitting}
                className="w-full py-4 bg-gradient-to-r from-emerald-500 via-teal-400 to-emerald-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/30 flex items-center justify-center gap-2 cursor-pointer transition-all hover:brightness-105 active:scale-[0.99] disabled:opacity-50"
              >
                <Send className="w-5 h-5 text-slate-950" />
                <span>ENVIAR RELATÓRIO (NOTIFICAR CLIENTE PARA PAGAMENTO & AVALIAÇÃO)</span>
              </button>
            </div>
          )}

          {/* 4. RELATÓRIO ENVIADO -> Waiting for client payment and evaluation */}
          {isRelatorioEnviado && (
            <div className="p-6 rounded-3xl bg-emerald-950/40 border-2 border-emerald-500/60 text-center space-y-4 shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-black uppercase tracking-wider border border-emerald-500/40">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                Relatório Enviado em Tempo Real
              </div>

              <div>
                <h3 className="text-xl font-black text-white">
                  🎉 Relatório entregue ao cliente com sucesso!
                </h3>
                <p className="text-xs text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
                  O cliente recebeu o laudo fotográfico, materiais e observações no aplicativo dele. Ele está confirmando a conclusão, efetuando o pagamento via Pix e avaliando seu atendimento.
                </p>
              </div>

              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 max-w-lg mx-auto text-left text-xs space-y-2">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400">Total a Receber:</span>
                  <span className="font-mono font-black text-emerald-400">
                    R$ {job.payment.providerPayoutAmount.toFixed(2)}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Status da Transação:</span>
                  <span className="text-amber-300 font-bold flex items-center gap-1">
                    <Clock className="w-3.5 h-3.5" />
                    Aguardando Pix do Cliente
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* 5. AGUARDANDO REPASSE DA TAXA / CONFIRMAÇÃO DO ADMIN */}
          {isAguardandoPagamento && (
            <div className="p-6 rounded-3xl bg-amber-950/40 border-2 border-amber-500/60 text-center space-y-4 shadow-xl">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-amber-500/20 text-amber-300 rounded-full text-xs font-black uppercase tracking-wider border border-amber-500/40 animate-pulse">
                <DollarSign className="w-4 h-4 text-amber-400" />
                Repasse de Taxa Pendente
              </div>

              <div>
                <h3 className="text-xl font-black text-white">
                  💰 Cliente pagou! Agora realize o repasse de taxa de R$ {job.payment.platformFeeAmount.toFixed(2)}
                </h3>
                <p className="text-xs text-slate-300 max-w-lg mx-auto mt-2 leading-relaxed">
                  O cliente realizou o pagamento de <strong>R$ {job.payment.totalAmount.toFixed(2)}</strong> diretamente a você. Conforme as regras da plataforma M1 Brasil, você deve transferir a taxa de intermediação de R$ {job.payment.platformFeeAmount.toFixed(2)} à Central M1.
                </p>
              </div>

              {job.payment.providerTransferredFee ? (
                <div className="p-4 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl max-w-lg mx-auto text-center space-y-1">
                  <span className="text-xs font-black text-emerald-400 uppercase tracking-wider block">
                    ✓ Comprovante Enviado com Sucesso!
                  </span>
                  <p className="text-xs text-slate-300">
                    Você já notificou o envio do repasse à M1. O Administrador está auditando a transação e encerrará o chamado em instantes!
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-4 max-w-lg mx-auto text-left text-xs space-y-2">
                    <p className="font-bold text-white text-center border-b border-slate-800 pb-2 mb-1">DADOS DA CONTA M1 BRASIL</p>
                    <p><strong>Favorecido:</strong> {settings.pixReceiverName || 'M1 Brasil Serviços'}</p>
                    {settings.pixReceiverCnpj && <p><strong>CNPJ:</strong> {settings.pixReceiverCnpj}</p>}
                    <p><strong>Banco:</strong> {settings.pixReceiverBank || 'Banco Inter / Bradesco'}</p>
                    {settings.pixReceiverAgency && <p><strong>Agência:</strong> {settings.pixReceiverAgency}</p>}
                    {settings.pixReceiverAccount && <p><strong>Conta Corrente:</strong> {settings.pixReceiverAccount}</p>}
                    <p><strong>Chave Pix ({settings.pixReceiverType || 'Chave Pix'}):</strong> <span className="font-mono text-emerald-400 font-bold">{settings.pixReceiverKey}</span></p>
                    <p className="pt-1.5 border-t border-slate-800 font-bold text-amber-400"><strong>Valor do Repasse:</strong> R$ {job.payment.platformFeeAmount.toFixed(2)}</p>
                  </div>

                  {onNotifyFeeTransferred && (
                    <button
                      type="button"
                      onClick={() => onNotifyFeeTransferred(job.id)}
                      className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-400 hover:to-orange-400 text-slate-950 font-black text-sm uppercase tracking-wider rounded-2xl shadow-xl shadow-amber-500/30 flex items-center justify-center gap-2 mx-auto cursor-pointer transition-all transform hover:scale-102 active:scale-98"
                    >
                      <CheckCircle2 className="w-5 h-5 text-slate-950" />
                      <span>ENVIAR COMPROVANTE (NOTIFICAR ADM CENTRAL)</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

        </div>

        {/* MODAL FOOTER */}
        <div className="p-4 bg-slate-950 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>M1 Brasil • Interações e Registros Criptografados em Tempo Real</span>
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-900 hover:bg-slate-800 text-slate-300 rounded-xl border border-slate-800 font-bold transition-colors cursor-pointer"
          >
            Fechar Janela
          </button>
        </div>

      </div>
    </div>
  );
};
