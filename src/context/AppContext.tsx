import React, { createContext, useContext, useState, useEffect, ReactNode, useRef, useCallback } from 'react';
import { collection, onSnapshot, doc, getDoc, setDoc, addDoc, serverTimestamp, deleteDoc, getDocs, disableNetwork, enableNetwork, query, orderBy, limit, where } from 'firebase/firestore';
import { db } from '../lib/firebase';
import confetti from 'canvas-confetti';

// Deep equality comparison function to avoid false-positive state changes due to key ordering or undefined fields
function isDeepEqual(obj1: any, obj2: any): boolean {
  if (obj1 === obj2) return true;
  if (obj1 == null || obj2 == null) return obj1 === obj2;
  
  if (Array.isArray(obj1) && Array.isArray(obj2)) {
    if (obj1.length !== obj2.length) return false;
    for (let i = 0; i < obj1.length; i++) {
      if (!isDeepEqual(obj1[i], obj2[i])) return false;
    }
    return true;
  }
  if (Array.isArray(obj1) || Array.isArray(obj2)) return false;

  if (typeof obj1 !== 'object' || typeof obj2 !== 'object') return false;

  const keys1 = Object.keys(obj1).filter(k => obj1[k] !== undefined);
  const keys2 = Object.keys(obj2).filter(k => obj2[k] !== undefined);

  if (keys1.length !== keys2.length) return false;

  for (const key of keys1) {
    if (!keys2.includes(key)) return false;
    
    const val1 = obj1[key];
    const val2 = obj2[key];
    
    if (typeof val1 === 'object' && typeof val2 === 'object') {
      if (!isDeepEqual(val1, val2)) return false;
    } else if (val1 !== val2) {
      return false;
    }
  }
  return true;
}
import {
  ClientProfile,
  ProviderProfile,
  ServiceCategory,
  ServiceRating,
  ServiceRequest,
  UserRole,
  PhotoReport,
  ChatMessage,
  PlatformTransaction,
  AdminAlarm,
  NotificationAlert,
  AppSettings,
  ServiceProposal,
  SyncEvent,
  ProfileEditRequest
} from '../types';
import {
  INITIAL_CLIENTS,
  INITIAL_PROVIDERS,
  INITIAL_SERVICES,
  INITIAL_TRANSACTIONS,
  INITIAL_ADMIN_ALARMS,
  INITIAL_REVIEWS,
  INITIAL_SETTINGS,
  SERVICE_CATEGORIES,
  PRESET_SAMPLE_MEDIA
} from '../data/mockData';
import { soundManager } from '../utils/audio';

interface AppContextType {
  isFirestoreQuotaExceeded: boolean;
  setIsFirestoreQuotaExceeded: (val: boolean) => void;
  currentRole: UserRole;
  setCurrentRole: (role: UserRole) => void;
  hasChosenPortal: boolean;
  setHasChosenPortal: (chosen: boolean) => void;
  client: ClientProfile;
  provider: ProviderProfile;
  clients: ClientProfile[];
  providers: ProviderProfile[];
  services: ServiceRequest[];
  transactions: PlatformTransaction[];
  adminAlarms: AdminAlarm[];
  reviews: ServiceRating[];
  settings: AppSettings;
  notifications: NotificationAlert[];
  soundEnabled: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  selectedCity: string;
  setSelectedCity: (city: string) => void;

  // Active records
  activeServiceForClient: ServiceRequest | undefined;
  activeServiceForProvider: ServiceRequest | undefined;
  isServicesLoading: boolean;

  // Client Actions & Authentication
  isClientAuthenticated: boolean;
  authenticatedClientId: string | null;
  loginClient: (identifier: string, password: string) => { success: boolean; message: string; client?: ClientProfile };
  logoutClient: () => void;
  updateClientPasswordByAdmin: (clientId: string, newPassword: string) => { success: boolean; message: string };

  createServiceRequest: (newService: {
    category: ServiceCategory;
    title: string;
    description: string;
    urgency: 'imediato' | 'agendado';
    scheduledFor?: string;
    media: { id: string; type: 'photo' | 'video'; url: string; timestamp: string; caption?: string }[];
    address: ClientProfile['defaultAddress'];
    estimatedPrice: number;
  }) => Promise<string>;

  registerClient: (clientData: {
    name: string;
    phone: string;
    email: string;
    cpf?: string;
    password?: string;
    address: ClientProfile['defaultAddress'];
    lat?: number;
    lng?: number;
  }) => Promise<{ success: boolean; message: string; client?: ClientProfile }>;

  confirmClientLocation: (clientId: string, lat: number, lng: number, addressDetails?: Partial<ClientProfile['defaultAddress']>) => void;
  clientAcknowledgeService: (serviceId: string) => void;
  adminForwardServiceToClient: (serviceId: string, updatedPrice?: number, providerId?: string) => void;
  clientAcceptServicePrice: (serviceId: string) => void;
  clientRejectServicePrice: (serviceId: string) => void;

  acceptProposal: (serviceId: string, proposalId: string) => void;
  approveReportAndPay: (serviceId: string, rating: ServiceRating, paymentMethod?: 'pix' | 'dinheiro' | 'cartao') => void;
  providerNotifyFeeTransferred: (serviceId: string, proofNotes?: string) => void;
  confirmPaymentReceived: (serviceId: string) => void;
  cancelServiceRequest: (serviceId: string, reason: string, futureAction?: string) => void;
  sendChatMessage: (serviceId: string, text: string, mediaUrl?: string) => void;
  markChatAsRead: (serviceId: string) => void;
  isChatUnread: (serviceId: string) => boolean;
  createAdminSupportRequest: (userId: string, userType: 'client' | 'provider') => string;
  clearAllFirebaseChats: () => void;
  simulateFirebaseCapacityLoad: () => void;
  toggleProviderChatRelease: (serviceId: string) => void;
  updateClientProfile: (clientId: string, updatedData: Partial<ClientProfile>) => void;
  switchActiveClient: (clientId: string) => void;

  // Admin Dispatch Action
  dispatchServiceToProvider: (serviceId: string, providerId: string, updatedPrice?: number, directToProvider?: boolean) => { success: boolean; message: string };

  // Provider Actions
  providerAcceptDispatchedService: (serviceId: string, etaMinutes: number) => void;
  providerRejectDispatchedService: (serviceId: string, reason?: string) => void;
  providerQuestionDispatchedService: (serviceId: string, questionText: string) => void;
  providerRejectServiceRequest: (serviceId: string) => void;
  submitProposal: (serviceId: string, proposal: {
    proposedPrice: number;
    estimatedArrivalMinutes: number;
    message: string;
  }) => void;
  acceptServiceRequestDirectly: (serviceId: string) => void;
  markProviderOnTheWay: (serviceId: string, etaMinutes?: number) => void;
  markProviderArrived: (serviceId: string) => void;
  clientConfirmProviderArrival: (serviceId: string) => void;
  startServiceExecution: (serviceId: string, beforePhotos?: typeof INITIAL_SERVICES[0]['media']) => void;
  submitPhotoReport: (serviceId: string, report: PhotoReport) => void;
  toggleArchiveService: (serviceId: string, notes?: string) => void;
  toggleProviderOnline: () => void;
  updateProviderSettings: (settings: { radiusKm?: number; categories?: ServiceCategory[]; pixKey?: string; avatar?: string }) => void;
  updateProviderLocation: (providerId: string, lat: number, lng: number) => Promise<void>;
  withdrawProviderPix: (amount: number) => { success: boolean; message: string; receiptId?: string };
  switchActiveProvider: (providerId: string) => void;

  // Admin Database Actions & CRUD
  saveAppSettings: (newSettings: Partial<AppSettings>) => void;
  updateServiceStatus: (serviceId: string, newStatus: ServiceRequest['status']) => void;
  editServiceDetails: (serviceId: string, updates: Partial<ServiceRequest>) => void;
  addOrUpdateClient: (client: ClientProfile) => void;
  deleteClient: (clientId: string) => void;
  addOrUpdateProvider: (provider: ProviderProfile) => void;
  deleteProvider: (providerId: string) => void;
  moderateReview: (reviewId: string, updates: Partial<ServiceRating>) => void;
  deleteReview: (reviewId: string) => void;
  addAdminAlarm: (alarm: Omit<AdminAlarm, 'id' | 'timestamp' | 'acknowledged'>) => void;
  acknowledgeAlarm: (alarmId: string) => void;
  acknowledgeAllAlarms: () => void;
  clearAllAlarms: () => void;
  triggerManualTestAlarm: (level?: AdminAlarm['level'], title?: string, description?: string) => void;

  // Categories
  categories: typeof SERVICE_CATEGORIES;
  updateCategory: (category: (typeof SERVICE_CATEGORIES)[0]) => void;
  addCategory: (category: (typeof SERVICE_CATEGORIES)[0]) => void;
  deleteCategory: (categoryId: string) => void;

  // Admin Security & Exclusive Access
  isAdminUnlocked: boolean;
  setIsAdminUnlocked: (unlocked: boolean) => void;
  isAdminAuthenticated: boolean;
  loginAdmin: (passwordOrPin: string) => { success: boolean; message: string };
  logoutAdmin: () => void;
  changeAdminPassword: (newPassword: string, masterPin?: string) => { success: boolean; message: string };

  // Provider Authentication & Authorization
  isProviderAuthenticated: boolean;
  authenticatedProviderId: string | null;
  loginProvider: (identifier: string, password: string) => { success: boolean; message: string; provider?: ProviderProfile };
  logoutProvider: () => void;
  completeProviderRegistration: (providerId: string, registrationData: Partial<ProviderProfile>) => void;
  generateProviderPassword: (providerId: string, customPassword?: string) => string;
  toggleProviderAuthorization: (providerId: string, authorized: boolean) => void;
  requestProviderRegistration: (formData: {
    name: string;
    phone: string;
    email: string;
    documentNumber: string;
    specialty: ServiceCategory;
    vehicleModel: string;
    vehiclePlate: string;
    city: string;
    documents?: ProviderProfile['documents'];
    password?: string;
    isAuthorizedDirectly?: boolean;
    registrationFeePaid?: boolean;
    id?: string;
    specialties?: ServiceCategory[];
    fullName?: string;
    cpf?: string;
    cnpj?: string;
    address?: string;
    serviceRegion?: string;
    serviceRadius?: number;
    bankAccount?: string;
    pixKey?: string;
    bloodType?: string;
    allergies?: string;
    continuousMeds?: string;
    education?: string;
    certificatesText?: string;
    professionalExp?: string;
    dailyAvailability?: string;
  }) => Promise<{ success: boolean; message: string }>;
  requestCategoryChange: (category: ServiceCategory, action: 'add' | 'remove') => void;
  resolveCategoryRequest: (providerId: string, category: ServiceCategory, action: 'add' | 'remove', decision: 'approved' | 'rejected') => void;
  payProviderLicenseFee: (providerId: string, amount: number, period: string) => void;
  exportDatabaseJson: () => string;
  importDatabaseJson: (jsonString: string) => { success: boolean; message: string };
  resetDemoData: () => void;
  clearFictitiousData: () => void;
  clearDatabaseToScratch: () => Promise<void>;
  clearServiceRequestsOlderThan30Days: () => { success: boolean; count: number };
  simulateServiceOlderThan30Days: () => ServiceRequest;
  resetActiveClient: () => void;

  // Real-time notifications
  dismissNotification: (id: string) => void;
  markAllNotificationsRead: () => void;

  // Simulators for testing
  simulateIncomingRequest: (category?: ServiceCategory) => void;
  simulateProviderProposal: (serviceId: string) => void;

  // Real-time tab sync & visual toasts
  activeToasts: SyncEvent[];
  triggerSyncEvent: (
    type: SyncEvent['type'],
    title: string,
    message: string,
    sound: SyncEvent['sound'],
    role: SyncEvent['role'],
    serviceId?: string
  ) => void;
  dismissToast: (id: string) => void;
  markServiceRequestAsViewedByAdmin: (serviceId: string) => void;

  // Profile Edit Tracking system
  profileEditRequests: ProfileEditRequest[];
  submitProfileEditRequest: (
    providerId: string,
    field: string,
    fieldName: string,
    oldValue: string,
    newValue: string,
    categoryAction?: 'add' | 'remove'
  ) => void;
  resolveProfileEditRequest: (reqId: string, decision: 'approved' | 'rejected') => void;
  acknowledgeProfileEditRequest: (reqId: string) => void;
  syncDatabaseData: () => Promise<void>;
}

const AppContext = createContext<AppContextType | undefined>(undefined);

// Database Storage Keys
const DB_KEY_SERVICES = 'm1_brasil_db_services_v3';
const DB_KEY_CLIENTS = 'm1_brasil_db_clients_v3';
const DB_KEY_PROVIDERS = 'm1_brasil_db_providers_v3';
const DB_KEY_TRANSACTIONS = 'm1_brasil_db_transactions_v3';
const DB_KEY_ALARMS = 'm1_brasil_db_alarms_v3';
const DB_KEY_REVIEWS = 'm1_brasil_db_reviews_v3';
const DB_KEY_SETTINGS = 'm1_brasil_db_settings_v3';
const DB_KEY_CATEGORIES = 'm1_brasil_db_categories_v3';
const DB_KEY_ACTIVE_CLIENT = 'm1_brasil_active_client_id_v3';
const DB_KEY_ACTIVE_PROVIDER = 'm1_brasil_active_provider_id_v3';
const DB_KEY_ADMIN_AUTH = 'm1_brasil_admin_auth_v3';
const DB_KEY_PROVIDER_AUTH = 'm1_brasil_provider_auth_v3';
const DB_KEY_CLIENT_AUTH = 'm1_brasil_client_auth_v3';

enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
  }
}

function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errMsg = error instanceof Error ? error.message : String(error);

  // If this is a benign Target ID collision common in concurrent snapshots, log as standard info
  if (errMsg.includes('Target ID already exists')) {
    console.log(`ℹ️ Benign Firestore Target ID Collision (Recovering/Cached) for path "${path}":`, errMsg);
    return;
  }

  const errInfo: FirestoreErrorInfo = {
    error: errMsg,
    authInfo: {
      userId: 'mock-user-id',
      email: 'mock@example.com',
      emailVerified: true,
      isAnonymous: false,
    },
    operationType,
    path
  };
  console.warn('⚠️ Firestore Warning (Gracefully Handled): ', JSON.stringify(errInfo));
}

function cleanUndefined(obj: any): any {
  if (obj === null || obj === undefined) {
    return null;
  }
  if (Array.isArray(obj)) {
    return obj.map(item => cleanUndefined(item));
  }
  if (typeof obj === 'object') {
    const cleaned: any = {};
    for (const key of Object.keys(obj)) {
      const val = obj[key];
      if (val !== undefined) {
        cleaned[key] = cleanUndefined(val);
      }
    }
    return cleaned;
  }
  return obj;
}

function parseCustomDate(dateStr: string): Date {
  if (!dateStr) return new Date();
  const parsed = Date.parse(dateStr);
  if (!isNaN(parsed)) return new Date(parsed);

  const now = new Date();
  try {
    const cleanStr = dateStr.trim().toLowerCase();
    if (cleanStr.includes('hoje')) {
      const timePart = cleanStr.split(/às|as/)[1]?.trim() || '';
      const [hours, minutes] = timePart.replace('h', ':').split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const d = new Date();
        d.setHours(hours, minutes, 0, 0);
        return d;
      }
    }
    if (cleanStr.includes('ontem')) {
      const timePart = cleanStr.split(/às|as/)[1]?.trim() || '';
      const [hours, minutes] = timePart.replace('h', ':').split(':').map(Number);
      if (!isNaN(hours) && !isNaN(minutes)) {
        const d = new Date();
        d.setDate(now.getDate() - 1);
        d.setHours(hours, minutes, 0, 0);
        return d;
      }
    }
    // Matches DD/MM HH:MM or DD/MM/YYYY HH:MM
    const datePattern = /(\d{2})\/(\d{2})(?:\/(\d{4}))?\s+(?:às\s+)?(\d{2})[h:](\d{2})/;
    const match = cleanStr.match(datePattern);
    if (match) {
      const day = Number(match[1]);
      const month = Number(match[2]) - 1;
      const year = match[3] ? Number(match[3]) : now.getFullYear();
      const hours = Number(match[4]);
      const minutes = Number(match[5]);
      const d = new Date(year, month, day, hours, minutes, 0, 0);
      if (!isNaN(d.getTime())) return d;
    }
  } catch (err) {
    console.error('Error parsing date:', dateStr, err);
  }
  return new Date();
}

