import React, { useState } from 'react';
import { Bell, X, ShieldCheck, MessageSquare, ExternalLink, MessageCircle } from 'lucide-react';
import { ServiceRequest } from '../../types';

interface ClientNotificationCenterProps {
  client: any;
  notifications: any[];
  markAllNotificationsRead: () => void;
  dismissNotification: (id: string) => void;
  getWhatsAppLinkForClient: (service: ServiceRequest) => string;
  services: ServiceRequest[];
  settings: any;
}

export const ClientNotificationCenter: React.FC<ClientNotificationCenterProps> = ({
  client,
  notifications,
  markAllNotificationsRead,
  dismissNotification,
  getWhatsAppLinkForClient,
  services,
  settings
}) => {
  const clientNotifications = notifications.filter(n => 
    n.targetRole === 'client' && 
    (!n.clientId || n.clientId === client?.id) &&
    (!n.serviceId || services.some(s => s.id === n.serviceId && s.clientId === client?.id))
  );
  const unreadCount = clientNotifications.filter(n => !n.read).length;

  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const totalPages = Math.ceil(clientNotifications.length / itemsPerPage);
  const activePage = Math.min(currentPage, Math.max(1, totalPages));
  const paginatedNotifications = clientNotifications.slice((activePage - 1) * itemsPerPage, activePage * itemsPerPage);

  return (
    <div className="space-y-5">
      {/* Messages Header */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-2 flex-wrap gap-2">
        <h2 className="text-base sm:text-lg font-black text-white tracking-tight flex items-center gap-2">
          <MessageSquare className="w-5 h-5 text-red-500" />
          <span>Mensagens & Central de Avisos M1</span>
        </h2>
        {unreadCount > 0 && (
          <span className="px-2 py-0.5 rounded-full text-[9.5px] font-black uppercase bg-red-600 text-white animate-pulse">
            {unreadCount} Novas
          </span>
        )}
      </div>

      {/* Support WhatsApp Action Card */}
      <div className="p-5 rounded-2xl bg-slate-900 border border-slate-800 space-y-4 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-green-500/5 rounded-full blur-2xl pointer-events-none" />

        <div className="space-y-1.5">
          <span className="px-2.5 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider bg-green-500/10 text-green-400 border border-green-500/20 w-fit flex items-center gap-1">
            <ShieldCheck className="w-3.5 h-3.5 text-green-400" />
            Central de Comunicação Garantida
          </span>
          <h3 className="text-base font-black text-white leading-tight">Falar com o Suporte Oficial M1</h3>
          <p className="text-xs text-slate-400 font-sans leading-relaxed">
            Se precisar de suporte técnico emergencial, alteração de dados de cadastro, ou queira falar diretamente com o Administrador Rogerio sobre seu faturamento, clique no botão seguro de atendimento abaixo.
          </p>
        </div>

        <a
          href={`https://wa.me/55${(settings.supportWhatsapp || '11962122694').replace(/\D/g, '')}`}
          target="_blank"
          rel="noopener noreferrer"
          className="w-full py-3.5 bg-green-500 hover:bg-green-600 text-white font-black text-xs uppercase tracking-wider rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-lg shadow-green-500/20"
        >
          <MessageCircle className="w-5 h-5" />
          <span>Iniciar WhatsApp com a Central M1</span>
        </a>
      </div>

      {/* Central Notification Warnings & Logs */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 shadow-xl space-y-4">
        <div className="flex items-center justify-between border-b border-slate-800 pb-3 flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <div className="p-1.5 bg-red-500/10 rounded-xl text-red-400 border border-red-500/20">
              <Bell className="w-4.5 h-4.5" />
            </div>
            <div>
              <h4 className="text-xs font-black text-white uppercase tracking-wider">Avisos e Telemetria de Atendimento</h4>
              <p className="text-[9px] text-slate-500 font-medium font-sans">Atualizado em tempo real pelos Administradores M1</p>
            </div>
          </div>

          {unreadCount > 0 && (
            <button
              onClick={markAllNotificationsRead}
              className="px-2.5 py-1 bg-red-500/15 text-red-400 hover:bg-red-500 hover:text-slate-950 font-black text-[9px] uppercase tracking-wider rounded-lg transition-all border border-red-500/20 cursor-pointer"
            >
              ✓ Marcar como Lidos
            </button>
          )}
        </div>

        <div className="max-h-60 overflow-y-auto pr-1 space-y-2 scrollbar-thin">
          {clientNotifications.length === 0 ? (
            <div className="p-6 text-center text-slate-500 text-xs font-medium font-sans">
              Nenhum aviso ou mensagem recebida da Central de Operações no momento.
            </div>
          ) : (
            paginatedNotifications.map((item) => (
              <div
                key={item.id}
                className={`p-3.5 text-xs rounded-xl border flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 transition-all ${
                  item.read
                    ? 'bg-slate-950/40 border-slate-850 text-slate-400'
                    : 'bg-gradient-to-r from-red-950/20 to-slate-950 border-red-500/30 text-white font-medium shadow-md shadow-red-950/10'
                }`}
              >
                <div className="space-y-1 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className={`w-1.5 h-1.5 rounded-full ${item.read ? 'bg-slate-700' : 'bg-red-500 animate-ping'}`} />
                    <h5 className={`font-black uppercase tracking-wide text-[9px] ${item.read ? 'text-slate-400' : 'text-red-400'}`}>
                      {item.title}
                    </h5>
                    <span className="text-[9px] text-slate-500 font-mono font-bold bg-slate-950 px-1.5 py-0.5 rounded border border-slate-800">
                      {item.timestamp}
                    </span>
                  </div>
                  <p className="text-[11px] text-slate-300 leading-relaxed font-sans">{item.message}</p>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {item.serviceId && (() => {
                    const foundSrv = services.find(s => s.id === item.serviceId);
                    if (!foundSrv) return null;
                    return (
                      <a
                        href={getWhatsAppLinkForClient(foundSrv)}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="px-2.5 py-1 bg-green-500 hover:bg-green-600 text-white font-black text-[9px] uppercase tracking-wider rounded-lg transition-colors cursor-pointer flex items-center gap-1 shadow-sm"
                      >
                        <span>💬 WhatsApp</span>
                      </a>
                    );
                  })()}
                  <button
                    onClick={() => dismissNotification(item.id)}
                    className="p-1.5 hover:bg-slate-800 text-slate-500 hover:text-white rounded-lg transition-colors cursor-pointer border border-transparent hover:border-slate-800"
                    title="Dispensar aviso"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))
          )}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between pt-3 mt-3 border-t border-slate-800" id="client-notifications-pagination">
            <button
              type="button"
              disabled={activePage === 1}
              onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Anterior
            </button>
            <span className="text-[10px] font-semibold text-slate-400 font-mono">
              Página {activePage} de {totalPages}
            </span>
            <button
              type="button"
              disabled={activePage === totalPages}
              onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
              className="px-2.5 py-1.5 rounded-lg bg-slate-850 hover:bg-slate-800 text-[10px] font-bold text-slate-300 disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-colors"
            >
              Próximo
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
