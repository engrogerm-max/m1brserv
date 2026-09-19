export type UserRole = 'client' | 'provider' | 'admin';

export type ServiceCategory = string;

export interface CategoryInfo {
  id: ServiceCategory;
  name: string;
  iconName: string;
  icon?: string;
  description: string;
  basePrice: number;
  badgeColor: string;
  defaultEtaMinutes: number;
  averageExecutionMinutes: number;
}

export type ServiceStatus =
  | 'solicitado'               // Publicado / Criado
  | 'aguardando_despacho_admin' // Em análise pelo Administrador para indicação de prestador
  | 'despachado_prestador'      // Admin indicou o prestador, aguardando o prestador aceitar ou recusar
  | 'aceito_pelo_prestador'    // Prestador aceitou, aguardando Admin encaminhar para o Cliente
  | 'aguardando_confirmacao_cliente' // Admin encaminhou, aguardando Cliente aprovar o preço
  | 'valor_aprovado_cliente'    // Cliente aceitou o preço proposto, aguardando despacho do admin para o prestador
  | 'negociando'               // Recebendo propostas / orçamentos de profissionais credenciados
  | 'proposta_aceita'          // Proposta aceita / confirmado
  | 'em_deslocamento'          // Profissional a caminho no mapa GPS ao vivo
  | 'chegou_ao_local'          // Profissional chegou no endereço do cliente
  | 'em_execucao'              // Execução em andamento (Fotos de ANTES registradas)
  | 'relatorio_enviado'        // Relatório fotográfico ANTES/DEPOIS enviado para validação
  | 'aguardando_confirmacao_pagamento' // Cliente enviou o Pix, aguardando confirmação do Admin M1
  | 'concluido_pago'           // Aprovado pelo cliente, pagamento liberado e avaliado
  | 'cancelado';

export interface MediaItem {
  id: string;
  type: 'photo' | 'video';
  url: string;
  thumbnailUrl?: string;
  timestamp: string;
  caption?: string;
}

export interface ServiceAddress {
  street: string;
  number: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  complement?: string;
  referencePoint?: string;
}

export interface PhotoReportItem {
  id: string;
  label: string;
  completed: boolean;
}

export interface PhotoReport {
  beforePhotos: MediaItem[];
  afterPhotos: MediaItem[];
  notes: string;
  checklist: PhotoReportItem[];
  materialsUsed?: string;
  futureRecommendations?: string; // Orientações e observações futuras da atividade (OPCIONAL)
  videoUrl?: string; // Vídeo curto do serviço realizado
  timeSpentMinutes: number;
  submittedAt: string;
  approvedAt?: string;
}

export interface ServiceRating {
  id: string;
  serviceId: string;
  serviceCode: string;
  serviceTitle: string;
  clientId: string;
  clientName: string;
  providerId: string;
  providerName: string;
  score: number; // 1 to 5
  comment: string;
  tags: string[];
  createdAt: string;
  tipAmount?: number;
  moderated?: boolean;
}

export interface ServicePayment {
  totalAmount: number;
  platformFeeAmount: number; // ex: 15% (valor da porcentagem indicada do serviço)
  providerPayoutAmount: number; // 85%
  status: 'pending' | 'held' | 'paid_to_provider' | 'paid_direct_to_provider';
  method: 'pix' | 'credit_card' | 'app_wallet' | 'direct_to_provider' | 'dinheiro' | 'cartao';
  pixCode?: string;
  paidAt?: string;
  clientPaidDirectlyAt?: string;
  clientPaymentMethod?: 'pix' | 'dinheiro' | 'cartao';
  providerTransferredFee?: boolean;
  providerTransferredFeeAt?: string;
  providerFeeReceiptNotes?: string;
  adminConfirmedAt?: string;
  adminConfirmedBy?: string;
}

export interface ChatMessage {
  id: string;
  senderRole: 'client' | 'provider' | 'system' | 'admin';
  senderName: string;
  text: string;
  mediaUrl?: string;
  timestamp: string;
}

// Negociação de Propostas
export interface ServiceProposal {
  id: string;
  serviceId: string;
  providerId: string;
  providerName: string;
  providerAvatar: string;
  providerPhone: string;
  providerRating: number;
  providerCompletedJobs: number;
  providerVehicle: string;
  providerPlate: string;
  proposedPrice: number;
  estimatedArrivalMinutes: number;
  message: string;
  createdAt: string;
  status: 'pending' | 'accepted' | 'rejected' | 'counter_offered';
  counterPrice?: number;
}

export interface ServiceRequest {
  id: string;
  code: string; // Ex: #SRV-8942
  clientId: string;
  clientName: string;
  clientAvatar: string;
  clientPhone: string;
  
