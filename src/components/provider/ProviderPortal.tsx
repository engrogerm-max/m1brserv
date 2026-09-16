import React, { useState, useEffect } from 'react';
import * as LucideIcons from 'lucide-react';
import { useApp } from '../../context/AppContext';
import { soundManager } from '../../utils/audio';
import { ServiceRequest, MediaItem, PhotoReport, ServiceCategory, ProviderProfile } from '../../types';
import { PRESET_SAMPLE_MEDIA } from '../../data/mockData';
import { InteractiveMap } from '../InteractiveMap';
import { PhotoReportViewer } from '../PhotoReportViewer';
import { MediaUploader } from '../MediaUploader';
import { ProviderInteractionSpamModal } from './ProviderInteractionSpamModal';
import { ProviderHistoryReportModal } from './ProviderHistoryReportModal';
import { M1Logo } from '../M1Logo';
import {
  Power,
  Zap,
  Wrench,
  MapPin,
  Clock,
  CheckCircle2,
  DollarSign,
  Send,
  Navigation,
  FileCheck,
  Camera,
  Layers,
  ArrowUpRight,
  Sparkles,
  ShieldCheck,
  ShieldAlert,
  Sliders,
  Wallet,
  Check,
  X,
  Star,
  MessageSquare,
  AlertCircle,
  FileText,
  UserCheck,
  Key,
  Lock,
  Unlock,
  LogOut,
  UserPlus,
  RefreshCw,
  Phone,
  Eye,
  EyeOff,
  Hourglass,
  ArrowLeft,
  Bell,
  AlertTriangle,
  ChevronRight,
  Video,
  AlertOctagon,
  Archive,
  Search,
  Copy
} from 'lucide-react';

const ArrivalCountdown: React.FC<{ acceptedEpoch?: number; estimatedArrivalMinutes?: number }> = ({ acceptedEpoch, estimatedArrivalMinutes }) => {
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
    <div className="bg-amber-500/10 border border-amber-500/25 px-3.5 py-2 rounded-2xl text-center flex items-center gap-2 shadow-inner">
      <Clock className="w-4 h-4 text-amber-400 shrink-0 animate-pulse" />
      <div className="text-left leading-tight">
        <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Cronômetro de Chegada</p>
        <p className="font-mono text-sm font-black text-amber-400">{timeLeftStr}</p>
      </div>
    </div>
  );
};

const getWhatsAppLinkForProvider = (service: ServiceRequest) => {
  const targetPhone = '5511962122694'; // Central Admin M1 Support
  const message = `Olá, sou o prestador credenciado da M1 Serviços. Estou em atendimento para o chamado Código ${service.code} e gostaria de tirar uma dúvida ou falar com o suporte.`;
  return `https://wa.me/${targetPhone}?text=${encodeURIComponent(message)}`;
};

