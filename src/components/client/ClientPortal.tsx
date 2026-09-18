import React, { useState, useEffect } from 'react';
import { useApp } from '../../context/AppContext';
import { ServiceCategory, ServiceRequest, MediaItem, ServiceRating } from '../../types';
import { PRESET_SAMPLE_MEDIA } from '../../data/mockData';
import { soundManager } from '../../utils/audio';
import { InteractiveMap } from '../InteractiveMap';
import { PhotoReportViewer } from '../PhotoReportViewer';
import { MediaUploader } from '../MediaUploader';
import { RatingModal } from '../RatingModal';
import { M1Logo } from '../M1Logo';
import { CategoryCatalog } from './CategoryCatalog';
import { ServiceOrdersList } from './ServiceOrdersList';
import { ClientNotificationCenter } from './ClientNotificationCenter';
import { ClientProfilePanel } from './ClientProfilePanel';
import {
  Zap,
  Sparkles,
  Bell,
  Wrench,
  Clock,
  MapPin,
  CheckCircle2,
  AlertCircle,
  MessageSquare,
  ShieldCheck,
  Phone,
  CreditCard,
  X,
  Send,
  Calendar,
  Check,
  User,
  LocateFixed,
  FileText,
  UserPlus,
  RefreshCw,
  LogOut,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  ChevronRight,
  ArrowLeft,
  ShieldAlert,
  DollarSign,
  Camera,
  BellRing,
  AlertTriangle,
  Car,
  Smartphone,
  QrCode,
  Banknote,
  Star,
  ArrowRight
} from 'lucide-react';

const getWhatsAppLinkForClient = (service: ServiceRequest) => {
  const text = `Olá, gostaria de falar sobre o atendimento Código ${service.code} para o serviço de ${service.title}.`;
  return `https://wa.me/5511962122694?text=${encodeURIComponent(text)}`;
};

const ClientArrivalCountdown: React.FC<{ acceptedEpoch?: number; estimatedArrivalMinutes?: number }> = ({ acceptedEpoch, estimatedArrivalMinutes }) => {
  const [timeLeftStr, setTimeLeftStr] = useState('');

  useEffect(() => {
    if (!acceptedEpoch) return;
    const durationMin = estimatedArrivalMinutes || 15;
    const target = acceptedEpoch + durationMin * 60 * 1000;
    const update = () => {
      const remain = target - Date.now();
      if (remain <= 0) {
        setTimeLeftStr('Atraso Estimado');
        return;
      }
      const min = Math.floor(remain / 60000);
      const sec = Math.floor((remain % 60000) / 1000);
      setTimeLeftStr(`${min.toString().padStart(2, '0')}:${sec.toString().padStart(2, '0')}`);
    };
    update();
    const interval = setInterval(update, 1000);
    return () => clearInterval(interval);
  }, [acceptedEpoch, estimatedArrivalMinutes]);

  return (
    <div className="bg-amber-500/10 border border-amber-500/25 px-3.5 py-2 rounded-2xl text-center flex items-center justify-between shadow-inner">
      <span className="text-[10px] text-slate-400 font-extrabold uppercase tracking-wide flex items-center gap-1.5">
        <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
        Cronômetro de Chegada:
      </span>
      <span className="font-mono text-sm font-black text-amber-400">{timeLeftStr}</span>
    </div>
  );
};

