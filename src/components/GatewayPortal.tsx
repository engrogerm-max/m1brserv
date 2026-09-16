import React from 'react';
import { useApp } from '../context/AppContext';
import { M1Logo } from './M1Logo';
import { User, Wrench, Sparkles, Smartphone, CheckCircle, ArrowRight, ShieldCheck, HeartHandshake, FileText, BadgePercent } from 'lucide-react';

export const GatewayPortal: React.FC = () => {
  const { setCurrentRole, settings } = useApp();

  return (
    <div className="min-h-[85vh] flex flex-col items-center justify-center px-4 py-8 relative" id="gateway-portal">
      {/* Background Decorative Glows */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-80 h-80 bg-red-600/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/3 w-72 h-72 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* Center Header */}
      <div className="text-center max-w-2xl mx-auto space-y-4 mb-10 z-10 animate-fade-in">
        <div className="flex justify-center mb-2">
          <div className="p-2.5 rounded-3xl bg-slate-900/80 border border-slate-800 shadow-xl inline-block transform hover:scale-105 transition-transform">
            {settings.mainLogoUrl ? (
              <img src={settings.mainLogoUrl} alt="Logo" className="w-16 h-16 sm:w-20 sm:h-20 object-contain rounded-2xl" referrerPolicy="no-referrer" />
            ) : (
              <M1Logo size="xl" showGlow={true} className="w-16 h-16 sm:w-20 sm:h-20" />
            )}
          </div>
        </div>

        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-500/10 text-red-400 border border-red-500/20">
          <Sparkles className="w-3.5 h-3.5 animate-pulse" />
          <span>Plataforma Oficial M1 SERV</span>
        </span>

        <h2 className="text-3xl sm:text-4xl md:text-5xl font-extrabold text-white tracking-tight leading-none" style={{ fontFamily: "'Black Ops One', cursive" }}>
          {settings.companyName || 'M1 SERV'}
        </h2>

        <p className="text-sm text-slate-400 font-sans max-w-md mx-auto leading-relaxed">
          Sua solução completa de tecnologia para atendimento técnico residencial, comercial e industrial sob demanda. Selecione como deseja acessar abaixo:
        </p>
      </div>

      {/* Two Choice Column Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 w-full max-w-4xl z-10 animate-slide-up">
        
        {/* CLIENT CARD */}
        <div 
          onClick={() => setCurrentRole('client')}
          className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-red-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between overflow-hidden"
          id="gateway-client-card"
        >
          {/* Subtle overlay hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-red-600/0 via-red-600/0 to-red-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          
          <div className="space-y-5 relative z-10">
            {/* Badge & Icon Row */}
            <div className="flex items-center justify-between">
              <div className="p-4 rounded-2xl bg-red-600/10 border border-red-500/20 text-red-500 group-hover:bg-red-600 group-hover:text-white transition-all duration-300 shadow-lg">
                <User className="w-8 h-8 stroke-[2]" />
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-red-600/10 text-red-400 border border-red-500/20">
                PÚBLICO GERAL
              </span>
            </div>

            {/* Title & Body */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-red-400 transition-colors">
                Sou Cliente
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Preciso solicitar um serviço de manutenção, instalação ou reparo residencial imediato ou com agendamento direto na minha localização.
              </p>
            </div>

            {/* List of features */}
            <ul className="space-y-2 py-2 text-[11px] text-slate-300 font-sans border-t border-slate-800/60">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Cadastro ultra rápido via celular/WhatsApp</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Localização GPS precisa com rastreamento</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Negociação de propostas em tempo real</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Pagamento 100% seguro via Pix</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-800/40 relative z-10">
            <button className="w-full py-3.5 bg-red-600 group-hover:bg-red-500 text-white font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-red-600/10 group-hover:shadow-red-500/25 transition-all flex items-center justify-center gap-2">
              <span>Acessar / Cadastrar como Cliente</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

        {/* PROVIDER CARD */}
        <div 
          onClick={() => setCurrentRole('provider')}
          className="group relative bg-slate-900/90 hover:bg-slate-900 border border-slate-800 hover:border-emerald-500/40 rounded-3xl p-6 sm:p-8 shadow-2xl transition-all duration-300 transform hover:-translate-y-1.5 cursor-pointer flex flex-col justify-between overflow-hidden"
          id="gateway-provider-card"
        >
          {/* Subtle overlay hover gradient */}
          <div className="absolute inset-0 bg-gradient-to-br from-emerald-600/0 via-emerald-600/0 to-emerald-600/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          <div className="space-y-5 relative z-10">
            {/* Badge & Icon Row */}
            <div className="flex items-center justify-between">
              <div className="p-4 rounded-2xl bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 group-hover:bg-emerald-500 group-hover:text-slate-950 transition-all duration-300 shadow-lg">
                <Wrench className="w-8 h-8 stroke-[2]" />
              </div>
              <span className="px-2.5 py-0.5 rounded text-[10px] font-black uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                CREDENCIAMENTO
              </span>
            </div>

            {/* Title & Body */}
            <div className="space-y-2">
              <h3 className="text-xl sm:text-2xl font-black text-white group-hover:text-emerald-400 transition-colors">
                Sou Prestador de Serviço
              </h3>
              <p className="text-xs text-slate-400 leading-relaxed font-sans">
                Quero receber ordens de serviço diretas na minha região, trabalhar de forma flexível e receber repasses Pix garantidos com suporte 24h.
              </p>
            </div>

            {/* List of features */}
            <ul className="space-y-2 py-2 text-[11px] text-slate-300 font-sans border-t border-slate-800/60">
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Cadastro e upload de documentos seguro</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Painel completo de faturamento & saques</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Radar inteligente de serviços na sua cidade</span>
              </li>
              <li className="flex items-center gap-2">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span>Homologação profissional pelo Administrador</span>
              </li>
            </ul>
          </div>

          <div className="pt-6 mt-4 border-t border-slate-800/40 relative z-10">
            <button className="w-full py-3.5 bg-emerald-500 group-hover:bg-emerald-450 text-slate-950 font-black rounded-xl text-xs uppercase tracking-widest shadow-lg shadow-emerald-500/10 group-hover:shadow-emerald-450/25 transition-all flex items-center justify-center gap-2">
              <span>Acessar / Cadastrar como Prestador</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </button>
          </div>
        </div>

      </div>

      {/* General Support & Information Bar */}
      <div className="mt-12 text-center space-y-1.5 z-10 max-w-sm font-sans text-[11px] text-slate-400 p-4 bg-slate-950/40 rounded-2xl border border-slate-850">
        <p className="font-semibold text-slate-300 uppercase tracking-wider">📞 Suporte Técnico M1 SERV</p>
        <p>Precisa de auxílio para acessar seu cadastro ou registrar-se?</p>
        <p className="text-red-400 font-extrabold mt-1">Central de Atendimento: {settings.supportWhatsapp || '(11)96212-2694'}</p>
        <div className="pt-2 border-t border-slate-800/60 mt-1.5">
          <button
            onClick={() => setCurrentRole('admin')}
            className="text-[10px] font-bold text-slate-500 hover:text-red-400 transition-colors uppercase tracking-widest flex items-center justify-center gap-1.5 mx-auto cursor-pointer"
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Painel Administrativo M1</span>
          </button>
        </div>
      </div>
    </div>
  );
};
