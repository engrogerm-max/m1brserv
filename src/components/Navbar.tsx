import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { M1Logo } from './M1Logo';
import { AccessCredentialsModal } from './AccessCredentialsModal';
import {
  Wrench,
  User,
  ShieldCheck,
  Bell,
  Volume2,
  VolumeX,
  MapPin,
  ChevronDown,
  X,
  Globe,
  Mail,
  Phone,
  CheckCircle2,
  Sparkles,
  RotateCcw,
  AlertTriangle,
  Radio,
  Key
} from 'lucide-react';

export const Navbar: React.FC = () => {
  const {
    currentRole,
    setCurrentRole,
    soundEnabled,
    setSoundEnabled,
    selectedCity,
    setSelectedCity,
    notifications,
    adminAlarms,
    services,
    dismissNotification,
    markAllNotificationsRead,
    settings,
    client,
    provider,
    simulateIncomingRequest,
    resetDemoData,
    triggerManualTestAlarm,
    isAdminAuthenticated,
    isClientAuthenticated,
    isProviderAuthenticated,
    isAdminUnlocked
  } = useApp();

  const [showNotifications, setShowNotifications] = useState(false);
  const [showCityMenu, setShowCityMenu] = useState(false);
  const [showCredentialsModal, setShowCredentialsModal] = useState(false);
  const [showRoleDropdown, setShowRoleDropdown] = useState(false);

  const roleNotifications = notifications.filter(n => {
    if (n.targetRole !== currentRole) return false;
    if (currentRole === 'client' && client) {
      if (n.clientId && n.clientId !== client.id) return false;
      if (n.serviceId && !services.some(s => s.id === n.serviceId && s.clientId === client.id)) return false;
    }
    if (currentRole === 'provider' && provider) {
      if (n.providerId && n.providerId !== provider.id) return false;
      if (n.serviceId && !services.some(s => s.id === n.serviceId && s.providerId === provider.id)) return false;
    }
    return true;
  });
  const unreadCount = roleNotifications.filter(n => !n.read).length;
  const unackAlarmsCount = adminAlarms.filter(a => !a.acknowledged).length;
  const pendingRequestsCount = services.filter(s => s.status === 'solicitado' || s.status === 'negociando').length;
  const reportsPendingCount = services.filter(s => s.status === 'relatorio_enviado').length;

  const CITIES = [
    'São Paulo, SP',
    'Campinas, SP',
    'Santos, SP',
    'São José dos Campos, SP',
    'Ribeirão Preto, SP',
    'Sorocaba, SP',
    'Rio de Janeiro, RJ',
    'Curitiba, PR',
    'Belo Horizonte, MG'
  ];

  // Região confirmada por GPS e endereço cadastrado
  const confirmedRegionText = client?.isLocationConfirmed
    ? `${client.defaultAddress?.city || selectedCity}, ${client.defaultAddress?.state || 'SP'} • ${client.defaultAddress?.neighborhood || 'Região'} (GPS Ativo)`
    : `${selectedCity} (Confirmar GPS)`;

  return (
    <header className="sticky top-0 z-40 bg-slate-950/98 backdrop-blur-lg border-b border-slate-800 text-white shadow-2xl" id="navbar-header">
      {/* Top Company Info Bar */}
      <div className="bg-slate-900/95 border-b border-slate-800/60 py-1 px-3 sm:px-6">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-[11px] text-slate-300 font-medium">
          <div className="flex items-center gap-3 sm:gap-6 overflow-x-auto whitespace-nowrap scrollbar-none py-0.5">
            <a
              href={`https://${settings.website || 'www.m1br.com.br'}`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 hover:text-red-400 transition-colors"
            >
              <Globe className="w-3 h-3 text-red-500" />
              <span>{settings.website || 'www.m1br.com.br'}</span>
            </a>
            <a
              href={`mailto:${settings.email || 'rogerio@m1br.com.br'}`}
              className="hidden sm:flex items-center gap-1.5 hover:text-red-400 transition-colors"
            >
              <Mail className="w-3 h-3 text-red-500" />
              <span>{settings.email || 'rogerio@m1br.com.br'}</span>
            </a>
            <a
              href={`https://wa.me/5511962122694?text=Olá,%20gostaria%20de%20atendimento%20pela%20M1%20SERV`}
              target="_blank"
              rel="noreferrer"
              className="flex items-center gap-1.5 text-emerald-400 hover:text-emerald-300 transition-colors font-bold"
            >
              <Phone className="w-3 h-3 text-emerald-400" />
              <span>WhatsApp: {settings.supportWhatsapp || '(11)96212-2694'}</span>
            </a>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            <span className="hidden md:inline-flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded-full border border-emerald-500/30">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
              Central 24h M1
            </span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-3 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-18 sm:h-20 gap-2">
          
          {/* Brand & Logo Section with Enlarged Vector M1 Logo and Black Ops One font */}
          <div className="flex items-center gap-2 sm:gap-3.5 min-w-0 select-none">
            <div className="flex items-center gap-2.5 sm:gap-3.5 min-w-0">
              {/* Logo um pouco maior conforme solicitado */}
              <div 
                className="p-1 rounded-xl bg-slate-900/60 border border-slate-800/80 shadow-md shrink-0 cursor-pointer hover:bg-slate-850 transition-colors flex items-center justify-center"
                title="M1 SERV - Plataforma Oficial de Serviços"
              >
                {settings.mainLogoUrl ? (
                  <img src={settings.mainLogoUrl} alt="Logo" className="w-11 h-11 sm:w-14 sm:h-14 object-contain rounded-lg" referrerPolicy="no-referrer" />
                ) : (
                  <M1Logo size="lg" showGlow={true} className="w-11 h-11 sm:w-14 sm:h-14" />
                )}
              </div>
              
              <div className="min-w-0 flex flex-col justify-center">
                {/* Nome "M1 SERV" na fonte Black Ops One */}
                <div className="flex items-center gap-2">
                  <h1 
                    className="text-xl sm:text-2xl md:text-3xl tracking-wider text-white select-none whitespace-nowrap drop-shadow-[0_2px_10px_rgba(239,68,68,0.3)]"
                    style={{ fontFamily: "'Black Ops One', cursive" }}
                  >
                    {settings.companyName || 'M1 SERV'}
                  </h1>
                  <span className="hidden lg:inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-red-600/20 text-red-400 border border-red-500/40">
                    OFICIAL
                  </span>
                </div>
                
                {/* Região escolhida pelo cliente confirmada por GPS e Endereço Cadastrado */}
                <div className="flex items-center gap-1.5 mt-0.5 text-xs text-slate-300 font-medium truncate">
                  <div className="flex items-center gap-1 text-[11px] sm:text-xs text-emerald-400 font-semibold truncate bg-slate-900/80 px-2 py-0.5 rounded-lg border border-slate-800">
                    <MapPin className="w-3.5 h-3.5 text-red-500 shrink-0" />
                    <span className="truncate">{confirmedRegionText}</span>
                    {client?.isLocationConfirmed && (
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0 ml-0.5" />
                    )}
                  </div>

                  {/* Seletor rápido de cidade */}
                  <div className="relative shrink-0 hidden sm:block">
                    <button
                      onClick={() => setShowCityMenu(!showCityMenu)}
                      className="text-[10px] text-slate-400 hover:text-white px-1.5 py-0.5 rounded bg-slate-800/80 hover:bg-slate-700 flex items-center gap-0.5 transition-colors cursor-pointer"
                      title="Alterar Cidade"
                    >
                      <span>Mudar</span>
                      <ChevronDown className="w-2.5 h-2.5" />
                    </button>

                    {showCityMenu && (
                      <div className="absolute top-6 left-0 mt-1 w-52 bg-slate-900 border border-slate-700 rounded-xl shadow-2xl py-1.5 z-50">
                        <div className="px-3 py-1 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800">
                          Selecione sua Região
                        </div>
                        {CITIES.map(city => (
                          <button
                            key={city}
                            onClick={() => {
                              setSelectedCity(city);
                              setShowCityMenu(false);
                            }}
                            className={`w-full text-left px-3 py-1.5 text-xs transition-colors flex items-center justify-between ${
                              selectedCity === city
                                ? 'bg-red-500/20 text-red-300 font-semibold'
                                : 'text-slate-300 hover:bg-slate-800'
                            }`}
                          >
                            <span>{city}</span>
                            {selectedCity === city && <span className="w-1.5 h-1.5 rounded-full bg-red-500" />}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Role Navigation Switcher (Isolamento completo exigido) */}
          <div className="flex items-center gap-1.5 sm:gap-2">
            {isAdminAuthenticated ? (
              <div className="flex items-center bg-slate-900/90 p-1 rounded-xl border border-slate-800 shadow-inner">
                {/* Cliente */}
                <button
                  onClick={() => setCurrentRole('client')}
                  className={`relative px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    (currentRole as string) === 'client'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Testar Área do Cliente"
                >
                  <User className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">Cliente</span>
                  {reportsPendingCount > 0 && (currentRole as string) !== 'client' && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping absolute -top-0.5 -right-0.5" />
                  )}
                </button>

                {/* Prestador */}
                <button
                  onClick={() => setCurrentRole('provider')}
                  className={`relative px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    (currentRole as string) === 'provider'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Testar Área do Prestador"
                >
                  <Wrench className="w-3.5 h-3.5" />
                  <span className="hidden xs:inline sm:inline">Prestador</span>
                  {pendingRequestsCount > 0 && (currentRole as string) !== 'provider' && (
                    <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-amber-500 text-slate-950 animate-pulse">
                      {pendingRequestsCount}
                    </span>
                  )}
                </button>

                {/* Administrador */}
                <button
                  onClick={() => setCurrentRole('admin')}
                  className={`relative px-2.5 sm:px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 cursor-pointer ${
                    (currentRole as string) === 'admin'
                      ? 'bg-red-600 text-white shadow-md shadow-red-600/30'
                      : 'text-slate-400 hover:text-white'
                  }`}
                  title="Painel de Controle do Administrador"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  <span className="hidden sm:inline">Admin</span>
                  {unackAlarmsCount > 0 && (
                    <span className="px-1.5 py-0.2 text-[9px] font-black rounded-full bg-red-500 text-white animate-pulse">
                      {unackAlarmsCount}
                    </span>
                  )}
                </button>
              </div>
            ) : isClientAuthenticated ? (
              /* Cliente Autenticado - Apenas visualização de seu status, zero opção de troca */
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-slate-300">
                <User className="w-3.5 h-3.5 text-red-500 shrink-0" />
                <span className="font-bold tracking-wide">Portal do Cliente</span>
              </div>
            ) : isProviderAuthenticated ? (
              /* Prestador Autenticado - Apenas visualização de seu status, zero opção de troca */
              <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-slate-300">
                <Wrench className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                <span className="font-bold tracking-wide">Portal do Prestador</span>
              </div>
            ) : (
              /* Seletor interativo de perfil para testes e produção - Apenas visível para fins de teste se admin estiver desbloqueado */
              isAdminUnlocked ? (
                <div className="relative">
                  <button
                    onClick={() => setShowRoleDropdown(!showRoleDropdown)}
                    className="flex items-center gap-1.5 bg-slate-900 hover:bg-slate-850 px-3.5 py-2.5 rounded-xl border border-slate-800 text-xs font-bold text-slate-300 transition-all cursor-pointer hover:border-slate-700"
                    title="Clique para alternar o perfil de acesso"
                  >
                    {currentRole === 'client' && (
                      <>
                        <User className="w-3.5 h-3.5 text-red-500" />
                        <span>Área do Cliente</span>
                      </>
                    )}
                    {currentRole === 'provider' && (
                      <>
                        <Wrench className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Área do Prestador</span>
                      </>
                    )}
                    {currentRole === 'admin' && (
                      <>
                        <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
                        <span>Área do Admin</span>
                      </>
                    )}
                    <ChevronDown className="w-3.5 h-3.5 text-slate-500 ml-1" />
                  </button>

                  {showRoleDropdown && (
                    <div className="absolute right-0 mt-2 w-56 bg-slate-900 border border-slate-750 rounded-2xl shadow-2xl py-2 z-50 animate-fade-in">
                      <div className="px-3.5 py-1.5 text-[10px] uppercase font-bold text-slate-400 border-b border-slate-800 tracking-wider">
                        Selecione o Perfil de Acesso
                      </div>
                      
                      {/* Cliente Option */}
                      <button
                        onClick={() => {
                          setCurrentRole('client');
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-center gap-2.5 cursor-pointer ${
                          currentRole === 'client'
                            ? 'bg-red-500/10 text-red-400 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <User className="w-4 h-4 text-red-500 shrink-0" />
                        <div>
                          <div className="font-bold">Portal do Cliente</div>
                          <div className="text-[10px] text-slate-500 font-normal">Solicitar serviços e ver GPS</div>
                        </div>
                      </button>

                      {/* Prestador Option */}
                      <button
                        onClick={() => {
                          setCurrentRole('provider');
                          setShowRoleDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs transition-colors flex items-center gap-2.5 cursor-pointer ${
                          currentRole === 'provider'
                            ? 'bg-emerald-500/10 text-emerald-400 font-bold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <Wrench className="w-4 h-4 text-emerald-400 shrink-0" />
                        <div>
                          <div className="font-bold">Portal do Prestador</div>
                          <div className="text-[10px] text-slate-500 font-normal">Painel de atendimentos e Pix</div>
                        </div>
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                /* Para usuários normais (Clientes/Prestadores), mostra apenas um indicador estático discreto, sem qualquer opção de alternância */
                <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 px-3.5 py-2.5 rounded-xl text-xs text-slate-400 font-bold select-none">
                  {currentRole === 'client' ? (
                    <>
                      <User className="w-3.5 h-3.5 text-red-500 shrink-0" />
                      <span>Portal do Cliente</span>
                    </>
                  ) : (
                    <>
                      <Wrench className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>Portal do Prestador</span>
                    </>
                  )}
                </div>
              )
            )}

            {/* 3 Access Codes Button - EXCLUSIVO DO ADMIN AUTENTICADO */}
            {currentRole === 'admin' && isAdminAuthenticated && (
              <button
                onClick={() => setShowCredentialsModal(true)}
                className="px-2.5 sm:px-3 py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 hover:text-white transition-all flex items-center gap-1.5 text-xs font-bold cursor-pointer shadow-sm animate-fade-in"
                title="Ver os 3 Links e Códigos de Acesso (Cliente, Prestador, Admin)"
              >
                <Key className="w-3.5 h-3.5 text-red-400" />
                <span className="hidden md:inline">3 Links & Códigos</span>
                <span className="md:hidden">3 Links</span>
              </button>
            )}

            {/* Sound Toggle */}
            <button
              onClick={() => setSoundEnabled(!soundEnabled)}
              className={`p-2 rounded-xl border transition-all cursor-pointer hidden sm:flex ${
                soundEnabled
                  ? 'bg-slate-900 border-slate-800 text-emerald-400 hover:text-emerald-300'
                  : 'bg-slate-900 border-slate-800 text-slate-500 hover:text-slate-400'
              }`}
              title={soundEnabled ? 'Sons de alarme ativos' : 'Sons desativados'}
            >
              {soundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
            </button>

            {/* Notifications Button */}
            <div className="relative">
              <button
                onClick={() => setShowNotifications(!showNotifications)}
                className="relative p-2 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white transition-all cursor-pointer"
                title="Notificações"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-red-600 text-white text-[9px] font-black flex items-center justify-center animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {/* Notifications Dropdown */}
              {showNotifications && (
                <div className="absolute right-0 mt-2 w-80 sm:w-96 bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden z-50">
                  <div className="p-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Bell className="w-4 h-4 text-red-500" />
                      <span className="font-bold text-sm">Notificações M1</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] bg-red-600/30 text-red-400 px-1.5 py-0.5 rounded-full font-bold">
                          {unreadCount} novas
                        </span>
                      )}
                    </div>
                    <div className="flex items-center gap-2">
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllNotificationsRead}
                          className="text-[11px] text-red-400 hover:underline cursor-pointer"
                        >
                          Marcar lidas
                        </button>
                      )}
                      <button
                        onClick={() => setShowNotifications(false)}
                        className="text-slate-400 hover:text-white cursor-pointer"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="max-h-80 overflow-y-auto divide-y divide-slate-800/60 p-1">
                    {roleNotifications.length === 0 && (currentRole !== 'admin' || adminAlarms.length === 0) ? (
                      <div className="p-6 text-center text-slate-500 text-xs">
                        Nenhuma notificação no momento
                      </div>
                    ) : (
                      roleNotifications.slice(0, 10).map(item => (
                        <div
                          key={item.id}
                          className={`p-3 text-xs transition-colors rounded-xl m-1 ${
                            item.read ? 'bg-slate-900/50 text-slate-400' : 'bg-slate-800/80 text-white font-medium'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-bold text-slate-200">{item.title}</h4>
                            <span className="text-[10px] text-slate-400 shrink-0">{item.timestamp}</span>
                          </div>
                          <p className="mt-1 text-[11px] text-slate-300 leading-relaxed">{item.message}</p>
                          <button
                            onClick={() => dismissNotification(item.id)}
                            className="mt-2 text-[10px] text-slate-400 hover:text-slate-200 underline cursor-pointer"
                          >
                            Dispensar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      <AccessCredentialsModal
        isOpen={showCredentialsModal}
        onClose={() => setShowCredentialsModal(false)}
      />
    </header>
  );
};
