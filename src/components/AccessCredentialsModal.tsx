import React, { useState } from 'react';
import { useApp } from '../context/AppContext';
import {
  ShieldCheck,
  User,
  Wrench,
  Key,
  Copy,
  Check,
  X,
  ExternalLink,
  Lock,
  Smartphone,
  CheckCircle2,
  Sparkles,
  MapPin,
  Link,
  Share2,
  MessageCircle,
  QrCode
} from 'lucide-react';

interface AccessCredentialsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AccessCredentialsModal: React.FC<AccessCredentialsModalProps> = ({ isOpen, onClose }) => {
  const { setCurrentRole, settings, isAdminAuthenticated } = useApp();
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showSpamPreview, setShowSpamPreview] = useState(false);

  if (!isOpen) return null;

  const getBaseAppUrl = (): string => {
    if (typeof window !== 'undefined' && window.location.origin) {
      const origin = window.location.origin;
      const pathname = window.location.pathname === '/' ? '' : window.location.pathname;
      return `${origin}${pathname}/`;
    }
    return 'https://ais-pre-r2k7kjbptbfvqxu7xcpqhu-79288047096.us-west1.run.app/';
  };

  const baseUrl = getBaseAppUrl();
  const clientUrl = `${baseUrl}?role=client`;
  const providerUrl = `${baseUrl}?role=provider`;
  const adminUrl = `${baseUrl}?role=admin`;

  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2500);
  };

  const shareViaWhatsApp = (url: string, title: string, text: string) => {
    const message = encodeURIComponent(`*${title} - M1 SERV*\n\n${text}\n\n👉 Acesse o link direto:\n${url}`);
    window.open(`https://wa.me/?text=${message}`, '_blank', 'noopener,noreferrer');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-fade-in">
      <div className="bg-slate-900 border border-slate-700 rounded-3xl max-w-3xl w-full p-5 sm:p-6 shadow-2xl space-y-5 max-h-[92vh] overflow-y-auto text-white">
        
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-red-600/20 border border-red-500/30 flex items-center justify-center text-red-400 shrink-0">
              <Link className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="text-lg font-bold text-white">3 Links & Códigos de Acesso M1 SERV</h3>
                <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  Multidispositivo
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Envie ou abra os links abaixo diretamente no celular, tablet ou computador para testar cada perfil
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-1.5 rounded-xl bg-slate-800 text-slate-400 hover:text-white cursor-pointer transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* SPAM Page Preview Trigger Button */}
        <div className="bg-amber-500/10 border border-amber-500/30 p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 shadow-md">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-400 shrink-0 animate-pulse">
              <Share2 className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-sm font-black text-amber-300">Visualizar Tela de SPAM (Técnico a Caminho)</h4>
              <p className="text-xs text-slate-400 mt-0.5">Abra e inspecione a página inteira do cliente com rolagem integrada no centro da tela.</p>
            </div>
          </div>
          <button
            onClick={() => setShowSpamPreview(true)}
            className="px-4 py-2 bg-amber-500 hover:bg-amber-450 text-slate-950 text-xs font-black rounded-xl cursor-pointer transition-all flex items-center gap-1.5 shadow-md shadow-amber-500/20"
          >
            <span>Visualizar Página Inteira</span>
            <ExternalLink className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* 3 Role Credentials & Links Cards */}
        <div className="space-y-4">
          
          {/* 1. CLIENT LINK & CODE */}
          <div className="bg-slate-950 border border-blue-500/40 rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden shadow-lg shadow-blue-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-blue-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  1
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <User className="w-4 h-4 text-blue-400" />
                    Link 1: Área do Cliente (Visão Simplificada)
                  </h4>
                  <span className="text-[11px] text-slate-400">Solicitar serviços em 1 clique, fotos, GPS ao vivo e aprovação Pix</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setCurrentRole('client');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-md shadow-blue-600/20"
                >
                  <span>Abrir no App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Direct URL Box */}
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-blue-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Link className="w-3 h-3" /> Link Direto para Clientes
                </span>
                <span className="text-[10px] text-emerald-400 font-bold">Sem senha necessária</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800 gap-2">
                <code className="text-xs text-blue-300 font-mono break-all line-clamp-1 flex-1 select-all">
                  {clientUrl}
                </code>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => copyToClipboard(clientUrl, 'client_url')}
                    className="px-2.5 py-1 rounded-lg bg-blue-600/20 hover:bg-blue-600/40 text-blue-300 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all border border-blue-500/30"
                  >
                    {copiedField === 'client_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'client_url' ? 'Copiado!' : 'Copiar Link'}</span>
                  </button>
                  <button
                    onClick={() => shareViaWhatsApp(clientUrl, 'Solicitar Serviço', 'Acesse o aplicativo M1 SERV para solicitar serviços com profissionais qualificados e GPS em tempo real.')}
                    className="p-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                    title="Enviar Link no WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Demo Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-850">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Cliente Teste:</span>
                  <span className="text-slate-200 font-bold">Mariana Silva • (11) 98765-4321</span>
                </div>
                <button
                  onClick={() => copyToClipboard('(11) 98765-4321', 'client_phone')}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Copiar telefone"
                >
                  {copiedField === 'client_phone' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-850">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Acesso Cliente:</span>
                  <span className="text-emerald-400 font-bold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" />
                    Direto & Ágil
                  </span>
                </div>
              </div>
            </div>
          </div>

          {/* 2. PROVIDER LINK & CODE */}
          <div className="bg-slate-950 border border-emerald-500/40 rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden shadow-lg shadow-emerald-950/20">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-emerald-600 text-slate-950 flex items-center justify-center font-black text-sm shrink-0">
                  2
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <Wrench className="w-4 h-4 text-emerald-400" />
                    Link 2: Área do Prestador Credenciado
                  </h4>
                  <span className="text-[11px] text-slate-400">Atender radar de chamados, GPS até o cliente e enviar fotos Antes/Depois</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setCurrentRole('provider');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-md shadow-emerald-500/20"
                >
                  <span>Abrir no App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Direct URL Box */}
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-emerald-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Link className="w-3 h-3" /> Link Direto para Prestadores
                </span>
                <span className="text-[10px] text-slate-400">Login com senha liberada</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800 gap-2">
                <code className="text-xs text-emerald-300 font-mono break-all line-clamp-1 flex-1 select-all">
                  {providerUrl}
                </code>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => copyToClipboard(providerUrl, 'prov_url')}
                    className="px-2.5 py-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-300 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all border border-emerald-500/30"
                  >
                    {copiedField === 'prov_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'prov_url' ? 'Copiado!' : 'Copiar Link'}</span>
                  </button>
                  <button
                    onClick={() => shareViaWhatsApp(providerUrl, 'Portal do Prestador', 'Acesse o portal do profissional M1 SERV para receber chamados na sua região.')}
                    className="p-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                    title="Enviar Link no WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Provider Login Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-850">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Telefone / Login:</span>
                  <code className="text-emerald-300 font-mono font-bold text-xs">(11) 97123-8899</code>
                </div>
                <button
                  onClick={() => copyToClipboard('(11) 97123-8899', 'prov_login')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  title="Copiar Login"
                >
                  {copiedField === 'prov_login' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-850">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Senha de Acesso:</span>
                  <code className="text-emerald-300 font-mono font-black text-xs">prestador123</code>
                </div>
                <button
                  onClick={() => copyToClipboard('prestador123', 'prov_pass')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  title="Copiar Senha"
                >
                  {copiedField === 'prov_pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
          {/* 3. ADMIN LINK & CODE - ALWAYS VISIBLE FOR EASY TESTING */}
          <div className="bg-slate-950 border-2 border-red-500/60 rounded-2xl p-4 sm:p-5 space-y-3 relative overflow-hidden shadow-xl shadow-red-950/30">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-xl bg-red-600 text-white flex items-center justify-center font-black text-sm shrink-0">
                  3
                </div>
                <div>
                  <h4 className="text-sm font-black text-white flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-red-400" />
                    Link 3: Área do Administrador (Gestão & Senhas)
                  </h4>
                  <span className="text-[11px] text-slate-400">Controle total: zerar fictícios, aprovar documentos, editar preços e alarmes</span>
                </div>
              </div>

              <div className="flex items-center gap-1.5 self-start sm:self-auto">
                <button
                  onClick={() => {
                    setCurrentRole('admin');
                    onClose();
                  }}
                  className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-xl cursor-pointer transition-all flex items-center gap-1 shadow-md shadow-red-600/30"
                >
                  <span>Abrir no App</span>
                  <ExternalLink className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Direct URL Box */}
            <div className="bg-slate-900/90 p-3 rounded-xl border border-slate-800 space-y-2">
              <div className="flex items-center justify-between gap-2">
                <span className="text-[10px] text-red-400 font-bold uppercase tracking-wider flex items-center gap-1">
                  <Link className="w-3 h-3" /> Link Direto para o Administrador
                </span>
                <span className="text-[10px] text-amber-400 font-bold">Acesso Protegido por Senha / PIN</span>
              </div>
              <div className="flex items-center justify-between bg-slate-950 p-2 rounded-lg border border-slate-800 gap-2">
                <code className="text-xs text-red-300 font-mono break-all line-clamp-1 flex-1 select-all">
                  {adminUrl}
                </code>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    onClick={() => copyToClipboard(adminUrl, 'admin_url')}
                    className="px-2.5 py-1 rounded-lg bg-red-600/20 hover:bg-red-600/40 text-red-300 hover:text-white text-xs font-bold flex items-center gap-1 cursor-pointer transition-all border border-red-500/30"
                  >
                    {copiedField === 'admin_url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedField === 'admin_url' ? 'Copiado!' : 'Copiar Link'}</span>
                  </button>
                  <button
                    onClick={() => shareViaWhatsApp(adminUrl, 'Painel do Administrador M1', 'Link de acesso ao painel de administração da plataforma M1 SERV.')}
                    className="p-1 rounded-lg bg-emerald-600/20 hover:bg-emerald-600/40 text-emerald-400 border border-emerald-500/30 cursor-pointer"
                    title="Enviar Link no WhatsApp"
                  >
                    <MessageCircle className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>

            {/* Admin Credentials */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs">
              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-850">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">PIN Rápido Mestre:</span>
                  <code className="text-red-400 font-mono font-black text-sm">9621</code>
                </div>
                <button
                  onClick={() => copyToClipboard('9621', 'admin_pin')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  title="Copiar PIN"
                >
                  {copiedField === 'admin_pin' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="flex items-center justify-between p-2 rounded-lg bg-slate-900/60 border border-slate-850">
                <div>
                  <span className="text-[10px] text-slate-500 block uppercase font-bold">Senha Master Completa:</span>
                  <code className="text-red-400 font-mono font-black text-xs">M1#Adm!9621@Br2026</code>
                </div>
                <button
                  onClick={() => copyToClipboard('M1#Adm!9621@Br2026', 'admin_pass')}
                  className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white cursor-pointer"
                  title="Copiar Senha Master"
                >
                  {copiedField === 'admin_pass' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Footer info */}
        <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-800 text-[11px] text-slate-400 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-amber-400 shrink-0" />
            <span>Abra cada link em uma aba anônima ou em outro celular para testar a experiência simultânea.</span>
          </div>

          <button
            onClick={onClose}
            className="px-4 py-1.5 bg-slate-800 hover:bg-slate-700 text-white font-bold rounded-xl cursor-pointer transition-colors self-end sm:self-auto"
          >
            Fechar
          </button>
        </div>

      </div>

      {/* 🏁 SPAM MODAL PREVIEW IN THE MIDDLE OF THE SCREEN WITH SCROLLBAR */}
      {showSpamPreview && (
        <div className="fixed inset-0 bg-slate-950/95 backdrop-blur-md z-[60] flex items-start justify-center p-4 overflow-y-auto animate-fade-in pt-4 md:pt-8 pb-12">
          <div className="bg-slate-900 border-2 border-amber-500/80 w-full max-w-lg rounded-3xl shadow-2xl relative space-y-5 text-center max-h-none overflow-visible text-white flex flex-col">
            
            {/* Sticky Header inside modal */}
            <div className="p-4 border-b border-slate-800 bg-slate-900 flex justify-between items-center shrink-0">
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-500 animate-ping" />
                <span className="text-xs font-black text-amber-400 tracking-wider uppercase">Visualização da Tela de SPAM</span>
              </div>
              <button
                onClick={() => setShowSpamPreview(false)}
                className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-[11px] font-bold cursor-pointer transition-colors"
              >
                Voltar
              </button>
            </div>

            {/* Scrollable Content */}
            <div className="p-5 sm:p-6 space-y-6 overflow-visible flex-1 select-none">
              
              {/* Flashing Siren / Status Indicator */}
              <div className="relative flex justify-center mx-auto my-1">
                <span className="absolute inline-flex h-14 w-14 rounded-full bg-amber-500 opacity-20 animate-ping"></span>
                <div className="relative rounded-2xl bg-amber-500/10 border border-amber-500/30 p-3 flex items-center justify-center text-amber-400 shrink-0">
                  <Smartphone className="w-6 h-6" />
                </div>
              </div>

              <div>
                <h3 className="text-lg font-extrabold tracking-tight text-white uppercase">
                  O PRESTADOR DE SERVIÇO JÁ ESTÁ A CAMINHO
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Acompanhe em tempo real o trajeto do profissional credenciado M1 Brasil até seu endereço.
                </p>
              </div>

              {/* Progress Indicator Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3 text-left">
                <div className="flex items-center justify-between text-[11px] font-bold">
                  <span className="text-slate-400 uppercase">Previsão de Chegada:</span>
                  <span className="text-amber-400 font-mono font-black animate-pulse">12 minutos</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-amber-500 to-amber-400 h-full w-2/3 rounded-full animate-pulse"></div>
                </div>
                <div className="flex justify-between text-[10px] text-slate-500">
                  <span>Partida: Bela Vista</span>
                  <span className="text-slate-300 font-semibold">Destino: Consolação</span>
                </div>
              </div>

              {/* Map Mockup */}
              <div className="relative rounded-2xl overflow-hidden border border-slate-800 bg-slate-950 h-36 flex items-center justify-center">
                {/* Simulated Grid / Map Pattern */}
                <div className="absolute inset-0 opacity-20 bg-[linear-gradient(to_right,#334155_1px,transparent_1px),linear-gradient(to_bottom,#334155_1px,transparent_1px)] bg-[size:16px_16px]"></div>
                
                {/* Routing Lines */}
                <svg className="absolute inset-0 w-full h-full text-amber-500/50">
                  <path d="M 60 110 Q 150 40 220 80 T 380 30" fill="none" stroke="currentColor" strokeWidth="3" strokeDasharray="6" className="animate-[dash_10s_linear_infinite]" />
                </svg>

                {/* Simulated Pins */}
                <div className="absolute left-[60px] top-[102px] flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-emerald-500 flex items-center justify-center text-[7px] text-slate-950 font-bold border-2 border-slate-900 shadow-md">A</div>
                  <span className="text-[8px] font-bold text-slate-400 mt-0.5">Partida</span>
                </div>

                <div className="absolute left-[220px] top-[72px] flex flex-col items-center animate-pulse">
                  <div className="w-6 h-6 rounded-full bg-amber-500 flex items-center justify-center text-slate-950 font-bold border-2 border-slate-900 shadow-lg">🏍️</div>
                  <span className="text-[8px] font-bold text-amber-400 mt-0.5">Técnico</span>
                </div>

                <div className="absolute left-[330px] top-[26px] flex flex-col items-center">
                  <div className="w-4 h-4 rounded-full bg-red-500 flex items-center justify-center text-[7px] text-white font-bold border-2 border-slate-900 shadow-md">B</div>
                  <span className="text-[8px] font-bold text-slate-400 mt-0.5">Você</span>
                </div>

                <span className="absolute bottom-2 right-2 px-2 py-0.5 rounded bg-slate-900/90 border border-slate-800 text-[9px] text-slate-400">
                  GPS Integrado M1 Brasil
                </span>
              </div>

              {/* Provider Card */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3.5 text-left">
                <div className="flex items-center gap-3">
                  <img
                    src="https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&q=80&w=120"
                    alt="Carlos Andrade"
                    className="w-12 h-12 rounded-xl object-cover border border-slate-800 shrink-0"
                    referrerPolicy="no-referrer"
                  />
                  <div>
                    <h4 className="text-sm font-extrabold text-white">Carlos Andrade</h4>
                    <p className="text-[11px] text-emerald-400 font-bold flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Eletricista Credenciado • M1 Master
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-900 text-xs">
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-850">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Veículo:</span>
                    <span className="text-slate-200 font-bold">Honda CG 160 Fan</span>
                  </div>
                  <div className="p-2 rounded-xl bg-slate-900/60 border border-slate-850">
                    <span className="text-[9px] text-slate-500 block uppercase font-bold">Placa / Cor:</span>
                    <span className="text-slate-200 font-bold">M1-SERV • Vermelha</span>
                  </div>
                </div>
              </div>

              {/* Service Details Inside SPAM view */}
              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-850 space-y-3 text-left text-xs">
                <div className="border-b border-slate-900 pb-2 flex justify-between items-center">
                  <span className="font-extrabold text-amber-400 uppercase tracking-wider text-[10px]">DETALHES DO ATENDIMENTO</span>
                  <span className="font-mono text-slate-500 font-bold text-[10px]">#M1-9842</span>
                </div>
                <div className="space-y-1.5 leading-relaxed">
                  <p className="text-slate-200 font-bold">Troca de Disjuntor & Reparo de Curto Elétrico</p>
                  <p className="text-slate-400 text-[11px]">
                    Cliente relata faíscas saindo do quadro de energia principal e cheiro forte de queimado na residência. Técnico pré-alocado com kit completo de isolação e ferramentas M1.
                  </p>
                </div>
                <div className="pt-2 border-t border-slate-900 flex justify-between text-[11px] text-slate-400 font-bold">
                  <span>VALOR COMBINADO:</span>
                  <span className="text-emerald-400 text-xs">R$ 180,00</span>
                </div>
              </div>

              {/* Bottom Support Callout */}
              <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-850 flex items-center justify-between text-xs text-left">
                <div className="space-y-0.5">
                  <span className="text-[10px] text-slate-400 font-bold uppercase block">Suporte M1 Brasil</span>
                  <p className="text-slate-200 font-bold">Central de Ajuda 24h</p>
                </div>
                <button
                  onClick={() => alert('Ligando para a Central M1 no número (11) 4003-9621...')}
                  className="px-3.5 py-1.5 bg-slate-800 hover:bg-slate-750 text-amber-400 border border-slate-750 text-xs font-bold rounded-xl cursor-pointer"
                >
                  Ligar para Suporte
                </button>
              </div>

            </div>

            {/* Footer with Close Button */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 shrink-0">
              <button
                onClick={() => setShowSpamPreview(false)}
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black text-xs uppercase rounded-xl cursor-pointer"
              >
                Fechar Visualização
              </button>
            </div>

          </div>
        </div>
      )}
    </div>
  );
};
