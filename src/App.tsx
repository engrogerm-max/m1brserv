/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useEffect, useState } from 'react';
import { AppProvider, useApp } from './context/AppContext';
import { Navbar } from './components/Navbar';
import { ClientPortal } from './components/client/ClientPortal';
import { ProviderPortal } from './components/provider/ProviderPortal';
import { AdminPortal } from './components/admin/AdminPortal';
import { GatewayPortal } from './components/GatewayPortal';
import { ServiceTrackerSidebar } from './components/ServiceTrackerSidebar';
import { User, Wrench, ShieldCheck, Zap, AlertTriangle, Clock, Check, X, MessageSquare, Bell, AlertCircle, CheckCircle, Coins, ShieldAlert } from 'lucide-react';
import { SyncEvent } from './types';
import { soundManager } from './utils/audio';

interface ToastItemProps {
  toast: SyncEvent;
  onDismiss: (id: string) => void;
}

const ToastItem: React.FC<ToastItemProps> = ({ toast, onDismiss }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onDismiss(toast.id);
    }, 5000);
    return () => clearTimeout(timer);
  }, [toast.id, onDismiss]);

  const getToastStyle = () => {
    switch (toast.sound) {
      case 'alarm':
        return {
          icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
          borderColor: 'border-rose-500/30',
          badgeBg: 'bg-rose-500/10 text-rose-400',
          progressBg: 'bg-rose-500'
        };
      case 'success':
        return {
          icon: <CheckCircle className="w-5 h-5 text-emerald-400" />,
          borderColor: 'border-emerald-500/30',
          badgeBg: 'bg-emerald-500/10 text-emerald-400',
          progressBg: 'bg-emerald-500'
        };
      case 'cash':
        return {
          icon: <Coins className="w-5 h-5 text-amber-400" />,
          borderColor: 'border-amber-500/30',
          badgeBg: 'bg-amber-500/10 text-amber-400',
          progressBg: 'bg-amber-500'
        };
      case 'incoming':
      case 'radar':
        return {
          icon: <Zap className="w-5 h-5 text-cyan-400" />,
          borderColor: 'border-cyan-500/30',
          badgeBg: 'bg-cyan-500/10 text-cyan-400',
          progressBg: 'bg-cyan-500'
        };
      case 'message':
        return {
          icon: <MessageSquare className="w-5 h-5 text-indigo-400" />,
          borderColor: 'border-indigo-500/30',
          badgeBg: 'bg-indigo-500/10 text-indigo-400',
          progressBg: 'bg-indigo-500'
        };
      default:
        return {
          icon: <Bell className="w-5 h-5 text-slate-400" />,
          borderColor: 'border-slate-800',
          badgeBg: 'bg-slate-800 text-slate-400',
          progressBg: 'bg-slate-400'
        };
    }
  };

  const { icon, borderColor, badgeBg, progressBg } = getToastStyle();

  return (
    <div
      id={`toast-${toast.id}`}
      className={`w-full max-w-sm bg-slate-900/98 backdrop-blur-md border ${borderColor} rounded-2xl shadow-2xl p-4 flex gap-3 items-start relative overflow-hidden animate-slide-in pointer-events-auto transition-all hover:scale-[1.02] duration-300 max-h-[220px]`}
    >
      <div className="p-2 rounded-xl bg-slate-950/80 border border-slate-800 shadow-inner flex-shrink-0">
        {icon}
      </div>

      <div className="flex-1 min-w-0 pr-4 flex flex-col max-h-[170px]">
        <div className="flex items-center gap-1.5 mb-1.5 flex-wrap shrink-0">
          <span className="text-sm font-bold text-slate-100 font-display tracking-wide">{toast.title}</span>
          <span className={`text-[9px] font-black uppercase px-1.5 py-0.5 rounded-md ${badgeBg} tracking-widest`}>
            {toast.role === 'client' ? 'Cliente' : toast.role === 'provider' ? 'Prestador' : toast.role === 'admin' ? 'Admin' : 'Sistema'}
          </span>
        </div>
        <div className="text-xs text-slate-300 leading-relaxed font-sans overflow-y-auto max-h-[100px] pr-1.5 select-text scrollbar-thin scrollbar-thumb-slate-700 hover:scrollbar-thumb-slate-600">
          <p className="break-words whitespace-pre-wrap">{toast.message}</p>
        </div>
        <span className="text-[9px] text-slate-500 block mt-1.5 shrink-0">
          {new Date(toast.timestamp).toLocaleTimeString('pt-BR')}
        </span>
      </div>

      <button
        onClick={() => onDismiss(toast.id)}
        className="text-slate-500 hover:text-slate-200 transition-colors p-1 hover:bg-slate-800 rounded-lg absolute top-3 right-3 cursor-pointer"
      >
        <X className="w-3.5 h-3.5" />
      </button>

      <div className="absolute bottom-0 left-0 h-1 w-full bg-slate-950">
        <div className={`h-full ${progressBg} animate-shrink-width`} style={{ animationDuration: '5000ms' }} />
      </div>
    </div>
  );
};