  // Dados do Profissional - APENAS revelados após o aceite/negociação
  providerId?: string;
  providerName?: string;
  providerAvatar?: string;
  providerPhone?: string;
  providerRating?: number;
  providerVehicle?: string;
  providerPlate?: string;
  providerPixKey?: string;

  // Despacho e Indicação Exclusiva do Administrador
  assignedProviderId?: string;
  assignedProviderName?: string;
  assignedProviderAvatar?: string;
  assignedProviderPhone?: string;
  dispatchedAt?: string;
  dispatchedByAdmin?: boolean;
  rejectedByProviderIds?: string[];
  
  category: ServiceCategory;
  title: string;
  description: string;
  additionalNotes?: string;
  urgency: 'imediato' | 'agendado';
  scheduledFor?: string;
  media: MediaItem[];
  address: ServiceAddress;
  estimatedPrice: number;
  status: ServiceStatus;
  createdAt: string;
  negotiatedPrice?: number;
  proposals: ServiceProposal[];
  
  acceptedAt?: string;
  arrivedAt?: string;
  startedExecutionAt?: string;
  completedAt?: string;
  photoReport?: PhotoReport;
  rating?: ServiceRating;
  payment: ServicePayment;
  chat: ChatMessage[];
  chatMessages?: ChatMessage[];
  providerChatReleased?: boolean;
  
  // GPS Tracking ao vivo
  providerCurrentLat?: number;
  providerCurrentLng?: number;
  estimatedArrivalMinutes?: number;
  slaMaxArrivalMinutes?: number;

  wasRefusedByClient?: boolean;
  wasRefusedByProvider?: boolean;
  refusalReason?: string;
  refusalTimestamp?: number;
  viewedByAdmin?: boolean;

  createdEpoch?: number;
  dispatchedEpoch?: number;
  acceptedEpoch?: number;
  providerArrivedAt?: number;
  clientConfirmedArrival?: boolean;
  clientConfirmedArrivalAt?: number;
  timeoutGeralExcedido?: boolean;
  clientAcknowledgedAwaiting?: boolean;
  cancellationReason?: string;
  cancellationFutureAction?: string;
  cancelledAt?: string;
  cancelledBy?: string;
  isArchived?: boolean;
  archivedAt?: string;
  archivedEpoch?: number;
  archivedBy?: string;
  archivedNotes?: string;
  osDetails?: {
    osCode: string;
    date: string;
    time: string;
    local: string;
    value: number;
    status: string;
  };
  statusHistory?: {
    status: string;
    timestamp: string; // "DD/MM/YYYY às HH:MM:SS"
    label: string;
    description: string;
  }[];
}

export interface ProviderDocuments {
  facePhoto?: string;
  facePhotoUrl?: string; // Foto de rosto / selfie
  idPhoto?: string;
  documentPhotoUrl?: string; // RG / CNH com foto
  documentPhoto?: string;
  proofOfAddress?: string;
  addressProofUrl?: string; // Comprovante de endereço
  addressProof?: string;
  criminalRecord?: string;
  criminalRecordProofUrl?: string; // Certidão negativa de antecedentes criminais
  criminalRecordProof?: string;
  certificatesPhoto?: string;
  submittedAt?: string;
  verifiedByAdmin?: boolean;
  notes?: string;
}

export interface ProviderLicensePayment {
  id: string;
  amount: number;
  paymentMethod: string; // 'PIX'
  paidAt: string;
  status: 'paid' | 'pending';
  referencePeriod: string; // e.g. "Setembro/2026", "Credenciamento"
}

export interface ProviderProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  city: string;
  categories: ServiceCategory[];
  radiusKm: number;
  pixKey: string;
  isOnline: boolean;
  rating: number;
  totalReviews: number;
  completedJobsCount: number;
  lat: number;
  lng: number;
  walletBalance: number;
  pendingBalance: number;
  totalEarned: number;
  verified: boolean;
  documentNumber: string;
  vehicleModel: string;
  vehiclePlate: string;
  commissionRatePercent: number; // default 15
  status: 'active' | 'under_review' | 'suspended' | 'aguardando_liberacao_admin' | 'pending_registration';
  bio: string;
  pendingCategoriesRequests?: {
    category: ServiceCategory;
    action: 'add' | 'remove';
    status: 'pending' | 'approved' | 'rejected';
    requestedAt: string;
  }[];
  
  // Documentos Completos Obrigatórios para Aprovação pelo ADM
  documents?: ProviderDocuments;
  
  // Controle de Acesso e Senha Gerada pelo Administrador
  accessPassword?: string;
  isAuthorized: boolean;
  authorizedAt?: string;
  lastLoginAt?: string;
  tempPassword?: string;
  
  // Taxa de Credenciamento / Pagamentos para Trabalhar
  registrationFeePaid?: boolean;
  paymentPendingValidation?: boolean;
  registrationFeeAmount?: number;
  licensePayments?: ProviderLicensePayment[];

  // Novos campos obrigatórios de cadastro expandido
  fullName?: string;
  cpf?: string;
  address?: string;
  serviceRegion?: string;
  serviceRadius?: number;
  bankAccount?: string;
  cnpj?: string;
  bloodType?: string;
  allergies?: string;
  continuousMeds?: string;
  chronicDiseases?: string;
  education?: string;
  certificates?: string[];
  professionalExp?: string;
  dailyAvailability?: string;
  providedServices?: string[];
}