export const ClientPortal: React.FC = () => {
  const {
    client,
    services,
    providers,
    settings,
    categories,
    createServiceRequest,
    registerClient,
    confirmClientLocation,
    approveReportAndPay,
    cancelServiceRequest,
    editServiceDetails,
    clientConfirmProviderArrival,
    clientAcknowledgeService,
    clientAcceptServicePrice,
    clientRejectServicePrice,
    isClientAuthenticated,
    loginClient,
    logoutClient,
    setHasChosenPortal,
    notifications,
    dismissNotification,
    markAllNotificationsRead
  } = useApp();

  const clientTheme = settings.clientThemeColor || 'red';
  const getThemeClasses = (themeName: string) => {
    switch (themeName) {
      case 'emerald':
        return {
          primary: 'bg-emerald-600',
          hover: 'hover:bg-emerald-500',
          text: 'text-emerald-400',
          textDark: 'text-emerald-500',
          bgLight: 'bg-emerald-600/15',
          border: 'border-emerald-500/20',
          border30: 'border-emerald-500/30',
          shadow: 'shadow-emerald-600/25',
          glowBg: 'bg-emerald-600/10',
          bulletText: 'text-emerald-400',
          indicator: 'bg-emerald-500',
          borderAccent: 'border-emerald-500/40',
        };
      case 'blue':
        return {
          primary: 'bg-blue-600',
          hover: 'hover:bg-blue-500',
          text: 'text-blue-400',
          textDark: 'text-blue-500',
          bgLight: 'bg-blue-600/15',
          border: 'border-blue-500/20',
          border30: 'border-blue-500/30',
          shadow: 'shadow-blue-600/25',
          glowBg: 'bg-blue-600/10',
          bulletText: 'text-blue-400',
          indicator: 'bg-blue-500',
          borderAccent: 'border-blue-500/40',
        };
      case 'indigo':
        return {
          primary: 'bg-indigo-600',
          hover: 'hover:bg-indigo-500',
          text: 'text-indigo-400',
          textDark: 'text-indigo-500',
          bgLight: 'bg-indigo-600/15',
          border: 'border-indigo-500/20',
          border30: 'border-indigo-500/30',
          shadow: 'shadow-indigo-600/25',
          glowBg: 'bg-indigo-600/10',
          bulletText: 'text-indigo-400',
          indicator: 'bg-indigo-500',
          borderAccent: 'border-indigo-500/40',
        };
      case 'amber':
        return {
          primary: 'bg-amber-600',
          hover: 'hover:bg-amber-500',
          text: 'text-amber-400',
          textDark: 'text-amber-500',
          bgLight: 'bg-amber-600/15',
          border: 'border-amber-500/20',
          border30: 'border-amber-500/30',
          shadow: 'shadow-amber-600/25',
          glowBg: 'bg-amber-600/10',
          bulletText: 'text-amber-400',
          indicator: 'bg-amber-500',
          borderAccent: 'border-amber-500/40',
        };
      case 'purple':
        return {
          primary: 'bg-purple-600',
          hover: 'hover:bg-purple-500',
          text: 'text-purple-400',
          textDark: 'text-purple-500',
          bgLight: 'bg-purple-600/15',
          border: 'border-purple-500/20',
          border30: 'border-purple-500/30',
          shadow: 'shadow-purple-600/25',
          glowBg: 'bg-purple-600/10',
          bulletText: 'text-purple-400',
          indicator: 'bg-purple-500',
          borderAccent: 'border-purple-500/40',
        };
      case 'cyan':
        return {
          primary: 'bg-cyan-600',
          hover: 'hover:bg-cyan-500',
          text: 'text-cyan-400',
          textDark: 'text-cyan-500',
          bgLight: 'bg-cyan-600/15',
          border: 'border-cyan-500/20',
          border30: 'border-cyan-500/30',
          shadow: 'shadow-cyan-600/25',
          glowBg: 'bg-cyan-600/10',
          bulletText: 'text-cyan-400',
          indicator: 'bg-cyan-500',
          borderAccent: 'border-cyan-500/40',
        };
      case 'red':
      default:
        return {
          primary: 'bg-red-600',
          hover: 'hover:bg-red-500',
          text: 'text-red-400',
          textDark: 'text-red-500',
          bgLight: 'bg-red-600/15',
          border: 'border-red-500/20',
          border30: 'border-red-500/30',
          shadow: 'shadow-red-600/25',
          glowBg: 'bg-red-600/10',
          bulletText: 'text-red-400',
          indicator: 'bg-red-500',
          borderAccent: 'border-red-500/40',
        };
    }
  };
  const theme = getThemeClasses(clientTheme);

  const getStatusConfig = (status: string) => {
    switch (status) {
      case 'solicitado':
      case 'aguardando_despacho_admin':
        return {
          theme: 'yellow' as const,
          badge: 'Orçamento sob Análise',
          title: 'Análise da Central Técnica',
          borderColor: 'border-yellow-500/50',
          textColor: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          iconColor: 'text-yellow-400',
          desc: 'Nossa central técnica está avaliando as fotos e a descrição do seu chamado para estabelecer o orçamento garantido M1.',
        };
      case 'aguardando_confirmacao_cliente':
      case 'aceito_pelo_prestador':
        return {
          theme: 'yellow' as const,
          badge: 'Aguardando Sua Aprovação',
          title: 'Orçamento Disponível',
          borderColor: 'border-yellow-500/55',
          textColor: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          iconColor: 'text-yellow-400',
          desc: 'O técnico credenciado M1 analisou o chamado e o orçamento oficial já está pronto para sua aprovação.',
        };
      case 'valor_aprovado_cliente':
        return {
          theme: 'green' as const,
          badge: 'Serviço Aprovado',
          title: 'Aguardando Despacho',
          borderColor: 'border-green-500/50',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/10',
          iconColor: 'text-green-400',
          desc: 'Você aprovou o valor! O Administrador M1 está encaminhando a ordem de serviço para o técnico parceiro iniciar o trajeto.',
        };
      case 'despachado_prestador':
        return {
          theme: 'green' as const,
          badge: 'Prestador Indicado',
          title: 'Técnico Notificado',
          borderColor: 'border-green-500/50',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/10',
          iconColor: 'text-green-400',
          desc: 'O chamado foi indicado ao profissional credenciado, que tem até 5 minutos para iniciar seu trânsito.',
        };
      case 'em_deslocamento':
        return {
          theme: 'green' as const,
          badge: 'Prestador a Caminho',
          title: 'Técnico em Deslocamento',
          borderColor: 'border-green-500/55',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/10',
          iconColor: 'text-green-400',
          desc: 'O técnico parceiro aceitou o chamado e está em trânsito urgente para o seu endereço com rastreamento ativo.',
        };
      case 'chegou_ao_local':
        return {
          theme: 'green' as const,
          badge: 'Ações Concluídas - No Local',
          title: 'Técnico Chegou ao Local',
          borderColor: 'border-green-500/55',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/10',
          iconColor: 'text-green-400',
          desc: 'O profissional credenciado M1 chegou ao seu endereço. Confirme a chegada para iniciar a execução do serviço.',
        };
      case 'em_execucao':
        return {
          theme: 'green' as const,
          badge: 'Ações Concluídas - Em Serviço',
          title: 'Serviço em Execução',
          borderColor: 'border-green-500/50',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/10',
          iconColor: 'text-green-400',
          desc: 'O técnico está executando os reparos contratados. O andamento é auditado em tempo real por fotos pela Central M1.',
        };
      case 'relatorio_enviado':
        return {
          theme: 'green' as const,
          badge: 'Ações Concluídas - Laudo Pronto',
          title: 'Aguardando Pagamento',
          borderColor: 'border-green-500/55',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/10',
          iconColor: 'text-green-400',
          desc: 'O laudo fotográfico do atendimento foi concluído. Avalie o serviço e libere o pagamento para finalizar.',
        };
      case 'aguardando_confirmacao_pagamento':
        return {
          theme: 'yellow' as const,
          badge: 'Pix Enviado - Em Validação',
          title: 'Aguardando Validação do Pix',
          borderColor: 'border-yellow-500/55',
          textColor: 'text-yellow-400',
          bgColor: 'bg-yellow-500/10',
          iconColor: 'text-yellow-400',
          desc: 'Você registrou o pagamento via Pix. A Central M1 está validando a transação para emitir o termo oficial e liberar sua garantia formal de 90 dias.',
        };
      case 'concluido_pago':
        return {
          theme: 'green' as const,
          badge: 'Pagamento Confirmado',
          title: 'Chamado Concluído com Sucesso',
          borderColor: 'border-green-500/55',
          textColor: 'text-green-400',
          bgColor: 'bg-green-500/10',
          iconColor: 'text-green-400',
          desc: 'Atendimento finalizado com total garantia de 90 dias M1 Brasil. Muito obrigado por escolher nossos serviços!',
        };
      case 'cancelado':
      case 'recusado_cliente':
      default:
        return {
          theme: 'red' as const,
          badge: 'Orçamento Recusado / Cancelado',
          title: 'Chamado Cancelado',
          borderColor: 'border-red-500/55',
          textColor: 'text-red-400',
          bgColor: 'bg-red-500/10',
          iconColor: 'text-red-400',
          desc: 'Este atendimento foi cancelado ou recusado. Se precisar de ajuda, abra uma nova solicitação na Central M1.',
        };
    }
  };

  // Navigation states
  const [currentTab, setCurrentTab] = useState<'inicio' | 'pedidos' | 'mensagens' | 'perfil'>('inicio');
  const [expandedRequestId, setExpandedRequestId] = useState<string | null>(null);

  // Custom logout handler to reset all views and return to login/registration page
  const handleLogout = () => {
    logoutClient();
    setCurrentTab('inicio');
    setActiveView('dashboard');
    setRequestStep('select_category');
    setAuthMode('welcome');
    setLoginIdentifier(() => {
      try {
        return localStorage.getItem('m1_last_client_whatsapp') || '';
      } catch {
        return '';
      }
    });
    setLoginPassword('');
    setLoginError('');
    setRegError('');
    setRegName('');
    setRegPhone('');
    setRegEmail('');
    setRegCpf('');
    setRegPassword('');
    setRegPasswordConfirm('');
    setRegStreet('');
    setRegNumber('');
    setRegNeighborhood('');
    setRegCep('');
    setLgpdConsent(false);
    setGpsSuccessMessage(null);
    setServiceTitle('');
    setServiceDescription('');
    setAdditionalNotes('');
    setMediaList([]);
    setExpandedRequestId(null);
  };

  // Mode: 'welcome', 'login' or 'register'
  const [authMode, setAuthMode] = useState<'welcome' | 'login' | 'register'>('login');

  // Automatically reset to login screen if the user becomes unauthenticated
  useEffect(() => {
    if (!isClientAuthenticated) {
      setAuthMode('login');
    }
  }, [isClientAuthenticated]);

  // Login Form States
  const [loginIdentifier, setLoginIdentifier] = useState(() => {
    try {
      return localStorage.getItem('m1_last_client_whatsapp') || '';
    } catch {
      return '';
    }
  });
  const [loginPassword, setLoginPassword] = useState('');
  const [showLoginPassword, setShowLoginPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Form Fields for New Client Registration
  const [regName, setRegName] = useState('');
  const [regPhone, setRegPhone] = useState('');
  const [regEmail, setRegEmail] = useState('');
  const [regCpf, setRegCpf] = useState('');
  const [regPassword, setRegPassword] = useState('');
  const [regPasswordConfirm, setRegPasswordConfirm] = useState('');
  const [showRegPassword, setShowRegPassword] = useState(false);
  const [regStreet, setRegStreet] = useState('');
  const [regComplement, setRegComplement] = useState('');
  const [regNumber, setRegNumber] = useState('');
  const [regNeighborhood, setRegNeighborhood] = useState('');
  const [regCity, setRegCity] = useState(settings.city || 'São Paulo, SP');
  const [regState, setRegState] = useState('SP');
  const [regCep, setRegCep] = useState('');
  const [regLat, setRegLat] = useState<number>(-23.561684);
  const [regLng, setRegLng] = useState<number>(-46.655981);
  const [regLoading, setRegLoading] = useState(false);
  const [regError, setRegError] = useState('');
  const [gpsDetecting, setGpsDetecting] = useState(false);
  const [gpsSuccessMessage, setGpsSuccessMessage] = useState<string | null>(null);
  const [lgpdConsent, setLgpdConsent] = useState(false);

  // Active client requests (filtered strictly by current logged-in client id, sorted newest first)
  const clientRequests = [...services]
    .filter(s => s.clientId === client?.id)
    .sort((a, b) => b.id.localeCompare(a.id));
  const activeService = clientRequests.find(s => s.status !== 'concluido_pago' && s.status !== 'aguardando_confirmacao_pagamento' && s.status !== 'cancelado');
  const proposedPriceService = clientRequests.find(s => s.status === 'aguardando_confirmacao_cliente');

  // Termo de 15% de cancelamento acordado pelo cliente
  const [clientCancelFeeAgreed, setClientCancelFeeAgreed] = useState<Record<string, boolean>>({});
  const [clientTermAlertTriggered, setClientTermAlertTriggered] = useState<Record<string, boolean>>({});
  const [dismissedClientSpamIds, setDismissedClientSpamIds] = useState<Record<string, boolean>>({});
  const [zoomedPhotoUrl, setZoomedPhotoUrl] = useState<string | null>(null);

  const isProposedPriceSpamOpen = Boolean(proposedPriceService && !dismissedClientSpamIds[proposedPriceService.id]);

  // GPS Location Activation State on Dashboard
  const [isActivatingGps, setIsActivatingGps] = useState(false);

  // Request Service States
  const [activeView, setActiveView] = useState<'dashboard' | 'request_form'>('dashboard');
  const [requestStep, setRequestStep] = useState<'select_category' | 'fill_details'>('select_category');
  const [selectedCategory, setSelectedCategory] = useState<ServiceCategory>('geral');
  const [serviceTitle, setServiceTitle] = useState<string>('');
  const [serviceDescription, setServiceDescription] = useState<string>('');
  const [additionalNotes, setAdditionalNotes] = useState<string>('');
  const [urgency, setUrgency] = useState<'imediato' | 'agendado'>('imediato');
  const [mediaList, setMediaList] = useState<MediaItem[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Custom precise address fields for current service request
  const [useDefaultAddress, setUseDefaultAddress] = useState<boolean>(true);
  const [reqStreet, setReqStreet] = useState<string>('');
  const [reqNumber, setReqNumber] = useState<string>('');
  const [reqNeighborhood, setReqNeighborhood] = useState<string>('');
  const [reqCity, setReqCity] = useState<string>('');
  const [reqState, setReqState] = useState<string>('SP');
  const [reqComplement, setReqComplement] = useState<string>('');
  const [reqCep, setReqCep] = useState<string>('');

  const [isOverlayOpen, setIsOverlayOpen] = useState(true);
  const [showCategorySelector, setShowCategorySelector] = useState(false);

  // Track previous active service to detect when it changes to completed (concluido_pago)
  const [prevActiveServiceId, setPrevActiveServiceId] = useState<string | null>(null);

  useEffect(() => {
    if (activeService) {
      setPrevActiveServiceId(activeService.id);
    } else {
      setPrevActiveServiceId(prevId => {
        if (!prevId) return null;
        // Check if the previously active service was completed and paid
        const lastServiceObj = services.find(s => s.id === prevId);
        if (lastServiceObj?.status === 'concluido_pago') {
          // Clear active views and close tracking overlay, returning to a clean home dashboard
          setCurrentTab('inicio');
          setActiveView('dashboard');
          setIsOverlayOpen(false);
          setRatingModalService(null);
          setInspectingReport(null);
        }
        return null;
      });
    }
  }, [activeService?.id, services]);

  // Sempre que houver uma solicitação ativa ou mudança de status, reabre o overlay sobreposto
  useEffect(() => {
    if (activeService) {
      setIsOverlayOpen(true);
    }
  }, [activeService?.id, activeService?.status]);

  // Sempre que surgir um orçamento definido pelo admin, garante que o SPAM de proposta esteja aberto
  useEffect(() => {
    if (proposedPriceService?.id) {
      setDismissedClientSpamIds(prev => ({ ...prev, [proposedPriceService.id]: false }));
      soundManager.playAdminAlarm();
    }
  }, [proposedPriceService?.id, proposedPriceService?.estimatedPrice]);

  const [regCepSearching, setRegCepSearching] = useState(false);
  const [regCepError, setRegCepError] = useState('');
  const [reqCepSearching, setReqCepSearching] = useState(false);
  const [reqCepError, setReqCepError] = useState('');

  const handleRegCepChange = async (cepValue: string) => {
    const raw = cepValue.replace(/\D/g, '').slice(0, 8);
    let formatted = raw;
    if (raw.length > 5) {
      formatted = `${raw.slice(0, 5)}-${raw.slice(5)}`;
    }
    setRegCep(formatted);

    if (raw.length === 8) {
      setRegCepSearching(true);
      setRegCepError('');
      try {
        const response = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        if (response.ok) {
          const data = await response.json();
          if (data.erro) {
            setRegCepError('CEP não encontrado.');
          } else {
            setRegStreet(data.logradouro || '');
            setRegNeighborhood(data.bairro || '');
            setRegCity(data.localidade || 'São Paulo');
            setRegState(data.uf || 'SP');
            setRegCepError('');
          }
        }
      } catch (err) {
        setRegCepError('Erro ao consultar CEP.');
      } finally {
        setRegCepSearching(false);
      }
    }
  };

  const handleReqCepChange = async (cepValue: string) => {
    const raw = cepValue.replace(/\D/g, '').slice(0, 8);
    let formatted = raw;
    if (raw.length > 5) {
      formatted = `${raw.slice(0, 5)}-${raw.slice(5)}`;
    }
    setReqCep(formatted);

    if (raw.length === 8) {
      setReqCepSearching(true);
      setReqCepError('');
      try {
        const response = await fetch(`https://viacep.com.br/ws/${raw}/json/`);
        if (response.ok) {
          const data = await response.json();
          if (data.erro) {
            setReqCepError('CEP não encontrado.');
          } else {
            setReqStreet(data.logradouro || '');
            setReqNeighborhood(data.bairro || '');
            setReqCity(data.localidade || 'São Paulo');
            setReqState(data.uf || 'SP');
            setReqCepError('');
          }
        }
      } catch (err) {
        setReqCepError('Erro ao consultar CEP.');
      } finally {
        setReqCepSearching(false);
      }
    }
  };

  useEffect(() => {
    if (client && client.defaultAddress) {
      setReqStreet(client.defaultAddress.street || '');
      setReqNumber(client.defaultAddress.number || '');
      setReqNeighborhood(client.defaultAddress.neighborhood || '');
      setReqCity(client.defaultAddress.city || '');
      setReqState(client.defaultAddress.state || 'SP');
      setReqComplement(client.defaultAddress.complement || '');
      setReqCep(client.defaultAddress.zipCode || '');
    }
  }, [client]);

  // Active Service Action Modals
  const [inspectingReport, setInspectingReport] = useState<ServiceRequest | null>(null);
  const [ratingModalService, setRatingModalService] = useState<ServiceRequest | null>(null);
  const [serviceCompletionNotice, setServiceCompletionNotice] = useState<ServiceRequest | null>(null);
  const [paymentStep, setPaymentStep] = useState<'none' | 'pending' | 'rating' | 'finished'>('none');
  const [paymentService, setPaymentService] = useState<ServiceRequest | null>(null);
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState<'pix' | 'dinheiro' | 'cartao' | null>(null);
  const [ratingScore, setRatingScore] = useState<number>(5);
  const [ratingComment, setRatingComment] = useState<string>('');
  const [spamOnTheWayService, setSpamOnTheWayService] = useState<ServiceRequest | null>(null);
  const [cancellationNoticeService, setCancellationNoticeService] = useState<ServiceRequest | null>(null);
  const [shownCancellationNotice, setShownCancellationNotice] = useState<Record<string, boolean>>(() => {
    try {
      const stored = localStorage.getItem('m1_shown_cancellation_notice');
      return stored ? JSON.parse(stored) : {};
    } catch {
      return {};
    }
  });
  const [hasShownCompletionRating, setHasShownCompletionRating] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('m1_shown_completion_rating');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Intercept ratingModalService setting to initiate the unified multi-step payment and rating flow
  useEffect(() => {
    if (ratingModalService) {
      setPaymentService(ratingModalService);
      setPaymentStep('pending');
      setRatingModalService(null);
    }
  }, [ratingModalService]);

  // Cleanup and redirect when paymentStep is 'finished'
  useEffect(() => {
    if (paymentStep === 'finished') {
      setPaymentService(null);
      setPaymentStep('none');
      setRatingModalService(null);
      setServiceCompletionNotice(null);
      setSelectedPaymentMethod(null);
      setRatingScore(5);
      setRatingComment('');
      setIsOverlayOpen(false);
      setActiveView('dashboard');
      setCurrentTab('inicio');
    }
  }, [paymentStep]);


  // Status updates tracker and visual/soft auditory alarms
  const [lastKnownStatuses, setLastKnownStatuses] = useState<Record<string, string>>(() => {
    try {
      const saved = localStorage.getItem('m1_client_last_statuses');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });
  const [visualAlarms, setVisualAlarms] = useState<{ id: string; code: string; message: string; title: string; timestamp: string }[]>([]);
  const [hasPlayedProposalSound, setHasPlayedProposalSound] = useState<Record<string, boolean>>({});

  // 1. Listen for active service changes to trigger real-time soft auditory alarms + visual alerts
  useEffect(() => {
    if (!client) return;
    const activeRequests = services.filter(s => s.clientId === client.id);
    
    let hasChanges = false;
    const updatedStatuses = { ...lastKnownStatuses };
    const alarmsToAdd: any[] = [];

    activeRequests.forEach(req => {
      const prevStatus = lastKnownStatuses[req.id];
      
      // Only trigger if we already had a known status and it has changed
      if (prevStatus !== undefined && prevStatus !== req.status) {
        soundManager.playSoftClientAlarm();

        let friendlyStatus: string = req.status;
        if (req.status === 'aguardando_confirmacao_cliente') friendlyStatus = 'Orçamento pronto para sua aprovação!';
        else if (req.status === 'despachado_prestador') friendlyStatus = 'Aguardando confirmação do técnico';
        else if (req.status === 'em_deslocamento') friendlyStatus = 'Técnico credenciado já está a caminho!';
        else if (req.status === 'chegou_ao_local') friendlyStatus = 'O especialista chegou ao local!';
        else if (req.status === 'em_execucao') friendlyStatus = 'Serviço iniciado em execução';
        else if (req.status === 'relatorio_enviado') friendlyStatus = 'Laudo Técnico pronto para aprovação final!';
        else if (req.status === 'aguardando_confirmacao_pagamento') friendlyStatus = 'Aguardando validação do Pix pela Central M1';
        else if (req.status === 'concluido_pago') friendlyStatus = 'Serviço concluído e pago com sucesso!';
        else if (req.status === 'cancelado') friendlyStatus = 'Solicitação cancelada';

        const newAlarm = {
          id: req.id + '-' + Date.now() + '-' + Math.floor(Math.random() * 100),
          code: req.code,
          title: req.status === 'aguardando_confirmacao_cliente' ? '💼 ORÇAMENTO DISPONÍVEL' : '🔔 ATUALIZAÇÃO DO SEU CHAMADO',
          message: `O chamado #${req.code} mudou de status para: "${friendlyStatus}".`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        alarmsToAdd.push(newAlarm);
        hasChanges = true;
      }
      updatedStatuses[req.id] = req.status;
    });

    const prevKeysLength = Object.keys(lastKnownStatuses).length;
    if (hasChanges || prevKeysLength !== activeRequests.length) {
      setLastKnownStatuses(updatedStatuses);
      if (alarmsToAdd.length > 0) {
        setVisualAlarms(prevAlarms => {
          let nextAlarms = [...prevAlarms];
          alarmsToAdd.forEach(newAlarm => {
            nextAlarms = [newAlarm, ...nextAlarms.filter(a => a.code !== newAlarm.code)];
          });
          return nextAlarms;
        });
      }
      try {
        localStorage.setItem('m1_client_last_statuses', JSON.stringify(updatedStatuses));
      } catch (e) {}
    }
  }, [services, client?.id, lastKnownStatuses]);

  // 2. Play soft sound instantly when a proposedPriceService (aguardando_confirmacao_cliente) appears in this session
  useEffect(() => {
    if (!proposedPriceService) return;
    setHasPlayedProposalSound(prev => {
      if (prev[proposedPriceService.id]) return prev;
      soundManager.playSoftClientAlarm();
      return { ...prev, [proposedPriceService.id]: true };
    });
  }, [proposedPriceService?.id]);
  const [hasShownOnWaySpam, setHasShownOnWaySpam] = useState<Record<string, boolean>>(() => {
    try {
      const saved = localStorage.getItem('m1_shown_on_way_spam');
      return saved ? JSON.parse(saved) : {};
    } catch {
      return {};
    }
  });

  // Automatically trigger the full-screen "SPAM" (overlay/popup) modal when service transitions to 'em_deslocamento'
  useEffect(() => {
    if (!client) return;
    const onWayService = services.find(
      s => s.clientId === client.id && s.status === 'em_deslocamento'
    );
    if (onWayService) {
      setHasShownOnWaySpam(prev => {
        if (prev[onWayService.id]) return prev;
        setSpamOnTheWayService(onWayService);
        const updated = { ...prev, [onWayService.id]: true };
        try {
          localStorage.setItem('m1_shown_on_way_spam', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  }, [services, client?.id]);

  // Automatically trigger the Rating and Payment Modal (SPAM) when the service transitions to 'relatorio_enviado' (Awaiting Payment / Report Sent)
  useEffect(() => {
    if (!client) return;
    const completedService = services.find(
      s => s.clientId === client.id && s.status === 'relatorio_enviado'
    );
    if (completedService) {
      setHasShownCompletionRating(prev => {
        if (prev[completedService.id]) return prev;
        setPaymentService(completedService);
        setPaymentStep('pending');
        const updated = { ...prev, [completedService.id]: true };
        try {
          localStorage.setItem('m1_shown_completion_rating', JSON.stringify(updated));
        } catch (e) {}
        return updated;
      });
    }
  }, [services, client?.id]);

  // Automatically trigger the Cancellation Notice Modal when a service request is 'cancelado'
  useEffect(() => {
    if (!client) return;
    const cancelledService = services.find(
      s => s.clientId === client.id && s.status === 'cancelado'
    );
    if (cancelledService) {
      if (!shownCancellationNotice[cancelledService.id]) {
        setCancellationNoticeService(cancelledService);
        setShownCancellationNotice(prev => {
          const updated = { ...prev, [cancelledService.id]: true };
          try {
            localStorage.setItem('m1_shown_cancellation_notice', JSON.stringify(updated));
          } catch {}
          return updated;
        });
      }
    }
  }, [services, client?.id, shownCancellationNotice]);

  // Auto-detect GPS during registration
  const handleDetectGpsForRegistration = () => {
    setGpsDetecting(true);
    setGpsSuccessMessage(null);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          setRegLat(latitude);
          setRegLng(longitude);
          setGpsDetecting(false);
          setGpsSuccessMessage(`GPS detectado com sucesso: Lat ${latitude.toFixed(4)}, Lng ${longitude.toFixed(4)}`);
        },
        () => {
          setRegLat(-23.561684);
          setRegLng(-46.655981);
          setGpsDetecting(false);
          setGpsSuccessMessage('GPS aproximado definido: Região Central de São Paulo, SP');
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      setRegLat(-23.561684);
      setRegLng(-46.655981);
      setGpsDetecting(false);
      setGpsSuccessMessage('GPS aproximado definido: Região Central');
    }
  };

  // Handle Client Login
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    setTimeout(() => {
      const res = loginClient(loginIdentifier, loginPassword);
      setLoginLoading(false);
      if (!res.success) {
        setLoginError(res.message);
      }
    }, 300);
  };

  // Handle Client Registration
  const handleRegisterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setRegError('');

    if (!regName.trim()) {
      setRegError('Por favor, preencha seu nome completo.');
      return;
    }
    if (!regPhone.trim()) {
      setRegError('Por favor, preencha seu WhatsApp ou telefone.');
      return;
    }
    if (!regPassword || regPassword.length < 4) {
      setRegError('A senha deve conter no mínimo 4 dígitos.');
      return;
    }
    if (regPassword !== regPasswordConfirm) {
      setRegError('As senhas não coincidem. Verifique e digite novamente.');
      return;
    }

    setRegLoading(true);

    (async () => {
      try {
        const res = await registerClient({
          name: regName.trim(),
          phone: regPhone.trim(),
          email: regEmail.trim() || `${regName.toLowerCase().replace(/\s+/g, '')}@cliente.com`,
          cpf: regCpf.trim(),
          password: regPassword.trim(),
          address: {
            street: regStreet.trim() || 'Av. Paulista',
            number: regNumber.trim() || '1000',
            neighborhood: regNeighborhood.trim() || 'Bela Vista',
            city: regCity.trim() || 'São Paulo',
            state: regState.trim() || 'SP',
            zipCode: regCep.trim() || '01310-100',
            complement: regComplement.trim(),
            lat: regLat,
            lng: regLng
          }
        });

        if (!res.success) {
          setRegError(res.message);
        }
      } catch (err) {
        setRegError('Ocorreu um erro ao realizar seu cadastro. Por favor, tente novamente.');
      } finally {
        setRegLoading(false);
      }
    })();
  };

  // Handle GPS Activation on Dashboard
  const handleActivateLocation = () => {
    if (!client) return;
    setIsActivatingGps(true);

    if ('geolocation' in navigator) {
      navigator.geolocation.getCurrentPosition(
        position => {
          const { latitude, longitude } = position.coords;
          confirmClientLocation(client.id, latitude, longitude);
          setIsActivatingGps(false);
        },
        () => {
          confirmClientLocation(client.id, client.defaultAddress?.lat || -23.55052, client.defaultAddress?.lng || -46.633308);
          setIsActivatingGps(false);
        },
        { enableHighAccuracy: true, timeout: 8000, maximumAge: 0 }
      );
    } else {
      confirmClientLocation(client.id, -23.55052, -46.633308);
      setIsActivatingGps(false);
    }
  };

  // Open Service Creation from Category Card
  const handleOpenCategoryCustom = (catId: ServiceCategory) => {
    setSelectedCategory(catId);
    const catObj = categories.find(c => c.id === catId);
    setServiceTitle(catObj ? `Serviço de ${catObj.name}` : '');
    setServiceDescription('');
    setMediaList([]);
    setAdditionalNotes('');
    setActiveView('request_form');
    setRequestStep('fill_details');
  };

  const handleSendServiceRequest = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!client) return;
    setIsSubmitting(true);

    // Evitar duplicada ativa
    const isDuplicate = clientRequests.some(s => 
      s.status !== 'concluido_pago' && 
      s.status !== 'cancelado' && 
      s.title.toLowerCase().trim() === serviceTitle.toLowerCase().trim()
    );
    if (isDuplicate) {
      alert("Você já possui uma solicitação ativa com este mesmo assunto. Conclua-a antes de criar outra.");
      setIsSubmitting(false);
      return;
    }

    const catInfo = categories.find(c => c.id === selectedCategory);
    const price = catInfo?.basePrice || 150;

    const finalDescription = serviceDescription + (additionalNotes ? `\n\nNotas adicionais de materiais:\n${additionalNotes}` : '');

    const finalAddress = useDefaultAddress && client.defaultAddress
      ? client.defaultAddress
      : {
          street: reqStreet.trim() || client.defaultAddress?.street || 'Rua não informada',
          number: reqNumber.trim() || client.defaultAddress?.number || 'S/N',
          neighborhood: reqNeighborhood.trim() || client.defaultAddress?.neighborhood || 'Bairro',
          city: reqCity.trim() || client.defaultAddress?.city || 'Cidade',
          state: reqState.trim() || client.defaultAddress?.state || 'SP',
          zipCode: reqCep.trim() || client.defaultAddress?.zipCode || '',
          complement: reqComplement.trim(),
          lat: client.defaultAddress?.lat || -23.55052,
          lng: client.defaultAddress?.lng || -46.633308
        };

    try {
      const payload = {
        category: selectedCategory,
        title: serviceTitle || `Atendimento de ${catInfo?.name || 'Manutenção'}`,
        description: finalDescription || 'Solicitação enviada via M1 Portal.',
        urgency,
        media: mediaList,
        address: finalAddress,
        estimatedPrice: 0
      };
      console.log("Dados a serem enviados:", payload);

      await createServiceRequest(payload);

      setIsSubmitting(false);
      setActiveView('dashboard');
      setCurrentTab('pedidos'); // Go to orders immediately after requesting
      setIsOverlayOpen(true); // Abre o SPAM de acompanhamento sobreposto na tela
    } catch (error) {
      console.error("❌ Falha crítica ao enviar chamado para o Firestore:", error);
      alert(`⚠️ Falha ao salvar a solicitação no banco de dados. Por favor, tente novamente.\nDetalhes: ${error instanceof Error ? error.message : String(error)}`);
      setIsSubmitting(false);
    }
  };

  // 1. AUTHENTICATION & LOGIN/REGISTRATION SCREEN
  if (!isClientAuthenticated || !client) {
    return (
      <div className="max-w-xl mx-auto px-4 py-8 space-y-6 animate-fade-in" id="client-auth-screen">
        <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className={`absolute top-0 right-0 w-72 h-72 ${theme.glowBg} rounded-full blur-3xl pointer-events-none`} />

          {settings.clientBannerImage && (
            <div className="w-full h-36 rounded-2xl overflow-hidden mb-2 border border-slate-800">
              <img src={settings.clientBannerImage} className="w-full h-full object-cover" alt="Banner Personalizado" referrerPolicy="no-referrer" />
            </div>
          )}

          {/* Logo */}
          <div className="flex flex-col items-center text-center space-y-2">
            <M1Logo className={`w-16 h-16 ${theme.text} shrink-0 filter drop-shadow-[0_0_15px_rgba(239,68,68,0.3)]`} />
            <div>
              <span className={`text-xs uppercase font-black tracking-widest text-white ${theme.primary} px-4 py-2 rounded-full border ${theme.border30} shadow-[0_0_15px_rgba(239,68,68,0.4)] animate-pulse inline-block`}>
                🔒 Área Exclusiva do Cliente
              </span>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight mt-2">{settings.clientPageTitle || 'M1 Serviços Técnicos'}</h2>
              <p className="text-xs text-slate-400 font-sans mt-1">{settings.clientPageSubtitle || 'Conectando você de forma instantânea aos melhores profissionais'}</p>
            </div>
          </div>

          {/* Welcome view or tabbed selection */}
          {authMode === 'welcome' ? (
            <div className="space-y-6 text-center py-2">
              <div className="p-4 bg-slate-950/40 rounded-2xl border border-slate-800 text-slate-300 space-y-2 text-xs text-left leading-relaxed">
                <p className="font-extrabold text-white text-sm flex items-center gap-1.5">
                  <Sparkles className="w-4 h-4 text-red-500 animate-pulse" />
                  <span>Bem-vindo(a) ao Portal do Cliente!</span>
                </p>
                <p className="font-sans text-slate-400">
                  Aqui você pode solicitar serviços rápidos de reparo, manutenção e suporte técnico imediato com acompanhamento em tempo real via mapa GPS. 
                </p>
                <p className="font-sans text-slate-400">
                  Para começar com segurança, escolha uma das opções abaixo:
                </p>
              </div>

              <div className="space-y-3">
                <button
                  onClick={() => { setAuthMode('login'); setLoginError(''); setRegError(''); }}
                  className="w-full py-4 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl cursor-pointer shadow-lg text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:shadow-red-600/25 animate-pulse"
                >
                  <User className="w-4 h-4" />
                  <span>Entrar</span>
                </button>

                <button
                  onClick={() => { setAuthMode('register'); setLoginError(''); setRegError(''); }}
                  className="w-full py-4 bg-slate-850 hover:bg-slate-800 text-slate-200 border border-slate-750 font-black rounded-xl cursor-pointer shadow-md text-xs uppercase tracking-widest transition-all flex items-center justify-center gap-2 hover:border-slate-700"
                >
                  <UserPlus className="w-4 h-4 text-red-500" />
                  <span>Criar Conta</span>
                </button>

                <button
                  type="button"
                  onClick={() => setHasChosenPortal(false)}
                  className="w-full py-3.5 bg-transparent hover:bg-slate-800/20 text-slate-400 hover:text-white border border-slate-800 font-extrabold rounded-xl cursor-pointer text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="w-4 h-4 text-red-500" />
                  <span>Voltar para Seleção de Perfil</span>
                </button>
              </div>
            </div>
          ) : (
            <>
              {/* Back to welcome screen option */}
              <div className="text-left pb-1">
                <button
                  onClick={() => setAuthMode('welcome')}
                  className="text-slate-400 hover:text-white flex items-center gap-1.5 cursor-pointer text-xs font-semibold hover:underline"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Voltar para Boas-vindas</span>
                </button>
              </div>

              {/* Tab Selection */}
              <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1.5 rounded-2xl border border-slate-800">
                <button
                  onClick={() => { setAuthMode('login'); setLoginError(''); setRegError(''); }}
                  className={`py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    authMode === 'login' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Entrar
                </button>
                <button
                  onClick={() => { setAuthMode('register'); setLoginError(''); setRegError(''); }}
                  className={`py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer ${
                    authMode === 'register' ? 'bg-red-600 text-white shadow-md' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Criar Conta
                </button>
              </div>

              {/* AUTHENTICATION FORMS */}
              {authMode === 'login' ? (
            <form onSubmit={handleLoginSubmit} className="space-y-4 text-xs">
              {/* WhatsApp Login Highlight Box */}
              <div className="p-3 bg-red-600/10 border border-red-500/20 rounded-2xl text-left space-y-1">
                <p className="text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-red-500 animate-pulse" />
                  <span>Acesso Individual via WhatsApp</span>
                </p>
                <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans">
                  Para acessar o seu perfil de cliente, insira o número do seu <strong>WhatsApp</strong> e a sua senha pessoal. Cada cadastro de usuário é exclusivo, único e individual.
                </p>
              </div>

              {loginError && (
                <div className="p-3 bg-red-500/15 text-red-400 rounded-xl border border-red-500/20 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 text-red-400" />
                  <span>{loginError}</span>
                </div>
              )}

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Número de WhatsApp (Celular Cadastrado)</label>
                <input
                  type="text"
                  required
                  placeholder="Ex: (11) 98765-4321"
                  value={loginIdentifier}
                  onChange={e => setLoginIdentifier(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-3 text-white outline-none font-bold animate-pulse"
                />
              </div>

              <div>
                <label className="block text-slate-300 font-bold mb-1.5">Sua Senha M1</label>
                <div className="relative">
                  <input
                    type={showLoginPassword ? 'text' : 'password'}
                    required
                    placeholder="Sua senha de acesso"
                    value={loginPassword}
                    onChange={e => setLoginPassword(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-3 pr-10 text-white outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => setShowLoginPassword(!showLoginPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-white"
                  >
                    {showLoginPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loginLoading}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 text-white font-black rounded-xl cursor-pointer shadow-md text-xs uppercase transition-all hover:shadow-red-600/20"
              >
                {loginLoading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Entrar no Portal M1'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              {/* Individual Registration Highlight Box */}
              <div className="p-3 bg-emerald-600/10 border border-emerald-500/20 rounded-2xl text-left space-y-1">
                <p className="text-white font-extrabold text-[11px] uppercase tracking-wider flex items-center gap-1.5">
                  <UserPlus className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  <span>Cadastrar Novo Perfil Individual</span>
                </p>
                <p className="text-[10.5px] text-slate-300 leading-relaxed font-sans">
                  Preencha o formulário abaixo para criar o seu cadastro do zero. <strong>Cada cadastro é estritamente individual</strong> e seus chamados estarão permanentemente associados ao seu número de WhatsApp com total privacidade.
                </p>
              </div>

              {regError && (
                <div className="p-3 bg-red-500/15 text-red-400 rounded-xl border border-red-500/20 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4" />
                  <span>{regError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Nome Completo *</label>
                  <input
                    type="text"
                    required
                    value={regName}
                    onChange={e => setRegName(e.target.value)}
                    placeholder="Seu nome"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">WhatsApp / Telefone *</label>
                  <input
                    type="tel"
                    required
                    value={regPhone}
                    onChange={e => setRegPhone(e.target.value)}
                    placeholder="Ex: (11) 98765-4321"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">CPF (Opcional - Para NFe)</label>
                  <input
                    type="text"
                    value={regCpf}
                    onChange={e => setRegCpf(e.target.value)}
                    placeholder="Ex: 000.000.000-00"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-2.5 text-white font-mono"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">E-mail (Opcional)</label>
                  <input
                    type="email"
                    value={regEmail}
                    onChange={e => setRegEmail(e.target.value)}
                    placeholder="Ex: seuemail@gmail.com"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* Endereço Residencial Base via CEP */}
              <div className="bg-slate-950/50 p-4 rounded-2xl border border-slate-850 space-y-3">
                <span className="text-[10px] uppercase font-black text-slate-400 block tracking-wider">Cadastro de Endereço</span>
                
                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-slate-300 font-bold mb-1">CEP Residencial</label>
                    <input
                      type="text"
                      required
                      value={regCep}
                      onChange={e => handleRegCepChange(e.target.value)}
                      placeholder="CEP (digite para preencher)"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-300 font-bold mb-1">Número</label>
                    <input
                      type="text"
                      required
                      value={regNumber}
                      onChange={e => setRegNumber(e.target.value)}
                      placeholder="Nº ou S/N"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Rua / Logradouro</label>
                    <input
                      type="text"
                      required
                      value={regStreet}
                      onChange={e => setRegStreet(e.target.value)}
                      placeholder="Avenida / Rua"
                      className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl p-2.5 text-white"
                    />
                  </div>
                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Complemento</label>
                    <input
                      type="text"
                      value={regComplement}
                      onChange={e => setRegComplement(e.target.value)}
                      placeholder="Apto, Bloco, etc."
                      className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl p-2.5 text-white"
                    />
                  </div>
                </div>

                {regCepSearching && <p className="text-[10px] text-red-400 animate-pulse">Consultando base ViaCEP...</p>}
                {regCepError && <p className="text-[10px] text-rose-500">{regCepError}</p>}
              </div>

              {/* GPS Confirmation */}
              <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 text-center space-y-2">
                <p className="text-[11px] text-slate-300">Deseja autorizar o despacho expresso M1 com geolocalização exata no mapa?</p>
                <button
                  type="button"
                  onClick={handleDetectGpsForRegistration}
                  disabled={gpsDetecting}
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-red-400 rounded-xl font-bold uppercase text-[10px] flex items-center justify-center gap-1 mx-auto cursor-pointer"
                >
                  <LocateFixed className="w-4 h-4" />
                  <span>{gpsDetecting ? 'Detectando GPS...' : 'Confirmar Coordenadas GPS'}</span>
                </button>
                {gpsSuccessMessage && <p className="text-[10px] text-emerald-400 font-bold">{gpsSuccessMessage}</p>}
              </div>

              {/* Password */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Escolha uma Senha</label>
                  <input
                    type="password"
                    required
                    value={regPassword}
                    onChange={e => setRegPassword(e.target.value)}
                    placeholder="Mínimo 4 dígitos"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-2.5 text-white"
                  />
                </div>
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Confirme a Senha</label>
                  <input
                    type="password"
                    required
                    value={regPasswordConfirm}
                    onChange={e => setRegPasswordConfirm(e.target.value)}
                    placeholder="Digite novamente"
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-2.5 text-white"
                  />
                </div>
              </div>

              {/* LGPD Consent */}
              <div className="flex items-start gap-2 bg-slate-950/20 p-3 rounded-xl border border-slate-850">
                <input
                  type="checkbox"
                  id="lgpd"
                  checked={lgpdConsent}
                  onChange={e => setLgpdConsent(e.target.checked)}
                  className="w-4 h-4 mt-0.5 rounded text-red-600 bg-slate-950 border-slate-800 cursor-pointer"
                />
                <label htmlFor="lgpd" className="text-[10px] text-slate-400 font-sans leading-relaxed">
                  Estou de acordo com os termos de segurança e autorizo o processamento de geolocalização e envio de alertas em tempo real sobre meu trajeto residencial.
                </label>
              </div>

              <button
                type="submit"
                disabled={regLoading || !lgpdConsent}
                className="w-full py-3.5 bg-red-600 hover:bg-red-500 disabled:opacity-50 text-white font-black rounded-xl cursor-pointer shadow-md text-xs uppercase"
              >
                {regLoading ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : 'Confirmar Cadastro e Entrar'}
              </button>
            </form>
          )}
          </>
          )}
        </div>
      </div>
    );
  }

  if (client && client.status === 'blocked') {
    return (
      <div className="max-w-md mx-auto px-4 py-16 text-center space-y-6 font-sans">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-rose-950/40 border border-rose-500/40 text-rose-500 animate-pulse">
          <ShieldAlert className="w-10 h-10" />
        </div>
        <div className="space-y-2">
          <span className="text-rose-500 font-bold tracking-widest text-[10px] uppercase bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/20">
            Acesso Suspenso
          </span>
          <h2 className="text-2xl font-black text-white tracking-tight leading-tight">CONTA BLOQUEADA</h2>
          <p className="text-slate-400 text-sm leading-relaxed">
            Olá, <span className="font-bold text-slate-200">{client.name}</span>. Seu acesso ao Portal do Cliente M1 foi suspenso temporariamente pela administração.
          </p>
        </div>
        <p className="text-xs text-slate-500">
          Para esclarecer restrições financeiras, pendências ou obter reativação de conta, entre em contato imediatamente com nossa central de suporte técnico.
        </p>
        <div className="flex flex-col gap-2 pt-2">
          <a 
            href={`https://wa.me/5511962122694?text=Olá,%20sou%20o%20cliente%20${client.name}%20e%20gostaria%20de%20saber%20o%20motivo%20do%20bloqueio%20da%20minha%20conta.`}
            target="_blank"
            rel="noreferrer"
            className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-sm font-bold transition-all shadow-sm"
          >
            Contatar Suporte M1 (WhatsApp)
          </a>
          <button 
            onClick={() => logoutClient()} 
            className="w-full px-4 py-2 bg-slate-800 hover:bg-slate-750 text-slate-300 rounded-xl text-sm font-semibold transition-colors border border-slate-700 cursor-pointer"
          >
            Sair do Painel
          </button>
        </div>
      </div>
    );
  }

  // 2. MAIN LOGGED-IN PORTAL LAYOUT WITH BOTTOM NAVIGATION TABBING
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 py-6 pb-24 space-y-6 animate-fade-in relative">
      
      {/* 🚨 VISUAL ALARM: CLIENT SOLICITATION NEWS BANNER */}
      {visualAlarms.length > 0 && (
        <div className="space-y-3" id="client-visual-alarms-container">
          {visualAlarms.map((alarm) => (
            <div 
              key={alarm.id}
              onClick={() => {
                setIsOverlayOpen(true);
              }}
              className="bg-gradient-to-r from-red-950/80 via-yellow-950/40 to-slate-900 border-2 border-yellow-500/50 rounded-2xl p-4 shadow-xl flex items-start gap-3.5 animate-pulse relative overflow-hidden cursor-pointer hover:border-yellow-500/80 transition-all text-left"
            >
              {/* Pulsing light effect inside the banner */}
              <div className="absolute top-0 right-0 w-32 h-full bg-gradient-to-l from-yellow-500/5 to-transparent pointer-events-none" />
              
              <div className="w-9 h-9 rounded-xl bg-yellow-500/15 border border-yellow-500/30 flex items-center justify-center text-yellow-400 shrink-0">
                <BellRing className="w-5 h-5 text-yellow-400" />
              </div>

              <div className="flex-1 space-y-1">
                <div className="flex items-center justify-between gap-2">
                  <h4 className="text-xs font-black uppercase text-yellow-400 tracking-wider flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-yellow-400 animate-ping" />
                    {alarm.title}
                  </h4>
                  <span className="text-[10px] text-slate-500 font-mono font-bold">{alarm.timestamp}</span>
                </div>
                <p className="text-[11px] text-slate-200 font-medium leading-relaxed">
                  {alarm.message}
                </p>
                <p className="text-[9.5px] text-yellow-500 font-bold">
                  Clique aqui no alerta para abrir o acompanhamento e ver as novidades.
                </p>
              </div>

              <button
                type="button"
                onClick={(e) => {
                  e.stopPropagation();
                  setVisualAlarms(prev => prev.filter(a => a.id !== alarm.id));
                }}
                className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-400 hover:text-white cursor-pointer transition-colors shrink-0"
                title="Fechar Alerta"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
      )}
      
      {/* Dynamic Content Routing */}
      {currentTab === 'inicio' && (
        <>
          {activeView === 'request_form' ? (
            /* SERVICE REQUEST FORM */
            <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-7 shadow-2xl space-y-5 animate-fade-in" id="client-request-form-page">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="space-y-1">
                  <button
                    type="button"
                    onClick={() => setActiveView('dashboard')}
                    className="px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-[10px] font-black uppercase text-slate-300 hover:text-white cursor-pointer transition-colors"
                  >
                    ← Voltar ao Catálogo
                  </button>
                  <h2 className="text-lg sm:text-xl font-black text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-red-500 fill-red-500 animate-pulse" />
                    <span>Solicitar Técnico M1</span>
                  </h2>
                  <p className="text-[11px] text-slate-400 font-sans">Preencha o laudo descritivo para que o Administrador designe o profissional credenciado ideal.</p>
                </div>
              </div>

              <form onSubmit={handleSendServiceRequest} className="space-y-4 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Título Resumido do Atendimento</label>
                  <input
                    type="text"
                    required
                    value={serviceTitle}
                    onChange={e => setServiceTitle(e.target.value)}
                    placeholder={settings.clientFormTitlePlaceholder || 'Ex: Instalação de ar-condicionado pingando'}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-3 text-white outline-none font-bold"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Descrição Detalhada da Sua Necessidade *</label>
                  <textarea
                    required
                    value={serviceDescription}
                    onChange={e => setServiceDescription(e.target.value)}
                    rows={4}
                    placeholder={settings.clientFormDescPlaceholder || 'Escreva o que está acontecendo...'}
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-3 text-white outline-none"
                  />
                </div>

                <div>
                  <label className="block text-slate-300 font-bold mb-1">Instruções de Materiais ou Marcas (Opcional)</label>
                  <textarea
                    value={additionalNotes}
                    onChange={e => setAdditionalNotes(e.target.value)}
                    rows={2}
                    placeholder="Ex: Prefiro fiação Pirelli, etc."
                    className="w-full bg-slate-950 border border-slate-800 focus:border-red-500 rounded-xl p-3 text-white outline-none"
                  />
                </div>

                {/* Media list uploader */}
                <div className="bg-slate-950/40 p-4 rounded-xl border border-slate-800 space-y-1.5">
                  <label className="block text-slate-200 font-bold">Fotos / Vídeos Técnicos do Local *</label>
                  <MediaUploader mediaList={mediaList} onChange={setMediaList} />
                </div>

                {/* Urgência */}
                <div className="space-y-1.5">
                  <label className="block text-slate-300 font-bold mb-1">Prioridade</label>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={() => setUrgency('imediato')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs uppercase cursor-pointer ${
                        urgency === 'imediato' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      ⚡ Imediato
                    </button>
                    <button
                      type="button"
                      onClick={() => setUrgency('agendado')}
                      className={`p-3 rounded-xl border text-center font-bold text-xs uppercase cursor-pointer ${
                        urgency === 'agendado' ? 'bg-red-600 border-red-500 text-white' : 'bg-slate-950 border-slate-800 text-slate-400'
                      }`}
                    >
                      📅 Agendado
                    </button>
                  </div>
                </div>

                {/* Endereço de Atendimento */}
                <div className="bg-slate-950/80 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between border-b border-slate-900 pb-2">
                    <span className="font-bold text-white text-[11px] uppercase tracking-wider flex items-center gap-1">
                      <MapPin className="w-4 h-4 text-red-500" />
                      Endereço de Atendimento
                    </span>
                    <label className="flex items-center gap-1.5 text-[10px]">
                      <span>Usar padrão?</span>
                      <input
                        type="checkbox"
                        checked={useDefaultAddress}
                        onChange={e => setUseDefaultAddress(e.target.checked)}
                        className="w-4 h-4 rounded text-red-600 bg-slate-950 border-slate-800 cursor-pointer"
                      />
                    </label>
                  </div>

                  {useDefaultAddress ? (
                    <div className="p-3 bg-slate-900/40 rounded-xl text-[11px] text-slate-300 border border-slate-800/40">
                      <p className="font-black text-white">{client.defaultAddress?.street}, nº {client.defaultAddress?.number}</p>
                      <p className="text-slate-500">{client.defaultAddress?.neighborhood} | CEP: {client.defaultAddress?.zipCode}</p>
                    </div>
                  ) : (
                    <div className="space-y-3 animate-fade-in">
                      <div className="grid grid-cols-3 gap-2">
                        <div className="col-span-2">
                          <label className="block text-slate-400 font-bold mb-1">CEP de Atendimento</label>
                          <input
                            type="text"
                            value={reqCep}
                            onChange={e => handleReqCepChange(e.target.value)}
                            placeholder="CEP para autocompletar"
                            className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl p-2"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Número</label>
                          <input
                            type="text"
                            value={reqNumber}
                            onChange={e => setReqNumber(e.target.value)}
                            placeholder="Nº ou S/N"
                            className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl p-2"
                          />
                        </div>
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Rua / Logradouro</label>
                          <input
                            type="text"
                            value={reqStreet}
                            onChange={e => setReqStreet(e.target.value)}
                            placeholder="Rua"
                            className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl p-2"
                          />
                        </div>
                        <div>
                          <label className="block text-slate-400 font-bold mb-1">Complemento</label>
                          <input
                            type="text"
                            value={reqComplement}
                            onChange={e => setReqComplement(e.target.value)}
                            placeholder="Apto, Bloco, etc."
                            className="w-full bg-slate-900 border border-slate-800 focus:border-red-500 rounded-xl p-2"
                          />
                        </div>
                      </div>
                      {reqCepSearching && <p className="text-[10px] text-red-400 animate-pulse">Preenchendo novo CEP...</p>}
                    </div>
                  )}
                </div>

                <div className="flex gap-2.5 pt-2">
                  <button
                    type="button"
                    onClick={() => setActiveView('dashboard')}
                    className="px-5 py-3 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer"
                  >
                    Voltar
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-gradient-to-r from-red-600 to-red-700 text-white font-black uppercase rounded-xl cursor-pointer shadow-md"
                  >
                    {isSubmitting ? <RefreshCw className="w-4 h-4 animate-spin mx-auto" /> : (settings.clientFormSubmitBtnText || 'Enviar Solicitação para Central')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* NEW MODERN CLIENT HOME DASHBOARD */
            <div className="space-y-6 animate-fade-in">
              <CategoryCatalog
                categories={categories}
                activeService={activeService}
                onSelectCategory={handleOpenCategoryCustom}
                onViewActiveService={() => setIsOverlayOpen(true)}
                settings={settings}
                client={client}
                isActivatingGps={isActivatingGps}
                onActivateGps={handleActivateLocation}
              />

              {/* Inline Interactive Request History */}
              <div className="space-y-3 bg-slate-900/40 p-5 rounded-3xl border border-slate-800/60 shadow-inner">
                <div className="flex items-center justify-between border-b border-slate-800/60 pb-2">
                  <h3 className="text-xs font-black uppercase text-slate-400 tracking-wider">Histórico de Solicitações</h3>
                  <button 
                    type="button"
                    onClick={() => setCurrentTab('pedidos')} 
                    className="text-[10px] text-red-400 font-bold hover:underline"
                  >
                    Ver Tudo ({clientRequests.length})
                  </button>
                </div>
                
                {clientRequests.length === 0 ? (
                  <p className="text-xs text-slate-500 italic py-2 text-center font-sans">Nenhum chamado registrado até o momento.</p>
                ) : (
                  <div className="divide-y divide-slate-800/50">
                    {clientRequests.slice(0, 3).map(srv => (
                      <button
                        key={srv.id}
                        type="button"
                        onClick={() => {
                          setCurrentTab('pedidos');
                          setExpandedRequestId(srv.id);
                        }}
                        className="w-full py-3 flex items-center justify-between text-left hover:bg-slate-800/25 px-2 rounded-lg transition-all cursor-pointer group"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-1.5">
                            <span className="font-mono text-[9.5px] text-slate-500 font-bold">{srv.code}</span>
                            <span className="text-xs font-black text-white line-clamp-1 group-hover:text-red-400 transition-colors">{srv.title}</span>
                          </div>
                          <p className="text-[10px] text-slate-400 font-sans">{srv.createdAt}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className={`px-2 py-0.5 rounded text-[8.5px] font-black uppercase tracking-wider ${
                            srv.status === 'concluido_pago' 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : srv.status === 'cancelado' 
                              ? 'bg-slate-850 text-slate-500' 
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse'
                          }`}>
                            {srv.status === 'solicitado' ? 'Pendente' :
                             srv.status === 'aguardando_despacho_admin' ? 'Triagem' :
                             srv.status === 'despachado_prestador' ? 'Indicado' :
                             srv.status === 'aceito_pelo_prestador' ? 'Aprovação' :
                             srv.status === 'em_deslocamento' ? 'A caminho' :
                             srv.status === 'chegou_ao_local' ? 'No Local' :
                             srv.status === 'em_execucao' ? 'Execução' :
                             srv.status === 'relatorio_enviado' ? 'Pagamento' :
                             srv.status === 'concluido_pago' ? 'Concluído' : srv.status}
                          </span>
                          <ChevronRight className="w-4 h-4 text-slate-600 group-hover:translate-x-0.5 transition-transform" />
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}
        </>
      ) }

      {currentTab === 'pedidos' && (
        /* MEUS PEDIDOS TAB (WITH ACCORDION & STEPPER) */
        <ServiceOrdersList
          clientRequests={clientRequests}
          activeService={activeService}
          categories={categories}
          expandedRequestId={expandedRequestId}
          onToggleExpand={setExpandedRequestId}
          clientConfirmProviderArrival={clientConfirmProviderArrival}
          clientAcknowledgeService={clientAcknowledgeService}
          clientAcceptServicePrice={clientAcceptServicePrice}
          clientRejectServicePrice={clientRejectServicePrice}
          cancelServiceRequest={cancelServiceRequest}
          editServiceDetails={editServiceDetails}
          setRatingModalService={setRatingModalService}
          setInspectingReport={setInspectingReport}
          getWhatsAppLinkForClient={getWhatsAppLinkForClient}
          settings={settings}
          onSelectTab={setCurrentTab}
        />
      )}

      {currentTab === 'mensagens' && (
        /* COMMUNICATIONS AND NOTIFICATIONS TAB */
        <ClientNotificationCenter
          client={client}
          notifications={notifications}
          markAllNotificationsRead={markAllNotificationsRead}
          dismissNotification={dismissNotification}
          getWhatsAppLinkForClient={getWhatsAppLinkForClient}
          services={services}
          settings={settings}
        />
      )}

      {currentTab === 'perfil' && (
        /* USER ACCOUNT PROFILE TAB */
        <ClientProfilePanel
          client={client}
          logoutClient={handleLogout}
        />
      )}

      {/* FIXED BOTTOM NAVIGATION BAR */}
      <div className="fixed bottom-0 left-0 right-0 z-40 bg-slate-900/95 backdrop-blur-md border-t border-slate-800/80 px-4 py-3 flex justify-around items-center max-w-5xl mx-auto rounded-t-3xl shadow-2xl">
        {/* Início */}
        <button
          onClick={() => { setCurrentTab('inicio'); setActiveView('dashboard'); }}
          className={`flex flex-col items-center gap-1 transition-colors relative cursor-pointer ${
            currentTab === 'inicio' ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <Wrench className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-wider">Início</span>
        </button>

        {/* Meus Pedidos */}
        <button
          onClick={() => setCurrentTab('pedidos')}
          className={`flex flex-col items-center gap-1 transition-colors relative cursor-pointer ${
            currentTab === 'pedidos' ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {activeService && (
            <span className="absolute top-0 right-3 flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500"></span>
            </span>
          )}
          <FileText className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-wider">Pedidos</span>
        </button>

        {/* Mensagens */}
        <button
          onClick={() => setCurrentTab('mensagens')}
          className={`flex flex-col items-center gap-1 transition-colors relative cursor-pointer ${
            currentTab === 'mensagens' ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          {notifications.filter(n => 
            n.targetRole === 'client' && 
            !n.read && 
            (!n.clientId || n.clientId === client?.id) &&
            (!n.serviceId || services.some(s => s.id === n.serviceId && s.clientId === client?.id))
          ).length > 0 && (
            <span className="absolute top-0 right-4 w-1.5 h-1.5 rounded-full bg-red-500 animate-ping" />
          )}
          <MessageSquare className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-wider">Mensagens</span>
        </button>

        {/* Perfil */}
        <button
          onClick={() => setCurrentTab('perfil')}
          className={`flex flex-col items-center gap-1 transition-colors relative cursor-pointer ${
            currentTab === 'perfil' ? 'text-red-500' : 'text-slate-500 hover:text-slate-300'
          }`}
        >
          <User className="w-5 h-5" />
          <span className="text-[10px] font-black uppercase tracking-wider">Perfil</span>
        </button>
      </div>

      {/* TECHNICAL PHOTO REPORT DETAIL VIEW DIALOG */}
      {inspectingReport && inspectingReport.photoReport && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-50 flex flex-col items-center justify-start sm:justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="w-full max-w-4xl my-auto relative">
            <button
              type="button"
              onClick={() => setInspectingReport(null)}
              className="absolute top-4 right-4 z-10 p-1.5 bg-slate-850 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
            <PhotoReportViewer
              report={inspectingReport.photoReport}
              serviceTitle={inspectingReport.title}
              providerName={inspectingReport.providerName || 'Profissional Credenciado'}
              providerAvatar={inspectingReport.providerAvatar}
            />
          </div>
        </div>
      )}

      {/* 💳 COHESIVE SEQUENTIAL CLIENT COMPLETION FLOW (SPAM) */}
      {paymentService && paymentStep !== 'none' && (
        <div className="fixed inset-0 bg-black/92 backdrop-blur-lg z-[999995] flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in" id="client-sequential-completion-modal">
          <div className="bg-slate-950 border-3 border-emerald-500 rounded-3xl max-w-lg w-full max-h-[85vh] flex flex-col shadow-[0_0_80px_rgba(16,185,129,0.35)] text-left relative overflow-hidden modal-crisp">
            
            {/* Header / Step Tracker */}
            <div className="p-5 border-b border-slate-850 shrink-0 bg-slate-950 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-xl bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
                  {paymentStep === 'pending' ? (
                    <CreditCard className="w-5 h-5" />
                  ) : (
                    <Sparkles className="w-5 h-5" />
                  )}
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-wider text-emerald-400">
                    {paymentStep === 'pending' ? 'Etapa 1: Confirmação & Pagamento' : 'Etapa 2: Avaliação do Prestador'}
                  </h3>
                  <p className="text-[10px] text-slate-400 uppercase font-mono font-bold">
                    Chamado: <span className="text-white">#{paymentService.code}</span>
                  </p>
                </div>
              </div>

              {/* Progress pill & Close Button */}
              <div className="flex items-center gap-2">
                <div className="px-3 py-1 bg-slate-900 border border-slate-800 rounded-full text-[10px] font-mono font-bold text-slate-400">
                  {paymentStep === 'pending' ? '1 de 2' : '2 de 2'}
                </div>
                <button
                  type="button"
                  onClick={() => {
                    setPaymentService(null);
                    setPaymentStep('none');
                    setRatingModalService(null);
                  }}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors border border-slate-800"
                  id="close-completion-modal-btn"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-5 sm:p-6 overflow-y-auto flex-1 space-y-5 text-slate-200">
              
              {paymentStep === 'pending' && (
                <div className="space-y-5">
                  <div className="space-y-1.5">
                    <h4 className="text-lg font-extrabold text-white leading-tight">
                      Atendimento Executado com Sucesso! 🎉
                    </h4>
                    <p className="text-xs text-slate-300 leading-relaxed font-sans">
                      O profissional credenciado <strong className="text-emerald-400">{paymentService.providerName || paymentService.assignedProviderName || 'Especialista M1'}</strong> concluiu o chamado de <strong className="text-white">"{paymentService.title}"</strong>. Revise o valor e prossiga com o pagamento direto.
                    </p>
                  </div>

                  {/* Valor Cobrado Display */}
                  <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl flex items-center justify-between">
                    <div>
                      <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider">
                        Valor Total do Serviço
                      </span>
                      <span className="block text-[11px] text-slate-400 font-sans">
                        Pague diretamente ao profissional
                      </span>
                    </div>
                    <div className="text-right">
                      <span className="font-mono text-3xl font-black text-emerald-400 block leading-none">
                        R$ {paymentService.estimatedPrice.toFixed(2)}
                      </span>
                    </div>
                  </div>

                  {/* Payment Method Selector */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold text-slate-200 block">
                      Selecione a forma de pagamento realizada:
                    </span>
                    <div className="grid grid-cols-3 gap-2.5">
                      {[
                        { id: 'pix', label: 'Pix', icon: QrCode },
                        { id: 'dinheiro', label: 'Dinheiro', icon: Banknote },
                        { id: 'cartao', label: 'Cartão', icon: CreditCard },
                      ].map((method) => {
                        const Icon = method.icon;
                        const isSelected = selectedPaymentMethod === method.id;
                        return (
                          <button
                            key={method.id}
                            type="button"
                            onClick={() => setSelectedPaymentMethod(method.id as any)}
                            className={`p-3.5 rounded-xl border flex flex-col items-center justify-center gap-1.5 transition-all cursor-pointer ${
                              isSelected
                                ? 'bg-emerald-500/15 border-emerald-500 text-emerald-400 shadow-[0_0_15px_rgba(16,185,129,0.15)] font-black'
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white hover:border-slate-700'
                            }`}
                          >
                            <Icon className={`w-5 h-5 ${isSelected ? 'text-emerald-400' : 'text-slate-500'}`} />
                            <span className="text-[11px] uppercase tracking-wide leading-none">{method.label}</span>
                          </button>
                        );
                      })}
                    </div>
                  </div>

                  {/* Dynamic payment method details */}
                  {selectedPaymentMethod === 'pix' && (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-3.5 animate-fade-in">
                      <div className="flex items-center gap-2 pb-2 border-b border-slate-850">
                        <QrCode className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-black uppercase text-white">Chave Pix do Profissional</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        Efetue o Pix copiando a chave abaixo ou escaneando o QR Code do prestador. Após a transferência, confirme abaixo.
                      </p>

                      <div className="flex items-center gap-2">
                        <input
                          type="text"
                          readOnly
                          value={paymentService.providerPhone || paymentService.assignedProviderPhone || 'Chave Pix'}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2.5 font-mono text-xs text-white text-center select-all outline-none"
                        />
                        <button
                          type="button"
                          onClick={() => {
                            const pixKey = paymentService.providerPhone || paymentService.assignedProviderPhone || 'Chave Pix';
                            navigator.clipboard.writeText(pixKey);
                            soundManager.playSuccessChime();
                          }}
                          className="px-3.5 py-2.5 bg-slate-950 hover:bg-slate-800 border border-slate-800 hover:border-slate-750 text-emerald-400 hover:text-emerald-300 rounded-xl font-bold text-xs cursor-pointer transition-colors"
                        >
                          Copiar
                        </button>
                      </div>
                    </div>
                  )}

                  {selectedPaymentMethod === 'dinheiro' && (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <Banknote className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-black uppercase text-white">Pagamento em Espécie</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        Por favor, entregue o valor de <strong className="text-white">R$ {paymentService.estimatedPrice.toFixed(2)}</strong> em dinheiro diretamente ao profissional no local.
                      </p>
                    </div>
                  )}

                  {selectedPaymentMethod === 'cartao' && (
                    <div className="p-4 bg-slate-900 border border-slate-800 rounded-2xl space-y-2 animate-fade-in">
                      <div className="flex items-center gap-2">
                        <CreditCard className="w-4 h-4 text-emerald-400" />
                        <span className="text-xs font-black uppercase text-white">Maquininha de Cartões</span>
                      </div>
                      <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                        Por favor, utilize o cartão de débito ou crédito diretamente na maquininha física do profissional. Confirme o valor de <strong className="text-white">R$ {paymentService.estimatedPrice.toFixed(2)}</strong> antes de digitar sua senha.
                      </p>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="button"
                    disabled={!selectedPaymentMethod}
                    onClick={() => {
                      soundManager.playSuccessChime();
                      setPaymentStep('rating');
                    }}
                    className={`w-full py-3.5 rounded-2xl font-black text-xs uppercase tracking-wider flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      selectedPaymentMethod
                        ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/25'
                        : 'bg-slate-850 text-slate-500 cursor-not-allowed border border-slate-800'
                    }`}
                  >
                    <span>Confirmar Pagamento e Ir para Avaliação</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              )}

              {paymentStep === 'rating' && (
                <div className="space-y-5">
                  <div className="space-y-1 text-center">
                    <h4 className="text-lg font-extrabold text-white leading-tight">
                      Como foi o atendimento do profissional? ⭐
                    </h4>
                    <p className="text-xs text-slate-300 font-sans">
                      Sua avaliação é sigilosa e fundamental para o controle de qualidade M1 Brasil.
                    </p>
                  </div>

                  {/* Star Rating Selector */}
                  <div className="flex items-center justify-center gap-2.5 py-3">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => {
                          setRatingScore(star);
                          soundManager.playSuccessChime();
                        }}
                        className="p-1 cursor-pointer hover:scale-110 transition-transform"
                      >
                        <Star
                          className={`w-10 h-10 ${
                            star <= ratingScore
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-slate-800 fill-transparent'
                          }`}
                        />
                      </button>
                    ))}
                  </div>

                  {/* Interactive rating title based on score */}
                  <div className="text-center">
                    <span className="px-3 py-1 bg-slate-900 border border-slate-850 rounded-full text-xs font-black uppercase text-amber-400">
                      {ratingScore === 5 ? 'Excelente 👑' : ratingScore === 4 ? 'Muito Bom 👍' : ratingScore === 3 ? 'Bom / Regular 😊' : ratingScore === 2 ? 'Ruim ⚠️' : 'Péssimo 🚨'}
                    </span>
                  </div>

                  {/* Comments Fields */}
                  <div className="space-y-2">
                    <label className="text-xs font-bold text-slate-200 block">
                      Escreva um comentário opcional sobre o serviço prestado:
                    </label>
                    <textarea
                      value={ratingComment}
                      onChange={(e) => setRatingComment(e.target.value)}
                      placeholder="Escreva como foi sua experiência..."
                      className="w-full h-24 bg-slate-900 border border-slate-800 rounded-2xl p-3.5 text-xs text-white placeholder-slate-500 outline-none focus:border-emerald-500 transition-colors resize-none"
                    />
                  </div>

                  {/* Submit and Finish Button */}
                  <button
                    type="button"
                    onClick={() => {
                      const rating: ServiceRating = {
                        id: 'rating-' + Date.now(),
                        serviceId: paymentService.id,
                        serviceCode: paymentService.code,
                        serviceTitle: paymentService.title,
                        clientId: client.id,
                        clientName: client.name,
                        providerId: paymentService.providerId || paymentService.assignedProviderId || '',
                        providerName: paymentService.providerName || paymentService.assignedProviderName || 'Prestador Credenciado',
                        score: ratingScore,
                        comment: ratingComment,
                        tags: [],
                        createdAt: new Date().toISOString(),
                        tipAmount: 0,
                      };
                      approveReportAndPay(paymentService.id, rating, selectedPaymentMethod || 'pix');
                      soundManager.playSuccessChime();
                      
                      // Transition to finished state
                      setPaymentStep('finished');
                    }}
                    className="w-full py-4 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-2xl shadow-xl shadow-emerald-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
                  >
                    <span>Enviar Avaliação & Encerrar Atendimento</span>
                    <Check className="w-4 h-4 stroke-[3]" />
                  </button>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* 📢 ON-SCREEN SERVICE CANCELLATION NOTIFICATION */}
      {cancellationNoticeService && (
        <div className="fixed inset-0 bg-black/90 backdrop-blur-md z-[999995] flex items-center justify-center pt-20 pb-12 p-4 overflow-y-auto animate-fade-in" id="service-cancellation-notice-modal">
          <div className="bg-slate-950 border-3 border-rose-500 rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-[0_0_60px_rgba(239,68,68,0.3)] text-left relative overflow-hidden modal-crisp p-6 text-white">
            <button
              type="button"
              onClick={() => setCancellationNoticeService(null)}
              className="absolute top-4 right-4 z-10 p-1.5 bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
              id="close-cancellation-notice-modal-btn"
              aria-label="Fechar"
            >
              <X className="w-4 h-4" />
            </button>
            <div className="flex-1 overflow-y-auto space-y-5 pr-1">
              <div className="flex flex-col items-center text-center space-y-3">
                <div className="w-16 h-16 rounded-full bg-rose-500/10 border-2 border-rose-500/30 flex items-center justify-center text-rose-400 font-bold">
                  <AlertTriangle className="w-8 h-8 animate-pulse" />
                </div>
                <h3 className="text-xl font-black text-rose-400 uppercase tracking-tight">
                  Atendimento Cancelado!
                </h3>
                <p className="text-sm text-slate-300 leading-relaxed">
                  Olá, informamos que o seu chamado para <strong className="text-white">"{cancellationNoticeService.title}"</strong> foi cancelado pela Central.
                </p>
                
                {/* Reason box */}
                <div className="bg-rose-950/40 p-4 rounded-xl border border-rose-500/20 w-full text-left text-xs space-y-2">
                  <p className="text-rose-300"><strong>Justificativa da Central M1:</strong></p>
                  <p className="text-slate-200 italic">"{cancellationNoticeService.cancellationReason || 'Falta de profissionais credenciados disponíveis na região.'}"</p>
                </div>

                {/* Future plan box */}
                <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-850 w-full text-left text-xs space-y-2">
                  <p className="text-amber-400 font-bold">🛠️ Providência da Plataforma M1:</p>
                  <p className="text-slate-300 leading-relaxed">
                    {cancellationNoticeService.cancellationFutureAction || "Infelizmente não encontramos profissionais para atender sua solicitação, porém já estamos registrando essa demanda em nosso banco de dados e vamos providenciar profissionais qualificados para atender a sua necessidade!"}
                  </p>
                </div>

                <div className="bg-slate-900/30 p-3 rounded-xl w-full text-left text-[10px] text-slate-400">
                  <p><strong>Código do Chamado:</strong> {cancellationNoticeService.code}</p>
                  <p><strong>Categoria:</strong> {cancellationNoticeService.category}</p>
                </div>
              </div>
            </div>
            
            <div className="pt-4 shrink-0">
              <button
                type="button"
                onClick={() => {
                  setCancellationNoticeService(null);
                  setCurrentTab('inicio');
                }}
                className="w-full py-3.5 bg-rose-500 hover:bg-rose-400 text-slate-950 text-sm font-black rounded-2xl shadow-lg shadow-rose-500/25 flex items-center justify-center gap-2 cursor-pointer transition-all"
              >
                <span>Entendido, Abrir Nova Solicitação</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🏁 SPAM MODAL: TÉCNICO A CAMINHO OVERLAY */}
      {spamOnTheWayService && (
        <div className="fixed inset-0 bg-black/92 backdrop-blur-md z-[999990] flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in" id="spam-on-the-way-modal">
          <div className="spam-content-container bg-slate-950 border-3 border-amber-500 rounded-3xl max-w-md w-full max-h-[85vh] flex flex-col shadow-[0_0_60px_rgba(245,158,11,0.25)] text-left relative overflow-hidden modal-crisp">
            
            {/* Header: VISUALIZAÇÃO DA TELA DE SPAM */}
            <div className="p-4 sm:p-5 border-b border-slate-900 flex items-center justify-between bg-slate-950 rounded-t-3xl shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-pulse" />
                <span className="text-xs font-black uppercase tracking-widest text-amber-500">
                  VISUALIZAÇÃO DA TELA DE SPAM
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full">
                  Técnico a Caminho
                </span>
                <button
                  type="button"
                  onClick={() => setSpamOnTheWayService(null)}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors border border-slate-800"
                  id="close-spam-on-the-way-btn"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Content Body */}
            <div className="p-4 sm:p-5 space-y-4 text-slate-200 overflow-y-auto flex-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              
              {/* Phone Icon Circle */}
              <div className="flex justify-center pt-2">
                <div className="w-14 h-14 rounded-full bg-amber-500/10 border-2 border-amber-500/30 flex items-center justify-center text-amber-500">
                  <Smartphone className="w-6 h-6 animate-pulse" />
                </div>
              </div>

              {/* Centered Heading */}
              <div className="text-center space-y-1.5 px-2">
                <h2 className="text-base sm:text-lg font-black text-white leading-tight uppercase font-sans tracking-wide">
                  O PRESTADOR DE SERVIÇO JÁ ESTÁ A CAMINHO
                </h2>
                <p className="text-[11px] text-slate-400 leading-relaxed max-w-xs mx-auto">
                  Acompanhe em tempo real o trajeto do profissional credenciado M1 Brasil até seu endereço.
                </p>
              </div>

              {/* Prediction Progress Card */}
              <div className="bg-slate-900/40 p-4 rounded-2xl border border-slate-850 text-left space-y-2.5">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-[10px] uppercase font-black text-slate-300 tracking-wider">Previsão de Chegada:</span>
                  <span className="font-extrabold text-amber-400 font-mono text-sm">
                    {spamOnTheWayService.estimatedArrivalMinutes || 12} minutos
                  </span>
                </div>
                
                {/* Progress bar fill */}
                <div className="h-2 w-full bg-slate-950 rounded-full overflow-hidden border border-slate-850">
                  <div className="h-full bg-amber-500 rounded-full w-[55%]" />
                </div>

                <div className="flex justify-between items-center text-[10px] text-slate-400 font-bold">
                  <span>Partida: Bela Vista</span>
                  <span>Destino: {spamOnTheWayService.address?.neighborhood || 'Consolação'}</span>
                </div>
              </div>

              {/* GPS Tracker Map Container */}
              <div className="relative h-44 bg-slate-950 rounded-2xl border border-slate-850/80 overflow-hidden bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:16px_16px] flex items-center justify-center shadow-inner">
                {/* Curved Dotted Line SVG */}
                <svg className="absolute inset-0 w-full h-full p-6" viewBox="0 0 100 100" preserveAspectRatio="none">
                  <path
                    d="M 10 75 Q 40 35 50 60 T 90 25"
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeDasharray="4 4"
                  />
                </svg>

                {/* Point A: Partida */}
                <div className="absolute left-6 bottom-6 flex flex-col items-center">
                  <div className="relative">
                    <span className="absolute inset-0 rounded-full bg-emerald-500/40 animate-ping" />
                    <div className="w-5 h-5 rounded-full bg-emerald-500 border-2 border-slate-950 flex items-center justify-center text-white text-[8px] font-black font-mono">
                      A
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Partida</span>
                </div>

                {/* Point B: Você */}
                <div className="absolute right-6 top-6 flex flex-col items-center">
                  <div className="relative">
                    <span className="absolute inset-0 rounded-full bg-rose-500/40 animate-ping" />
                    <div className="w-5 h-5 rounded-full bg-rose-500 border-2 border-slate-950 flex items-center justify-center text-white text-[8px] font-black font-mono">
                      B
                    </div>
                  </div>
                  <span className="text-[8px] font-bold text-slate-400 mt-1 uppercase">Você</span>
                </div>

                {/* Technician Moving Avatar */}
                <div className="absolute left-[54%] bottom-[42%] -translate-x-1/2 -translate-y-1/2 flex flex-col items-center">
                  <div className="relative w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center animate-bounce">
                    <span className="text-base">🧑‍🔧</span>
                  </div>
                  <span className="text-[8px] font-black text-amber-400 tracking-wider uppercase mt-1">Técnico</span>
                </div>

                {/* GPS Badge */}
                <div className="absolute bottom-3 right-3 bg-slate-900/95 border border-slate-800 px-2.5 py-0.5 rounded-lg text-[8px] font-mono text-slate-400 font-bold uppercase tracking-wider shadow-md">
                  GPS Integrado M1 Brasil
                </div>
              </div>

              {/* Profile Card */}
              <div className="bg-slate-900/40 border border-slate-850 p-4 rounded-2xl space-y-3.5">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-slate-850 overflow-hidden border border-slate-800">
                    {spamOnTheWayService.assignedProviderAvatar || spamOnTheWayService.providerAvatar ? (
                      <img
                        src={spamOnTheWayService.assignedProviderAvatar || spamOnTheWayService.providerAvatar}
                        alt="Técnico"
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-slate-400 bg-slate-800 font-bold">
                        {spamOnTheWayService.providerName?.[0] || 'T'}
                      </div>
                    )}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-white leading-tight uppercase font-sans">
                      {spamOnTheWayService.providerName || 'Carlos Andrade'}
                    </h4>
                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mt-0.5">
                      {spamOnTheWayService.category ? `${spamOnTheWayService.category} Credenciado` : 'Eletricista Credenciado'} • M1 Master
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 pt-1 border-t border-slate-850/60">
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850/60 text-left space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Veículo</span>
                    <span className="text-xs font-black text-white truncate block">{spamOnTheWayService.providerVehicle || 'Honda CG 160 Fan'}</span>
                  </div>
                  <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-850/60 text-left space-y-0.5">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider block">Placa / Cor</span>
                    <span className="text-xs font-mono font-black text-amber-400 truncate block">{spamOnTheWayService.providerPlate || 'M1-SERV • Vermelha'}</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Pinned Action Footer */}
            <div className="p-4 sm:p-5 border-t border-slate-900 bg-slate-950 shrink-0 flex flex-col gap-2 rounded-b-3xl">
              <button
                type="button"
                onClick={() => setSpamOnTheWayService(null)}
                className="w-full py-3.5 bg-amber-500 hover:bg-amber-450 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer shadow-lg shadow-amber-500/10 active:scale-[0.99] flex items-center justify-center gap-2"
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>ACOMPANHAR ATENDIMENTO NO PAINEL</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🏁 SPAM MODAL: ORÇAMENTO DO ADMIN DISPONÍVEL (SOBREPOSTO NA TELA) */}
      {isProposedPriceSpamOpen && proposedPriceService && (
        <div 
          className="fixed inset-0 z-[999995] bg-black/92 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto animate-fade-in" 
          id="spam-proposed-price-modal"
        >
          <div className="spam-content-container bg-slate-950 border-3 border-amber-500 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-[0_0_80px_rgba(245,158,11,0.35)] relative text-left overflow-hidden modal-crisp">
            
            {/* Pinned Header: Beacon + Title + Minimize */}
            <div className="p-4 sm:p-5 border-b border-slate-800 flex items-center justify-between shrink-0 bg-slate-950 rounded-t-3xl">
              <div className="flex items-center gap-3">
                <div className="relative shrink-0">
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 block animate-ping absolute inset-0" />
                  <span className="w-3.5 h-3.5 rounded-full bg-amber-500 block relative shadow-md shadow-amber-500/50" />
                </div>
                <div>
                  <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span>🚨 SPAM DE SOLICITAÇÃO • ORÇAMENTO DEFINIDO</span>
                  </h3>
                  <p className="text-[11px] font-mono text-slate-400">
                    Chamado: <strong className="text-white">#{proposedPriceService.code}</strong> • Central M1 Brasil
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded-full">
                  Central M1 Brasil
                </span>
                <button
                  type="button"
                  onClick={() => setDismissedClientSpamIds(prev => ({ ...prev, [proposedPriceService.id]: true }))}
                  className="p-1.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors border border-slate-800"
                  id="close-proposed-price-modal-btn"
                  aria-label="Fechar"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* Scrollable Body */}
            <div className="p-4 sm:p-6 space-y-4 text-slate-200 overflow-y-auto flex-1 scrollbar-thin">
              
              {/* Solicitation Details Container */}
              <div className="bg-slate-900/90 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3.5 shadow-inner">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div className="space-y-1">
                    <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                      {proposedPriceService.category.toUpperCase()}
                    </span>
                    <h4 className="text-lg sm:text-xl font-black text-white font-sans mt-1.5 leading-snug">
                      {proposedPriceService.title}
                    </h4>
                    <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-0.5">
                      <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Endereço: <strong className="text-white">{proposedPriceService.address?.street || 'Endereço Principal'}, {proposedPriceService.address?.number || 'S/N'}</strong> - {proposedPriceService.address?.neighborhood}, {proposedPriceService.address?.city}</span>
                    </div>
                  </div>

                  <div className="w-full sm:w-auto text-left sm:text-right shrink-0 bg-slate-950 p-3.5 rounded-2xl border border-amber-500/40 shadow-inner">
                    <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                      Valor Definido pela Central
                    </span>
                    <span className="font-mono text-2xl sm:text-3xl font-black text-amber-400 block leading-tight">
                      R$ {proposedPriceService.estimatedPrice.toFixed(2)}
                    </span>
                    <span className="text-[9px] text-amber-300/80 font-bold block mt-0.5">
                      Tempo Estimado: {proposedPriceService.estimatedArrivalMinutes || 15} min
                    </span>
                  </div>
                </div>

                {/* Descrição informada */}
                <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 space-y-1">
                  <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                    Descrição da Atividade a Ser Executada:
                  </span>
                  <p className="text-xs text-slate-200 leading-relaxed font-sans">
                    {proposedPriceService.description || 'Sem descrição informada.'}
                  </p>
                  {proposedPriceService.additionalNotes && (
                    <p className="text-[11px] text-slate-400 border-t border-slate-800/80 pt-1 mt-1">
                      <strong>Observação Adicional:</strong> {proposedPriceService.additionalNotes}
                    </p>
                  )}
                </div>

                {/* Fotos & Vídeos com Zoom */}
                {proposedPriceService.media && proposedPriceService.media.length > 0 && (
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-bold text-slate-300 flex items-center gap-1.5">
                        <Camera className="w-3.5 h-3.5 text-amber-400" />
                        <span>Fotos & Vídeos do Chamado ({proposedPriceService.media.length}):</span>
                      </span>
                      <span className="text-[10px] text-slate-400">Toque para ampliar</span>
                    </div>
                    <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-1 scrollbar-thin">
                      {proposedPriceService.media.map((med, idx) => (
                        <div
                          key={idx}
                          onClick={() => setZoomedPhotoUrl(med.url)}
                          className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-slate-700 hover:border-amber-400 cursor-pointer shrink-0 group transition-all shadow-md"
                        >
                          <img
                            src={med.url}
                            alt={`Foto do chamado ${idx + 1}`}
                            referrerPolicy="no-referrer"
                            className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                          />
                          <span className="absolute bottom-1 right-1 bg-black/75 text-[8px] text-white px-1.5 py-0.5 rounded font-mono">
                            AMPLIAR
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* 🚨 ALARME VISUAL OBRIGATÓRIO: TERMO DE TAXA DE CANCELAMENTO DE 15% (SEM TREMOR) */}
                <div 
                  className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-colors text-left ${
                    clientCancelFeeAgreed[proposedPriceService.id]
                      ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                      : clientTermAlertTriggered[proposedPriceService.id]
                        ? 'bg-red-950/90 border-red-500 ring-2 ring-red-500/50 shadow-[0_0_25px_rgba(239,68,68,0.5)]'
                        : 'bg-yellow-500/15 border-yellow-400 shadow-[0_0_15px_rgba(234,179,8,0.2)]'
                  }`}
                  id="client-cancel-fee-term-box"
                >
                  <label className="flex items-start gap-3 cursor-pointer select-none">
                    <input
                      type="checkbox"
                      checked={!!clientCancelFeeAgreed[proposedPriceService.id]}
                      onChange={(e) => {
                        const checked = e.target.checked;
                        setClientCancelFeeAgreed(prev => ({ ...prev, [proposedPriceService.id]: checked }));
                        if (checked) {
                          soundManager.playSuccessChime();
                          setClientTermAlertTriggered(prev => ({ ...prev, [proposedPriceService.id]: false }));
                        }
                      }}
                      className="mt-0.5 w-5 h-5 rounded-md accent-amber-400 text-amber-400 focus:ring-amber-400 cursor-pointer shrink-0"
                    />
                    <div className="space-y-1">
                      <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-amber-300 uppercase tracking-wide leading-tight">
                        <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                        <span>"ESTOU CIENTE QUE EM CASO DE CANCELAMENTO TEREI QUE PAGAR A TAXA DE 15% DO VALOR DO SERVIÇO"</span>
                      </div>
                      <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                        Conforme as diretrizes da Central M1, o cancelamento injustificado após o aceite sujeita o contratante à taxa de 15%. Marque a caixa para concordar com o termo e autorizar o envio ao prestador de serviço.
                      </p>
                    </div>
                  </label>
                  {clientTermAlertTriggered[proposedPriceService.id] && !clientCancelFeeAgreed[proposedPriceService.id] && (
                    <div className="mt-2 text-[11px] font-black text-red-400 uppercase tracking-wider bg-red-950/90 p-2 rounded-lg border border-red-500/60 flex items-center gap-2">
                      <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
                      <span>ATENÇÃO: Você precisa marcar a concordância com o termo de cancelamento de 15% para aprovar o orçamento!</span>
                    </div>
                  )}
                </div>
              </div>

            </div>

            {/* Pinned Action Footer: Buttons Always Visible & Accessible */}
            <div className="p-4 sm:p-5 border-t border-slate-800 bg-slate-950 shrink-0 flex flex-col sm:flex-row gap-3">
              <button
                type="button"
                onClick={() => {
                  if (confirm('Deseja mesmo recusar esta proposta? O chamado retornará ao administrador para revisão de valor.')) {
                    clientRejectServicePrice(proposedPriceService.id);
                    setDismissedClientSpamIds(prev => ({ ...prev, [proposedPriceService.id]: true }));
                  }
                }}
                className="w-full sm:w-1/3 py-3.5 bg-red-600/15 hover:bg-red-600/25 border-2 border-red-500/30 text-red-400 hover:text-red-300 font-black uppercase tracking-wider rounded-2xl text-xs cursor-pointer transition-all active:scale-95 text-center"
              >
                Recusar Valor
              </button>
              <button
                type="button"
                onClick={() => {
                  if (!clientCancelFeeAgreed[proposedPriceService.id]) {
                    setClientTermAlertTriggered(prev => ({ ...prev, [proposedPriceService.id]: true }));
                    soundManager.playAdminAlarm();
                    return;
                  }
                  clientAcceptServicePrice(proposedPriceService.id);
                  setDismissedClientSpamIds(prev => ({ ...prev, [proposedPriceService.id]: true }));
                }}
                className={`w-full sm:w-2/3 py-3.5 font-black uppercase tracking-wider rounded-2xl text-xs sm:text-sm cursor-pointer shadow-xl transition-all active:scale-98 flex items-center justify-center gap-2 ${
                  clientCancelFeeAgreed[proposedPriceService.id]
                    ? 'bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 shadow-amber-500/30 border-2 border-amber-300'
                    : 'bg-amber-500/30 text-slate-950/60 border-2 border-amber-500/30 hover:bg-amber-500/40'
                }`}
              >
                <CheckCircle2 className="w-5 h-5 text-slate-950 stroke-[2.5]" />
                <span>Aprovar Orçamento e Despachar Profissional</span>
              </button>
            </div>

          </div>
        </div>
      )}

      {/* 🔮 CATEGORY SELECTOR POPUP OVERLAY */}
      {showCategorySelector && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md z-[99999] flex flex-col items-center justify-start p-4 overflow-y-auto animate-fade-in" id="category-selector-modal">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-xl rounded-3xl p-6 shadow-2xl relative space-y-4 mt-2 md:mt-8 mb-12 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            <button
              type="button"
              onClick={() => setShowCategorySelector(false)}
              className="absolute top-4 right-4 p-1.5 bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="text-center space-y-1">
              <span className="text-[10px] uppercase font-black bg-red-600/15 text-red-400 px-3 py-1 rounded-full border border-red-500/20">
                Central de Especialidades M1
              </span>
              <h3 className="text-base sm:text-lg font-black text-white mt-2">Escolha o Serviço de que Precisa</h3>
              <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
                Nossos profissionais são devidamente credenciados, avaliados e auditados em tempo real pela nossa Central Técnica M1.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => {
                    handleOpenCategoryCustom(cat.id as ServiceCategory);
                    setShowCategorySelector(false);
                  }}
                  className="p-4 bg-slate-950 border border-slate-800 hover:border-red-500/40 hover:bg-slate-900/40 rounded-2xl text-left cursor-pointer transition-all flex flex-col justify-between h-28 relative group"
                >
                  <span className="text-[10px] font-black text-red-400 uppercase">Orçamento sob Análise</span>
                  <div>
                    <p className="text-xs font-black text-white leading-tight mt-1 group-hover:text-red-400 transition-colors">{cat.name}</p>
                    <p className="text-[9px] text-slate-500 mt-0.5">Central Técnica M1</p>
                  </div>
                </button>
              ))}
            </div>

            <p className="text-[10px] text-slate-500 text-center leading-tight">
              Os chamados criados passam pela triagem da nossa Central Técnica M1. O valor oficial será adicionado pelo Administrador e enviado para você e o profissional aprovarem.
            </p>
          </div>
        </div>
      )}

      {/* 🛰️ ACTIVE REQUEST STATUS TRACKING HUD OVERLAY ("SPAM SOBREPOSTO NA TELA") */}
      {activeService && !isProposedPriceSpamOpen && !spamOnTheWayService && (() => {
        const statusConfig = getStatusConfig(activeService.status);
        const isThemeGreen = statusConfig.theme === 'green';
        const isThemeYellow = statusConfig.theme === 'yellow';
        const isThemeRed = statusConfig.theme === 'red';

        return (
          <div 
            className="fixed inset-0 bg-black/92 backdrop-blur-xl z-[999980] flex items-start justify-center pt-20 pb-12 px-3 sm:px-5 overflow-y-auto animate-in fade-in duration-200" 
            id="active-service-overlay"
          >
            <div className={`spam-content-container bg-slate-950 border-2 ${
              isThemeGreen ? 'border-green-500 shadow-[0_0_50px_rgba(34,197,94,0.25)]' :
              isThemeYellow ? 'border-yellow-500 shadow-[0_0_50px_rgba(234,179,8,0.25)]' :
              'border-red-500 shadow-[0_0_50px_rgba(239,68,68,0.25)]'
            } w-full max-w-xl rounded-3xl p-5 sm:p-6 shadow-2xl relative space-y-4 my-4 sm:my-8 cursor-default text-left`}>
              
              {/* Header */}
              <div className="flex items-center gap-3 border-b border-slate-800/80 pb-3">
                <div className={`p-2.5 rounded-xl bg-slate-950 border ${
                  isThemeGreen ? 'border-green-500/30 text-green-400' :
                  isThemeYellow ? 'border-yellow-500/30 text-yellow-400' :
                  'border-red-500/30 text-red-400'
                }`}>
                  <Zap className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className={`text-[9px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full border ${
                    isThemeGreen ? 'bg-green-500/10 text-green-400 border-green-500/20' :
                    isThemeYellow ? 'bg-yellow-500/10 text-yellow-400 border-yellow-500/20' :
                    'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {statusConfig.badge}
                  </span>
                  <h3 className="text-sm font-black text-white mt-1">
                    Acompanhamento: {activeService.code}
                  </h3>
                </div>
              </div>

              {/* CRITICAL INFORMATION AT THE TOP (Price and ETA/Status) */}
              <div className="grid grid-cols-2 gap-2.5">
                {/* Price (Orçamento) */}
                <div className={`p-3.5 bg-slate-950/80 rounded-2xl border text-center flex flex-col justify-center min-h-[90px] ${
                  isThemeGreen ? 'border-green-500/20' :
                  isThemeYellow ? 'border-yellow-500/20' :
                  'border-red-500/20'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Orçamento Oficial</span>
                  {activeService.estimatedPrice > 0 ? (
                    <span className={`text-2xl font-mono font-black mt-1 ${
                      isThemeGreen ? 'text-green-400' :
                      isThemeYellow ? 'text-yellow-400' :
                      'text-red-400'
                    }`}>
                      R$ {activeService.estimatedPrice.toFixed(2)}
                    </span>
                  ) : (
                    <span className="text-xs font-black text-slate-500 mt-1.5 uppercase tracking-wider">Sob Análise</span>
                  )}
                </div>

                {/* Critical Info / ETA */}
                <div className={`p-3.5 bg-slate-950/80 rounded-2xl border text-center flex flex-col justify-center min-h-[90px] ${
                  isThemeGreen ? 'border-green-500/20' :
                  isThemeYellow ? 'border-yellow-500/20' :
                  'border-red-500/20'
                }`}>
                  <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">Tempo Estimado (ETA)</span>
                  {['aguardando_confirmacao_cliente', 'aceito_pelo_prestador', 'despachado_prestador', 'em_deslocamento'].includes(activeService.status) ? (
                    <span className="text-2xl font-mono font-black mt-1 text-amber-400 animate-pulse">
                      {activeService.estimatedArrivalMinutes || 15}<span className="text-xs font-bold text-slate-500 ml-0.5">MIN</span>
                    </span>
                  ) : activeService.status === 'chegou_ao_local' ? (
                    <span className="text-xs font-black mt-1.5 text-green-400 uppercase tracking-wider flex items-center justify-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                      No Local
                    </span>
                  ) : activeService.status === 'em_execucao' ? (
                    <span className="text-xs font-black mt-1.5 text-green-400 uppercase tracking-wider">
                      Em Serviço
                    </span>
                  ) : (
                    <span className="text-xs font-black mt-1.5 text-slate-500 uppercase tracking-wider">
                      A Definir
                    </span>
                  )}
                </div>
              </div>

              {/* Status details panel with dynamic color schemes */}
              <div className={`p-4 bg-slate-950/40 rounded-2xl border ${
                isThemeGreen ? 'border-green-500/20' :
                isThemeYellow ? 'border-yellow-500/20' :
                'border-red-500/20'
              } space-y-3`}>
                <span className={`text-[10px] font-black uppercase tracking-wider ${
                  isThemeGreen ? 'text-green-400' :
                  isThemeYellow ? 'text-yellow-400' :
                  'text-red-400'
                }`}>
                  {statusConfig.title}
                </span>
                <p className="text-xs text-slate-300 leading-relaxed font-sans">
                  {statusConfig.desc}
                </p>
              </div>

              {/* MAPA DE DESLOCAMENTO VISUAL SIMULATION (Only on 'em_deslocamento' - Verde) */}
              {activeService.status === 'em_deslocamento' && (
                <div className="bg-slate-950 border border-green-500/30 rounded-2xl p-4 space-y-3.5 shadow-xl animate-fade-in">
                  <div className="flex items-center justify-between">
                    <span className="text-[9px] uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/25 px-2.5 py-0.5 rounded-full font-extrabold flex items-center gap-1.5 animate-pulse">
                      <span className="w-2 h-2 rounded-full bg-green-500 animate-ping" />
                      TÉCNICO RASTREADO AO VIVO
                    </span>
                    <span className="text-[9px] text-slate-500 font-mono">GPS ATIVO</span>
                  </div>

                  {/* Visual Route Simulation Container */}
                  <div className="relative bg-slate-900 border border-slate-800/80 rounded-xl p-3 space-y-4 overflow-hidden">
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-20 pointer-events-none" />
                    
                    <div className="flex items-center justify-between relative z-10">
                      {/* Base Node */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-slate-850 border border-slate-700 flex items-center justify-center text-xs shadow-inner">
                          🏢
                        </div>
                        <span className="text-[8px] text-slate-500 font-bold mt-1">Base M1</span>
                      </div>

                      {/* Route Line Connector */}
                      <div className="flex-1 mx-2 relative flex items-center h-2">
                        <div className="absolute inset-x-0 h-[2.5px] bg-slate-800 rounded" />
                        <div className="absolute left-0 h-[2.5px] bg-green-500 rounded animate-pulse" style={{ width: '70%' }} />
                        <div className="absolute left-[65%] -translate-y-1/2 top-1/2 flex flex-col items-center">
                          <div className="bg-green-500 text-slate-950 p-1.5 rounded-full shadow-lg border border-white/20 animate-pulse">
                            <Car className="w-3.5 h-3.5 stroke-[2.5]" />
                          </div>
                        </div>
                      </div>

                      {/* User Destination Node */}
                      <div className="flex flex-col items-center">
                        <div className="w-8 h-8 rounded-full bg-green-500/20 border border-green-500/50 flex items-center justify-center text-xs animate-pulse">
                          📍
                        </div>
                        <span className="text-[8px] text-green-400 font-black mt-1">Sua Casa</span>
                      </div>
                    </div>

                    {/* Progress Bar & ETA details */}
                    <div className="space-y-1 pt-1.5">
                      <div className="flex justify-between text-[9px] text-slate-400 font-mono font-bold">
                        <span>Distância Restante: ~3.1 km</span>
                        <span className="text-green-400">70% concluído</span>
                      </div>
                      <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                        <div className="bg-gradient-to-r from-green-500 to-emerald-400 h-full rounded-full" style={{ width: '70%' }} />
                      </div>
                    </div>
                  </div>

                  {/* Arrival countdown countdown timer */}
                  <ClientArrivalCountdown acceptedEpoch={activeService.acceptedEpoch} estimatedArrivalMinutes={activeService.estimatedArrivalMinutes} />

                  {/* Rider & Vehicle Grid */}
                  <div className="grid grid-cols-2 gap-2.5 bg-slate-900/60 p-2.5 rounded-xl text-[10.5px] border border-slate-800/60 font-sans">
                    <div className="flex flex-col">
                      <span className="text-[8.5px] text-slate-500 uppercase font-bold">Técnico M1</span>
                      <span className="font-extrabold text-white truncate">{activeService.providerName || 'Especialista Credenciado'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8.5px] text-slate-500 uppercase font-bold">Tempo Inicial</span>
                      <span className="font-extrabold text-amber-400">{activeService.estimatedArrivalMinutes || 15} min</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8.5px] text-slate-500 uppercase font-bold">Veículo</span>
                      <span className="font-extrabold text-white truncate">{activeService.providerVehicle || 'Moto de Emergência'}</span>
                    </div>
                    <div className="flex flex-col">
                      <span className="text-[8.5px] text-slate-500 uppercase font-bold">Placa de Identificação</span>
                      <span className="font-extrabold text-green-400 font-mono uppercase">{activeService.providerPlate || 'M1-SERV'}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Interactive forms/buttons inside the overlay depending on status */}
              <div className="space-y-3.5">
                {/* 1. SHORTCUT TO OPEN SPAM BUDGET MODAL IF PENDING APPROVAL */}
                {activeService.status === 'aguardando_confirmacao_cliente' && (
                  <div className="p-3.5 bg-amber-500/10 border-2 border-amber-400/50 rounded-2xl space-y-2 text-left animate-pulse" id="client-pending-budget-box">
                    <div className="flex items-center gap-2 text-xs font-black text-amber-300 uppercase">
                      <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />
                      <span>Orçamento Definido pela Central M1</span>
                    </div>
                    <p className="text-[11px] text-slate-300">
                      O orçamento oficial foi cadastrado. É necessário que você aprove o valor na tela de solicitação para que seja liberado para os prestadores credenciados.
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setDismissedClientSpamIds(prev => ({ ...prev, [activeService.id]: false }));
                      }}
                      className="w-full py-2.5 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl cursor-pointer shadow-md transition-all flex items-center justify-center gap-2"
                    >
                      <DollarSign className="w-4 h-4 stroke-[3]" />
                      <span>Abrir SPAM do Orçamento e Aprovar</span>
                    </button>
                  </div>
                )}

                {/* 2. CONFIRM ARRIVAL */}
                {activeService.status === 'chegou_ao_local' && (
                  <div className="space-y-2 animate-fade-in">
                    <button
                      type="button"
                      onClick={() => clientConfirmProviderArrival(activeService.id)}
                      className="w-full py-3.5 bg-green-500 hover:bg-green-400 text-slate-950 font-black text-xs uppercase rounded-xl cursor-pointer shadow-md transition-colors"
                    >
                      ✓ Confirmar Chegada do Técnico
                    </button>
                  </div>
                )}

                {/* 3. EVALUATION / PAYMENT */}
                {activeService.status === 'relatorio_enviado' && (
                  <div className="space-y-2 animate-fade-in">
                    <button
                      type="button"
                      onClick={() => {
                        setIsOverlayOpen(false);
                        setRatingModalService(activeService);
                      }}
                      className="w-full py-3.5 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-400 hover:to-emerald-500 text-slate-950 font-black text-xs uppercase rounded-xl cursor-pointer shadow-md transition-colors"
                    >
                      ✓ Avaliar & Pagar Diretamente ao Prestador
                    </button>
                  </div>
                )}

                {/* 4. PAYMENT PENDING VALIDATION BY ADMIN */}
                {activeService.status === 'aguardando_confirmacao_pagamento' && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-2xl p-4 space-y-2 text-left animate-fade-in">
                    <div className="flex items-center gap-1.5 text-yellow-400">
                      <Clock className="w-4 h-4 animate-spin text-yellow-400 shrink-0" />
                      <span className="text-[10px] font-black uppercase tracking-wider">Pagamento em Análise de Segurança</span>
                    </div>
                    <p className="text-[11px] text-slate-300 leading-relaxed font-sans">
                      Seu comprovante / transferência Pix foi registrado com sucesso! A Central M1 está confirmando a transação com o prestador credenciado para emitir o termo oficial de encerramento e liberar sua garantia formal de 90 dias. Fique tranquilo, esse processo é concluído rapidamente.
                    </p>
                  </div>
                )}
              </div>

              {/* Service description & media view */}
              <div className="bg-slate-950/40 p-3.5 rounded-2xl border border-slate-800/80 space-y-2">
                <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider flex items-center gap-1.5">
                  <FileText className="w-3.5 h-3.5 text-slate-400" />
                  Detalhes do Pedido
                </span>
                <p className="text-[11px] text-slate-300 leading-relaxed font-sans bg-slate-900/40 p-2.5 rounded-xl border border-slate-850">
                  {activeService.description || "Nenhum detalhe adicional fornecido."}
                </p>
                {activeService.media && activeService.media.length > 0 && (
                  <div className="space-y-1.5">
                    <p className="text-[9px] text-slate-500 font-bold uppercase tracking-wider">Mídias Anexadas ({activeService.media.length}):</p>
                    <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-thin">
                      {activeService.media.map((img, i) => (
                        <div key={i} className="relative rounded-lg overflow-hidden border border-slate-800 bg-slate-950 h-14 w-14 shrink-0">
                          <img
                            src={typeof img === 'string' ? img : img.url}
                            alt={`Anexo ${i + 1}`}
                            onError={(e) => {
                              (e.currentTarget as HTMLImageElement).src = 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=150&q=80';
                            }}
                            className="w-full h-full object-cover cursor-zoom-in"
                          />
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {/* Stepper Progress Section */}
              <div className="space-y-3 bg-slate-950/50 p-3.5 rounded-2xl border border-slate-800/80">
                <h4 className="text-[10px] font-black uppercase tracking-wider text-slate-400">Linha do Tempo</h4>
                
                <div className="space-y-3 pt-1">
                  {/* Step 1: Triagem */}
                  <div className="flex gap-2.5 items-start">
                    <div className="flex flex-col items-center">
                      <span className={`w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center ${
                        ['solicitado', 'aguardando_despacho_admin'].includes(activeService.status)
                          ? 'bg-yellow-500 text-slate-950 animate-pulse'
                          : 'bg-green-500 text-slate-950'
                      }`}>
                        {['solicitado', 'aguardando_despacho_admin'].includes(activeService.status) ? '●' : '✓'}
                      </span>
                      <div className="w-0.5 h-4 bg-slate-800" />
                    </div>
                    <div>
                      <p className={`text-[11px] font-black leading-tight ${['solicitado', 'aguardando_despacho_admin'].includes(activeService.status) ? 'text-yellow-400 font-bold' : 'text-slate-400'}`}>1. Triagem & Definição</p>
                      <p className="text-[9px] text-slate-500">A Central M1 analisa e insere o orçamento.</p>
                    </div>
                  </div>

                  {/* Step 2: Sua Aprovação */}
                  <div className="flex gap-2.5 items-start">
                    <div className="flex flex-col items-center">
                      <span className={`w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center ${
                        ['aguardando_confirmacao_cliente', 'valor_aprovado_cliente'].includes(activeService.status)
                          ? 'bg-yellow-500 text-slate-950 animate-pulse'
                          : ['solicitado', 'aguardando_despacho_admin'].includes(activeService.status)
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-green-500 text-slate-950'
                      }`}>
                        {['aguardando_confirmacao_cliente', 'valor_aprovado_cliente'].includes(activeService.status) ? '●' : ['solicitado', 'aguardando_despacho_admin'].includes(activeService.status) ? '2' : '✓'}
                      </span>
                      <div className="w-0.5 h-4 bg-slate-800" />
                    </div>
                    <div>
                      <p className={`text-[11px] font-black leading-tight ${['aguardando_confirmacao_cliente', 'valor_aprovado_cliente'].includes(activeService.status) ? 'text-yellow-400 font-bold' : 'text-slate-400'}`}>2. Sua Aprovação</p>
                      <p className="text-[9px] text-slate-500">Aprovação do valor para despacho do técnico.</p>
                    </div>
                  </div>

                  {/* Step 3: Aceite do Profissional */}
                  <div className="flex gap-2.5 items-start">
                    <div className="flex flex-col items-center">
                      <span className={`w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center ${
                        activeService.status === 'despachado_prestador'
                          ? 'bg-green-500 text-slate-950 animate-pulse'
                          : ['solicitado', 'aguardando_despacho_admin', 'aguardando_confirmacao_cliente', 'valor_aprovado_cliente'].includes(activeService.status)
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-green-500 text-slate-950'
                      }`}>
                        {activeService.status === 'despachado_prestador' ? '●' : ['solicitado', 'aguardando_despacho_admin', 'aguardando_confirmacao_cliente', 'valor_aprovado_cliente'].includes(activeService.status) ? '3' : '✓'}
                      </span>
                      <div className="w-0.5 h-4 bg-slate-800" />
                    </div>
                    <div>
                      <p className={`text-[11px] font-black leading-tight ${activeService.status === 'despachado_prestador' ? 'text-green-400 font-bold' : 'text-slate-400'}`}>3. Aceite do Profissional</p>
                      <p className="text-[9px] text-slate-500">Aceite e deslocamento do técnico credenciado.</p>
                    </div>
                  </div>

                  {/* Step 4: Técnico a Caminho */}
                  <div className="flex gap-2.5 items-start">
                    <div className="flex flex-col items-center">
                      <span className={`w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center ${
                        ['em_deslocamento', 'chegou_ao_local'].includes(activeService.status)
                          ? 'bg-green-500 text-slate-950 animate-pulse'
                          : ['solicitado', 'aguardando_despacho_admin', 'aguardando_confirmacao_cliente', 'valor_aprovado_cliente', 'despachado_prestador'].includes(activeService.status)
                          ? 'bg-slate-800 text-slate-500'
                          : 'bg-green-500 text-slate-950'
                      }`}>
                        {['em_deslocamento', 'chegou_ao_local'].includes(activeService.status) ? '●' : ['solicitado', 'aguardando_despacho_admin', 'aguardando_confirmacao_cliente', 'valor_aprovado_cliente', 'despachado_prestador'].includes(activeService.status) ? '4' : '✓'}
                      </span>
                      <div className="w-0.5 h-4 bg-slate-800" />
                    </div>
                    <div>
                      <p className={`text-[11px] font-black leading-tight ${['em_deslocamento', 'chegou_ao_local'].includes(activeService.status) ? 'text-green-400 font-bold' : 'text-slate-400'}`}>4. Técnico a Caminho</p>
                      <p className="text-[9px] text-slate-500">Técnico em rota para o endereço.</p>
                    </div>
                  </div>

                  {/* Step 5: Laudo & Execução */}
                  <div className="flex gap-2.5 items-start">
                    <div className="flex flex-col items-center">
                      <span className={`w-5 h-5 rounded-full text-[9px] font-black flex items-center justify-center ${
                        ['em_execucao', 'relatorio_enviado'].includes(activeService.status)
                          ? 'bg-green-500 text-slate-950 animate-pulse'
                          : activeService.status === 'concluido_pago'
                          ? 'bg-green-500 text-slate-950'
                          : 'bg-slate-800 text-slate-500'
                      }`}>
                        {['em_execucao', 'relatorio_enviado'].includes(activeService.status) ? '●' : activeService.status === 'concluido_pago' ? '✓' : '5'}
                      </span>
                    </div>
                    <div>
                      <p className={`text-[11px] font-black leading-tight ${['em_execucao', 'relatorio_enviado'].includes(activeService.status) ? 'text-green-400 font-bold' : 'text-slate-400'}`}>5. Laudo & Execução</p>
                      <p className="text-[9px] text-slate-500">Monitoramento e finalização do chamado.</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* Detailed Real-Time Tracking History Logs */}
              {activeService.statusHistory && activeService.statusHistory.length > 0 && (
                <div className="space-y-2 bg-slate-950/60 p-3.5 rounded-2xl border border-slate-800/80 animate-fade-in">
                  <h4 className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center gap-1.5 border-b border-slate-800/80 pb-2">
                    <span className="relative flex h-2 w-2">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                      <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                    </span>
                    Rastreamento de Atividades (Histórico Exato)
                  </h4>
                  <div className="space-y-3 max-h-[160px] overflow-y-auto pr-1 scrollbar-thin">
                    {activeService.statusHistory.slice().reverse().map((log, idx) => (
                      <div key={idx} className="relative pl-3 border-l-2 border-emerald-500/30 space-y-0.5">
                        <div className="absolute -left-[5px] top-1.5 w-2 h-2 rounded-full bg-emerald-400 border border-slate-950" />
                        <div className="flex items-center justify-between gap-2">
                          <span className="text-[10px] font-bold text-slate-200">{log.label}</span>
                          <span className="text-[8px] font-mono text-slate-400 select-all shrink-0 bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800/60">{log.timestamp}</span>
                        </div>
                        <p className="text-[9.5px] text-slate-400 leading-tight">{log.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Central Help */}
              <p className="text-[9.5px] text-slate-500 text-center font-sans">
                🔒 Dúvidas ou alteração de dados? Contate nossa Central M1 no WhatsApp pelo menu inicial.
              </p>
            </div>
          </div>
        );
      })()}

      {/* Persistent Floating Quick Launch Button (when overlay minimized) */}
      {activeService && !isOverlayOpen && (
        <button
          type="button"
          onClick={() => setIsOverlayOpen(true)}
          className="fixed bottom-20 right-4 z-40 bg-gradient-to-r from-red-600 to-rose-500 hover:from-red-500 hover:to-rose-400 text-white px-3.5 py-2.5 rounded-full font-black uppercase text-[10px] tracking-wider shadow-2xl flex items-center gap-1.5 cursor-pointer modal-crisp"
        >
          <Zap className="w-4 h-4 animate-pulse text-white fill-white/10" />
          <span>Acompanhar Chamado</span>
        </button>
      )}

      {/* Botão flutuante para reabrir o SPAM de Orçamento (quando minimizado) */}
      {proposedPriceService && dismissedClientSpamIds[proposedPriceService.id] && (
        <button
          type="button"
          onClick={() => setDismissedClientSpamIds(prev => ({ ...prev, [proposedPriceService.id]: false }))}
          className="fixed bottom-20 left-4 z-40 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-400 hover:to-yellow-300 text-slate-950 px-4 py-2.5 rounded-full font-black uppercase text-[10px] tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.5)] flex items-center gap-2 cursor-pointer border-2 border-white/40 modal-crisp"
          id="reopen-spam-budget-button"
        >
          <DollarSign className="w-4 h-4 stroke-[3] text-slate-950" />
          <span>🚨 Ver Orçamento Recebido (SPAM)</span>
        </button>
      )}

      {/* 🔍 Visualizador de Foto em Tela Cheia (Zoom) */}
      {zoomedPhotoUrl && (
        <div 
          className="fixed inset-0 bg-black/95 backdrop-blur-2xl z-[999999] flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
          onClick={() => setZoomedPhotoUrl(null)}
          id="client-photo-zoom-modal"
        >
          <div className="relative max-w-4xl max-h-[90vh] flex flex-col items-center">
            <img 
              src={zoomedPhotoUrl} 
              alt="Visualização ampliada da evidência" 
              referrerPolicy="no-referrer"
              className="max-w-full max-h-[85vh] object-contain rounded-2xl border border-white/20 shadow-2xl" 
            />
            <button 
              type="button" 
              onClick={() => setZoomedPhotoUrl(null)}
              className="mt-3 px-5 py-2 bg-slate-900/90 text-white rounded-full text-xs font-bold border border-slate-700 hover:bg-slate-800 transition-colors shadow-lg"
            >
              Fechar Visualização (ESC ou toque)
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