const MainAppContent: React.FC = () => {
  const {
    isFirestoreQuotaExceeded,
    setIsFirestoreQuotaExceeded,
    currentRole,
    setCurrentRole,
    hasChosenPortal,
    setHasChosenPortal,
    services,
    provider,
    isAdminAuthenticated,
    isClientAuthenticated,
    isProviderAuthenticated,
    providerAcceptDispatchedService,
    providerRejectDispatchedService,
    providerQuestionDispatchedService,
    providerRejectServiceRequest,
    acceptServiceRequestDirectly,
    activeToasts,
    dismissToast,
    settings
  } = useApp();

  const getFontFamilyStyle = (font?: string) => {
    switch (font) {
      case 'sans': return { fontFamily: 'system-ui, -apple-system, sans-serif' };
      case 'serif': return { fontFamily: 'Georgia, Cambria, "Times New Roman", Times, serif' };
      case 'mono': return { fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace' };
      case 'jakarta': return { fontFamily: '"Plus Jakarta Sans", system-ui, sans-serif' };
      case 'playfair': return { fontFamily: '"Playfair Display", Georgia, serif' };
      case 'grotesk': return { fontFamily: '"Space Grotesk", system-ui, sans-serif' };
      case 'roboto': return { fontFamily: '"Roboto", system-ui, sans-serif' };
      default: return {};
    }
  };

  const getThemeStyleTag = () => {
    const theme = settings.appBackgroundTheme || 'dark_slate';
    if (theme === 'light_gray') {
      return (
        <style>{`
          /* Overrides for Light Gray theme */
          body, .min-h-screen {
            color: #0f172a !important; /* text-slate-900 */
          }
          /* Card backgrounds */
          .bg-slate-900, .bg-slate-950, .bg-slate-900\\/98, .bg-slate-950\\/40, .bg-slate-900\\/40, .bg-slate-900\\/60, .bg-slate-950\\/50, .bg-slate-900\\/80, .bg-slate-950\\/80 {
            background-color: #ffffff !important;
            color: #1e293b !important;
            border-color: #e2e8f0 !important; /* border-slate-200 */
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.05), 0 2px 4px -2px rgb(0 0 0 / 0.05) !important;
          }
          /* Text colors in cards */
          .text-slate-400, .text-slate-300, .text-slate-200, .text-slate-100 {
            color: #334155 !important; /* text-slate-700 */
          }
          .text-white {
            color: #0f172a !important; /* text-slate-900 */
          }
          /* Input boxes */
          input, select, textarea {
            background-color: #f8fafc !important; /* bg-slate-50 */
            color: #0f172a !important;
            border-color: #cbd5e1 !important; /* border-slate-300 */
          }
          input::placeholder, textarea::placeholder {
            color: #94a3b8 !important;
          }
          /* Specific lists and tables */
          table th {
            color: #1e293b !important;
            background-color: #f1f5f9 !important;
          }
          table td {
            border-bottom-color: #e2e8f0 !important;
          }
          /* Labels */
          label {
            color: #475569 !important; /* text-slate-600 */
          }
          /* Tabs and borders */
          .border-slate-800, .border-slate-850, .border-slate-700, .border-slate-750 {
            border-color: #e2e8f0 !important;
          }
          /* Scrollbars */
          .scrollbar-thin {
            scrollbar-color: #cbd5e1 #f1f5f9;
          }
          /* Icons and text that should be dark */
          .text-indigo-400, .text-cyan-400, .text-purple-400 {
            color: #4f46e5 !important; /* Indigo-600 */
          }
          .text-yellow-400 {
            color: #d97706 !important; /* Amber-600 */
          }
        `}</style>
      );
    } else if (theme === 'soft_cream') {
      return (
        <style>{`
          /* Overrides for Soft Cream theme */
          body, .min-h-screen {
            color: #451a03 !important; /* text-amber-950 */
          }
          /* Card backgrounds */
          .bg-slate-900, .bg-slate-950, .bg-slate-900\\/98, .bg-slate-950\\/40, .bg-slate-900\\/40, .bg-slate-900\\/60, .bg-slate-950\\/50, .bg-slate-900\\/80, .bg-slate-950\\/80 {
            background-color: #fffdf5 !important; /* Soft warm paper */
            color: #451a03 !important;
            border-color: #ebdcb9 !important; /* Soft golden border */
            box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.04) !important;
          }
          /* Text colors in cards */
          .text-slate-400, .text-slate-300, .text-slate-200, .text-slate-100 {
            color: #78350f !important; /* text-amber-900 */
          }
          .text-white {
            color: #451a03 !important;
          }
          /* Input boxes */
          input, select, textarea {
            background-color: #faf6eb !important;
            color: #451a03 !important;
            border-color: #d9c396 !important;
          }
          input::placeholder, textarea::placeholder {
            color: #a1824a !important;
          }
          /* Specific lists and tables */
          table th {
            color: #451a03 !important;
            background-color: #f7eed7 !important;
          }
          table td {
            border-bottom-color: #ebdcb9 !important;
          }
          /* Labels */
          label {
            color: #92400e !important;
          }
          /* Tabs and borders */
          .border-slate-800, .border-slate-850, .border-slate-700, .border-slate-750 {
            border-color: #ebdcb9 !important;
          }
          /* Icons and text that should be warm */
          .text-indigo-400, .text-cyan-400, .text-purple-400 {
            color: #b45309 !important;
          }
          .text-yellow-400 {
            color: #d97706 !important;
          }
        `}</style>
      );
    } else if (theme === 'high_visibility_dark') {
      return (
        <style>{`
          /* Overrides for High Visibility Dark theme */
          body, .min-h-screen {
            background-color: #000000 !important;
            color: #ffffff !important;
          }
          .bg-slate-900, .bg-slate-950, .bg-slate-900\\/98, .bg-slate-950\\/40, .bg-slate-900\\/40, .bg-slate-900\\/60, .bg-slate-950\\/50, .bg-slate-900\\/80, .bg-slate-950\\/80 {
            background-color: #000000 !important;
            border-color: #334155 !important; /* border-slate-700 */
            border-width: 2px !important;
          }
          .text-slate-400, .text-slate-300, .text-slate-200, .text-slate-100 {
            color: #f1f5f9 !important; /* text-slate-100 */
          }
          .text-slate-500 {
            color: #cbd5e1 !important;
          }
          input, select, textarea {
            background-color: #000000 !important;
            border-color: #ffffff !important;
            border-width: 2px !important;
            color: #ffffff !important;
          }
        `}</style>
      );
    }
    return null;
  };

  const getBgStyle = (role: 'client' | 'provider' | 'admin') => {
    let bgImage = '';
    let fallback = '';
    if (role === 'client') {
      bgImage = settings.clientBgImage || '';
      fallback = settings.clientBannerImage || 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80';
    } else if (role === 'provider') {
      bgImage = settings.providerBgImage || '';
      fallback = settings.providerBannerImage || 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80';
    } else {
      bgImage = settings.adminBgImage || '';
      fallback = 'https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&w=1200&q=80';
    }

    const url = bgImage || fallback;
    const theme = settings.appBackgroundTheme || 'dark_slate';
    
    let gradient = 'linear-gradient(to bottom, rgba(10, 15, 30, 0.92), rgba(10, 15, 30, 0.97))';
    if (theme === 'pitch_black') {
      gradient = 'linear-gradient(to bottom, rgba(0, 0, 0, 0.97), rgba(0, 0, 0, 0.99))';
    } else if (theme === 'navy_blue') {
      gradient = 'linear-gradient(to bottom, rgba(15, 23, 42, 0.95), rgba(10, 15, 30, 0.98))';
    } else if (theme === 'high_visibility_dark') {
      gradient = 'linear-gradient(to bottom, rgba(0, 0, 0, 1), rgba(0, 0, 0, 1))';
    } else if (theme === 'light_gray') {
      gradient = 'linear-gradient(to bottom, rgba(248, 250, 252, 0.95), rgba(241, 245, 249, 0.97))';
    } else if (theme === 'soft_cream') {
      gradient = 'linear-gradient(to bottom, rgba(253, 251, 247, 0.96), rgba(247, 245, 237, 0.98))';
    }

    const useBgImage = theme !== 'high_visibility_dark';

    return {
      backgroundImage: useBgImage ? `${gradient}, url(${url})` : gradient,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
      backgroundAttachment: 'fixed',
    };
  };

  const currentFont = currentRole === 'client' 
    ? settings.clientFontFamily 
    : currentRole === 'provider' 
    ? settings.providerFontFamily 
    : settings.adminFontFamily;

  useEffect(() => {
    const fonts = [];
    if (settings.clientFontFamily === 'jakarta' || settings.providerFontFamily === 'jakarta' || settings.adminFontFamily === 'jakarta') {
      fonts.push('family=Plus+Jakarta+Sans:wght@300;400;500;600;700;800;900');
    }
    if (settings.clientFontFamily === 'playfair' || settings.providerFontFamily === 'playfair' || settings.adminFontFamily === 'playfair') {
      fonts.push('family=Playfair+Display:ital,wght@0,400;0,700;1,400');
    }
    if (settings.clientFontFamily === 'grotesk' || settings.providerFontFamily === 'grotesk' || settings.adminFontFamily === 'grotesk') {
      fonts.push('family=Space+Grotesk:wght@300;400;500;600;700');
    }
    if (settings.clientFontFamily === 'roboto' || settings.providerFontFamily === 'roboto' || settings.adminFontFamily === 'roboto') {
      fonts.push('family=Roboto:wght@300;400;500;700;900');
    }
    if (fonts.length > 0) {
      const linkId = 'dynamic-google-fonts';
      let link = document.getElementById(linkId) as HTMLLinkElement;
      if (!link) {
        link = document.createElement('link');
        link.id = linkId;
        link.rel = 'stylesheet';
        document.head.appendChild(link);
      }
      link.href = `https://fonts.googleapis.com/css2?${fonts.join('&')}&display=swap`;
    }
  }, [settings.clientFontFamily, settings.providerFontFamily, settings.adminFontFamily]);

  const pendingRadarCount = services.filter(s => s.status === 'solicitado').length;
  const reportsPendingReview = services.filter(s => s.status === 'relatorio_enviado').length;

  // Detect high-priority active job dispatched or broadcast to this authenticated provider
  const activeAlertJob = isProviderAuthenticated && provider && services.find(
    s => {
      const isDirectDispatch = (s.status === 'despachado_prestador' || s.status === 'valor_aprovado_cliente') && s.assignedProviderId === provider.id;
      const isBroadcast = (s.status === 'solicitado' || s.status === 'negociando') && provider.categories.includes(s.category) && provider.isOnline && (!s.rejectedByProviderIds || !s.rejectedByProviderIds.includes(provider.id));
      return (isDirectDispatch || isBroadcast) &&
             (!s.proposals || !s.proposals.some(p => p.providerId === provider.id));
    }
  );

  // Active job list countdown/SLA settings

  // SLA Countdown & Steady alert state for Provider Alert
  const [alertCountdown, setAlertCountdown] = useState(120);
  const [visualFlash, setVisualFlash] = useState(false);
  const [questionText, setQuestionText] = useState('');
  const [showQuestionInput, setShowQuestionInput] = useState(false);
  const [alertEtaMinutes, setAlertEtaMinutes] = useState<number>(15);

  useEffect(() => {
    if (activeAlertJob) {
      setQuestionText('');
      setShowQuestionInput(false);
      setAlertCountdown(120);
      setAlertEtaMinutes(15);
      setVisualFlash(true);
      
      // Initial sound alert
      soundManager.playIncomingJobAlert();
      
      const initTimer = setTimeout(() => {
        setVisualFlash(false);
      }, 1000);

      // Periodic sound alert every 15 seconds without layout shifting
      const pulseInterval = setInterval(() => {
        soundManager.playIncomingJobAlert();
      }, 15000);

      // Ticking down the 120-second timeout SLA
      const secondInterval = setInterval(() => {
        setAlertCountdown(prev => {
          if (prev <= 1) {
            // Automatically reject if timer runs out (2-minute SLA expired)
            if (activeAlertJob.status === 'despachado_prestador') {
              providerRejectDispatchedService(activeAlertJob.id, 'Tempo de resposta de 2 minutos expirado');
            } else {
              providerRejectServiceRequest(activeAlertJob.id);
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);

      return () => {
        clearTimeout(initTimer);
        clearInterval(pulseInterval);
        clearInterval(secondInterval);
      };
    }
  }, [activeAlertJob?.id]);

  return (
    <div 
      className="min-h-screen bg-black text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950 transition-all duration-500"
      style={{
        ...getFontFamilyStyle(currentFont),
        ...getBgStyle(currentRole as any)
      }}
    >
      {getThemeStyleTag()}
      {/* Top Navbar */}
      <Navbar />

      {/* ⚠️ FIRESTORE QUOTA EXCEEDED OFFLINE FALLBACK BANNER */}
      {isFirestoreQuotaExceeded && currentRole === 'admin' && (
        <div className="bg-amber-950/40 border-y border-amber-500/30 text-amber-200 px-4 py-3 text-xs sm:text-sm shadow-xl flex flex-col sm:flex-row gap-3 items-center justify-between animate-fade-in" id="firestore-quota-alert-banner">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-amber-500/10 border border-amber-500/20 rounded-xl text-amber-400 shrink-0">
              <AlertTriangle className="w-5 h-5 animate-pulse" />
            </div>
            <div className="space-y-0.5 text-left">
              <p className="font-extrabold text-white text-xs sm:text-sm flex items-center gap-1.5">
                <span>⚠️ Limite de Cota Excedido (Firestore Quota Exceeded)</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] uppercase font-black tracking-wider px-2 py-0.5 rounded-full border border-amber-500/10">
                  Modo Backup Local Ativo
                </span>
              </p>
              <p className="text-[11px] text-slate-300 leading-relaxed max-w-4xl">
                A cota gratuita diária de gravação do Firestore foi temporariamente atingida (Spark Plan). 
                Ela reiniciará automaticamente amanhã. <strong>Fique tranquilo!</strong> Ativamos nosso mecanismo de integridade local: 
                você pode continuar testando, criando chamados e aceitando serviços normalmente — tudo é salvo no seu navegador via <strong className="text-white">LocalStorage</strong>.
              </p>
            </div>
          </div>
          <div className="flex gap-2.5 items-center shrink-0 w-full sm:w-auto justify-end">
            <a
              href="https://console.firebase.google.com/project/gen-lang-client-0999562777/firestore/databases/ai-studio-appm1servios-538fe31d-b653-4447-a0a2-b803fbee889d/data?openUpgradeDialog=true"
              target="_blank"
              rel="noreferrer"
              className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-450 text-slate-950 text-[11px] font-black uppercase rounded-lg shadow-md hover:shadow-amber-500/15 cursor-pointer flex items-center gap-1 transition-all"
            >
              Verificar Banco ↗
            </a>
            <button
              onClick={() => setIsFirestoreQuotaExceeded(false)}
              className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer border border-slate-800"
              title="Ocultar Aviso"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      )}

      {/* REVOLUTIONIZED GENTLE RADAR NOTIFICATION CARD */}
      {activeAlertJob && currentRole === 'provider' && (
        <div className="fixed inset-x-0 bottom-6 z-50 flex justify-center px-4 pointer-events-none">
          <div
            className={`bg-slate-950 border-2 ${
              visualFlash ? 'border-red-500 shadow-[0_0_30px_rgba(239,68,68,0.4)] bg-red-950/20' : 'border-red-600/60 shadow-2xl'
            } rounded-3xl p-5 max-w-lg w-full space-y-4 pointer-events-auto transition-colors duration-300 modal-crisp`}
            id="urgent-alert-radar"
          >
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
              <div className="flex items-center gap-2 text-red-500">
                <span className={`w-2.5 h-2.5 rounded-full bg-red-600 shrink-0 ${visualFlash ? 'animate-ping' : ''}`} />
                <h3 className="font-black text-xs uppercase tracking-widest flex items-center gap-1">
                  <AlertTriangle className="w-4 h-4 text-red-500" />
                  <span className={`${visualFlash ? 'text-red-400' : 'text-slate-200'} transition-colors duration-500`}>
                    CHAMADO URGENTE NO SEU RADAR
                  </span>
                </h3>
              </div>
              <div className="flex items-center gap-1.5 font-mono text-xs font-black text-red-500 bg-red-500/10 px-2.5 py-1 rounded-full border border-red-500/20">
                <Clock className="w-3.5 h-3.5 shrink-0 animate-pulse" />
                <span>{alertCountdown}s</span>
              </div>
            </div>
            
            <div className="space-y-2 text-xs">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <p className="font-extrabold text-white text-base sm:text-lg leading-tight">
                    {activeAlertJob.title}
                  </p>
                  <p className="text-slate-400 text-[11px] mt-1 leading-relaxed">
                    {activeAlertJob.description}
                  </p>
                </div>
                <div className="text-right shrink-0">
                  <span className="font-mono text-emerald-400 font-extrabold text-lg sm:text-xl block leading-none">
                    R$ {activeAlertJob.estimatedPrice.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-slate-500 font-bold uppercase tracking-wider block mt-1">
                    Repasse Líquido
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 text-slate-300">
                <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-[9px] text-emerald-400 font-bold uppercase">
                  {activeAlertJob.category}
                </span>
                <span className="text-[10px] text-slate-400 truncate">
                  Local: {activeAlertJob.address.neighborhood}, {activeAlertJob.address.city}
                </span>
              </div>
            </div>

            {activeAlertJob.status === 'despachado_prestador' && (
              <div className="bg-slate-900/40 p-2.5 rounded-xl border border-slate-850 space-y-2">
                {!showQuestionInput ? (
                  <div className="flex justify-between items-center text-[10px]">
                    <span className="text-slate-400">Preço definido pela Administração M1</span>
                    <button
                      type="button"
                      onClick={() => setShowQuestionInput(true)}
                      className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                    >
                      Questionar preço ou sugerir valor?
                    </button>
                  </div>
                ) : (
                  <div className="space-y-1.5 animate-in fade-in duration-200">
                    <label className="block text-slate-300 text-[10px] font-bold">
                      Digite sua dúvida sobre o preço ou contraproposta:
                    </label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={questionText}
                        onChange={(e) => setQuestionText(e.target.value)}
                        placeholder="Ex: Solicito R$ 250 pelo deslocamento, ou tirar dúvida"
                        className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-2.5 py-1.5 text-xs text-white placeholder-slate-500 font-bold focus:border-amber-500 outline-none"
                      />
                      <button
                        type="button"
                        onClick={() => {
                          const msg = questionText.trim() || 'Questionamento de preço/condições enviado pelo prestador';
                          providerQuestionDispatchedService(activeAlertJob.id, msg);
                          setShowQuestionInput(false);
                          setQuestionText('');
                        }}
                        className="bg-amber-500 hover:bg-amber-450 text-slate-950 font-black text-[10px] uppercase px-3 py-1.5 rounded-lg cursor-pointer"
                      >
                        Enviar Questionamento
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setShowQuestionInput(false)}
                      className="text-slate-500 hover:text-slate-400 text-[9px] underline block"
                    >
                      Cancelar e aceitar preço original
                    </button>
                  </div>
                )}
              </div>
            )}

            {/* ⏱️ Definição do Tempo de Chegada (ETA) até o local do serviço */}
            <div className="bg-slate-900/90 p-3 rounded-2xl border border-slate-800 space-y-2 text-left">
              <div className="flex items-center justify-between">
                <label className="text-[11px] font-bold text-slate-300 flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Tempo estimado de chegada ao local:</span>
                </label>
                <div className="flex items-center gap-1.5 bg-slate-950 px-2.5 py-1 rounded-xl border border-slate-800">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={alertEtaMinutes}
                    onChange={(e) => setAlertEtaMinutes(Math.max(1, Number(e.target.value) || 1))}
                    className="w-12 bg-transparent text-xs text-white font-mono font-bold text-right outline-none"
                  />
                  <span className="text-[11px] text-emerald-400 font-mono font-bold">min</span>
                </div>
              </div>
              <div className="flex flex-wrap gap-1.5 pt-0.5">
                {[10, 15, 20, 30, 45, 60].map((preset) => (
                  <button
                    key={preset}
                    type="button"
                    onClick={() => setAlertEtaMinutes(preset)}
                    className={`px-2 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                      alertEtaMinutes === preset
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/20'
                        : 'bg-slate-950/80 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {preset} min
                  </button>
                ))}
              </div>
            </div>

            <div className="flex gap-2.5 text-xs pt-1">
              <button
                onClick={() => {
                  if (activeAlertJob.status === 'despachado_prestador') {
                    providerAcceptDispatchedService(activeAlertJob.id, alertEtaMinutes);
                  } else {
                    acceptServiceRequestDirectly(activeAlertJob.id);
                  }
                  setCurrentRole('provider');
                }}
                className="flex-3 py-3.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 font-black uppercase rounded-2xl shadow-lg shadow-emerald-500/20 cursor-pointer flex items-center justify-center gap-1.5 transition-all text-xs tracking-wide"
              >
                <Check className="w-4 h-4 text-slate-950 stroke-[3]" />
                <span>CONFIRMAR E ACEITAR</span>
              </button>
              
              <button
                onClick={() => {
                  if (activeAlertJob.status === 'despachado_prestador') {
                    providerRejectDispatchedService(activeAlertJob.id, 'Recusado pelo prestador via radar');
                  } else {
                    providerRejectServiceRequest(activeAlertJob.id);
                  }
                }}
                className="flex-1 py-3.5 bg-slate-900 hover:bg-slate-850 border border-slate-800 text-rose-500 hover:text-rose-450 font-black uppercase rounded-2xl cursor-pointer flex items-center justify-center gap-1.5 transition-all text-xs"
              >
                <X className="w-4 h-4 shrink-0 stroke-[3]" />
                <span>RECUSAR</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Role Content View */}
      <main className="flex-1 pb-16">
        {!isClientAuthenticated && !isProviderAuthenticated && !isAdminAuthenticated && !hasChosenPortal ? (
          <GatewayPortal />
        ) : (
          <>
            {currentRole === 'client' && <ClientPortal />}
            {currentRole === 'provider' && <ProviderPortal />}
            {currentRole === 'admin' && <AdminPortal />}
          </>
        )}
      </main>

      {/* Persistent Bottom Floating Role Switcher Pill for Easy Test Driving - ONLY FOR AUTHENTICATED ADMIN */}
      {isAdminAuthenticated && (
        <div className="fixed bottom-4 inset-x-0 flex justify-center pointer-events-none z-30 px-4 animate-fade-in">
          <div className="bg-slate-950/95 backdrop-blur-md p-1.5 rounded-full border border-slate-800 shadow-2xl flex items-center gap-1 pointer-events-auto">
            <button
              onClick={() => setCurrentRole('client')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                (currentRole as string) === 'client'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <User className="w-3.5 h-3.5" />
              <span>Cliente</span>
              {reportsPendingReview > 0 && (currentRole as string) !== 'client' && (
                <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
              )}
            </button>

            <button
              onClick={() => setCurrentRole('provider')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                (currentRole as string) === 'provider'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <Wrench className="w-3.5 h-3.5" />
              <span>Prestador</span>
              {pendingRadarCount > 0 && (
                <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-rose-500 text-white animate-pulse">
                  {pendingRadarCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setCurrentRole('admin')}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                (currentRole as string) === 'admin'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/30'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ShieldCheck className="w-3.5 h-3.5" />
              <span>Admin</span>
            </button>
          </div>
        </div>
      )}

      {/* Floating Real-Time Synchronization Toast Container */}
      {activeToasts && activeToasts.length > 0 && (
        <div className="fixed top-24 right-4 z-[999999] flex flex-col gap-3 w-full max-w-sm pointer-events-none">
          {activeToasts
            .filter(toast => !toast.role || toast.role === currentRole)
            .map(toast => (
              <ToastItem
                key={toast.id}
                toast={toast}
                onDismiss={dismissToast}
              />
            ))}
        </div>
      )}

      {/* Real-time Service Tracker Sidebar - ONLY FOR ADMIN */}
      {currentRole === 'admin' && <ServiceTrackerSidebar />}

      {/* Footer */}
      <footer className="bg-black border-t border-slate-850 text-slate-400 py-6 text-xs text-center">
        <div className="max-w-7xl mx-auto px-4 space-y-2">
          <p className="font-semibold text-slate-300 font-display tracking-wider">
            M1 BRASIL SERVIÇOS • Plataforma Inteligente de Serviços Sob Demanda
          </p>
          <p className="text-slate-500 text-[11px]">
            Fluxo completo integrado: Cadastro • Fotos & Vídeos • Negociação de Propostas • Deslocamento GPS • Execução Antes & Depois • Avaliação & Pagamento Pix.
          </p>
        </div>
      </footer>
    </div>
  );
};

export default function App() {
  return (
    <AppProvider>
      <MainAppContent />
    </AppProvider>
  );
}