export interface ClientProfile {
  id: string;
  name: string;
  avatar: string;
  email: string;
  phone: string;
  whatsapp?: string;
  cpf: string;
  city: string;
  defaultAddress: ServiceAddress;
  isLocationConfirmed?: boolean;
  locationConfirmedAt?: string;
  totalRequests: number;
  status: 'active' | 'blocked';
  notes?: string;
  registeredAt: string;
  isRegistered?: boolean;
  rating?: number;
  password?: string;
}

export interface PlatformTransaction {
  id: string;
  serviceId: string;
  serviceCode: string;
  serviceTitle: string;
  providerName: string;
  clientName: string;
  totalAmount: number;
  platformFee: number;
  providerPayout: number;
  type: 'service_payout' | 'pix_withdrawal' | 'refund';
  status: 'completed' | 'processing';
  timestamp: string;
}

// Alarmes e Notificações Administrativas
export interface AdminAlarm {
  id: string;
  level: 'info' | 'warning' | 'critical' | 'success';
  title: string;
  description: string;
  category: 
    | 'new_registration' 
    | 'new_request' 
    | 'proposal_negotiated' 
    | 'accepted_en_route' 
    | 'arrived' 
    | 'execution' 
    | 'photo_report' 
    | 'payment_pix' 
    | 'delay_alert'
    | 'rating_received';
  serviceId?: string;
  clientId?: string;
  providerId?: string;
  timestamp: string;
  acknowledged: boolean;
  soundPlayed?: boolean;
}

export interface NotificationAlert {
  id: string;
  type: 
    | 'incoming_job' 
    | 'job_accepted' 
    | 'provider_arrived' 
    | 'report_submitted' 
    | 'job_completed' 
    | 'payout_received'
    | 'proposal_received'
    | 'proposal_accepted'
    | 'status_update';
  title: string;
  message: string;
  targetRole: UserRole;
  serviceId?: string;
  clientId?: string;
  providerId?: string;
  timestamp: string;
  read: boolean;
}

// Configurações Globais Editáveis no Banco de Dados
export interface AppSettings {
  companyName: string; // "M1 SERV"
  tagline: string;
  website: string; // "www.m1br.com.br"
  email: string; // "rogerio@m1br.com.br"
  supportWhatsapp: string; // "(11)96212-2694"
  emergencyPhone: string;
  city?: string;
  
  platformFeePercent: number; // 15%
  providerLicenseFee?: number; // default value e.g. 150 for license fee to work
  providerLicenseFeePeriod?: 'weekly' | 'monthly' | 'daily' | 'one_time' | 'annual'; // Billing period for the provider license fee
  providerLicenseFeeAutoBilling?: boolean; // Automatic billing mode active flag
  defaultEtaMinutes: number; // 15
  slaDelayThresholdMinutes: number; // 25
  alarmSoundEnabled: boolean;
  alarmVolume: number;
  autoDispatch: boolean;
  minServicePrice: number;
  
  // Pagamento Manual e API de Pagamento
  paymentMode: 'manual_pix' | 'api_gateway';
  pixReceiverKey: string; // "rogerio@m1br.com.br"
  pixReceiverBank: string; // "Banco Inter / Bradesco"
  pixReceiverName: string; // "M1 BRASIL SERVICOS TECNICOS"
  pixReceiverAgency?: string; // "Agência (ex: 0001)"
  pixReceiverAccount?: string; // "Conta Corrente (ex: 12345-6)"
  pixReceiverCnpj?: string; // "CNPJ (ex: 12.345.678/0001-90)"
  pixReceiverType?: string; // "Tipo de Chave Pix (ex: E-mail, CNPJ)"
  
