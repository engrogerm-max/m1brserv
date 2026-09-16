import React, { useState } from 'react';
import { PhotoReport, MediaItem } from '../types';
import { CheckCircle2, Clock, FileCheck, Layers, Sparkles, ZoomIn, X, AlertCircle } from 'lucide-react';

interface PhotoReportViewerProps {
  report: PhotoReport;
  serviceTitle: string;
  providerName: string;
  providerAvatar?: string;
  onApprove?: () => void;
  onRequestFix?: () => void;
  isApprovalMode?: boolean;
}

export const PhotoReportViewer: React.FC<PhotoReportViewerProps> = ({
  report,
  serviceTitle,
  providerName = 'Profissional M1',
  providerAvatar,
  onApprove,
  onRequestFix,
  isApprovalMode = false
}) => {
  const [selectedImage, setSelectedImage] = useState<MediaItem | null>(null);
  const [viewMode, setViewMode] = useState<'side_by_side' | 'grid'>('side_by_side');

  const beforePhotos = report?.beforePhotos || [];
  const afterPhotos = report?.afterPhotos || [];

  const handleImageError = (e: React.SyntheticEvent<HTMLImageElement, Event>) => {
    (e.target as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581578731548-c64695cc6952?auto=format&fit=crop&w=800&q=80';
  };

  return (
    <div className="bg-slate-950 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden text-white">
      {/* Header Banner */}
      <div className="bg-black text-white p-5 border-b border-slate-800">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
              <FileCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-base font-bold text-white">Relatório Fotográfico M1 Brasil</h3>
                <span className="px-2 py-0.5 rounded text-[11px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  Antes & Depois
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">{serviceTitle}</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <div className="text-right text-xs">
              <span className="text-slate-500 block text-[10px]">Profissional:</span>
              <span className="font-bold text-slate-300">{providerName}</span>
            </div>
            {providerAvatar && (
              <img
                src={providerAvatar}
                alt={providerName}
                className="w-9 h-9 rounded-xl object-cover border border-emerald-500/40"
                referrerPolicy="no-referrer"
                onError={handleImageError}
              />
            )}
          </div>
        </div>
      </div>

      {/* Main Body */}
      <div className="p-5 space-y-6">
        {/* Toggle Mode */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Clock className="w-4 h-4 text-emerald-400" />
            <span>Tempo de atendimento: <strong className="text-white">{report?.timeSpentMinutes || 30} minutos</strong></span>
            <span>• Enviado: {report?.submittedAt || 'Recente'}</span>
          </div>

          <div className="flex items-center bg-slate-900 p-1 rounded-xl border border-slate-800 text-xs">
            <button
              onClick={() => setViewMode('side_by_side')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'side_by_side'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Lado a Lado
            </button>
            <button
              onClick={() => setViewMode('grid')}
              className={`px-3 py-1 rounded-lg font-bold transition-all cursor-pointer ${
                viewMode === 'grid'
                  ? 'bg-emerald-500 text-slate-950 shadow-xs'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              Galeria Completa
            </button>
          </div>
        </div>

        {/* Side-by-Side Comparison */}
        {viewMode === 'side_by_side' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* ANTES */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-rose-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-rose-500" />
                  Antes da Execução ({beforePhotos.length})
                </span>
                <span className="text-[11px] text-slate-400">Condições Iniciais</span>
              </div>
              <div className="p-3 space-y-3">
                {beforePhotos.length > 0 ? (
                  beforePhotos.map((photo, i) => (
                    <div
                      key={photo.id || i}
                      className="group relative rounded-xl overflow-hidden bg-black aspect-video cursor-pointer border border-slate-800 shadow-md"
                      onClick={() => setSelectedImage(photo)}
                    >
                      <img
                        src={photo.url}
                        alt="Foto do Antes"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 left-2 right-2 text-white text-[11px]">
                        <p className="font-medium line-clamp-1">{photo.caption || 'Foto inicial do problema'}</p>
                        <span className="text-slate-400 text-[10px]">{photo.timestamp}</span>
                      </div>
                      <button
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black transition-colors"
                        title="Ampliar foto"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Nenhuma foto de antes anexada
                  </div>
                )}
              </div>
            </div>

            {/* DEPOIS */}
            <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
              <div className="px-3.5 py-2 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                <span className="text-xs font-bold text-emerald-400 flex items-center gap-1.5 uppercase tracking-wider">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Depois da Execução ({afterPhotos.length})
                </span>
                <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-bold">
                  <Sparkles className="w-3.5 h-3.5" />
                  Serviço Finalizado M1
                </span>
              </div>
              <div className="p-3 space-y-3">
                {afterPhotos.length > 0 ? (
                  afterPhotos.map((photo, i) => (
                    <div
                      key={photo.id || i}
                      className="group relative rounded-xl overflow-hidden bg-black aspect-video cursor-pointer border border-emerald-500/30 shadow-md"
                      onClick={() => setSelectedImage(photo)}
                    >
                      <img
                        src={photo.url}
                        alt="Foto do Depois"
                        className="w-full h-full object-cover transition-transform group-hover:scale-105"
                        referrerPolicy="no-referrer"
                        onError={handleImageError}
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 group-hover:opacity-100 transition-opacity" />
                      <div className="absolute bottom-2 left-2 right-2 text-white text-[11px]">
                        <p className="font-medium line-clamp-1">{photo.caption || 'Serviço concluído com sucesso'}</p>
                        <span className="text-emerald-400 text-[10px]">{photo.timestamp}</span>
                      </div>
                      <button
                        className="absolute top-2 right-2 p-1.5 rounded-lg bg-black/70 text-white hover:bg-black transition-colors"
                        title="Ampliar foto"
                      >
                        <ZoomIn className="w-4 h-4" />
                      </button>
                    </div>
                  ))
                ) : (
                  <div className="py-8 text-center text-xs text-slate-500">
                    Aguardando fotos finais do profissional
                  </div>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* Grid Mode */
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
            {[...beforePhotos.map(p => ({ ...p, phase: 'Antes' })), ...afterPhotos.map(p => ({ ...p, phase: 'Depois' }))].map((photo, idx) => (
              <div
                key={photo.id || idx}
                onClick={() => setSelectedImage(photo)}
                className="group relative rounded-xl overflow-hidden bg-slate-900 aspect-square cursor-pointer border border-slate-800 shadow-md"
              >
                <img
                  src={photo.url}
                  alt={photo.caption || 'Foto'}
                  className="w-full h-full object-cover transition-transform group-hover:scale-105"
                  referrerPolicy="no-referrer"
                />
                <div className="absolute top-2 left-2">
                  <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase tracking-wider ${
                    photo.phase === 'Antes' ? 'bg-rose-600 text-white' : 'bg-emerald-500 text-slate-950'
                  }`}>
                    {photo.phase}
                  </span>
                </div>
                <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity flex items-end p-2 text-white text-[11px]">
                  <p className="line-clamp-2">{photo.caption}</p>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Technical Checklist & Notes */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
          {/* Checklist */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800">
            <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5 mb-3">
              <Layers className="w-4 h-4 text-emerald-400" />
              Checklist de Atividades Executadas
            </h4>
            <div className="space-y-2">
              {report.checklist && report.checklist.length > 0 ? (
                report.checklist.map((item, idx) => (
                  <div key={item.id || idx} className="flex items-start gap-2 text-xs">
                    <CheckCircle2 className={`w-4 h-4 shrink-0 mt-0.5 ${item.completed ? 'text-emerald-400' : 'text-slate-600'}`} />
                    <span className={item.completed ? 'text-slate-200 font-medium' : 'text-slate-500 line-through'}>
                      {item.label}
                    </span>
                  </div>
                ))
              ) : (
                <p className="text-xs text-slate-500">Nenhum item de checklist especificado.</p>
              )}
            </div>
          </div>

          {/* Technical Notes & Materials */}
          <div className="bg-slate-900 p-4 rounded-2xl border border-slate-800 space-y-3">
            <div>
              <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-1">
                Laudo / Observações Técnicas do Profissional
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-850">
                {report.notes || 'Nenhuma observação técnica adicional registrada.'}
              </p>
            </div>

            {report.materialsUsed && (
              <div>
                <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-1">
                  Materiais e Peças Utilizadas
                </h4>
                <p className="text-xs text-slate-300 bg-slate-950 p-2.5 rounded-xl border border-slate-850">
                  {report.materialsUsed}
                </p>
              </div>
            )}

            {report.futureRecommendations && (
              <div>
                <h4 className="text-[11px] font-bold text-amber-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" />
                  Observações & Orientações Futuras da Atividade
                </h4>
                <p className="text-xs text-amber-200/90 bg-amber-950/30 p-2.5 rounded-xl border border-amber-500/30">
                  {report.futureRecommendations}
                </p>
              </div>
            )}

            {report.videoUrl && (
              <div>
                <h4 className="text-[11px] font-bold text-blue-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                  <span>🎥 Vídeo Curto Comprovatório da Atividade</span>
                </h4>
                <div className="rounded-xl overflow-hidden bg-black border border-slate-800">
                  <video
                    src={report.videoUrl}
                    controls
                    className="w-full max-h-56 object-cover"
                  >
                    Seu navegador não suporta reprodução de vídeo.
                  </video>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Approval CTAs for Client */}
        {isApprovalMode && onApprove && (
          <div className="p-4 bg-emerald-500/10 rounded-2xl border border-emerald-500/30 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 text-xs text-emerald-300">
              <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
              <span>
                Verifique se o serviço foi concluído satisfatoriamente de acordo com o relatório para liberar o pagamento Pix ao profissional.
              </span>
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              {onRequestFix && (
                <button
                  onClick={onRequestFix}
                  className="flex-1 sm:flex-none px-4 py-2.5 text-xs font-bold text-rose-400 bg-slate-900 border border-slate-800 rounded-xl hover:bg-slate-850 transition-colors cursor-pointer"
                >
                  Solicitar Ajuste
                </button>
              )}
              <button
                onClick={onApprove}
                className="flex-1 sm:flex-none px-5 py-2.5 text-xs font-black text-slate-950 bg-emerald-500 hover:bg-emerald-400 rounded-xl shadow-lg shadow-emerald-500/25 transition-all flex items-center justify-center gap-1.5 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                Aprovar & Avaliar Atendimento
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Zoom Modal */}
      {selectedImage && (
        <div
          className="fixed inset-0 z-50 bg-black/95 backdrop-blur-sm flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <div className="relative max-w-4xl w-full max-h-[90vh] flex flex-col items-center" onClick={e => e.stopPropagation()}>
            <button
              onClick={() => setSelectedImage(null)}
              className="absolute -top-12 right-0 text-white hover:text-slate-300 p-2 rounded-full bg-slate-900 border border-slate-800 cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img
              src={selectedImage.url}
              alt="Ampliação"
              className="max-h-[75vh] w-auto rounded-2xl object-contain shadow-2xl border border-slate-800"
              referrerPolicy="no-referrer"
            />
            {selectedImage.caption && (
              <div className="mt-3 text-center text-white bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-800 text-sm max-w-xl">
                {selectedImage.caption}
                <span className="block text-xs text-emerald-400 mt-0.5">{selectedImage.timestamp}</span>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
