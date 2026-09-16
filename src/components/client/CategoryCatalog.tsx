import React, { useState, useMemo } from 'react';
import { CategoryInfo, ServiceCategory, ServiceRequest } from '../../types';
import { ShieldCheck, MapPin, Zap, ChevronRight, Search } from 'lucide-react';
import * as LucideIcons from 'lucide-react';

interface CategoryCatalogProps {
  categories: CategoryInfo[];
  activeService: ServiceRequest | undefined;
  onSelectCategory: (catId: ServiceCategory) => void;
  onViewActiveService: () => void;
  settings: any;
  client: any;
  isActivatingGps: boolean;
  onActivateGps: () => void;
}

// Seções e categorias correspondentes para filtro facilitado
const SECTIONS = [
  { id: 'todos', name: 'Todos' },
  { id: 'reparos', name: 'Manutenção e Reparos' },
  { id: 'estetica', name: 'Estética e Limpeza' },
  { id: 'externa', name: 'Áreas Externas' },
  { id: 'laudos', name: 'Engenharia e Laudos' },
  { id: 'seguranca', name: 'Tecnologia e Segurança' },
  { id: 'construcao', name: 'Construção e Acabamento' },
  { id: 'especializadas', name: 'Especializadas' }
];

const CATEGORY_SECTION_MAP: Record<string, string> = {
  marido_de_aluguel: 'reparos',
  eletricista_residencial: 'reparos',
  encanador_hidraulico: 'reparos',
  carpintaria_reparos: 'reparos',
  pintor_residencial: 'estetica',
  faxina_limpeza: 'estetica',
  higienizacao_estofados: 'estetica',
  limpeza_pos_obra: 'estetica',
  jardinagem_paisagismo: 'externa',
  chaveiro_24h: 'externa',
  socorro_mecanico: 'externa',
  laudos_mecanica: 'laudos',
  seguranca_trabalho: 'laudos',
  projetos_mecanicos: 'laudos',
  cftv_alarmes: 'seguranca',
  automacao_smarthome: 'seguranca',
  tecnico_informatica: 'seguranca',
  pedreiro_reformas: 'construcao',
  gesseiro_drywall: 'construcao',
  vidraceiro: 'construcao',
  serralheria: 'construcao',
  manutencao_eletrodomesticos: 'especializadas',
  redes_protecao: 'especializadas',
  desentupidora_pesada: 'especializadas'
};

