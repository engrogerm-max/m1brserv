import React, { useState, useMemo } from 'react';
import {
  ServiceRequest,
  ServiceCategory,
  ProviderProfile,
  ClientProfile
} from '../../types';
import {
  Archive,
  ArchiveRestore,
  Search,
  Filter,
  Calendar,
  FileText,
  Camera,
  Video,
  DollarSign,
  User,
  Wrench,
  CheckCircle2,
  Clock,
  Download,
  Eye,
  Tag,
  Layers,
  Sparkles,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  X,
  Trash2
} from 'lucide-react';
import { PhotoReportViewer } from '../PhotoReportViewer';

interface AdminArchiveDatabaseProps {
  services: ServiceRequest[];
  categories: ServiceCategory[];
  providers: ProviderProfile[];
  onToggleArchive: (serviceId: string, notes?: string) => void;
  onViewServiceDetails?: (service: ServiceRequest) => void;
  onClearOlderThan30Days?: () => void;
  onSimulateOldRecord?: () => void;
}

export const AdminArchiveDatabase: React.FC<AdminArchiveDatabaseProps> = ({
  services,
  categories,
  providers,
  onToggleArchive,
  onViewServiceDetails,
  onClearOlderThan30Days,
  onSimulateOldRecord
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [sortOrder, setSortOrder] = useState<'newest' | 'oldest'>('newest');
  const [selectedServiceForReport, setSelectedServiceForReport] = useState<ServiceRequest | null>(null);
  const [editingNotesId, setEditingNotesId] = useState<string | null>(null);
  const [notesInput, setNotesInput] = useState('');

  // 30-Day Cleanup Detection & Visual Alarm
  const servicesOlderThan30Days = useMemo(() => {
    const thirtyDaysAgo = Date.now() - 30 * 24 * 60 * 60 * 1000;
    return services.filter(srv => {
      const isHistorical = srv.status === 'concluido_pago' || srv.status === 'cancelado' || srv.isArchived;
      if (!isHistorical) return false;
      const targetEpoch = srv.archivedEpoch || srv.createdEpoch;
      if (targetEpoch) return targetEpoch < thirtyDaysAgo;
      if (srv.createdAt) {
        const parsed = Date.parse(srv.createdAt);
        if (!isNaN(parsed)) return parsed < thirtyDaysAgo;
      }
      return false;
    });
  }, [services]);

  // Filter archived services
  const archivedServices = useMemo(() => {
    return services.filter(s => s.isArchived);
  }, [services]);

  // Filter unarchived completed services eligible for archive
  const eligibleToArchive = useMemo(() => {
    return services.filter(s => !s.isArchived && (s.status === 'concluido_pago' || s.status === 'cancelado'));
  }, [services]);

  // Financial metrics
  const metrics = useMemo(() => {
    const totalCount = archivedServices.length;
    const totalValue = archivedServices.reduce((acc, s) => acc + (s.payment?.totalAmount || s.estimatedPrice || 0), 0);
    const totalPlatformFees = archivedServices.reduce((acc, s) => acc + (s.payment?.platformFeeAmount || 0), 0);
    const totalPayouts = archivedServices.reduce((acc, s) => acc + (s.payment?.providerPayoutAmount || 0), 0);
    return { totalCount, totalValue, totalPlatformFees, totalPayouts };
  }, [archivedServices]);

  // Filtered list
  const filteredList = useMemo(() => {
    return archivedServices
      .filter(s => {
        const matchesCat = selectedCategory === 'all' || s.category === selectedCategory;
        const q = searchTerm.toLowerCase().trim();
        const matchesSearch =
          !q ||
          (s.code || '').toLowerCase().includes(q) ||
          (s.title || '').toLowerCase().includes(q) ||
          (s.clientName || '').toLowerCase().includes(q) ||
          (s.providerName && (s.providerName || '').toLowerCase().includes(q)) ||
          (s.archivedNotes && (s.archivedNotes || '').toLowerCase().includes(q)) ||
          (s.photoReport?.notes && (s.photoReport.notes || '').toLowerCase().includes(q));

        return matchesCat && matchesSearch;
      })
      .sort((a, b) => {
        const timeA = a.archivedEpoch || (a.createdAt && !isNaN(Date.parse(a.createdAt)) ? new Date(a.createdAt).getTime() : 0);
        const timeB = b.archivedEpoch || (b.createdAt && !isNaN(Date.parse(b.createdAt)) ? new Date(b.createdAt).getTime() : 0);
        return sortOrder === 'newest' ? timeB - timeA : timeA - timeB;
      });
  }, [archivedServices, selectedCategory, searchTerm, sortOrder]);

  // Save notes
  const handleSaveNotes = (serviceId: string) => {
    onToggleArchive(serviceId, notesInput);
    // Note: onToggleArchive will toggle isArchived if called directly, so we pass current status or keep it archived
    setEditingNotesId(null);
  };

  // Export CSV
  const handleExportCSV = () => {
    if (archivedServices.length === 0) return;
    const headers = [
      'Código',
      'Data Criação',
      'Data Arquivamento',
      'Cliente',
      'Prestador',
      'Categoria',
      'Título',
      'Valor Total',
      'Repasse Prestador',
      'Taxa M1',
      'Status Final',
      'Notas Arquivo'
    ];

    const rows = archivedServices.map(s => [
      s.code,
      s.createdAt,
      s.archivedAt || '',
      `"${s.clientName.replace(/"/g, '""')}"`,
      `"${(s.providerName || '').replace(/"/g, '""')}"`,
      s.category,
      `"${s.title.replace(/"/g, '""')}"`,
      (s.payment?.totalAmount || s.estimatedPrice || 0).toFixed(2),
      (s.payment?.providerPayoutAmount || 0).toFixed(2),
      (s.payment?.platformFeeAmount || 0).toFixed(2),
      s.status,
      `"${(s.archivedNotes || '').replace(/"/g, '""')}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,\uFEFF' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `m1_arquivo_morto_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // Export individual Service Order / Technical Report as PDF (using hidden iframe to avoid popup-blockers)
  const handleExportPDF = (srv: ServiceRequest) => {
    const iframeId = 'pdf-print-iframe-' + srv.id;
    let iframe = document.getElementById(iframeId) as HTMLIFrameElement | null;
    if (iframe) {
      document.body.removeChild(iframe);
    }
    
    iframe = document.createElement('iframe') as HTMLIFrameElement;
    iframe.id = iframeId;
    iframe.style.position = 'fixed';
    iframe.style.right = '0';
    iframe.style.bottom = '0';
    iframe.style.width = '0';
    iframe.style.height = '0';
    iframe.style.border = '0';
    document.body.appendChild(iframe);

    const beforePhotosHtml = srv.photoReport?.beforePhotos?.map((img, i) => `
      <div style="flex: 1; min-width: 150px; max-width: 200px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin: 5px;">
        <p style="font-size: 9px; font-weight: bold; text-align: center; background-color: #f1f5f9; padding: 4px; margin: 0; text-transform: uppercase;">Antes #${i + 1}</p>
        <img src="${img.url}" style="width: 100%; height: 120px; object-fit: cover; display: block;" referrerpolicy="no-referrer" />
      </div>
    `).join('') || '<p style="font-size: 11px; color: #64748b; margin: 5px;">Nenhuma foto do "Antes" registrada.</p>';

    const afterPhotosHtml = srv.photoReport?.afterPhotos?.map((img, i) => `
      <div style="flex: 1; min-width: 150px; max-width: 200px; border: 1px solid #e2e8f0; border-radius: 8px; overflow: hidden; margin: 5px;">
        <p style="font-size: 9px; font-weight: bold; text-align: center; background-color: #ecfdf5; padding: 4px; margin: 0; text-transform: uppercase; color: #10b981;">Depois #${i + 1}</p>
        <img src="${img.url}" style="width: 100%; height: 120px; object-fit: cover; display: block;" referrerpolicy="no-referrer" />
      </div>
    `).join('') || '<p style="font-size: 11px; color: #64748b; margin: 5px;">Nenhuma foto do "Depois" registrada.</p>';

    const ratingScore = srv.rating?.score;
    const safeRatingScore = ratingScore ? Math.max(0, Math.min(5, Math.floor(Number(ratingScore) || 0))) : 0;
    const ratingStars = ratingScore ? '★'.repeat(safeRatingScore) + '☆'.repeat(5 - safeRatingScore) : 'Sem avaliação';

    const doc = iframe.contentWindow?.document || iframe.contentDocument;
    if (!doc) return;

    doc.write(`
      <!DOCTYPE html>
      <html lang="pt-BR">
      <head>
        <meta charset="UTF-8">
        <title>Laudo Técnico M1 - ${srv.code}</title>
        <style>
          @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@300;400;600;700;800&display=swap');
          body {
            font-family: 'Plus Jakarta Sans', sans-serif;
            color: #1e293b;
            background-color: #ffffff;
            margin: 0;
            padding: 20px;
            line-height: 1.4;
          }
          .header {
            display: flex;
            justify-content: space-between;
            align-items: center;
            border-bottom: 3px solid #f59e0b;
            padding-bottom: 15px;
            margin-bottom: 20px;
          }
          .logo-section h1 {
            font-weight: 800;
            font-size: 24px;
            margin: 0;
            color: #0f172a;
            letter-spacing: -0.5px;
          }
          .logo-section span {
            color: #f59e0b;
          }
          .logo-section p {
            font-size: 11px;
            color: #64748b;
            margin: 2px 0 0 0;
            text-transform: uppercase;
            font-weight: 600;
          }
          .doc-info {
            text-align: right;
          }
          .doc-info h2 {
            font-size: 16px;
            font-weight: 800;
            margin: 0;
            color: #f59e0b;
          }
          .doc-info p {
            font-size: 11px;
            color: #64748b;
            margin: 3px 0 0 0;
          }
          .badge {
            display: inline-block;
            font-size: 10px;
            font-weight: 800;
            background-color: #fef3c7;
            color: #d97706;
            padding: 3px 8px;
            border-radius: 4px;
            text-transform: uppercase;
            margin-top: 5px;
          }
          .grid {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 15px;
            margin-bottom: 20px;
          }
          .card {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px;
            background-color: #f8fafc;
          }
          .card-title {
            font-size: 10px;
            font-weight: 800;
            text-transform: uppercase;
            color: #64748b;
            border-bottom: 1px solid #e2e8f0;
            padding-bottom: 5px;
            margin-top: 0;
            margin-bottom: 8px;
            letter-spacing: 0.5px;
          }
          .card-content p {
            font-size: 11px;
            margin: 4px 0;
          }
          .card-content strong {
            color: #334155;
          }
          .full-card {
            border: 1px solid #e2e8f0;
            border-radius: 12px;
            padding: 12px;
            background-color: #ffffff;
            margin-bottom: 20px;
          }
          .photos-container {
            display: flex;
            flex-wrap: wrap;
            margin-top: 10px;
          }
          .section-title {
            font-size: 12px;
            font-weight: 800;
            text-transform: uppercase;
            color: #0f172a;
            margin-bottom: 10px;
            border-left: 3px solid #f59e0b;
            padding-left: 8px;
          }
          .footer {
            margin-top: 40px;
            border-top: 1px solid #e2e8f0;
            padding-top: 15px;
            display: flex;
            justify-content: space-between;
            font-size: 10px;
            color: #94a3b8;
          }
          .signatures {
            display: flex;
            justify-content: space-between;
            margin-top: 50px;
            padding: 0 20px;
          }
          .sig-box {
            text-align: center;
            width: 200px;
            border-top: 1px solid #cbd5e1;
            padding-top: 8px;
            font-size: 10px;
            color: #475569;
          }
          .warranty-badge {
            background-color: #ecfdf5;
            border: 1px solid #a7f3d0;
            border-radius: 8px;
            padding: 10px;
            margin-bottom: 20px;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          .warranty-badge-icon {
            font-size: 20px;
            color: #10b981;
          }
          .warranty-badge-text h4 {
            margin: 0;
            font-size: 11px;
            font-weight: 800;
            color: #065f46;
            text-transform: uppercase;
          }
          .warranty-badge-text p {
            margin: 2px 0 0 0;
            font-size: 10px;
            color: #047857;
          }
          @media print {
            body {
              padding: 0;
            }
          }
        </style>
      </head>
      <body>
        <div class="header">
          <div class="logo-section">
            <h1>M1 <span>BRASIL</span></h1>
            <p>Soluções Técnicas & Gestão de Atendimentos</p>
          </div>
          <div class="doc-info">
            <h2>ORDEM DE SERVIÇO & LAUDO TÉCNICO</h2>
            <p><strong>Número:</strong> ${srv.code}</p>
            <p><strong>Emissão:</strong> ${srv.createdAt}</p>
            <span class="badge">CONCLUÍDO</span>
          </div>
        </div>

        <div class="warranty-badge">
          <div class="warranty-badge-icon">🛡️</div>
          <div class="warranty-badge-text">
            <h4>Garantia Técnica Formal M1 de 90 Dias Ativada</h4>
            <p>Este atendimento possui garantia oficial de 3 meses para mão de obra e serviços executados contra qualquer vício de funcionamento ou refazimento do reparo, com vigência iniciada em ${srv.completedAt || srv.createdAt}.</p>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h3 class="card-title">1. Dados do Cliente</h3>
            <div class="card-content">
              <p><strong>Nome:</strong> ${srv.clientName}</p>
              <p><strong>Telefone:</strong> ${srv.clientPhone}</p>
              <p><strong>Endereço:</strong> ${srv.address.street}, ${srv.address.number} - ${srv.address.neighborhood}</p>
              <p><strong>Cidade/UF:</strong> ${srv.address.city} - ${srv.address.state} | CEP: ${srv.address.zipCode}</p>
              <p><strong>Coordenadas GPS:</strong> Lat: ${srv.address.lat || '-23.5616'}, Lng: ${srv.address.lng || '-46.6559'}</p>
            </div>
          </div>

          <div class="card">
            <h3 class="card-title">2. Profissional Executor</h3>
            <div class="card-content">
              <p><strong>Técnico Credenciado:</strong> ${srv.providerName || 'Nenhum'}</p>
              <p><strong>Telefone Técnico:</strong> ${srv.providerPhone || '-'}</p>
              <p><strong>Veículo:</strong> ${srv.providerVehicle || '-'}</p>
              <p><strong>Placa do Veículo:</strong> ${srv.providerPlate || '-'}</p>
              <p><strong>Avaliação do Cliente:</strong> <span style="color: #f59e0b; font-weight: bold;">${ratingStars}</span></p>
            </div>
          </div>
        </div>

        <div class="grid">
          <div class="card">
            <h3 class="card-title">3. Descrição do Chamado</h3>
            <div class="card-content">
              <p><strong>Título:</strong> ${srv.title}</p>
              <p><strong>Categoria:</strong> ${srv.category.toUpperCase()}</p>
              <p><strong>Descrição Original:</strong> ${srv.description}</p>
              <p><strong>Abertura:</strong> ${srv.createdAt}</p>
              <p><strong>Finalização:</strong> ${srv.completedAt || '-'}</p>
            </div>
          </div>

          <div class="card">
            <h3 class="card-title">4. Detalhamento Financeiro</h3>
            <div class="card-content">
              <p><strong>Valor Total do Serviço:</strong> <strong style="color: #059669; font-size: 13px;">R$ ${(srv.payment?.totalAmount || srv.estimatedPrice || 0).toFixed(2)}</strong></p>
              <p><strong>Repasse Líquido Técnico (85%):</strong> R$ ${(srv.payment?.providerPayoutAmount || 0).toFixed(2)}</p>
              <p><strong>Taxa Administrativa M1 (15%):</strong> R$ ${(srv.payment?.platformFeeAmount || 0).toFixed(2)}</p>
              <p><strong>Forma de Pagamento:</strong> ${srv.payment?.clientPaymentMethod === 'pix' ? 'Pix (Transferência Direta)' : srv.payment?.clientPaymentMethod === 'dinheiro' ? 'Dinheiro' : srv.payment?.clientPaymentMethod === 'cartao' ? 'Cartão' : 'Pix'}</p>
              <p><strong>Status de Pagamento:</strong> <span style="color: #059669; font-weight: bold;">COMPROVADO E HOMOLOGADO</span></p>
            </div>
          </div>
        </div>

        <div class="full-card">
          <h3 class="card-title">5. Laudo Fotográfico Comprobatório (Antes & Depois)</h3>
          <div style="display: flex; flex-direction: column; gap: 15px;">
            <div>
              <h4 class="section-title">Evidências do Estado Inicial (Antes do Reparo)</h4>
              <div style="display: flex; flex-wrap: wrap;">
                ${beforePhotosHtml}
              </div>
            </div>
            <div style="margin-top: 15px;">
              <h4 class="section-title">Evidências do Trabalho Executado (Conclusão)</h4>
              <div style="display: flex; flex-wrap: wrap;">
                ${afterPhotosHtml}
              </div>
            </div>
          </div>
        </div>

        <div class="full-card">
          <h3 class="card-title">6. Parecer Técnico & Orientações do Especialista</h3>
          <div class="card-content">
            <p><strong>Materiais e Ferramentas Utilizados:</strong> ${srv.photoReport?.materialsUsed || 'Não especificados.'}</p>
            <p><strong>Parecer/Notas Finais do Técnico:</strong> ${srv.photoReport?.notes || 'Nenhuma nota declarada.'}</p>
            <p><strong>Orientações de Segurança & Recomendações Futuras:</strong> ${srv.photoReport?.futureRecommendations || 'O equipamento/instalação encontra-se em perfeito estado e pronto para uso.'}</p>
          </div>
        </div>

        <div class="signatures">
          <div class="sig-box">
            <p style="margin-bottom: 30px;"></p>
            <strong>${srv.clientName}</strong>
            <p>Assinatura Digital (Cliente)</p>
          </div>
          <div class="sig-box">
            <p style="margin-bottom: 30px;"></p>
            <strong>${srv.providerName || 'Especialista Credenciado'}</strong>
            <p>Assinatura Digital (Técnico)</p>
          </div>
          <div class="sig-box">
            <p style="margin-bottom: 30px;"></p>
            <strong>Central M1 Brasil</strong>
            <p>Chancela de Homologação</p>
          </div>
        </div>

        <div class="footer">
          <p>M1 Brasil Serviços de Manutenção • CNPJ: 45.123.456/0001-99 • São Paulo, SP</p>
          <p>Este laudo técnico foi homologado digitalmente de acordo com as normas de auditoria M1 Brasil.</p>
        </div>
      </body>
      </html>
    `);
    doc.close();

    setTimeout(() => {
      if (iframe && iframe.contentWindow) {
        iframe.contentWindow.focus();
        iframe.contentWindow.print();
      }
    }, 500);
  };

  // Archive all eligible completed services
  const handleArchiveAllEligible = () => {
    if (eligibleToArchive.length === 0) return;
    if (window.confirm(`Deseja mover todos os ${eligibleToArchive.length} chamados concluídos/pagos para o Arquivo Morto?`)) {
      eligibleToArchive.forEach(s => {
        onToggleArchive(s.id, 'Arquivamento em lote de serviços concluídos');
      });
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-200">
      
      {/* 🚨 ALARME VISUAL DE ALERTA DE LIMPEZA DOS ÚLTIMOS 30 DIAS NA PASTA ARQUIVO */}
      {servicesOlderThan30Days.length > 0 && (
        <div 
          className="bg-gradient-to-r from-amber-950/90 via-slate-900 to-rose-950/90 border-2 border-amber-500 rounded-3xl p-5 shadow-[0_0_35px_rgba(245,158,11,0.3)] animate-pulse flex flex-col md:flex-row items-center justify-between gap-4"
          id="archive-30days-cleanup-alarm"
        >
          <div className="flex items-center gap-4 text-center md:text-left flex-col md:flex-row">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/50 flex items-center justify-center text-amber-400 shrink-0 shadow-lg">
              <Clock className="w-6 h-6 stroke-[2.5]" />
            </div>
            <div className="space-y-1">
              <div className="flex items-center justify-center md:justify-start gap-2 flex-wrap">
                <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-ping shrink-0" />
                <h4 className="text-sm font-black text-white uppercase tracking-wider">
                  🚨 ALERTA DE LIMPEZA PERIÓDICA • REGISTROS DE MAIS DE 30 DIAS
                </h4>
                <span className="bg-amber-500 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded font-mono">
                  {servicesOlderThan30Days.length} {servicesOlderThan30Days.length === 1 ? 'REGISTRO ANTIGO' : 'REGISTROS ANTIGOS'}
                </span>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed max-w-2xl">
                O histórico contém atendimentos com mais de 30 dias. Para manter o banco leve, rápido e em conformidade, execute a limpeza periódica do histórico de clientes e prestadores.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
            {onClearOlderThan30Days && (
              <button
                type="button"
                onClick={onClearOlderThan30Days}
                className="w-full md:w-auto px-5 py-3 bg-gradient-to-r from-amber-500 to-rose-600 hover:from-amber-400 hover:to-rose-500 text-slate-950 font-black text-xs uppercase tracking-widest rounded-xl shadow-lg cursor-pointer transition-all flex items-center justify-center gap-2 shrink-0 border border-amber-300/40"
              >
                <Trash2 className="w-4 h-4 text-slate-950" />
                <span>Limpar Histórico dos Últimos 30 Dias</span>
              </button>
            )}
          </div>
        </div>
      )}

      {/* HEADER & OVERVIEW BANNER */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 sm:p-6 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
              <Archive className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 text-[10px] font-black uppercase tracking-wider border border-amber-500/30">
                  Banco de Dados Histórico
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {archivedServices.length} atividades arquivadas
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-0.5">
                🗄️ Pasta Arquivo Morto & Atividades Executadas
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Repositório seguro de consultas históricas, laudos fotográficos, vídeos e comprovações técnicas antigas.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {eligibleToArchive.length > 0 && (
              <button
                onClick={handleArchiveAllEligible}
                className="px-4 py-2.5 bg-slate-800 hover:bg-slate-750 text-amber-300 border border-amber-500/30 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer"
                title="Mover chamados concluídos para o arquivo"
              >
                <Archive className="w-4 h-4" />
                <span>Arquivar Concluídos ({eligibleToArchive.length})</span>
              </button>
            )}

            <button
              onClick={handleExportCSV}
              disabled={archivedServices.length === 0}
              className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-slate-950 font-black rounded-xl text-xs flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-emerald-600/20"
            >
              <Download className="w-4 h-4" />
              <span>Exportar CSV</span>
            </button>
          </div>
        </div>

        {/* FINANCIAL SUMMARY OF ARCHIVE */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Atividades Arquivadas
            </span>
            <div className="text-xl font-black text-white font-mono mt-1">
              {metrics.totalCount}
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Volume Financeiro Arquivado
            </span>
            <div className="text-xl font-black text-emerald-400 font-mono mt-1">
              R$ {metrics.totalValue.toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Repasses Prestadores (85%)
            </span>
            <div className="text-xl font-black text-cyan-400 font-mono mt-1">
              R$ {metrics.totalPayouts.toFixed(2)}
            </div>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-2xl border border-slate-850">
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">
              Receita Plataforma M1 (15%)
            </span>
            <div className="text-xl font-black text-amber-400 font-mono mt-1">
              R$ {metrics.totalPlatformFees.toFixed(2)}
            </div>
          </div>
        </div>
      </div>

      {/* FILTER & SEARCH BAR */}
      <div className="bg-slate-900 border border-slate-800 rounded-2xl p-4 shadow-lg flex flex-col md:flex-row items-center justify-between gap-3">
        <div className="relative w-full md:w-96">
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Pesquisar por chamado, cliente, técnico, laudo ou notas..."
            className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2.5 text-xs text-white placeholder-slate-500 outline-none focus:border-amber-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <select
            value={selectedCategory}
            onChange={(e) => setSelectedCategory(e.target.value)}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="all">Todas as Categorias</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>

          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as 'newest' | 'oldest')}
            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 outline-none cursor-pointer"
          >
            <option value="newest">Mais Recentes Primeiro</option>
            <option value="oldest">Mais Antigos Primeiro</option>
          </select>
        </div>
      </div>

      {/* ARCHIVE RECORDS LIST */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl shadow-xl overflow-hidden">
        {filteredList.length === 0 ? (
          <div className="p-12 text-center space-y-3">
            <Archive className="w-12 h-12 text-slate-600 mx-auto" />
            <h3 className="text-base font-black text-slate-300">
              Nenhuma atividade encontrada no Arquivo Morto
            </h3>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              {searchTerm || selectedCategory !== 'all'
                ? 'Nenhum registro coincide com os filtros aplicados. Tente limpar a busca.'
                : 'Quando uma atividade for concluída e arquivada, ela aparecerá permanentemente armazenada nesta pasta de consulta segura.'}
            </p>
          </div>
        ) : (
          <div className="divide-y divide-slate-800">
            {filteredList.map((srv) => {
              const hasReport = Boolean(srv.photoReport);
              const photosCount = (srv.photoReport?.beforePhotos?.length || 0) + (srv.photoReport?.afterPhotos?.length || 0);
              const hasVideo = Boolean(srv.photoReport?.videoUrl);

              return (
                <div key={srv.id} className="p-4 sm:p-5 hover:bg-slate-850/50 transition-colors space-y-3">
                  {/* Top Row */}
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-mono text-xs font-black text-amber-400 px-2 py-0.5 rounded-full bg-amber-500/10 border border-amber-500/30">
                        {srv.code}
                      </span>
                      <span className="text-[10px] px-2 py-0.5 rounded-md bg-slate-800 text-slate-300 font-bold uppercase tracking-wider">
                        {srv.category}
                      </span>
                      <span className="text-xs font-black text-white">
                        {srv.title}
                      </span>
                    </div>

                    <div className="flex items-center gap-2">
                      <span className="text-[11px] text-slate-400 flex items-center gap-1 font-mono">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />
                        Arquivado em: {srv.archivedAt ? new Date(srv.archivedAt).toLocaleDateString('pt-BR') : srv.createdAt}
                      </span>

                      <button
                        onClick={() => handleExportPDF(srv)}
                        className="px-2.5 py-1 text-[11px] font-bold text-white bg-red-600 hover:bg-red-500 rounded-lg flex items-center gap-1 transition-colors cursor-pointer shadow-md shadow-red-600/20"
                        title="Gerar Ordem de Serviço em PDF para baixar no PC"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Baixar PDF</span>
                      </button>

                      <button
                        onClick={() => onToggleArchive(srv.id)}
                        className="px-2.5 py-1 text-[11px] font-bold text-slate-300 hover:text-white bg-slate-850 hover:bg-slate-800 border border-slate-700 rounded-lg flex items-center gap-1 transition-colors cursor-pointer"
                        title="Restaurar chamado para a lista ativa de Chamados"
                      >
                        <ArchiveRestore className="w-3.5 h-3.5 text-cyan-400" />
                        <span>Desarquivar</span>
                      </button>
                    </div>
                  </div>

                  {/* Details Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-slate-950 p-3 rounded-2xl border border-slate-850 text-xs">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Cliente
                      </span>
                      <p className="font-bold text-white mt-0.5">{srv.clientName}</p>
                      <p className="text-[11px] text-slate-400">{srv.clientPhone}</p>
                      <p className="text-[11px] text-slate-500 truncate">
                        {srv.address.street}, {srv.address.number} - {srv.address.neighborhood}
                      </p>
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Prestador Responsável
                      </span>
                      <p className="font-bold text-white mt-0.5">{srv.providerName || 'Nenhum vinculado'}</p>
                      <p className="text-[11px] text-slate-400">
                        Status Final: <strong className="text-emerald-400 font-mono">{(srv.status || '').replace('_', ' ').toUpperCase()}</strong>
                      </p>
                      {srv.rating && (() => {
                        const score = typeof srv.rating === 'object' ? srv.rating.score : srv.rating;
                        const safeScore = Math.max(0, Math.min(5, Math.floor(Number(score) || 0)));
                        return (
                          <p className="text-[11px] text-amber-400 font-bold">
                            Avaliação: {'★'.repeat(safeScore)}{'☆'.repeat(5 - safeScore)} ({score}/5)
                          </p>
                        );
                      })()}
                    </div>

                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider block">
                        Valores & Pagamento
                      </span>
                      <div className="font-mono text-emerald-400 font-black mt-0.5">
                        Total: R$ {(srv.payment?.totalAmount || srv.estimatedPrice || 0).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-400 font-mono">
                        Repasse Técnico: R$ {(srv.payment?.providerPayoutAmount || 0).toFixed(2)}
                      </div>
                      <div className="text-[11px] text-slate-500 font-mono">
                        Taxa M1 Brasil: R$ {(srv.payment?.platformFeeAmount || 0).toFixed(2)}
                      </div>
                    </div>
                  </div>

                  {/* Report summary & Orientations badge */}
                  {srv.photoReport && (
                    <div className="bg-slate-900/90 border border-slate-800 p-3 rounded-xl space-y-2">
                      <div className="flex flex-wrap items-center justify-between gap-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-emerald-400" />
                          <span className="text-xs font-bold text-slate-200">
                            Laudo Técnico Arquivado:
                          </span>
                          {photosCount > 0 && (
                            <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 text-[10px] font-mono border border-emerald-500/20">
                              📷 {photosCount} fotos
                            </span>
                          )}
                          {hasVideo && (
                            <span className="px-2 py-0.5 rounded bg-blue-500/10 text-blue-300 text-[10px] font-mono border border-blue-500/20">
                              🎥 Vídeo anexo
                            </span>
                          )}
                          {srv.photoReport.futureRecommendations && (
                            <span className="px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 text-[10px] font-bold border border-amber-500/20">
                              💡 Orientações Futuras incluídas
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleExportPDF(srv)}
                            className="px-3 py-1 bg-red-600 hover:bg-red-500 text-white font-black text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer shadow-md shadow-red-600/20"
                            title="Gerar e baixar PDF oficial da Ordem de Serviço"
                          >
                            <FileText className="w-3.5 h-3.5" />
                            <span>Gerar PDF</span>
                          </button>

                          <button
                            onClick={() => setSelectedServiceForReport(srv)}
                            className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-black text-xs rounded-lg flex items-center gap-1.5 transition-colors cursor-pointer"
                          >
                            <Eye className="w-3.5 h-3.5" />
                            <span>Abrir Relatório Completo</span>
                          </button>
                        </div>
                      </div>

                      {srv.photoReport.notes && (
                        <p className="text-xs text-slate-400 italic line-clamp-2">
                          "{srv.photoReport.notes}"
                        </p>
                      )}

                      {srv.photoReport.materialsUsed && (
                        <p className="text-[11px] text-slate-500">
                          <strong className="text-slate-400">Materiais:</strong> {srv.photoReport.materialsUsed}
                        </p>
                      )}
                    </div>
                  )}

                  {/* Archival Note */}
                  <div className="flex items-center justify-between text-xs text-slate-400 bg-slate-950/60 p-2.5 rounded-xl border border-slate-850">
                    <div className="flex items-center gap-2">
                      <Archive className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span>
                        <strong className="text-slate-300">Nota de Arquivamento:</strong>{' '}
                        {srv.archivedNotes || 'Atividade concluída e preservada no banco histórico.'}
                      </span>
                    </div>

                    <span className="text-[10px] text-slate-500 font-mono">
                      {srv.archivedBy || 'Admin Central M1'}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* MODAL: PHOTO REPORT VIEWER */}
      {selectedServiceForReport && selectedServiceForReport.photoReport && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex items-center justify-center p-3 sm:p-5 overflow-y-auto">
          <div className="bg-slate-950 border-2 border-slate-800 rounded-3xl max-w-4xl w-full p-4 sm:p-6 shadow-2xl space-y-4 my-auto relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div>
                <span className="text-xs text-amber-400 font-mono font-bold">
                  Chamado Arquivado #{selectedServiceForReport.code}
                </span>
                <h3 className="text-base sm:text-lg font-black text-white">
                  Laudo Técnico & Registros Comprobatórios da Atividade
                </h3>
              </div>
              <button
                onClick={() => setSelectedServiceForReport(null)}
                className="p-2 text-slate-400 hover:text-white bg-slate-900 border border-slate-800 rounded-xl cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[75vh] overflow-y-auto pr-1">
              <PhotoReportViewer
                report={selectedServiceForReport.photoReport}
                serviceCode={selectedServiceForReport.code}
                serviceTitle={selectedServiceForReport.title}
                isApprovalMode={false}
              />
            </div>

            <div className="border-t border-slate-800 pt-3 flex justify-end">
              <button
                onClick={() => setSelectedServiceForReport(null)}
                className="px-5 py-2 bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs rounded-xl border border-slate-800 cursor-pointer"
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
