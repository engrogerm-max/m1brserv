import React from 'react';
import { User, LogOut, MapPin, ShieldCheck, Mail, Phone, Calendar, Hash, FileText } from 'lucide-react';

interface ClientProfilePanelProps {
  client: any;
  logoutClient: () => void;
}

export const ClientProfilePanel: React.FC<ClientProfilePanelProps> = ({
  client,
  logoutClient
}) => {
  return (
    <div className="space-y-5">
      {/* Messages Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2">
        <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
          <User className="w-5 h-5 text-red-500" />
          <span>Meu Perfil M1 Credenciado</span>
        </h2>
      </div>

      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-6">
        
        {/* User Card */}
        <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
          <img
            src={client.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80'}
            alt={client.name}
            className="w-14 h-14 rounded-full object-cover border-2 border-red-500/30 shrink-0"
          />
          <div>
            <h3 className="text-base font-black text-white leading-tight">{client.name}</h3>
            <p className="text-xs text-slate-400 font-sans">{client.email}</p>
            <span className="inline-block px-2 py-0.5 mt-1 bg-red-600/10 text-red-400 border border-red-500/20 rounded text-[9px] font-black uppercase">
              Cliente Premium M1
            </span>
          </div>
        </div>

        {/* Detailed Stats & Data */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-sans">
          
          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[9.5px] font-black uppercase text-slate-500 block">CPF de Registro:</span>
            <div className="flex items-center gap-1.5 text-white">
              <Hash className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-mono font-bold">{client.cpf || '***.***.***-**'}</span>
            </div>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[9.5px] font-black uppercase text-slate-500 block">Celular / Telefone:</span>
            <div className="flex items-center gap-1.5 text-white">
              <Phone className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-bold">{client.phone || '(11) 98765-4321'}</span>
            </div>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[9.5px] font-black uppercase text-slate-500 block">Membro M1 Desde:</span>
            <div className="flex items-center gap-1.5 text-white">
              <Calendar className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-bold">{client.registeredAt || 'Janeiro, 2026'}</span>
            </div>
          </div>

          <div className="space-y-1.5 p-3.5 rounded-xl bg-slate-950/60 border border-slate-800/80">
            <span className="text-[9.5px] font-black uppercase text-slate-500 block">Chamados Solicitados:</span>
            <div className="flex items-center gap-1.5 text-white">
              <FileText className="w-4 h-4 text-slate-500 shrink-0" />
              <span className="font-bold">{client.totalRequests || 0} Atendimentos</span>
            </div>
          </div>

        </div>

        {/* Home Address Section */}
        <div className="p-4 bg-slate-950/40 rounded-xl border border-slate-800/60 space-y-2">
          <div className="flex items-center gap-1.5 text-[10px] font-black uppercase text-slate-400 border-b border-slate-900 pb-1.5">
            <MapPin className="w-4 h-4 text-red-500" />
            <span>Endereço Residencial Cadastrado</span>
          </div>

          {client.defaultAddress ? (
            <div className="text-xs text-slate-300 font-sans space-y-0.5">
              <p className="font-black text-white text-sm">{client.defaultAddress.street}, nº {client.defaultAddress.number}</p>
              <p>Bairro: {client.defaultAddress.neighborhood} | Complemento: {client.defaultAddress.complement || 'N/A'}</p>
              <p>{client.defaultAddress.city} - {client.defaultAddress.state || 'SP'} | CEP: {client.defaultAddress.zipCode || '01310-200'}</p>
            </div>
          ) : (
            <p className="text-xs text-slate-500 italic">Nenhum endereço residencial cadastrado.</p>
          )}
        </div>

        {/* Log Out Button */}
        <button
          onClick={logoutClient}
          className="w-full py-3 bg-red-600/10 hover:bg-red-600/20 text-red-400 hover:text-white border border-red-500/20 rounded-xl font-bold uppercase text-xs cursor-pointer flex items-center justify-center gap-2 transition-all shadow-sm"
        >
          <LogOut className="w-4.5 h-4.5" />
          <span>Desconectar e Sair da Conta</span>
        </button>

      </div>
    </div>
  );
};