  // Configuração API de Pagamento (Mercado Pago, Asaas, Stripe, etc.)
  paymentApiProvider: 'mercadopago' | 'asaas' | 'stripe' | 'custom';
  paymentApiKey?: string;
  paymentApiSecret?: string;
  paymentWebhookUrl?: string;
  paymentApiActive?: boolean;
  
  // Google Maps API (Opcional - Leaflet já funciona grátis por padrão)
  googleMapsApiKey?: string;
  
  // Segurança Administrativa
  adminPassword: string; // Senha padrão: "admin123"
  adminMasterPin: string; // PIN Mestre: "1234"
  requireAdminPasswordEveryTime?: boolean;
  clientBannerMessage?: string;
  clientInstructionText?: string;
  autoApproveProviders?: boolean;

  // Customização dos Campos de Solicitação do Cliente ("Descreva o Atendimento que Você Precisa")
  clientFormHeaderTitle?: string;
  clientFormHeaderSubtitle?: string;
  clientFormTitleLabel?: string;
  clientFormTitlePlaceholder?: string;
  clientFormDescLabel?: string;
  clientFormDescPlaceholder?: string;
  clientFormNotesLabel?: string;
  clientFormNotesPlaceholder?: string;
  clientFormMediaLabel?: string;
  clientFormMediaHelp?: string;
  clientFormUrgencyLabel?: string;
  clientFormUrgencyImmediate?: string;
  clientFormUrgencyScheduled?: string;
  clientFormSubmitBtnText?: string;
  
  // Customização de Textos, Cores e Imagens
  clientPageTitle?: string;
  clientPageSubtitle?: string;
  clientBannerImage?: string;
  clientThemeColor?: 'red' | 'emerald' | 'blue' | 'indigo' | 'amber' | 'purple' | 'cyan';
  clientBgStyle?: 'dark' | 'light';

  providerPageTitle?: string;
  providerPageSubtitle?: string;
  providerBannerImage?: string;
  providerThemeColor?: 'red' | 'emerald' | 'blue' | 'indigo' | 'amber' | 'purple' | 'cyan';
  providerBgStyle?: 'dark' | 'light';

  adminPageTitle?: string;
  adminPageSubtitle?: string;
  adminThemeColor?: 'red' | 'emerald' | 'blue' | 'indigo' | 'amber' | 'purple' | 'cyan';
  adminBgStyle?: 'dark' | 'light';

  // Configurações de Personalização Avançada (Logo, Fundos e Fontes)
  mainLogoUrl?: string;
  
  clientBgImage?: string;
  clientFontFamily?: 'sans' | 'serif' | 'mono' | 'jakarta' | 'playfair' | 'grotesk' | 'roboto';
  
  providerBgImage?: string;
  providerFontFamily?: 'sans' | 'serif' | 'mono' | 'jakarta' | 'playfair' | 'grotesk' | 'roboto';
  
  adminBgImage?: string;
  adminFontFamily?: 'sans' | 'serif' | 'mono' | 'jakarta' | 'playfair' | 'grotesk' | 'roboto';

  // Escolha de Cores do Fundo do App (Geral para Clientes, Prestadores e Admin)
  appBackgroundTheme?: 'dark_slate' | 'pitch_black' | 'navy_blue' | 'high_visibility_dark' | 'light_gray' | 'soft_cream';

  // Automatizações Operacionais (Auto-Pilot)
  autoActionsEnabled?: boolean;
  autoDirectDispatch?: boolean;
  autoPredefinedPrice?: number;
  autoApproveServiceReport?: boolean;
}

export interface ProfileEditRequest {
  id: string;
  providerId: string;
  providerName: string;
  timestamp: string;
  acknowledged: boolean;
  status: 'pending' | 'approved' | 'rejected';
  field: string;
  fieldName: string;
  oldValue: string;
  newValue: string;
  categoryAction?: 'add' | 'remove';
}

export interface SyncEvent {
  id: string;
  type:
    | 'service_created'
    | 'service_dispatched'
    | 'service_accepted'
    | 'service_rejected'
    | 'proposal_submitted'
    | 'proposal_accepted'
    | 'proposal_rejected'
    | 'service_completed'
    | 'service_paid'
    | 'report_submitted'
    | 'report_approved'
    | 'report_rejected'
    | 'chat_message'
    | 'alarm_triggered'
    | 'general_update'
    | 'provider_online'
    | 'provider_offline';
  title: string;
  message: string;
  sound: 'incoming' | 'radar' | 'success' | 'cash' | 'alarm' | 'message';
  role: 'client' | 'provider' | 'admin' | 'system';
  userId?: string;
  serviceId?: string;
  timestamp: number;
}

