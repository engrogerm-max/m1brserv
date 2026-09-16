import React from 'react';
import { ServiceStatus } from '../types';
import { MapPin, Navigation, Wrench, CheckCircle2, Shield } from 'lucide-react';

interface InteractiveMapProps {
  clientAddress: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    lat: number;
    lng: number;
  };
  providerName?: string;
  providerRating?: number;
  status: ServiceStatus;
  estimatedArrivalMinutes?: number;
  className?: string;
}

export const InteractiveMap: React.FC<InteractiveMapProps> = ({
  clientAddress,
  providerName = 'Carlos Silva',
  providerRating = 4.9,
  status,
  estimatedArrivalMinutes = 8,
  className = 'h-64'
}) => {
  return (
    <div className={`relative w-full rounded-2xl overflow-hidden bg-slate-900 border border-slate-700 select-none ${className}`}>
      {/* Map Graphic Grid Background */}
      <div className="absolute inset-0 opacity-20 bg-[radial-gradient(#38bdf8_1px,transparent_1px)] [background-size:18px_18px]" />
      
      {/* Simulated Road Lines */}
      <svg className="absolute inset-0 w-full h-full stroke-slate-700/60" xmlns="http://www.w3.org/2000/svg">
        <path d="M 0 80 Q 150 120 300 60 T 600 140" fill="none" strokeWidth="18" stroke="#1e293b" />
        <path d="M 0 80 Q 150 120 300 60 T 600 140" fill="none" strokeWidth="2" stroke="#475569" strokeDasharray="6 6" />
        
        <path d="M 120 0 Q 160 140 240 280" fill="none" strokeWidth="14" stroke="#1e293b" />
        <path d="M 120 0 Q 160 140 240 280" fill="none" strokeWidth="2" stroke="#475569" strokeDasharray="4 4" />

        <path d="M 280 0 L 280 300" fill="none" strokeWidth="16" stroke="#1e293b" />
        <path d="M 40 200 L 500 180" fill="none" strokeWidth="12" stroke="#1e293b" />

        {/* Route highlight when provider is in displacement */}
        {(status === 'em_deslocamento' || status === 'aceito') && (
          <path
            d="M 100 180 Q 200 160 380 110"
            fill="none"
            stroke="#0ea5e9"
            strokeWidth="5"
            strokeLinecap="round"
            strokeDasharray="8 6"
            className="animate-pulse"
          />
        )}
      </svg>

      {/* Radar Pulse when Searching / Solicitado */}
      {status === 'solicitado' && (
        <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
          <div className="relative flex items-center justify-center">
            <div className="w-48 h-48 rounded-full border-2 border-emerald-500/40 animate-ping absolute" />
            <div className="w-32 h-32 rounded-full border-2 border-emerald-400/60 animate-pulse absolute" />
            <div className="w-16 h-16 rounded-full bg-emerald-500/20 border border-emerald-400 flex items-center justify-center">
              <span className="relative flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-4 w-4 bg-emerald-500"></span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Client Pin (Destination) */}
      <div className="absolute top-1/2 right-1/4 -translate-y-1/2 translate-x-1/2 flex flex-col items-center group">
        <div className="relative">
          <div className="w-10 h-10 rounded-full bg-rose-600 text-white flex items-center justify-center shadow-lg shadow-rose-600/40 ring-4 ring-rose-500/20">
            <MapPin className="w-5 h-5" />
          </div>
        </div>
        <div className="mt-1 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-md border border-slate-700 text-white text-[11px] font-semibold whitespace-nowrap shadow-md">
          {clientAddress.street}, {clientAddress.number}
        </div>
      </div>

      {/* Provider Pin (When Accepted / Moving / Arrived) */}
      {status !== 'solicitado' && (
        <div
          className={`absolute transition-all duration-1000 flex flex-col items-center ${
            status === 'em_deslocamento'
              ? 'top-1/3 left-1/4'
              : status === 'chegou_ao_local' || status === 'em_execucao' || status === 'relatorio_enviado'
              ? 'top-1/2 right-[28%] -translate-y-1/2'
              : 'top-1/4 left-1/5'
          }`}
        >
          <div className="relative">
            <div className="w-10 h-10 rounded-full bg-emerald-500 text-slate-950 flex items-center justify-center shadow-lg shadow-emerald-500/40 ring-4 ring-emerald-400/20">
              {status === 'em_execucao' ? (
                <Wrench className="w-5 h-5 text-slate-950 animate-spin" style={{ animationDuration: '3s' }} />
              ) : status === 'relatorio_enviado' || status === 'concluido_pago' ? (
                <CheckCircle2 className="w-5 h-5 text-slate-950" />
              ) : (
                <Navigation className="w-5 h-5 text-slate-950 fill-current rotate-45" />
              )}
            </div>
            {status === 'em_deslocamento' && (
              <span className="absolute -top-1 -right-1 flex h-3.5 w-3.5">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
              </span>
            )}
          </div>
          <div className="mt-1 px-2.5 py-1 bg-slate-900/90 backdrop-blur-md rounded-md border border-emerald-500/40 text-emerald-300 text-[11px] font-semibold whitespace-nowrap shadow-md flex items-center gap-1">
            <span>{providerName.split(' ')[0]}</span>
            <span className="text-amber-400">★ {providerRating}</span>
          </div>
        </div>
      )}

      {/* Floating Status Bar Overlay */}
      <div className="absolute top-3 left-3 right-3 flex items-center justify-between pointer-events-none">
        <div className="bg-slate-900/90 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-slate-700/80 text-xs font-medium text-slate-200 flex items-center gap-2 shadow-lg">
          <Shield className="w-3.5 h-3.5 text-emerald-400" />
          <span>Monitoramento GPS em Tempo Real</span>
        </div>

        {status === 'em_deslocamento' && (
          <div className="bg-emerald-500 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            Chegada em ~{estimatedArrivalMinutes} min (2.1 km)
          </div>
        )}

        {status === 'solicitado' && (
          <div className="bg-amber-500/90 text-slate-950 px-3.5 py-1.5 rounded-xl text-xs font-bold shadow-lg flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-slate-950 animate-ping" />
            Alertando 8 prestadores na cidade
          </div>
        )}
      </div>

      {/* Bottom Address Info Badge */}
      <div className="absolute bottom-3 left-3 bg-slate-900/90 backdrop-blur-md px-3 py-1.5 rounded-xl border border-slate-700/80 text-[11px] text-slate-300 flex items-center gap-1.5 shadow-md">
        <MapPin className="w-3.5 h-3.5 text-rose-400 shrink-0" />
        <span className="truncate max-w-[220px] sm:max-w-xs">{clientAddress.neighborhood}, {clientAddress.city}</span>
      </div>
    </div>
  );
};