export const CategoryCatalog: React.FC<CategoryCatalogProps> = ({
  categories,
  activeService,
  onSelectCategory,
  onViewActiveService,
  settings,
  client,
  isActivatingGps,
  onActivateGps
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [activeSection, setActiveSection] = useState('todos');

  // Filtra as categorias de forma inteligente com memoização
  const filteredCategories = useMemo(() => {
    // Garante que usamos a lista com todas as 24 categorias vindas do estado
    return categories.filter((cat) => {
      const section = CATEGORY_SECTION_MAP[cat.id] || 'reparos';
      const matchesSection = activeSection === 'todos' || section === activeSection;
      const matchesSearch = cat.name.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesSection && matchesSearch;
    });
  }, [categories, activeSection, searchTerm]);

  return (
    <div className="space-y-6">
      {/* Visual Header Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-red-600/10 rounded-full blur-2xl pointer-events-none" />
        
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="space-y-1.5">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider bg-red-600/15 text-red-400 border border-red-500/30 flex items-center gap-1 w-fit">
              <ShieldCheck className="w-3.5 h-3.5 text-red-500" />
              {settings.clientBannerMessage || 'Garantia Total M1'}
            </span>
            <h1 className="text-xl sm:text-2xl font-black text-white tracking-tight">
              Olá, {client.name}!
            </h1>
            <p className="text-xs text-slate-400 max-w-xl font-sans">
              Selecione o serviço desejado abaixo. Todos os profissionais passam por triagem rigorosa com garantia contratual da Central M1.
            </p>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {client.isLocationConfirmed ? (
              <span className="px-3 py-1.5 rounded-xl text-[11px] font-bold text-emerald-400 bg-emerald-950/40 border border-emerald-500/20 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5" />
                GPS Confirmado
              </span>
            ) : (
              <button
                type="button"
                onClick={onActivateGps}
                disabled={isActivatingGps}
                className="px-3 py-1.5 rounded-xl text-[11px] font-black uppercase tracking-wider bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 animate-pulse cursor-pointer"
              >
                <MapPin className="w-3.5 h-3.5" />
                Ativar GPS
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Floating Active Service Tracker */}
      {activeService && (
        <div 
          onClick={onViewActiveService}
          className="p-4 bg-gradient-to-r from-red-950/30 to-slate-900 border-2 border-red-500/30 rounded-2xl cursor-pointer hover:border-red-500/50 transition-all flex items-center justify-between gap-3 shadow-lg hover:shadow-red-900/10 group"
        >
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-500/20 text-red-400 rounded-xl group-hover:scale-110 transition-transform">
              <Zap className="w-5 h-5 animate-pulse text-red-500" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[9px] font-black bg-red-500/20 text-red-400 px-1.5 py-0.5 rounded uppercase tracking-wider">Ativo</span>
                <span className="text-[10px] font-mono text-slate-500 font-bold">{activeService.code}</span>
              </div>
              <p className="text-sm font-bold text-white mt-0.5">{activeService.title}</p>
              <p className="text-[11px] text-slate-400">Toque aqui para acompanhar o profissional ou realizar o pagamento.</p>
            </div>
          </div>
          <ChevronRight className="w-5 h-5 text-red-400 shrink-0 group-hover:translate-x-1 transition-transform" />
        </div>
      )}

      {/* Control Filter Bar */}
      <div className="space-y-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-3">
          <div>
            <h2 className="text-base sm:text-lg font-black text-white tracking-tight">
              Selecione a Especialidade Desejada
            </h2>
            <p className="text-xs text-slate-400 font-sans mt-0.5">
              Tabela de preços de saída fixos. Valores finais aprovados em comum acordo via app.
            </p>
          </div>

          {/* Search Bar */}
          <div className="relative w-full md:w-64">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Buscar especialidade..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-900 border border-slate-800 focus:border-red-500/40 rounded-xl py-2 pl-10 pr-4 text-xs text-white outline-none placeholder-slate-500 font-bold transition-all"
            />
          </div>
        </div>

        {/* Section Tabs */}
        <div className="flex gap-1.5 overflow-x-auto pb-1 scrollbar-none">
          {SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => setActiveSection(sec.id)}
              className={`px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider shrink-0 transition-all border cursor-pointer ${
                activeSection === sec.id
                  ? 'bg-red-600 text-white border-red-500 shadow-md shadow-red-950/20'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white border-slate-800'
              }`}
            >
              {sec.name}
            </button>
          ))}
        </div>

        {/* 24 specialized categories grid */}
        {filteredCategories.length > 0 ? (
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4" id="categories-grid">
            {filteredCategories.map((cat) => {
              // Resolve o componente de ícone dinamicamente a partir do Lucide ou usa Wrench por padrão
              const iconKey = (cat.iconName || cat.icon || 'Wrench') as string;
              // Normaliza para que a primeira letra seja maiúscula para bater com Lucide (ex: wrench -> Wrench)
              const normalizedIconKey = iconKey.charAt(0).toUpperCase() + iconKey.slice(1);
              const IconComponent = (LucideIcons as any)[normalizedIconKey] || (LucideIcons as any)[iconKey] || LucideIcons.Wrench;

              return (
                <button
                  key={cat.id}
                  type="button"
                  onClick={() => onSelectCategory(cat.id as ServiceCategory)}
                  className="aspect-square bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-2xl flex flex-col items-center justify-center p-4 transition-all duration-300 shadow-lg hover:shadow-xl hover:-translate-y-0.5 cursor-pointer group"
                >
                  {/* Ícone no centro na cor amarela (#eab308 / text-yellow-400) com animação de hover */}
                  <div className="flex items-center justify-center text-yellow-400 group-hover:scale-110 group-hover:text-yellow-300 transition-all duration-350">
                    <IconComponent className="w-12 h-12 stroke-[1.8]" />
                  </div>
                  
                  {/* Nome da Categoria abaixo do ícone */}
                  <span className="text-white text-sm font-medium text-center mt-3 leading-snug px-1">
                    {cat.name}
                  </span>
                </button>
              );
            })}
          </div>
        ) : (
          <div className="text-center py-12 bg-slate-900/20 border border-slate-800/40 rounded-3xl space-y-2">
            <p className="text-sm font-bold text-white">Nenhum serviço encontrado</p>
            <p className="text-xs text-slate-500">Tente buscar por outro termo ou selecione outra seção.</p>
          </div>
        )}
      </div>
    </div>
  );
};