export const ProviderPortal: React.FC = () => {
  const {
    provider,
    providers,
    services,
    settings,
    categories,
    toggleProviderOnline,
    submitProposal,
    acceptServiceRequestDirectly,
    markProviderOnTheWay,
    providerAcceptDispatchedService,
    providerRejectDispatchedService,
    providerQuestionDispatchedService,
    markProviderArrived,
    startServiceExecution,
    submitPhotoReport,
    withdrawProviderPix,
    updateProviderSettings,
    requestCategoryChange,
    submitProfileEditRequest,
    sendChatMessage,
    isChatUnread,
    switchActiveProvider,
    isProviderAuthenticated,
    loginProvider,
    logoutProvider,
    setHasChosenPortal,
    completeProviderRegistration,
    requestProviderRegistration,
    setCurrentRole,
    payProviderLicenseFee,
    providerNotifyFeeTransferred,
    addOrUpdateProvider,
    isAdminUnlocked,
    triggerSyncEvent,
    editServiceDetails
  } = useApp();

  const providerTheme = settings.providerThemeColor || 'emerald';
  const getProviderThemeClasses = (themeName: string) => {
    switch (themeName) {
      case 'red':
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
          focus: 'focus:border-red-500 focus:ring-red-500',
        };
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
          focus: 'focus:border-emerald-500 focus:ring-emerald-500',
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
          focus: 'focus:border-blue-500 focus:ring-blue-500',
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
          focus: 'focus:border-indigo-500 focus:ring-indigo-500',
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
          focus: 'focus:border-amber-500 focus:ring-amber-500',
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
          focus: 'focus:border-purple-500 focus:ring-purple-500',
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
          focus: 'focus:border-cyan-500 focus:ring-cyan-500',
        };
      default:
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
          focus: 'focus:border-emerald-500 focus:ring-emerald-500',
        };
    }
  };
  const theme = getProviderThemeClasses(providerTheme);

  const handleLogout = () => {
    logoutProvider();
    setCurrentRole('provider');
    // Clear login fields and close modals/settings for clean state
    setLoginIdentifier('');
    setLoginPassword('');
    setLoginError('');
    setIsRegisterModalOpen(false);
    setRegSuccessMsg('');
    setIsSettingsOpen(false);
    setIsWithdrawModalOpen(false);
  };

  // Login Form States (when not authenticated)
  const [loginIdentifier, setLoginIdentifier] = useState('');
  const [loginPassword, setLoginPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loginError, setLoginError] = useState('');
  const [loginLoading, setLoginLoading] = useState(false);

  // Registration Request Modal & Multi-Step Wizard
  const [isRegisterModalOpen, setIsRegisterModalOpen] = useState(false);
  const [registerStep, setRegisterStep] = useState<1 | 2 | 3 | 4>(1);
  const [paymentSimulated, setPaymentSimulated] = useState(false);
  const [isSimulatingPayment, setIsSimulatingPayment] = useState(false);
  const [trainingCompleted, setTrainingCompleted] = useState(false);
  const [regForm, setRegForm] = useState({
    name: '',
    phone: '',
    email: '',
    password: '',
    documentNumber: '',
    specialty: 'hidraulica' as ServiceCategory,
    specialties: ['hidraulica'] as ServiceCategory[],
    fullName: '',
    cpf: '',
    cnpj: '',
    address: '',
    serviceRegion: '',
    serviceRadius: 25,
    bankAccount: '',
    pixKey: '',
    bloodType: '',
    allergies: '',
    continuousMeds: '',
    chronicDiseases: '',
    education: '',
    certificatesText: '',
    professionalExp: '',
    dailyAvailability: 'Segunda a Sexta (Horário Comercial)',
    vehicleModel: 'Moto / Carro Próprio',
    vehiclePlate: '',
    city: 'São Paulo, SP',
    documents: {
      facePhoto: '',
      idPhoto: '',
      proofOfAddress: '',
      criminalRecord: '',
      certificatesPhoto: ''
    }
  });
  const [regSuccessMsg, setRegSuccessMsg] = useState('');
  const [regFormId, setRegFormId] = useState<string | null>(() => {
    try {
      const saved = localStorage.getItem('m1_provider_draft_id');
      if (saved) return saved;
    } catch {}
    return null;
  });

  const syncDraftProvider = (latestForm = regForm) => {
    if (!latestForm.name && !latestForm.phone && !latestForm.email) return;
    let currentId = regFormId;
    if (!currentId) {
      currentId = 'provider-' + Date.now();
      setRegFormId(currentId);
      try {
        localStorage.setItem('m1_provider_draft_id', currentId);
      } catch {}
    }
    requestProviderRegistration({
      ...latestForm,
      id: currentId,
      isAuthorizedDirectly: false,
      registrationFeePaid: false
    });
  };

  // Helper for file to base64 conversion
  const handleDocUpload = (field: 'facePhoto' | 'idPhoto' | 'proofOfAddress' | 'criminalRecord' | 'certificatesPhoto', file: File) => {
    const reader = new FileReader();
    reader.onload = () => {
      const result = reader.result as string;
      setRegForm(prev => {
        const updated = {
          ...prev,
          documents: {
            ...prev.documents,
            [field]: result
          }
        };
        syncDraftProvider(updated);
        return updated;
      });
    };
    reader.readAsDataURL(file);
  };

  // Active Job & Radar
  // Helper to ensure strict qualification check when assigning/selecting a provider for a demand
  const isProviderQualifiedForCategory = (p: ProviderProfile, catIdOrName: string): boolean => {
    if (!catIdOrName) return false;
    
    const s1 = catIdOrName.toLowerCase().trim();
    
    // Find category object to get its name
    const categoryObj = categories.find(c => c.id === catIdOrName || c.name.toLowerCase() === s1);
    const sName = categoryObj ? categoryObj.name.toLowerCase() : '';

    return (p.categories || []).some(pCat => {
      const s2 = pCat.toLowerCase().trim();
      const pCatObj = categories.find(c => c.id === pCat || c.name.toLowerCase() === s2);
      const pCatName = pCatObj ? pCatObj.name.toLowerCase() : '';

      // Direct exact match
      if (s1 === s2 || (sName && pCatName && sName === pCatName)) {
        return true;
      }

      // Substring match on IDs
      if (s1.includes(s2) || s2.includes(s1)) {
        return true;
      }

      // Substring match on Names if they exist
      if (sName && pCatName && (sName.includes(pCatName) || pCatName.includes(sName))) {
        return true;
      }

      // Explicit synonym/root equivalence matching
      const getEquivalenceGroup = (val: string): string => {
        const v = val.toLowerCase();
        if (v.includes('hidra') || v.includes('encanad') || v.includes('bombeiro')) return 'hidraulica';
        if (v.includes('eletri')) return 'eletrica';
        if (v.includes('ar') || v.includes('clima') || v.includes('condic')) return 'climatizacao';
        if (v.includes('pint')) return 'pintura';
        if (v.includes('chave')) return 'chaveiro';
        if (v.includes('mecan')) return 'mecanica';
        if (v.includes('marido') || v.includes('aluguel')) return 'marido_de_aluguel';
        if (v.includes('carpin') || v.includes('madeira')) return 'carpintaria';
        return v;
      };

      const g1 = getEquivalenceGroup(s1) || getEquivalenceGroup(sName);
      const g2 = getEquivalenceGroup(s2) || getEquivalenceGroup(pCatName);

      if (g1 === g2) {
        return true;
      }

      // Check if they share any common word of 4 or more letters
      const words1 = `${s1} ${sName}`.split(/[\s_/,-]+/).filter(w => w.length >= 4);
      const words2 = `${s2} ${pCatName}`.split(/[\s_/,-]+/).filter(w => w.length >= 4);
      
      for (const w1 of words1) {
        for (const w2 of words2) {
          if (w1.includes(w2) || w2.includes(w1)) {
            return true;
          }
        }
      }

      return false;
    });
  };

  // Derive all pending alert jobs for this provider (strictly after client price approval)
  // Requisito PP: exibir o spam apenas para prestadores com status 'online', homologados e com a especialidade correspondente
  const allPendingAlertJobs = provider ? services.filter(
    s => {
      // 1. Status 'online'
      if (!provider.isOnline) return false;

      // 2. Homologado (isAuthorized !== false)
      if (provider.isAuthorized === false) return false;

      // 3. Especialidade correspondente
      const specialtyMatched = isProviderQualifiedForCategory(provider, s.category);
      if (!specialtyMatched) return false;

      const isDirectDispatch = (s.status === 'despachado_prestador' || s.status === 'valor_aprovado_cliente') && s.assignedProviderId === provider.id;
      const isBroadcast = (s.status === 'despachado_prestador' || s.status === 'valor_aprovado_cliente') && !s.assignedProviderId && s.dispatchedByAdmin === true && (!s.rejectedByProviderIds || !s.rejectedByProviderIds.includes(provider.id));
      
      return (isDirectDispatch || isBroadcast) &&
             (!s.proposals || !s.proposals.some(p => p.providerId === provider.id));
    }
  ).sort((a, b) => a.id.localeCompare(b.id)) : []; // FIFO Queue (oldest pending job first)

  // REQUISITO ESTRITO: O SPAM só aparece para o prestador de serviço DEPOIS que o cliente aceitar o valor do orçamento (1º aparece para o cliente, 2º para o prestador)
  const pendingAlertJob = allPendingAlertJobs[0] || undefined;
  const activeJob = provider ? services.find(
    s =>
      (s.providerId === provider.id || s.assignedProviderId === provider.id) &&
      (s.status === 'em_deslocamento' ||
        s.status === 'chegou_ao_local' ||
        s.status === 'em_execucao' ||
        s.status === 'relatorio_enviado' ||
        s.status === 'aceito_pelo_prestador' ||
        s.status === 'aguardando_confirmacao_pagamento')
  ) : undefined;

  // Incoming Job Countdown Timer (300 seconds / 5 minutes)
  const [countdown, setCountdown] = useState<number>(300);

  // Termo de Taxa de 15% de Cancelamento acordado pelo Prestador
  const [providerCancelFeeAgreed, setProviderCancelFeeAgreed] = useState<Record<string, boolean>>({});
  const [providerTermAlertTriggered, setProviderTermAlertTriggered] = useState<Record<string, boolean>>({});

  // Proposal custom inputs
  const [proposedPrice, setProposedPrice] = useState<number>(180);
  const [proposedETA, setProposedETA] = useState<number>(10);
  const [proposalMsg, setProposalMsg] = useState<string>(
    'Olá! Analisei seu chamado. Possuo ferramental especializado e peças disponíveis para atendimento rápido.'
  );

  useEffect(() => {
    if (pendingAlertJob) {
      setProposedPrice(pendingAlertJob.estimatedPrice || 180);
      setCountdown(300);
      
      // Play initial warning chime immediately ONLY for specifically dispatched jobs
      if (pendingAlertJob.status === 'despachado_prestador' || pendingAlertJob.status === 'valor_aprovado_cliente') {
        soundManager.playIncomingJobAlert();
      }
      
      const timer = setInterval(() => {
        setCountdown(prev => {
          const nextVal = prev - 1;
          if (nextVal <= 0) {
            clearInterval(timer);
            // Keep the job visible without automatic rejection, just play the alarm sound so the provider knows they are late
            if (pendingAlertJob.status === 'despachado_prestador' || pendingAlertJob.status === 'valor_aprovado_cliente') {
              soundManager.playAdminAlarm();
            }
            return 0;
          }
          // Repeat chime every 10 seconds for visual/audio presence ONLY for specifically dispatched jobs
          if ((pendingAlertJob.status === 'despachado_prestador' || pendingAlertJob.status === 'valor_aprovado_cliente') && nextVal % 10 === 0) {
            soundManager.playIncomingJobAlert();
          }
          return nextVal;
        });
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [pendingAlertJob?.id, pendingAlertJob?.status]);

  // SPAM Notification, Intervention & Reason States for Provider Portal
  const [dismissedSpamIds, setDismissedSpamIds] = useState<Record<string, boolean>>({});
  const [rejectReasonModalJob, setRejectReasonModalJob] = useState<ServiceRequest | null>(null);
  const [selectedRejectReason, setSelectedRejectReason] = useState<string>('Muito distante da minha localização atual');
  const [customRejectReason, setCustomRejectReason] = useState<string>('');
  const [showQuestionInput, setShowQuestionInput] = useState<boolean>(false);
  const [questionText, setQuestionText] = useState<string>('');
  const [questionSuccessFeedback, setQuestionSuccessFeedback] = useState<string>('');
  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState<boolean>(false);
  const [zoomedPhotoUrl, setZoomedPhotoUrl] = useState<string | null>(null);

  // Derive recently canceled services for this provider
  const recentCanceledJobs = provider ? services.filter(
    s => (s.providerId === provider.id || s.assignedProviderId === provider.id) && s.status === 'cancelado'
  ) : [];

  // Determine if the main SPAM Modal should be open (strictly forced to remain visible until answered)
  const isSpamModalOpen = Boolean(pendingAlertJob);

  // Direct payment & fee transfer states
  const [dismissedFeeModalId, setDismissedFeeModalId] = useState<string | null>(null);
  const [copiedM1Pix, setCopiedM1Pix] = useState(false);

  // Vibrate on alert arrival
  useEffect(() => {
    if (pendingAlertJob && !dismissedSpamIds[pendingAlertJob.id]) {
      if (typeof window !== 'undefined' && navigator.vibrate) {
        try {
          navigator.vibrate([200, 100, 200]);
        } catch {}
      }
    }
  }, [pendingAlertJob?.id]);

  // Report drafting state for active job
  const [beforePhotos, setBeforePhotos] = useState<MediaItem[]>([]);
  const [afterPhotos, setAfterPhotos] = useState<MediaItem[]>([]);

  // Local states for custom inline proposal submissions in the feed
  const [activeProposalServiceId, setActiveProposalServiceId] = useState<string | null>(null);
  const [customPrices, setCustomPrices] = useState<Record<string, number>>({});
  const [customETAs, setCustomETAs] = useState<Record<string, number>>({});
  const [customMsgs, setCustomMsgs] = useState<Record<string, string>>({});
  const [checklist, setChecklist] = useState<{ id: string; label: string; completed: boolean }[]>([
    { id: 'c1', label: 'Inspeção inicial e isolamento de segurança', completed: true },
    { id: 'c2', label: 'Desmontagem e diagnóstico técnico', completed: true },
    { id: 'c3', label: 'Instalação / reparo da peça com vedação', completed: false },
    { id: 'c4', label: 'Teste de estanqueidade / carga sob pressão', completed: false },
    { id: 'c5', label: 'Limpeza e registro fotográfico final', completed: false }
  ]);
  const [reportNotes, setReportNotes] = useState<string>(
    'Serviço executado conforme padrão técnico M1 Brasil. Peças antigas substituídas e vedação testada sem nenhum vazamento ou anormalidade.'
  );
  const [materialsUsed, setMaterialsUsed] = useState<string>(
    'Veda-rosca, conector blindado e fita isolante anti-chama 3M.'
  );
  const [futureRecommendations, setFutureRecommendations] = useState<string>(
    'Recomenda-se realizar inspeção preventiva periódica. Garantia do serviço executado de 90 dias pela M1 Brasil.'
  );
  const [videoUrl, setVideoUrl] = useState<string>('');
  const [isInteractionSpamOpen, setIsInteractionSpamOpen] = useState<boolean>(true);
  const [timeSpent, setTimeSpent] = useState<number>(45);

  // Wallet & Pix withdrawal modal state
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState<boolean>(false);
  const [withdrawAmount, setWithdrawAmount] = useState<number>(provider?.walletBalance || 0);
  const [withdrawResult, setWithdrawResult] = useState<{ success: boolean; message: string; receiptId?: string } | null>(
    null
  );

  // Chat & Settings Modals
  const [chatService, setChatService] = useState<ServiceRequest | null>(null);
  const [isSettingsOpen, setIsSettingsOpen] = useState<boolean>(false);
  const [selectedRadius, setSelectedRadius] = useState<number>(provider?.radiusKm || 15);
  const [selectedCategories, setSelectedCategories] = useState<ServiceCategory[]>(provider?.categories || []);
  const [pixKeyInput, setPixKeyInput] = useState<string>(provider?.pixKey || '');
  const [fullNameInput, setFullNameInput] = useState<string>('');
  const [phoneInput, setPhoneInput] = useState<string>('');
  const [cityInput, setCityInput] = useState<string>('');
  const [vehicleModelInput, setVehicleModelInput] = useState<string>('');
  const [vehiclePlateInput, setVehiclePlateInput] = useState<string>('');
  const [bankAccountInput, setBankAccountInput] = useState<string>('');
  const [avatarInput, setAvatarInput] = useState<string>('');

  // Pagination States
  const [demandsPage, setDemandsPage] = useState(1);
  const [completedPage, setCompletedPage] = useState(1);
  const itemsPerPage = 10;

  // Provider History Full Report Modal & Filter
  const [selectedHistoryService, setSelectedHistoryService] = useState<ServiceRequest | null>(null);
  const [historySearchTerm, setHistorySearchTerm] = useState<string>('');

  // Synchronize local states when the provider loads or is updated
  useEffect(() => {
    if (provider) {
      setWithdrawAmount(provider.walletBalance);
      setSelectedRadius(provider.radiusKm);
      setSelectedCategories(provider.categories);
      setPixKeyInput(provider.pixKey || '');
      setFullNameInput(provider.name || '');
      setPhoneInput(provider.phone || '');
      setCityInput(provider.city || '');
      setVehicleModelInput(provider.vehicleModel || '');
      setVehiclePlateInput(provider.vehiclePlate || '');
      setBankAccountInput((provider as any).bankAccount || '');
      setAvatarInput(provider.avatar || provider.documents?.facePhoto || provider.documents?.facePhotoUrl || '');
    }
  }, [provider]);

  // Form de Cadastro Completo do Prestador
  const [compStep, setCompStep] = useState<1 | 2 | 3 | 4>(1);
  const [compForm, setCompForm] = useState({
    fullName: '',
    cpf: '',
    cnpj: '',
    address: '',
    serviceRegion: '',
    serviceRadius: 15,
    pixKey: '',
    bankAccount: '',
    bloodType: '',
    allergies: '',
    continuousMeds: '',
    chronicDiseases: '',
    education: '',
    professionalExp: '',
    dailyAvailability: 'Segunda a Sexta, das 08h às 18h',
    providedServices: [] as string[],
    certificates: [] as string[]
  });

  // Populate complete registration form state when provider details are available
  useEffect(() => {
    if (provider) {
      setCompForm({
        fullName: provider.fullName || provider.name || '',
        cpf: provider.cpf || provider.documentNumber || '',
        cnpj: provider.cnpj || '',
        address: provider.address || '',
        serviceRegion: provider.serviceRegion || provider.city || '',
        serviceRadius: provider.serviceRadius || provider.radiusKm || 15,
        pixKey: provider.pixKey || provider.phone || '',
        bankAccount: provider.bankAccount || '',
        bloodType: provider.bloodType || '',
        allergies: provider.allergies || '',
        continuousMeds: provider.continuousMeds || '',
        chronicDiseases: provider.chronicDiseases || '',
        education: provider.education || '',
        professionalExp: provider.professionalExp || '',
        dailyAvailability: provider.dailyAvailability || 'Segunda a Sexta, das 08h às 18h',
        providedServices: provider.providedServices || provider.categories || [],
        certificates: provider.certificates || []
      });
    }
  }, [provider?.id]);

  const [dashboardQuestionText, setDashboardQuestionText] = useState('');
  const [dashboardShowQuestion, setDashboardShowQuestion] = useState(false);
  const [customSpecialtyInput, setCustomSpecialtyInput] = useState('');

  useEffect(() => {
    if (pendingAlertJob) {
      setDashboardQuestionText('');
      setDashboardShowQuestion(false);
    }
  }, [pendingAlertJob?.id]);

  // Sync initial before photos when job enters execution
  // Track previous active job to detect when it changes to completed/paid
  const [prevActiveJobId, setPrevActiveJobId] = useState<string | null>(null);

  useEffect(() => {
    if (activeJob) {
      setPrevActiveJobId(activeJob.id);
    } else if (prevActiveJobId) {
      // The active job has disappeared! Let's check if it was completed and paid.
      const lastJobObj = services.find(s => s.id === prevActiveJobId);
      if (lastJobObj?.status === 'concluido_pago') {
        // Clear drafting, checklist, and report states for a fully clean dashboard
        setBeforePhotos([]);
        setAfterPhotos([]);
        setReportNotes('Serviço executado conforme padrão técnico M1 Brasil. Peças antigas substituídas e vedação testada sem nenhum vazamento ou anormalidade.');
        setMaterialsUsed('Veda-rosca, conector blindado e fita isolante anti-chama 3M.');
        setTimeSpent(45);
        setChatService(null);
      }
      setPrevActiveJobId(null);
    }
  }, [activeJob?.id, services, prevActiveJobId]);

  useEffect(() => {
    if (activeJob && activeJob.status === 'em_execucao') {
      if (activeJob.photoReport) {
        setBeforePhotos(activeJob.photoReport.beforePhotos || activeJob.media);
        if (activeJob.photoReport.afterPhotos?.length) {
          setAfterPhotos(activeJob.photoReport.afterPhotos);
        }
        if (activeJob.photoReport.checklist?.length) {
          setChecklist(activeJob.photoReport.checklist);
        }
      } else {
        setBeforePhotos(activeJob.media);
      }
    }
  }, [activeJob?.id, activeJob?.status]);

  // Auto open Interaction SPAM modal whenever activeJob is en route, arrived, executing, or report sent
  useEffect(() => {
    if (activeJob) {
      if (['em_deslocamento', 'chegou_ao_local', 'em_execucao', 'relatorio_enviado'].includes(activeJob.status)) {
        setIsInteractionSpamOpen(true);
      } else if (activeJob.status === 'aguardando_confirmacao_pagamento') {
        setIsInteractionSpamOpen(false);
      }
    }
  }, [activeJob?.id, activeJob?.status]);

  const toggleChecklistItem = (id: string) => {
    setChecklist(prev => prev.map(item => (item.id === id ? { ...item, completed: !item.completed } : item)));
  };

  const handleSendReport = () => {
    if (!activeJob) return;

    const finalReport: PhotoReport = {
      beforePhotos: beforePhotos.length > 0 ? beforePhotos : activeJob.media,
      afterPhotos:
        afterPhotos.length > 0 ? afterPhotos : PRESET_SAMPLE_MEDIA[activeJob.category]?.sampleAfter || beforePhotos,
      notes: reportNotes,
      materialsUsed,
      futureRecommendations,
      videoUrl: videoUrl || undefined,
      checklist,
      submittedAt: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      timeSpentMinutes: timeSpent
    };

    submitPhotoReport(activeJob.id, finalReport);
  };

  const handleProviderLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError('');

    setTimeout(() => {
      const res = loginProvider(loginIdentifier, loginPassword);
      setLoginLoading(false);
      if (!res.success) {
        setLoginError(res.message);
        // Explicitly trigger a high-visibility visual toast (spam) on the login screen
        triggerSyncEvent(
          'alarm_triggered',
          'Acesso Bloqueado',
          res.message,
          'alarm',
          'provider'
        );
      }
    }, 400);
  };

  // -------------------------------------------------------------------------
  // 1. PROVIDER LOGIN SCREEN (IF NOT AUTHENTICATED OR NOT AUTHORIZED)
  // -------------------------------------------------------------------------
  if (!isProviderAuthenticated) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-10">
        <div className="w-full max-w-md bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          {settings.providerBannerImage && (
            <div className="w-full h-32 rounded-2xl overflow-hidden mb-2 border border-slate-800">
              <img src={settings.providerBannerImage} className="w-full h-full object-cover" alt="Banner Credenciado" referrerPolicy="no-referrer" />
            </div>
          )}

          <div className="text-center space-y-2">
            <div className={`inline-flex p-3.5 rounded-2xl ${theme.bgLight} border ${theme.border30} ${theme.text} mb-1`}>
              <Key className="w-8 h-8" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              {settings.providerPageTitle || 'Área do Prestador Credenciado'}
            </h2>
            <p className="text-xs text-slate-400">
              {settings.providerPageSubtitle || 'Entre com seu número do WhatsApp e a senha escolhida para receber ordens de serviço.'}
            </p>
          </div>

          <form onSubmit={handleProviderLoginSubmit} className="space-y-4">
            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Número do WhatsApp
              </label>
              <input
                type="text"
                value={loginIdentifier}
                onChange={e => setLoginIdentifier(e.target.value)}
                placeholder="Ex: (11) 98765-4321"
                className={`w-full bg-slate-950 border border-slate-700 focus:ring-1 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all ${theme.focus}`}
                required
              />
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider mb-1.5">
                Senha Escolhida
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={loginPassword}
                  onChange={e => setLoginPassword(e.target.value)}
                  placeholder="Digite sua senha de acesso"
                  className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl px-4 py-3 text-xs text-white placeholder-slate-500 outline-none transition-all pr-10 font-mono"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-200 p-1 cursor-pointer"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {loginError && (
              <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{loginError}</span>
              </div>
            )}

            <button
              type="submit"
              disabled={loginLoading || !loginIdentifier || !loginPassword}
              className="w-full py-3 px-4 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer"
            >
              {loginLoading ? (
                <RefreshCw className="w-4 h-4 animate-spin" />
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  <span>Acessar Painel do Prestador</span>
                </>
              )}
            </button>
          </form>

          {/* Need Access / Registration Request */}
          <div className="pt-4 border-t border-slate-800 text-center space-y-3">
            <button
              type="button"
              onClick={() => {
                setRegisterStep(1);
                setPaymentSimulated(false);
                setIsSimulatingPayment(false);
                setTrainingCompleted(false);
                setRegSuccessMsg('');
                setRegFormId(null);
                setRegForm({
                  name: '',
                  phone: '',
                  email: '',
                  password: '',
                  documentNumber: '',
                  specialty: 'hidraulica' as ServiceCategory,
                  specialties: ['hidraulica'] as ServiceCategory[],
                  fullName: '',
                  cpf: '',
                  cnpj: '',
                  address: '',
                  serviceRegion: '',
                  serviceRadius: 25,
                  bankAccount: '',
                  pixKey: '',
                  bloodType: '',
                  allergies: '',
                  continuousMeds: '',
                  chronicDiseases: '',
                  education: '',
                  certificatesText: '',
                  professionalExp: '',
                  dailyAvailability: 'Segunda a Sexta (Horário Comercial)',
                  vehicleModel: 'Moto / Carro Próprio',
                  vehiclePlate: '',
                  city: 'São Paulo, SP',
                  documents: {
                    facePhoto: '',
                    idPhoto: '',
                    proofOfAddress: '',
                    criminalRecord: '',
                    certificatesPhoto: ''
                  }
                });
                setIsRegisterModalOpen(true);
              }}
              className="text-xs font-bold text-emerald-400 hover:text-emerald-300 flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5" />
              <span>Novo profissional? Cadastrar e Credenciar Perfil</span>
            </button>

            <button
              type="button"
              onClick={() => setHasChosenPortal(false)}
              className="text-xs font-bold text-slate-400 hover:text-white flex items-center justify-center gap-1.5 mx-auto cursor-pointer pt-1"
            >
              <ArrowLeft className="w-3.5 h-3.5 text-emerald-400" />
              <span>Voltar para Seleção de Perfil</span>
            </button>

            {isAdminUnlocked && (
              <div className="flex items-center justify-center gap-4 pt-2 border-t border-slate-800/40">
                <button
                  type="button"
                  onClick={() => setCurrentRole('client')}
                  className="text-[10px] font-black uppercase tracking-wider text-slate-400 hover:text-white flex items-center gap-1 cursor-pointer transition-colors"
                >
                  <span>Área do Cliente (Cadastro/Acesso)</span>
                </button>
              </div>
            )}
          </div>
        </div>

        {/* REGISTRATION MODAL */}
        {isRegisterModalOpen && (
          <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-lg w-full p-6 shadow-2xl space-y-5 max-h-[90vh] overflow-y-auto">
              
              {/* Wizard Progress Header */}
              <div className="space-y-3">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <h3 className="text-sm font-black text-white flex items-center gap-2 uppercase tracking-wider">
                    <UserPlus className="w-4 h-4 text-emerald-400 animate-pulse" />
                    <span>Credenciamento M1 Serviços</span>
                  </h3>
                  <button
                    onClick={() => {
                      setIsRegisterModalOpen(false);
                      setRegisterStep(1);
                    }}
                    className="text-slate-400 hover:text-white cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                {/* Progress Indicators */}
                <div className="grid grid-cols-3 gap-1">
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${registerStep >= 1 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${registerStep >= 3 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                  <div className={`h-1.5 rounded-full transition-all duration-300 ${registerStep >= 4 ? 'bg-emerald-500' : 'bg-slate-800'}`} />
                </div>
                <div className="flex justify-between text-[10px] text-slate-400 font-bold uppercase tracking-wider">
                  <span className={registerStep === 1 ? 'text-emerald-400' : ''}>1. Cadastro</span>
                  <span className={registerStep === 3 ? 'text-emerald-400' : ''}>2. Treinamento</span>
                  <span className={registerStep === 4 ? 'text-emerald-400' : ''}>3. Liberado</span>
                </div>
              </div>

              {/* STEP 1: Form Registration */}
              {registerStep === 1 && (
                <form
                  onSubmit={e => {
                    e.preventDefault();
                    if (!regForm.name || !regForm.phone || !regForm.password || !regForm.documentNumber || !regForm.address || !regForm.serviceRegion || !regForm.pixKey || !regForm.bankAccount || !regForm.professionalExp) {
                      alert("Por favor, preencha todos os campos obrigatórios marcados com *.");
                      return;
                    }
                    if (!regForm.documents.facePhoto || !regForm.documents.idPhoto || !regForm.documents.proofOfAddress || !regForm.documents.criminalRecord) {
                      alert("Por favor, anexe todos os documentos obrigatórios (Selfie, Documento com Foto, Comprovante de Residência e Antecedentes Criminais).");
                      return;
                    }
                    syncDraftProvider();
                    setRegisterStep(3);
                  }}
                  className="space-y-3.5 text-xs"
                >
                  <div className="p-3 bg-slate-950/40 border border-slate-800 rounded-2xl text-slate-300 leading-relaxed text-[11px]">
                    Cadastre suas informações básicas abaixo, escolha sua senha de acesso e anexe seus documentos para dar início ao credenciamento na M1.
                  </div>

                  <div>
                    <label className="block text-slate-400 font-bold mb-1">Nome Completo *</label>
                    <input
                      type="text"
                      value={regForm.name}
                      onChange={e => setRegForm({ ...regForm, name: e.target.value })}
                      onBlur={() => syncDraftProvider()}
                      placeholder="Ex: Carlos Alberto de Souza"
                      className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">WhatsApp / Telefone *</label>
                      <input
                        type="text"
                        value={regForm.phone}
                        onChange={e => setRegForm({ ...regForm, phone: e.target.value })}
                        onBlur={() => syncDraftProvider()}
                        placeholder="Ex: (11) 98765-4321"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">E-mail Comercial</label>
                      <input
                        type="email"
                        value={regForm.email}
                        onChange={e => setRegForm({ ...regForm, email: e.target.value })}
                        onBlur={() => syncDraftProvider()}
                        placeholder="Ex: carlos@servicos.com"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Defina sua Senha *</label>
                      <input
                        type="password"
                        value={regForm.password}
                        onChange={e => setRegForm({ ...regForm, password: e.target.value })}
                        onBlur={() => syncDraftProvider()}
                        placeholder="Crie sua senha de acesso"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">CPF ou CNPJ *</label>
                      <input
                        type="text"
                        value={regForm.documentNumber}
                        onChange={e => setRegForm({ ...regForm, documentNumber: e.target.value })}
                        onBlur={() => syncDraftProvider()}
                        placeholder="Ex: 000.000.000-00"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all"
                        required
                      />
                    </div>
                  </div>

                  {/* Areas of Expertise / Multiple Specialties */}
                  <div className="space-y-1.5">
                    <label className="block text-slate-400 font-bold">Áreas de Atuação (Selecione todas que tem experiência) *</label>
                    <div className="grid grid-cols-2 gap-2 bg-slate-950 p-3 rounded-2xl border border-slate-800 max-h-40 overflow-y-auto">
                      {categories.map(cat => {
                        const isSelected = regForm.specialties.includes(cat.id);
                        return (
                          <label
                            key={cat.id}
                            className="flex items-center gap-2 text-[11px] text-slate-300 hover:text-white cursor-pointer transition-colors"
                          >
                            <input
                              type="checkbox"
                              checked={isSelected}
                              onChange={e => {
                                let updated = [...regForm.specialties];
                                if (e.target.checked) {
                                  if (!updated.includes(cat.id)) updated.push(cat.id);
                                } else {
                                  updated = updated.filter(id => id !== cat.id);
                                }
                                const newForm = {
                                  ...regForm,
                                  specialties: updated,
                                  specialty: updated[0] || 'hidraulica' as ServiceCategory
                                };
                                setRegForm(newForm);
                                syncDraftProvider(newForm);
                              }}
                              className="rounded bg-slate-900 border-slate-700 text-emerald-500 focus:ring-emerald-500 w-3.5 h-3.5"
                            />
                            <span>{cat.name}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Cidade Principal</label>
                      <input
                        type="text"
                        value={regForm.city}
                        onChange={e => setRegForm({ ...regForm, city: e.target.value })}
                        onBlur={() => syncDraftProvider()}
                        placeholder="Ex: São Paulo, SP"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Veículo de Trabalho</label>
                      <input
                        type="text"
                        value={regForm.vehicleModel}
                        onChange={e => setRegForm({ ...regForm, vehicleModel: e.target.value })}
                        onBlur={() => syncDraftProvider()}
                        placeholder="Ex: Moto Honda Titan"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Placa do Veículo</label>
                      <input
                        type="text"
                        value={regForm.vehiclePlate}
                        onChange={e => setRegForm({ ...regForm, vehiclePlate: e.target.value })}
                        onBlur={() => syncDraftProvider()}
                        placeholder="Ex: ABC-1234"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all uppercase"
                      />
                    </div>
                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Disponibilidade</label>
                      <input
                        type="text"
                        value={regForm.dailyAvailability}
                        onChange={e => setRegForm({ ...regForm, dailyAvailability: e.target.value })}
                        onBlur={() => syncDraftProvider()}
                        placeholder="Ex: Segunda a Sábado"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all"
                      />
                    </div>
                  </div>

                  {/* Detailed Profile Info */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <p className="text-[10px] font-black text-emerald-400 uppercase tracking-wider">Informações Detalhadas de Atendimento</p>
                    
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Nome Completo / Razão Social *</label>
                        <input
                          type="text"
                          value={regForm.fullName}
                          onChange={e => setRegForm({ ...regForm, fullName: e.target.value, name: e.target.value })}
                          onBlur={() => syncDraftProvider()}
                          placeholder="Nome Civil ou Razão Social"
                          className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">CNPJ (Opcional - ex: MEI)</label>
                        <input
                          type="text"
                          value={regForm.cnpj}
                          onChange={e => setRegForm({ ...regForm, cnpj: e.target.value })}
                          onBlur={() => syncDraftProvider()}
                          placeholder="Ex: 00.000.000/0001-00"
                          className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Endereço Residencial Completo *</label>
                      <input
                        type="text"
                        value={regForm.address}
                        onChange={e => setRegForm({ ...regForm, address: e.target.value })}
                        onBlur={() => syncDraftProvider()}
                        placeholder="Rua, número, complemento, bairro e CEP"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all"
                        required
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Região de Atendimento *</label>
                        <input
                          type="text"
                          value={regForm.serviceRegion}
                          onChange={e => setRegForm({ ...regForm, serviceRegion: e.target.value })}
                          onBlur={() => syncDraftProvider()}
                          placeholder="Ex: Zona Sul, ABC, Campinas..."
                          className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Raio de Deslocamento (km) *</label>
                        <input
                          type="number"
                          value={regForm.serviceRadius}
                          onChange={e => setRegForm({ ...regForm, serviceRadius: parseInt(e.target.value) || 25 })}
                          onBlur={() => syncDraftProvider()}
                          placeholder="Ex: 25"
                          className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Chave Pix para Recebimentos *</label>
                        <input
                          type="text"
                          value={regForm.pixKey}
                          onChange={e => setRegForm({ ...regForm, pixKey: e.target.value })}
                          onBlur={() => syncDraftProvider()}
                          placeholder="Ex: CPF, celular ou e-mail"
                          className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-slate-400 font-bold mb-1">Dados Bancários para Resgate *</label>
                        <input
                          type="text"
                          value={regForm.bankAccount}
                          onChange={e => setRegForm({ ...regForm, bankAccount: e.target.value })}
                          onBlur={() => syncDraftProvider()}
                          placeholder="Ex: Banco Itaú, Ag. 1234, CC 56789-0"
                          className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Certificados e Treinamentos (Separados por vírgula)</label>
                      <input
                        type="text"
                        value={regForm.certificatesText}
                        onChange={e => setRegForm({ ...regForm, certificatesText: e.target.value })}
                        onBlur={() => syncDraftProvider()}
                        placeholder="Ex: NR10, NR35, Técnico de Ar Condicionado, SENAI Eletricista"
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2.5 text-white outline-none transition-all"
                      />
                    </div>

                    <div>
                      <label className="block text-slate-400 font-bold mb-1">Sua Experiência Profissional (Resumo Biográfico) *</label>
                      <textarea
                        value={regForm.professionalExp}
                        onChange={e => setRegForm({ ...regForm, professionalExp: e.target.value })}
                        onBlur={() => syncDraftProvider()}
                        placeholder="Descreva brevemente sua experiência e os serviços que executa com excelência..."
                        className="w-full bg-slate-950 border border-slate-700 focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 rounded-xl p-2 text-white outline-none transition-all h-16 resize-none"
                        required
                      />
                    </div>
                  </div>

                  {/* Document Uploads */}
                  <div className="space-y-2 pt-2 border-t border-slate-800">
                    <p className="text-[10px] font-black text-amber-400 uppercase tracking-wider flex items-center gap-1">
                      <ShieldCheck className="w-3.5 h-3.5" />
                      <span>Documentos de Identificação e Qualificação (Anexar):</span>
                    </p>

                    <div className="grid grid-cols-2 gap-2 text-[10px]">
                      {/* Selfie */}
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <label className="text-slate-300 font-bold flex items-center justify-between">
                          <span>1. Foto de Rosto (Selfie) *</span>
                          {regForm.documents.facePhoto && <Check className="w-3 h-3 text-emerald-400" />}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            if (e.target.files?.[0]) handleDocUpload('facePhoto', e.target.files[0]);
                          }}
                          className="text-[9px] text-slate-400 cursor-pointer w-full"
                          required={!regForm.documents.facePhoto}
                        />
                      </div>

                      {/* ID Photo */}
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <label className="text-slate-300 font-bold flex items-center justify-between">
                          <span>2. Doc com Foto (RG/CNH) *</span>
                          {regForm.documents.idPhoto && <Check className="w-3 h-3 text-emerald-400" />}
                        </label>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={e => {
                            if (e.target.files?.[0]) handleDocUpload('idPhoto', e.target.files[0]);
                          }}
                          className="text-[9px] text-slate-400 cursor-pointer w-full"
                          required={!regForm.documents.idPhoto}
                        />
                      </div>

                      {/* Proof of Address */}
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <label className="text-slate-300 font-bold flex items-center justify-between">
                          <span>3. Comprovante Residencial *</span>
                          {regForm.documents.proofOfAddress && <Check className="w-3 h-3 text-emerald-400" />}
                        </label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={e => {
                            if (e.target.files?.[0]) handleDocUpload('proofOfAddress', e.target.files[0]);
                          }}
                          className="text-[9px] text-slate-400 cursor-pointer w-full"
                          required={!regForm.documents.proofOfAddress}
                        />
                      </div>

                      {/* Criminal Record */}
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1">
                        <label className="text-slate-300 font-bold flex items-center justify-between">
                          <span>4. Certidão Antecedentes *</span>
                          {regForm.documents.criminalRecord && <Check className="w-3 h-3 text-emerald-400" />}
                        </label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={e => {
                            if (e.target.files?.[0]) handleDocUpload('criminalRecord', e.target.files[0]);
                          }}
                          className="text-[9px] text-slate-400 cursor-pointer w-full"
                          required={!regForm.documents.criminalRecord}
                        />
                      </div>

                      {/* Certificates Photo */}
                      <div className="bg-slate-950 p-2.5 rounded-xl border border-slate-800 space-y-1 col-span-2">
                        <label className="text-slate-300 font-bold flex items-center justify-between">
                          <span>5. Foto de Certificados / Diplomas / Cursos (Anexar)</span>
                          {regForm.documents.certificatesPhoto && <Check className="w-3 h-3 text-emerald-400" />}
                        </label>
                        <input
                          type="file"
                          accept="image/*,application/pdf"
                          onChange={e => {
                            if (e.target.files?.[0]) handleDocUpload('certificatesPhoto', e.target.files[0]);
                          }}
                          className="text-[9px] text-slate-400 cursor-pointer w-full"
                        />
                      </div>
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-md shadow-emerald-500/20 flex items-center justify-center gap-1.5"
                  >
                    <span>Ir para o Treinamento de Credenciamento</span>
                    <ArrowUpRight className="w-4 h-4" />
                  </button>
                </form>
              )}

              {/* STEP 2: Payment Fee */}
              {registerStep === 2 && (
                <div className="space-y-4 text-xs">
                  <div className="text-center space-y-1.5">
                    <p className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">Taxa de Credenciamento & Ativação de Perfil</p>
                    <h4 className="text-2xl font-black text-white font-mono">
                      R$ {(settings.providerLicenseFee || 120).toFixed(2)}
                    </h4>
                    <p className="text-[11px] text-slate-400">
                      Valor único e administrável pelo painel administrativo para liberação de ordens de serviço.
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3">
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Beneficiário M1</span>
                      <span className="text-white font-bold">{settings.pixReceiverName || 'M1 BRASIL SERVICOS TECNICOS'}</span>
                    </div>
                    {settings.pixReceiverCnpj && (
                      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">CNPJ</span>
                        <span className="text-white font-mono font-bold text-xs">{settings.pixReceiverCnpj}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Banco</span>
                      <span className="text-white font-bold">{settings.pixReceiverBank || 'Banco Inter'}</span>
                    </div>
                    {settings.pixReceiverAgency && (
                      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Agência</span>
                        <span className="text-white font-mono font-bold">{settings.pixReceiverAgency}</span>
                      </div>
                    )}
                    {settings.pixReceiverAccount && (
                      <div className="flex items-center justify-between border-b border-slate-850 pb-2">
                        <span className="text-[10px] text-slate-500 font-bold uppercase">Conta Corrente</span>
                        <span className="text-white font-mono font-bold">{settings.pixReceiverAccount}</span>
                      </div>
                    )}
                    <div className="flex items-center justify-between">
                      <span className="text-[10px] text-slate-500 font-bold uppercase">Chave PIX ({settings.pixReceiverType || 'E-mail'})</span>
                      <span className="text-emerald-400 font-bold font-mono">{settings.pixReceiverKey || 'rogerio@m1br.com.br'}</span>
                    </div>
                  </div>

                  {/* Pix Copy and Paste string */}
                  <div className="space-y-1.5 bg-slate-950 border border-slate-850 rounded-2xl p-3.5 text-center">
                    <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400">Pix Copia e Cola</span>
                    <input
                      type="text"
                      readOnly
                      value={`00020126580014br.gov.pix0118${settings.pixReceiverKey || 'rogerio@m1br.com.br'}5204000053039865405${(settings.providerLicenseFee || 120).toFixed(2)}5802BR5925M1_SERVICOS6009SAO_PAULO62070503***6304`}
                      className="w-full text-center bg-slate-900 border border-slate-800 rounded-lg p-2 font-mono text-[9px] text-slate-400 select-all focus:outline-none"
                    />
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(`00020126580014br.gov.pix0118${settings.pixReceiverKey || 'rogerio@m1br.com.br'}5204000053039865405${(settings.providerLicenseFee || 120).toFixed(2)}5802BR5925M1_SERVICOS6009SAO_PAULO62070503***6304`);
                        soundManager.playSuccessChime();
                      }}
                      className="text-[10px] text-emerald-400 font-bold hover:text-emerald-300 underline block mx-auto cursor-pointer"
                    >
                      Copiar Código Pix
                    </button>
                  </div>

                  {/* Action Buttons */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={() => {
                        setIsSimulatingPayment(true);
                        setTimeout(() => {
                          setIsSimulatingPayment(false);
                          setPaymentSimulated(true);
                          setRegisterStep(3);
                          soundManager.playSuccessChime();
                        }, 1500);
                      }}
                      disabled={isSimulatingPayment}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-60 text-slate-950 font-black text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/10"
                    >
                      {isSimulatingPayment ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          <span>Verificando Pagamento PIX...</span>
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="w-4 h-4" />
                          <span>Confirmar e Validar Pagamento PIX</span>
                        </>
                      )}
                    </button>

                    <button
                      onClick={() => setRegisterStep(1)}
                      disabled={isSimulatingPayment}
                      className="w-full py-2.5 bg-slate-800 hover:bg-slate-750 text-slate-400 hover:text-slate-200 text-[10px] font-bold uppercase rounded-xl transition-all cursor-pointer"
                    >
                      Voltar para Dados do Cadastro
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: M1 Training Link */}
              {registerStep === 3 && (
                <div className="space-y-4 text-xs">
                  <div className="text-center space-y-1.5 bg-emerald-500/5 border border-emerald-500/20 p-4 rounded-2xl">
                    <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto" />
                    <h4 className="text-sm font-black text-white uppercase tracking-tight">Pagamento Confirmado com Sucesso!</h4>
                    <p className="text-[11px] text-slate-400">
                      Sua taxa de credenciamento foi processada. Agora, conclua o treinamento para ativar seu perfil.
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 space-y-3.5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/10 rounded-xl text-emerald-400">
                        <Zap className="w-5 h-5" />
                      </div>
                      <div>
                        <p className="font-bold text-white text-xs">Treinamento Oficial de Excelência M1</p>
                        <p className="text-[10px] text-slate-500">Duração estimada: 12 minutos • Formato: Vídeo Interativo</p>
                      </div>
                    </div>

                    <p className="text-slate-300 leading-relaxed text-[11px]">
                      Aprenda como se posicionar no cliente, registrar os relatórios fotográficos de "ANTES" e "DEPOIS", solicitar suporte central e faturar mais com avaliações 5 estrelas.
                    </p>

                    <div className="pt-1.5">
                      <a
                        href="https://www.m1br.com.br/treinamento-prestadores"
                        target="_blank"
                        rel="noopener noreferrer"
                        onClick={() => setTrainingCompleted(true)}
                        className="w-full py-3 bg-slate-900 border border-slate-750 hover:border-slate-600 text-white rounded-xl text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-inner"
                      >
                        <FileText className="w-4 h-4 text-emerald-400" />
                        <span>Acessar Link de Treinamento M1</span>
                        <ArrowUpRight className="w-3.5 h-3.5 text-slate-400" />
                      </a>
                    </div>
                  </div>

                  {/* Actions */}
                  <div className="space-y-2 pt-2">
                    <button
                      onClick={async () => {
                        const res = await requestProviderRegistration({
                          ...regForm,
                          id: regFormId || undefined,
                          isAuthorizedDirectly: false,
                          registrationFeePaid: true
                        });
                        if (res.success) {
                          setRegSuccessMsg(res.message);
                          setRegisterStep(4);
                        } else {
                          alert(res.message || "Erro ao realizar cadastro.");
                        }
                      }}
                      className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-emerald-500/20"
                    >
                      <UserCheck className="w-4 h-4" />
                      <span>Concluir Treinamento e Enviar Cadastro para Liberação</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: Success & Login Prompt */}
              {registerStep === 4 && (
                <div className="space-y-4 text-xs text-center">
                  <div className="inline-flex p-4 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400">
                    <Clock className="w-12 h-12 animate-pulse" />
                  </div>

                  <div className="space-y-1.5">
                    <h4 className="text-lg font-black text-white uppercase tracking-tight">Cadastro em Análise! 🚀</h4>
                    <p className="text-xs text-slate-300 max-w-sm mx-auto">
                      Parabéns, seu credenciamento e envio de documentos foram efetuados com sucesso! Seu perfil agora aguarda a aprovação e liberação ativa pelo Administrador.
                    </p>
                  </div>

                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-left space-y-2.5">
                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Seus Dados de Acesso:</span>
                    <div className="flex justify-between border-b border-slate-850 pb-2">
                      <span className="text-slate-400 font-medium">WhatsApp:</span>
                      <strong className="text-white font-mono">{regForm.phone}</strong>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400 font-medium">Senha Escolhida:</span>
                      <strong className="text-white font-mono">{regForm.password}</strong>
                    </div>
                  </div>

                  <div className="p-3 bg-amber-500/5 border border-amber-500/15 rounded-xl text-amber-400 text-[11px] leading-relaxed">
                    Seu acesso permanecerá travado até a liberação ativa pelo Administrador. Faça o login agora para acessar a tela de acompanhamento em tempo real.
                  </div>

                  <button
                    onClick={() => {
                      // Pre-populate login form fields
                      setLoginIdentifier(regForm.phone);
                      setLoginPassword(regForm.password);
                      setIsRegisterModalOpen(false);
                      setRegisterStep(1);
                      setRegSuccessMsg('');
                    }}
                    className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-sm rounded-xl cursor-pointer transition-all shadow-lg"
                  >
                    Acessar Painel do Prestador
                  </button>
                </div>
              )}

            </div>
          </div>
        )}
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 1.5 LICENSE FEE PAYMENT CHECK (BLOCKED UNTIL PAID)
  // -------------------------------------------------------------------------
  if (provider && provider.paymentPendingValidation) {
    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 animate-fade-in" id="provider-payment-pending-validation-screen">
        <div className="w-full max-w-lg bg-slate-900 border-2 border-amber-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 text-center relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
          <div className="inline-flex p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
            <Clock className="w-8 h-8" />
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
            Aguardando Confirmação do Administrador
          </h2>
          <p className="text-sm text-slate-300 font-sans leading-relaxed">
            Seu comprovante de pagamento da taxa de ativação de cadastro foi enviado para a Central M1 e está na fila para liberação rápida.
          </p>
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 text-xs space-y-2 text-slate-400 text-left">
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Prestador:</span>
              <span className="font-bold text-white">{provider.name}</span>
            </div>
            <div className="flex justify-between border-b border-slate-800 pb-2">
              <span>Status do Repasse:</span>
              <span className="font-black text-amber-400 uppercase">Pendente de Validação</span>
            </div>
            <p className="text-[11px] text-slate-500 mt-2 text-center">
              A página será destravada e liberada automaticamente em tempo real assim que o Administrador validar seu Pix.
            </p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold uppercase text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sair da Conta (Desconectar)</span>
          </button>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 1.8 COMPLETAR CADASTRO (BLOCKED UNTIL COMPLETE) & CADASTRO EM ANÁLISE
  // -------------------------------------------------------------------------
  const isRegistrationIncomplete = provider && (!provider.fullName || provider.status === 'pending_registration');
  const isAwaitingApproval = provider && (provider.status === 'aguardando_liberacao_admin' || provider.status === 'under_review' || !provider.isAuthorized);

  const handleCertificateUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    Array.from(files).forEach(file => {
      const reader = new FileReader();
      reader.onloadend = () => {
        if (reader.result) {
          setCompForm(prev => ({
            ...prev,
            certificates: [...prev.certificates, reader.result as string]
          }));
        }
      };
      reader.readAsDataURL(file as Blob);
    });
  };

  const handleGenerateMockCertificate = () => {
    const mockCert = "https://images.unsplash.com/photo-1589330694653-ded6df53f6ee?auto=format&fit=crop&w=600&q=80";
    setCompForm(prev => ({
      ...prev,
      certificates: [...prev.certificates, mockCert]
    }));
  };

  const isStepValid = (step: number): { valid: boolean; message?: string } => {
    if (step === 1) {
      if (!compForm.fullName.trim()) return { valid: false, message: 'Por favor, informe seu Nome Completo.' };
      if (!compForm.cpf.trim()) return { valid: false, message: 'Por favor, informe seu CPF.' };
      if (!compForm.pixKey.trim()) return { valid: false, message: 'Por favor, informe sua Chave PIX para recebimento.' };
      if (!compForm.bankAccount.trim()) return { valid: false, message: 'Por favor, informe seus dados de Conta Bancária.' };
      if (!compForm.address.trim()) return { valid: false, message: 'Por favor, informe seu Endereço Completo.' };
    }
    if (step === 2) {
      if (!compForm.bloodType) return { valid: false, message: 'Por favor, selecione seu Tipo Sanguíneo.' };
      if (!compForm.allergies.trim()) return { valid: false, message: 'Por favor, preencha o campo de Alergias (escreva "Nenhuma" se não houver).' };
      if (!compForm.continuousMeds.trim()) return { valid: false, message: 'Por favor, informe se faz uso de Medicamentos Contínuos (escreva "Nenhum" se não houver).' };
      if (!compForm.chronicDiseases.trim()) return { valid: false, message: 'Por favor, informe se possui alguma deficiência ou doença crônica (escreva "Nenhuma" se não houver).' };
    }
    if (step === 3) {
      if (!compForm.education) return { valid: false, message: 'Por favor, selecione sua Escolaridade.' };
      if (!compForm.dailyAvailability.trim()) return { valid: false, message: 'Por favor, indique sua Disponibilidade Diária de horário.' };
      if (!compForm.serviceRegion.trim()) return { valid: false, message: 'Por favor, informe sua Cidade/Região de Atendimento.' };
      if (!compForm.serviceRadius || Number(compForm.serviceRadius) <= 0) return { valid: false, message: 'Por favor, informe um Raio de Atendimento válido maior que 0 km.' };
      if (!compForm.professionalExp.trim()) return { valid: false, message: 'Por favor, preencha o resumo de sua Experiência Profissional.' };
      if (compForm.certificates.length === 0) return { valid: false, message: 'Por favor, anexe ao menos 1 Certificado ou Curso profissional.' };
    }
    if (step === 4) {
      if (compForm.providedServices.length === 0) return { valid: false, message: 'Por favor, selecione pelo menos 1 Especialidade/Categoria de serviço que você atende.' };
    }
    return { valid: true };
  };

  const handleSaveCompleteRegistration = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validate all steps to be absolutely secure
    for (let s = 1; s <= 4; s++) {
      const check = isStepValid(s);
      if (!check.valid) {
        setCompStep(s as any); // Send them back to the step with the error so they can fix it instantly!
        alert(check.message);
        return;
      }
    }

    completeProviderRegistration(provider!.id, {
      fullName: compForm.fullName,
      cpf: compForm.cpf,
      cnpj: compForm.cnpj,
      address: compForm.address,
      serviceRegion: compForm.serviceRegion,
      serviceRadius: Number(compForm.serviceRadius),
      pixKey: compForm.pixKey,
      bankAccount: compForm.bankAccount,
      bloodType: compForm.bloodType,
      allergies: compForm.allergies,
      continuousMeds: compForm.continuousMeds,
      chronicDiseases: compForm.chronicDiseases,
      education: compForm.education,
      certificates: compForm.certificates,
      professionalExp: compForm.professionalExp,
      dailyAvailability: compForm.dailyAvailability,
      providedServices: compForm.providedServices
    });
  };

  if (isRegistrationIncomplete) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center font-sans">
        <div className="max-w-3xl w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
          {/* Header */}
          <div className="bg-slate-900 px-8 py-6 text-white flex justify-between items-center">
            <div>
              <span className="text-emerald-400 font-bold tracking-widest text-xs uppercase">Passo Obrigatório</span>
              <h2 className="text-2xl font-extrabold tracking-tight">Completar seu Cadastro Profissional</h2>
              <p className="text-slate-400 text-sm mt-1">Preencha todas as informações abaixo para homologação na M1 Brasil.</p>
            </div>
            <button 
              onClick={() => logoutProvider()} 
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-sm transition-colors font-medium border border-slate-700"
            >
              Sair do Painel
            </button>
          </div>

          {/* Stepper Progress */}
          <div className="bg-slate-50 px-8 py-4 border-b border-slate-100 flex justify-between items-center text-sm font-semibold">
            <div className="flex items-center gap-6 overflow-x-auto py-1 scrollbar-none w-full">
              {[
                { step: 1, label: 'Dados Pessoais' },
                { step: 2, label: 'Segurança & Saúde' },
                { step: 3, label: 'Profissional & Certificados' },
                { step: 4, label: 'Serviços Prestados' }
              ].map((item) => (
                <div key={item.step} className="flex items-center gap-2 shrink-0">
                  <span className={`w-7 h-7 rounded-full flex items-center justify-center text-xs transition-colors ${compStep === item.step ? 'bg-emerald-600 text-white' : compStep > item.step ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-200 text-slate-600'}`}>
                    {item.step}
                  </span>
                  <span className={`${compStep === item.step ? 'text-slate-900 font-bold' : 'text-slate-500'}`}>
                    {item.label}
                  </span>
                  {item.step < 4 && <span className="text-slate-300">/</span>}
                </div>
              ))}
            </div>
          </div>

          <form onSubmit={handleSaveCompleteRegistration} className="p-8 space-y-6 bg-white">
            {/* STEP 1: DADOS PESSOAIS */}
            {compStep === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b-2 border-slate-200 pb-3">
                  <h3 className="text-xl font-black text-black tracking-tight">1. Dados Pessoais e Faturamento</h3>
                  <p className="text-sm text-slate-800 font-medium mt-1">Informe seus dados cadastrais e financeiros fundamentais para recebimento.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-black">Nome Completo <span className="text-red-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={compForm.fullName}
                      onChange={e => setCompForm(prev => ({ ...prev, fullName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black font-semibold bg-white placeholder-slate-500" 
                      placeholder="Nome completo do prestador"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-black">CPF <span className="text-red-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={compForm.cpf}
                      onChange={e => setCompForm(prev => ({ ...prev, cpf: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black font-semibold bg-white placeholder-slate-500" 
                      placeholder="000.000.000-00"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-black">CNPJ (Opcional)</label>
                    <input 
                      type="text" 
                      value={compForm.cnpj}
                      onChange={e => setCompForm(prev => ({ ...prev, cnpj: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black font-semibold bg-white placeholder-slate-500" 
                      placeholder="00.000.000/0001-00"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-black">Chave PIX (Para Recebimentos) <span className="text-red-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={compForm.pixKey}
                      onChange={e => setCompForm(prev => ({ ...prev, pixKey: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black font-semibold bg-white placeholder-slate-500" 
                      placeholder="Celular, CPF ou Chave Aleatória"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-sm font-bold text-black">Conta Bancária Completa <span className="text-red-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={compForm.bankAccount}
                      onChange={e => setCompForm(prev => ({ ...prev, bankAccount: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black font-semibold bg-white placeholder-slate-500" 
                      placeholder="Ex: Banco Itaú (341) - Agência: 1234 - C/C: 56789-0"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-sm font-bold text-black">Endereço Completo <span className="text-red-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={compForm.address}
                      onChange={e => setCompForm(prev => ({ ...prev, address: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black font-semibold bg-white placeholder-slate-500" 
                      placeholder="Ex: Av. Paulista, 1000 - Apto 12 - Bela Vista, São Paulo - SP"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: SEGURANÇA E SAÚDE */}
            {compStep === 2 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b-2 border-slate-200 pb-3">
                  <h3 className="text-xl font-black text-black tracking-tight">2. Segurança e Ficha Médica</h3>
                  <p className="text-sm text-slate-800 font-medium mt-1">Dados médicos essenciais para sua proteção em caso de emergências durante a prestação do serviço.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-black">Tipo Sanguíneo <span className="text-red-600">*</span></label>
                    <select 
                      required
                      value={compForm.bloodType}
                      onChange={e => setCompForm(prev => ({ ...prev, bloodType: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="" className="text-slate-500 font-medium">Selecione...</option>
                      <option value="A+" className="text-black font-semibold">A+</option>
                      <option value="A-" className="text-black font-semibold">A-</option>
                      <option value="B+" className="text-black font-semibold">B+</option>
                      <option value="B-" className="text-black font-semibold">B-</option>
                      <option value="AB+" className="text-black font-semibold">AB+</option>
                      <option value="AB-" className="text-black font-semibold">AB-</option>
                      <option value="O+" className="text-black font-semibold">O+</option>
                      <option value="O-" className="text-black font-semibold">O-</option>
                      <option value="Não Sei" className="text-black font-semibold">Não sei informar</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-black">Alergias Conhecidas <span className="text-red-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={compForm.allergies}
                      onChange={e => setCompForm(prev => ({ ...prev, allergies: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black font-semibold bg-white placeholder-slate-500" 
                      placeholder="Escreva 'Nenhuma' ou liste as alergias"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-sm font-bold text-black">Uso de Medicamentos Contínuos <span className="text-red-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={compForm.continuousMeds}
                      onChange={e => setCompForm(prev => ({ ...prev, continuousMeds: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black font-semibold bg-white placeholder-slate-500" 
                      placeholder="Ex: Insulina, Anti-hipertensivo, etc. Ou escreva 'Nenhum'"
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-sm font-bold text-black">Possui alguma deficiência ou doença crônica? <span className="text-red-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={compForm.chronicDiseases}
                      onChange={e => setCompForm(prev => ({ ...prev, chronicDiseases: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black font-semibold bg-white placeholder-slate-500" 
                      placeholder="Escreva 'Nenhuma' ou especifique a deficiência ou doença crônica"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: DADOS PROFISSIONAIS */}
            {compStep === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b-2 border-slate-200 pb-3">
                  <h3 className="text-xl font-black text-black tracking-tight">3. Dados Profissionais, Cobertura e Certificados</h3>
                  <p className="text-sm text-slate-800 font-medium mt-1">Defina sua área de cobertura, escolaridade e anexe certificados profissionais.</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-black">Escolaridade <span className="text-red-600">*</span></label>
                    <select 
                      required
                      value={compForm.education}
                      onChange={e => setCompForm(prev => ({ ...prev, education: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg bg-white text-black font-semibold focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500"
                    >
                      <option value="" className="text-slate-500 font-medium">Selecione...</option>
                      <option value="Ensino Fundamental" className="text-black font-semibold">Ensino Fundamental</option>
                      <option value="Ensino Médio" className="text-black font-semibold">Ensino Médio</option>
                      <option value="Técnico Completo" className="text-black font-semibold">Curso Técnico Completo</option>
                      <option value="Superior Incompleto" className="text-black font-semibold">Ensino Superior Incompleto</option>
                      <option value="Superior Completo" className="text-black font-semibold">Ensino Superior Completo</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-black">Disponibilidade Diária <span className="text-red-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={compForm.dailyAvailability}
                      onChange={e => setCompForm(prev => ({ ...prev, dailyAvailability: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black font-semibold bg-white placeholder-slate-500" 
                      placeholder="Ex: Segunda a Sábado, das 07h às 20h"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-black">Cidade/Região de Atendimento <span className="text-red-600">*</span></label>
                    <input 
                      type="text" 
                      required
                      value={compForm.serviceRegion}
                      onChange={e => setCompForm(prev => ({ ...prev, serviceRegion: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black font-semibold bg-white placeholder-slate-500" 
                      placeholder="Ex: São Paulo, Grande ABC, Campinas"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="block text-sm font-bold text-black">Raio de Atendimento (km) <span className="text-red-600">*</span></label>
                    <input 
                      type="number" 
                      required
                      min={1}
                      max={200}
                      value={compForm.serviceRadius}
                      onChange={e => setCompForm(prev => ({ ...prev, serviceRadius: Number(e.target.value) }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black font-semibold bg-white" 
                    />
                  </div>

                  <div className="space-y-1 md:col-span-2">
                    <label className="block text-sm font-bold text-black">Experiência Profissional (Resumo) <span className="text-red-600">*</span></label>
                    <textarea 
                      required
                      rows={3}
                      value={compForm.professionalExp}
                      onChange={e => setCompForm(prev => ({ ...prev, professionalExp: e.target.value }))}
                      className="w-full px-3.5 py-2.5 border-2 border-slate-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-black font-semibold bg-white placeholder-slate-500" 
                      placeholder="Fale um pouco sobre seu histórico de trabalho e especializações..."
                    />
                  </div>

                  <div className="space-y-3 md:col-span-2">
                    <label className="block text-sm font-bold text-black">Certificados e Cursos (Fotos ou Arquivos) <span className="text-red-600">*</span></label>
                    
                    <div className="flex flex-wrap gap-4 items-center">
                      <label className="cursor-pointer inline-flex items-center gap-2 px-4 py-2.5 bg-emerald-50 hover:bg-emerald-100 text-emerald-800 border-2 border-emerald-300 rounded-lg text-sm transition-colors font-bold">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"/></svg>
                        Selecionar Arquivo
                        <input 
                          type="file" 
                          multiple 
                          accept="image/*,.pdf" 
                          onChange={handleCertificateUpload} 
                          className="hidden" 
                        />
                      </label>

                      <button 
                        type="button"
                        onClick={handleGenerateMockCertificate}
                        className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-black border-2 border-slate-300 rounded-lg text-sm transition-colors font-bold"
                      >
                        ⚡ Gerar Certificado de Teste
                      </button>
                    </div>

                    {compForm.certificates.length > 0 ? (
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
                        {compForm.certificates.map((cert, index) => (
                          <div key={index} className="relative group rounded-lg overflow-hidden border border-slate-200 aspect-video bg-slate-50 animate-fade-in">
                            <img referrerPolicy="no-referrer" src={cert} alt={`Certificado ${index + 1}`} className="w-full h-full object-cover" />
                            <button 
                              type="button" 
                              onClick={() => setCompForm(prev => ({ ...prev, certificates: prev.certificates.filter((_, i) => i !== index) }))}
                              className="absolute top-1 right-1 bg-red-600 hover:bg-red-700 text-white p-1 rounded-full text-xs shadow transition-colors"
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <p className="text-sm text-red-600 font-extrabold">Nenhum certificado anexado ainda. Adicione ao menos 1 certificado para liberação.</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* STEP 4: SERVIÇOS QUE ATENDE */}
            {compStep === 4 && (
              <div className="space-y-6 animate-fade-in">
                <div className="border-b-2 border-slate-200 pb-3">
                  <h3 className="text-xl font-black text-black tracking-tight">4. Especialidades e Categorias de Atendimento</h3>
                  <p className="text-sm text-slate-800 font-medium mt-1">Marque quais especialidades você tem habilitação e interesse em atender.</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
                  {categories.map((cat) => {
                    const isChecked = compForm.providedServices.includes(cat.id);
                    const iconKey = (cat.iconName || cat.icon || 'Wrench') as string;
                    const normalizedIconKey = iconKey.charAt(0).toUpperCase() + iconKey.slice(1);
                    const IconComponent = (LucideIcons as any)[normalizedIconKey] || (LucideIcons as any)[iconKey] || LucideIcons.Wrench;

                    return (
                      <label 
                        key={cat.id} 
                        className={`flex items-start gap-3 p-4 border-2 rounded-xl cursor-pointer transition-all ${isChecked ? 'border-emerald-600 bg-emerald-50 shadow-sm' : 'border-slate-300 hover:border-slate-400 bg-white'}`}
                      >
                        <input 
                          type="checkbox" 
                          checked={isChecked}
                          onChange={() => {
                            setCompForm(prev => {
                              const alreadyAdded = prev.providedServices.includes(cat.id);
                              const nextServices = alreadyAdded 
                                ? prev.providedServices.filter(id => id !== cat.id) 
                                : [...prev.providedServices, cat.id];
                              return { ...prev, providedServices: nextServices };
                            });
                          }}
                          className="mt-1.5 rounded text-emerald-600 focus:ring-emerald-500 cursor-pointer w-5 h-5 shrink-0" 
                        />
                        <div className="flex gap-2.5 items-start">
                          <div className={`p-2 rounded-lg shrink-0 ${isChecked ? 'bg-emerald-100 text-emerald-600' : 'bg-slate-100 text-slate-500'}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div>
                            <p className="text-sm font-black text-black uppercase tracking-tight">{cat.name}</p>
                            <p className="text-xs text-slate-800 font-semibold mt-0.5 leading-relaxed">{cat.description}</p>
                          </div>
                        </div>
                      </label>
                    );
                  })}
                </div>

                {compForm.providedServices.length === 0 && (
                  <p className="text-sm text-red-600 font-extrabold mt-2">Você precisa selecionar pelo menos 1 categoria de serviço.</p>
                )}
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex justify-between items-center pt-6 border-t border-slate-100">
              <button
                type="button"
                disabled={compStep === 1}
                onClick={() => setCompStep(prev => (prev - 1) as any)}
                className="px-5 py-2.5 bg-slate-100 hover:bg-slate-200 disabled:opacity-50 text-slate-700 rounded-lg text-sm font-medium transition-colors"
              >
                Voltar
              </button>

              {compStep < 4 ? (
                <button
                  type="button"
                  onClick={() => {
                    const check = isStepValid(compStep);
                    if (!check.valid) {
                      alert(check.message);
                      return;
                    }
                    setCompStep(prev => (prev + 1) as any);
                  }}
                  className="px-5 py-2.5 bg-slate-950 hover:bg-slate-800 text-white rounded-lg text-sm font-semibold shadow-sm transition-colors cursor-pointer"
                >
                  Continuar
                </button>
              ) : (
                <button
                  type="submit"
                  className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold shadow-sm transition-colors cursor-pointer"
                >
                  Salvar e Concluir Cadastro
                </button>
              )}
            </div>
          </form>
        </div>
      </div>
    );
  }

  if (isAwaitingApproval) {
    return (
      <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex flex-col justify-center font-sans">
        <div className="max-w-md w-full mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 p-8 text-center space-y-6">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-amber-50 border border-amber-200 text-amber-500 animate-pulse">
            <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>

          <div className="space-y-2">
            <span className="text-amber-600 font-bold tracking-widest text-[10px] uppercase bg-amber-50 px-2.5 py-1 rounded-full border border-amber-200">
              Análise em Andamento
            </span>
            <h2 className="text-2xl font-black text-slate-900 tracking-tight leading-tight">CADASTRO EM ANÁLISE</h2>
            <p className="text-slate-500 text-sm leading-relaxed">
              Olá, <span className="font-bold text-slate-800">{provider?.fullName || provider?.name}</span>. Seus dados cadastrais e certificados foram enviados com sucesso para a Central M1 Brasil.
            </p>
          </div>

          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100 text-left text-xs text-slate-600 space-y-3">
            <p className="font-semibold text-slate-700 text-center border-b border-slate-200 pb-1.5">Resumo das Credenciais Salvas</p>
            <div className="flex justify-between">
              <span>CPF:</span>
              <span className="font-medium text-slate-800">{provider?.cpf || provider?.documentNumber}</span>
            </div>
            <div className="flex justify-between">
              <span>Tipo Sanguíneo:</span>
              <span className="font-medium text-slate-800">{provider?.bloodType || 'N/I'}</span>
            </div>
            <div className="flex justify-between">
              <span>Serviços Selecionados:</span>
              <span className="font-medium text-slate-800">
                {provider?.providedServices?.map(id => {
                  const cat = categories.find(c => c.id === id);
                  return cat ? cat.name : id;
                }).join(', ') || 'Nenhum'}
              </span>
            </div>
            <div className="flex justify-between">
              <span>Certificados:</span>
              <span className="font-medium text-emerald-600">✓ {provider?.certificates?.length || 0} anexo(s)</span>
            </div>
          </div>

          <p className="text-xs text-slate-400">
            Nossos analistas estão verificando seus certificados e antecedentes de segurança. Assim que concluído, o Administrador autorizará seu acesso de chamados no painel.
          </p>

          <div className="flex flex-col gap-2 pt-2">
            <a 
              href="https://wa.me/5511999999999?text=Olá,%20gostaria%20de%20saber%20sobre%20a%20homologação%20do%20meu%20cadastro%20na%20M1"
              target="_blank"
              referrerPolicy="no-referrer"
              className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg text-sm font-bold transition-all shadow-sm"
            >
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.724-1.457L0 24zm6.59-4.846c1.6.95 3.188 1.449 4.825 1.451 5.436 0 9.86-4.37 9.864-9.799.002-2.63-1.023-5.101-2.885-6.965C16.528 1.977 14.07 1.95 12.01 1.95c-5.439 0-9.865 4.37-9.869 9.802-.001 1.77.463 3.5 1.34 5.032l-.43 1.572 1.606-.412z" />
              </svg>
              Contatar Suporte M1 (WhatsApp)
            </a>

            <button 
              onClick={() => logoutProvider()} 
              className="w-full px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-lg text-sm font-semibold transition-colors border border-slate-200"
            >
              Sair do Painel
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // LICENÇA DE ACESSO RECORRENTE (APÓS CADASTRO COMPLETO E LIBERADO)
  // -------------------------------------------------------------------------
  if (provider && !provider.registrationFeePaid) {
    const feeAmount = settings.providerLicenseFee || 120;
    const feePeriod = settings.providerLicenseFeePeriod || 'monthly';
    const periodLabel = 
      feePeriod === 'daily' ? 'Diária' :
      feePeriod === 'weekly' ? 'Semanal' :
      feePeriod === 'monthly' ? 'Mensal' : 'Única (Ativação)';

    return (
      <div className="min-h-[85vh] flex items-center justify-center px-4 py-10 animate-fade-in" id="provider-license-payment-screen">
        <div className="w-full max-w-lg bg-slate-900 border-2 border-emerald-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl space-y-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-72 h-72 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="text-center space-y-2">
            <div className="inline-flex p-3.5 rounded-2xl bg-amber-500/10 border border-amber-500/30 text-amber-400 mb-1">
              <ShieldAlert className="w-8 h-8 animate-pulse" />
            </div>
            <h2 className="text-xl sm:text-2xl font-black text-white tracking-wide">
              Pagamento de Licença de Acesso
            </h2>
            <p className="text-xs text-slate-400 font-sans">
              Olá, <strong className="text-white">{provider.name}</strong>. Para começar a receber ordens de serviço em tempo real na plataforma M1, efetue o pagamento da sua taxa de licença de acesso (<strong className="text-emerald-400">{periodLabel.toLowerCase()}</strong>).
            </p>
          </div>

          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 sm:p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <span className="text-xs text-slate-400 font-bold uppercase">Valor da Cobrança / Licença</span>
              <span className="text-lg font-black text-emerald-400 font-mono">R$ {feeAmount.toFixed(2)} ({periodLabel})</span>
            </div>

            <div className="space-y-2 text-xs">
              <p className="text-slate-300 font-bold">Instruções para Pagamento via PIX:</p>
              <div className="space-y-1.5 font-sans bg-slate-900/60 p-3 rounded-xl border border-slate-800 text-[11px]">
                <div className="flex justify-between">
                  <span className="text-slate-500">Chave PIX ({settings.pixReceiverType || 'E-mail'}):</span>
                  <span className="text-white font-mono font-bold select-all">{settings.pixReceiverKey || 'rogerio@m1br.com.br'}</span>
                </div>
                {settings.pixReceiverCnpj && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">CNPJ:</span>
                    <span className="text-white font-mono font-bold select-all">{settings.pixReceiverCnpj}</span>
                  </div>
                )}
                <div className="flex justify-between">
                  <span className="text-slate-500">Beneficiário:</span>
                  <span className="text-white font-bold">{settings.pixReceiverName || 'M1 BRASIL SERVICOS TECNICOS'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-500">Instituição:</span>
                  <span className="text-white font-bold">{settings.pixReceiverBank || 'Banco Inter'}</span>
                </div>
                {settings.pixReceiverAgency && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Agência:</span>
                    <span className="text-white font-mono font-bold">{settings.pixReceiverAgency}</span>
                  </div>
                )}
                {settings.pixReceiverAccount && (
                  <div className="flex justify-between">
                    <span className="text-slate-500">Conta Corrente:</span>
                    <span className="text-white font-mono font-bold">{settings.pixReceiverAccount}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Simulated PIX QR Code or copy/paste key */}
            <div className="bg-emerald-500/5 border border-emerald-500/20 p-3.5 rounded-xl text-center space-y-1">
              <p className="text-[10px] text-emerald-400 font-black uppercase tracking-wider">Código de Cópia Pix Gerado</p>
              <input
                type="text"
                readOnly
                value={`00020126580014br.gov.pix0118${settings.pixReceiverKey || 'rogerio@m1br.com.br'}5204000053039865405${feeAmount.toFixed(2)}5802BR5925M1_SERVICOS6009SAO_PAULO62070503***6304`}
                className="w-full text-center bg-slate-900/80 border border-slate-800 rounded-lg p-2 font-mono text-[9px] text-slate-400 select-all focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-2">
            <button
              onClick={() => {
                addOrUpdateProvider({
                  ...provider,
                  paymentPendingValidation: true
                });
                alert("🎉 Comprovante informado com sucesso! Sua solicitação de ativação foi enviada para a central de atendimento e homologação da M1 para liberação imediata.");
              }}
              className="w-full py-3.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-sm rounded-xl transition-all shadow-lg shadow-amber-500/20 flex items-center justify-center gap-2 cursor-pointer animate-pulse"
            >
              <CheckCircle2 className="w-4.5 h-4.5" />
              <span>Confirmar Pagamento PIX e Solicitar Liberação</span>
            </button>

            <button
              onClick={handleLogout}
              className="w-full py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white rounded-xl font-bold uppercase text-xs cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sair da Conta (Desconectar)</span>
            </button>
          </div>
        </div>
      </div>
    );
  }

  // -------------------------------------------------------------------------
  // 2. AUTHENTICATED PROVIDER DASHBOARD & WORKFLOW
  // -------------------------------------------------------------------------
  return (
    <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8 py-6 space-y-6">

      {/* 🟡 TELA AMARELA DO PRESTADOR: ALERTA PERMANENTE NO TOPO AGUARDANDO CONFIRMAÇÃO DE PAGAMENTO PELO ADMIN */}
      {activeJob && activeJob.status === 'aguardando_confirmacao_pagamento' && (
        <div className="w-full bg-yellow-400 border-4 border-yellow-300 text-slate-950 p-4 sm:p-5 rounded-3xl shadow-[0_0_50px_rgba(250,204,21,0.5)] flex flex-col sm:flex-row items-center justify-between gap-4 animate-pulse">
          <div className="flex items-center gap-3.5">
            <div className="w-12 h-12 rounded-2xl bg-slate-950 text-yellow-400 flex items-center justify-center shrink-0 shadow-md">
              <AlertTriangle className="w-7 h-7 stroke-[3]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2 py-0.5 rounded-md bg-slate-950 text-yellow-400 font-mono font-black text-[10px] uppercase">
                  🟡 TELA AMARELA ATIVADA
                </span>
                <span className="font-mono text-xs font-black text-slate-900">
                  Chamado {activeJob.code}
                </span>
              </div>
              <h4 className="text-sm sm:text-base font-black uppercase text-slate-950 mt-0.5">
                AGUARDANDO CONFIRMAÇÃO DE PAGAMENTO PELO ADMIN
              </h4>
              <p className="text-[11px] font-bold text-slate-900 leading-tight">
                O cliente concluiu o atendimento e pagou. A Central M1 está confirmando a conciliação da taxa para liberar o encerramento.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => setDismissedFeeModalId(null)}
            className="px-5 py-2.5 bg-slate-950 hover:bg-slate-900 text-yellow-400 font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg cursor-pointer shrink-0 transition-transform active:scale-95 flex items-center gap-2"
          >
            <span>Ver Dados da Taxa Pix</span>
          </button>
        </div>
      )}

      {/* ⚠️ MODAL TELA AMARELA: PAGAMENTO DIRETO AO PRESTADOR E TRANSFERÊNCIA DA TAXA M1 */}
      {activeJob && activeJob.status === 'aguardando_confirmacao_pagamento' && dismissedFeeModalId !== activeJob.id && (
        <div className="fixed inset-0 bg-yellow-950/80 backdrop-blur-xl z-[100] flex items-center justify-center p-4 overflow-y-auto animate-fade-in">
          <div className="bg-yellow-950/95 border-4 border-yellow-400 w-full max-w-lg rounded-3xl p-6 shadow-[0_0_100px_rgba(250,204,21,0.65)] relative text-left text-white max-h-[85vh] flex flex-col overflow-hidden">
            
            {/* Header controls: Yellow Status Badge & Close button */}
            <div className="flex items-center justify-between pb-4 border-b border-yellow-500/20 shrink-0">
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-yellow-400 text-slate-950 rounded-full font-black text-[11px] uppercase tracking-widest shadow-md">
                <span className="w-2.5 h-2.5 rounded-full bg-slate-950 animate-ping" />
                <span>🟡 TELA AMARELA: AGUARDANDO ADMIN</span>
              </div>
              <button
                onClick={() => setDismissedFeeModalId(activeJob.id)}
                className="p-1.5 text-yellow-300 hover:text-white rounded-lg hover:bg-yellow-900/60 transition-colors cursor-pointer"
                title="Minimizar janela"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Scrollable Content Body */}
            <div className="flex-1 overflow-y-auto py-4 space-y-5 pr-1.5 scrollbar-thin scrollbar-thumb-yellow-600">
              {/* Pulsing Yellow Banner */}
              <div className="bg-yellow-400/20 border-2 border-yellow-400 p-3.5 rounded-2xl space-y-1">
                <h3 className="text-base sm:text-lg font-black text-yellow-300 uppercase tracking-tight leading-tight flex items-center gap-2">
                  <AlertTriangle className="w-5 h-5 text-yellow-400 shrink-0" />
                  <span>AGUARDANDO CONFIRMAÇÃO DE PAGAMENTO PELO ADMIN</span>
                </h3>
                <p className="text-xs text-yellow-100/90 leading-relaxed font-sans">
                  O cliente concluiu o atendimento e efetuou o pagamento diretamente a você. Transfira a porcentagem indicada abaixo à Central M1 para confirmação final pelo Administrador.
                </p>
              </div>

              {/* Split Financial Values Information */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-3 text-xs">
                <div className="flex justify-between items-center text-slate-400 border-b border-slate-800 pb-2">
                  <span className="font-bold uppercase tracking-wider text-[10px]">Chamado Associado</span>
                  <span className="font-mono text-white font-black">{activeJob.code}</span>
                </div>
                
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 font-bold">Valor Total Pago pelo Cliente:</span>
                  <span className="text-emerald-400 font-black font-mono">
                    R$ {(activeJob.payment.totalAmount + (activeJob.rating?.tipAmount || 0)).toFixed(2)}
                  </span>
                </div>

                {activeJob.payment.clientPaymentMethod && (
                  <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800/60 pt-1.5">
                    <span>Método de Pagamento Utilizado:</span>
                    <span className="font-bold text-slate-200 capitalize">
                      {activeJob.payment.clientPaymentMethod === 'pix' ? 'Pix Direto' : activeJob.payment.clientPaymentMethod === 'dinheiro' ? 'Dinheiro Físico' : 'Cartão na Maquininha'}
                    </span>
                  </div>
                )}

                <div className="flex justify-between items-center text-sm border-t border-slate-800 pt-2 bg-amber-500/10 -mx-4 px-4 py-2 rounded-xl">
                  <div>
                    <span className="text-amber-300 font-black block">Taxa da Plataforma M1 (A Transferir):</span>
                    <span className="text-[10px] text-amber-400/80">Porcentagem indicada do serviço</span>
                  </div>
                  <span className="text-amber-300 font-black font-mono text-base">
                    R$ {activeJob.payment.platformFeeAmount.toFixed(2)}
                  </span>
                </div>

                <div className="flex justify-between items-center text-xs text-slate-400 border-t border-slate-800 pt-2">
                  <span>Seu Ganho Líquido Retido com Você:</span>
                  <span className="text-slate-200 font-black font-mono">
                    R$ {(activeJob.payment.providerPayoutAmount + (activeJob.rating?.tipAmount || 0)).toFixed(2)}
                  </span>
                </div>
              </div>

              {/* M1 Brasil Pix Data Box */}
              <div className="bg-slate-950 rounded-2xl border border-slate-800 p-4 space-y-2.5 text-xs">
                <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider flex items-center gap-1.5">
                  <Zap className="w-3.5 h-3.5" />
                  Dados Pix da Central M1 para Transferência da Taxa
                </span>
                
                <div className="space-y-1 bg-slate-900/80 p-3 rounded-xl border border-slate-850">
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Favorecido:</span>
                    <span className="font-bold text-slate-200">M1 BRASIL SERVICOS TECNICOS LTDA</span>
                  </div>
                  <div className="flex justify-between items-center text-[11px]">
                    <span className="text-slate-400">Chave Pix (E-mail):</span>
                    <span className="font-mono font-bold text-emerald-400">rogerio@m1br.com.br</span>
                  </div>
                </div>

                <button
                  onClick={() => {
                    navigator.clipboard.writeText('rogerio@m1br.com.br');
                    setCopiedM1Pix(true);
                    setTimeout(() => setCopiedM1Pix(false), 3000);
                  }}
                  className="w-full py-2 px-3 bg-slate-900 hover:bg-slate-800 border border-slate-700 text-amber-300 rounded-xl font-bold text-xs flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>{copiedM1Pix ? '✓ Chave Pix Copiada com Sucesso!' : 'Copiar Chave Pix da M1 (rogerio@m1br.com.br)'}</span>
                </button>
              </div>

              {/* Provider Action Status */}
              {activeJob.payment.providerTransferredFee ? (
                <div className="p-4 rounded-2xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs space-y-1.5">
                  <div className="flex items-center gap-2 font-black text-sm">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span>Transferência da Taxa M1 Informada!</span>
                  </div>
                  <p className="text-[11px] text-slate-300">
                    Você já confirmou a transferência da taxa de R$ {activeJob.payment.platformFeeAmount.toFixed(2)}. O Administrador foi notificado e fará a confirmação definitiva no Painel de Chamados.
                  </p>
                </div>
              ) : (
                <button
                  onClick={() => {
                    providerNotifyFeeTransferred(activeJob.id);
                    soundManager.playCashRegister();
                  }}
                  className="w-full py-3.5 px-4 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-emerald-900/30 flex items-center justify-center gap-2 transition-all cursor-pointer"
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Confirmar que Já Efetuei a Transferência da Taxa M1</span>
                </button>
              )}
            </div>

            {/* Sticky Action Footer */}
            <div className="pt-4 border-t border-slate-800 shrink-0 flex justify-between items-center text-[10px] text-slate-400">
              <span>M1 Brasil Serviços • Intermediação Segura</span>
              <button
                onClick={() => setDismissedFeeModalId(activeJob.id)}
                className="text-amber-400 hover:underline cursor-pointer font-bold"
              >
                Minimizar e Ver Histórico
              </button>
            </div>

          </div>
        </div>
      )}

      {/* Top Provider Status Bar */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 sm:p-5 shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <img
            src={provider.avatar || provider.documents?.facePhoto || provider.documents?.facePhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
            alt={provider.name}
            className="w-12 h-12 rounded-2xl object-cover border-2 border-emerald-500/40"
          />
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base sm:text-lg font-black text-white">{provider.name}</h2>
              <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                Credenciado
              </span>
            </div>
            <p className="text-xs text-slate-400">
              {provider.vehicleModel} • {provider.categories.join(', ')} • ⭐ {provider.rating.toFixed(2)}
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-2 self-stretch sm:self-auto justify-end">
          {/* Online Toggle */}
          <button
            onClick={toggleProviderOnline}
            className={`px-4 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2 cursor-pointer shadow-md ${
              provider.isOnline
                ? 'bg-emerald-500 text-slate-950 shadow-emerald-500/20 hover:bg-emerald-450'
                : 'bg-rose-600 text-white shadow-rose-600/20 hover:bg-rose-500'
            }`}
          >
            <span className={`w-2.5 h-2.5 rounded-full ${provider.isOnline ? 'bg-slate-950' : 'bg-white'}`} />
            <span>{provider.isOnline ? 'ON LINE' : 'OFF LINE'}</span>
          </button>

          {/* Pix Wallet Pill */}
          <button
            onClick={() => setIsWithdrawModalOpen(true)}
            className="px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-emerald-500/50 text-xs font-bold text-emerald-400 flex items-center gap-1.5 cursor-pointer"
          >
            <Wallet className="w-3.5 h-3.5 text-emerald-400" />
            <span>R$ {provider.walletBalance.toFixed(2)}</span>
          </button>

          {/* Central de Notificações & SPAMs Bell */}
          <button
            onClick={() => setIsNotificationCenterOpen(true)}
            className="relative p-2 rounded-xl bg-slate-950 border border-slate-800 hover:border-amber-500 text-amber-400 cursor-pointer shadow-md transition-all flex items-center gap-1.5"
            title="Central de Notificações & SPAMs M1"
          >
            <Bell className="w-4 h-4" />
            {(allPendingAlertJobs.length + (activeJob && activeJob.status === 'aguardando_confirmacao_pagamento' ? 1 : 0) + recentCanceledJobs.length) > 0 && (
              <span className="flex items-center justify-center px-1.5 py-0.2 bg-rose-600 text-white font-mono text-[10px] font-black rounded-full animate-pulse border border-white/30">
                {allPendingAlertJobs.length + (activeJob && activeJob.status === 'aguardando_confirmacao_pagamento' ? 1 : 0) + recentCanceledJobs.length}
              </span>
            )}
          </button>

          {/* Settings */}
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
            title="Configurações de Raio e Categorias"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Logout */}
          <button
            onClick={handleLogout}
            className="p-2 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 cursor-pointer"
            title="Sair da Conta do Prestador"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 🚨 TARJA PERMANENTE DE ALERTA SPAM NO PAINEL DO PRESTADOR */}
      {pendingAlertJob && (
        <div
          className={`border-2 rounded-2xl p-4 shadow-2xl flex flex-col md:flex-row items-center justify-between gap-4 transition-all ${
            countdown < 60
              ? 'bg-rose-950/80 border-rose-500 shadow-rose-600/30 animate-pulse'
              : 'bg-gradient-to-r from-amber-950/90 via-slate-950 to-amber-950/90 border-amber-500 shadow-amber-500/25'
          }`}
          id="provider-persistent-spam-banner"
        >
          <div className="flex items-center gap-3.5 text-left w-full md:w-auto">
            <div className="relative shrink-0">
              <div className="w-11 h-11 rounded-2xl bg-amber-500/20 border border-amber-400/50 flex items-center justify-center text-amber-400 shadow-lg">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <span className="w-3 h-3 rounded-full bg-rose-500 absolute -top-1 -right-1 animate-ping" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-500 text-slate-950">
                  {pendingAlertJob.status === 'despachado_prestador' || pendingAlertJob.status === 'valor_aprovado_cliente'
                    ? '🚨 SPAM: CHAMADO EXCLUSIVO DESPACHADO'
                    : '⚡ SPAM RADAR: CHAMADO DISPONÍVEL'}
                </span>
                <span className="text-xs font-mono font-bold text-slate-300">
                  Código: <strong className="text-white">{pendingAlertJob.code}</strong>
                </span>
                <span className={`text-[11px] font-mono font-black px-2 py-0.5 rounded-full border ${
                  countdown < 60
                    ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                    : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                }`}>
                  <Clock className="w-3 h-3 inline mr-1" />
                  SLA: {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}
                </span>
              </div>
              <p className="text-xs text-slate-200 mt-1">
                <strong className="text-white">{pendingAlertJob.title}</strong> • Bairro <strong className="text-emerald-400">{pendingAlertJob.address?.neighborhood}</strong> • Repasse Líquido Garantido: <strong className="text-emerald-400 font-mono text-sm">R$ {pendingAlertJob.estimatedPrice.toFixed(2)}</strong>
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto shrink-0 justify-end">
            <button
              type="button"
              onClick={() => {
                setDismissedSpamIds(prev => ({ ...prev, [pendingAlertJob.id]: false }));
                soundManager.playIncomingJobAlert();
              }}
              className="flex-1 md:flex-initial px-5 py-2.5 bg-amber-500 hover:bg-amber-450 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/30 cursor-pointer transition-all flex items-center justify-center gap-1.5"
            >
              <span>🚨 ABRIR NOTIFICAÇÃO SPAM</span>
              <ChevronRight className="w-4 h-4 stroke-[3]" />
            </button>
            <button
              type="button"
              onClick={() => setRejectReasonModalJob(pendingAlertJob)}
              className="px-3.5 py-2.5 bg-slate-900 hover:bg-rose-950/40 text-rose-400 hover:text-rose-300 border border-slate-800 rounded-xl text-xs font-bold uppercase cursor-pointer"
            >
              Recusar
            </button>
          </div>
        </div>
      )}

      {/* 🚨 SPAM DE INTERAÇÃO DO PRESTADOR: "A CAMINHO", "CHEGUEI NO LOCAL", "RELATÓRIO DA ATIVIDADE", "ENVIAR RELATÓRIO" */}
      {isInteractionSpamOpen && activeJob && provider && (
        <ProviderInteractionSpamModal
          job={activeJob}
          provider={provider}
          isOpen={isInteractionSpamOpen}
          onClose={() => setIsInteractionSpamOpen(false)}
          onArrived={(srvId) => markProviderArrived(srvId)}
          onStartExecution={(srvId) => startServiceExecution(srvId)}
          onSubmitReport={(srvId, rep) => submitPhotoReport(srvId, rep)}
          onUpdateEta={(srvId, eta) => markProviderOnTheWay(srvId, eta)}
          onNotifyFeeTransferred={(srvId) => providerNotifyFeeTransferred(srvId)}
        />
      )}

      {/* 🚨 MODAL OVERLAY DE ALERTA SPAM DE ALTA PRIORIDADE DO PRESTADOR */}
      {isSpamModalOpen && pendingAlertJob && (
        <div className="fixed inset-0 z-[999990] bg-black/94 backdrop-blur-xl flex justify-center items-center p-3 sm:p-5 overflow-y-auto animate-in fade-in duration-200">
          <div className="bg-slate-950 border-3 border-amber-500 rounded-3xl max-w-2xl w-full max-h-[85vh] flex flex-col shadow-[0_0_90px_rgba(245,158,11,0.35)] relative text-left overflow-hidden modal-crisp">
            
            {/* Top Bar with Pulsing Beacon & SLA Timer - PINNED HEADER */}
            <div className="p-4 sm:p-5 border-b border-slate-850 shrink-0 bg-slate-950 space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="relative shrink-0">
                    <span className="w-4 h-4 rounded-full bg-amber-500 block animate-ping absolute inset-0" />
                    <span className="w-4 h-4 rounded-full bg-amber-500 block relative shadow-md shadow-amber-500/50" />
                  </div>
                  <div>
                    <h3 className="text-xs sm:text-sm font-black uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                      <AlertTriangle className="w-4 h-4 text-amber-400" />
                      <span>
                        {pendingAlertJob.status === 'despachado_prestador' || pendingAlertJob.status === 'valor_aprovado_cliente'
                          ? '🚨 SPAM URGENTE • CHAMADO EXCLUSIVO DESPACHADO'
                          : '⚡ SPAM RADAR • NOVO CHAMADO DISPONÍVEL'}
                      </span>
                    </h3>
                    <p className="text-[11px] font-mono text-slate-400">
                      Chamado: <strong className="text-white">{pendingAlertJob.code}</strong> • Central M1 Brasil
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <div className={`flex items-center gap-1.5 font-mono text-xs font-black px-3 py-1.5 rounded-full border ${
                    countdown < 60
                      ? 'bg-rose-500/20 text-rose-400 border-rose-500/50 animate-pulse'
                      : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
                  }`}>
                    <Clock className="w-3.5 h-3.5 shrink-0" />
                    <span>SLA: {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')}</span>
                  </div>
                </div>
              </div>

              {/* SLA Progress Bar */}
              <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-850">
                <div
                  className={`h-full transition-all duration-1000 ${
                    countdown < 60 ? 'bg-rose-500' : countdown < 150 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${Math.min(100, (countdown / 300) * 100)}%` }}
                />
              </div>
            </div>

            {/* SCROLLABLE BODY */}
            <div className="p-4 sm:p-6 overflow-y-auto flex-1 space-y-4 scrollbar-thin text-slate-200">
              {/* Content Details: Todas as informações necessárias */}
              <div className="bg-slate-900/80 border border-slate-800 p-4 sm:p-5 rounded-2xl space-y-3.5">
              <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                <div className="space-y-1">
                  <span className="text-[10px] uppercase font-black px-2.5 py-1 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30">
                    {pendingAlertJob.category.toUpperCase()}
                  </span>
                  <h4 className="text-lg sm:text-xl font-black text-white font-sans mt-1.5 leading-snug">
                    {pendingAlertJob.title}
                  </h4>
                  <div className="flex items-center gap-1.5 text-xs text-slate-300 pt-0.5">
                    <MapPin className="w-4 h-4 text-emerald-400 shrink-0" />
                    <span>Região / Bairro: <strong className="text-white">{pendingAlertJob.address?.neighborhood}</strong>, {pendingAlertJob.address?.city}</span>
                  </div>
                </div>

                <div className="w-full sm:w-auto text-left sm:text-right shrink-0 bg-slate-950 p-3.5 rounded-2xl border border-emerald-500/40 shadow-inner">
                  <span className="text-[9px] uppercase tracking-wider text-slate-400 font-bold block">
                    Repasse Líquido ao Prestador
                  </span>
                  <span className="font-mono text-2xl sm:text-3xl font-black text-emerald-400 block leading-tight">
                    R$ {pendingAlertJob.estimatedPrice.toFixed(2)}
                  </span>
                  <span className="text-[9px] text-emerald-500/80 font-bold block mt-0.5">
                    100% Livre de Taxas • Creditado na Carteira Pix
                  </span>
                </div>
              </div>

              {/* Descrição Completa do Problema */}
              <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-850 space-y-1">
                <span className="text-[10px] uppercase font-black tracking-wider text-slate-400 block">
                  Descrição Fornecida pelo Cliente:
                </span>
                <p className="text-xs text-slate-200 leading-relaxed font-sans">
                  {pendingAlertJob.description || 'Sem descrição detalhada adicional informada pelo cliente.'}
                </p>
              </div>

              {/* Fotos e Vídeos Anexados pelo Cliente */}
              {pendingAlertJob.media && pendingAlertJob.media.length > 0 ? (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-bold text-slate-300 flex items-center gap-1.5">
                      <Camera className="w-3.5 h-3.5 text-amber-400" />
                      <span>Fotos & Vídeos do Local do Serviço ({pendingAlertJob.media.length}):</span>
                    </span>
                    <span className="text-[10px] text-slate-400">Clique para inspecionar em tela cheia</span>
                  </div>
                  <div className="flex gap-2.5 overflow-x-auto pb-1.5 pt-1 scrollbar-thin">
                    {pendingAlertJob.media.map((med, idx) => (
                      <div
                        key={idx}
                        onClick={() => setZoomedPhotoUrl(med.url)}
                        className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl overflow-hidden border-2 border-slate-750 hover:border-amber-400 cursor-pointer shrink-0 group transition-all shadow-md"
                      >
                        <img
                          src={med.url}
                          alt={`Mídia ${idx + 1}`}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                        />
                        <span className="absolute bottom-1 right-1 px-1.5 py-0.5 rounded text-[8px] font-black uppercase bg-black/85 text-white backdrop-blur-xs">
                          {med.type === 'video' ? '📹 Vídeo' : '📷 Foto'}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              ) : (
                <div className="text-[11px] text-slate-500 italic bg-slate-950/70 p-2.5 rounded-xl border border-slate-850">
                  Nenhuma foto ou vídeo anexado pelo cliente para este chamado.
                </div>
              )}

              {/* Aviso de Proteção de Dados e Integridade M1 */}
              <div className="p-3.5 rounded-2xl bg-slate-950 border border-slate-800 text-[11px] text-slate-300 flex items-start gap-3">
                <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <p className="text-white font-black uppercase text-xs tracking-wide">
                    🔒 DADOS PESSOAIS PROTEGIDOS PELA CENTRAL M1
                  </p>
                  <p className="text-[10.5px] text-slate-400 leading-relaxed font-sans">
                    Para sua segurança e privacidade do usuário, <strong>Nome, WhatsApp, Nome da Rua, Número da Casa e Foto do Cliente</strong> permanecem estritamente ocultos. Você visualiza a descrição da atividade, fotos/vídeos originais, bairro e o valor aprovado. Os dados completos de rota serão desbloqueados após a confirmação.
                  </p>
                </div>
              </div>
            </div>

            {/* Tempo Estimado de Chegada (ETA) */}
            <div className="bg-slate-900/90 border border-slate-800 p-4 rounded-2xl space-y-2.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-bold text-slate-200 flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-emerald-400" />
                  <span>Em quantos minutos você chega ao local do atendimento?</span>
                </label>
                <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-xl border border-slate-800">
                  <input
                    type="number"
                    min="1"
                    max="180"
                    value={proposedETA}
                    onChange={(e) => setProposedETA(Math.max(1, Number(e.target.value)))}
                    className="w-12 bg-transparent text-sm text-white font-mono font-bold text-right outline-none"
                  />
                  <span className="text-xs text-emerald-400 font-mono font-bold">min</span>
                </div>
              </div>

              {/* Botões rápidos de ETA */}
              <div className="flex flex-wrap gap-1.5">
                {[10, 15, 20, 30, 45, 60].map((presetMin) => (
                  <button
                    key={presetMin}
                    type="button"
                    onClick={() => setProposedETA(presetMin)}
                    className={`px-3 py-1.5 text-xs font-mono font-bold rounded-xl transition-all cursor-pointer ${
                      proposedETA === presetMin
                        ? 'bg-emerald-500 text-slate-950 font-black shadow-md shadow-emerald-500/25'
                        : 'bg-slate-950 text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {presetMin} min
                  </button>
                ))}
              </div>
            </div>

            {/* Questionamento ou Dúvida à Central M1 */}
            <div className="bg-slate-900/50 p-3 rounded-xl border border-slate-850">
              {!showQuestionInput ? (
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-400">Dúvida sobre o chamado ou condições?</span>
                  <button
                    type="button"
                    onClick={() => setShowQuestionInput(true)}
                    className="text-amber-400 hover:text-amber-300 font-bold underline cursor-pointer"
                  >
                    Questionar valor ou enviar dúvida à Central
                  </button>
                </div>
              ) : (
                <div className="space-y-2">
                  <label className="text-xs text-slate-300 font-bold block">
                    Digite sua dúvida sobre o chamado ou contraproposta para a Central M1:
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      value={questionText}
                      onChange={(e) => setQuestionText(e.target.value)}
                      placeholder="Ex: Solicito esclarecimento sobre o defeito ou contraproposta"
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500"
                    />
                    <button
                      type="button"
                      onClick={() => {
                        if (questionText.trim()) {
                          providerQuestionDispatchedService(pendingAlertJob.id, questionText.trim());
                          setQuestionSuccessFeedback('Questionamento enviado à Central M1 com sucesso!');
                          setQuestionText('');
                          setTimeout(() => setQuestionSuccessFeedback(''), 4000);
                          setShowQuestionInput(false);
                        }
                      }}
                      className="px-4 py-2 bg-amber-500 hover:bg-amber-450 text-slate-950 font-black text-xs uppercase rounded-xl cursor-pointer"
                    >
                      Enviar
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => setShowQuestionInput(false)}
                    className="text-[10px] text-slate-500 hover:text-slate-400 underline"
                  >
                    Fechar campo de questionamento
                  </button>
                </div>
              )}
              {questionSuccessFeedback && (
                <p className="text-xs text-emerald-400 font-bold mt-1.5">{questionSuccessFeedback}</p>
              )}
            </div>

            {/* 🚨 ALARME VISUAL OBRIGATÓRIO: TERMO DE TAXA DE CANCELAMENTO DE 15% */}
            <div 
              className={`p-3.5 sm:p-4 rounded-2xl border-2 transition-colors text-left ${
                providerCancelFeeAgreed[pendingAlertJob.id]
                  ? 'bg-amber-950/40 border-amber-400 shadow-[0_0_20px_rgba(245,158,11,0.2)]'
                  : providerTermAlertTriggered[pendingAlertJob.id]
                    ? 'bg-red-950/90 border-red-500 ring-2 ring-red-500/50 shadow-[0_0_30px_rgba(239,68,68,0.4)]'
                    : 'bg-yellow-500/15 border-yellow-400 shadow-[0_0_25px_rgba(234,179,8,0.2)]'
              }`}
              id="provider-spam-cancel-fee-box"
            >
              <label className="flex items-start gap-3 cursor-pointer select-none">
                <input
                  type="checkbox"
                  checked={!!providerCancelFeeAgreed[pendingAlertJob.id]}
                  onChange={(e) => {
                    const checked = e.target.checked;
                    setProviderCancelFeeAgreed(prev => ({ ...prev, [pendingAlertJob.id]: checked }));
                    if (checked) {
                      soundManager.playSuccessChime();
                      setProviderTermAlertTriggered(prev => ({ ...prev, [pendingAlertJob.id]: false }));
                    }
                  }}
                  className="mt-0.5 w-5 h-5 rounded-md accent-yellow-400 text-yellow-400 focus:ring-yellow-400 cursor-pointer shrink-0"
                />
                <div className="space-y-1">
                  <div className="flex items-center gap-1.5 text-xs sm:text-sm font-black text-yellow-300 uppercase tracking-wide leading-tight">
                    <AlertTriangle className="w-4 h-4 text-yellow-400 shrink-0" />
                    <span>"ESTOU CIENTE QUE EM CASO DE CANCELAMENTO TEREI QUE PAGAR A TAXA DE 15% DO VALOR DO SERVIÇO"</span>
                  </div>
                  <p className="text-[10px] text-slate-300 leading-relaxed font-sans">
                    Regulamento operacional da Central M1. O cancelamento imotivado após aceitar o chamado sujeita o prestador à taxa de 15% referente a custos operacionais.
                  </p>
                </div>
              </label>
              {providerTermAlertTriggered[pendingAlertJob.id] && !providerCancelFeeAgreed[pendingAlertJob.id] && (
                <div className="mt-2 text-[11px] font-black text-red-400 uppercase tracking-wider bg-red-950/80 p-1.5 rounded-lg border border-red-500/60 flex items-center gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 text-red-400 shrink-0" />
                  <span>ATENÇÃO: Você deve concordar com o termo da taxa de 15% para aceitar o chamado!</span>
                </div>
              )}
            </div>

          </div>

          {/* PINNED FOOTER: Ações: Aceitar / Recusar / Minimizar */}
          <div className="p-4 sm:p-5 border-t border-slate-850 bg-slate-950 shrink-0 flex flex-col gap-2">
            <div className="flex flex-col sm:flex-row gap-2.5">
              <button
                type="button"
                onClick={() => {
                  if (!providerCancelFeeAgreed[pendingAlertJob.id]) {
                    setProviderTermAlertTriggered(prev => ({ ...prev, [pendingAlertJob.id]: true }));
                    soundManager.playAdminAlarm();
                    return;
                  }
                  if (pendingAlertJob.status === 'despachado_prestador' || pendingAlertJob.status === 'valor_aprovado_cliente') {
                    providerAcceptDispatchedService(pendingAlertJob.id, proposedETA);
                  } else {
                    acceptServiceRequestDirectly(pendingAlertJob.id);
                  }
                  soundManager.playSuccessChime();
                  setDismissedSpamIds(prev => ({ ...prev, [pendingAlertJob.id]: true }));
                }}
                className={`flex-1 py-3.5 font-black text-xs uppercase tracking-wider rounded-2xl shadow-xl flex items-center justify-center gap-2 cursor-pointer transition-all ${
                  providerCancelFeeAgreed[pendingAlertJob.id]
                    ? 'bg-emerald-500 hover:bg-emerald-450 text-slate-950 shadow-emerald-500/25'
                    : 'bg-emerald-500/40 text-slate-950/60 hover:bg-emerald-500/50'
                }`}
              >
                <Check className="w-4 h-4 stroke-[3]" />
                <span>CONFIRMAR E ACEITAR CHAMADO</span>
              </button>

              <button
                type="button"
                onClick={() => setRejectReasonModalJob(pendingAlertJob)}
                className="py-3.5 px-6 bg-slate-900 hover:bg-rose-950/40 border border-slate-800 hover:border-rose-600/50 text-rose-400 hover:text-rose-300 font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer transition-all flex items-center justify-center gap-1.5"
              >
                <X className="w-4 h-4 stroke-[3]" />
                <span>RECUSAR</span>
              </button>
            </div>
          </div>

          </div>
        </div>
      )}

      {/* 🔴 MODAL DE SELEÇÃO DE MOTIVO DE RECUSA (RETORNO À CENTRAL M1 COM SPAM VERMELHO) */}
      {rejectReasonModalJob && (
        <div className="fixed inset-0 z-[999999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150">
          <div className="bg-slate-950 border-2 border-rose-600 rounded-3xl max-w-lg w-full p-6 shadow-2xl text-left max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center gap-3 text-rose-500 border-b border-slate-850 pb-3 shrink-0">
              <div className="w-10 h-10 rounded-xl bg-rose-600/20 border border-rose-500/40 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-500" />
              </div>
              <div>
                <h3 className="text-base font-black uppercase text-white">
                  Recusar Chamado {rejectReasonModalJob.code}
                </h3>
                <p className="text-xs text-rose-400 font-bold">
                  Este chamado retornará imediatamente à Central M1 com SPAM Vermelho para providências.
                </p>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto py-3 space-y-2.5 text-xs pr-1.5 scrollbar-thin">
              <label className="font-bold text-slate-300 block">
                Selecione o motivo da recusa para informar ao Administrador:
              </label>
              {[
                'Muito distante da minha localização atual',
                'Não possuo ferramentas ou peças para este serviço no momento',
                'Horário incompatível com minha agenda de hoje',
                'Valor proposto incompatível com a complexidade informada',
                'Outro motivo (especificar)'
              ].map((reason) => (
                <label
                  key={reason}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    selectedRejectReason === reason
                      ? 'bg-rose-950/30 border-rose-500 text-white font-bold'
                      : 'bg-slate-900 border-slate-800 text-slate-300 hover:border-slate-700'
                  }`}
                >
                  <input
                    type="radio"
                    name="rejectReason"
                    checked={selectedRejectReason === reason}
                    onChange={() => setSelectedRejectReason(reason)}
                    className="accent-rose-500"
                  />
                  <span>{reason}</span>
                </label>
              ))}

              {selectedRejectReason === 'Outro motivo (especificar)' && (
                <textarea
                  value={customRejectReason}
                  onChange={(e) => setCustomRejectReason(e.target.value)}
                  placeholder="Descreva detalhadamente o motivo da recusa..."
                  rows={2}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl p-3 text-xs text-white placeholder-slate-500 outline-none focus:border-rose-500 mt-2 font-sans"
                />
              )}
            </div>

            <div className="flex gap-2.5 pt-3 border-t border-slate-850 shrink-0">
              <button
                type="button"
                onClick={() => setRejectReasonModalJob(null)}
                className="flex-1 py-3 bg-slate-900 hover:bg-slate-850 text-slate-300 font-bold text-xs uppercase rounded-xl border border-slate-850 cursor-pointer"
              >
                Voltar ao Chamado
              </button>
              <button
                type="button"
                onClick={() => {
                  const finalReason = selectedRejectReason === 'Outro motivo (especificar)'
                    ? (customRejectReason.trim() || 'Recusado pelo prestador')
                    : selectedRejectReason;
                  providerRejectDispatchedService(rejectReasonModalJob.id, finalReason);
                  setRejectReasonModalJob(null);
                  setDismissedSpamIds(prev => ({ ...prev, [rejectReasonModalJob.id]: true }));
                }}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white font-black text-xs uppercase rounded-xl shadow-lg shadow-rose-600/30 cursor-pointer"
              >
                Confirmar Recusa
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 🔍 MODAL DE ZOOM DE FOTO / VÍDEO DO CHAMADO */}
      {zoomedPhotoUrl && (
        <div
          className="fixed inset-0 z-[9999999] bg-black/95 backdrop-blur-md flex items-center justify-center p-4 cursor-pointer animate-in fade-in duration-150"
          onClick={() => setZoomedPhotoUrl(null)}
        >
          <div className="relative max-w-4xl max-h-[90vh] p-2" onClick={(e) => e.stopPropagation()}>
            <img
              src={zoomedPhotoUrl}
              alt="Mídia Ampliada"
              className="max-w-full max-h-[85vh] rounded-2xl object-contain border border-slate-700 shadow-2xl"
            />
            <button
              onClick={() => setZoomedPhotoUrl(null)}
              className="absolute -top-3 -right-3 p-2 bg-slate-900 text-white rounded-full border border-slate-700 hover:bg-rose-600 cursor-pointer shadow-lg"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>
      )}

      {/* 🔔 MODAL CENTRAL DE NOTIFICAÇÕES & HISTÓRICO DE SPAMS */}
      {isNotificationCenterOpen && (
        <div className="fixed inset-0 z-[999980] bg-black/85 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-150 text-left">
          <div className="bg-slate-950 border border-slate-800 rounded-3xl max-w-xl w-full p-5 sm:p-6 shadow-2xl max-h-[85vh] flex flex-col overflow-hidden">
            <div className="flex items-center justify-between border-b border-slate-850 pb-3 shrink-0">
              <div className="flex items-center gap-2.5 text-amber-400">
                <Bell className="w-5 h-5" />
                <h3 className="text-base font-black uppercase text-white">
                  Central de Notificações & SPAMs M1
                </h3>
              </div>
              <button
                onClick={() => setIsNotificationCenterOpen(false)}
                className="p-1.5 text-slate-400 hover:text-white rounded-lg bg-slate-900 border border-slate-800 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto py-2 space-y-3 pr-1 scrollbar-thin">
              {/* Chamados Pendentes */}
              {allPendingAlertJobs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-amber-400 tracking-wider block">
                    🚨 Chamados Pendentes de Resposta ({allPendingAlertJobs.length}):
                  </span>
                  {allPendingAlertJobs.map(job => (
                    <div
                      key={job.id}
                      className="bg-slate-900 border border-amber-500/40 p-3 rounded-2xl flex items-center justify-between gap-3"
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-amber-500/20 text-amber-300">
                            {job.category}
                          </span>
                          <span className="text-xs font-bold text-white">{job.code}</span>
                        </div>
                        <p className="text-xs text-slate-300 font-sans mt-0.5">{job.title}</p>
                        <p className="text-[10px] text-emerald-400 font-mono font-bold">
                          R$ {job.estimatedPrice.toFixed(2)} • {job.address?.neighborhood}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          setDismissedSpamIds(prev => ({ ...prev, [job.id]: false }));
                          setIsNotificationCenterOpen(false);
                          soundManager.playIncomingJobAlert();
                        }}
                        className="px-3 py-2 bg-amber-500 hover:bg-amber-450 text-slate-950 font-black text-xs uppercase rounded-xl cursor-pointer shrink-0"
                      >
                        Abrir SPAM
                      </button>
                    </div>
                  ))}
                </div>
              )}

              {/* Pagamentos Pendentes de Conciliação */}
              {activeJob && activeJob.status === 'aguardando_confirmacao_pagamento' && (
                <div className="bg-slate-900 border border-amber-500/30 p-3 rounded-2xl space-y-1 text-xs">
                  <span className="text-[10px] font-black uppercase text-amber-300 tracking-wider flex items-center gap-1">
                    <DollarSign className="w-3.5 h-3.5 text-amber-400" />
                    <span>Pagamento Aguardando Conciliação Central M1</span>
                  </span>
                  <p className="text-slate-300">
                    Chamado <strong>{activeJob.code}</strong>: Pix enviado pelo cliente. O valor líquido de <strong>R$ {activeJob.payment.providerPayoutAmount.toFixed(2)}</strong> será creditado assim que validado.
                  </p>
                </div>
              )}

              {/* Chamados Cancelados Recentemente */}
              {recentCanceledJobs.length > 0 && (
                <div className="space-y-2">
                  <span className="text-[10px] font-black uppercase text-rose-400 tracking-wider block">
                    ⚠️ Chamados Cancelados ({recentCanceledJobs.length}):
                  </span>
                  {recentCanceledJobs.slice(0, 3).map(job => (
                    <div key={job.id} className="bg-slate-900/60 border border-slate-850 p-3 rounded-2xl text-xs space-y-1">
                      <div className="flex justify-between items-center text-slate-400">
                        <span className="font-bold text-white">{job.code}</span>
                        <span className="text-[10px] text-rose-400 font-bold uppercase">Cancelado</span>
                      </div>
                      <p className="text-slate-300 text-[11px]">{job.title}</p>
                      {job.refusalReason && (
                        <p className="text-[10px] text-slate-400 italic">Motivo: {job.refusalReason}</p>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Chamados Ativos em Andamento */}
              {activeJob && activeJob.status !== 'aguardando_confirmacao_pagamento' && (
                <div className="bg-slate-900 border border-emerald-500/30 p-3 rounded-2xl space-y-1 text-xs">
                  <span className="text-[10px] font-black uppercase text-emerald-400 tracking-wider flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    <span>Chamado em Andamento</span>
                  </span>
                  <p className="text-slate-200">
                    Chamado <strong>{activeJob.code}</strong> - {activeJob.title} ({activeJob.status.replace(/_/g, ' ')})
                  </p>
                </div>
              )}

              {allPendingAlertJobs.length === 0 && !activeJob && recentCanceledJobs.length === 0 && (
                <div className="text-center py-8 text-slate-500 text-xs">
                  Nenhuma notificação ou alerta pendente no momento.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Dynamic Statistics Block */}
      <div className="grid grid-cols-2 md:grid-cols-5 gap-3.5" id="provider-stats-panel">
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center md:text-left space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Avaliação Geral</p>
          <div className="flex items-center justify-center md:justify-start gap-1">
            <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
            <span className="text-lg font-black text-white">{provider.rating.toFixed(2)}</span>
          </div>
          <p className="text-[9px] text-emerald-400 font-bold">Excelente prestador</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center md:text-left space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Valores Recebidos</p>
          <p className="text-lg font-black text-emerald-400">R$ {provider.totalEarned.toFixed(2)}</p>
          <p className="text-[9px] text-slate-400">Faturamento concluído</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center md:text-left space-y-1">
          <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Valores a Receber</p>
          <p className="text-lg font-black text-amber-400">
            R$ {services
              .filter(s => s.providerId === provider.id && s.status !== 'concluido_pago' && s.status !== 'cancelado')
              .reduce((sum, s) => sum + (s.payment?.providerPayoutAmount || s.estimatedPrice * 0.85), 0)
              .toFixed(2)}
          </p>
          <p className="text-[9px] text-slate-400">Atendimentos em curso</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg text-center md:text-left space-y-1 col-span-2 md:col-span-2 grid grid-cols-3 gap-2">
          <div className="text-center space-y-1 border-r border-slate-800/80 pr-1">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Diários</p>
            <p className="text-base font-black text-white">
              {services.filter(s => s.providerId === provider.id && s.status === 'concluido_pago' && s.completedAt?.includes('Hoje')).length || 1}
            </p>
            <p className="text-[8px] text-emerald-400 font-bold">Meta 100%</p>
          </div>
          <div className="text-center space-y-1 border-r border-slate-800/80 px-1">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Semanais</p>
            <p className="text-base font-black text-white">
              {(services.filter(s => s.providerId === provider.id && s.status === 'concluido_pago').length) + 4}
            </p>
            <p className="text-[8px] text-slate-400 font-bold">Evolutivo</p>
          </div>
          <div className="text-center space-y-1 pl-1">
            <p className="text-[9px] text-slate-400 font-bold uppercase tracking-wider">Mensais</p>
            <p className="text-base font-black text-white">
              {(services.filter(s => s.providerId === provider.id && s.status === 'concluido_pago').length) + 18}
            </p>
            <p className="text-[8px] text-slate-400 font-bold">Premium</p>
          </div>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* ACTIVE JOB EXECUTION (IF ASSIGNED TO THIS PROVIDER)           */}
      {/* ------------------------------------------------------------- */}
      {activeJob && activeJob.status !== 'aguardando_confirmacao_pagamento' && (
        <div className="bg-slate-900 border-2 border-amber-500/50 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-6">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800 pb-4">
            <div className="space-y-1.5">
              <div className="flex flex-wrap items-center gap-2">
                <span className="font-mono text-xs font-black text-emerald-400 px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30">
                  {activeJob.code}
                </span>
                <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider ${
                  activeJob.status === 'aceito_pelo_prestador' ? 'bg-teal-500/20 text-teal-300 border border-teal-500/30' :
                  activeJob.status === 'aguardando_confirmacao_cliente' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
                  'bg-orange-500/20 text-orange-400 border border-orange-500/30'
                }`}>
                  {activeJob.status === 'aceito_pelo_prestador' ? 'ACEITO / AGUARDANDO CENTRAL' :
                   activeJob.status === 'aguardando_confirmacao_cliente' ? 'AGUARDANDO APROVAÇÃO DO CLIENTE' :
                   'EM ATENDIMENTO'}
                </span>

                {['em_deslocamento', 'chegou_ao_local', 'em_execucao', 'relatorio_enviado'].includes(activeJob.status) && (
                  <button
                    type="button"
                    onClick={() => setIsInteractionSpamOpen(true)}
                    className="px-3 py-1 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-300 text-slate-950 font-black text-[10px] uppercase tracking-wider rounded-full shadow-lg shadow-emerald-500/20 flex items-center gap-1.5 cursor-pointer animate-pulse"
                  >
                    <Navigation className="w-3 h-3 text-slate-950" />
                    <span>🚨 ABRIR SPAM INTERAÇÃO TEMPO REAL</span>
                  </button>
                )}
              </div>
               <h3 className="text-lg font-black text-white">{activeJob.title}</h3>
              
              <div className="space-y-2 text-xs text-slate-300">
                {/* Highlight Alert Banner for Step 5 */}
                {activeJob.status === 'em_deslocamento' ? (
                  <div className="p-4 bg-emerald-500/25 border-2 border-emerald-500/60 rounded-2xl space-y-1.5 animate-pulse" id="client-waiting-alert">
                    <p className="text-[11px] font-black text-emerald-400 uppercase tracking-widest flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <span>Status do Atendimento</span>
                    </p>
                    <p className="text-sm font-black text-white leading-snug">
                      "O CLIENTE ACEITOU O VALOR E ESTA AGUARDADO SUA CHEGADA AO LOCAL"
                    </p>
                  </div>
                ) : !['aceito_pelo_prestador', 'aguardando_confirmacao_cliente'].includes(activeJob.status) ? (
                  <div className="p-3 bg-emerald-500/15 border-2 border-emerald-500/40 rounded-2xl space-y-1 animate-pulse" id="client-waiting-alert">
                    <p className="text-[11px] font-black text-emerald-400 uppercase tracking-wider flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping shrink-0" />
                      <span>Confirmação Final Realizada</span>
                    </p>
                    <p className="text-xs font-bold text-white">
                      🔔 O cliente está ciente e aguarda o prestador de serviço no local.
                    </p>
                  </div>
                ) : null}

                <p className="flex items-center gap-1.5">
                  <span className="text-slate-400">Cliente:</span>
                  <strong className="text-slate-100">
                    {['aceito_pelo_prestador', 'aguardando_confirmacao_cliente'].includes(activeJob.status)
                      ? '🔒 [Oculto até aprovação do cliente]'
                      : activeJob.clientName}
                  </strong>
                </p>

                <p className="flex items-start gap-1.5">
                  <span className="text-slate-400 shrink-0">Atividade / Descrição:</span>
                  <strong className="text-slate-100 font-sans">
                    {['aceito_pelo_prestador', 'aguardando_confirmacao_cliente'].includes(activeJob.status)
                      ? '🔒 [Oculto até aprovação do cliente]'
                      : activeJob.description || 'Nenhum detalhe adicional fornecido.'}
                  </strong>
                </p>

                <p className="flex items-start gap-1.5">
                  <MapPin className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                  <span className="flex-1">
                    {['aceito_pelo_prestador', 'aguardando_confirmacao_cliente'].includes(activeJob.status) ? (
                      <span>
                        Endereço do Local: Bairro <strong className="text-slate-100">{activeJob.address.neighborhood}</strong>
                        <span className="block text-[10px] text-slate-500 font-sans mt-1">
                          🔒 Rua e número protegidos por segurança M1 (revelados automaticamente após o cliente aprovar o orçamento).
                        </span>
                      </span>
                    ) : (
                      <span>
                        Endereço do Local: <strong className="text-slate-100">{activeJob.address.street}, nº {activeJob.address.number} - {activeJob.address.neighborhood}, {activeJob.address.city} - {activeJob.address.state || 'SP'}</strong>
                        <span className="block mt-1.5">
                          <a
                            href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                              `${activeJob.address.street}, ${activeJob.address.number} - ${activeJob.address.neighborhood}, ${activeJob.address.city} - ${activeJob.address.state || 'SP'}`
                            )}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            referrerPolicy="no-referrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1 bg-rose-500 text-slate-950 hover:bg-rose-400 font-extrabold text-[10px] uppercase tracking-wider rounded-lg transition-all cursor-pointer font-sans shadow-md shadow-rose-500/10"
                          >
                            <MapPin className="w-3 h-3" />
                            <span>Abrir Local exato no Google Maps</span>
                          </a>
                        </span>
                      </span>
                    )}
                  </span>
                </p>

                <p className="flex items-center gap-1.5">
                  <Clock className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                  <span>
                    Horário do Aceite: <strong className="text-emerald-400">{activeJob.acceptedAt || 'Recentemente'}</strong>
                  </span>
                </p>

                {/* CARD OFICIAL DE ORDEM DE SERVIÇO (O.S.) NO PORTAL DO PRESTADOR */}
                {activeJob.osDetails && (
                  <div className="bg-slate-950 border border-dashed border-emerald-500/40 p-4 rounded-2xl space-y-2 relative overflow-hidden mt-3" id="provider-os-card">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <div>
                        <h4 className="font-black text-white text-xs uppercase tracking-wider flex items-center gap-1.5">
                          <span>Ordem de Serviço Autorizada</span>
                          <span className="px-2 py-0.5 rounded bg-emerald-500/15 text-[9px] text-emerald-400 font-mono font-bold">
                            {activeJob.osDetails.osCode}
                          </span>
                        </h4>
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px] font-mono text-slate-300">
                      <div>
                        <span className="text-slate-500 font-bold">EMISSÃO:</span>{' '}
                        <span className="font-bold text-white">{activeJob.osDetails.date} às {activeJob.osDetails.time}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 font-bold">VALOR REPASSE (85%):</span>{' '}
                        <span className="font-bold text-emerald-400">
                          R$ {(activeJob.payment?.providerPayoutAmount || activeJob.osDetails.value * 0.85).toFixed(2)}
                        </span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Secure Contact Gate */}
                <div className="bg-slate-900 border border-slate-800 p-3.5 rounded-2xl flex items-center justify-between gap-3 flex-wrap shadow-inner mt-2">
                  <div className="flex items-center gap-2">
                    <MessageSquare className="w-4 h-4 text-cyan-400" />
                    <div>
                      <p className="text-[10px] text-slate-400 font-bold uppercase">Suporte Central M1</p>
                      <p className="text-white font-mono font-bold text-xs">(11) 96212-2694</p>
                    </div>
                  </div>
                  <a
                    href={getWhatsAppLinkForProvider(activeJob)}
                    target="_blank"
                    rel="referrer"
                    className="px-3.5 py-2 rounded-xl bg-cyan-600 hover:bg-cyan-500 text-slate-950 text-xs font-black uppercase tracking-wider flex items-center gap-1.5 transition-all shadow-md cursor-pointer"
                  >
                    <MessageSquare className="w-4 h-4 text-slate-950" />
                    <span>Falar com o Admin</span>
                  </a>
                </div>
              </div>
            </div>

            <div className="flex flex-col items-stretch sm:items-end gap-2.5 shrink-0">
              {activeJob.status === 'em_deslocamento' && (
                <div className="flex flex-col items-end gap-2">
                  <ArrivalCountdown acceptedEpoch={activeJob.acceptedEpoch} estimatedArrivalMinutes={activeJob.estimatedArrivalMinutes} />
                  <div className="flex items-center gap-1 bg-slate-950 p-1.5 rounded-lg border border-slate-800">
                    <span className="text-[9px] text-slate-400 font-bold whitespace-nowrap">Alterar ETA (Min):</span>
                    <input
                      type="number"
                      min="1"
                      max="180"
                      id={`eta-input-${activeJob.id}`}
                      defaultValue={activeJob.estimatedArrivalMinutes || 15}
                      className="w-12 bg-slate-900 border border-slate-700 rounded px-1 py-0.5 text-[10px] text-white font-mono font-bold text-center focus:outline-none focus:border-emerald-500"
                    />
                    <button
                      onClick={() => {
                        const inputEl = document.getElementById(`eta-input-${activeJob.id}`) as HTMLInputElement;
                        if (inputEl) {
                          const newEta = Number(inputEl.value);
                          editServiceDetails(activeJob.id, { 
                            estimatedArrivalMinutes: newEta,
                            chat: [
                              ...activeJob.chat,
                              {
                                id: 'msg-eta-upd-' + Date.now(),
                                senderRole: 'system',
                                senderName: 'Central M1 Brasil',
                                text: `⏱️ **PRESTADOR ATUALIZOU O TEMPO DE CHEGADA!**\n\nO técnico credenciado alterou a previsão de chegada ao local para **${newEta} minutos**.`,
                                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                              }
                            ]
                          });
                          triggerSyncEvent(
                            'general_update',
                            'Previsão de Chegada Atualizada',
                            `O prestador alterou a previsão de chegada para ${newEta} minutos.`,
                            'success',
                            'provider',
                            activeJob.id
                          );
                        }
                      }}
                      className="px-2 py-0.5 bg-emerald-500 hover:bg-emerald-450 text-slate-950 text-[9px] font-black rounded cursor-pointer transition-colors"
                    >
                      OK
                    </button>
                  </div>
                </div>
              )}
              {['aceito_pelo_prestador', 'aguardando_confirmacao_cliente'].includes(activeJob.status) ? (
                <div className="px-3.5 py-2.5 rounded-xl bg-slate-800 text-slate-500 border border-slate-700/60 text-xs font-bold flex items-center justify-center gap-1.5 cursor-not-allowed select-none">
                  <Lock className="w-3.5 h-3.5 text-slate-500" />
                  <span>WhatsApp do Cliente (🔒 Bloqueado)</span>
                </div>
              ) : (
                <a
                  href={getWhatsAppLinkForProvider(activeJob)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="relative px-3.5 py-2.5 rounded-xl bg-green-500 hover:bg-green-600 text-white text-xs font-black flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-green-500/20"
                >
                  <MessageSquare className="w-4 h-4 text-white" />
                  <span>WhatsApp do Cliente</span>
                </a>
              )}
            </div>
          </div>

          {/* Workflow Step Buttons */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activeJob.status === 'aceito_pelo_prestador' && (
              <div className="sm:col-span-3 p-4 bg-teal-950/40 border-2 border-teal-500/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                <Clock className="w-8 h-8 text-teal-400 animate-spin" />
                <h4 className="text-sm font-black text-teal-300">Você aceitou a indicação de serviço!</h4>
                <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                  Aguardando o Administrador da Central M1 encaminhar o orçamento com o valor de <strong>R$ {activeJob.estimatedPrice.toFixed(2)}</strong> para que o cliente aprove no aplicativo dele.
                </p>
              </div>
            )}

            {activeJob.status === 'aguardando_confirmacao_cliente' && (
              <div className="sm:col-span-3 p-4 bg-indigo-950/45 border-2 border-indigo-500/30 rounded-2xl flex flex-col items-center justify-center text-center space-y-2">
                <Hourglass className="w-8 h-8 text-indigo-400 animate-pulse" />
                <h4 className="text-sm font-black text-indigo-300">Aguardando Aprovação do Cliente</h4>
                <p className="text-xs text-slate-300 max-w-md leading-relaxed">
                  A Central M1 encaminhou os valores para o aplicativo do cliente. Assim que o cliente clicar em <strong>Aprovar Orçamento</strong> no painel dele, as informações completas, GPS e contato do cliente serão liberados para o seu início de deslocamento!
                </p>
              </div>
            )}

            {activeJob.status === 'em_deslocamento' && (
              <button
                onClick={() => markProviderArrived(activeJob.id)}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer sm:col-span-3"
              >
                <Navigation className="w-4 h-4" />
                <span>Cheguei ao Local do Cliente (Confirmar Presença)</span>
              </button>
            )}

            {activeJob.status === 'chegou_ao_local' && (
              <button
                onClick={() => startServiceExecution(activeJob.id)}
                className="w-full py-3 bg-cyan-500 hover:bg-cyan-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-cyan-500/20 flex items-center justify-center gap-2 cursor-pointer sm:col-span-3"
              >
                <Zap className="w-4 h-4" />
                <span>Iniciar Execução & Reparo Técnico</span>
              </button>
            )}
          </div>

          {['em_deslocamento', 'aceito_pelo_prestador', 'aguardando_confirmacao_cliente'].includes(activeJob.status) && (
            <div className="flex justify-end pt-2">
              <button
                onClick={() => {
                  if (confirm('Tem certeza de que deseja recusar/cancelar este atendimento? O chamado retornará para a Central para que outro profissional seja acionado.')) {
                    providerRejectDispatchedService(activeJob.id, 'Cancelado pelo prestador via painel ativo');
                  }
                }}
                className="w-full sm:w-auto py-2 px-3.5 bg-slate-950 hover:bg-rose-950/20 text-slate-500 hover:text-rose-400 font-extrabold text-[10.5px] uppercase tracking-wider rounded-xl cursor-pointer border border-slate-800 hover:border-rose-900/40 transition-all flex items-center justify-center gap-1.5"
              >
                <X className="w-3.5 h-3.5 shrink-0" />
                <span>Recusar / Cancelar Atendimento</span>
              </button>
            </div>
          )}

          {/* Execution & Report Upload Screen */}
          {(activeJob.status === 'em_execucao' || activeJob.status === 'relatorio_enviado') && (
            <div className="space-y-4 pt-2">
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-3">
                <h4 className="text-xs font-black text-emerald-400 uppercase tracking-wider flex items-center gap-2">
                  <Camera className="w-4 h-4" />
                  <span>Relatório Fotográfico Obrigatório (Antes & Depois)</span>
                </h4>

                {/* 📸 FOTOS ANTES E DEPOIS DO SERVIÇO */}
                {activeJob.status === 'em_execucao' ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 space-y-2">
                      <MediaUploader
                        category={activeJob.category}
                        mediaList={beforePhotos}
                        onChange={setBeforePhotos}
                        maxItems={4}
                        label="FOTOS DE ANTES (Local do Problema)"
                        allowPresets={false}
                      />
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 space-y-2">
                      <MediaUploader
                        category={activeJob.category}
                        mediaList={afterPhotos}
                        onChange={setAfterPhotos}
                        maxItems={4}
                        label="FOTOS DE DEPOIS (Serviço Concluído)"
                        allowPresets={false}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">📸 FOTOS DE ANTES DO SERVIÇO</p>
                      <div className="grid grid-cols-4 gap-2">
                        {beforePhotos.map((photo, pIdx) => (
                          <div key={photo.id || pIdx} className="aspect-square rounded-xl overflow-hidden border border-slate-800 cursor-pointer" onClick={() => setZoomedPhotoUrl(photo.url)}>
                            <img src={photo.url} alt="Antes" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {beforePhotos.length === 0 && <span className="text-xs text-slate-500">Nenhuma foto anexada.</span>}
                      </div>
                    </div>
                    <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-800/80 space-y-2">
                      <p className="text-[10px] font-bold text-slate-400 uppercase mb-2">📸 FOTOS DE DEPOIS DO SERVIÇO</p>
                      <div className="grid grid-cols-4 gap-2">
                        {afterPhotos.map((photo, pIdx) => (
                          <div key={photo.id || pIdx} className="aspect-square rounded-xl overflow-hidden border border-slate-800 cursor-pointer" onClick={() => setZoomedPhotoUrl(photo.url)}>
                            <img src={photo.url} alt="Depois" referrerPolicy="no-referrer" className="w-full h-full object-cover" />
                          </div>
                        ))}
                        {afterPhotos.length === 0 && <span className="text-xs text-slate-500">Nenhuma foto anexada.</span>}
                      </div>
                    </div>
                  </div>
                )}

                {/* Checklist */}
                <div className="space-y-1.5">
                  <p className="text-[11px] font-bold text-slate-300">Checklist Operacional M1:</p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {checklist.map(item => (
                      <button
                        key={item.id}
                        type="button"
                        onClick={() => toggleChecklistItem(item.id)}
                        className={`p-2.5 rounded-xl border text-left text-xs transition-all flex items-center gap-2 cursor-pointer ${
                          item.completed
                            ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-white'
                        }`}
                      >
                        <Check className={`w-3.5 h-3.5 ${item.completed ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className="text-[11px]">{item.label}</span>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Report Notes */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Parecer Técnico / Observações</label>
                    <textarea
                      value={reportNotes}
                      onChange={e => setReportNotes(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-slate-300 mb-1">Materiais e Peças Utilizadas</label>
                    <textarea
                      value={materialsUsed}
                      onChange={e => setMaterialsUsed(e.target.value)}
                      rows={2}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl p-2.5 text-xs text-white outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                {activeJob.status === 'em_execucao' && (
                  <button
                    onClick={handleSendReport}
                    className="w-full py-3 bg-gradient-to-r from-emerald-500 to-teal-400 text-slate-950 font-black text-xs rounded-xl shadow-lg shadow-emerald-500/20 flex items-center justify-center gap-2 cursor-pointer hover:opacity-90 transition-opacity"
                  >
                    <Send className="w-4 h-4" />
                    <span>Concluir Serviço & Enviar Laudo Fotográfico ao Cliente</span>
                  </button>
                )}

                {activeJob.status === 'relatorio_enviado' && (
                  <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2">
                    <Clock className="w-4 h-4 shrink-0" />
                    <span>Relatório enviado com sucesso! Aguardando o cliente aprovar o laudo e efetuar o pagamento Pix.</span>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* RADAR: INCOMING SERVICE REQUESTS                              */}
      {/* ------------------------------------------------------------- */}
      {pendingAlertJob && !activeJob && (
        <div className="bg-slate-900 border-2 border-emerald-500 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95 duration-200">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className={`w-3 h-3 rounded-full ${pendingAlertJob.status === 'despachado_prestador' || pendingAlertJob.status === 'valor_aprovado_cliente' ? 'bg-amber-500 animate-ping' : 'bg-emerald-500'}`} />
              <h3 className="text-base font-black text-white">
                {pendingAlertJob.status === 'despachado_prestador' || pendingAlertJob.status === 'valor_aprovado_cliente' 
                  ? '🚨 Chamado Exclusivo Enviado para Você!' 
                  : '⚡ Novo Chamado Disponível no seu Radar!'}
              </h3>
            </div>
            {(pendingAlertJob.status === 'despachado_prestador' || pendingAlertJob.status === 'valor_aprovado_cliente') && (
              <span className="font-mono text-xs font-black text-rose-400 bg-rose-500/10 px-2.5 py-1 rounded-full border border-rose-500/30 animate-pulse">
                SLA: {Math.floor(countdown / 60).toString().padStart(2, '0')}:{(countdown % 60).toString().padStart(2, '0')} restantes
              </span>
            )}
          </div>

          <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 space-y-4 text-xs shadow-inner">
            {/* Header: Title and Price */}
            <div className="flex justify-between items-start gap-4 border-b border-slate-900 pb-3">
              <div className="space-y-1">
                <span className="text-[10px] uppercase font-black text-rose-500 tracking-wider bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
                  {pendingAlertJob.category.toUpperCase()}
                </span>
                <h4 className="font-extrabold text-white text-base font-sans">{pendingAlertJob.title}</h4>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[9px] uppercase text-slate-500 font-bold block">Valor Ofertado</span>
                <span className="font-mono font-black text-emerald-400 text-lg">
                  R$ {pendingAlertJob.estimatedPrice.toFixed(2)}
                </span>
              </div>
            </div>

            {/* Complete Description */}
            <div className="space-y-1.5 text-left bg-slate-900/60 p-3 rounded-xl border border-slate-800/60">
              <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1">
                📝 Descrição Detalhada da Atividade:
              </span>
              <p className="text-slate-200 text-xs font-sans leading-relaxed whitespace-pre-line">
                {pendingAlertJob.description || "Sem descrição disponível."}
              </p>
            </div>

            {/* Photos and Videos Section */}
            {pendingAlertJob.media && pendingAlertJob.media.length > 0 && (
              <div className="space-y-2 text-left">
                <span className="text-[10px] uppercase font-black text-slate-400 tracking-wider flex items-center gap-1.5">
                  📸 Fotos & Vídeos da Atividade:
                </span>
                <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
                  {pendingAlertJob.media.map((med) => (
                    <div key={med.id} className="relative aspect-video rounded-xl overflow-hidden border border-slate-800/80 bg-slate-900 group">
                      {med.type === 'video' ? (
                        <video
                          src={med.url}
                          className="w-full h-full object-cover"
                          controls
                          preload="metadata"
                        />
                      ) : (
                        <img
                          src={med.url}
                          alt="Atividade M1"
                          referrerPolicy="no-referrer"
                          className="w-full h-full object-cover hover:scale-105 transition-all duration-200 cursor-zoom-in"
                          onClick={() => setZoomedPhotoUrl(med.url)}
                        />
                      )}
                      <span className="absolute bottom-1 right-1 bg-black/75 px-1.5 py-0.5 rounded text-[8px] text-slate-200 font-mono font-black tracking-wider uppercase">
                        {med.type === 'video' ? '📹 Vídeo' : '📷 Foto'}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Location (Neighborhood) */}
            <div className="flex flex-col gap-1.5 text-left pt-2 border-t border-slate-900">
              <div className="flex items-center gap-1.5">
                <MapPin className="w-4 h-4 text-rose-500 shrink-0" />
                <span className="font-bold text-slate-200 text-xs">
                  Bairro do Atendimento: <span className="text-amber-400">{pendingAlertJob.address.neighborhood}</span>
                </span>
              </div>
              <p className="text-[10px] text-slate-500 font-sans leading-relaxed pl-5.5">
                🔒 Para segurança de ambas as partes, a rua e o número exatos do cliente M1 serão totalmente liberados apenas após você aceitar este chamado.
              </p>
            </div>

            {/* Locked sensitive details on incoming SPAM call */}
            <div className="bg-slate-950 p-3.5 rounded-2xl border border-dashed border-slate-800 space-y-2 text-left text-xs text-slate-400">
              <p className="text-[10px] font-black text-amber-500/80 uppercase tracking-wider flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5 text-amber-500" />
                <span>Dados Sensíveis Ocultos (Bloqueado)</span>
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] font-sans">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="text-slate-500">Nome: 🔒 Oculto</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 flex items-center gap-2">
                  <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="text-slate-500">WhatsApp: 🔒 Oculto</span>
                </div>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-850 flex items-center gap-2 col-span-2">
                  <Lock className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                  <span className="text-slate-500">Ordem de Serviço (OS): 🔒 Oculto</span>
                </div>
              </div>
            </div>
          </div>

          {pendingAlertJob.status === 'despachado_prestador' || pendingAlertJob.status === 'valor_aprovado_cliente' ? (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5">
                <p className="text-[11px] text-amber-400 font-extrabold uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-500 animate-ping" />
                  <span>📌 Chamado Direcionado pela Central M1</span>
                </p>
                <p className="text-xs text-slate-300">
                  O Administrador M1 selecionou você para este chamado com o valor fixo de <strong>R$ {pendingAlertJob.estimatedPrice.toFixed(2)}</strong>.
                </p>
                <div className="p-2.5 rounded-xl bg-red-950/20 border border-red-500/20 text-[11px] text-red-300 space-y-1">
                  <p className="font-bold">⚠️ Atenção ao SLA de Resposta:</p>
                  <p className="text-[10px] text-slate-300">
                    Você tem exatamente <strong>5 minutos</strong> para aceitar ou recusar este chamado. Caso o tempo acabe, o chamado retornará automaticamente ao administrador para reorganização.
                  </p>
                </div>
                
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10.5px] text-slate-400 font-sans leading-relaxed">
                  🔒 <strong>Regra de Integridade:</strong> O preço proposto pelo administrador é fixo e não editável. Você pode optar por aceitar integralmente ou recusar o atendimento.
                </div>
              </div>

              {/* Tempo estimado de chegada input */}
              <div className="bg-slate-950 p-3.5 border border-slate-800 rounded-2xl space-y-2 text-left">
                <label className="block text-xs font-bold text-slate-300">
                  ⏱️ Digite o Tempo Estimado de Chegada (ETA) ao Local:
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={proposedETA}
                      onChange={(e) => setProposedETA(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono font-bold outline-none focus:border-emerald-500"
                      placeholder="Digite o tempo em minutos (ex: 15)"
                    />
                    <div className="flex items-center text-[11px] text-slate-400 font-mono whitespace-nowrap bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                      minutos
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 block">até o bairro <strong>{pendingAlertJob.address.neighborhood}</strong></span>
                </div>
                
                {/* Fast ETA Suggestion Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[10, 15, 20, 30, 45].map((presetMin) => (
                    <button
                      key={presetMin}
                      type="button"
                      onClick={() => setProposedETA(presetMin)}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        proposedETA === presetMin
                          ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {presetMin} min
                    </button>
                  ))}
                </div>
              </div>

              {/* 🚨 ALARME VISUAL OBRIGATÓRIO: TERMO DE TAXA DE CANCELAMENTO DE 15% */}
              <div 
                className={`p-3 rounded-xl border-2 transition-colors text-left ${
                  providerCancelFeeAgreed[pendingAlertJob.id]
                    ? 'bg-amber-950/40 border-amber-400'
                    : providerTermAlertTriggered[pendingAlertJob.id]
                      ? 'bg-red-950/90 border-red-500 ring-2 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                      : 'bg-yellow-500/15 border-yellow-400'
                }`}
              >
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!providerCancelFeeAgreed[pendingAlertJob.id]}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setProviderCancelFeeAgreed(prev => ({ ...prev, [pendingAlertJob.id]: checked }));
                      if (checked) {
                        setProviderTermAlertTriggered(prev => ({ ...prev, [pendingAlertJob.id]: false }));
                      }
                    }}
                    className="mt-0.5 w-4 h-4 rounded accent-yellow-400 text-yellow-400 cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] font-black text-yellow-300 uppercase tracking-wide leading-tight">
                    "ESTOU CIENTE QUE EM CASO DE CANCELAMENTO TEREI QUE PAGAR A TAXA DE 15% DO VALOR DO SERVIÇO"
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (!providerCancelFeeAgreed[pendingAlertJob.id]) {
                      setProviderTermAlertTriggered(prev => ({ ...prev, [pendingAlertJob.id]: true }));
                      alert('Por favor, aceite o termo da taxa de 15% para prosseguir.');
                      return;
                    }
                    providerAcceptDispatchedService(pendingAlertJob.id, proposedETA);
                  }}
                  className={`flex-1 py-3 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    providerCancelFeeAgreed[pendingAlertJob.id]
                      ? 'bg-emerald-500 hover:bg-emerald-450 text-slate-950 shadow-emerald-500/20'
                      : 'bg-emerald-500/40 text-slate-950/60'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>CONFIRMAR E ACEITAR</span>
                </button>

                <button
                  onClick={() => providerRejectDispatchedService(pendingAlertJob.id, 'Recusado pelo prestador via painel')}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-rose-500 hover:text-rose-400 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Recusar Atendimento
                </button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-2xl space-y-2.5">
                <p className="text-[11px] text-emerald-400 font-extrabold uppercase flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                  <span>📌 Chamado Disponível com Valor Fixo</span>
                </p>
                <p className="text-xs text-slate-300">
                  A Central M1 definiu o valor fixo deste chamado para <strong>R$ {pendingAlertJob.estimatedPrice.toFixed(2)}</strong>.
                </p>
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800 text-[10.5px] text-slate-400 font-sans leading-relaxed">
                  🔒 <strong>Regra de Integridade M1:</strong> O valor estabelecido pela central é integralmente garantido e não editável pelo prestador.
                </div>
              </div>

              {/* Tempo estimado de chegada input */}
              <div className="bg-slate-950 p-3.5 border border-slate-800 rounded-2xl space-y-2 text-left">
                <label className="block text-xs font-bold text-slate-300">
                  ⏱️ Digite o Tempo Estimado de Chegada (ETA) ao Local:
                </label>
                <div className="space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="number"
                      min="1"
                      max="180"
                      value={proposedETA}
                      onChange={(e) => setProposedETA(Math.max(1, Number(e.target.value)))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl px-3 py-2.5 text-xs text-white font-mono font-bold outline-none focus:border-emerald-500"
                      placeholder="Digite o tempo em minutos (ex: 15)"
                    />
                    <div className="flex items-center text-[11px] text-slate-400 font-mono whitespace-nowrap bg-slate-900 px-3 py-2 rounded-xl border border-slate-800">
                      minutos
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-400 block">até o bairro <strong>{pendingAlertJob.address.neighborhood}</strong></span>
                </div>

                {/* Fast ETA Suggestion Badges */}
                <div className="flex flex-wrap gap-1.5 pt-1">
                  {[10, 15, 20, 30, 45].map((presetMin) => (
                    <button
                      key={presetMin}
                      type="button"
                      onClick={() => setProposedETA(presetMin)}
                      className={`px-2.5 py-1 text-[10px] font-mono font-bold rounded-lg transition-all cursor-pointer ${
                        proposedETA === presetMin
                          ? 'bg-emerald-500 text-slate-950 border border-emerald-400'
                          : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
                      }`}
                    >
                      {presetMin} min
                    </button>
                  ))}
                </div>
              </div>

              {/* 🚨 ALARME VISUAL OBRIGATÓRIO: TERMO DE TAXA DE CANCELAMENTO DE 15% */}
              <div 
                className={`p-3 rounded-xl border-2 transition-colors text-left ${
                  providerCancelFeeAgreed[pendingAlertJob.id]
                    ? 'bg-amber-950/40 border-amber-400'
                    : providerTermAlertTriggered[pendingAlertJob.id]
                      ? 'bg-red-950/90 border-red-500 ring-2 ring-red-500/50 shadow-[0_0_20px_rgba(239,68,68,0.4)]'
                      : 'bg-yellow-500/15 border-yellow-400'
                }`}
              >
                <label className="flex items-start gap-2.5 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={!!providerCancelFeeAgreed[pendingAlertJob.id]}
                    onChange={(e) => {
                      const checked = e.target.checked;
                      setProviderCancelFeeAgreed(prev => ({ ...prev, [pendingAlertJob.id]: checked }));
                      if (checked) {
                        setProviderTermAlertTriggered(prev => ({ ...prev, [pendingAlertJob.id]: false }));
                      }
                    }}
                    className="mt-0.5 w-4 h-4 rounded accent-yellow-400 text-yellow-400 cursor-pointer shrink-0"
                  />
                  <span className="text-[11px] font-black text-yellow-300 uppercase tracking-wide leading-tight">
                    "ESTOU CIENTE QUE EM CASO DE CANCELAMENTO TEREI QUE PAGAR A TAXA DE 15% DO VALOR DO SERVIÇO"
                  </span>
                </label>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={() => {
                    if (!providerCancelFeeAgreed[pendingAlertJob.id]) {
                      setProviderTermAlertTriggered(prev => ({ ...prev, [pendingAlertJob.id]: true }));
                      alert('Por favor, aceite o termo da taxa de 15% para prosseguir.');
                      return;
                    }
                    providerAcceptDispatchedService(pendingAlertJob.id, proposedETA);
                  }}
                  className={`flex-1 py-3 font-black text-xs rounded-xl shadow-lg flex items-center justify-center gap-1.5 cursor-pointer transition-all ${
                    providerCancelFeeAgreed[pendingAlertJob.id]
                      ? 'bg-emerald-500 hover:bg-emerald-450 text-slate-950 shadow-emerald-500/20'
                      : 'bg-emerald-500/40 text-slate-950/60'
                  }`}
                >
                  <Check className="w-4 h-4 stroke-[3]" />
                  <span>CONFIRMAR E ACEITAR</span>
                </button>

                <button
                  onClick={() => providerRejectDispatchedService(pendingAlertJob.id, 'Recusado pelo prestador via radar')}
                  className="py-3 px-4 bg-slate-800 hover:bg-slate-700 text-rose-500 hover:text-rose-400 font-bold text-xs rounded-xl cursor-pointer"
                >
                  Recusar
                </button>
              </div>
            </div>
          )}
        </div>
      )}

      {/* No active job and no incoming alert */}
      {!activeJob && !pendingAlertJob && (
        <div className="space-y-6">
          {/* Radar Status Card */}
          <div className="bg-gradient-to-r from-emerald-950/20 to-slate-900 border border-emerald-500/20 rounded-3xl p-6 text-center space-y-3 shadow-xl">
            <div className="inline-flex p-3 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 animate-pulse">
              <Sparkles className="w-6 h-6" />
            </div>
            <h3 className="text-base font-black text-white tracking-wide">Radar M1 Ativo e Online</h3>
            <p className="text-xs text-slate-300 max-w-md mx-auto leading-relaxed">
              Você está conectado à Central M1 Brasil. Novos chamados urgentes em suas especialidades ({provider.categories.join(', ')}) dispararão a sirene sonora e painel de aceitação automática.
            </p>
          </div>

          {/* Real-time Demands & Opportunities Feed */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4" id="provider-demands-feed">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <Wrench className="w-5 h-5 text-emerald-400" />
                  <span>Central de Demandas e Chamados Disponíveis</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">Oportunidades em tempo real enviadas pela Central M1 e solicitações de clientes</p>
              </div>
              <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-mono font-bold text-emerald-400">
                {services.filter(s => 
                  ['solicitado', 'negociando', 'despachado_prestador', 'valor_aprovado_cliente'].includes(s.status) && 
                  (s.assignedProviderId === provider.id || s.providerId === provider.id || (s.dispatchedByAdmin === true && isProviderQualifiedForCategory(provider, s.category)))
                ).length} Chamados em Aberto
              </span>
            </div>

            <div className="space-y-4">
              {(() => {
                const availableDemands = services.filter(s => 
                  ['solicitado', 'negociando', 'despachado_prestador', 'valor_aprovado_cliente'].includes(s.status) && 
                  (s.assignedProviderId === provider.id || s.providerId === provider.id || (s.dispatchedByAdmin === true && isProviderQualifiedForCategory(provider, s.category)))
                );

                if (availableDemands.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-500 text-xs font-medium bg-slate-950/40 rounded-2xl border border-slate-850">
                      Nenhuma demanda em aberto para sua região no momento. Continue online!
                    </div>
                  );
                }

                const totalPages = Math.ceil(availableDemands.length / itemsPerPage);
                const activeDemandsPage = Math.min(demandsPage, Math.max(1, totalPages));
                const paginatedDemands = availableDemands.slice((activeDemandsPage - 1) * itemsPerPage, activeDemandsPage * itemsPerPage);

                return (
                  <>
                    {paginatedDemands.map(srv => {
                      const hasSubmittedProposal = srv.proposals?.some(p => p.providerId === provider.id);
                      const providerProposal = srv.proposals?.find(p => p.providerId === provider.id);
                      const isDirectDispatch = (srv.status === 'despachado_prestador' || srv.status === 'valor_aprovado_cliente') && srv.assignedProviderId === provider.id;
                      const isRecommended = isProviderQualifiedForCategory(provider, srv.category);

                      return (
                        <div 
                          key={srv.id}
                          className={`p-4 sm:p-5 rounded-2xl border transition-all flex flex-col justify-between gap-4 ${
                            isDirectDispatch 
                              ? 'bg-gradient-to-r from-red-950/25 to-slate-950 border-red-500/40 shadow-lg shadow-red-950/10'
                              : isRecommended 
                                ? 'bg-slate-950/80 border-emerald-500/20' 
                                : 'bg-slate-950/40 border-slate-850 opacity-80 hover:opacity-100'
                          }`}
                        >
                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="px-2 py-0.5 rounded-lg text-[9px] font-mono font-black uppercase bg-slate-900 border border-slate-800 text-slate-400">
                            {srv.code}
                          </span>
                          <span className={`px-2 py-0.5 rounded-lg text-[9px] font-bold uppercase ${
                            isRecommended 
                              ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                              : 'bg-slate-900 text-slate-400'
                          }`}>
                            {srv.category.toUpperCase()}
                          </span>
                          {srv.urgency === 'imediato' && (
                            <span className="px-1.5 py-0.5 bg-rose-500/15 text-rose-400 border border-rose-500/20 rounded text-[9px] font-bold uppercase tracking-wider animate-pulse">
                              🚨 Urgente
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-1.5">
                          {isDirectDispatch && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-red-500/15 text-red-400 border border-red-500/30 animate-pulse">
                              🛰️ DIRECIONADO PARA VOCÊ
                            </span>
                          )}
                          {hasSubmittedProposal && (
                            <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-slate-800 text-slate-400 border border-slate-700">
                              ✓ PROPOSTA ENVIADA (R$ {providerProposal?.proposedPrice.toFixed(2)})
                            </span>
                          )}
                          {!isDirectDispatch && !hasSubmittedProposal && (
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                              srv.status === 'solicitado' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'bg-slate-800 text-slate-300'
                            }`}>
                              {srv.status === 'solicitado' ? 'Aguardando Orçamento' : srv.status}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="space-y-1.5">
                        <h4 className="text-sm font-black text-white">{srv.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed font-sans">{srv.description}</p>
                      </div>

                      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-slate-800/80 pt-3.5 gap-2 flex-wrap">
                        <div className="flex items-center gap-3.5 text-[11px] text-slate-400">
                          <div className="flex items-center gap-1">
                            <MapPin className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                            <span>{srv.address.neighborhood} • {srv.address.city}</span>
                          </div>
                          <div className="flex items-center gap-1 font-mono font-bold text-white bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                            <DollarSign className="w-3 h-3 text-emerald-400" />
                            <span>R$ {srv.estimatedPrice.toFixed(2)}</span>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto mt-2 sm:mt-0 justify-end">
                          {isDirectDispatch ? (
                            <div className="flex gap-2 w-full sm:w-auto">
                              <button
                                onClick={() => providerAcceptDispatchedService(srv.id, 15)}
                                className="flex-1 sm:flex-initial px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer"
                              >
                                ⚡ ACEITAR
                              </button>
                              <button
                                onClick={() => providerRejectDispatchedService(srv.id, 'Recusado pelo prestador via listagem')}
                                className="flex-1 sm:flex-initial px-3 py-2 bg-slate-800 hover:bg-slate-700 text-rose-500 font-bold text-xs uppercase rounded-xl transition-all cursor-pointer"
                              >
                                Recusar
                              </button>
                            </div>
                          ) : hasSubmittedProposal ? (
                            <button
                              disabled
                              className="w-full sm:w-auto px-3.5 py-2 bg-slate-900 text-slate-500 font-bold text-xs rounded-xl border border-slate-800"
                            >
                              Aguardando Resposta do Cliente
                            </button>
                          ) : (
                            <div className="flex flex-col w-full sm:w-auto gap-2">
                              {activeProposalServiceId === srv.id ? (
                                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-3 w-full sm:w-80 mt-2">
                                  <div className="space-y-1.5">
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                      Valor do Orçamento (R$ - Fixo pela Central)
                                    </label>
                                    <div className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-400 font-mono font-bold select-none">
                                      R$ {srv.estimatedPrice.toFixed(2)}
                                    </div>
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                      Tempo de Chegada (Minutos)
                                    </label>
                                    <input
                                      type="number"
                                      value={customETAs[srv.id] ?? 20}
                                      onChange={e => setCustomETAs(prev => ({ ...prev, [srv.id]: Number(e.target.value) }))}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none focus:border-emerald-500 font-mono font-bold"
                                    />
                                  </div>

                                  <div className="space-y-1.5">
                                    <label className="block text-[9px] font-bold text-slate-400 uppercase tracking-wider">
                                      Mensagem ao Cliente
                                    </label>
                                    <textarea
                                      rows={2}
                                      value={customMsgs[srv.id] ?? 'Olá! Estou disponível e posso resolver seu chamado rapidamente. Aguardo sua aprovação.'}
                                      onChange={e => setCustomMsgs(prev => ({ ...prev, [srv.id]: e.target.value }))}
                                      className="w-full bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
                                    />
                                  </div>

                                  <div className="flex gap-2">
                                    <button
                                      onClick={() => {
                                        submitProposal(srv.id, {
                                          proposedPrice: srv.estimatedPrice,
                                          estimatedArrivalMinutes: customETAs[srv.id] ?? 20,
                                          message: customMsgs[srv.id] ?? 'Olá! Estou disponível e posso resolver seu chamado rapidamente. Aguardo sua aprovação.'
                                        });
                                        setActiveProposalServiceId(null);
                                      }}
                                      className="flex-1 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-[10px] uppercase rounded-lg transition-colors cursor-pointer"
                                    >
                                      Enviar
                                    </button>
                                    <button
                                      onClick={() => setActiveProposalServiceId(null)}
                                      className="px-2.5 py-1.5 bg-slate-900 text-slate-400 hover:text-white font-bold text-[10px] uppercase rounded-lg transition-colors cursor-pointer border border-slate-800"
                                    >
                                      Cancelar
                                    </button>
                                  </div>
                                </div>
                              ) : (
                                <div className="flex gap-2 w-full sm:w-auto">
                                  <button
                                    onClick={() => {
                                      setCustomPrices(prev => ({ ...prev, [srv.id]: srv.estimatedPrice }));
                                      setCustomETAs(prev => ({ ...prev, [srv.id]: 20 }));
                                      setActiveProposalServiceId(srv.id);
                                    }}
                                    className="px-3.5 py-2 bg-emerald-500/10 hover:bg-emerald-500 hover:text-slate-950 text-emerald-400 font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer border border-emerald-500/20"
                                  >
                                    💼 Enviar Orçamento
                                  </button>
                                  <button
                                    onClick={() => acceptServiceRequestDirectly(srv.id)}
                                    className="px-3.5 py-2 bg-slate-850 hover:bg-slate-800 text-slate-300 font-bold text-xs rounded-xl border border-slate-800 transition-colors cursor-pointer"
                                  >
                                    Aceitar Direto
                                  </button>
                                </div>
                              )}
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  );
                })}
                {totalPages > 1 && (
                  <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800" id="provider-demands-pagination">
                    <button
                      type="button"
                      disabled={activeDemandsPage === 1}
                      onClick={() => setDemandsPage(prev => Math.max(prev - 1, 1))}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Anterior
                    </button>
                    <span className="text-[10px] font-semibold text-slate-400 font-mono">
                      Página {activeDemandsPage} de {totalPages}
                    </span>
                    <button
                      type="button"
                      disabled={activeDemandsPage === totalPages}
                      onClick={() => setDemandsPage(prev => Math.min(prev + 1, totalPages))}
                      className="px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                    >
                      Próximo
                    </button>
                  </div>
                )}
              </>
            );
          })()}
        </div>
          </div>

          {/* Histórico de Atendimentos Concluídos - Relatório Completo e Controle */}
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-3">
              <div>
                <h3 className="text-base font-black text-white flex items-center gap-2">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                  <span>Histórico de Atendimentos Concluídos</span>
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Relatório completo do que foi executado, tempos, laudos, fotos e repasses salvos no Arquivo
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-1 bg-slate-950 border border-slate-800 rounded-xl text-[10px] font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  <Archive className="w-3.5 h-3.5 text-cyan-400" />
                  {services.filter(s => (s.status === 'concluido_pago' || s.isArchived) && (s.providerId === provider.id || s.assignedProviderId === provider.id)).length} Atendimentos Arquivados
                </span>
              </div>
            </div>

            {/* Search and Quick Metrics Bar */}
            <div className="flex items-center justify-between gap-3 flex-wrap">
              <div className="relative flex-1 min-w-[200px]">
                <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  value={historySearchTerm}
                  onChange={(e) => {
                    setHistorySearchTerm(e.target.value);
                    setCompletedPage(1);
                  }}
                  placeholder="Pesquisar por código, cliente ou descrição do serviço..."
                  className="w-full pl-9 pr-3 py-2 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                />
              </div>
            </div>

            <div className="space-y-3.5">
              {(() => {
                const completedJobs = services.filter(s => 
                  (s.status === 'concluido_pago' || s.isArchived) && 
                  (s.providerId === provider.id || s.assignedProviderId === provider.id) &&
                  (!historySearchTerm || 
                    s.code.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                    s.clientName.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                    s.title.toLowerCase().includes(historySearchTerm.toLowerCase()) ||
                    (s.photoReport?.notes || '').toLowerCase().includes(historySearchTerm.toLowerCase())
                  )
                );

                if (completedJobs.length === 0) {
                  return (
                    <div className="p-8 text-center text-slate-500 text-xs font-medium bg-slate-950/40 rounded-2xl border border-slate-850">
                      {historySearchTerm ? 'Nenhum atendimento encontrado para esta busca.' : 'Nenhum atendimento concluído no histórico no momento.'}
                    </div>
                  );
                }

                const totalPages = Math.ceil(completedJobs.length / itemsPerPage);
                const activeCompletedPage = Math.min(completedPage, Math.max(1, totalPages));
                const paginatedCompleted = completedJobs.slice((activeCompletedPage - 1) * itemsPerPage, activeCompletedPage * itemsPerPage);

                return (
                  <>
                    {paginatedCompleted.map(srv => {
                      const hasRating = !!srv.rating;
                      const totalPaid = srv.payment.providerPayoutAmount + (srv.rating?.tipAmount || 0);
                      const timeSpentMinutes = srv.photoReport?.timeSpentMinutes || 45;
                      const reportText = srv.photoReport?.notes || srv.description || 'Serviço executado com sucesso e área higienizada.';
                      const beforePhotos = srv.photoReport?.beforePhotos?.length ? srv.photoReport.beforePhotos : (srv.media || []);
                      const afterPhotos = srv.photoReport?.afterPhotos?.length ? srv.photoReport.afterPhotos : [];

                      return (
                        <div 
                          key={srv.id} 
                          className="bg-slate-950 p-4 sm:p-5 rounded-2xl border border-slate-850 hover:border-slate-750 transition-colors space-y-3 text-xs"
                        >
                          {/* Card Header: Code, Category, Date/Time, Value */}
                          <div className="flex justify-between items-start flex-wrap gap-2">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-mono text-[9px] font-black text-slate-300 bg-slate-900 px-2 py-0.5 rounded border border-slate-800">
                                  {srv.code}
                                </span>
                                <span className="text-[10px] text-slate-400 font-bold flex items-center gap-1">
                                  <Clock className="w-3 h-3 text-slate-500" />
                                  {srv.completedAt || srv.photoReport?.submittedAt || srv.createdAt || 'Finalizado'}
                                </span>
                                <span className="px-2 py-0.5 rounded text-[9px] font-bold bg-cyan-950/60 text-cyan-300 border border-cyan-800/60 flex items-center gap-1">
                                  <Archive className="w-2.5 h-2.5" />
                                  Arquivo Admin M1
                                </span>
                              </div>
                              <h4 className="text-sm font-bold text-white">{srv.title}</h4>
                            </div>

                            <div className="text-right space-y-0.5">
                              <span className="block text-[10px] text-slate-500 font-bold uppercase tracking-wider">Repasse Líquido</span>
                              <span className="block text-sm font-black text-emerald-400 font-mono">
                                R$ {totalPaid.toFixed(2)}
                              </span>
                              <span className="block text-[10px] text-slate-500 font-mono">
                                Total Cobrado: R$ {srv.payment.totalAmount.toFixed(2)}
                              </span>
                            </div>
                          </div>

                          {/* Execution Highlights: Time, Client, Address */}
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 bg-slate-900/60 p-2.5 rounded-xl border border-slate-850 text-[11px]">
                            <div>
                              <span className="text-slate-500 text-[10px] uppercase font-bold block">Tempo de Execução</span>
                              <span className="font-bold text-cyan-300 flex items-center gap-1">
                                <Clock className="w-3 h-3 text-cyan-400" />
                                {timeSpentMinutes} minutos
                              </span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] uppercase font-bold block">Cliente Atendido</span>
                              <span className="font-bold text-slate-200 truncate block">{srv.clientName}</span>
                            </div>
                            <div>
                              <span className="text-slate-500 text-[10px] uppercase font-bold block">Localização</span>
                              <span className="text-slate-400 truncate block">
                                {srv.address?.neighborhood || srv.address?.city || 'Localidade atendida'}
                              </span>
                            </div>
                          </div>

                          {/* Report Text / O que foi executado */}
                          <div className="bg-slate-900/40 p-3 rounded-xl border border-slate-900 text-[11px] text-slate-300 space-y-1">
                            <span className="text-[10px] uppercase font-black tracking-wider text-emerald-400 block flex items-center gap-1">
                              <FileText className="w-3 h-3" />
                              Relatório do que foi executado:
                            </span>
                            <p className="leading-relaxed line-clamp-3 text-slate-300">{reportText}</p>
                          </div>

                          {/* Photos preview if available */}
                          {(beforePhotos.length > 0 || afterPhotos.length > 0) && (
                            <div className="flex items-center gap-2 overflow-x-auto py-1">
                              <span className="text-[10px] text-slate-500 font-bold uppercase shrink-0">Fotos do Serviço:</span>
                              {beforePhotos.slice(0, 2).map((photo, pIdx) => (
                                <div 
                                  key={`before-${pIdx}`}
                                  onClick={() => setZoomedPhotoUrl(photo.url)}
                                  className="relative w-12 h-12 rounded-lg overflow-hidden border border-rose-500/40 shrink-0 cursor-pointer group"
                                  title="Foto de Antes (Clique para ampliar)"
                                >
                                  <img src={photo.url} alt="Antes" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                  <span className="absolute bottom-0 inset-x-0 bg-rose-950/80 text-[8px] text-rose-300 font-bold text-center">Antes</span>
                                </div>
                              ))}
                              {afterPhotos.slice(0, 2).map((photo, pIdx) => (
                                <div 
                                  key={`after-${pIdx}`}
                                  onClick={() => setZoomedPhotoUrl(photo.url)}
                                  className="relative w-12 h-12 rounded-lg overflow-hidden border border-emerald-500/40 shrink-0 cursor-pointer group"
                                  title="Foto de Depois (Clique para ampliar)"
                                >
                                  <img src={photo.url} alt="Depois" referrerPolicy="no-referrer" className="w-full h-full object-cover group-hover:scale-110 transition-transform" />
                                  <span className="absolute bottom-0 inset-x-0 bg-emerald-950/80 text-[8px] text-emerald-300 font-bold text-center">Depois</span>
                                </div>
                              ))}
                            </div>
                          )}

                          {/* Client Rating if present */}
                          {hasRating && (
                            <div className="p-2.5 bg-slate-900/80 rounded-xl border border-slate-850/60 flex items-start gap-2.5">
                              <div className="flex flex-col items-center shrink-0">
                                <div className="flex text-amber-400">
                                  {Array.from({ length: srv.rating!.score }).map((_, i) => (
                                    <Star key={i} className="w-3 h-3 fill-amber-400 text-amber-400" />
                                  ))}
                                </div>
                                <span className="text-[9px] text-slate-400 font-bold mt-0.5">Nota {srv.rating!.score}.0</span>
                              </div>
                              <div className="space-y-0.5 text-slate-300">
                                <p className="text-[11px] italic leading-snug">
                                  "{srv.rating!.comment || 'Sem comentários, apenas avaliação positiva.'}"
                                </p>
                              </div>
                            </div>
                          )}

                          {/* Action Button to Open Full Report Modal */}
                          <div className="pt-1 flex justify-end">
                            <button
                              type="button"
                              onClick={() => setSelectedHistoryService(srv)}
                              className="px-3 py-1.5 rounded-xl bg-slate-850 hover:bg-slate-800 text-emerald-400 hover:text-emerald-300 font-bold text-xs flex items-center gap-1.5 transition-colors border border-slate-750 cursor-pointer"
                            >
                              <FileText className="w-3.5 h-3.5 text-emerald-400" />
                              <span>Ver Relatório Completo do Atendimento</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}

                    {totalPages > 1 && (
                      <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800" id="provider-completed-pagination">
                        <button
                          type="button"
                          disabled={activeCompletedPage === 1}
                          onClick={() => setCompletedPage(prev => Math.max(prev - 1, 1))}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          Anterior
                        </button>
                        <span className="text-[10px] font-semibold text-slate-400 font-mono">
                          Página {activeCompletedPage} de {totalPages}
                        </span>
                        <button
                          type="button"
                          disabled={activeCompletedPage === totalPages}
                          onClick={() => setCompletedPage(prev => Math.min(prev + 1, totalPages))}
                          className="px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
                        >
                          Próximo
                        </button>
                      </div>
                    )}
                  </>
                );
              })()}
            </div>
          </div>
        </div>
      )}

      {/* Specialty and Activity Management */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-2xl space-y-4" id="provider-activities-manager">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3">
          <div>
            <h3 className="text-base font-black text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              <span>Gerenciador de Atividades e Especialidades (Aprovação M1)</span>
            </h3>
            <p className="text-xs text-slate-400 mt-0.5">Adicione ou remova especialidades. Toda alteração passa por aprovação do ADMIN.</p>
          </div>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3.5">
          {categories.map(cat => {
            const isApproved = provider.categories.includes(cat.id);
            const pendingRequests = provider.pendingCategoriesRequests || [];
            const activePending = pendingRequests.find(r => r.category === cat.id && r.status === 'pending');
            const lastResolved = pendingRequests.find(r => r.category === cat.id && r.status !== 'pending');

            const iconKey = (cat.iconName || cat.icon || 'Wrench') as string;
            const normalizedIconKey = iconKey.charAt(0).toUpperCase() + iconKey.slice(1);
            const IconComponent = (LucideIcons as any)[normalizedIconKey] || (LucideIcons as any)[iconKey] || LucideIcons.Wrench;

            return (
              <div
                key={cat.id}
                className="bg-slate-950 p-4 rounded-2xl border border-slate-850 flex flex-col justify-between space-y-3"
              >
                <div className="flex justify-between items-start gap-2">
                  <div className="flex gap-2.5 items-start">
                    <div className={`p-2 rounded-xl shrink-0 ${isApproved ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-900 text-slate-500'} border border-slate-800`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-200 text-xs sm:text-sm block">{cat.name}</span>
                      <span className="text-[10px] text-slate-400 font-bold block mt-0.5">Mínimo: R$ {cat.basePrice.toFixed(0)}</span>
                    </div>
                  </div>

                  {/* Status Badges */}
                  <div className="text-right">
                    {isApproved ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        Ativa / Aprovada
                      </span>
                    ) : activePending ? (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-amber-500/15 text-amber-400 border border-amber-500/30">
                        Aguardando ADM
                      </span>
                    ) : (
                      <span className="px-2 py-0.5 rounded-full text-[9px] font-bold uppercase tracking-wider bg-slate-900 text-slate-500 border border-slate-800">
                        Inativa
                      </span>
                    )}
                  </div>
                </div>

                {/* Info and Pending Alerts */}
                {activePending && (
                  <p className="text-[10px] text-amber-300 bg-amber-500/5 px-2 py-1.5 rounded-lg border border-amber-500/10 leading-tight">
                    Solicitação pendente para: <strong className="uppercase">{activePending.action === 'add' ? 'Adicionar' : 'Remover'}</strong>
                  </p>
                )}

                {lastResolved && !activePending && (
                  <p className={`text-[9px] leading-tight px-1.5 py-0.5 rounded ${
                    lastResolved.status === 'approved' ? 'text-emerald-400/80' : 'text-rose-400/80'
                  }`}>
                    Última ação: {lastResolved.action === 'add' ? 'Adição' : 'Remoção'} {lastResolved.status === 'approved' ? 'Aprovada' : 'Recusada'}
                  </p>
                )}

                {/* Actions */}
                <div className="pt-1.5 border-t border-slate-900 flex justify-end">
                  {isApproved ? (
                    <button
                      type="button"
                      disabled={!!activePending}
                      onClick={() => requestCategoryChange(cat.id, 'remove')}
                      className="px-3 py-1.5 rounded-xl bg-rose-500/10 hover:bg-rose-500/20 disabled:opacity-50 text-[10px] font-black text-rose-400 border border-rose-500/20 transition-all cursor-pointer"
                    >
                      Remover Atividade
                    </button>
                  ) : (
                    <button
                      type="button"
                      disabled={!!activePending}
                      onClick={() => requestCategoryChange(cat.id, 'add')}
                      className="px-3 py-1.5 rounded-xl bg-emerald-500/10 hover:bg-emerald-500/20 disabled:opacity-50 text-[10px] font-black text-emerald-400 border border-emerald-500/20 transition-all cursor-pointer"
                    >
                      Solicitar Adição
                    </button>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Suggest / Register Custom Activity Form */}
        <div className="mt-4 pt-4 border-t border-slate-800 space-y-3">
          <span className="block text-xs font-bold text-slate-300">💡 Não encontrou sua atividade? Cadastre uma nova especialidade:</span>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customSpecialtyInput}
              onChange={e => setCustomSpecialtyInput(e.target.value)}
              placeholder="Ex: Montador de Móveis, Gesseiro, Dedetizador..."
              className="flex-grow bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500 text-xs"
            />
            <button
              type="button"
              disabled={!customSpecialtyInput.trim()}
              onClick={() => {
                const rawName = customSpecialtyInput.trim();
                const cleanId = rawName.toLowerCase()
                  .normalize('NFD')
                  .replace(/[\u0300-\u036f]/g, '') // remove accents
                  .replace(/[^a-z0-9]+/g, '_') // replace non-alphanumeric with underscores
                  .replace(/^_+|_+$/g, ''); // trim underscores

                if (cleanId) {
                  requestCategoryChange(cleanId, 'add');
                  setCustomSpecialtyInput('');
                  alert(`Sua solicitação para a especialidade "${rawName}" foi enviada com sucesso para a Central M1 e está aguardando homologação!`);
                }
              }}
              className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl transition-all cursor-pointer shadow-md shadow-emerald-500/10"
            >
              Cadastrar Atividade
            </button>
          </div>
          <p className="text-[10px] text-slate-500">Toda atividade cadastrada passa pela moderação do Administrador antes de se tornar ativa.</p>
        </div>
      </div>

      {/* ------------------------------------------------------------- */}
      {/* PIX WITHDRAWAL MODAL                                          */}
      {/* ------------------------------------------------------------- */}
      {isWithdrawModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Wallet className="w-4 h-4 text-emerald-400" />
                <span>Saque Instantâneo via Pix</span>
              </h3>
              <button
                onClick={() => {
                  setIsWithdrawModalOpen(false);
                  setWithdrawResult(null);
                }}
                className="text-slate-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Saldo Disponível:</span>
                <span className="font-mono font-black text-emerald-400 text-sm">
                  R$ {provider.walletBalance.toFixed(2)}
                </span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Chave Pix Cadastrada:</span>
                <span className="font-mono text-slate-200">{provider.pixKey}</span>
              </div>
            </div>

            {withdrawResult ? (
              <div
                className={`p-4 rounded-2xl border text-xs space-y-1.5 ${
                  withdrawResult.success
                    ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                    : 'bg-rose-500/10 border-rose-500/30 text-rose-300'
                }`}
              >
                <p className="font-bold">{withdrawResult.message}</p>
                {withdrawResult.receiptId && (
                  <p className="font-mono text-[10px] text-slate-400">Comprovante ID: {withdrawResult.receiptId}</p>
                )}
              </div>
            ) : (
              <div className="space-y-3 text-xs">
                <div>
                  <label className="block text-slate-300 font-bold mb-1">Valor a Sacar (R$)</label>
                  <input
                    type="number"
                    value={withdrawAmount}
                    onChange={e => setWithdrawAmount(Number(e.target.value))}
                    max={provider.walletBalance}
                    min={1}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500 font-mono font-bold"
                  />
                </div>

                <button
                  onClick={() => {
                    const res = withdrawProviderPix(withdrawAmount);
                    setWithdrawResult(res);
                  }}
                  disabled={withdrawAmount <= 0 || withdrawAmount > provider.walletBalance}
                  className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:opacity-50 text-slate-950 font-black text-xs rounded-xl cursor-pointer shadow-md shadow-emerald-500/20"
                >
                  Confirmar Transferência Pix
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------- */}
      {/* SETTINGS MODAL                                                */}
      {/* ------------------------------------------------------------- */}
      {isSettingsOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl max-w-md w-full p-6 shadow-2xl space-y-4 max-h-[90vh] flex flex-col">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-shrink-0">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-emerald-400" />
                <span>Configurações e Edição de Perfil</span>
              </h3>
              <button onClick={() => setIsSettingsOpen(false)} className="text-slate-400 hover:text-white cursor-pointer">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs overflow-y-auto pr-1 flex-grow scrollbar-thin scrollbar-thumb-slate-850">
              <div>
                <label className="block text-slate-300 font-bold mb-1">Raio de Atendimento: {selectedRadius} km</label>
                <input
                  type="range"
                  min={5}
                  max={50}
                  step={5}
                  value={selectedRadius}
                  onChange={e => setSelectedRadius(Number(e.target.value))}
                  className="w-full accent-emerald-500 cursor-pointer"
                />
              </div>

              <div className="border-t border-slate-800 pt-3.5 space-y-3">
                <h4 className="text-[11px] uppercase tracking-wider text-emerald-400 font-black">Dados para Homologação do ADM M1</h4>
                
                {/* Photo de Rosto / Selfie Section */}
                <div className="flex items-center gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-850">
                  <img
                    src={avatarInput || provider.avatar || provider.documents?.facePhoto || provider.documents?.facePhotoUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80'}
                    alt="Selfie"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800 bg-slate-900"
                    referrerPolicy="no-referrer"
                  />
                  <div className="flex-1 space-y-1">
                    <label className="block text-[10px] text-slate-400 font-bold uppercase">Foto de Rosto (Selfie) de Identificação</label>
                    <input
                      type="file"
                      accept="image/*"
                      onChange={e => {
                        const file = e.target.files?.[0];
                        if (file) {
                          const reader = new FileReader();
                          reader.onload = () => {
                            setAvatarInput(reader.result as string);
                          };
                          reader.readAsDataURL(file);
                        }
                      }}
                      className="text-[9px] text-slate-400 cursor-pointer w-full"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Nome Completo</label>
                  <input
                    type="text"
                    value={fullNameInput}
                    onChange={e => setFullNameInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                    placeholder="Ex: Carlos Alberto"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Telefone (WhatsApp)</label>
                  <input
                    type="text"
                    value={phoneInput}
                    onChange={e => setPhoneInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500 font-mono"
                    placeholder="Ex: (11) 98765-4321"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Cidade de Atendimento</label>
                  <input
                    type="text"
                    value={cityInput}
                    onChange={e => setCityInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                    placeholder="Ex: São Paulo, SP"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Veículo de Trabalho</label>
                  <input
                    type="text"
                    value={vehicleModelInput}
                    onChange={e => setVehicleModelInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500"
                    placeholder="Ex: Moto Honda Titan"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Placa do Veículo</label>
                  <input
                    type="text"
                    value={vehiclePlateInput}
                    onChange={e => setVehiclePlateInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500 uppercase font-mono"
                    placeholder="Ex: ABC-1234"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Chave PIX de Recebimento</label>
                  <input
                    type="text"
                    value={pixKeyInput}
                    onChange={e => setPixKeyInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500 font-mono"
                    placeholder="Sua chave de transferências"
                  />
                </div>

                <div>
                  <label className="block text-slate-400 font-bold mb-1">Conta Bancária de Recebimento</label>
                  <input
                    type="text"
                    value={bankAccountInput}
                    onChange={e => setBankAccountInput(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-700 rounded-xl p-2.5 text-white outline-none focus:border-emerald-500 font-mono"
                    placeholder="Ex: Banco Itaú • Ag 0001 • CC 12345-6"
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                // 1. Save non-sensitive settings immediately
                updateProviderSettings({
                  radiusKm: selectedRadius,
                  categories: selectedCategories
                });

                // 2. Detect changes in sensitive profile data and submit requests
                let profileRequestsTriggered = false;

                if (fullNameInput.trim() && fullNameInput !== provider.name) {
                  submitProfileEditRequest(provider.id, 'name', 'Nome Completo', provider.name, fullNameInput);
                  profileRequestsTriggered = true;
                }
                if (phoneInput.trim() && phoneInput !== provider.phone) {
                  submitProfileEditRequest(provider.id, 'phone', 'Telefone', provider.phone, phoneInput);
                  profileRequestsTriggered = true;
                }
                if (cityInput.trim() && cityInput !== provider.city) {
                  submitProfileEditRequest(provider.id, 'city', 'Cidade', provider.city, cityInput);
                  profileRequestsTriggered = true;
                }
                if (vehicleModelInput !== provider.vehicleModel) {
                  submitProfileEditRequest(provider.id, 'vehicleModel', 'Veículo', provider.vehicleModel, vehicleModelInput);
                  profileRequestsTriggered = true;
                }
                if (vehiclePlateInput !== provider.vehiclePlate) {
                  submitProfileEditRequest(provider.id, 'vehiclePlate', 'Placa do Veículo', provider.vehiclePlate, vehiclePlateInput);
                  profileRequestsTriggered = true;
                }
                if (pixKeyInput !== provider.pixKey) {
                  submitProfileEditRequest(provider.id, 'pixKey', 'Chave PIX', provider.pixKey, pixKeyInput);
                  profileRequestsTriggered = true;
                }
                const oldBank = (provider as any).bankAccount || '';
                if (bankAccountInput !== oldBank) {
                  submitProfileEditRequest(provider.id, 'bankAccount', 'Dados Bancários', oldBank, bankAccountInput);
                  profileRequestsTriggered = true;
                }
                if (avatarInput && avatarInput !== provider.avatar) {
                  submitProfileEditRequest(provider.id, 'avatar', 'Foto de Rosto (Selfie)', 'Foto Anterior', avatarInput);
                  profileRequestsTriggered = true;
                }

                if (profileRequestsTriggered) {
                  alert("✅ Suas solicitações de alteração de perfil foram enviadas em tempo real para a Linha do Tempo e Central de Alarmes do Admin M1! Elas serão analisadas e aplicadas assim que homologadas.");
                } else {
                  alert("Preferências atualizadas com sucesso!");
                }

                setIsSettingsOpen(false);
              }}
              className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black text-xs rounded-xl cursor-pointer flex-shrink-0"
            >
              Salvar Alterações
            </button>
          </div>
        </div>
      )}

      {/* MODAL DE RELATÓRIO COMPLETO DO ATENDIMENTO */}
      {selectedHistoryService && (
        <ProviderHistoryReportModal
          service={selectedHistoryService}
          onClose={() => setSelectedHistoryService(null)}
          onZoomPhoto={(url) => setZoomedPhotoUrl(url)}
        />
      )}

      {/* CHAT MODAL (ChatModal removed in favor of external WhatsApp integration) */}
    </div>
  );
};
