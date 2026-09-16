import React from 'react';
import {
  X,
  FileText,
  CheckCircle2,
  Clock,
  DollarSign,
  Calendar,
  MapPin,
  User,
  Image as ImageIcon,
  Video,
  ShieldCheck,
  Star,
  Wrench,
  Sparkles,
  Printer,
  Archive,
  Check,
  Phone
} from 'lucide-react';
import { ServiceRequest, MediaItem } from '../../types';

interface ProviderHistoryReportModalProps {
  service: ServiceRequest;
  onClose: () => void;
  onZoomPhoto: (url: string) => void;
}

export const ProviderHistoryReportModal: React.FC<ProviderHistoryReportModalProps> = ({
  service,
  onClose,
  onZoomPhoto
}) => {
  const report = service.photoReport;
  const rating = service.rating;
  const payment = service.payment;
  const totalPaidToProvider = payment.providerPayoutAmount + (rating?.tipAmount || 0);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/80 backdrop-blur-sm overflow-y-auto animate-fadeIn">
      <div className="bg-slate-900 border border-slate-700/80 rounded-3xl w-full max-w-3xl max-h-[90vh] flex flex-col shadow-2xl overflow-hidden my-auto text-slate-100">
        
        {/* Header */}
        <div className="px-6 py-4 bg-slate-950 border-b border-slate-800 flex items-center justify-between sticky top-0 z-10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-mono text-xs font-black bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/30">
                  {service.code}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-slate-800 text-slate-300 border border-slate-700">
                  {service.category.replace('_', ' ')}
                </span>
                <span className="flex items-center gap-1 text-[10px] font-bold text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/80">
                  <Archive className="w-3 h-3" />
                  Salvo na Pasta Arquivo M1
                </span>
              </div>
              <h2 className="text-base font-black text-white mt-0.5">{service.title}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors cursor-pointer"
              title="Imprimir / Salvar PDF"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition-colors cursor-pointer"
              title="Fechar"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6 overflow-y-auto">

          {/* 1. Sumário de Controle: Data, Horário e Tempo de Execução */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                Data & Hora
              </span>
              <p className="text-xs font-bold text-white">
                {service.completedAt || service.photoReport?.submittedAt || service.createdAt || 'Recentemente'}
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-cyan-400 font-bold uppercase flex items-center gap-1">
                <Clock className="w-3 h-3 text-cyan-400" />
                Tempo de Execução
              </span>
              <p className="text-xs font-black text-cyan-300 font-mono">
                {report?.timeSpentMinutes ? `${report.timeSpentMinutes} minutos` : '45 minutos'}
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-slate-800 space-y-1">
              <span className="text-[10px] text-slate-400 font-bold uppercase flex items-center gap-1">
                <DollarSign className="w-3 h-3 text-slate-400" />
                Valor Total Cobrado
              </span>
              <p className="text-xs font-black text-white font-mono">
                R$ {payment.totalAmount.toFixed(2)}
              </p>
            </div>

            <div className="bg-slate-950 p-3 rounded-2xl border border-emerald-900/60 bg-emerald-950/20 space-y-1">
              <span className="text-[10px] text-emerald-400 font-bold uppercase flex items-center gap-1">
                <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                Seu Repasse Líquido
              </span>
              <p className="text-xs font-black text-emerald-400 font-mono">
                R$ {totalPaidToProvider.toFixed(2)}
              </p>
            </div>
          </div>

          {/* 2. Dados do Cliente e Local de Atendimento */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
            <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
              <MapPin className="w-3.5 h-3.5 text-rose-400" />
              <span>Local e Dados do Atendimento</span>
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
              <div className="space-y-1">
                <p className="text-slate-300 flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-slate-500" />
                  <strong>Cliente:</strong> {service.clientName}
                </p>
                {service.clientPhone && (
                  <p className="text-slate-400 flex items-center gap-1.5">
                    <Phone className="w-3.5 h-3.5 text-slate-500" />
                    <strong>Telefone:</strong> {service.clientPhone}
                  </p>
                )}
              </div>
              <div className="text-slate-300 space-y-0.5">
                <p>
                  <strong>Endereço:</strong> {service.address?.street}, {service.address?.number}
                </p>
                <p className="text-slate-400">
                  {service.address?.neighborhood} - {service.address?.city}/{service.address?.state}
                </p>
              </div>
            </div>
          </div>

          {/* 3. Relatório Técnico do que foi executado */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div className="flex items-center justify-between border-b border-slate-850 pb-2">
              <h3 className="text-xs font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1.5">
                <FileText className="w-3.5 h-3.5 text-emerald-400" />
                <span>Laudo Técnico & Relatório Executado</span>
              </h3>
              <span className="text-[10px] text-slate-500 font-mono">
                Enviado em: {report?.submittedAt || service.completedAt || 'Finalizado'}
              </span>
            </div>

            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400">Parecer Técnico / O que foi executado:</span>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
                {report?.notes || service.description || 'Serviço executado com êxito conforme normas técnicas e padrões de qualidade M1 Brasil.'}
              </div>
            </div>

            {/* Materiais Utilizados */}
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                <Wrench className="w-3 h-3 text-amber-400" />
                Materiais e Peças Utilizadas:
              </span>
              <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-amber-300/90 leading-relaxed">
                {report?.materialsUsed || 'Peças padrão e ferramentas do kit profissional M1.'}
              </div>
            </div>

            {/* Orientações Futuras */}
            {report?.futureRecommendations && (
              <div className="space-y-1.5">
                <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-cyan-400" />
                  Orientações Futuras e Recomendações Preventivas:
                </span>
                <div className="bg-slate-900 p-3 rounded-xl border border-slate-800 text-xs text-cyan-300/90 leading-relaxed">
                  {report.futureRecommendations}
                </div>
              </div>
            )}

            {/* Checklist */}
            {report?.checklist && report.checklist.length > 0 && (
              <div className="space-y-1.5 pt-1">
                <span className="text-[11px] font-bold text-slate-400">Checklist Operacional Realizado:</span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5">
                  {report.checklist.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300 bg-slate-900/60 p-2 rounded-lg border border-slate-850">
                      <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{item.label}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* 4. Fotos do Serviço (Antes e Depois) */}
          <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
            <h3 className="text-xs font-black uppercase text-slate-300 tracking-wider flex items-center gap-1.5">
              <ImageIcon className="w-3.5 h-3.5 text-emerald-400" />
              <span>Fotos Comprobatórias do Serviço</span>
            </h3>

            {/* Fotos de Antes */}
            <div className="space-y-2">
              <span className="text-[11px] font-bold text-rose-400 flex items-center gap-1">
                <span>📸 Fotos de ANTES (Chegada / Diagnóstico):</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  ({(report?.beforePhotos?.length || service.media?.length || 0)} fotos)
                </span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(report?.beforePhotos && report.beforePhotos.length > 0 ? report.beforePhotos : service.media || []).map((m: MediaItem, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => onZoomPhoto(m.url)}
                    className="relative group rounded-xl overflow-hidden border border-slate-800 bg-slate-900 cursor-pointer aspect-video"
                  >
                    <img
                      src={m.url}
                      alt={m.caption || 'Foto de Antes'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                      Clique para Ampliar
                    </div>
                    {m.caption && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1 text-[9px] text-slate-300 truncate">
                        {m.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Fotos de Depois */}
            <div className="space-y-2 pt-2 border-t border-slate-850">
              <span className="text-[11px] font-bold text-emerald-400 flex items-center gap-1">
                <span>📸 Fotos de DEPOIS (Conclusão & Teste Final):</span>
                <span className="text-[10px] text-slate-500 font-normal">
                  ({(report?.afterPhotos?.length || 1)} fotos)
                </span>
              </span>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {(report?.afterPhotos && report.afterPhotos.length > 0 ? report.afterPhotos : [
                  {
                    id: 'after-default',
                    url: 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80',
                    type: 'photo' as const,
                    caption: 'Serviço finalizado com sucesso e área limpa'
                  }
                ]).map((m: MediaItem, idx: number) => (
                  <div
                    key={idx}
                    onClick={() => onZoomPhoto(m.url)}
                    className="relative group rounded-xl overflow-hidden border border-emerald-500/30 bg-slate-900 cursor-pointer aspect-video"
                  >
                    <img
                      src={m.url}
                      alt={m.caption || 'Foto de Depois'}
                      referrerPolicy="no-referrer"
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-white text-[10px] font-bold">
                      Clique para Ampliar
                    </div>
                    {m.caption && (
                      <div className="absolute bottom-0 inset-x-0 bg-black/70 p-1 text-[9px] text-emerald-300 truncate">
                        {m.caption}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Vídeo se houver */}
            {report?.videoUrl && (
              <div className="pt-2 border-t border-slate-850 flex items-center justify-between text-xs bg-slate-900 p-2.5 rounded-xl border border-slate-800">
                <span className="flex items-center gap-1.5 text-slate-300 font-bold">
                  <Video className="w-4 h-4 text-cyan-400" />
                  Vídeo Comprobatório Registrado
                </span>
                <a
                  href={report.videoUrl}
                  target="_blank"
                  rel="noreferrer"
                  className="text-cyan-400 hover:text-cyan-300 underline font-bold"
                >
                  Abrir Vídeo
                </a>
              </div>
            )}
          </div>

          {/* 5. Avaliação do Cliente */}
          {rating && (
            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2">
              <h3 className="text-xs font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>Avaliação do Cliente</span>
              </h3>
              <div className="flex items-start gap-3 bg-slate-900 p-3 rounded-xl border border-slate-800">
                <div className="flex flex-col items-center">
                  <div className="flex text-amber-400">
                    {Array.from({ length: rating.score }).map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                  <span className="text-[10px] font-bold text-slate-400 mt-0.5">Nota {rating.score}.0</span>
                </div>
                <div className="space-y-1">
                  <p className="text-xs italic text-slate-300">
                    "{rating.comment || 'Excelente atendimento, rápido e muito profissional!'}"
                  </p>
                  {rating.tags && rating.tags.length > 0 && (
                    <div className="flex flex-wrap gap-1 pt-1">
                      {rating.tags.map((t, idx) => (
                        <span key={idx} className="bg-slate-950 text-slate-400 px-2 py-0.5 rounded text-[9px] font-bold border border-slate-800">
                          {t}
                        </span>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* 6. Selo de Registro no Arquivo da Administração */}
          <div className="p-3.5 bg-emerald-950/30 border border-emerald-500/40 rounded-2xl flex items-center gap-3">
            <div className="w-8 h-8 rounded-xl bg-emerald-500/20 border border-emerald-500/50 flex items-center justify-center text-emerald-400 shrink-0">
              <ShieldCheck className="w-4 h-4" />
            </div>
            <div className="text-xs">
              <p className="font-bold text-emerald-300">Registro Permanente M1 Brasil</p>
              <p className="text-slate-400 text-[11px]">
                Este relatório e fotos estão salvos na Pasta ARQUIVO do Administrador para comprovação técnica, garantia de 90 dias e futuras pesquisas.
              </p>
            </div>
          </div>

        </div>

        {/* Footer */}
        <div className="px-6 py-3.5 bg-slate-950 border-t border-slate-800 flex items-center justify-between">
          <span className="text-[11px] text-slate-500 font-mono">
            Ordem de Serviço #{service.code} • M1 Brasil
          </span>
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white font-bold text-xs cursor-pointer transition-colors"
          >
            Fechar Relatório
          </button>
        </div>

      </div>
    </div>
  );
};