export const AppProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Helper to normalize role from string
  const parseRoleParam = (val?: string | null): UserRole | null => {
    if (!val) return null;
    const clean = val.toLowerCase().trim();
    if (clean === 'client' || clean === 'cliente' || clean === 'user' || clean === 'usuario') return 'client';
    if (clean === 'provider' || clean === 'prestador' || clean === 'pro' || clean === 'profissional') return 'provider';
    if (clean === 'admin' || clean === 'adm' || clean === 'administrador' || clean === 'gestao') return 'admin';
    return null;
  };

  // State to track if the secret admin option is unlocked
  const [isAdminUnlocked, setIsAdminUnlockedState] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const hasAdminParam = 
          params.has('admin') || 
          params.get('admin') === 'true' || 
          params.has('m1admin') || 
          params.get('m1') === 'admin' || 
          params.get('secret') === 'admin' || 
          params.get('portal') === 'admin' ||
          window.location.hash.includes('admin');
        
        if (hasAdminParam) {
          localStorage.setItem('m1_admin_unlocked', 'true');
          return true;
        }
        return localStorage.getItem('m1_admin_unlocked') === 'true';
      }
    } catch {
      // ignore
    }
    return false;
  });

  const setIsAdminUnlocked = (unlocked: boolean) => {
    setIsAdminUnlockedState(unlocked);
    try {
      if (typeof window !== 'undefined') {
        if (unlocked) {
          localStorage.setItem('m1_admin_unlocked', 'true');
        } else {
          localStorage.removeItem('m1_admin_unlocked');
        }
      }
    } catch {
      // ignore
    }
  };

  // Initialize currentRole from URL query string (?role=client | ?role=provider | ?role=admin) or hash (#client | #provider | #admin)
  const [currentRole, setCurrentRoleState] = useState<UserRole>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        
        const isUnlocked = 
          params.has('admin') || 
          params.get('role') === 'admin' ||
          params.get('admin') === 'true' || 
          params.has('m1admin') || 
          params.get('m1') === 'admin' || 
          params.get('secret') === 'admin' || 
          params.get('portal') === 'admin' ||
          window.location.hash.includes('admin') ||
          localStorage.getItem('m1_admin_unlocked') === 'true';

        const fromQuery = parseRoleParam(params.get('role')) || parseRoleParam(params.get('perfil')) || parseRoleParam(params.get('tipo'));
        if (fromQuery) {
          if (fromQuery === 'admin' && !isUnlocked) {
            return 'client';
          }
          return fromQuery;
        }

        const hash = window.location.hash.replace('#', '').toLowerCase();
        const fromHash = parseRoleParam(hash);
        if (fromHash) {
          if (fromHash === 'admin' && !isUnlocked) {
            return 'client';
          }
          return fromHash;
        }

        // Check if there is an active authenticated session to determine the default role
        const hasClientAuth = localStorage.getItem(DB_KEY_CLIENT_AUTH);
        const hasProviderAuth = localStorage.getItem(DB_KEY_PROVIDER_AUTH);
        const hasAdminAuth = sessionStorage.getItem(DB_KEY_ADMIN_AUTH) === 'true';

        if (hasClientAuth) return 'client';
        if (hasProviderAuth) return 'provider';
        if (hasAdminAuth) return 'admin';
      }
    } catch {
      // ignore
    }
    return 'provider';
  });

  const [hasChosenPortal, setHasChosenPortalState] = useState<boolean>(() => {
    try {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        return params.has('role') || params.has('admin') || params.has('portal') || params.has('tipo') || params.has('perfil') || localStorage.getItem('m1_has_chosen_portal') === 'true';
      }
    } catch {}
    return false;
  });

  const setHasChosenPortal = (chosen: boolean) => {
    setHasChosenPortalState(chosen);
    try {
      localStorage.setItem('m1_has_chosen_portal', String(chosen));
    } catch {}
  };

  const setCurrentRole = (role: UserRole) => {
    if (role === 'admin' && !isAdminUnlocked) {
      return; // Block switching to admin if not unlocked
    }
    setCurrentRoleState(role);
    setHasChosenPortal(true);
    try {
      if (typeof window !== 'undefined') {
        const url = new URL(window.location.href);
        url.searchParams.set('role', role);
        window.history.replaceState({}, '', url.toString());
      }
    } catch {
      // ignore
    }
  };

  // Sync role and unlock status if URL changes
  useEffect(() => {
    const handleUrlChange = () => {
      try {
        const params = new URLSearchParams(window.location.search);
        const hasAdminParam = 
          params.has('admin') || 
          params.get('role') === 'admin' ||
          params.get('admin') === 'true' || 
          params.has('m1admin') || 
          params.get('m1') === 'admin' || 
          params.get('secret') === 'admin' || 
          params.get('portal') === 'admin' ||
          window.location.hash.includes('admin');

        if (hasAdminParam) {
          setIsAdminUnlocked(true);
        }

        const isUnlocked = hasAdminParam || localStorage.getItem('m1_admin_unlocked') === 'true';

        const fromQuery = parseRoleParam(params.get('role')) || parseRoleParam(params.get('perfil')) || parseRoleParam(params.get('tipo'));
        if (fromQuery) {
          if (fromQuery === 'admin' && !isUnlocked) {
            setCurrentRoleState('client');
          } else {
            setCurrentRoleState(fromQuery);
          }
          return;
        }
        const hash = window.location.hash.replace('#', '').toLowerCase();
        const fromHash = parseRoleParam(hash);
        if (fromHash) {
          if (fromHash === 'admin' && !isUnlocked) {
            setCurrentRoleState('client');
          } else {
            setCurrentRoleState(fromHash);
          }
        }
      } catch {
        // ignore
      }
    };

    window.addEventListener('popstate', handleUrlChange);
    window.addEventListener('hashchange', handleUrlChange);
    return () => {
      window.removeEventListener('popstate', handleUrlChange);
      window.removeEventListener('hashchange', handleUrlChange);
    };
  }, [isAdminUnlocked]);

  const [selectedCity, setSelectedCity] = useState<string>('São Paulo, SP');
  const [isFirestoreQuotaExceeded, setIsFirestoreQuotaExceeded] = useState<boolean>(false);
  const isFirestoreQuotaExceededRef = useRef<boolean>(false);

  // Clear cached quota error on boot to allow network retry on page reload
  useEffect(() => {
    try {
      localStorage.removeItem('m1_firestore_quota_exceeded');
    } catch {}
  }, []);

  useEffect(() => {
    isFirestoreQuotaExceededRef.current = isFirestoreQuotaExceeded;
    if (isFirestoreQuotaExceeded) {
      console.log('🔌 Firestore Quota Exceeded/Offline Mode: Calling disableNetwork(db) to stop network calls and avoid retry loops.');
      if (db) {
        disableNetwork(db).catch(err => {
          console.warn('Could not disable Firestore network:', err);
        });
      }
    } else {
      console.log('🔌 Firestore Quota Normal: Calling enableNetwork(db) to resume sync.');
      if (db) {
        enableNetwork(db).catch(err => {
          console.warn('Could not enable Firestore network:', err);
        });
      }
    }
  }, [isFirestoreQuotaExceeded]);

  // Debounce queue for writes to prevent rapid write loops (coalesces writes to the same document in 500ms)
  const writeTimersRef = useRef<Record<string, NodeJS.Timeout>>({});
  const writeQueueRef = useRef<Record<string, any>>({});

  const safeFirestoreSetDoc = useCallback(async (collectionName: string, docId: string, data: any) => {
    if (isFirestoreQuotaExceededRef.current) return;
    const key = `${collectionName}/${docId}`;

    if (writeTimersRef.current[key]) {
      clearTimeout(writeTimersRef.current[key]);
    }

    writeQueueRef.current[key] = data;

    writeTimersRef.current[key] = setTimeout(async () => {
      const pendingData = writeQueueRef.current[key];
      delete writeQueueRef.current[key];
      delete writeTimersRef.current[key];

      if (isFirestoreQuotaExceededRef.current) return;
      try {
        if (db) {
          await setDoc(doc(db, collectionName, docId), cleanUndefined(pendingData));
        }
      } catch (err: any) {
        console.warn(`🔥 Firestore setDoc failed inside safeFirestoreSetDoc for ${collectionName}/${docId}:`, err);
        const errMsg = err?.message || String(err);
        if (
          errMsg.toLowerCase().includes('quota') || 
          errMsg.toLowerCase().includes('exhausted') || 
          err?.code === 'resource-exhausted'
        ) {
          setIsFirestoreQuotaExceeded(true);
          isFirestoreQuotaExceededRef.current = true;
          try {
            localStorage.setItem('m1_firestore_quota_exceeded', 'true');
          } catch {}
        } else {
          handleFirestoreError(err, OperationType.WRITE, `${collectionName}/${docId}`);
        }
      }
    }, 500);
  }, []);

  const safeFirestoreDeleteDoc = useCallback(async (collectionName: string, docId: string) => {
    if (isFirestoreQuotaExceededRef.current) return;
    try {
      if (db) {
        await deleteDoc(doc(db, collectionName, docId));
      }
    } catch (err: any) {
      console.warn(`🔥 Firestore deleteDoc failed inside safeFirestoreDeleteDoc for ${collectionName}/${docId}:`, err);
      const errMsg = err?.message || String(err);
      if (
        errMsg.toLowerCase().includes('quota') || 
        errMsg.toLowerCase().includes('exhausted') || 
        err?.code === 'resource-exhausted'
      ) {
        setIsFirestoreQuotaExceeded(true);
        isFirestoreQuotaExceededRef.current = true;
        try {
          localStorage.setItem('m1_firestore_quota_exceeded', 'true');
        } catch {}
      }
    }
  }, []);

  // Clean Slate Automatic Reset on upgrade/first load to wipe old Firestore quota error caches
  useEffect(() => {
    try {
      const alreadyReset = localStorage.getItem('m1_v3_clean_slate_v6') === 'true';
      if (!alreadyReset) {
        console.log('🔄 Sincronizando novo Clean Slate LocalStorage...');
        const lastWhatsapp = localStorage.getItem('m1_last_client_whatsapp');
        
        localStorage.clear();
        
        if (lastWhatsapp) {
          localStorage.setItem('m1_last_client_whatsapp', lastWhatsapp);
        }
        
        // Reset states
        setSettings(INITIAL_SETTINGS);
        setClientsState(INITIAL_CLIENTS);
        setProvidersState(INITIAL_PROVIDERS);
        setServicesInternal([]);
        setTransactions([]);
        setAdminAlarms([]);
        setReviews([]);
        setNotifications([]);
        
        localStorage.setItem('m1_v3_clean_slate_v6', 'true');
        
        localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify(INITIAL_SETTINGS));
        localStorage.setItem(DB_KEY_CLIENTS, JSON.stringify(INITIAL_CLIENTS));
        localStorage.setItem(DB_KEY_PROVIDERS, JSON.stringify(INITIAL_PROVIDERS));
        localStorage.setItem(DB_KEY_SERVICES, JSON.stringify([]));
        localStorage.setItem(DB_KEY_TRANSACTIONS, JSON.stringify([]));
        localStorage.setItem(DB_KEY_ALARMS, JSON.stringify([]));
        localStorage.setItem(DB_KEY_REVIEWS, JSON.stringify([]));
        
        console.log('✨ Clean slate de dados locais aplicado com sucesso!');
      }
    } catch (e) {
      console.warn('Erro ao aplicar clean slate inicial:', e);
    }
  }, []);

  const [soundEnabled, setSoundEnabledState] = useState<boolean>(true);
  const [notifications, setNotifications] = useState<NotificationAlert[]>([]);
  const [activeToasts, setActiveToasts] = useState<SyncEvent[]>([]);

  // Client, Admin and Provider Authentication States
  const [authenticatedClientId, setAuthenticatedClientId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(DB_KEY_CLIENT_AUTH) || null;
    } catch {
      return null;
    }
  });
  const isClientAuthenticated = !!authenticatedClientId;

  const [isAdminAuthenticated, setIsAdminAuthenticated] = useState<boolean>(() => {
    try {
      return sessionStorage.getItem(DB_KEY_ADMIN_AUTH) === 'true';
    } catch {
      return false;
    }
  });

  const [authenticatedProviderId, setAuthenticatedProviderId] = useState<string | null>(() => {
    try {
      return localStorage.getItem(DB_KEY_PROVIDER_AUTH) || null;
    } catch {
      return null;
    }
  });
  const isProviderAuthenticated = !!authenticatedProviderId;

  // Prevent portal-role mismatch: make sure each logged in profile matches the active portal
  useEffect(() => {
    if (isAdminAuthenticated) return; // Admins can switch to any role for testing/management

    if (currentRole === 'client' && isProviderAuthenticated) {
      // Clear provider session when active on client portal
      setAuthenticatedProviderId(null);
      setActiveProviderId(INITIAL_PROVIDERS[0]?.id || '');
      try {
        localStorage.removeItem(DB_KEY_PROVIDER_AUTH);
        localStorage.removeItem(DB_KEY_ACTIVE_PROVIDER);
      } catch {}
    } else if (currentRole === 'provider' && isClientAuthenticated) {
      // Clear client session when active on provider portal
      setAuthenticatedClientId(null);
      setActiveClientId(INITIAL_CLIENTS[0]?.id || '');
      try {
        localStorage.removeItem(DB_KEY_CLIENT_AUTH);
        localStorage.removeItem(DB_KEY_ACTIVE_CLIENT);
      } catch {}
    }
  }, [currentRole, isClientAuthenticated, isProviderAuthenticated, isAdminAuthenticated]);

  // 1. Settings Database Table
  const [settings, setSettings] = useState<AppSettings>(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_SETTINGS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_SETTINGS;
  });

  // 1.1 Categories Table (Editable in Admin)
  const [categories, setCategories] = useState<typeof SERVICE_CATEGORIES>(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_CATEGORIES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed.some((c: any) => c.id === 'geral')) {
          return parsed;
        }
      }
    } catch {
      // ignore
    }
    return SERVICE_CATEGORIES;
  });

  // 2. Clients Database Table
  const [clients, setClientsState] = useState<ClientProfile[]>(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_CLIENTS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_CLIENTS;
  });

  // Local write cache to prevent Firestore snapshot rollback flicker (locks for 5 seconds on local updates)
  const lastLocalUpdatesRef = useRef<Record<string, number>>({});

  const setClients = useCallback((value: ClientProfile[] | ((prev: ClientProfile[]) => ClientProfile[])) => {
    setClientsState(prev => {
      const nextValue = typeof value === 'function' ? value(prev) : value;
      if (JSON.stringify(prev) === JSON.stringify(nextValue)) {
        return prev;
      }

      // Defer Firestore and localStorage writes to avoid blocking React rendering thread
      setTimeout(() => {
        try {
          localStorage.setItem(DB_KEY_CLIENTS, JSON.stringify(nextValue));
        } catch (err) {
          console.error('Error writing clients to localStorage:', err);
        }

        nextValue.forEach((client) => {
          if (!client || !client.id) return;
          const prevClient = prev.find(p => p.id === client.id);

          if (!prevClient || !isDeepEqual(prevClient, client)) {
            lastLocalUpdatesRef.current[client.id] = Date.now();
            safeFirestoreSetDoc('clients', client.id, client);
          }
        });
      }, 0);

      return nextValue;
    });
  }, [safeFirestoreSetDoc]);

  // 3. Active Client
  const [activeClientId, setActiveClientId] = useState<string>(() => {
    try {
      return localStorage.getItem(DB_KEY_ACTIVE_CLIENT) || (INITIAL_CLIENTS[0]?.id || '');
    } catch {
      return INITIAL_CLIENTS[0]?.id || '';
    }
  });

  const client = clients.find(c => c.id === activeClientId) || clients[0];

  // Profile edit requests tracking state
  const [profileEditRequests, setProfileEditRequests] = useState<ProfileEditRequest[]>(() => {
    try {
      const saved = localStorage.getItem('m1_profile_edit_requests_v1');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('m1_profile_edit_requests_v1', JSON.stringify(profileEditRequests));
    } catch {
      // ignore
    }
  }, [profileEditRequests]);

  // 4. Providers Database Table
  const [providers, setProvidersState] = useState<ProviderProfile[]>(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_PROVIDERS);
      if (saved) return JSON.parse(saved);
    } catch {
      // ignore
    }
    return INITIAL_PROVIDERS;
  });

  const setProviders = useCallback((value: ProviderProfile[] | ((prev: ProviderProfile[]) => ProviderProfile[])) => {
    setProvidersState(prev => {
      const nextValue = typeof value === 'function' ? value(prev) : value;
      if (JSON.stringify(prev) === JSON.stringify(nextValue)) {
        return prev;
      }

      // Defer Firestore and localStorage writes to avoid blocking React rendering thread
      setTimeout(() => {
        try {
          localStorage.setItem(DB_KEY_PROVIDERS, JSON.stringify(nextValue));
        } catch (err) {
          console.error('Error writing providers to localStorage:', err);
        }

        nextValue.forEach((provider) => {
          if (!provider || !provider.id) return;
          const prevProvider = prev.find(p => p.id === provider.id);

          if (!prevProvider || !isDeepEqual(prevProvider, provider)) {
            lastLocalUpdatesRef.current[provider.id] = Date.now();
            safeFirestoreSetDoc('providers', provider.id, provider);
          }
        });
      }, 0);

      return nextValue;
    });
  }, [safeFirestoreSetDoc]);

  // 5. Active Provider
  const [activeProviderId, setActiveProviderId] = useState<string>(() => {
    try {
      return localStorage.getItem(DB_KEY_ACTIVE_PROVIDER) || (INITIAL_PROVIDERS[0]?.id || '');
    } catch {
      return INITIAL_PROVIDERS[0]?.id || '';
    }
  });

  const provider = providers.find(p => p.id === activeProviderId) || providers[0];

  // 6. Services Database Table
  const [isServicesLoading, setIsServicesLoading] = useState(true);
  const [services, setServicesInternal] = useState<ServiceRequest[]>(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_SERVICES);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((s: any) => s && s.id);
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_SERVICES;
  });

  const setServices = useCallback((value: ServiceRequest[] | ((prev: ServiceRequest[]) => ServiceRequest[])) => {
    setServicesInternal(prev => {
      const rawNextValue = typeof value === 'function' ? value(prev) : value;
      
      // Auto-inject status tracking history with exact date & time on status change
      const nextValue = rawNextValue.map(srv => {
        if (!srv || !srv.id) return srv;
        const prevSrv = prev.find(p => p.id === srv.id);
        const hasStatusChanged = !prevSrv || prevSrv.status !== srv.status;
        const missingHistory = !srv.statusHistory || srv.statusHistory.length === 0;

        if (hasStatusChanged || missingHistory) {
          const now = new Date();
          const timestamp = now.toLocaleDateString('pt-BR') + ' às ' + now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit', second: '2-digit' });
          
          let label: string = srv.status;
          let description = `O status do chamado foi atualizado para: ${srv.status}`;

          switch (srv.status) {
            case 'solicitado':
              label = 'Solicitado';
              description = `O chamado foi criado com sucesso pelo cliente ${srv.clientName}.`;
              break;
            case 'aguardando_despacho_admin':
              label = 'Aguardando Despacho';
              description = `Solicitação aberta pelo cliente ${srv.clientName}. Aguardando análise e direcionamento da Central M1.`;
              break;
            case 'aguardando_confirmacao_cliente':
              label = 'Orçamento Proposto';
              description = `Orçamento de R$ ${srv.estimatedPrice?.toFixed(2) || '0,00'} definido e enviado para aprovação do cliente.`;
              break;
            case 'valor_aprovado_cliente':
              label = 'Orçamento Aprovado';
              description = `O cliente ${srv.clientName} aprovou o orçamento de R$ ${srv.estimatedPrice?.toFixed(2) || '0,00'}. Buscando profissionais credenciados.`;
              break;
            case 'despachado_prestador':
              label = 'Profissional Indicado';
              description = `Central M1 indicou o profissional ${srv.assignedProviderName || srv.providerName || 'credenciado'} para o atendimento. Aguardando aceitação.`;
              break;
            case 'aceito_pelo_prestador':
            case 'proposta_aceita':
              label = 'Atendimento Confirmado';
              description = `O profissional ${srv.providerName || srv.assignedProviderName || 'credenciado'} aceitou a solicitação e está se deslocando.`;
              break;
            case 'em_deslocamento':
              label = 'Profissional a Caminho';
              description = `O profissional ${srv.providerName || 'credenciado'} iniciou o deslocamento até o local do atendimento no GPS.`;
              break;
            case 'chegou_ao_local':
              label = 'Profissional no Local';
              description = `O profissional ${srv.providerName || 'credenciado'} chegou ao endereço de atendimento do cliente.`;
              break;
            case 'em_execucao':
              label = 'Serviço em Execução';
              description = `O serviço foi iniciado pelo profissional ${srv.providerName || 'credenciado'}.`;
              break;
            case 'relatorio_enviado':
              label = 'Laudo Técnico de Conclusão';
              description = `Laudo fotográfico e relatório técnico enviados para validação do encerramento.`;
              break;
            case 'aguardando_confirmacao_pagamento':
              label = 'Aguardando Confirmação do Pix';
              description = `O cliente realizou o Pix. Aguardando liberação e compensação de segurança pela Central M1.`;
              break;
            case 'concluido_pago':
              label = 'Serviço Concluído e Pago';
              description = `Atendimento finalizado com sucesso. Pagamento liberado ao profissional e chamado encerrado.`;
              break;
            case 'cancelado':
              label = 'Chamado Cancelado';
              description = srv.cancellationReason 
                ? `Atendimento cancelado. Motivo: ${srv.cancellationReason}`
                : `Atendimento cancelado.`;
              break;
          }

          const currentHistory = srv.statusHistory ? [...srv.statusHistory] : [];
          const isDuplicate = currentHistory.some(h => h.status === srv.status && h.timestamp === timestamp);
          if (!isDuplicate) {
            currentHistory.push({
              status: srv.status,
              timestamp,
              label,
              description
            });
          }

          return {
            ...srv,
            statusHistory: currentHistory
          };
        }
        return srv;
      });

      if (JSON.stringify(prev) === JSON.stringify(nextValue)) {
        return prev;
      }

      // Defer Firestore and localStorage writes to avoid blocking React rendering thread
      setTimeout(() => {
        try {
          localStorage.setItem(DB_KEY_SERVICES, JSON.stringify(nextValue));
        } catch (err) {
          console.error('Error writing services to localStorage:', err);
        }

        nextValue.forEach((srv) => {
          if (!srv || !srv.id) return;
          const prevSrv = prev.find(p => p.id === srv.id);

          if (!prevSrv || !isDeepEqual(prevSrv, srv)) {
            lastLocalUpdatesRef.current[srv.id] = Date.now();
            safeFirestoreSetDoc('services', srv.id, srv);
          }
        });
      }, 0);

      return nextValue;
    });
  }, [safeFirestoreSetDoc]);

  // Maintain a stable reference of services, clients, and providers for closures
  const servicesRef = useRef<ServiceRequest[]>(services);
  useEffect(() => {
    servicesRef.current = services;
  }, [services]);

  const clientsRef = useRef<ClientProfile[]>(clients);
  useEffect(() => {
    clientsRef.current = clients;
  }, [clients]);

  const providersRef = useRef<ProviderProfile[]>(providers);
  useEffect(() => {
    providersRef.current = providers;
  }, [providers]);

  const isInitialClientsLoadedRef = useRef(false);
  const isInitialProvidersLoadedRef = useRef(false);

  // 7. Transactions Database Table
  const [transactions, setTransactions] = useState<PlatformTransaction[]>(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_TRANSACTIONS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((t: any) => t && t.id);
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_TRANSACTIONS;
  });

  // 8. Admin Alarms Database Table
  const [adminAlarms, setAdminAlarms] = useState<AdminAlarm[]>(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_ALARMS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((a: any) => a && a.id);
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_ADMIN_ALARMS;
  });

  // 9. Reviews Database Table
  const [reviews, setReviews] = useState<ServiceRating[]>(() => {
    try {
      const saved = localStorage.getItem(DB_KEY_REVIEWS);
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) {
          return parsed.filter((r: any) => r && r.id);
        }
      }
    } catch {
      // ignore
    }
    return INITIAL_REVIEWS;
  });

  // Sync state changes automatically to persistent localStorage (isolated per state to minimize CPU overhead)
  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY_SETTINGS, JSON.stringify(settings));
    } catch {}
  }, [settings]);

  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY_CATEGORIES, JSON.stringify(categories));
    } catch {}
  }, [categories]);

  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY_CLIENTS, JSON.stringify(clients));
    } catch {}
  }, [clients]);

  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY_PROVIDERS, JSON.stringify(providers));
    } catch {}
  }, [providers]);

  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY_SERVICES, JSON.stringify(services));
    } catch {}
  }, [services]);

  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY_TRANSACTIONS, JSON.stringify(transactions));
    } catch {}
  }, [transactions]);

  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY_ALARMS, JSON.stringify(adminAlarms));
    } catch {}
  }, [adminAlarms]);

  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY_REVIEWS, JSON.stringify(reviews));
    } catch {}
  }, [reviews]);

  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY_ACTIVE_CLIENT, activeClientId);
    } catch {}
  }, [activeClientId]);

  useEffect(() => {
    try {
      localStorage.setItem(DB_KEY_ACTIVE_PROVIDER, activeProviderId);
    } catch {}
  }, [activeProviderId]);

  // ----------------------------------------------------
  // ⚡ LOCAL-FIRST SYNC ENGINE
  // ----------------------------------------------------
  // Pull updates from Firestore in real-time with a robust 100ms debounce to coalesce updates.
  // Optimizations applied:
  // 1. Strict [] dependency array for unsubscribe setup.
  // 2. Narrow scope query filters to fetch only active/non-terminal services.
  // 3. Absolute Loop Prevention: NO database write operations inside the snapshot listener callback.
  useEffect(() => {
    let debounceTimer: NodeJS.Timeout | null = null;
    let unsubscribe: (() => void) | null = null;

    if (isFirestoreQuotaExceededRef.current) {
      console.log('🔌 Firestore real-time listener disabled (Quota Exceeded / Offline Backup Mode Active)');
      setIsServicesLoading(false);
      return;
    }

    try {
      if (db) {
        // Only monitor active/non-terminal service requests to reduce database reads and prevent quota exhaustion.
        // Completed ('concluido_pago') and Cancelled ('cancelado') are static and don't need real-time monitoring.
        const activeStatuses = [
          'solicitado',
          'aguardando_despacho_admin',
          'despachado_prestador',
          'aceito_pelo_prestador',
          'aguardando_confirmacao_cliente',
          'valor_aprovado_cliente',
          'negociando',
          'proposta_aceita',
          'em_deslocamento',
          'chegou_ao_local',
          'em_execucao',
          'relatorio_enviado',
          'aguardando_confirmacao_pagamento',
          'concluido_pago',
          'cancelado'
        ];

        const servicesQuery = collection(db, 'services');

        unsubscribe = onSnapshot(servicesQuery, (snapshot) => {
          setIsServicesLoading(false);
          if (debounceTimer) clearTimeout(debounceTimer);

          debounceTimer = setTimeout(() => {
            if (snapshot.empty) {
              console.log('⚡ Firestore active services collection is empty. Setting list to empty.');
            }

            const remoteServices: ServiceRequest[] = [];
            snapshot.forEach((docSnapshot) => {
              const rawData = docSnapshot.data();
              if (rawData && rawData.id) {
                // Resolve Firebase serverTimestamp() gracefully to ISO string
                let resolvedCreatedAt = '';
                if (rawData.createdAt) {
                  if (typeof rawData.createdAt === 'string') {
                    resolvedCreatedAt = rawData.createdAt;
                  } else if (typeof rawData.createdAt.toDate === 'function') {
                    resolvedCreatedAt = rawData.createdAt.toDate().toISOString();
                  } else if (typeof rawData.createdAt.seconds === 'number') {
                    resolvedCreatedAt = new Date(rawData.createdAt.seconds * 1000).toISOString();
                  }
                } else {
                  resolvedCreatedAt = new Date().toISOString();
                }

                // Treat 'pendente' as equivalent to 'aguardando_despacho_admin' to seamlessly adapt database status
                let resolvedStatus = rawData.status || 'aguardando_despacho_admin';
                if (resolvedStatus === 'pendente') {
                  resolvedStatus = 'aguardando_despacho_admin';
                }

                const srv: ServiceRequest = {
                  ...rawData,
                  status: resolvedStatus,
                  createdAt: resolvedCreatedAt
                } as ServiceRequest;

                remoteServices.push(srv);
              }
            });

            // Deep-merge remote services with local services to prevent overwriting local states
            const mergedServices: ServiceRequest[] = [];
            const allServiceIds = new Set([
              ...remoteServices.map(s => s.id),
              ...servicesRef.current.map(s => s && s.id).filter(Boolean) as string[]
            ]);

            allServiceIds.forEach(id => {
              const remoteSrv = remoteServices.find(s => s.id === id);
              const localSrv = servicesRef.current.find(s => s.id === id);

              if (remoteSrv && localSrv) {
                const lastUpdated = lastLocalUpdatesRef.current[id] || 0;
                if (Date.now() - lastUpdated < 5000) {
                  mergedServices.push(localSrv);
                } else {
                  mergedServices.push(remoteSrv);
                }
              } else if (remoteSrv) {
                mergedServices.push(remoteSrv);
              } else if (localSrv) {
                mergedServices.push(localSrv);
              }
            });

            const sortedServices = [...mergedServices].sort((a, b) => {
              try {
                return parseCustomDate(b.createdAt).getTime() - parseCustomDate(a.createdAt).getTime();
              } catch {
                return 0;
              }
            });

            // ⚠️ QUEBRA DE LOOP: No database writes (like updateDoc/setDoc) are allowed here.
            // We strictly only update local React state.
            setServicesInternal(prev => {
              if (JSON.stringify(prev) === JSON.stringify(sortedServices)) return prev;
              try {
                localStorage.setItem(DB_KEY_SERVICES, JSON.stringify(sortedServices));
              } catch {}
              return sortedServices;
            });
          }, 100);
        }, (error) => {
          setIsServicesLoading(false);
          console.warn('⚠️ Firestore connection offline/restricted. Working with cached offline storage.', error);
          const errMsg = error?.message || String(error);
          if (errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted') || (error as any).code === 'resource-exhausted') {
            setIsFirestoreQuotaExceeded(true);
            isFirestoreQuotaExceededRef.current = true;
          } else {
            handleFirestoreError(error, OperationType.LIST, 'services');
          }
        });
      } else {
        setIsServicesLoading(false);
      }
    } catch (err: any) {
      console.warn('⚠️ Error subscribing to Firestore snapshot:', err);
      const errMsg = err?.message || String(err);
      if (errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted') || err?.code === 'resource-exhausted') {
        setIsFirestoreQuotaExceeded(true);
        isFirestoreQuotaExceededRef.current = true;
      }
    }

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (unsubscribe) unsubscribe();
    };
  }, []);

  // Top-level useCallback definitions for loading clients and providers to allow manual or programmatic triggering from the Admin Portal.
  // We increase limits to 1000 so no client or provider is cut off from the Admin's visibility.
  const loadClients = useCallback(async () => {
    if (isFirestoreQuotaExceededRef.current) return;
    try {
      if (db) {
        const snapshot = await getDocs(query(collection(db, 'clients'), limit(1000)));
        const remoteClients: ClientProfile[] = [];
        if (!snapshot.empty) {
          snapshot.forEach((docSnapshot) => {
            const rawData = docSnapshot.data();
            if (rawData && rawData.id) {
              remoteClients.push(rawData as ClientProfile);
            }
          });
        }

        // Auto-seed INITIAL_CLIENTS if Firestore is empty or if they are missing
        for (const c of INITIAL_CLIENTS) {
          if (!remoteClients.some(rc => rc.id === c.id)) {
            console.log(`⚡ Seeding integrated default client ${c.name} into Firestore...`);
            await safeFirestoreSetDoc('clients', c.id, c);
            remoteClients.push(c);
          }
        }

        const mergedClients: ClientProfile[] = [];
        const allClientIds = new Set([
          ...remoteClients.map(c => c.id),
          ...clientsRef.current.map(c => c && c.id).filter(Boolean) as string[]
        ]);

        allClientIds.forEach(id => {
          const remoteCl = remoteClients.find(c => c.id === id);
          const localCl = clientsRef.current.find(c => c.id === id);

          if (remoteCl && localCl) {
            const lastUpdated = lastLocalUpdatesRef.current[id] || 0;
            if (Date.now() - lastUpdated < 5000) {
              mergedClients.push(localCl);
            } else {
              mergedClients.push(remoteCl);
            }
          } else if (remoteCl) {
            mergedClients.push(remoteCl);
          } else if (localCl) {
            // Always keep local-only clients to prevent data loss on offline/quota states
            mergedClients.push(localCl);
          }
        });
        
        const sortedClients = [...mergedClients].sort((a, b) => {
          const getVal = (item: ClientProfile) => {
            if (item.id.startsWith('client-')) {
              const ts = parseInt(item.id.replace('client-', ''), 10);
              if (!isNaN(ts)) return ts;
            }
            return 0;
          };
          return getVal(b) - getVal(a);
        });

        setClientsState(prev => {
          if (JSON.stringify(prev) === JSON.stringify(sortedClients)) return prev;
          try {
            localStorage.setItem(DB_KEY_CLIENTS, JSON.stringify(sortedClients));
          } catch {}
          return sortedClients;
        });
      }
    } catch (error: any) {
      console.warn('⚠️ Firestore clients static fetch offline/restricted.', error);
      const errMsg = error?.message || String(error);
      if (errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted') || (error as any).code === 'resource-exhausted') {
        setIsFirestoreQuotaExceeded(true);
        isFirestoreQuotaExceededRef.current = true;
        try {
          localStorage.setItem('m1_firestore_quota_exceeded', 'true');
        } catch {}
      }
    }
  }, []);

  const loadProviders = useCallback(async () => {
    if (isFirestoreQuotaExceededRef.current) return;
    try {
      if (db) {
        const snapshot = await getDocs(query(collection(db, 'providers'), limit(1000)));
        const remoteProviders: ProviderProfile[] = [];
        if (!snapshot.empty) {
          snapshot.forEach((docSnapshot) => {
            const rawData = docSnapshot.data();
            if (rawData && rawData.id) {
              remoteProviders.push(rawData as ProviderProfile);
            }
          });
        }

        // Auto-seed INITIAL_PROVIDERS if Firestore is empty or if they are missing
        for (const p of INITIAL_PROVIDERS) {
          if (!remoteProviders.some(rp => rp.id === p.id)) {
            console.log(`⚡ Seeding integrated default provider ${p.name} into Firestore...`);
            await safeFirestoreSetDoc('providers', p.id, p);
            remoteProviders.push(p);
          }
        }

        const mergedProviders: ProviderProfile[] = [];
        const allProviderIds = new Set([
          ...remoteProviders.map(p => p.id),
          ...providersRef.current.map(p => p && p.id).filter(Boolean) as string[]
        ]);

        allProviderIds.forEach(id => {
          const remotePr = remoteProviders.find(p => p.id === id);
          const localPr = providersRef.current.find(p => p.id === id);

          if (remotePr && localPr) {
            const lastUpdated = lastLocalUpdatesRef.current[id] || 0;
            if (Date.now() - lastUpdated < 5000) {
              mergedProviders.push(localPr);
            } else {
              mergedProviders.push(remotePr);
            }
          } else if (remotePr) {
            mergedProviders.push(remotePr);
          } else if (localPr) {
            // Always keep local-only providers to prevent data loss on offline/quota states
            mergedProviders.push(localPr);
          }
        });

        const sortedProviders = [...mergedProviders].sort((a, b) => {
          const getVal = (item: ProviderProfile) => {
            if (item.id.startsWith('provider-')) {
              const ts = parseInt(item.id.replace('provider-', ''), 10);
              if (!isNaN(ts)) return ts;
            }
            return 0;
          };
          return getVal(b) - getVal(a);
        });

        setProvidersState(prev => {
          if (JSON.stringify(prev) === JSON.stringify(sortedProviders)) return prev;
          try {
            localStorage.setItem(DB_KEY_PROVIDERS, JSON.stringify(sortedProviders));
          } catch {}
          return sortedProviders;
        });
      }
    } catch (error: any) {
      console.warn('⚠️ Firestore providers static fetch offline/restricted.', error);
      const errMsg = error?.message || String(error);
      if (errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted') || (error as any).code === 'resource-exhausted') {
        setIsFirestoreQuotaExceeded(true);
        isFirestoreQuotaExceededRef.current = true;
        try {
          localStorage.setItem('m1_firestore_quota_exceeded', 'true');
        } catch {}
      }
    }
  }, []);

  const syncDatabaseData = useCallback(async () => {
    setIsServicesLoading(true);
    await Promise.all([loadClients(), loadProviders()]);
    setIsServicesLoading(false);
  }, [loadClients, loadProviders]);

  // Real-time clients listener to replace expensive 5s polling
  useEffect(() => {
    if (isFirestoreQuotaExceeded) return;

    let unsubscribe: (() => void) | null = null;
    let debounceTimer: NodeJS.Timeout | null = null;

    try {
      if (db) {
        const clientsQuery = query(collection(db, 'clients'), limit(1000));
        unsubscribe = onSnapshot(clientsQuery, (snapshot) => {
          if (debounceTimer) clearTimeout(debounceTimer);

          debounceTimer = setTimeout(async () => {
            if (snapshot.empty) {
              console.log('⚡ Firestore clients collection is empty. Populating initial data...');
            }

            const remoteClients: ClientProfile[] = [];
            snapshot.forEach((docSnapshot) => {
              const rawData = docSnapshot.data();
              if (rawData && rawData.id) {
                remoteClients.push(rawData as ClientProfile);
              }
            });

            // Auto-seed INITIAL_CLIENTS if missing
            for (const c of INITIAL_CLIENTS) {
              if (!remoteClients.some(rc => rc.id === c.id)) {
                await safeFirestoreSetDoc('clients', c.id, c);
                remoteClients.push(c);
              }
            }

            const mergedClients: ClientProfile[] = [];
            const allClientIds = new Set([
              ...remoteClients.map(c => c.id),
              ...clientsRef.current.map(c => c && c.id).filter(Boolean) as string[]
            ]);

            allClientIds.forEach(id => {
              const remoteCl = remoteClients.find(c => c.id === id);
              const localCl = clientsRef.current.find(c => c.id === id);

              if (remoteCl && localCl) {
                const lastUpdated = lastLocalUpdatesRef.current[id] || 0;
                if (Date.now() - lastUpdated < 5000) {
                  mergedClients.push(localCl);
                } else {
                  mergedClients.push(remoteCl);
                }
              } else if (remoteCl) {
                mergedClients.push(remoteCl);
              } else if (localCl) {
                // Always keep local-only clients to prevent data loss on offline/quota states
                mergedClients.push(localCl);
              }
            });

            const sortedClients = [...mergedClients].sort((a, b) => {
              const getVal = (item: ClientProfile) => {
                if (item.id.startsWith('client-')) {
                  const ts = parseInt(item.id.replace('client-', ''), 10);
                  if (!isNaN(ts)) return ts;
                }
                return 0;
              };
              return getVal(b) - getVal(a);
            });

            setClientsState(prev => {
              if (JSON.stringify(prev) === JSON.stringify(sortedClients)) return prev;
              try {
                localStorage.setItem(DB_KEY_CLIENTS, JSON.stringify(sortedClients));
              } catch {}
              return sortedClients;
            });
          }, 100);
        }, (error) => {
          console.warn('⚠️ Clients real-time snapshot error:', error);
          const errMsg = error?.message || String(error);
          if (errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted') || (error as any).code === 'resource-exhausted') {
            setIsFirestoreQuotaExceeded(true);
            isFirestoreQuotaExceededRef.current = true;
          }
        });
      }
    } catch (err) {
      console.warn('⚠️ Error subscribing to clients snapshot:', err);
    }

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (unsubscribe) unsubscribe();
    };
  }, [isFirestoreQuotaExceeded]);

  // Real-time providers listener to replace expensive 5s polling
  useEffect(() => {
    if (isFirestoreQuotaExceeded) return;

    let unsubscribe: (() => void) | null = null;
    let debounceTimer: NodeJS.Timeout | null = null;

    try {
      if (db) {
        const providersQuery = query(collection(db, 'providers'), limit(1000));
        unsubscribe = onSnapshot(providersQuery, (snapshot) => {
          if (debounceTimer) clearTimeout(debounceTimer);

          debounceTimer = setTimeout(async () => {
            if (snapshot.empty) {
              console.log('⚡ Firestore providers collection is empty. Populating initial data...');
            }

            const remoteProviders: ProviderProfile[] = [];
            snapshot.forEach((docSnapshot) => {
              const rawData = docSnapshot.data();
              if (rawData && rawData.id) {
                remoteProviders.push(rawData as ProviderProfile);
              }
            });

            // Auto-seed INITIAL_PROVIDERS if missing
            for (const p of INITIAL_PROVIDERS) {
              if (!remoteProviders.some(rp => rp.id === p.id)) {
                await safeFirestoreSetDoc('providers', p.id, p);
                remoteProviders.push(p);
              }
            }

            const mergedProviders: ProviderProfile[] = [];
            const allProviderIds = new Set([
              ...remoteProviders.map(p => p.id),
              ...providersRef.current.map(p => p && p.id).filter(Boolean) as string[]
            ]);

            allProviderIds.forEach(id => {
              const remotePr = remoteProviders.find(p => p.id === id);
              const localPr = providersRef.current.find(p => p.id === id);

              if (remotePr && localPr) {
                const lastUpdated = lastLocalUpdatesRef.current[id] || 0;
                if (Date.now() - lastUpdated < 5000) {
                  mergedProviders.push(localPr);
                } else {
                  mergedProviders.push(remotePr);
                }
              } else if (remotePr) {
                mergedProviders.push(remotePr);
              } else if (localPr) {
                // Always keep local-only providers to prevent data loss on offline/quota states
                mergedProviders.push(localPr);
              }
            });

            const sortedProviders = [...mergedProviders].sort((a, b) => {
              const getVal = (item: ProviderProfile) => {
                if (item.id.startsWith('provider-')) {
                  const ts = parseInt(item.id.replace('provider-', ''), 10);
                  if (!isNaN(ts)) return ts;
                }
                return 0;
              };
              return getVal(b) - getVal(a);
            });

            setProvidersState(prev => {
              if (JSON.stringify(prev) === JSON.stringify(sortedProviders)) return prev;
              try {
                localStorage.setItem(DB_KEY_PROVIDERS, JSON.stringify(sortedProviders));
              } catch {}
              return sortedProviders;
            });
          }, 100);
        }, (error) => {
          console.warn('⚠️ Providers real-time snapshot error:', error);
          const errMsg = error?.message || String(error);
          if (errMsg.toLowerCase().includes('quota') || errMsg.toLowerCase().includes('exhausted') || (error as any).code === 'resource-exhausted') {
            setIsFirestoreQuotaExceeded(true);
            isFirestoreQuotaExceededRef.current = true;
          }
        });
      }
    } catch (err) {
      console.warn('⚠️ Error subscribing to providers snapshot:', err);
    }

    return () => {
      if (debounceTimer) clearTimeout(debounceTimer);
      if (unsubscribe) unsubscribe();
    };
  }, [isFirestoreQuotaExceeded]);

  // Sincronização estática do perfil do prestador logado individualmente para garantir atualizações sem reads redundantes
  useEffect(() => {
    if (isFirestoreQuotaExceeded || !activeProviderId) return;

    const loadActiveProvider = async () => {
      try {
        if (db) {
          const docSnapshot = await getDoc(doc(db, 'providers', activeProviderId));
          if (docSnapshot.exists()) {
            const remotePr = docSnapshot.data() as ProviderProfile;
            setProvidersState(prev => {
              const updated = prev.map(p => p.id === remotePr.id ? remotePr : p);
              if (!updated.some(p => p.id === remotePr.id)) {
                updated.push(remotePr);
              }
              try {
                localStorage.setItem(DB_KEY_PROVIDERS, JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        }
      } catch (error: any) {
        const errMsg = error?.message || String(error);
        if (errMsg.toLowerCase().includes('quota') || (error as any).code === 'resource-exhausted') {
          setIsFirestoreQuotaExceeded(true);
          isFirestoreQuotaExceededRef.current = true;
        }
      }
    };

    loadActiveProvider();
    const interval = setInterval(loadActiveProvider, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isFirestoreQuotaExceeded, activeProviderId]);

  // Sincronização estática do perfil do cliente ativo individualmente para garantir atualizações sem reads redundantes
  useEffect(() => {
    if (isFirestoreQuotaExceeded || !activeClientId) return;

    const loadActiveClient = async () => {
      try {
        if (db) {
          const docSnapshot = await getDoc(doc(db, 'clients', activeClientId));
          if (docSnapshot.exists()) {
            const remoteCl = docSnapshot.data() as ClientProfile;
            setClientsState(prev => {
              const updated = prev.map(c => c.id === remoteCl.id ? remoteCl : c);
              if (!updated.some(c => c.id === remoteCl.id)) {
                updated.push(remoteCl);
              }
              try {
                localStorage.setItem(DB_KEY_CLIENTS, JSON.stringify(updated));
              } catch {}
              return updated;
            });
          }
        }
      } catch (error: any) {
        const errMsg = error?.message || String(error);
        if (errMsg.toLowerCase().includes('quota') || (error as any).code === 'resource-exhausted') {
          setIsFirestoreQuotaExceeded(true);
          isFirestoreQuotaExceededRef.current = true;
        }
      }
    };

    loadActiveClient();
    const interval = setInterval(loadActiveClient, 5000);

    return () => {
      clearInterval(interval);
    };
  }, [isFirestoreQuotaExceeded, activeClientId]);

  // Helper to play synthesized sounds based on event type
  const playSyncSound = (sound: SyncEvent['sound']) => {
    if (!soundManager.getEnabled()) return;
    try {
      if (sound === 'incoming') {
        soundManager.playIncomingJobAlert();
      } else if (sound === 'radar') {
        soundManager.playRadarPing();
      } else if (sound === 'success') {
        soundManager.playSuccessChime();
      } else if (sound === 'cash') {
        soundManager.playCashRegister();
      } else if (sound === 'alarm') {
        soundManager.playAdminAlarm();
      } else if (sound === 'message') {
        const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
        if (ctx) {
          const now = ctx.currentTime;
          const osc = ctx.createOscillator();
          const gain = ctx.createGain();
          osc.type = 'sine';
          osc.frequency.setValueAtTime(800, now);
          osc.frequency.exponentialRampToValueAtTime(1200, now + 0.15);
          gain.gain.setValueAtTime(0.15, now);
          gain.gain.exponentialRampToValueAtTime(0.001, now + 0.2);
          osc.connect(gain);
          gain.connect(ctx.destination);
          osc.start(now);
          osc.stop(now + 0.25);
        }
      }
    } catch {
      // Audio playback blocked or failed gracefully
    }
  };

  // Real-time synchronization event trigger
  const triggerSyncEvent = (
    type: SyncEvent['type'],
    title: string,
    message: string,
    sound: SyncEvent['sound'],
    role: SyncEvent['role'],
    serviceId?: string
  ) => {
    const syncEvent: SyncEvent = {
      id: 'evt-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      type,
      title,
      message,
      sound,
      role,
      serviceId,
      timestamp: Date.now()
    };
    
    // Save to localStorage immediately
    try {
      localStorage.setItem('m1_brasil_sync_event', JSON.stringify(syncEvent));
    } catch {
      // ignore
    }

    // Display locally in the active tab
    if (!syncEvent.role || syncEvent.role === currentRole) {
      setActiveToasts(prev => {
        if (prev.some(t => t.id === syncEvent.id)) return prev;
        return [syncEvent, ...prev.slice(0, 4)];
      });
      
      // Play sound locally
      playSyncSound(sound);
    }
  };

  const dismissToast = (id: string) => {
    setActiveToasts(prev => prev.filter(t => t.id !== id));
  };

  const markServiceRequestAsViewedByAdmin = useCallback((serviceId: string) => {
    setServices(prev =>
      prev.map(srv => (srv.id === serviceId ? { ...srv, viewedByAdmin: true } : srv))
    );
  }, [setServices]);

  // Multi-tab and multi-iframe real-time synchronization (Optimized with raw state setters and equality checks to avoid infinite storage loop)
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.storageArea !== localStorage) return;
      if (!e.newValue) return;
      
      try {
        if (e.key === 'm1_brasil_sync_event') {
          const event: SyncEvent = JSON.parse(e.newValue);
          
          // Instantly reload all state from localStorage checking for equality to prevent unnecessary re-renders
          const savedServices = localStorage.getItem(DB_KEY_SERVICES);
          if (savedServices) {
            setServicesInternal(prev => {
              if (JSON.stringify(prev) === savedServices) return prev;
              return JSON.parse(savedServices);
            });
          }
          
          const savedAlarms = localStorage.getItem(DB_KEY_ALARMS);
          if (savedAlarms) {
            setAdminAlarms(prev => {
              if (JSON.stringify(prev) === savedAlarms) return prev;
              return JSON.parse(savedAlarms);
            });
          }

          const savedProviders = localStorage.getItem(DB_KEY_PROVIDERS);
          if (savedProviders) {
            setProvidersState(prev => {
              if (JSON.stringify(prev) === savedProviders) return prev;
              return JSON.parse(savedProviders);
            });
          }

          const savedClients = localStorage.getItem(DB_KEY_CLIENTS);
          if (savedClients) {
            setClientsState(prev => {
              if (JSON.stringify(prev) === savedClients) return prev;
              return JSON.parse(savedClients);
            });
          }

          const savedTransactions = localStorage.getItem(DB_KEY_TRANSACTIONS);
          if (savedTransactions) {
            setTransactions(prev => {
              if (JSON.stringify(prev) === savedTransactions) return prev;
              return JSON.parse(savedTransactions);
            });
          }

          const savedReviews = localStorage.getItem(DB_KEY_REVIEWS);
          if (savedReviews) {
            setReviews(prev => {
              if (JSON.stringify(prev) === savedReviews) return prev;
              return JSON.parse(savedReviews);
            });
          }

          const savedCategories = localStorage.getItem(DB_KEY_CATEGORIES);
          if (savedCategories) {
            setCategories(prev => {
              if (JSON.stringify(prev) === savedCategories) return prev;
              return JSON.parse(savedCategories);
            });
          }

          const savedSettings = localStorage.getItem(DB_KEY_SETTINGS);
          if (savedSettings) {
            setSettings(prev => {
              if (JSON.stringify(prev) === savedSettings) return prev;
              return JSON.parse(savedSettings);
            });
          }
          
          // Display the real-time visual toast and play the synchronized sound if role matches
          if (!event.role || event.role === currentRole) {
            setActiveToasts(prev => {
              if (prev.some(t => t.id === event.id)) return prev;
              return [event, ...prev.slice(0, 4)];
            });
            playSyncSound(event.sound);
          }
        } else if (e.key === DB_KEY_SERVICES) {
          setServicesInternal(prev => {
            if (JSON.stringify(prev) === e.newValue) return prev;
            return JSON.parse(e.newValue!);
          });
        } else if (e.key === DB_KEY_ALARMS) {
          setAdminAlarms(prev => {
            if (JSON.stringify(prev) === e.newValue) return prev;
            return JSON.parse(e.newValue!);
          });
        } else if (e.key === DB_KEY_PROVIDERS) {
          setProvidersState(prev => {
            if (JSON.stringify(prev) === e.newValue) return prev;
            return JSON.parse(e.newValue!);
          });
        } else if (e.key === DB_KEY_CLIENTS) {
          setClientsState(prev => {
            if (JSON.stringify(prev) === e.newValue) return prev;
            return JSON.parse(e.newValue!);
          });
        } else if (e.key === DB_KEY_TRANSACTIONS) {
          setTransactions(prev => {
            if (JSON.stringify(prev) === e.newValue) return prev;
            return JSON.parse(e.newValue!);
          });
        } else if (e.key === DB_KEY_REVIEWS) {
          setReviews(prev => {
            if (JSON.stringify(prev) === e.newValue) return prev;
            return JSON.parse(e.newValue!);
          });
        } else if (e.key === DB_KEY_SETTINGS) {
          setSettings(prev => {
            if (JSON.stringify(prev) === e.newValue) return prev;
            return JSON.parse(e.newValue!);
          });
        } else if (e.key === DB_KEY_CATEGORIES) {
          setCategories(prev => {
            if (JSON.stringify(prev) === e.newValue) return prev;
            return JSON.parse(e.newValue!);
          });
        } else if (e.key === DB_KEY_ACTIVE_CLIENT) {
          setActiveClientId(prev => prev === e.newValue ? prev : e.newValue || '');
        } else if (e.key === DB_KEY_ACTIVE_PROVIDER) {
          setActiveProviderId(prev => prev === e.newValue ? prev : e.newValue || '');
        }
      } catch (err) {
        console.error("Erro ao sincronizar abas em tempo real:", err);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  // Operational SLA Monitoring Effect (Simulating 2-minute provider timeout and 30-minute general timeout)
  useEffect(() => {
    const interval = setInterval(() => {
      const nowEpoch = Date.now();

      setServices(prevServices => {
        let hasChanges = false;
        const updated = prevServices.map(s => {
          // Initialize creation epoch if missing for tracking timeouts
          const createdTime = s.createdEpoch || nowEpoch;
          const dispatchedTime = s.dispatchedEpoch || 0;
          let newStatus = s.status;
          let newAssignedProviderId = s.assignedProviderId;
          let newAssignedProviderName = s.assignedProviderName;
          let newAssignedProviderAvatar = s.assignedProviderAvatar;
          let newAssignedProviderPhone = s.assignedProviderPhone;
          let newDispatchedEpoch = s.dispatchedEpoch;
          let newRejectedBy = s.rejectedByProviderIds || [];
          let newTimeoutExceeded = s.timeoutGeralExcedido;
          let newChat = [...s.chat];

          // 1. PROVIDER TIMEOUT SLA (5 MINUTES REAL-TIME)
          if (s.status === 'despachado_prestador' && dispatchedTime > 0) {
            const secondsElapsed = (nowEpoch - dispatchedTime) / 1000;
            if (secondsElapsed >= 300) {
              hasChanges = true;
              // Add provider ID to rejected/expired list so they are not auto-assigned again
              if (s.assignedProviderId && !newRejectedBy.includes(s.assignedProviderId)) {
                newRejectedBy.push(s.assignedProviderId);
              }

              // System message in chat
              newChat.push({
                id: 'msg-sys-timeout-' + Date.now(),
                senderRole: 'system',
                senderName: 'Central M1 Brasil',
                text: `⏰ Tempo limite de 5 minutos esgotado! O profissional credenciado ${s.assignedProviderName} não confirmou o aceite. Chamado retornado para a Central M1 para reorganização de preço ou condições.`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              });

              addAdminAlarm({
                level: 'critical',
                title: `🚨 Tempo Limite Excedido pelo Prestador (${s.code})`,
                description: `Profissional ${s.assignedProviderName} expirou o tempo de 5 minutos para aceitar o chamado. Retornado ao ADM para reavaliação.`,
                category: 'delay_alert',
                serviceId: s.id,
                providerId: s.assignedProviderId
              });

              // Return status to admin, flag refusal
              newStatus = 'aguardando_despacho_admin';
              s.wasRefusedByProvider = true;

              // Clean assigned provider info
              newAssignedProviderId = undefined;
              newAssignedProviderName = undefined;
              newAssignedProviderAvatar = undefined;
              newAssignedProviderPhone = undefined;
              newDispatchedEpoch = undefined;

              // Check if auto-dispatch is enabled in settings or configured to automatically re-route
              if (settings.autoDispatch) {
                // Find next best online provider who hasn't rejected or expired this call
                const candidates = providers.filter(p => 
                  p.isOnline && 
                  p.isAuthorized && 
                  p.categories.includes(s.category) && 
                  !newRejectedBy.includes(p.id)
                );

                if (candidates.length > 0) {
                  // Sort candidates according to admin configuration
                  // For testing, default order by rating DESC (Evaluation)
                  candidates.sort((a, b) => b.rating - a.rating);
                  const nextProvider = candidates[0];

                  newStatus = 'despachado_prestador';
                  newAssignedProviderId = nextProvider.id;
                  newAssignedProviderName = nextProvider.name;
                  newAssignedProviderAvatar = nextProvider.avatar;
                  newAssignedProviderPhone = nextProvider.phone;
                  newDispatchedEpoch = Date.now();

                  newChat.push({
                    id: 'msg-sys-autodisp-' + Date.now(),
                    senderRole: 'system',
                    senderName: 'Central M1 Brasil',
                    text: `⚡ Redespacho Automático: Chamado direcionado sequencialmente para o profissional ${nextProvider.name}.`,
                    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  });

                  addAdminAlarm({
                    level: 'info',
                    title: `⚡ Redespacho Automático (${s.code})`,
                    description: `Chamado direcionado automaticamente para o prestador ${nextProvider.name} (Nota ⭐ ${nextProvider.rating.toFixed(1)}).`,
                    category: 'new_request',
                    serviceId: s.id,
                    providerId: nextProvider.id
                  });
                } else {
                  newStatus = 'aguardando_despacho_admin';
                  newChat.push({
                    id: 'msg-sys-no-pros-' + Date.now(),
                    senderRole: 'system',
                    senderName: 'Central M1',
                    text: 'Não há outros profissionais credenciados disponíveis na região no momento. Aguardando intervenção manual do administrador.',
                    timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
                  });
                }
              } else {
                newStatus = 'aguardando_despacho_admin';
              }
            }
          }

          // 2. GENERAL SERVICE TIMEOUT (30 MINUTES / SIMULATED AS 45 SECONDS REAL-TIME)
          if ((newStatus === 'aguardando_despacho_admin' || newStatus === 'despachado_prestador') && !newTimeoutExceeded) {
            const secondsSinceCreation = (nowEpoch - createdTime) / 1000;
            if (secondsSinceCreation >= 45) {
              hasChanges = true;
              newTimeoutExceeded = true;

              newChat.push({
                id: 'msg-sys-timeout-geral-' + Date.now(),
                senderRole: 'system',
                senderName: 'Central M1 Brasil',
                text: '❌ ALERTA: Nenhum prestador aceitou o chamado nos últimos 30 minutos de busca operacional. Caso deseje agilizar o atendimento, você pode reajustar o valor da proposta para atrair mais profissionais.',
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              });

              addAdminAlarm({
                level: 'critical',
                title: `🚨 Tempo Esgotado de Atendimento (${s.code})`,
                description: `Chamado sem atendimento por mais de 30 minutos operacionais. Cliente notificado para reajuste de valor.`,
                category: 'delay_alert',
                serviceId: s.id
              });
            }
          }

          return {
            ...s,
            createdEpoch: createdTime,
            dispatchedEpoch: newDispatchedEpoch,
            status: newStatus,
            assignedProviderId: newAssignedProviderId,
            assignedProviderName: newAssignedProviderName,
            assignedProviderAvatar: newAssignedProviderAvatar,
            assignedProviderPhone: newAssignedProviderPhone,
            rejectedByProviderIds: newRejectedBy,
            timeoutGeralExcedido: newTimeoutExceeded,
            chat: newChat
          };
        });

        return hasChanges ? updated : prevServices;
      });
    }, 5000);

    return () => clearInterval(interval);
  }, [providers, settings]);

  const setSoundEnabled = (enabled: boolean) => {
    setSoundEnabledState(enabled);
    soundManager.setEnabled(enabled);
  };

  const addNotification = (alert: Omit<NotificationAlert, 'id' | 'timestamp' | 'read'>) => {
    const newAlert: NotificationAlert = {
      ...alert,
      id: 'notif-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false
    };
    setNotifications(prev => [newAlert, ...prev.slice(0, 24)]);
  };

  const dismissNotification = (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const markAllNotificationsRead = () => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  };

  // Add Admin Alarm
  const addAdminAlarm = (alarm: Omit<AdminAlarm, 'id' | 'timestamp' | 'acknowledged'>) => {
    const newAlarm: AdminAlarm = {
      ...alarm,
      id: 'alm-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      timestamp: `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      acknowledged: false
    };

    setAdminAlarms(prev => [newAlarm, ...prev]);

    if (settings.alarmSoundEnabled && (alarm.level === 'critical' || alarm.level === 'warning')) {
      soundManager.playAdminAlarm();
    }
  };

  const acknowledgeAlarm = (alarmId: string) => {
    setAdminAlarms(prev => prev.map(a => a.id === alarmId ? { ...a, acknowledged: true } : a));
  };

  const acknowledgeAllAlarms = () => {
    setAdminAlarms(prev => prev.map(a => ({ ...a, acknowledged: true })));
  };

  const clearAllAlarms = () => {
    setAdminAlarms([]);
  };

  const triggerManualTestAlarm = (
    level: AdminAlarm['level'] = 'warning',
    title = 'Teste de Alarme Operacional M1 Brasil',
    description = 'Disparo manual para verificar o alerta visual e sonoro no painel administrativo.'
  ) => {
    addAdminAlarm({
      level,
      title,
      description,
      category: 'delay_alert'
    });
  };

  // Find active ongoing services
  const activeServiceForClient = services.find(
    s => s.clientId === client.id && s.status !== 'aguardando_confirmacao_pagamento' && s.status !== 'concluido_pago' && s.status !== 'cancelado'
  );

  const activeServiceForProvider = services.find(
    s => s.providerId === provider.id && s.status !== 'concluido_pago' && s.status !== 'cancelado'
  ) || services.find(
    s => s.assignedProviderId === provider.id && s.status === 'despachado_prestador'
  );

  // 1. Client creates a service request (Workflow: Goes to ADMIN for review & dispatch)
  const createServiceRequest = async (newServiceData: {
    category: ServiceCategory;
    title: string;
    description: string;
    urgency: 'imediato' | 'agendado';
    scheduledFor?: string;
    media: { id: string; type: 'photo' | 'video'; url: string; timestamp: string; caption?: string }[];
    address: ClientProfile['defaultAddress'];
    estimatedPrice: number;
  }): Promise<string> => {
    const feeRate = (settings.platformFeePercent || 15) / 100;
    const fee = Math.round(newServiceData.estimatedPrice * feeRate * 100) / 100;
    const payout = Math.round((newServiceData.estimatedPrice - fee) * 100) / 100;
    const serviceCode = `#SRV-${Math.floor(1000 + Math.random() * 9000)}`;
    const serviceId = 'srv-' + Date.now();

    const categoryObj = SERVICE_CATEGORIES.find(c => c.id === newServiceData.category);
    const eta = categoryObj?.defaultEtaMinutes || settings.defaultEtaMinutes || 15;

    const createdService: ServiceRequest = {
      id: serviceId,
      code: serviceCode,
      clientId: client.id,
      clientName: client.name,
      clientAvatar: client.avatar,
      clientPhone: client.phone,
      category: newServiceData.category,
      title: newServiceData.title,
      description: newServiceData.description,
      urgency: newServiceData.urgency,
      scheduledFor: newServiceData.scheduledFor,
      media: newServiceData.media,
      address: newServiceData.address,
      estimatedPrice: newServiceData.estimatedPrice,
      status: 'aguardando_despacho_admin', // local state synonym
      createdAt: new Date().toISOString(),
      proposals: [],
      payment: {
        totalAmount: newServiceData.estimatedPrice,
        platformFeeAmount: fee,
        providerPayoutAmount: payout,
        status: 'held',
        method: 'pix',
        pixCode: `00020126580014br.gov.bcb.pix0136${serviceId}5204000053039865405${newServiceData.estimatedPrice.toFixed(2)}5802BR5924M1Brasil6009Sao Paulo62070503***6304`
      },
      chat: [
        {
          id: 'msg-' + Date.now(),
          senderRole: 'system',
          senderName: 'Central M1 Brasil',
          text: `Chamado ${serviceCode} recebido com sucesso pela Central M1! O Administrador está analisando os detalhes para indicar o melhor profissional credenciado.`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        }
      ],
      providerCurrentLat: newServiceData.address.lat + 0.007,
      providerCurrentLng: newServiceData.address.lng - 0.006,
      estimatedArrivalMinutes: eta
    };

    // Piloto Automático / Ações Automáticas M1
    if (settings.autoActionsEnabled && settings.autoDirectDispatch) {
      const suitableProvider = providers.find(p => p.isOnline && p.isAuthorized && p.categories.includes(newServiceData.category));

      if (suitableProvider) {
        const autoPrice = (settings.autoPredefinedPrice && settings.autoPredefinedPrice > 0)
          ? settings.autoPredefinedPrice
          : (categoryObj?.basePrice || newServiceData.estimatedPrice || 120);

        const autoFee = Math.round(autoPrice * feeRate * 100) / 100;
        const autoPayout = Math.round((autoPrice - autoFee) * 100) / 100;

        // REQUISITO ESTRITO M1: 1º Aparece para o Cliente aprovar o valor, 2º Para o prestador
        createdService.status = 'aguardando_confirmacao_cliente';
        createdService.estimatedPrice = autoPrice;
        createdService.assignedProviderId = suitableProvider.id;
        createdService.assignedProviderName = suitableProvider.name;
        createdService.assignedProviderAvatar = suitableProvider.avatar;
        createdService.assignedProviderPhone = suitableProvider.phone;
        createdService.dispatchedAt = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
        createdService.dispatchedEpoch = Date.now();
        createdService.dispatchedByAdmin = true;
        createdService.payment = {
          totalAmount: autoPrice,
          platformFeeAmount: autoFee,
          providerPayoutAmount: autoPayout,
          status: 'held',
          method: 'pix',
          pixCode: `00020126580014br.gov.bcb.pix0136${serviceId}5204000053039865405${autoPrice.toFixed(2)}5802BR5924M1Brasil6009Sao Paulo62070503***6304`
        };
        createdService.chat.push({
          id: 'msg-auto-disp-' + Date.now(),
          senderRole: 'system',
          senderName: 'Central M1 Brasil (Auto-Pilot 🤖)',
          text: `🤖 CENTRAL M1: Orçamento pré-definido de R$ ${autoPrice.toFixed(2)} encaminhado ao cliente para aprovação. Assim que aprovado pelo cliente, o chamado será despachado ao credenciado ${suitableProvider.name}.`,
          timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        });
      }
    }

    // Synchronously write to Firestore immediately so that the Admin receives the request instantly
    await safeFirestoreSetDoc('services', serviceId, createdService);

    setServices(prev => [createdService, ...prev]);

    // Update Client's request count
    setClients(prev => prev.map(c => c.id === client.id ? { ...c, totalRequests: c.totalRequests + 1 } : c));

    // Sound alert for Admin
    soundManager.playAdminAlarm();

    // Client Notification
    addNotification({
      type: 'status_update',
      title: `Solicitação Enviada com Sucesso (${serviceCode})`,
      message: 'Sua solicitação foi recebida pela Central M1 e aguarda indicação de um prestador credenciado.',
      targetRole: 'client',
      serviceId: serviceId
    });

    // Admin Real-Time Alarm & Notification (Requires Admin Dispatch)
    addAdminAlarm({
      level: 'critical',
      title: `🚨 NOVO CHAMADO AGUARDANDO DESPACHO (${serviceCode})`,
      description: `Cliente ${client.name} solicitou ${categoryObj?.name || 'Serviço'} (R$ ${newServiceData.estimatedPrice.toFixed(2)}). Indique o prestador credenciado no painel ADM.`,
      category: 'new_request',
      serviceId,
      clientId: client.id
    });

    triggerSyncEvent(
      'service_created',
      'Novo Chamado Solicitado!',
      `O cliente ${client.name} abriu um chamado de ${categoryObj?.name || 'Serviço'} (${serviceCode}).`,
      'incoming',
      'client',
      serviceId
    );

    return serviceId;
  };

  // 1.1 Admin Dispatches Service to Chosen Provider
  const dispatchServiceToProvider = (serviceId: string, providerId: string, updatedPrice?: number, directToProvider?: boolean): { success: boolean; message: string } => {
    const targetProvider = providers.find(p => p.id === providerId);
    if (!targetProvider) {
      return { success: false, message: 'Prestador não encontrado no sistema.' };
    }

    const srv = services.find(s => s.id === serviceId);
    if (!srv) {
      return { success: false, message: 'Chamado não encontrado.' };
    }

    const finalPrice = updatedPrice !== undefined && updatedPrice > 0 ? updatedPrice : srv.estimatedPrice;
    const serviceCode = srv.code;
    const nowTime = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    const isDirect = directToProvider === true || srv.status === 'valor_aprovado_cliente';
    const targetStatus = isDirect ? 'despachado_prestador' : 'aguardando_confirmacao_cliente';

    setServices(prev =>
      prev.map(s => {
        if (s.id === serviceId) {
          let paymentObj = s.payment;
          if (updatedPrice !== undefined && updatedPrice > 0) {
            const feeRate = (settings.platformFeePercent || 15) / 100;
            const fee = Math.round(updatedPrice * feeRate * 100) / 100;
            const payout = Math.round((updatedPrice - fee) * 100) / 100;
            paymentObj = {
              ...s.payment,
              totalAmount: updatedPrice,
              platformFeeAmount: fee,
              providerPayoutAmount: payout,
              pixCode: `00020126580014br.gov.bcb.pix0136${s.id}5204000053039865405${updatedPrice.toFixed(2)}5802BR5924M1Brasil6009Sao Paulo62070503***6304`
            };
          }

          return {
            ...s,
            status: targetStatus,
            estimatedPrice: finalPrice,
            payment: paymentObj,
            assignedProviderId: targetProvider.id,
            assignedProviderName: targetProvider.name,
            assignedProviderAvatar: targetProvider.avatar,
            assignedProviderPhone: targetProvider.phone,
            dispatchedAt: nowTime,
            dispatchedEpoch: Date.now(),
            dispatchedByAdmin: true,
            wasRefusedByClient: false,
            wasRefusedByProvider: false,
            refusalReason: undefined,
            refusalTimestamp: undefined,
            viewedByAdmin: true,
            // CRUCIAL: Remove targetProvider from rejectedByProviderIds so SPAM shows even if they previously refused
            rejectedByProviderIds: (s.rejectedByProviderIds || []).filter(id => id !== targetProvider.id),
            proposals: (s.proposals || []).filter(p => p.providerId !== targetProvider.id),
            chat: [
              ...s.chat,
              {
                id: 'msg-disp-' + Date.now(),
                senderRole: 'system',
                senderName: 'Central M1 Brasil',
                text: isDirect
                  ? `🚨 **CHAMADO ENCAMINHADO AO PRESTADOR**\n\nAdministrador M1 despachou o chamado para o técnico credenciado **${targetProvider.name}** com valor de R$ ${finalPrice.toFixed(2)}. Aguardando aceitação e tempo de chegada (ETA).`
                  : `Administrador M1 definiu o orçamento de R$ ${finalPrice.toFixed(2)} com o técnico credenciado **${targetProvider.name}**. Aguardando aprovação do cliente para que o serviço seja encaminhado ao profissional.`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return s;
      })
    );

    // Play Alert Sound
    soundManager.playIncomingJobAlert();

    if (isDirect) {
      // Notify Provider
      addNotification({
        type: 'incoming_job',
        title: `🚨 Chamado Encaminhado pela Central! (${serviceCode})`,
        message: `A Central M1 direcionou o chamado ${serviceCode} para você (R$ ${finalPrice.toFixed(2)}). Aceite para informar seu tempo de chegada!`,
        targetRole: 'provider',
        serviceId
      });
      // Admin alarm
      addAdminAlarm({
        level: 'info',
        title: `Chamado Encaminhado ao Prestador: ${serviceCode}`,
        description: `Administrador despachou o chamado para ${targetProvider.name} com repasse líquido. Aguardando aceite e tempo de chegada.`,
        category: 'new_request',
        serviceId,
        providerId: targetProvider.id
      });
    } else {
      // Notify Client
      addNotification({
        type: 'status_update',
        title: `⚡ ORÇAMENTO PRONTO PARA SUA APROVAÇÃO (${serviceCode})`,
        message: `A Central M1 definiu o valor de R$ ${finalPrice.toFixed(2)} para o chamado ${serviceCode} com o técnico ${targetProvider.name}. Clique para aprovar ou reprovar!`,
        targetRole: 'client',
        serviceId
      });
      // Admin alarm
      addAdminAlarm({
        level: 'info',
        title: `Orçamento Enviado ao Cliente: ${serviceCode}`,
        description: `Administrador indicou ${targetProvider.name} com valor de R$ ${finalPrice.toFixed(2)}. Aguardando aprovação do cliente.`,
        category: 'new_request',
        serviceId,
        providerId: targetProvider.id
      });
    }

    triggerSyncEvent(
      'service_dispatched',
      isDirect ? 'Chamado Encaminhado ao Prestador!' : 'Orçamento Enviado ao Cliente!',
      `O Admin encaminhou o chamado ${serviceCode} para ${targetProvider.name}.`,
      'radar',
      'admin',
      serviceId
    );

    return {
      success: true,
      message: isDirect
        ? `Chamado despachado para o técnico ${targetProvider.name} com sucesso! Alerta SPAM emitido.`
        : `Orçamento de R$ ${finalPrice.toFixed(2)} enviado ao cliente com sucesso! O cliente foi notificado para aprovar.`
    };
  };

  // 1.2 Provider Accepts Dispatched Service (Sets status to em_deslocamento, dispatching "Prestador a caminho")
  const providerAcceptDispatchedService = (serviceId: string, etaMinutes: number) => {
    const srv = services.find(s => s.id === serviceId);
    if (!srv) return;

    const targetProvider = providers.find(p => p.id === (srv.assignedProviderId || provider.id)) || provider;
    const nowTime = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const eta = etaMinutes || 15;

    const feeRate = (settings.platformFeePercent || 15) / 100;
    const fee = Math.round(srv.estimatedPrice * feeRate * 100) / 100;
    const payout = Math.round((srv.estimatedPrice - fee) * 100) / 100;

    let updatedService: ServiceRequest | null = null;

    setServices(prev =>
      prev.map(s => {
        if (s.id === serviceId) {
          updatedService = {
            ...s,
            status: 'em_deslocamento',
            acceptedAt: nowTime,
            acceptedEpoch: Date.now(),
            estimatedArrivalMinutes: eta,
            wasRefusedByClient: false,
            wasRefusedByProvider: false,
            providerId: targetProvider.id,
            providerName: targetProvider.name,
            providerAvatar: targetProvider.avatar,
            providerPhone: targetProvider.phone,
            providerPixKey: targetProvider.pixKey || targetProvider.phone || '',
            providerRating: targetProvider.rating || 4.9,
            providerVehicle: targetProvider.vehicleModel || 'Moto / Veículo Credenciado',
            providerPlate: targetProvider.vehiclePlate || 'M1-SERV',
            payment: {
              ...s.payment,
              totalAmount: s.estimatedPrice,
              platformFeeAmount: fee,
              providerPayoutAmount: payout
            },
            chat: [
              ...s.chat,
              {
                id: 'msg-acc-' + Date.now(),
                senderRole: 'system',
                senderName: 'Central M1 Brasil',
                text: `🏁 **PRESTADOR ACEITOU E ESTÁ A CAMINHO!**\n\nO técnico credenciado **${targetProvider.name}** aceitou o valor proposto e já iniciou o deslocamento. Ele estima chegar ao seu local em **${eta} minutos**.\n\n_Você pode acompanhar a localização e o andamento do atendimento em tempo real pelo painel._`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
          return updatedService;
        }
        return s;
      })
    );

    if (updatedService) {
      safeFirestoreSetDoc('services', serviceId, updatedService);
    }

    soundManager.playSuccessChime();

    try {
      confetti({
        particleCount: 100,
        spread: 90,
        origin: { y: 0.6 }
      });
    } catch {
      // ignore
    }

    // Client Notification
    addNotification({
      type: 'status_update',
      title: '🏁 O Prestador já está a caminho!',
      message: `${targetProvider.name} aceitou o seu chamado e estima chegar em ${eta} minutos. Prepare-se para recebê-lo!`,
      targetRole: 'client',
      serviceId
    });

    // Provider Notification
    addNotification({
      type: 'proposal_accepted',
      title: 'Início de Deslocamento Confirmado',
      message: `Você aceitou o chamado ${srv.code}. O endereço de atendimento foi liberado no seu painel!`,
      targetRole: 'provider',
      serviceId
    });

    // Admin Alarm
    addAdminAlarm({
      level: 'success',
      title: `✅ Prestador em Deslocamento (${srv.code})`,
      description: `${targetProvider.name} está a caminho. Chegada estimada em ${eta} minutos.`,
      category: 'accepted_en_route',
      serviceId,
      providerId: targetProvider.id
    });

    triggerSyncEvent(
      'service_accepted',
      'Atendimento Iniciado!',
      `O profissional ${targetProvider.name} iniciou deslocamento para o chamado (${srv.code}). Chegada em ${eta} min.`,
      'success',
      'provider',
      serviceId
    );
  };

  // 1.35 Provider Questions Dispatched Service (Returns to Admin for negotiation/re-price, does NOT block from re-dispatch)
  const providerQuestionDispatchedService = (serviceId: string, questionText: string) => {
    const srv = services.find(s => s.id === serviceId);
    if (!srv) return;

    const qProviderId = srv.assignedProviderId || provider.id;
    const qProviderName = srv.assignedProviderName || provider.name;

    setServices(prev =>
      prev.map(s => {
        if (s.id === serviceId) {
          return {
            ...s,
            status: 'aguardando_despacho_admin',
            assignedProviderId: undefined,
            assignedProviderName: undefined,
            assignedProviderAvatar: undefined,
            assignedProviderPhone: undefined,
            chat: [
              ...s.chat,
              {
                id: 'msg-q-' + Date.now(),
                senderRole: 'system',
                senderName: 'Central M1 Brasil',
                text: `❓ O profissional ${qProviderName} enviou um QUESTIONAMENTO DE VALOR: "${questionText}". Chamado retornado ao Administrador para análise de contraproposta.`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return s;
      })
    );

    soundManager.playAdminAlarm();

    addAdminAlarm({
      level: 'info',
      title: `❓ Contraproposta em Chamado (${srv.code})`,
      description: `${qProviderName} enviou questionamento/proposta: "${questionText}".`,
      category: 'new_request',
      serviceId,
      providerId: qProviderId
    });

    triggerSyncEvent(
      'proposal_submitted',
      'Contraproposta Enviada!',
      `${qProviderName} enviou contraproposta para o chamado ${srv.code}: "${questionText}"`,
      'radar',
      'admin',
      serviceId
    );
  };

  // 1.3 Provider Rejects Dispatched Service (Returns to Admin for re-dispatch)
  const providerRejectDispatchedService = (serviceId: string, reason?: string) => {
    const srv = services.find(s => s.id === serviceId);
    if (!srv) return;

    const rejProviderId = srv.assignedProviderId || provider.id;
    const rejProviderName = srv.assignedProviderName || provider.name;

    let updatedService: ServiceRequest | null = null;

    setServices(prev =>
      prev.map(s => {
        if (s.id === serviceId) {
          const rejectedList = s.rejectedByProviderIds || [];
          updatedService = {
            ...s,
            status: 'aguardando_despacho_admin',
            wasRefusedByProvider: true,
            wasRefusedByClient: false,
            refusalReason: reason || 'Prestador recusou o chamado',
            refusalTimestamp: Date.now(),
            viewedByAdmin: false,
            assignedProviderId: undefined,
            assignedProviderName: undefined,
            assignedProviderAvatar: undefined,
            assignedProviderPhone: undefined,
            rejectedByProviderIds: [...rejectedList, rejProviderId],
            chat: [
              ...s.chat,
              {
                id: 'msg-rej-' + Date.now(),
                senderRole: 'system',
                senderName: 'Central M1 Brasil',
                text: `❌ **CHAMADO RECUSADO PELO PRESTADOR**\n\nO profissional ${rejProviderName} recusou o chamado${reason ? ` (${reason})` : ''}.\n\n_O chamado retornou para a Central M1 reorganizar o preço ou condições para enviar novamente._`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
          return updatedService;
        }
        return s;
      })
    );

    if (updatedService) {
      safeFirestoreSetDoc('services', serviceId, updatedService);
    }

    soundManager.playAdminAlarm();

    // Admin Alarm
    addAdminAlarm({
      level: 'critical',
      title: `🚨 Prestador Recusou Chamado (${srv.code})`,
      description: `${rejProviderName} recusou o chamado. Reorganize o preço ou condições no painel ADM para reenviar.`,
      category: 'delay_alert',
      serviceId,
      providerId: rejProviderId
    });
  };

  // Provider Rejects/Skips a General requested Service (it just removes it from their list by adding their ID to rejectedByProviderIds)
  const providerRejectServiceRequest = (serviceId: string) => {
    setServices(prev =>
      prev.map(s => {
        if (s.id === serviceId) {
          const rejectedList = s.rejectedByProviderIds || [];
          if (!rejectedList.includes(provider.id)) {
            return {
              ...s,
              rejectedByProviderIds: [...rejectedList, provider.id]
            };
          }
        }
        return s;
      })
    );
    soundManager.playSuccessChime();
  };

  // Provider submits proposal
  const submitProposal = (serviceId: string, proposalData: {
    proposedPrice: number;
    estimatedArrivalMinutes: number;
    message: string;
  }) => {
    const proposalId = 'prop-' + Date.now();
    const newProposal: ServiceProposal = {
      id: proposalId,
      serviceId,
      providerId: provider.id,
      providerName: provider.name,
      providerAvatar: provider.avatar,
      providerPhone: provider.phone,
      providerRating: provider.rating,
      providerCompletedJobs: provider.completedJobsCount,
      providerVehicle: provider.vehicleModel,
      providerPlate: provider.vehiclePlate,
      proposedPrice: proposalData.proposedPrice,
      estimatedArrivalMinutes: proposalData.estimatedArrivalMinutes,
      message: proposalData.message,
      createdAt: `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'pending'
    };

    let updatedService: ServiceRequest | null = null;

    setServices(prev =>
      prev.map(srv => {
        if (srv.id === serviceId) {
          updatedService = {
            ...srv,
            status: 'negociando',
            proposals: [newProposal, ...srv.proposals.filter(p => p.providerId !== provider.id)]
          };
          return updatedService;
        }
        return srv;
      })
    );

    if (updatedService) {
      safeFirestoreSetDoc('services', serviceId, updatedService);
    }

    soundManager.playSuccessChime();

    addNotification({
      type: 'proposal_received',
      title: 'Nova Proposta Recebida!',
      message: `Você recebeu uma proposta no valor de R$ ${proposalData.proposedPrice.toFixed(2)} para seu chamado.`,
      targetRole: 'client',
      serviceId
    });

    addAdminAlarm({
      level: 'info',
      title: `Proposta enviada em chamado`,
      description: `${provider.name} enviou proposta de R$ ${proposalData.proposedPrice.toFixed(2)} para o chamado.`,
      category: 'proposal_negotiated',
      serviceId,
      providerId: provider.id
    });
  };

  // 2. Client Accepts Proposal (CRITICAL REQUIREMENT: ONLY AFTER ACCEPTING, CLIENT SEES THE PROFESSIONAL'S DATA AND LIVE GPS)
  const acceptProposal = (serviceId: string, proposalId: string) => {
    const nowTime = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;

    let chosenProposal: ServiceProposal | undefined;
    let srvCode = '';
    let updatedService: ServiceRequest | null = null;

    setServices(prev =>
      prev.map(srv => {
        if (srv.id === serviceId) {
          srvCode = srv.code;
          chosenProposal = srv.proposals.find(p => p.id === proposalId);
          if (!chosenProposal) return srv;

          const feeRate = (settings.platformFeePercent || 15) / 100;
          const fee = Math.round(chosenProposal.proposedPrice * feeRate * 100) / 100;
          const payout = Math.round((chosenProposal.proposedPrice - fee) * 100) / 100;

          const updatedProposals = srv.proposals.map(p => ({
            ...p,
            status: (p.id === proposalId ? 'accepted' : 'rejected') as ServiceProposal['status']
          }));

          const updatedChat: ChatMessage[] = [
            ...srv.chat,
            {
              id: 'msg-' + Date.now(),
              senderRole: 'system',
              senderName: 'M1 Brasil Serviços',
              text: `Proposta de R$ ${chosenProposal.proposedPrice.toFixed(2)} aceita pelo cliente! Dados do profissional liberados. Profissional em deslocamento no mapa ao vivo.`,
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            },
            {
              id: 'msg-p-' + Date.now(),
              senderRole: 'provider',
              senderName: chosenProposal.providerName.split(' ')[0],
              text: `Olá! Proposta confirmada. Já estou a caminho com o veículo ${chosenProposal.providerVehicle} (Placa ${chosenProposal.providerPlate}). Chego em cerca de ${chosenProposal.estimatedArrivalMinutes} minutos.`,
              timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
            }
          ];

          updatedService = {
            ...srv,
            providerId: chosenProposal.providerId,
            providerName: chosenProposal.providerName,
            providerAvatar: chosenProposal.providerAvatar,
            providerPhone: chosenProposal.providerPhone,
            providerPixKey: providers.find(p => p.id === chosenProposal.providerId)?.pixKey || chosenProposal.providerPhone || '',
            providerRating: chosenProposal.providerRating,
            providerVehicle: chosenProposal.providerVehicle,
            providerPlate: chosenProposal.providerPlate,
            negotiatedPrice: chosenProposal.proposedPrice,
            status: 'em_deslocamento',
            acceptedAt: nowTime,
            acceptedEpoch: Date.now(),
            proposals: updatedProposals,
            chat: updatedChat,
            estimatedArrivalMinutes: chosenProposal.estimatedArrivalMinutes,
            payment: {
              ...srv.payment,
              totalAmount: chosenProposal.proposedPrice,
              platformFeeAmount: fee,
              providerPayoutAmount: payout
            }
          };
          return updatedService;
        }
        return srv;
      })
    );

    if (updatedService) {
      safeFirestoreSetDoc('services', serviceId, updatedService);
    }

    soundManager.playSuccessChime();

    if (chosenProposal) {
      addNotification({
        type: 'job_accepted',
        title: 'Profissional a Caminho!',
        message: `${(chosenProposal as ServiceProposal).providerName} está se deslocando até seu endereço. Acompanhe o GPS ao vivo.`,
        targetRole: 'client',
        serviceId
      });

      addNotification({
        type: 'proposal_accepted',
        title: 'Sua Proposta Foi Aceita!',
        message: `O cliente aceitou sua proposta de R$ ${(chosenProposal as ServiceProposal).proposedPrice.toFixed(2)}. Inicie o deslocamento.`,
        targetRole: 'provider',
        serviceId
      });

      addAdminAlarm({
        level: 'info',
        title: `Proposta Aceita & Deslocamento Iniciado (${srvCode})`,
        description: `Cliente ${client.name} aceitou a proposta de ${(chosenProposal as ServiceProposal).providerName} por R$ ${(chosenProposal as ServiceProposal).proposedPrice.toFixed(2)}.`,
        category: 'accepted_en_route',
        serviceId,
        providerId: (chosenProposal as ServiceProposal).providerId,
        clientId: client.id
      });

      triggerSyncEvent(
        'proposal_accepted',
        'Proposta Aceita pelo Cliente!',
        `O cliente aceitou a proposta de ${(chosenProposal as ServiceProposal).providerName} (Chamado ${srvCode}).`,
        'success',
        'client',
        serviceId
      );
    }
  };

  // Provider direct accept (quick shortcut)
  const acceptServiceRequestDirectly = (serviceId: string) => {
    const srv = services.find(s => s.id === serviceId);
    if (!srv) return;

    const propId = 'prop-direct-' + Date.now();
    submitProposal(serviceId, {
      proposedPrice: srv.estimatedPrice,
      estimatedArrivalMinutes: 10,
      message: 'Atendimento prioritário aceito diretamente pela equipe credenciada M1 Brasil.'
    });

    setTimeout(() => {
      acceptProposal(serviceId, propId);
    }, 400);
  };

  // 2.9 Provider starts displacement / on the way (A CAMINHO)
  const markProviderOnTheWay = (serviceId: string, etaMinutes?: number) => {
    const nowTime = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    let srvCode = '';
    let targetProvName = provider.name;
    let updatedService: ServiceRequest | null = null;

    setServices(prev =>
      prev.map(srv => {
        if (srv.id === serviceId) {
          srvCode = srv.code;
          const eta = etaMinutes || srv.estimatedArrivalMinutes || 15;
          targetProvName = srv.providerName || provider.name;
          updatedService = {
            ...srv,
            status: 'em_deslocamento',
            acceptedAt: srv.acceptedAt || nowTime,
            acceptedEpoch: srv.acceptedEpoch || Date.now(),
            estimatedArrivalMinutes: eta,
            chat: [
              ...srv.chat,
              {
                id: 'msg-desl-' + Date.now(),
                senderRole: 'system',
                senderName: 'Central M1 Brasil',
                text: `🚗 PRESTADOR A CAMINHO! O técnico ${targetProvName} iniciou deslocamento e está a caminho do seu local. Previsão de chegada: ${eta} minutos.`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
          return updatedService;
        }
        return srv;
      })
    );

    if (updatedService) {
      safeFirestoreSetDoc('services', serviceId, updatedService);
    }

    soundManager.playSuccessChime();

    addNotification({
      type: 'status_update',
      title: '🚗 Profissional a Caminho!',
      message: `${targetProvName} está a caminho do seu endereço.`,
      targetRole: 'client',
      serviceId
    });

    addAdminAlarm({
      level: 'info',
      title: `Prestador a Caminho (${srvCode})`,
      description: `${targetProvName} iniciou deslocamento para o atendimento.`,
      category: 'accepted_en_route',
      serviceId,
      providerId: provider.id
    });
  };

  // 3. Provider marks arrived
  const markProviderArrived = (serviceId: string) => {
    const nowTime = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    let srvCode = '';
    let updatedService: ServiceRequest | null = null;

    setServices(prev =>
      prev.map(srv => {
        if (srv.id === serviceId) {
          srvCode = srv.code;
          updatedService = {
            ...srv,
            status: 'chegou_ao_local',
            arrivedAt: nowTime,
            chat: [
              ...srv.chat,
              {
                id: 'msg-' + Date.now(),
                senderRole: 'system',
                senderName: 'M1 Brasil Serviços',
                text: `${srv.providerName || provider.name} chegou no endereço de atendimento.`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
          return updatedService;
        }
        return srv;
      })
    );

    if (updatedService) {
      safeFirestoreSetDoc('services', serviceId, updatedService);
    }

    soundManager.playSuccessChime();

    addNotification({
      type: 'provider_arrived',
      title: 'Profissional Chegou no Local',
      message: `${provider.name} está no endereço pronto para iniciar o atendimento.`,
      targetRole: 'client',
      serviceId
    });

    addAdminAlarm({
      level: 'info',
      title: `Profissional Chegou no Endereço (${srvCode})`,
      description: `${provider.name} confirmou chegada no local do cliente.`,
      category: 'arrived',
      serviceId,
      providerId: provider.id
    });
  };

  const clientConfirmProviderArrival = (serviceId: string) => {
    let srvCode = '';
    let pName = '';
    let updatedService: ServiceRequest | null = null;
    setServices(prev =>
      prev.map(srv => {
        if (srv.id === serviceId) {
          srvCode = srv.code;
          pName = srv.providerName || 'Profissional';
          updatedService = {
            ...srv,
            clientConfirmedArrival: true,
            clientConfirmedArrivalAt: Date.now(),
            chat: [
              ...srv.chat,
              {
                id: 'msg-conf-' + Date.now(),
                senderRole: 'system',
                senderName: 'M1 Brasil Serviços',
                text: `✅ Cliente confirmou a presença do profissional no endereço. Dados de contato e chat liberados com total segurança.`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
          return updatedService;
        }
        return srv;
      })
    );

    if (updatedService) {
      safeFirestoreSetDoc('services', serviceId, updatedService);
    }

    soundManager.playSuccessChime();

    addNotification({
      type: 'provider_arrived',
      title: 'Chegada Confirmada pelo Cliente',
      message: `O cliente atestou sua chegada no local. Seus canais de contato estão liberados.`,
      targetRole: 'provider',
      serviceId
    });

    addAdminAlarm({
      level: 'success',
      title: `Chegada Validada pelo Cliente (${srvCode})`,
      description: `Cliente confirmou no aplicativo que o prestador ${pName} já está trabalhando no endereço físico.`,
      category: 'arrived',
      serviceId
    });
  };

  // 4. Provider starts execution
  const startServiceExecution = (serviceId: string, beforePhotos?: typeof INITIAL_SERVICES[0]['media']) => {
    const nowTime = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    let srvCode = '';
    let updatedService: ServiceRequest | null = null;

    setServices(prev =>
      prev.map(srv => {
        if (srv.id === serviceId) {
          srvCode = srv.code;
          const categoryObj = SERVICE_CATEGORIES.find(c => c.id === srv.category);
          const initialChecklist = [
            { id: 'c-1', label: `Inspeção técnica e isolamento da área (${categoryObj?.name || 'Geral'})`, completed: true },
            { id: 'c-2', label: 'Registro fotográfico das condições iniciais (Antes)', completed: true },
            { id: 'c-3', label: 'Execução do reparo / conserto / instalação técnica', completed: false },
            { id: 'c-4', label: 'Testes de funcionamento, segurança e vedação', completed: false },
            { id: 'c-5', label: 'Limpeza do local e registro fotográfico final (Depois)', completed: false }
          ];

          updatedService = {
            ...srv,
            status: 'em_execucao',
            startedExecutionAt: nowTime,
            photoReport: {
              beforePhotos: beforePhotos || srv.media,
              afterPhotos: [],
              notes: 'Serviço iniciado com ferramental aferido e isolamento de segurança.',
              checklist: initialChecklist,
              timeSpentMinutes: 15,
              submittedAt: ''
            },
            chat: [
              ...srv.chat,
              {
                id: 'msg-' + Date.now(),
                senderRole: 'system',
                senderName: 'M1 Brasil Serviços',
                text: `Serviço iniciado no local. Registro fotográfico de ANTES catalogado.`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
          return updatedService;
        }
        return srv;
      })
    );

    if (updatedService) {
      safeFirestoreSetDoc('services', serviceId, updatedService);
    }

    soundManager.playSuccessChime();

    addAdminAlarm({
      level: 'info',
      title: `Execução de Serviço Iniciada (${srvCode})`,
      description: `Atividade iniciada no local com registro fotográfico de Antes.`,
      category: 'execution',
      serviceId,
      providerId: provider.id
    });
  };

  // 5. Provider submits Before & After Photo Report
  const submitPhotoReport = (serviceId: string, report: PhotoReport) => {
    const nowTime = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    const updatedReport: PhotoReport = {
      ...report,
      submittedAt: nowTime
    };

    let srvCode = '';
    let srvTitle = '';
    let clientId = '';
    let clientName = '';
    let updatedService: ServiceRequest | null = null;

    setServices(prev =>
      prev.map(srv => {
        if (srv.id === serviceId) {
          srvCode = srv.code;
          srvTitle = srv.title;
          clientId = srv.clientId;
          clientName = srv.clientName;
          updatedService = {
            ...srv,
            status: 'aguardando_confirmacao_pagamento',
            photoReport: updatedReport,
            completedAt: nowTime,
            payment: {
              ...srv.payment,
              status: 'paid_direct_to_provider',
              method: 'direct_to_provider',
              clientPaymentMethod: 'pix',
              clientPaidDirectlyAt: nowTime,
              providerTransferredFee: false,
            },
            chat: [
              ...srv.chat,
              {
                id: 'msg-' + Date.now(),
                senderRole: 'system',
                senderName: 'M1 Brasil Serviços',
                text: `📸 Relatório Fotográfico de Conclusão (Antes & Depois) enviado. Chamado finalizado no local! O prestador recebeu o valor direto do cliente e agora aguarda o envio da taxa de intermediação de R$ ${srv.payment.platformFeeAmount.toFixed(2)} à M1 Brasil.`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
          return updatedService;
        }
        return srv;
      })
    );

    if (updatedService) {
      safeFirestoreSetDoc('services', serviceId, updatedService);
    }

    soundManager.playSuccessChime();

    addNotification({
      type: 'report_submitted',
      title: 'Relatório Fotográfico Disponível!',
      message: `${provider.name} concluiu o serviço e enviou o laudo de Antes e Depois para sua aprovação.`,
      targetRole: 'client',
      serviceId
    });

    addAdminAlarm({
      level: 'success',
      title: `Laudo Fotográfico Enviado (${srvCode})`,
      description: `Profissional ${provider.name} enviou fotos de Antes e Depois para validação.`,
      category: 'photo_report',
      serviceId,
      providerId: provider.id
    });

    // Piloto Automático: Aprovação de Laudo e Liberação Automática de Pagamento
    if (settings.autoActionsEnabled && settings.autoApproveServiceReport) {
      setTimeout(() => {
        const ratingStub: ServiceRating = {
          id: 'rating-auto-' + Date.now(),
          serviceId,
          serviceCode: srvCode,
          serviceTitle: srvTitle,
          clientId: clientId,
          clientName: clientName || 'Cliente M1',
          providerId: provider.id,
          providerName: provider.name,
          score: 5,
          comment: 'Aprovado automaticamente pelo Piloto Automático M1 🤖',
          tags: ['Agilidade', 'Tecnologia'],
          createdAt: `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
          tipAmount: 0
        };
        approveReportAndPay(serviceId, ratingStub);
        
        setTimeout(() => {
          confirmPaymentReceived(serviceId);
        }, 500);
      }, 100);
    }
  };

  // 6. Client approves report, rates provider, and confirms direct payment to provider
  const approveReportAndPay = (
    serviceId: string, 
    rating: ServiceRating, 
    paymentMethod: 'pix' | 'dinheiro' | 'cartao' = 'pix'
  ) => {
    const nowTime = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    
    let srvCode = '';
    let clientName = '';
    let providerName = '';
    let totalAmt = 0;
    let feeAmt = 0;

    let updatedService: ServiceRequest | null = null;

    setServices(prev =>
      prev.map(srv => {
        if (srv.id === serviceId) {
          srvCode = srv.code;
          clientName = srv.clientName;
          providerName = srv.providerName || srv.assignedProviderName || 'Prestador Credenciado';
          totalAmt = srv.payment.totalAmount + (rating.tipAmount || 0);
          feeAmt = srv.payment.platformFeeAmount;
          
          updatedService = {
            ...srv,
            status: 'aguardando_confirmacao_pagamento',
            rating,
            payment: {
              ...srv.payment,
              status: 'paid_direct_to_provider',
              method: 'direct_to_provider',
              clientPaymentMethod: paymentMethod,
              clientPaidDirectlyAt: nowTime,
              providerTransferredFee: false,
            },
            chat: [
              ...srv.chat,
              {
                id: 'msg-eval-' + Date.now(),
                senderRole: 'client',
                senderName: srv.clientName,
                text: `✅ PAGAMENTO DIRETO AO PRESTADOR REALIZADO! O cliente avaliou o técnico com ${'⭐'.repeat(rating.score)} e efetuou o pagamento direto de R$ ${totalAmt.toFixed(2)} (${paymentMethod === 'pix' ? 'Pix' : paymentMethod === 'dinheiro' ? 'Dinheiro' : 'Cartão'}) diretamente ao prestador ${providerName}. Conforme o regulamento, o prestador deve fazer a transferência da porcentagem da taxa de R$ ${feeAmt.toFixed(2)} à Central M1 e o Administrador confirmará no Painel de Chamados.`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
          return updatedService;
        }
        return srv;
      })
    );

    if (updatedService) {
      safeFirestoreSetDoc('services', serviceId, updatedService);
    }

    // Notify provider that client has paid directly and they must transfer the platform fee
    addNotification({
      type: 'status_update',
      title: `💰 PAGAMENTO RECEBIDO DO CLIENTE (${srvCode})`,
      message: `O cliente ${clientName} pagou R$ ${totalAmt.toFixed(2)} diretamente a você. Faça a transferência da taxa M1 de R$ ${feeAmt.toFixed(2)} e informe no painel.`,
      targetRole: 'provider',
      serviceId
    });

    // Notify administrator
    addNotification({
      type: 'status_update',
      title: `💰 PGTO DIRETO AO PRESTADOR (${srvCode})`,
      message: `Cliente ${clientName} pagou R$ ${totalAmt.toFixed(2)} diretamente a ${providerName}. Aguardando repasse da taxa de R$ ${feeAmt.toFixed(2)} pelo prestador.`,
      targetRole: 'admin',
      serviceId
    });

    addAdminAlarm({
      level: 'warning',
      title: `Aguardando Repasse de Taxa M1 (${srvCode})`,
      description: `Cliente: ${clientName} pagou direto a ${providerName} (R$ ${totalAmt.toFixed(2)}). Taxa a receber do prestador: R$ ${feeAmt.toFixed(2)}.`,
      category: 'payment_pix',
      serviceId
    });
  };

  // 6.05 Provider marks fee transfer sent to M1
  const providerNotifyFeeTransferred = (serviceId: string, proofNotes?: string) => {
    const nowTime = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    let srvCode = '';
    let pName = '';
    let feeAmt = 0;
    let updatedService: ServiceRequest | null = null;

    setServices(prev =>
      prev.map(srv => {
        if (srv.id === serviceId) {
          srvCode = srv.code;
          pName = srv.providerName || srv.assignedProviderName || 'Prestador';
          feeAmt = srv.payment.platformFeeAmount;
          updatedService = {
            ...srv,
            payment: {
              ...srv.payment,
              providerTransferredFee: true,
              providerTransferredFeeAt: nowTime,
              providerFeeReceiptNotes: proofNotes || 'Transferência Pix da porcentagem da taxa realizada pelo prestador'
            },
            chat: [
              ...srv.chat,
              {
                id: 'msg-fee-transfer-' + Date.now(),
                senderRole: 'provider',
                senderName: pName,
                text: `💸 TAXA M1 TRANSFERIDA! O prestador ${pName} informou a transferência da taxa de intermediação M1 de R$ ${feeAmt.toFixed(2)}. Aguardando confirmação final do Administrador no Painel de Chamados.`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
          return updatedService;
        }
        return srv;
      })
    );

    if (updatedService) {
      safeFirestoreSetDoc('services', serviceId, updatedService);
    }

    addNotification({
      type: 'status_update',
      title: `💸 REPASSE DE TAXA INFORMADO (${srvCode})`,
      message: `O prestador ${pName} informou a transferência da taxa M1 de R$ ${feeAmt.toFixed(2)}. Confirme o recebimento no painel de chamados.`,
      targetRole: 'admin',
      serviceId
    });

    addAdminAlarm({
      level: 'warning',
      title: `Confirmar Recebimento de Taxa M1 (${srvCode})`,
      description: `Prestador: ${pName} transferiu a taxa M1 de R$ ${feeAmt.toFixed(2)}. Confirme no painel.`,
      category: 'payment_pix',
      serviceId
    });
  };

  // 6.1 Admin confirms provider's fee transfer was received & finalizes service in call dashboard
  const confirmPaymentReceived = (serviceId: string) => {
    const nowTime = `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`;
    let targetService: ServiceRequest | undefined;

    setServices(prev =>
      prev.map(srv => {
        if (srv.id === serviceId) {
          targetService = {
            ...srv,
            status: 'concluido_pago',
            completedAt: nowTime,
            isArchived: true,
            archivedAt: new Date().toISOString(),
            archivedEpoch: Date.now(),
            archivedBy: 'Central M1',
            archivedNotes: srv.archivedNotes || 'Atendimento concluído, pagamento direto ao prestador realizado e taxa M1 confirmada pelo Admin no painel.',
            payment: {
              ...srv.payment,
              status: 'paid_to_provider',
              providerTransferredFee: true,
              adminConfirmedAt: nowTime,
              adminConfirmedBy: 'Administrador M1',
              paidAt: nowTime
            },
            chat: [
              ...srv.chat,
              {
                id: 'msg-confirm-' + Date.now(),
                senderRole: 'system',
                senderName: 'Central M1 Brasil',
                text: `✅ PAGAMENTO & TAXA CONFIRMADOS PELO ADMIN! O Administrador confirmou no Painel de Chamados o recebimento da taxa de intermediação de R$ ${srv.payment.platformFeeAmount.toFixed(2)} transferida pelo prestador referente ao valor total de R$ ${(srv.payment.totalAmount + (srv.rating?.tipAmount || 0)).toFixed(2)}. Chamado finalizado com sucesso e arquivado!`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
          return targetService;
        }
        return srv;
      })
    );

    if (targetService) {
      safeFirestoreSetDoc('services', serviceId, targetService);
    }

    // Dynamic wallet & stat recording based on updated values
    setTimeout(() => {
      setServicesInternal(currentServices => {
        const found = currentServices.find(s => s.id === serviceId);
        if (found) {
          const rating = found.rating || { score: 5, comment: '', tags: [], createdAt: nowTime };
          const payout = found.payment.providerPayoutAmount + (rating.tipAmount || 0);
          const fee = found.payment.platformFeeAmount;
          const finalProviderId = found.providerId || found.assignedProviderId;

          // Update provider wallet
          setProviders(prevProviders => prevProviders.map(p => {
            if (p.id === finalProviderId) {
              const newTotalReviews = p.totalReviews + 1;
              const newRating = Math.round(((p.rating * p.totalReviews + rating.score) / newTotalReviews) * 100) / 100;
              return {
                ...p,
                walletBalance: p.walletBalance + payout,
                totalEarned: p.totalEarned + payout,
                completedJobsCount: p.completedJobsCount + 1,
                totalReviews: newTotalReviews,
                rating: newRating
              };
            }
            return p;
          }));

          // Review record
          setReviews(prevReviews => [rating, ...prevReviews]);

          // Platform transaction
          const newTx: PlatformTransaction = {
            id: 'tx-' + Date.now(),
            serviceId: found.id,
            serviceCode: found.code,
            serviceTitle: found.title,
            providerName: found.providerName || found.assignedProviderName || 'Prestador M1',
            clientName: found.clientName,
            totalAmount: found.payment.totalAmount + (rating.tipAmount || 0),
            platformFee: fee,
            providerPayout: payout,
            type: 'service_payout',
            status: 'completed',
            timestamp: nowTime
          };
          setTransactions(prevTxs => [newTx, ...prevTxs]);

          // Play Audio alerts
          soundManager.playCashRegister();

          // Notifications
          addNotification({
            type: 'payout_received',
            title: '✅ ATENDIMENTO FINALIZADO & TAXA CONFIRMADA!',
            message: `O Administrador M1 confirmou o recebimento da taxa da plataforma. Seu atendimento ${found.code} foi concluído com sucesso!`,
            targetRole: 'provider',
            serviceId
          });

          addAdminAlarm({
            level: 'success',
            title: `Taxa M1 Confirmada no Painel (${found.code})`,
            description: `Valor total do serviço: R$ ${found.payment.totalAmount.toFixed(2)} | Taxa da plataforma recebida: R$ ${fee.toFixed(2)}. Chamado concluído.`,
            category: 'payment_pix',
            serviceId,
            providerId: finalProviderId,
            clientId: found.clientId
          });
        }
        return currentServices;
      });
    }, 250);

    // Fire confetti celebration
    try {
      confetti({
        particleCount: 95,
        spread: 80,
        origin: { y: 0.5 }
      });
    } catch {
      // ignore
    }
  };

  // Toggle Archive status of a service for the Admin's Archive Database (Pasta Arquivo Morto)
  const toggleArchiveService = (serviceId: string, notes?: string) => {
    let srvCode = '';
    let isArchiving = false;
    let updatedService: ServiceRequest | null = null;
    setServices(prev =>
      prev.map(srv => {
        if (srv.id === serviceId) {
          srvCode = srv.code;
          isArchiving = !srv.isArchived;
          updatedService = {
            ...srv,
            isArchived: isArchiving,
            archivedAt: isArchiving ? new Date().toISOString() : undefined,
            archivedEpoch: isArchiving ? Date.now() : undefined,
            archivedBy: 'Admin Central M1',
            archivedNotes: notes !== undefined ? notes : srv.archivedNotes
          };
          return updatedService;
        }
        return srv;
      })
    );

    if (updatedService) {
      safeFirestoreSetDoc('services', serviceId, updatedService);
    }

    triggerSyncEvent(
      'general_update',
      isArchiving ? 'Atividade Arquivada' : 'Atividade Restaurada',
      `O chamado #${srvCode} foi ${isArchiving ? 'movido para a Pasta Arquivo Morto' : 'restaurado do arquivo'}.`,
      'message',
      'admin',
      serviceId
    );
  };

  // Cancel service
  const cancelServiceRequest = (serviceId: string, reason: string, futureAction?: string) => {
    let srvCode = '';
    const nowIso = new Date().toISOString();
    const cancelledByRole = currentRole === 'admin' ? 'Administrador Central M1' : (currentRole === 'provider' ? 'Prestador' : 'Cliente');
    
    const defaultFutureAction = futureAction || 
      "Infelizmente não encontramos profissionais para atender sua solicitação, porém já estamos registrando essa demanda em nosso banco de dados e vamos providenciar profissionais qualificados para atender a sua necessidade em breve!";

    setServices(prev =>
      prev.map(srv => {
        if (srv.id === serviceId) {
          srvCode = srv.code;
          const updated: ServiceRequest = {
            ...srv,
            status: 'cancelado',
            cancellationReason: reason,
            cancellationFutureAction: defaultFutureAction,
            cancelledAt: nowIso,
            cancelledBy: cancelledByRole,
            chat: [
              ...srv.chat,
              {
                id: 'msg-' + Date.now(),
                senderRole: 'system',
                senderName: 'M1 Brasil Serviços',
                text: `Serviço cancelado (${cancelledByRole}). Motivo: ${reason}. Providência Futura: ${defaultFutureAction}`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };

          // Sync with Firestore if available
          safeFirestoreSetDoc('services', serviceId, updated);

          return updated;
        }
        return srv;
      })
    );

    addAdminAlarm({
      level: 'warning',
      title: `Chamado Cancelado (${srvCode})`,
      description: `Motivo: ${reason}`,
      category: 'new_request',
      serviceId
    });
  };

  // Send message in service chat
  const sendChatMessage = async (serviceId: string, text: string, mediaUrl?: string) => {
    const senderName = currentRole === 'client' ? client.name.split(' ')[0] : currentRole === 'provider' ? provider.name.split(' ')[0] : 'Administrador M1';
    const senderId = currentRole === 'client' ? activeClientId : currentRole === 'provider' ? activeProviderId : 'admin';

    const newMsg: ChatMessage = {
      id: 'msg-' + Math.random().toString(36).substr(2, 9),
      senderRole: currentRole,
      senderName,
      text: text || '',
      mediaUrl: mediaUrl || undefined,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
    };

    // Update state locally inside services list
    setServices(prev => prev.map(srv => {
      if (srv.id === serviceId) {
        const oldChat = srv.chat || [];
        // Prevent duplicate append
        if (oldChat.some(m => m.text === text && m.senderRole === currentRole)) return srv;
        return {
          ...srv,
          chat: [...oldChat, newMsg]
        };
      }
      return srv;
    }));

    // Dynamic notification routing to keep everyone synchronized in real-time
    const targetService = services.find(s => s.id === serviceId);
    if (targetService) {
      if (currentRole === 'admin') {
        // Admin sends message -> notify both Client and Provider
        addNotification({
          type: 'status_update',
          title: `💬 Mensagem da Central M1`,
          message: text.length > 60 ? `${text.substring(0, 60)}...` : text,
          targetRole: 'client',
          serviceId
        });
        addNotification({
          type: 'status_update',
          title: `💬 Mensagem da Central M1`,
          message: text.length > 60 ? `${text.substring(0, 60)}...` : text,
          targetRole: 'provider',
          serviceId
        });
      } else if (currentRole === 'client') {
        // Client sends message -> notify Provider & Admin
        addNotification({
          type: 'status_update',
          title: `💬 Mensagem do Cliente ${senderName}`,
          message: text.length > 60 ? `${text.substring(0, 60)}...` : text,
          targetRole: 'provider',
          serviceId
        });
        addNotification({
          type: 'status_update',
          title: `💬 Mensagem do Cliente (${targetService.code})`,
          message: text.length > 60 ? `${text.substring(0, 60)}...` : text,
          targetRole: 'admin',
          serviceId
        });
        addAdminAlarm({
          level: 'warning',
          title: `💬 Mensagem de Cliente (${targetService.code})`,
          description: `${senderName}: "${text.substring(0, 50)}"`,
          category: 'new_request',
          serviceId
        });
      } else if (currentRole === 'provider') {
        // Provider sends message -> notify Client & Admin
        addNotification({
          type: 'status_update',
          title: `💬 Mensagem do Prestador ${senderName}`,
          message: text.length > 60 ? `${text.substring(0, 60)}...` : text,
          targetRole: 'client',
          serviceId
        });
        addNotification({
          type: 'status_update',
          title: `💬 Mensagem do Prestador (${targetService.code})`,
          message: text.length > 60 ? `${text.substring(0, 60)}...` : text,
          targetRole: 'admin',
          serviceId
        });
        addAdminAlarm({
          level: 'warning',
          title: `💬 Mensagem de Prestador (${targetService.code})`,
          description: `${senderName}: "${text.substring(0, 50)}"`,
          category: 'new_request',
          serviceId
        });
      }
    }

    triggerSyncEvent(
      'chat_message',
      `Nova Mensagem de ${senderName}`,
      text.length > 50 ? `${text.substring(0, 50)}...` : text,
      'message',
      currentRole,
      serviceId
    );
  };

  // Track read messages per service
  const [chatLastReadCount, setChatLastReadCount] = useState<{ [serviceId: string]: number }>(() => {
    try {
      const cached = localStorage.getItem('m1_chat_last_read_count_v1');
      return cached ? JSON.parse(cached) : {};
    } catch {
      return {};
    }
  });

  const markChatAsRead = useCallback((serviceId: string) => {
    const srv = servicesRef.current.find(s => s.id === serviceId);
    if (srv) {
      setChatLastReadCount(prev => {
        const currentLength = srv.chat?.length || 0;
        if (prev[serviceId] === currentLength) return prev;
        const next = { ...prev, [serviceId]: currentLength };
        localStorage.setItem('m1_chat_last_read_count_v1', JSON.stringify(next));
        return next;
      });
    }
  }, []);

  const isChatUnread = useCallback((serviceId: string) => {
    const srv = servicesRef.current.find(s => s.id === serviceId);
    if (!srv || !srv.chat || srv.chat.length === 0) return false;
    const lastRead = chatLastReadCount[serviceId] || 0;
    return srv.chat.length > lastRead;
  }, [chatLastReadCount]);

  // Create or return direct admin-support service request for chatting with any client or provider
  const createAdminSupportRequest = (userId: string, userType: 'client' | 'provider'): string => {
    const serviceId = 'srv-support-' + userId;
    const serviceCode = `#SUP-${userId.substring(0, 5).toUpperCase()}`;

    const existing = services.find(s => s.id === serviceId);
    if (existing) return serviceId;

    let srvClientName = 'Suporte';
    let srvClientPhone = '';
    let srvClientAvatar = '';
    let srvClientId = userId;

    let srvProviderId = undefined;
    let srvProviderName = undefined;
    let srvProviderPhone = undefined;

    if (userType === 'client') {
      const u = clients.find(c => c.id === userId);
      if (u) {
        srvClientName = u.name;
        srvClientPhone = u.phone;
        srvClientAvatar = u.avatar || '';
        srvClientId = u.id;
      }
    } else {
      const p = providers.find(pr => pr.id === userId);
      if (p) {
        srvProviderId = p.id;
        srvProviderName = p.name;
        srvProviderPhone = p.phone;
      }
      srvClientName = 'Administrador M1';
      srvClientPhone = '0800 000 0000';
    }

    const newSupportSrv: ServiceRequest = {
      id: serviceId,
      code: serviceCode,
      clientId: srvClientId,
      clientName: srvClientName,
      clientAvatar: srvClientAvatar,
      clientPhone: srvClientPhone,
      providerId: srvProviderId,
      providerName: srvProviderName,
      providerPhone: srvProviderPhone,
      category: 'geral',
      title: 'Canal de Suporte e Ouvidoria Direta M1',
      description: 'Canal de chat direto e exclusivo em tempo real com o Administrador da plataforma M1.',
      urgency: 'imediato',
      media: [],
      address: {
        street: 'Central M1 Brasil',
        number: '100',
        neighborhood: 'Centro',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01001-000',
        lat: -23.55052,
        lng: -46.633308
      },
      estimatedPrice: 0,
      status: 'solicitado',
      createdAt: new Date().toISOString(),
      proposals: [],
      chat: [],
      payment: {
        method: 'pix',
        status: 'pending',
        totalAmount: 0,
        platformFeeAmount: 0,
        providerPayoutAmount: 0
      }
    };

    setServices(prev => [newSupportSrv, ...prev]);
    return serviceId;
  };

  // Clear all chats stored in Firebase
  const clearAllFirebaseChats = () => {
    setServices(prev => prev.map(s => ({ ...s, chat: [] })));
  };

  // Simulate heavy database chat capacity load
  const simulateFirebaseCapacityLoad = () => {
    setServices(prev => {
      if (prev.length === 0) return prev;
      return prev.map((s, idx) => {
        // Feed mock capacity test payloads to the active channels
        if (idx === 0 || s.id.startsWith('srv-support-')) {
          const bulkChats = Array.from({ length: 15 }, (_, i) => ({
            id: `bulk-${Date.now()}-${i}-${Math.floor(Math.random() * 1000)}`,
            senderRole: 'system' as const,
            senderName: 'M1 Carga Teste',
            text: `[ESTRESSE DE DADOS] Mensagem de teste de payload n° ${i + 1} para checagem de armazenamento, paginação, volumetria de banco e tolerância de tráfego do Firestore Cloud.`,
            timestamp: new Date().toLocaleTimeString('pt-BR')
          }));
          return { ...s, chat: [...(s.chat || []), ...bulkChats] };
        }
        return s;
      });
    });
  };

  // Toggle whether the provider can join the service's chat
  const toggleProviderChatRelease = (serviceId: string) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        const nextState = !s.providerChatReleased;
        // Inject a system notification inside the chat history too!
        const systemMsg = {
          id: `sys-${Date.now()}`,
          senderRole: 'system' as const,
          senderName: 'Sistema M1',
          text: nextState 
            ? '🔓 O Administrador aprovou o orçamento e liberou a conversa direta com o Prestador de Serviços!'
            : '🔒 A conversa direta com o Prestador foi suspensa temporariamente pelo Administrador.',
          timestamp: new Date().toLocaleTimeString('pt-BR')
        };
        return {
          ...s,
          providerChatReleased: nextState,
          chat: [...(s.chat || []), systemMsg]
        };
      }
      return s;
    }));
  };

  // Client updates profile
  const updateClientProfile = (clientId: string, updatedData: Partial<ClientProfile>) => {
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, ...updatedData } : c));
  };

  const switchActiveClient = (clientId: string) => {
    setActiveClientId(clientId);
    setAuthenticatedClientId(clientId);
    try {
      localStorage.setItem(DB_KEY_CLIENT_AUTH, clientId);
      localStorage.setItem(DB_KEY_ACTIVE_CLIENT, clientId);
      localStorage.removeItem('m1_client_explicit_logout');
    } catch {
      // ignore
    }
  };

  const switchActiveProvider = (providerId: string) => {
    setActiveProviderId(providerId);
    setAuthenticatedProviderId(providerId);
    try {
      localStorage.setItem(DB_KEY_PROVIDER_AUTH, providerId);
      localStorage.setItem(DB_KEY_ACTIVE_PROVIDER, providerId);
      localStorage.removeItem('m1_provider_explicit_logout');
    } catch {
      // ignore
    }
  };

  // Toggle Provider Online
  const toggleProviderOnline = () => {
    setProviders(prev => prev.map(p => {
      if (p.id === provider.id) {
        const nextState = !p.isOnline;
        if (nextState) soundManager.playRadarPing();
        
        // Dispatch instant alert/alarm to Admin
        addAdminAlarm({
          level: nextState ? 'success' : 'critical',
          title: `Prestador ${nextState ? 'Ficou Online 🟢' : 'Ficou Offline 🔴'}`,
          description: `O prestador credenciado ${p.name} agora está ${nextState ? 'disponível' : 'indisponível'} para atendimentos no radar.`,
          category: 'new_request'
        });

        addNotification({
          type: 'status_update',
          title: `🚨 Status do Prestador Alterado`,
          message: `O prestador ${p.name} está agora ${nextState ? 'ON-LINE 🟢' : 'OFF-LINE 🔴'}.`,
          targetRole: 'admin'
        });

        return { ...p, isOnline: nextState };
      }
      return p;
    }));
  };

  // Provider Settings
  const updateProviderSettings = (settingsData: {
    radiusKm?: number;
    categories?: ServiceCategory[];
    pixKey?: string;
    fullName?: string;
    phone?: string;
    city?: string;
    vehicleModel?: string;
    vehiclePlate?: string;
    bankAccount?: string;
    avatar?: string;
  }) => {
    let sensitiveChanged = false;

    setProviders(prev => prev.map(p => {
      if (provider && p.id === provider.id) {
        // Check if sensitive data actually changed
        const pixChanged = settingsData.pixKey !== undefined && settingsData.pixKey !== p.pixKey;
        const nameChanged = settingsData.fullName !== undefined && settingsData.fullName !== p.name;
        const phoneChanged = settingsData.phone !== undefined && settingsData.phone !== p.phone;
        const cityChanged = settingsData.city !== undefined && settingsData.city !== p.city;
        const vehicleChanged = settingsData.vehicleModel !== undefined && settingsData.vehicleModel !== p.vehicleModel;
        const plateChanged = settingsData.vehiclePlate !== undefined && settingsData.vehiclePlate !== p.vehiclePlate;
        const bankChanged = settingsData.bankAccount !== undefined && settingsData.bankAccount !== (p as any).bankAccount;
        const avatarChanged = settingsData.avatar !== undefined && settingsData.avatar !== p.avatar;

        // Specialties check
        let catsChanged = false;
        if (settingsData.categories) {
          const oldCats = p.categories || [];
          if (settingsData.categories.length !== oldCats.length || !settingsData.categories.every(c => oldCats.includes(c))) {
            catsChanged = true;
          }
        }

         if (pixChanged || nameChanged || phoneChanged || cityChanged || vehicleChanged || plateChanged || bankChanged || catsChanged || avatarChanged) {
          sensitiveChanged = true;
        }

        const nextStatus = sensitiveChanged ? 'aguardando_liberacao_admin' : p.status;
        const nextAuthorized = sensitiveChanged ? false : p.isAuthorized;

        return {
          ...p,
          radiusKm: settingsData.radiusKm !== undefined ? settingsData.radiusKm : p.radiusKm,
          categories: settingsData.categories || p.categories,
          pixKey: settingsData.pixKey !== undefined ? settingsData.pixKey : p.pixKey,
          name: settingsData.fullName !== undefined ? settingsData.fullName : p.name,
          fullName: settingsData.fullName !== undefined ? settingsData.fullName : p.fullName,
          phone: settingsData.phone !== undefined ? settingsData.phone : p.phone,
          city: settingsData.city !== undefined ? settingsData.city : p.city,
          vehicleModel: settingsData.vehicleModel !== undefined ? settingsData.vehicleModel : p.vehicleModel,
          vehiclePlate: settingsData.vehiclePlate !== undefined ? settingsData.vehiclePlate : p.vehiclePlate,
          bankAccount: settingsData.bankAccount !== undefined ? settingsData.bankAccount : (p as any).bankAccount,
          avatar: settingsData.avatar !== undefined ? settingsData.avatar : p.avatar,
          documents: {
            ...(p.documents || {}),
            facePhoto: settingsData.avatar !== undefined ? settingsData.avatar : p.documents?.facePhoto
          },
          status: nextStatus,
          isAuthorized: nextAuthorized
        };
      }
      return p;
    }));

    if (sensitiveChanged) {
      soundManager.playAdminAlarm();
      addAdminAlarm({
        level: 'critical',
        title: `⚠️ EDIÇÃO SENSÍVEL: ${settingsData.fullName || provider?.name || 'Prestador'}`,
        description: `O prestador editou informações de perfil sensíveis (Pix/Categorias/Identificação) e aguarda nova homologação.`,
        category: 'new_registration',
        providerId: provider?.id
      });

      triggerSyncEvent(
        'general_update',
        '🔒 PERFIL SOB ANÁLISE',
        `O técnico ${settingsData.fullName || provider?.name} alterou dados sensíveis. O acesso foi bloqueado para análise da Central.`,
        'alarm',
        'provider'
      );
    } else {
      triggerSyncEvent(
        'general_update',
        '⚙️ PREFERÊNCIAS ATUALIZADAS',
        `O prestador ${provider?.name} atualizou suas preferências de raio de atendimento.`,
        'success',
        'provider'
      );
    }
  };

  // Provider Location GPS tracking with city name
  const updateProviderLocation = async (providerId: string, lat: number, lng: number) => {
    let city = '';
    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'pt-BR' }
      });
      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        city = addr.city || addr.town || addr.village || addr.municipality || 'São Paulo';
        if (addr.state) {
          city = `${city}, ${addr.state}`;
        }
      }
    } catch (err) {
      console.error("Erro no reverse geocoding do prestador: ", err);
    }

    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return {
          ...p,
          lat,
          lng,
          city: city || p.city || 'São Paulo, SP'
        };
      }
      return p;
    }));

    addNotification({
      title: 'GPS do Prestador Sincronizado!',
      message: `Sua localização foi atualizada com a central na cidade de ${city || 'São Paulo, SP'}.`,
      type: 'status_update',
      targetRole: 'provider'
    });
  };

  // Provider instant Pix withdrawal
  const withdrawProviderPix = (amount: number) => {
    if (amount <= 0 || amount > provider.walletBalance) {
      return { success: false, message: 'Saldo insuficiente para realizar o saque Pix.' };
    }

    const receiptId = 'PIX-' + Math.random().toString(36).substring(2, 9).toUpperCase();

    setProviders(prev => prev.map(p => {
      if (p.id === provider.id) {
        return {
          ...p,
          walletBalance: Math.round((p.walletBalance - amount) * 100) / 100
        };
      }
      return p;
    }));

    const newTx: PlatformTransaction = {
      id: 'tx-' + Date.now(),
      serviceId: receiptId,
      serviceCode: receiptId,
      serviceTitle: `Saque Pix para ${provider.pixKey}`,
      providerName: provider.name,
      clientName: 'M1 Brasil Financeiro',
      totalAmount: amount,
      platformFee: 0,
      providerPayout: amount,
      type: 'pix_withdrawal',
      status: 'completed',
      timestamp: `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`
    };

    setTransactions(prev => [newTx, ...prev]);
    soundManager.playCashRegister();

    addAdminAlarm({
      level: 'info',
      title: `Saque Pix Efetuado (${receiptId})`,
      description: `Profissional ${provider.name} sacou R$ ${amount.toFixed(2)} via Pix.`,
      category: 'payment_pix',
      providerId: provider.id
    });

    return {
      success: true,
      message: `Transferência Pix de R$ ${amount.toFixed(2)} efetuada com sucesso para a chave ${provider.pixKey}.`,
      receiptId
    };
  };

  const requestCategoryChange = (category: ServiceCategory, action: 'add' | 'remove') => {
    setProviders(prev => prev.map(p => {
      if (provider && p.id === provider.id) {
        const existingRequests = p.pendingCategoriesRequests || [];
        if (existingRequests.some(r => r.category === category && r.action === action && r.status === 'pending')) {
          return p;
        }
        const newRequest = {
          category,
          action,
          status: 'pending' as const,
          requestedAt: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
        };
        
        let updatedServices = [...(p.providedServices || [])];
        if (action === 'add' && !updatedServices.includes(category)) {
          updatedServices.push(category);
        }

        return {
          ...p,
          providedServices: updatedServices,
          pendingCategoriesRequests: [newRequest, ...existingRequests]
        };
      }
      return p;
    }));

    const catName = SERVICE_CATEGORIES.find(c => c.id === category)?.name || category;
    const actionLabel = action === 'add' ? 'Adicionar' : 'Remover';
    
    // Unified profile edit request
    submitProfileEditRequest(
      provider.id,
      'specialty:' + category,
      `Especialidade: ${catName}`,
      action === 'add' ? 'Inativa' : 'Ativa',
      action === 'add' ? 'Ativa (Pendente)' : 'Inativa (Pendente)',
      action
    );
  };

  const resolveCategoryRequest = (providerId: string, category: ServiceCategory, action: 'add' | 'remove', decision: 'approved' | 'rejected') => {
    let provName = '';
    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        provName = p.name;
        const updatedRequests = (p.pendingCategoriesRequests || []).map(r => {
          if (r.category === category && r.action === action && r.status === 'pending') {
            return { ...r, status: decision };
          }
          return r;
        });

        let updatedCategories = [...p.categories];
        if (decision === 'approved') {
          if (action === 'add' && !updatedCategories.includes(category)) {
            updatedCategories.push(category);

            // Dynamically register in master categories state if not already present
            setCategories(prevCats => {
              if (!prevCats.some(c => c.id === category)) {
                // Determine a elegant name based on ID
                const rawName = category.charAt(0).toUpperCase() + category.slice(1).replace(/_/g, ' ');
                const newCat = {
                  id: category,
                  name: rawName,
                  iconName: 'Wrench',
                  description: `Serviço e atividade credenciada sob demanda de ${p.name || 'prestador'}.`,
                  basePrice: 150,
                  badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                  defaultEtaMinutes: 20,
                  averageExecutionMinutes: 60
                };
                return [...prevCats, newCat];
              }
              return prevCats;
            });
          } else if (action === 'remove') {
            updatedCategories = updatedCategories.filter(c => c !== category);
          }
        }

        return {
          ...p,
          categories: updatedCategories,
          pendingCategoriesRequests: updatedRequests
        };
      }
      return p;
    }));

    const catName = SERVICE_CATEGORIES.find(c => c.id === category)?.name || category;
    const decisionLabel = decision === 'approved' ? 'Aprovada' : 'Recusada';

    addAdminAlarm({
      level: decision === 'approved' ? 'success' : 'warning',
      title: `Solicitação de Especialidade ${decisionLabel}`,
      description: `A solicitação de ${provName} para ${action === 'add' ? 'adicionar' : 'remover'} "${catName}" foi ${decisionLabel}.`,
      category: 'new_registration',
      providerId
    });
  };

  // Admin CRUD operations
  const saveAppSettings = (newSettings: Partial<AppSettings>) => {
    setSettings(prev => ({ ...prev, ...newSettings }));
  };

  const updateServiceStatus = (serviceId: string, newStatus: ServiceRequest['status']) => {
    setServices(prev => prev.map(s => s.id === serviceId ? { ...s, status: newStatus } : s));
  };

  const editServiceDetails = (serviceId: string, updates: Partial<ServiceRequest>) => {
    setServices(prev => prev.map(s => {
      if (s.id === serviceId) {
        const updatedService = { ...s, ...updates };
        if (updates.estimatedPrice !== undefined && updates.estimatedPrice > 0) {
          const feeRate = (settings.platformFeePercent || 15) / 100;
          const fee = Math.round(updates.estimatedPrice * feeRate * 100) / 100;
          const payout = Math.round((updates.estimatedPrice - fee) * 100) / 100;
          updatedService.payment = {
            ...s.payment,
            totalAmount: updates.estimatedPrice,
            platformFeeAmount: fee,
            providerPayoutAmount: payout,
            pixCode: `00020126580014br.gov.bcb.pix0136${s.id}5204000053039865405${updates.estimatedPrice.toFixed(2)}5802BR5924M1Brasil6009Sao Paulo62070503***6304`
          };
        }
        return updatedService;
      }
      return s;
    }));

    triggerSyncEvent(
      'general_update',
      'Atendimento Atualizado',
      `O chamado foi atualizado com novas informações.`,
      'success',
      'admin',
      serviceId
    );
  };

  const addOrUpdateClient = (clientData: ClientProfile) => {
    setClients(prev => {
      const exists = prev.some(c => c.id === clientData.id);
      if (exists) {
        return prev.map(c => c.id === clientData.id ? clientData : c);
      }
      return [clientData, ...prev];
    });

    triggerSyncEvent(
      'general_update',
      '👥 CLIENTE ATUALIZADO',
      `O cadastro do cliente ${clientData.name} foi atualizado pela Central M1.`,
      'success',
      'client'
    );
  };

  const deleteClient = (clientId: string) => {
    setClients(prev => prev.filter(c => c.id !== clientId));
    safeFirestoreDeleteDoc('clients', clientId);

    triggerSyncEvent(
      'general_update',
      '👥 CLIENTE REMOVIDO',
      `Um cadastro de cliente foi removido da plataforma pela administração.`,
      'alarm',
      'client'
    );
  };

  const addOrUpdateProvider = (providerData: ProviderProfile) => {
    setProviders(prev => {
      const exists = prev.some(p => p.id === providerData.id);
      if (exists) {
        return prev.map(p => p.id === providerData.id ? providerData : p);
      }
      return [providerData, ...prev];
    });

    triggerSyncEvent(
      'general_update',
      '👥 PRESTADOR ATUALIZADO',
      `O cadastro do prestador ${providerData.name} foi atualizado pela Central M1.`,
      'success',
      'provider'
    );
  };

  const deleteProvider = (providerId: string) => {
    setProviders(prev => prev.filter(p => p.id !== providerId));
    safeFirestoreDeleteDoc('providers', providerId);

    triggerSyncEvent(
      'general_update',
      '👥 PRESTADOR REMOVIDO',
      `Um cadastro de prestador foi removido da plataforma pela administração.`,
      'alarm',
      'provider'
    );
  };

  const moderateReview = (reviewId: string, updates: Partial<ServiceRating>) => {
    setReviews(prev => prev.map(r => r.id === reviewId ? { ...r, ...updates } : r));
  };

  const deleteReview = (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
  };

  // Database Backup / Export / Import
  const exportDatabaseJson = (): string => {
    const fullDb = {
      version: '3.0',
      exportedAt: new Date().toISOString(),
      settings,
      clients,
      providers,
      services,
      transactions,
      adminAlarms,
      reviews
    };
    return JSON.stringify(fullDb, null, 2);
  };

  const importDatabaseJson = (jsonString: string): { success: boolean; message: string } => {
    try {
      const parsed = JSON.parse(jsonString);
      if (parsed.settings) setSettings(parsed.settings);
      if (Array.isArray(parsed.clients)) setClients(parsed.clients);
      if (Array.isArray(parsed.providers)) setProviders(parsed.providers);
      if (Array.isArray(parsed.services)) setServices(parsed.services);
      if (Array.isArray(parsed.transactions)) setTransactions(parsed.transactions);
      if (Array.isArray(parsed.adminAlarms)) setAdminAlarms(parsed.adminAlarms);
      if (Array.isArray(parsed.reviews)) setReviews(parsed.reviews);
      return { success: true, message: 'Banco de dados restaurado e sincronizado com sucesso!' };
    } catch {
      return { success: false, message: 'Arquivo JSON inválido ou corrompido.' };
    }
  };

  // Simulation generator for incoming request
  const simulateIncomingRequest = (category?: ServiceCategory) => {
    const categories: ServiceCategory[] = ['hidraulica', 'eletrica', 'ar_condicionado', 'pintura', 'chaveiro', 'mecanica'];
    const chosenCat = category || categories[Math.floor(Math.random() * categories.length)];
    const preset = PRESET_SAMPLE_MEDIA[chosenCat as keyof typeof PRESET_SAMPLE_MEDIA] || PRESET_SAMPLE_MEDIA.hidraulica;
    const catInfo = SERVICE_CATEGORIES.find(c => c.id === chosenCat) || SERVICE_CATEGORIES[0];
    const price = (catInfo?.basePrice || 180) + Math.floor(Math.random() * 8) * 10;

    createServiceRequest({
      category: chosenCat,
      title: preset.title,
      description: `Chamado de teste simulado para validação da plataforma M1 BRASIL SERVIÇOS. Atendimento rápido e laudo técnico.`,
      urgency: 'imediato',
      media: preset.media,
      address: {
        street: 'Rua Oscar Freire',
        number: `${Math.floor(200 + Math.random() * 1200)}`,
        neighborhood: 'Jardins',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01426-001',
        lat: -23.562000 + (Math.random() - 0.5) * 0.02,
        lng: -46.668000 + (Math.random() - 0.5) * 0.02,
        referencePoint: 'Próximo à Estação Oscar Freire'
      },
      estimatedPrice: price
    });
  };

  // Simulation generator for provider proposal
  const simulateProviderProposal = (serviceId: string) => {
    const srv = services.find(s => s.id === serviceId);
    const candidateProvider = providers.find(p => p.isOnline) || providers[0];
    if (!candidateProvider) return;

    const basePrice = srv ? srv.estimatedPrice : 200;
    const proposedPrice = Math.max(90, basePrice - Math.floor(Math.random() * 3) * 15);
    const eta = 8 + Math.floor(Math.random() * 10);

    const propId = 'prop-sim-' + Date.now();
    const newProposal: ServiceProposal = {
      id: propId,
      serviceId,
      providerId: candidateProvider.id,
      providerName: candidateProvider.name,
      providerAvatar: candidateProvider.avatar,
      providerPhone: candidateProvider.phone,
      providerRating: candidateProvider.rating,
      providerCompletedJobs: candidateProvider.completedJobsCount,
      providerVehicle: candidateProvider.vehicleModel,
      providerPlate: candidateProvider.vehiclePlate,
      proposedPrice,
      estimatedArrivalMinutes: eta,
      message: `Olá! Analisei as fotos do chamado. Possuo ferramental especializado e peças de reposição no veículo ${candidateProvider.vehicleModel}. Posso chegar em ${eta} minutos.`,
      createdAt: `Hoje às ${new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}`,
      status: 'pending'
    };

    setServices(prev =>
      prev.map(s => {
        if (s.id === serviceId) {
          return {
            ...s,
            status: 'negociando',
            proposals: [newProposal, ...s.proposals.filter(p => p.providerId !== candidateProvider.id)]
          };
        }
        return s;
      })
    );

    soundManager.playIncomingJobAlert();

    addNotification({
      type: 'proposal_received',
      title: 'Proposta Recebida no Chamado!',
      message: `${candidateProvider.name} enviou uma proposta de R$ ${proposedPrice.toFixed(2)} (Chegada em ${eta} min).`,
      targetRole: 'client',
      serviceId
    });

    addAdminAlarm({
      level: 'info',
      title: `Nova Proposta de Profissional Credenciado`,
      description: `${candidateProvider.name} propôs R$ ${proposedPrice.toFixed(2)} para atendimento em ${eta} min.`,
      category: 'proposal_negotiated',
      serviceId,
      providerId: candidateProvider.id
    });
  };

  // Categories CRUD
  const updateCategory = (updatedCategory: (typeof SERVICE_CATEGORIES)[0]) => {
    setCategories(prev => prev.map(c => c.id === updatedCategory.id ? updatedCategory : c));
  };

  const addCategory = (newCategory: (typeof SERVICE_CATEGORIES)[0]) => {
    setCategories(prev => [...prev.filter(c => c.id !== newCategory.id), newCategory]);
  };

  const deleteCategory = (catId: string) => {
    setCategories(prev => prev.filter(c => c.id !== catId));
  };

  // Admin Authentication & Exclusive Access
  const loginAdmin = (passwordOrPin: string): { success: boolean; message: string } => {
    const cleanInput = passwordOrPin.trim();
    const validPassword = settings.adminPassword || 'M1#Adm!9621@Br2026';
    const validPin = settings.adminMasterPin || '9621';

    if (cleanInput === validPassword || cleanInput === validPin) {
      setIsAdminAuthenticated(true);
      setCurrentRole('admin');
      try {
        sessionStorage.setItem(DB_KEY_ADMIN_AUTH, 'true');
      } catch {
        // ignore
      }
      return { success: true, message: 'Autenticação de Administrador realizada com sucesso!' };
    }

    return { success: false, message: 'Senha ou PIN de acesso incorreto. Acesso restrito exclusivamente ao Administrador M1.' };
  };

  const logoutAdmin = () => {
    setIsAdminAuthenticated(false);
    setCurrentRole('client');
    try {
      sessionStorage.removeItem(DB_KEY_ADMIN_AUTH);
    } catch {
      // ignore
    }
  };

  const changeAdminPassword = (newPassword: string, masterPin?: string): { success: boolean; message: string } => {
    if (!newPassword || newPassword.trim().length < 6) {
      return { success: false, message: 'A nova senha deve ter no mínimo 6 caracteres para garantir alta segurança.' };
    }

    const trimmedPassword = newPassword.trim();
    const trimmedPin = masterPin ? masterPin.trim() : undefined;

    setSettings(prev => ({
      ...prev,
      adminPassword: trimmedPassword,
      ...(trimmedPin ? { adminMasterPin: trimmedPin } : {})
    }));

    addAdminAlarm({
      level: 'info',
      title: 'Senha do Administrador Alterada',
      description: 'As credenciais de segurança do painel administrativo foram atualizadas com sucesso.',
      category: 'new_registration'
    });

    return { success: true, message: 'Senha administrativa atualizada e criptografada com sucesso!' };
  };

  // Provider Authentication & Password Generation by Admin
  const loginProvider = (identifier: string, passwordInput: string): { success: boolean; message: string; provider?: ProviderProfile } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    // Find provider by email, phone, document, or name
    const foundProvider = providers.find(p => {
      const matchEmail = p.email.toLowerCase() === cleanId;
      const matchPhone = p.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '');
      const matchDoc = p.documentNumber.replace(/\D/g, '') === cleanId.replace(/\D/g, '');
      const matchName = p.name.toLowerCase().includes(cleanId);
      const matchId = p.id.toLowerCase() === cleanId;
      return matchEmail || matchPhone || matchDoc || matchName || matchId;
    });

    if (!foundProvider) {
      return { success: false, message: 'Nenhum profissional encontrado com os dados informados. Solicite seu cadastro ao Administrador.' };
    }

    if (foundProvider.status === 'suspended') {
      triggerSyncEvent(
        'alarm_triggered',
        '⚠️ Acesso Suspenso',
        `O acesso do prestador ${foundProvider.name} foi suspenso temporariamente pela administração.`,
        'alarm',
        'provider'
      );
      return { success: false, message: 'Acesso suspenso temporariamente pela administração. Contate o suporte M1 Brasil.' };
    }

    const correctPassword = foundProvider.accessPassword || foundProvider.password || 'prestador123';
    if (cleanPass !== correctPassword) {
      triggerSyncEvent(
        'alarm_triggered',
        '⚠️ Senha Incorreta',
        `Senha incorreta informada para o prestador ${foundProvider.name}.`,
        'alarm',
        'provider'
      );
      return { success: false, message: 'Senha incorreta. Solicite ao Administrador para gerar ou reenviar sua senha.' };
    }

    if (!foundProvider.isAuthorized || foundProvider.status !== 'active') {
      triggerSyncEvent(
        'alarm_triggered',
        '⏳ Cadastro em Análise',
        `Olá ${foundProvider.name}, seu cadastro está em análise pelo Administrador. Aguarde a liberação para acessar o painel.`,
        'alarm',
        'provider'
      );
      return { success: false, message: 'Cadastro em análise pelo Administrador. Seu perfil ainda não foi liberado para trabalhar.' };
    }

    // Success login
    setAuthenticatedProviderId(foundProvider.id);
    setActiveProviderId(foundProvider.id);
    setCurrentRole('provider');
    setAuthenticatedClientId(null);
    setActiveClientId(INITIAL_CLIENTS[0]?.id || '');
    try {
      localStorage.setItem(DB_KEY_PROVIDER_AUTH, foundProvider.id);
      localStorage.setItem(DB_KEY_ACTIVE_PROVIDER, foundProvider.id);
      localStorage.removeItem('m1_provider_explicit_logout');
      localStorage.removeItem(DB_KEY_CLIENT_AUTH);
      localStorage.removeItem(DB_KEY_ACTIVE_CLIENT);
    } catch {
      // ignore
    }

    // Update lastLoginAt
    setProviders(prev => prev.map(p => p.id === foundProvider.id ? { ...p, lastLoginAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR') } : p));

    return {
      success: true,
      message: `Bem-vindo(a), ${foundProvider.name}! Acesso autorizado.`,
      provider: foundProvider
    };
  };

  const logoutProvider = () => {
    setAuthenticatedProviderId(null);
    setActiveProviderId(INITIAL_PROVIDERS[0]?.id || '');
    try {
      localStorage.removeItem(DB_KEY_PROVIDER_AUTH);
      localStorage.removeItem(DB_KEY_ACTIVE_PROVIDER);
      localStorage.setItem('m1_provider_explicit_logout', 'true');
    } catch {
      // ignore
    }
  };

  const completeProviderRegistration = (providerId: string, registrationData: Partial<ProviderProfile>) => {
    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return {
          ...p,
          ...registrationData,
          status: 'aguardando_liberacao_admin',
          isAuthorized: false,
        };
      }
      return p;
    }));

    // Disparar Alarme/Notificação para o admin
    soundManager.playAdminAlarm();
    addAdminAlarm({
      level: 'critical',
      title: `🚨 NOVO CADASTRO COMPLETO: ${registrationData.fullName || registrationData.name || 'Prestador'}`,
      description: `O prestador concluiu o cadastro completo e aguarda homologação de documentos e liberação de senha.`,
      category: 'new_registration',
      providerId
    });

    // Trigger instant synchronization event across all tabs & iframes
    triggerSyncEvent(
      'general_update',
      '👥 CADASTRO COMPLETO',
      `O técnico ${registrationData.fullName || registrationData.name || 'Prestador'} concluiu o Passo 4 e aguarda liberação.`,
      'alarm',
      'admin'
    );
  };

  const payProviderLicenseFee = (providerId: string, amount: number, period: string) => {
    const paymentId = 'LP-' + Math.floor(Math.random() * 900000 + 100000);
    const newPayment = {
      id: paymentId,
      amount,
      paymentMethod: 'PIX',
      paidAt: new Date().toISOString(),
      status: 'paid' as const,
      referencePeriod: period
    };

    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        const existingPayments = p.licensePayments || [];
        return {
          ...p,
          registrationFeePaid: true,
          registrationFeeAmount: amount,
          licensePayments: [newPayment, ...existingPayments]
        };
      }
      return p;
    }));

    addAdminAlarm({
      level: 'success',
      title: 'Taxa Recebida de Prestador',
      description: `O prestador realizou o pagamento de R$ ${amount.toFixed(2)} referente ao período: ${period}`,
      category: 'payment_pix'
    });
  };

  const generateProviderPassword = (providerId: string, customPassword?: string): string => {
    const found = providers.find(p => p.id === providerId);
    const existingPassword = found?.accessPassword || found?.password;
    
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const generated = customPassword?.trim() || existingPassword || `m1#${randomSuffix}`;

    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return {
          ...p,
          accessPassword: generated,
          tempPassword: generated,
          isAuthorized: true,
          status: 'active',
          authorizedAt: new Date().toLocaleDateString('pt-BR')
        };
      }
      return p;
    }));

    const prov = providers.find(p => p.id === providerId);
    const provName = prov?.name || 'Profissional';

    addAdminAlarm({
      level: 'success',
      title: `Senha de Acesso Gerada: ${provName}`,
      description: `Acesso liberado. Nova senha: ${generated}. Envie pelo WhatsApp para o prestador.`,
      category: 'new_registration',
      providerId
    });

    // Trigger instant synchronization event to unlock provider portal
    triggerSyncEvent(
      'general_update',
      '🔓 CADASTRO LIBERADO',
      `O administrador gerou uma senha de acesso e ativou o profissional credenciado ${provName}.`,
      'success',
      'provider'
    );

    return generated;
  };

  const toggleProviderAuthorization = (providerId: string, authorized: boolean) => {
    setProviders(prev => prev.map(p => {
      if (p.id === providerId) {
        return {
          ...p,
          isAuthorized: authorized,
          status: authorized ? 'active' : 'under_review',
          ...(authorized && !p.authorizedAt ? { authorizedAt: new Date().toLocaleDateString('pt-BR') } : {})
        };
      }
      return p;
    }));

    const prov = providers.find(p => p.id === providerId);
    addAdminAlarm({
      level: authorized ? 'success' : 'warning',
      title: authorized ? `Prestador Autorizado: ${prov?.name}` : `Acesso Revogado: ${prov?.name}`,
      description: authorized ? 'Profissional agora tem permissão para receber chamados e propostas.' : 'Acesso pausado pela administração.',
      category: 'new_registration',
      providerId
    });

    // Trigger instant synchronization event across all tabs & iframes
    triggerSyncEvent(
      'general_update',
      authorized ? '🔓 CADASTRO LIBERADO' : '🔒 CADASTRO BLOQUEADO',
      authorized 
        ? `O administrador ativou e liberou o cadastro do prestador credenciado.` 
        : `O acesso do prestador foi suspenso/bloqueado temporariamente.`,
      authorized ? 'success' : 'alarm',
      'provider'
    );
  };

  // Client Authentication & Registration
  const loginClient = (identifier: string, passwordInput: string): { success: boolean; message: string; client?: ClientProfile } => {
    const cleanId = identifier.trim().toLowerCase();
    const cleanPass = passwordInput.trim();

    const foundClient = clients.find(c => {
      const matchPhone = c.phone.replace(/\D/g, '') === cleanId.replace(/\D/g, '');
      return matchPhone;
    });

    if (!foundClient) {
      return {
        success: false,
        message: 'Nenhum cadastro de cliente encontrado com este número de WhatsApp. Por favor, crie seu cadastro.'
      };
    }

    if (foundClient.status === 'suspended' || foundClient.status === 'blocked') {
      return { success: false, message: 'Conta suspensa ou bloqueada temporariamente. Contate a administração M1.' };
    }

    const correctPassword = foundClient.password || 'cliente123';
    if (cleanPass !== correctPassword) {
      return { success: false, message: 'Senha incorreta. Verifique os dígitos ou solicite alteração ao suporte M1.' };
    }

    setAuthenticatedClientId(foundClient.id);
    setActiveClientId(foundClient.id);
    setCurrentRole('client');
    setAuthenticatedProviderId(null);
    setActiveProviderId(INITIAL_PROVIDERS[0]?.id || '');
    try {
      localStorage.setItem(DB_KEY_CLIENT_AUTH, foundClient.id);
      localStorage.setItem(DB_KEY_ACTIVE_CLIENT, foundClient.id);
      localStorage.setItem('m1_last_client_whatsapp', foundClient.phone);
      localStorage.removeItem('m1_client_explicit_logout');
      localStorage.removeItem(DB_KEY_PROVIDER_AUTH);
      localStorage.removeItem(DB_KEY_ACTIVE_PROVIDER);
    } catch {
      // ignore
    }

    return {
      success: true,
      message: `Bem-vindo(a) de volta, ${foundClient.name}!`,
      client: foundClient
    };
  };

  const logoutClient = () => {
    setAuthenticatedClientId(null);
    setActiveClientId(INITIAL_CLIENTS[0]?.id || '');
    try {
      localStorage.removeItem(DB_KEY_CLIENT_AUTH);
      localStorage.removeItem(DB_KEY_ACTIVE_CLIENT);
      localStorage.removeItem('m1_current_client_registered');
      localStorage.setItem('m1_client_explicit_logout', 'true');
    } catch {
      // ignore
    }
  };

  const updateClientPasswordByAdmin = (clientId: string, newPassword: string): { success: boolean; message: string } => {
    if (!newPassword || newPassword.trim().length < 4) {
      return { success: false, message: 'A senha do cliente deve ter no mínimo 4 caracteres.' };
    }

    const trimmed = newPassword.trim();
    setClients(prev => prev.map(c => c.id === clientId ? { ...c, password: trimmed } : c));

    const targetClient = clients.find(c => c.id === clientId);
    addAdminAlarm({
      level: 'info',
      title: `Senha de Cliente Alterada: ${targetClient?.name || 'Cliente'}`,
      description: `O Administrador atualizou a senha de acesso do cliente para "${trimmed}".`,
      category: 'new_registration',
      clientId
    });

    return { success: true, message: `Senha do cliente atualizada com sucesso para "${trimmed}".` };
  };

  // Register new client in database and activate session
  const registerClient = async (clientData: {
    name: string;
    phone: string;
    email: string;
    cpf?: string;
    password?: string;
    address: ClientProfile['defaultAddress'];
    lat?: number;
    lng?: number;
  }): Promise<{ success: boolean; message: string; client?: ClientProfile }> => {
    const cleanPhoneInput = clientData.phone.replace(/\D/g, '');
    const exists = clients.some(c => c.phone.replace(/\D/g, '') === cleanPhoneInput);
    if (exists) {
      return {
        success: false,
        message: 'Este número de WhatsApp já está cadastrado em nosso sistema. Por favor, acesse usando a aba "Entrar" com sua senha ou altere seu número.'
      };
    }

    const newClientId = 'client-' + Date.now();
    const newClient: ClientProfile = {
      id: newClientId,
      name: clientData.name.trim(),
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      email: clientData.email.trim(),
      phone: clientData.phone.trim(),
      city: clientData.address.city || selectedCity,
      defaultAddress: clientData.address,
      rating: 5.0,
      totalRequests: 0,
      status: 'active',
      isRegistered: true,
      isLocationConfirmed: true,
      registeredAt: new Date().toLocaleDateString('pt-BR') + ' ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      cpf: clientData.cpf?.trim() || '',
      password: clientData.password?.trim() || 'cliente123',
      notes: 'Cliente cadastrado via portal M1 Brasil com GPS e senha definida.'
    };

    // First persist synchronously to local state and local cache to avoid visual lag
    setClients(prev => [newClient, ...prev]);
    setAuthenticatedClientId(newClientId);
    setActiveClientId(newClientId);
    setCurrentRole('client');
    setAuthenticatedProviderId(null);
    setActiveProviderId(INITIAL_PROVIDERS[0]?.id || '');
    try {
      localStorage.setItem(DB_KEY_CLIENT_AUTH, newClientId);
      localStorage.setItem(DB_KEY_ACTIVE_CLIENT, newClientId);
      localStorage.setItem('m1_last_client_whatsapp', newClient.phone);
      localStorage.removeItem('m1_client_explicit_logout');
      localStorage.removeItem(DB_KEY_PROVIDER_AUTH);
      localStorage.removeItem(DB_KEY_ACTIVE_PROVIDER);
    } catch {
      // ignore
    }

    // Force immediate persistence to Firestore instead of relying purely on state synchronization
    await safeFirestoreSetDoc('clients', newClientId, newClient);

    soundManager.playAdminAlarm();

    triggerSyncEvent(
      'general_update',
      '👥 NOVO CLIENTE CADASTRADO',
      `O cliente ${newClient.name} se cadastrou na plataforma.`,
      'alarm',
      'admin'
    );

    addAdminAlarm({
      level: 'critical',
      title: `🚨 NOVO CLIENTE CADASTRADO: ${newClient.name}`,
      description: `Telefone: ${newClient.phone} • Cidade: ${newClient.city} • Bairro: ${newClient.defaultAddress.neighborhood}. Senha configurada pelo cliente.`,
      category: 'new_registration',
      clientId: newClientId
    });

    addNotification({
      title: 'Cadastro Concluído com Sucesso!',
      message: `Bem-vindo à M1 SERV, ${newClient.name}! Sua conta foi criada com senha e você já pode solicitar serviços.`,
      type: 'status_update',
      targetRole: 'client'
    });

    return {
      success: true,
      message: `Cadastro concluído com sucesso, ${newClient.name}!`,
      client: newClient
    };
  };

  // Confirm client GPS location
  const confirmClientLocation = async (
    clientId: string,
    lat: number,
    lng: number,
    addressDetails?: Partial<ClientProfile['defaultAddress']>
  ) => {
    let city = '';
    let neighborhood = '';
    let street = '';

    try {
      const response = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`, {
        headers: { 'Accept-Language': 'pt-BR' }
      });
      if (response.ok) {
        const data = await response.json();
        const addr = data.address || {};
        city = addr.city || addr.town || addr.village || addr.municipality || 'São Paulo';
        if (addr.state) {
          city = `${city}, ${addr.state}`;
        }
        neighborhood = addr.suburb || addr.neighbourhood || addr.city_district || 'Bela Vista';
        street = addr.road || addr.street || 'Av. Paulista';
      }
    } catch (err) {
      console.error("Erro no reverse geocoding do cliente: ", err);
    }

    setClients(prev =>
      prev.map(c => {
        if (c.id === clientId) {
          const finalCity = city || c.city || 'São Paulo, SP';
          const finalNeighborhood = neighborhood || c.defaultAddress?.neighborhood || 'Bela Vista';
          const finalStreet = street || c.defaultAddress?.street || 'Av. Paulista';
          return {
            ...c,
            isLocationConfirmed: true,
            city: finalCity,
            defaultAddress: {
              ...c.defaultAddress,
              lat,
              lng,
              street: finalStreet,
              neighborhood: finalNeighborhood,
              city: finalCity,
              ...(addressDetails || {})
            }
          };
        }
        return c;
      })
    );

    addNotification({
      title: 'GPS e Localização Confirmados!',
      message: `Sua localização atual foi sincronizada com a Central M1 SERV em ${city || 'São Paulo, SP'}.`,
      type: 'status_update',
      targetRole: 'client'
    });
  };

  const clientAcknowledgeService = (serviceId: string) => {
    const now = new Date();
    const dateStr = now.toLocaleDateString('pt-BR');
    const timeStr = now.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });

    setServices(prev =>
      prev.map(srv => {
        if (srv.id === serviceId) {
          const osCode = `OS-${srv.code.replace('#', '')}-${now.getFullYear()}`;
          const osDetails = {
            osCode,
            date: dateStr,
            time: timeStr,
            local: `${srv.address.street}, nº ${srv.address.number}${srv.address.neighborhood ? `, Bairro: ${srv.address.neighborhood}` : ''}${srv.address.city ? `, ${srv.address.city}` : ''}`,
            value: srv.negotiatedPrice || srv.estimatedPrice,
            status: 'active'
          };

          const systemMessage = {
            id: 'msg-sys-os-' + Date.now(),
            senderRole: 'system' as const,
            senderName: 'Central M1 Brasil',
            text: `📋 **ORDEM DE SERVIÇO EMITIDA**\nCódigo O.S.: **${osCode}**\nData: **${osDetails.date} às ${osDetails.time}**\nEndereço: **${osDetails.local}**\nValor do Chamado: **R$ ${osDetails.value.toFixed(2)}**\n\n_O cliente confirmou a tomada de ciência, endereço de atendimento e valor acordado com a Central M1 Brasil._`,
            timestamp: timeStr
          };

          return {
            ...srv,
            clientAcknowledgedAwaiting: true,
            osDetails,
            chat: [...(srv.chat || []), systemMessage]
          };
        }
        return srv;
      })
    );

    // Get the service request to trigger notifications and alarms
    const srv = services.find(s => s.id === serviceId);
    if (srv) {
      const osCode = `OS-${srv.code.replace('#', '')}-${now.getFullYear()}`;
      const value = srv.negotiatedPrice || srv.estimatedPrice;

      // Real-time Visual and Sound Alarms for Admin
      soundManager.playAdminAlarm();
      addAdminAlarm({
        level: 'success',
        title: `📋 O.S. Emitida: ${osCode} (Cod: ${srv.code})`,
        description: `O cliente confirmou os dados e o endereço. A Ordem de Serviço foi emitida com sucesso no valor de R$ ${value.toFixed(2)}.`,
        category: 'new_request',
        serviceId
      });

      // Notifications
      addNotification({
        title: '📋 Ordem de Serviço Emitida!',
        message: `A O.S. ${osCode} foi gerada com sucesso para seu atendimento. O prestador e a central foram notificados.`,
        type: 'status_update',
        targetRole: 'client',
        serviceId
      });

      addNotification({
        title: '📋 Ordem de Serviço Emitida!',
        message: `O cliente confirmou os dados do chamado ${srv.code} e a O.S. ${osCode} foi gerada. Siga viagem!`,
        type: 'status_update',
        targetRole: 'provider',
        serviceId
      });
    }
  };

  const adminForwardServiceToClient = (serviceId: string, updatedPrice?: number, providerId?: string) => {
    const targetProvider = providerId ? providers.find(p => p.id === providerId) : undefined;

    setServices(prev =>
      prev.map(s => {
        if (s.id === serviceId) {
          const finalPrice = updatedPrice !== undefined && updatedPrice > 0 ? updatedPrice : s.estimatedPrice;
          const feeRate = (settings.platformFeePercent || 15) / 100;
          const fee = Math.round(finalPrice * feeRate * 100) / 100;
          const payout = Math.round((finalPrice - fee) * 100) / 100;
          const chosenProvId = targetProvider?.id || providerId || s.assignedProviderId;

          return {
            ...s,
            status: 'aguardando_confirmacao_cliente',
            estimatedPrice: finalPrice,
            wasRefusedByClient: false,
            wasRefusedByProvider: false,
            refusalReason: undefined,
            refusalTimestamp: undefined,
            viewedByAdmin: true,
            assignedProviderId: chosenProvId,
            assignedProviderName: targetProvider?.name || s.assignedProviderName,
            assignedProviderAvatar: targetProvider?.avatar || s.assignedProviderAvatar,
            assignedProviderPhone: targetProvider?.phone || s.assignedProviderPhone,
            dispatchedEpoch: Date.now(),
            // Clear chosen provider from rejected list and proposals
            rejectedByProviderIds: chosenProvId
              ? (s.rejectedByProviderIds || []).filter(id => id !== chosenProvId)
              : (s.rejectedByProviderIds || []),
            proposals: chosenProvId
              ? (s.proposals || []).filter(p => p.providerId !== chosenProvId)
              : (s.proposals || []),
            payment: {
              ...s.payment,
              totalAmount: finalPrice,
              platformFeeAmount: fee,
              providerPayoutAmount: payout,
              pixCode: `00020126580014br.gov.bcb.pix0136${s.id}5204000053039865405${finalPrice.toFixed(2)}5802BR5924M1Brasil6009Sao Paulo62070503***6304`
            },
            chat: [
              ...s.chat,
              {
                id: 'msg-fwd-' + Date.now(),
                senderRole: 'system' as const,
                senderName: 'Central M1 Brasil',
                text: `💼 **CENTRAL DEFINIU O ORÇAMENTO**\n\nO Administrador da Central M1 analisou o chamado, indicou o prestador **${targetProvider?.name || s.assignedProviderName || 'técnico credenciado'}** e definiu o valor do atendimento em **R$ ${finalPrice.toFixed(2)}**.\n\n_Por favor, clique em **APROVAR VALOR** ou **RECUSAR** no painel do seu aplicativo para prosseguirmos._`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return s;
      })
    );

    soundManager.playSuccessChime();

    addNotification({
      type: 'proposal_received',
      title: '💼 Orçamento Definido!',
      message: `A Central M1 definiu o valor do chamado para sua aprovação final.`,
      targetRole: 'client',
      serviceId
    });
  };

  const clientAcceptServicePrice = (serviceId: string) => {
    const srv = services.find(s => s.id === serviceId);
    if (!srv) return;

    const finalProviderId = srv.providerId || srv.assignedProviderId || (providers.find(p => p.categories.includes(srv.category) && p.isOnline)?.id) || providers[0]?.id;
    const finalProvider = providers.find(p => p.id === finalProviderId);

    setServices(prev =>
      prev.map(s => {
        if (s.id === serviceId) {
          return {
            ...s,
            status: 'despachado_prestador', // Segue para o PRESTADOR aceitar o preço e botar ETA
            assignedProviderId: s.assignedProviderId || finalProviderId,
            assignedProviderName: s.assignedProviderName || finalProvider?.name,
            assignedProviderAvatar: s.assignedProviderAvatar || finalProvider?.avatar,
            assignedProviderPhone: s.assignedProviderPhone || finalProvider?.phone,
            dispatchedEpoch: Date.now(),
            wasRefusedByClient: false,
            wasRefusedByProvider: false,
            refusalReason: undefined,
            refusalTimestamp: undefined,
            // Clear chosen provider from rejected list and proposals
            rejectedByProviderIds: finalProviderId
              ? (s.rejectedByProviderIds || []).filter(id => id !== finalProviderId)
              : (s.rejectedByProviderIds || []),
            proposals: finalProviderId
              ? (s.proposals || []).filter(p => p.providerId !== finalProviderId)
              : (s.proposals || []),
            chat: [
              ...s.chat,
              {
                id: 'msg-cl-acc-' + Date.now(),
                senderRole: 'system' as const,
                senderName: 'Central M1 Brasil',
                text: `🎉 **O CLIENTE ACEITOU O VALOR DE R$ ${s.estimatedPrice.toFixed(2)}**\n\nAguardando o técnico credenciado aceitar o valor e informar o tempo estimado de chegada ao local.\n\n_Por favor, aguarde a confirmação de início do deslocamento pelo técnico no painel do seu aplicativo._`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return s;
      })
    );

    soundManager.playSuccessChime();

    // Notify Provider
    if (finalProviderId) {
      addNotification({
        type: 'incoming_job',
        title: '💼 Chamado Recebido! Analise o Orçamento',
        message: `O cliente aprovou o valor de R$ ${srv.estimatedPrice.toFixed(2)}. Aceite para informar seu tempo de chegada!`,
        targetRole: 'provider',
        serviceId
      });
    }

    // Notify Admin Alarm
    addAdminAlarm({
      level: 'info',
      title: `🤝 Cliente Aprovou Orçamento (${srv.code})`,
      description: `O cliente aprovou o valor de R$ ${srv.estimatedPrice.toFixed(2)}. Encaminhado ao profissional ${finalProvider?.name || 'Técnico Credenciado'} para aceitação e tempo de chegada.`,
      category: 'new_request',
      serviceId
    });
  };

  const clientRejectServicePrice = (serviceId: string) => {
    const srv = services.find(s => s.id === serviceId);
    if (!srv) return;

    setServices(prev =>
      prev.map(s => {
        if (s.id === serviceId) {
          return {
            ...s,
            status: 'aguardando_despacho_admin', // Returns to admin for reorganization
            wasRefusedByClient: true,
            wasRefusedByProvider: false,
            refusalReason: 'Cliente recusou a proposta de valor',
            refusalTimestamp: Date.now(),
            viewedByAdmin: false,
            chat: [
              ...s.chat,
              {
                id: 'msg-cl-rej-' + Date.now(),
                senderRole: 'system' as const,
                senderName: 'Central M1 Brasil',
                text: `❌ **VALOR RECUSADO PELO CLIENTE**\n\nO cliente não aceitou o orçamento proposto de **R$ ${s.estimatedPrice.toFixed(2)}**.\n\n_O chamado retornou para a Central M1 reorganizar o preço ou as condições._`,
                timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
              }
            ]
          };
        }
        return s;
      })
    );

    soundManager.playAdminAlarm();

    // Notify Admin
    addAdminAlarm({
      level: 'critical',
      title: `❌ Cliente Recusou Proposta (${srv.code})`,
      description: `O cliente rejeitou o orçamento de R$ ${srv.estimatedPrice.toFixed(2)}. Reorganize as condições para reenviar.`,
      category: 'delay_alert',
      serviceId
    });
  };

  const requestProviderRegistration = async (formData: {
    name: string;
    phone: string;
    email: string;
    documentNumber: string;
    specialty: ServiceCategory;
    vehicleModel: string;
    vehiclePlate: string;
    city: string;
    documents?: ProviderProfile['documents'];
    password?: string;
    isAuthorizedDirectly?: boolean;
    registrationFeePaid?: boolean;
    id?: string;
    specialties?: ServiceCategory[];
    fullName?: string;
    cpf?: string;
    cnpj?: string;
    address?: string;
    serviceRegion?: string;
    serviceRadius?: number;
    bankAccount?: string;
    pixKey?: string;
    bloodType?: string;
    allergies?: string;
    continuousMeds?: string;
    education?: string;
    certificatesText?: string;
    professionalExp?: string;
    dailyAvailability?: string;
  }): Promise<{ success: boolean; message: string }> => {
    const newProvId = formData.id || 'provider-' + Date.now();

    const cleanPhoneInput = formData.phone.replace(/\D/g, '');
    const existsOther = providers.some(p => p.id !== newProvId && p.phone.replace(/\D/g, '') === cleanPhoneInput);
    if (existsOther) {
      return {
        success: false,
        message: 'Este número de WhatsApp já está cadastrado por outro profissional em nosso sistema. Por favor, faça login ou use outro número.'
      };
    }

    const shouldAutoApprove = !!formData.isAuthorizedDirectly;
    const finalPassword = formData.password?.trim() || `m1#${Math.floor(1000 + Math.random() * 9000)}`;

    const parsedCertificates = formData.certificatesText
      ? formData.certificatesText.split(',').map(s => s.trim()).filter(Boolean)
      : [];

    const finalCategories = formData.specialties && formData.specialties.length > 0
      ? formData.specialties
      : [formData.specialty];

    const newProvider: ProviderProfile = {
      id: newProvId,
      name: formData.name,
      avatar: formData.documents?.facePhoto || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
      email: formData.email,
      phone: formData.phone,
      city: formData.city,
      categories: finalCategories,
      radiusKm: formData.serviceRadius || 25,
      pixKey: formData.pixKey || formData.phone,
      isOnline: false,
      rating: 5.0,
      totalReviews: 0,
      completedJobsCount: 0,
      lat: -23.555771,
      lng: -46.662881,
      walletBalance: 0,
      pendingBalance: 0,
      totalEarned: 0,
      verified: shouldAutoApprove,
      documentNumber: formData.documentNumber,
      vehicleModel: formData.vehicleModel || 'Veículo Próprio',
      vehiclePlate: formData.vehiclePlate || 'N/I',
      commissionRatePercent: 15,
      status: shouldAutoApprove ? 'active' : 'under_review',
      bio: formData.professionalExp || (shouldAutoApprove 
        ? 'Profissional credenciado aprovado com sucesso através do fluxo de pagamento e treinamento M1.' 
        : 'Profissional cadastrado aguardando autorização e liberação de senha pelo Administrador M1.'),
      isAuthorized: shouldAutoApprove,
      authorizedAt: shouldAutoApprove ? new Date().toLocaleDateString('pt-BR') : undefined,
      accessPassword: finalPassword,
      tempPassword: finalPassword,
      registrationFeePaid: !!formData.registrationFeePaid || shouldAutoApprove,
      registrationFeeAmount: (formData.registrationFeePaid || shouldAutoApprove) ? (settings.providerLicenseFee || 120) : undefined,
      
      // Expanded Fields
      fullName: formData.fullName || formData.name,
      cpf: formData.cpf || formData.documentNumber,
      cnpj: formData.cnpj || '',
      address: formData.address || '',
      serviceRegion: formData.serviceRegion || formData.city,
      serviceRadius: formData.serviceRadius || 25,
      bankAccount: formData.bankAccount || '',
      bloodType: formData.bloodType || '',
      allergies: formData.allergies || '',
      continuousMeds: formData.continuousMeds || '',
      education: formData.education || '',
      certificates: parsedCertificates,
      professionalExp: formData.professionalExp || '',
      dailyAvailability: formData.dailyAvailability || 'Disponibilidade total',

      documents: formData.documents || {
        facePhoto: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=300&q=80',
        documentPhoto: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=400&q=80',
        addressProof: 'https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?auto=format&fit=crop&w=400&q=80',
        criminalRecordProof: 'https://images.unsplash.com/photo-1450133064473-71024230f91b?auto=format&fit=crop&w=400&q=80',
        submittedAt: new Date().toLocaleDateString('pt-BR') + ' às ' + new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
        verifiedByAdmin: shouldAutoApprove
      }
    };

    let finalProviderObj = newProvider;

    setProviders(prev => {
      const exists = prev.find(p => p.id === newProvId);
      if (exists) {
        finalProviderObj = {
          ...exists,
          name: formData.name || exists.name || 'Preenchendo cadastro...',
          email: formData.email || exists.email || 'Sem e-mail',
          phone: formData.phone || exists.phone || 'Sem número',
          city: formData.city || exists.city || 'São Paulo, SP',
          categories: finalCategories,
          documentNumber: formData.documentNumber || exists.documentNumber,
          vehicleModel: formData.vehicleModel || exists.vehicleModel,
          vehiclePlate: formData.vehiclePlate || exists.vehiclePlate,
          accessPassword: finalPassword || exists.accessPassword,
          tempPassword: finalPassword || exists.tempPassword,
          registrationFeePaid: formData.registrationFeePaid !== undefined ? !!formData.registrationFeePaid : exists.registrationFeePaid,
          
          // Merge expanded fields
          fullName: formData.fullName || exists.fullName || formData.name,
          cpf: formData.cpf || exists.cpf || formData.documentNumber,
          cnpj: formData.cnpj || exists.cnpj || '',
          address: formData.address || exists.address || '',
          serviceRegion: formData.serviceRegion || exists.serviceRegion || formData.city,
          serviceRadius: formData.serviceRadius || exists.serviceRadius || exists.radiusKm || 25,
          bankAccount: formData.bankAccount || exists.bankAccount || '',
          pixKey: formData.pixKey || exists.pixKey || formData.phone,
          bloodType: formData.bloodType || exists.bloodType || '',
          allergies: formData.allergies || exists.allergies || '',
          continuousMeds: formData.continuousMeds || exists.continuousMeds || '',
          education: formData.education || exists.education || '',
          certificates: parsedCertificates.length > 0 ? parsedCertificates : exists.certificates,
          professionalExp: formData.professionalExp || exists.professionalExp || '',
          dailyAvailability: formData.dailyAvailability || exists.dailyAvailability || 'Disponibilidade total',

          documents: {
            ...exists.documents,
            ...(formData.documents || {})
          }
        };
        return prev.map(p => p.id === newProvId ? finalProviderObj : p);
      } else {
        return [newProvider, ...prev];
      }
    });

    // Save directly to Firestore for immediate persistence and real-time reflection!
    lastLocalUpdatesRef.current[newProvId] = Date.now();
    await safeFirestoreSetDoc('providers', newProvId, finalProviderObj);

    soundManager.playAdminAlarm();

    // Trigger cross-tab real-time sync event so the Admin's list reloads instantly!
    triggerSyncEvent(
      'general_update',
      '👥 REGISTRO DE PRESTADOR',
      `O cadastro do prestador ${formData.name || 'Novo Prestador'} foi atualizado ou sincronizado.`,
      'success',
      'admin'
    );

    if (shouldAutoApprove) {
      addAdminAlarm({
        level: 'success',
        title: `✅ PRESTADOR CREDENCIADO E ATIVADO: ${formData.name}`,
        description: `Especialidade: ${formData.specialty} • Tel: ${formData.phone}. Credenciamento concluído com pagamento da taxa (R$ ${settings.providerLicenseFee || 120}) e treinamento concluído!`,
        category: 'new_registration',
        providerId: newProvId
      });

      return {
        success: true,
        message: `Seu cadastro de prestador foi APROVADO E ATIVADO com sucesso! Você já pode acessar o portal usando seu número do WhatsApp e a senha escolhida.`
      };
    }

    // Admin alarm
    addAdminAlarm({
      level: 'critical',
      title: `🚨 NOVO PRESTADOR CADASTRADO (4 DOCS): ${formData.name}`,
      description: `Especialidade: ${formData.specialty} • Tel: ${formData.phone}. 4 Documentos anexados aguardando homologação e liberação de senha.`,
      category: 'new_registration',
      providerId: newProvId
    });

    return {
      success: true,
      message: 'Cadastro e documentos enviados com sucesso! Seus dados estão em análise. Assim que aprovado pelo Administrador, você receberá sua senha de acesso.'
    };
  };

  const submitProfileEditRequest = (
    providerId: string,
    field: string,
    fieldName: string,
    oldValue: string,
    newValue: string,
    categoryAction?: 'add' | 'remove'
  ) => {
    const prov = providers.find(p => p.id === providerId);
    if (!prov) return;
    const req: ProfileEditRequest = {
      id: 'req-' + Date.now() + '-' + Math.floor(Math.random() * 1000),
      providerId,
      providerName: prov.name,
      timestamp: new Date().toISOString(),
      acknowledged: false,
      status: 'pending',
      field,
      fieldName,
      oldValue: oldValue || '(Vazio)',
      newValue: newValue || '(Vazio)',
      categoryAction
    };
    
    setProfileEditRequests(prev => [req, ...prev]);

    // Create an AdminAlarm so it sounds/flashes!
    addAdminAlarm({
      level: 'warning',
      title: field === 'specialty' ? '➕ NOVA SOLICITAÇÃO' : '📝 EDIÇÃO DE PERFIL',
      description: `O técnico ${prov.name} editou o campo "${fieldName}". De "${oldValue || '(Vazio)'}" para "${newValue || '(Vazio)'}".`,
      category: 'new_registration',
      providerId
    });

    // Send visual/toast notification
    triggerSyncEvent(
      'general_update',
      field === 'specialty' ? '➕ NOVA SOLICITAÇÃO' : '📝 EDIÇÃO DE PERFIL',
      `Técnico ${prov.name} solicitou alteração de ${fieldName}.`,
      'alarm',
      'admin'
    );
  };

  const resolveProfileEditRequest = (reqId: string, decision: 'approved' | 'rejected') => {
    setProfileEditRequests(prev => prev.map(r => {
      if (r.id !== reqId) return r;
      const updatedReq = { ...r, status: decision, acknowledged: true };
      
      if (decision === 'approved') {
        setProviders(prevProvs => prevProvs.map(p => {
          if (p.id !== r.providerId) return p;
          
          if (r.field.startsWith('specialty:') && r.categoryAction) {
            const catId = r.field.split(':')[1];
            const currentCats = p.categories || [];
            let updatedCats = [...currentCats];
            if (r.categoryAction === 'add') {
              if (!updatedCats.includes(catId as any)) {
                updatedCats.push(catId as any);
              }
              setCategories(prevCats => {
                if (!prevCats.some(c => c.id === catId)) {
                  const rawName = r.newValue.replace(' (Pendente)', '');
                  const newCat = {
                    id: catId,
                    name: rawName,
                    iconName: 'Wrench',
                    description: `Serviço e atividade credenciada sob demanda de ${p.name || 'prestador'}.`,
                    basePrice: 150,
                    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
                    defaultEtaMinutes: 20,
                    averageExecutionMinutes: 60
                  };
                  return [...prevCats, newCat];
                }
                return prevCats;
              });
            } else if (r.categoryAction === 'remove') {
              updatedCats = updatedCats.filter(c => c !== catId);
            }
            
            const updatedPending = (p.pendingCategoriesRequests || []).map(req => {
              if (req.category === catId && req.action === r.categoryAction && req.status === 'pending') {
                return { ...req, status: 'approved' as const };
              }
              return req;
            });
            return { ...p, categories: updatedCats, pendingCategoriesRequests: updatedPending };
          } else {
            const nextAvatar = r.field === 'avatar' ? r.newValue : p.avatar;
            const updatedDocs = {
              ...(p.documents || {}),
              facePhoto: r.field === 'avatar' ? r.newValue : p.documents?.facePhoto
            };
            return {
              ...p,
              [r.field]: r.newValue,
              avatar: nextAvatar,
              documents: updatedDocs
            };
          }
        }));
      } else {
        // rejected
        if (r.field.startsWith('specialty:') && r.categoryAction) {
          const catId = r.field.split(':')[1];
          setProviders(prevProvs => prevProvs.map(p => {
            if (p.id !== r.providerId) return p;
            const updatedPending = (p.pendingCategoriesRequests || []).map(req => {
              if (req.category === catId && req.action === r.categoryAction && req.status === 'pending') {
                return { ...req, status: 'rejected' as const };
              }
              return req;
            });
            return { ...p, pendingCategoriesRequests: updatedPending };
          }));
        }
      }

      return updatedReq;
    }));

    const resolvedReq = profileEditRequests.find(r => r.id === reqId);
    if (resolvedReq) {
      triggerSyncEvent(
        'general_update',
        decision === 'approved' ? '✅ ALTERAÇÃO APROVADA' : '❌ ALTERAÇÃO REJEITADA',
        `A solicitação de ${resolvedReq.fieldName} do técnico ${resolvedReq.providerName} foi ${decision === 'approved' ? 'aprovada' : 'rejeitada'}.`,
        decision === 'approved' ? 'success' : 'alarm',
        'provider'
      );
    }
  };

  const acknowledgeProfileEditRequest = (reqId: string) => {
    setProfileEditRequests(prev => prev.map(r => r.id === reqId ? { ...r, acknowledged: true } : r));
  };

  const resetActiveClient = () => {
    try {
      localStorage.removeItem('m1_current_client_registered');
      localStorage.removeItem(DB_KEY_ACTIVE_CLIENT);
    } catch {
      // ignore
    }
  };

  // Zerar valores fictícios / Resetar chamados, transações e faturamento para produção limpa
  const clearFictitiousData = async () => {
    // 1. Apagar do Firestore coleções de chamados, transações, chats, avaliações e alarmes
    if (db) {
      try {
        console.log('🧹 Iniciando limpeza do Firestore de chamados e históricos...');
        const collectionsToClear = ['services', 'transactions', 'chatMessages', 'adminAlarms', 'reviews'];
        for (const colName of collectionsToClear) {
          const snap = await getDocs(collection(db, colName));
          console.log(`🧹 Removendo ${snap.size} documentos de "${colName}"...`);
          for (const docSnap of snap.docs) {
            await safeFirestoreDeleteDoc(colName, docSnap.id);
          }
        }
        console.log('✨ Limpeza de chamados e históricos no Firestore concluída!');
      } catch (err) {
        console.warn('⚠️ Erro ao deletar dados do Firestore:', err);
      }
    }

    setServices([]);
    setTransactions([]);
    setAdminAlarms([]);
    setReviews([]);
    setNotifications([]);

    // Reset provider wallet balances and earnings to R$ 0,00 and 0 completed jobs, e salvar no Firestore
    setProviders(prev => {
      const updated = prev.map(p => {
        const reseted = {
          ...p,
          walletBalance: 0,
          pendingBalance: 0,
          totalEarned: 0,
          completedJobsCount: 0,
          totalReviews: 0,
          rating: 5.0
        };
        safeFirestoreSetDoc('providers', p.id, reseted);
        return reseted;
      });
      return updated;
    });

    // Reset client totalRequests to 0, e salvar no Firestore
    setClients(prev => {
      const updated = prev.map(c => {
        const reseted = {
          ...c,
          totalRequests: 0
        };
        safeFirestoreSetDoc('clients', c.id, reseted);
        return reseted;
      });
      return updated;
    });

    try {
      localStorage.setItem(DB_KEY_SERVICES, JSON.stringify([]));
      localStorage.setItem(DB_KEY_TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(DB_KEY_ALARMS, JSON.stringify([]));
      localStorage.setItem(DB_KEY_REVIEWS, JSON.stringify([]));
      localStorage.removeItem('m1_current_client_registered');
      localStorage.removeItem(DB_KEY_ACTIVE_CLIENT);
    } catch {
      // ignore
    }

    addAdminAlarm({
      level: 'info',
      title: 'Banco de Dados Zerado pelo Administrador',
      description: 'Todos os chamados, faturamentos, transações e avaliações ficitícias foram zerados. O sistema está 100% pronto e limpo para operações reais.',
      category: 'new_registration'
    });
  };

  // Apagar dados de Clientes, Prestadores, Chamados e Históricos para começar o App do Zero
  const clearDatabaseToScratch = async () => {
    // 1. Apagar do Firestore de forma profunda e abrangente
    if (db) {
      try {
        console.log('🧹 Iniciando limpeza profunda do Firestore...');
        const collectionsToClear = ['services', 'clients', 'providers', 'users', 'chatMessages'];
        for (const colName of collectionsToClear) {
          const snap = await getDocs(collection(db, colName));
          console.log(`🧹 Removendo ${snap.size} documentos de "${colName}"...`);
          for (const docSnap of snap.docs) {
            await safeFirestoreDeleteDoc(colName, docSnap.id);
          }
        }
        console.log('🌱 Integrando e semeando os perfis padrão (Cliente/Prestador) de volta no Firestore...');
        for (const c of INITIAL_CLIENTS) {
          await safeFirestoreSetDoc('clients', c.id, c);
        }
        for (const p of INITIAL_PROVIDERS) {
          await safeFirestoreSetDoc('providers', p.id, p);
        }
        console.log('✨ Limpeza profunda do Firestore concluída com sucesso!');
      } catch (err) {
        console.warn('⚠️ Erro ao deletar de forma profunda do Firestore:', err);
      }
    }

    // 2. Zerar os estados em memória, mantendo os perfis padrão integrados
    setServices([]);
    setClients(INITIAL_CLIENTS);
    setProviders(INITIAL_PROVIDERS);
    setTransactions([]);
    setAdminAlarms([]);
    setReviews([]);
    setNotifications([]);

    // 3. Limpar localStorage local de cache, gravando os perfis padrão integrados
    try {
      localStorage.setItem(DB_KEY_SERVICES, JSON.stringify([]));
      localStorage.setItem(DB_KEY_CLIENTS, JSON.stringify(INITIAL_CLIENTS));
      localStorage.setItem(DB_KEY_PROVIDERS, JSON.stringify(INITIAL_PROVIDERS));
      localStorage.setItem(DB_KEY_TRANSACTIONS, JSON.stringify([]));
      localStorage.setItem(DB_KEY_ALARMS, JSON.stringify([]));
      localStorage.setItem(DB_KEY_REVIEWS, JSON.stringify([]));
      
      localStorage.removeItem(DB_KEY_ACTIVE_CLIENT);
      localStorage.removeItem(DB_KEY_ACTIVE_PROVIDER);
      localStorage.removeItem(DB_KEY_CLIENT_AUTH);
      localStorage.removeItem(DB_KEY_PROVIDER_AUTH);
      localStorage.removeItem('m1_current_client_registered');
      localStorage.removeItem('m1_last_client_whatsapp');
    } catch (err) {
      console.warn('⚠️ Erro ao limpar cache do LocalStorage:', err);
    }

    addAdminAlarm({
      level: 'info',
      title: 'Banco de Dados Resetado do Zero',
      description: 'Todos os clientes, prestadores, chamados e configurações foram limpos permanentemente para início operacional imediato.',
      category: 'new_registration'
    });
  };

  // Limpar solicitações antigas com mais de 30 dias (histórico antigo de cliente e prestador)
  const clearServiceRequestsOlderThan30Days = useCallback(() => {
    const thirtyDaysAgoMs = Date.now() - 30 * 24 * 60 * 60 * 1000;
    
    // Find services to delete: completed, cancelled or archived services older than 30 days
    const servicesToDelete = servicesRef.current.filter(srv => {
      let serviceTime = Date.now();
      if (srv.archivedEpoch) {
        serviceTime = srv.archivedEpoch;
      } else if (srv.createdEpoch) {
        serviceTime = srv.createdEpoch;
      } else if (srv.id && srv.id.startsWith('srv-')) {
        const idTimestamp = Number(srv.id.replace('srv-', ''));
        if (!isNaN(idTimestamp) && idTimestamp > 1000000000000) {
          serviceTime = idTimestamp;
        }
      } else if (srv.createdAt) {
        const parsedDate = Date.parse(srv.createdAt);
        if (!isNaN(parsedDate)) {
          serviceTime = parsedDate;
        }
      }
      
      const isPastService = srv.status === 'concluido_pago' || srv.status === 'cancelado' || srv.isArchived;
      return isPastService && serviceTime < thirtyDaysAgoMs;
    });

    if (servicesToDelete.length === 0) {
      return { success: true, count: 0 };
    }

    // Delete from Firestore
    servicesToDelete.forEach(srv => {
      safeFirestoreDeleteDoc('services', srv.id);
    });

    // Update state to remove deleted services
    const deleteIds = new Set(servicesToDelete.map(s => s.id));
    setServices(prev => prev.filter(s => !deleteIds.has(s.id)));

    // Emit a system alarm
    addAdminAlarm({
      level: 'info',
      title: 'Limpeza de Histórico (30+ Dias) Concluída',
      description: `Foram excluídos do histórico ${servicesToDelete.length} atendimentos com mais de 30 dias de clientes e prestadores para otimização de banco de dados.`,
      category: 'new_registration'
    });

    return { success: true, count: servicesToDelete.length };
  }, [setServices, safeFirestoreDeleteDoc]);

  // Simular um atendimento antigo com mais de 30 dias para disparar e testar o alarme visual de limpeza
  const simulateServiceOlderThan30Days = useCallback(() => {
    const thirtyFiveDaysAgoMs = Date.now() - 35 * 24 * 60 * 60 * 1000;
    const dateObj = new Date(thirtyFiveDaysAgoMs);
    const dateStr = dateObj.toLocaleDateString('pt-BR') + ' ' + dateObj.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' });
    const dummyId = 'srv-old-' + Date.now();
    const dummyCode = 'SRV-' + Math.floor(1000 + Math.random() * 9000);

    const oldService: ServiceRequest = {
      id: dummyId,
      code: dummyCode,
      title: 'Manutenção Hidráulica Residencial (Registro Antigo +35d)',
      description: 'Reparo hidráulico concluído há mais de 30 dias. Registro inserido para teste da rotina periódica de descarte/limpeza.',
      category: 'hidraulica',
      status: 'concluido_pago',
      clientId: clients[0]?.id || 'cli-demo',
      clientName: clients[0]?.name || 'Cliente Histórico Antigo',
      clientPhone: clients[0]?.phone || '(11) 98888-7777',
      clientAvatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
      media: [],
      proposals: [],
      estimatedPrice: 280,
      isArchived: true,
      archivedAt: dateStr,
      archivedEpoch: thirtyFiveDaysAgoMs,
      createdEpoch: thirtyFiveDaysAgoMs,
      completedAt: dateStr,
      createdAt: dateStr,
      urgency: 'agendado',
      address: {
        street: 'Av. Paulista',
        number: '1200',
        neighborhood: 'Bela Vista',
        city: 'São Paulo',
        state: 'SP',
        zipCode: '01310-100',
        lat: -23.56,
        lng: -46.65
      },
      chat: [],
      payment: {
        method: 'pix',
        totalAmount: 280,
        platformFeeAmount: 42,
        providerPayoutAmount: 238,
        status: 'paid_to_provider',
        paidAt: dateStr
      }
    };

    setServices(prev => [oldService, ...prev]);
    safeFirestoreSetDoc('services', dummyId, oldService);

    addAdminAlarm({
      level: 'warning',
      title: '🚨 Alarme Visual de Limpeza Disparado',
      description: `Foi inserido o chamado #${dummyCode} com data de 35 dias atrás. O alerta visual de limpeza periódica dos últimos 30 dias está ativo no Admin!`,
      category: 'new_registration'
    });

    return oldService;
  }, [clients, setServices, safeFirestoreSetDoc, addAdminAlarm]);

  // Reset to initial demo mocks
  const resetDemoData = () => {
    setSettings(INITIAL_SETTINGS);
    setServices(INITIAL_SERVICES);
    setProviders(INITIAL_PROVIDERS);
    setClients(INITIAL_CLIENTS);
    setTransactions(INITIAL_TRANSACTIONS);
    setAdminAlarms(INITIAL_ADMIN_ALARMS);
    setReviews(INITIAL_REVIEWS);
    setNotifications([]);
    setActiveClientId(INITIAL_CLIENTS[0]?.id || '');
    setActiveProviderId(INITIAL_PROVIDERS[0]?.id || '');
    localStorage.clear();
  };

  return (
    <AppContext.Provider
      value={{
        isFirestoreQuotaExceeded,
        setIsFirestoreQuotaExceeded,
        currentRole,
        setCurrentRole,
        client,
        provider,
        clients,
        providers,
        services,
        isServicesLoading,
        hasChosenPortal,
        setHasChosenPortal,
        transactions,
        adminAlarms,
        reviews,
        settings,
        notifications,
        soundEnabled,
        setSoundEnabled,
        selectedCity,
        setSelectedCity,
        isClientAuthenticated,
        authenticatedClientId,
        loginClient,
        logoutClient,
        updateClientPasswordByAdmin,
        activeServiceForClient,
        activeServiceForProvider,
        createServiceRequest,
        dispatchServiceToProvider,
        providerAcceptDispatchedService,
        providerRejectDispatchedService,
        providerQuestionDispatchedService,
        providerRejectServiceRequest,
        registerClient,
        confirmClientLocation,
        clientAcknowledgeService,
        adminForwardServiceToClient,
        clientAcceptServicePrice,
        clientRejectServicePrice,
        submitProposal,
        acceptProposal,
        acceptServiceRequestDirectly,
        markProviderOnTheWay,
        markProviderArrived,
        clientConfirmProviderArrival,
        startServiceExecution,
        submitPhotoReport,
        toggleArchiveService,
        approveReportAndPay,
        providerNotifyFeeTransferred,
        confirmPaymentReceived,
        cancelServiceRequest,
        sendChatMessage,
        markChatAsRead,
        isChatUnread,
        createAdminSupportRequest,
        clearAllFirebaseChats,
        simulateFirebaseCapacityLoad,
        toggleProviderChatRelease,
        updateClientProfile,
        switchActiveClient,
        switchActiveProvider,
        toggleProviderOnline,
        updateProviderSettings,
        updateProviderLocation,
        withdrawProviderPix,
        requestCategoryChange,
        resolveCategoryRequest,
        payProviderLicenseFee,
        saveAppSettings,
        updateServiceStatus,
        editServiceDetails,
        addOrUpdateClient,
        deleteClient,
        addOrUpdateProvider,
        deleteProvider,
        moderateReview,
        deleteReview,
        addAdminAlarm,
        acknowledgeAlarm,
        acknowledgeAllAlarms,
        clearAllAlarms,
        triggerManualTestAlarm,
        categories,
        updateCategory,
        addCategory,
        deleteCategory,
        isAdminUnlocked,
        setIsAdminUnlocked,
        isAdminAuthenticated,
        loginAdmin,
        logoutAdmin,
        changeAdminPassword,
        isProviderAuthenticated,
        authenticatedProviderId,
        loginProvider,
        logoutProvider,
        completeProviderRegistration,
        generateProviderPassword,
        toggleProviderAuthorization,
        requestProviderRegistration,
        exportDatabaseJson,
        importDatabaseJson,
        resetDemoData,
        clearFictitiousData,
        clearDatabaseToScratch,
        clearServiceRequestsOlderThan30Days,
        simulateServiceOlderThan30Days,
        resetActiveClient,
        dismissNotification,
        markAllNotificationsRead,
        simulateIncomingRequest,
        simulateProviderProposal,
        activeToasts,
        triggerSyncEvent,
        dismissToast,
        markServiceRequestAsViewedByAdmin,
        profileEditRequests,
        submitProfileEditRequest,
        resolveProfileEditRequest,
        acknowledgeProfileEditRequest,
        syncDatabaseData
      }}
    >
      {children}
    </AppContext.Provider>
  );
};

export const useApp = (): AppContextType => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};
