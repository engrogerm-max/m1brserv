import React, { useState, useRef } from 'react';
import { MediaItem, ServiceCategory } from '../types';
import { Camera, Upload, Video, ImagePlus, X, Check, Sparkles } from 'lucide-react';
import { PRESET_SAMPLE_MEDIA } from '../data/mockData';

interface MediaUploaderProps {
  category?: ServiceCategory;
  mediaList: MediaItem[];
  onChange: (items: MediaItem[]) => void;
  maxItems?: number;
  label?: string;
  allowPresets?: boolean;
}

export const MediaUploader: React.FC<MediaUploaderProps> = ({
  category = 'hidraulica',
  mediaList,
  onChange,
  maxItems = 6,
  label = 'Fotos e Vídeos do Problema',
  allowPresets = true
}) => {
  const [isCameraActive, setIsCameraActive] = useState<boolean>(false);
  const [captionInput, setCaptionInput] = useState<string>('');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  // Open device camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Câmera não suportada neste navegador.');
      }
      const stream = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: 'environment', width: { ideal: 1280 }, height: { ideal: 720 } }
      });
      streamRef.current = stream;
      setIsCameraActive(true);
      setTimeout(() => {
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.play();
        }
      }, 100);
    } catch (err: any) {
      setCameraError('Permissão da câmera necessária. Você também pode anexar arquivos ou usar fotos de teste.');
      setIsCameraActive(false);
    }
  };

  // Capture snapshot from webcam
  const capturePhoto = () => {
    if (!videoRef.current) return;
    const canvas = document.createElement('canvas');
    canvas.width = videoRef.current.videoWidth || 640;
    canvas.height = videoRef.current.videoHeight || 480;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.drawImage(videoRef.current, 0, 0, canvas.width, canvas.height);
      const dataUrl = canvas.toDataURL('image/jpeg', 0.85);

      const newItem: MediaItem = {
        id: 'photo-' + Date.now(),
        type: 'photo',
        url: dataUrl,
        timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        caption: captionInput || 'Foto capturada pela câmera'
      };

      onChange([...mediaList, newItem]);
      setCaptionInput('');
      stopCamera();
    }
  };

  const stopCamera = () => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach(track => track.stop());
      streamRef.current = null;
    }
    setIsCameraActive(false);
  };

  // Handle local file upload
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    (Array.from(files) as File[]).forEach((file: File, index: number) => {
      const reader = new FileReader();
      const isVideo = file.type.startsWith('video/');

      reader.onload = event => {
        if (event.target?.result) {
          const newItem: MediaItem = {
            id: `media-${Date.now()}-${index}`,
            type: isVideo ? 'video' : 'photo',
            url: event.target.result as string,
            timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
            caption: file.name
          };
          onChange([...mediaList, newItem]);
        }
      };

      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  // Load preset sample media for current category
  const loadPresetSample = () => {
    const sample = PRESET_SAMPLE_MEDIA[category] || PRESET_SAMPLE_MEDIA.hidraulica;
    onChange([...mediaList, ...sample.media]);
  };

  const removeMedia = (id: string) => {
    onChange(mediaList.filter(m => m.id !== id));
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
          <Camera className="w-4 h-4 text-emerald-400" />
          {label} ({mediaList.length}/{maxItems})
        </label>

        {allowPresets && (
          <button
            type="button"
            onClick={loadPresetSample}
            className="text-[11px] font-bold text-emerald-400 bg-slate-900 hover:bg-slate-850 px-2.5 py-1 rounded-lg border border-slate-800 flex items-center gap-1 cursor-pointer transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5" />
            Usar Exemplo de Demonstração
          </button>
        )}
      </div>

      {/* Camera Live Modal Overlay */}
      {isCameraActive && (
        <div className="fixed inset-0 z-50 bg-black/90 flex flex-col items-center justify-center p-4">
          <div className="relative w-full max-w-md bg-slate-950 rounded-3xl overflow-hidden border border-slate-800 p-4 space-y-4">
            <div className="flex items-center justify-between text-white">
              <span className="text-sm font-bold flex items-center gap-2">
                <Camera className="w-4 h-4 text-emerald-400" />
                Fotografar para o Chamado M1
              </span>
              <button onClick={stopCamera} className="p-1 rounded-lg hover:bg-slate-900 text-slate-400 hover:text-white cursor-pointer">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="relative aspect-video sm:aspect-square bg-black rounded-2xl overflow-hidden flex items-center justify-center border border-slate-800">
              <video ref={videoRef} autoPlay playsInline muted className="w-full h-full object-cover" />
            </div>

            <div className="space-y-3">
              <input
                type="text"
                value={captionInput}
                onChange={e => setCaptionInput(e.target.value)}
                placeholder="Legenda da foto (Ex: Tubulação rompida)..."
                className="w-full text-xs px-3 py-2 bg-slate-900 border border-slate-800 rounded-xl text-white placeholder-slate-500 focus:outline-emerald-500"
              />

              <div className="flex items-center gap-2">
                <button
                  onClick={stopCamera}
                  className="flex-1 py-2.5 rounded-xl border border-slate-800 text-xs font-semibold text-slate-400 hover:bg-slate-900 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  onClick={capturePhoto}
                  className="flex-1 py-2.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-lg shadow-emerald-500/20"
                >
                  <Check className="w-4 h-4" />
                  Capturar Foto
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {cameraError && (
        <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-xs text-amber-400">
          {cameraError}
        </div>
      )}

      {/* Media Grid Preview */}
      <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
        {mediaList.map((item, index) => (
          <div
            key={item.id || index}
            className="group relative aspect-square rounded-xl overflow-hidden bg-slate-900 border border-slate-800 shadow-sm"
          >
            {item.type === 'video' ? (
              <div className="w-full h-full flex flex-col items-center justify-center bg-slate-900 text-white p-2">
                <Video className="w-6 h-6 text-emerald-400" />
                <span className="text-[10px] text-slate-400 mt-1 line-clamp-1">{item.caption || 'Vídeo'}</span>
              </div>
            ) : (
              <img
                src={item.url}
                alt={item.caption || 'Mídia'}
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            )}

            <button
              type="button"
              onClick={() => removeMedia(item.id)}
              className="absolute top-1 right-1 w-6 h-6 rounded-full bg-black/80 text-white flex items-center justify-center hover:bg-rose-600 transition-colors shadow-md cursor-pointer"
            >
              <X className="w-3.5 h-3.5" />
            </button>

            {item.caption && (
              <div className="absolute bottom-0 inset-x-0 bg-black/80 p-1 text-white text-[9px] line-clamp-1">
                {item.caption}
              </div>
            )}
          </div>
        ))}

        {/* Upload Action Tiles */}
        {mediaList.length < maxItems && (
          <>
            {/* Take Photo Button */}
            <button
              type="button"
              onClick={startCamera}
              className="aspect-square rounded-xl border border-dashed border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 flex flex-col items-center justify-center gap-1 p-2 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Camera className="w-4 h-4 text-emerald-400" />
              </div>
              <span className="text-[11px] font-bold text-center leading-tight">Tirar Foto</span>
            </button>

            {/* Upload File Button */}
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              className="aspect-square rounded-xl border border-dashed border-slate-800 bg-slate-900 hover:bg-slate-850 text-slate-300 flex flex-col items-center justify-center gap-1 p-2 transition-colors cursor-pointer group"
            >
              <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center group-hover:scale-110 transition-transform">
                <Upload className="w-4 h-4 text-slate-400" />
              </div>
              <span className="text-[11px] font-bold text-center leading-tight">Anexar Arquivo</span>
            </button>
          </>
        )}
      </div>

      <input
        ref={fileInputRef}
        type="file"
        multiple
        accept="image/*,video/*"
        onChange={handleFileUpload}
        className="hidden"
      />

      <p className="text-[11px] text-slate-500">
        💡 Envie fotos nítidas ou vídeos curtos de até 1 minuto para que os profissionais avaliem as ferramentas e peças necessárias antes do deslocamento.
      </p>
    </div>
  );
};
