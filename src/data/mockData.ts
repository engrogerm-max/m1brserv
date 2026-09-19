import {
  CategoryInfo,
  ClientProfile,
  ProviderProfile,
  ServiceCategory,
  ServiceRequest,
  PlatformTransaction,
  MediaItem,
  AdminAlarm,
  ServiceRating,
  AppSettings
} from '../types';

export const INITIAL_SETTINGS: AppSettings = {
  companyName: 'M1 SERV',
  tagline: 'Excelência em Manutenção e Serviços Rápidos Sob Demanda',
  website: 'www.m1br.com.br',
  email: 'rogerio@m1br.com.br',
  supportWhatsapp: '(11)96212-2694',
  emergencyPhone: '(11)96212-2694',
  platformFeePercent: 15,
  providerLicenseFee: 120, // default value for license fee to work
  providerLicenseFeePeriod: 'monthly',
  providerLicenseFeeAutoBilling: true, // Defaulting to true as requested to have a mode
  defaultEtaMinutes: 15,
  slaDelayThresholdMinutes: 25,
  alarmSoundEnabled: true,
  alarmVolume: 80,
  autoDispatch: true,
  minServicePrice: 90,
  
  // Pix Manual Controlado pelo Admin
  paymentMode: 'manual_pix',
  pixReceiverKey: 'rogerio@m1br.com.br',
  pixReceiverBank: 'Banco Inter / Bradesco (M1 Brasil)',
  pixReceiverName: 'M1 BRASIL SERVICOS TECNICOS',
  pixReceiverAgency: '0001',
  pixReceiverAccount: '12345-6',
  pixReceiverCnpj: '12.345.678/0001-90',
  pixReceiverType: 'E-mail',
  
  // Configuração de API de Pagamento (Mercado Pago, Asaas, etc.)
  paymentApiProvider: 'mercadopago',
  paymentApiKey: '',
  paymentApiSecret: '',
  paymentWebhookUrl: 'https://www.m1br.com.br/api/webhook/payment',
  paymentApiActive: false,
  
  // Google Maps API (Opcional - Leaflet/OpenStreetMap ativo por padrão)
  googleMapsApiKey: '',
  
  adminPassword: 'M1#Adm!9621@Br2026',
  adminMasterPin: '9621',
  requireAdminPasswordEveryTime: true,
  clientBannerMessage: '⚡ M1 SERV • Atendimento Técnico Credenciado com Garantia Total!',
  clientInstructionText: 'Tabela de preços oficiais M1. O valor final e o prazo de chegada serão confirmados de forma clara pela nossa Central M1.',
  autoApproveProviders: false,
  
  // Customização dos Campos de Solicitação do Cliente ("Descreva o Atendimento que Você Precisa")
  clientFormHeaderTitle: 'Descreva o Atendimento que Você Precisa',
  clientFormHeaderSubtitle: 'Preencha os campos abaixo com as informações, fotos e vídeos da sua necessidade. A Central M1 analisará e enviará o melhor profissional credenciado.',
  clientFormTitleLabel: 'O que você precisa? (Título Resumido) *',
  clientFormTitlePlaceholder: 'Ex: Troca de fiação do chuveiro queimado, Consertar cano vazando, Instalar ar-condicionado...',
  clientFormDescLabel: 'Descrição Detalhada do Problema / Sua Necessidade Real *',
  clientFormDescPlaceholder: 'Descreva detalhadamente o que está acontecendo, sintomas observados, tamanho do local ou qualquer outra informação importante...',
  clientFormNotesLabel: 'Instruções Opcionais de Peças, Marcas ou Preferências de Materiais',
  clientFormNotesPlaceholder: 'Ex: Prefiro fiação de cobre Pirelli, torneira Deca, ou detalhes específicos sobre o acesso ao local...',
  clientFormMediaLabel: 'Anexar Fotos ou Vídeos Reais (Sua Mídia do Local) *',
  clientFormMediaHelp: 'Adicione arquivos de imagem ou vídeo para ajudar o credenciado M1 a trazer as peças e ferramentas corretas.',
  clientFormUrgencyLabel: 'Prioridade / Urgência do Chamado *',
  clientFormUrgencyImmediate: '⚡ Atendimento Imediato (Urgência)',
  clientFormUrgencyScheduled: '📅 Atendimento Agendado (Programar Visita)',
  clientFormSubmitBtnText: 'ENVIAR SOLICITAÇÃO PARA A CENTRAL M1',

  // Customização de Textos, Cores e Imagens (Padrões de Fábrica)
  clientPageTitle: 'Central de Chamados M1',
  clientPageSubtitle: 'Solicite suporte técnico especializado ou reparos urgentes com garantia de faturamento M1',
  clientBannerImage: 'https://images.unsplash.com/photo-1581092160607-ee22621dd758?auto=format&fit=crop&w=1200&q=80',
  clientThemeColor: 'red',
  clientBgStyle: 'dark',

  providerPageTitle: 'Painel do Credenciado M1',
  providerPageSubtitle: 'Receba indicações exclusivas em tempo real no seu radar e gerencie seus faturamentos',
  providerBannerImage: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=1200&q=80',
  providerThemeColor: 'emerald',
  providerBgStyle: 'dark',

  adminPageTitle: 'Central de Comando M1 BRASIL',
  adminPageSubtitle: 'Gestão Completa de Prestadores, Chamados e Configurações',
  adminThemeColor: 'emerald',
  adminBgStyle: 'dark',

  // Escolha de Cores do Fundo do App (Geral)
  appBackgroundTheme: 'dark_slate',

  // Automatizações Operacionais (Auto-Pilot)
  autoActionsEnabled: false,
  autoDirectDispatch: false,
  autoPredefinedPrice: 120,
  autoApproveServiceReport: false
};

export const SERVICE_CATEGORIES: CategoryInfo[] = [
  {
    id: 'marido_de_aluguel',
    name: 'Marido de Aluguel',
    iconName: 'Wrench',
    description: 'Pequenos reparos, montagem de móveis, suportes de TV, quadros, cortinas e reparos gerais.',
    basePrice: 120,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 60
  },
  {
    id: 'eletricista_residencial',
    name: 'Eletricista Residencial',
    iconName: 'Zap',
    description: 'Instalação de chuveiros, tomadas, disjuntores, fiação, luminárias e reparo de curto-circuitos.',
    basePrice: 130,
    badgeColor: 'bg-yellow-100 text-yellow-800 border-yellow-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 60
  },
  {
    id: 'encanador_hidraulico',
    name: 'Encanador / Bombeiro Hidráulico',
    iconName: 'Droplets',
    description: 'Vazamentos, infiltrações, reparos em canos, torneiras, registros, válvulas e caixas d\'água.',
    basePrice: 120,
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 60
  },
  {
    id: 'carpintaria_reparos',
    name: 'Carpintaria e Reparos',
    iconName: 'Hammer',
    description: 'Reparo de portas, janelas, móveis de madeira, fechaduras, rodapés e decks.',
    basePrice: 140,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 90
  },
  {
    id: 'pintor_residencial',
    name: 'Pintor Residencial',
    iconName: 'Paintbrush',
    description: 'Pintura de paredes, tetos, portas, aplicação de massa corrida, seladores e texturas.',
    basePrice: 150,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 120
  },
  {
    id: 'faxina_limpeza',
    name: 'Faxina / Limpeza',
    iconName: 'Sparkles',
    description: 'Limpeza padrão ou pesada de residências, escritórios e apartamentos.',
    basePrice: 110,
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 120
  },
  {
    id: 'higienizacao_estofados',
    name: 'Higienização de Estofados',
    iconName: 'Armchair',
    description: 'Higienização a seco e remoção de manchas de sofás, poltronas, colchões e cadeiras.',
    basePrice: 160,
    badgeColor: 'bg-indigo-100 text-indigo-800 border-indigo-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 90
  },
  {
    id: 'limpeza_pos_obra',
    name: 'Limpeza Pós Obra',
    iconName: 'Trash2',
    description: 'Limpeza técnica detalhada para remoção de resíduos de tinta, gesso, cimento e poeira fina pós-obra.',
    basePrice: 250,
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 180
  },
  {
    id: 'jardinagem_paisagismo',
    name: 'Jardinagem e Paisagismo',
    iconName: 'Trees',
    description: 'Corte de grama, poda de cercas vivas, adubação, plantio e revitalização de jardins.',
    basePrice: 130,
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 90
  },
  {
    id: 'chaveiro_24h',
    name: 'Chaveiro 24h',
    iconName: 'Key',
    description: 'Abertura de portas, troca de segredos, cópias de chaves e instalação de fechaduras residenciais.',
    basePrice: 90,
    badgeColor: 'bg-red-100 text-red-800 border-red-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 45
  },
  {
    id: 'socorro_mecanico',
    name: 'Socorro Mecânico',
    iconName: 'Car',
    description: 'Atendimento mecânico rápido de emergência para panes elétricas, bateria (chupeta) ou troca de pneu.',
    basePrice: 140,
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 60
  },
  {
    id: 'laudos_mecanica',
    name: 'Laudos Técnicos Mecânica',
    iconName: 'Settings',
    description: 'Emissão de laudos de conformidade mecânica, vistorias e inspeções profissionais por engenheiros mecânicos.',
    basePrice: 350,
    badgeColor: 'bg-zinc-100 text-zinc-800 border-zinc-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 120
  },
  {
    id: 'seguranca_trabalho',
    name: 'Segurança do Trabalho',
    iconName: 'ShieldAlert',
    description: 'Laudos de insalubridade, PPRA, PCMSO, vistorias de segurança e consultoria de normas regulamentadoras.',
    basePrice: 290,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 120
  },
  {
    id: 'projetos_mecanicos',
    name: 'Projetos Mecânicos',
    iconName: 'Compass',
    description: 'Desenho de projetos mecânicos industriais e comerciais, modelagem 3D, detalhamento e ART técnica.',
    basePrice: 450,
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 180
  },
  {
    id: 'cftv_alarmes',
    name: 'CFTV e Alarmes',
    iconName: 'Camera',
    description: 'Instalação e configuração de câmeras de segurança, alarmes, sensores de presença e cercas elétricas.',
    basePrice: 180,
    badgeColor: 'bg-violet-100 text-violet-800 border-violet-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 120
  },
  {
    id: 'automacao_smarthome',
    name: 'Automação (Smart Home)',
    iconName: 'Home',
    description: 'Integração de interruptores inteligentes, assistentes virtuais (Alexa/Google Home), fechaduras eletrônicas e iluminação.',
    basePrice: 220,
    badgeColor: 'bg-lime-100 text-lime-800 border-lime-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 90
  },
  {
    id: 'tecnico_informatica',
    name: 'Técnico de Informática',
    iconName: 'Laptop',
    description: 'Formatação, remoção de vírus, backup, redes Wi-Fi, configuração de impressoras e reparos de hardware.',
    basePrice: 110,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 60
  },
  {
    id: 'pedreiro_reformas',
    name: 'Pedreiro / Reformas',
    iconName: 'Hammer',
    description: 'Construção de alvenaria, contrapiso, reboco, assentamento de pisos e porcelanatos, reformas em geral.',
    basePrice: 180,
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 180
  },
  {
    id: 'gesseiro_drywall',
    name: 'Gesseiro e Drywall',
    iconName: 'Layers',
    description: 'Rebaixamento de teto em gesso, divisórias em drywall, sancas, molduras e reparo de placas danificadas.',
    basePrice: 160,
    badgeColor: 'bg-neutral-100 text-neutral-800 border-neutral-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 120
  },
  {
    id: 'vidraceiro',
    name: 'Vidraceiro',
    iconName: 'Maximize',
    description: 'Instalação de boxes de vidro, espelhos, tampos de mesa, fechamento de sacadas e substituição de vidros quebrados.',
    basePrice: 140,
    badgeColor: 'bg-cyan-100 text-cyan-800 border-cyan-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 90
  },
  {
    id: 'serralheria',
    name: 'Serralheria',
    iconName: 'Scissors',
    description: 'Reparos e fabricação de portões metálicos, grades de segurança, corrimãos e estruturas de ferro.',
    basePrice: 150,
    badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 120
  },
  {
    id: 'manutencao_eletrodomesticos',
    name: 'Manutenção de Eletrodomésticos',
    iconName: 'Tv',
    description: 'Conserto de geladeira, máquina de lavar roupas, micro-ondas, fogão e outros eletrodomésticos.',
    basePrice: 130,
    badgeColor: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 90
  },
  {
    id: 'redes_protecao',
    name: 'Redes de Proteção',
    iconName: 'Grid',
    description: 'Instalação de redes de proteção em janelas, sacadas, mezaninos, escadas e quadras esportivas.',
    basePrice: 170,
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 90
  },
  {
    id: 'desentupidora_pesada',
    name: 'Desentupidora Pesada',
    iconName: 'Activity',
    description: 'Desentupimento profissional de fossas, ralos de grande porte, pias, vasos sanitários e redes de esgoto residenciais.',
    basePrice: 280,
    badgeColor: 'bg-amber-100 text-amber-800 border-amber-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 120
  },
  {
    id: 'pet_servicos',
    name: 'Serviços Pet / Cuidados',
    iconName: 'PawPrint',
    description: 'Banho, tosa, passeios, pet sitter e cuidados veterinários básicos em domicílio com garantia M1.',
    basePrice: 110,
    badgeColor: 'bg-orange-100 text-orange-800 border-orange-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 60
  },
  {
    id: 'eventos_iluminacao',
    name: 'Eventos & Iluminação',
    iconName: 'PartyPopper',
    description: 'Instalação de luzes, som, projetores, tendas e suporte geral para festas e eventos residenciais e corporativos.',
    basePrice: 180,
    badgeColor: 'bg-purple-100 text-purple-800 border-purple-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 120
  },
  {
    id: 'agro_servicos',
    name: 'Agro & Jardinagem',
    iconName: 'Sprout',
    description: 'Manutenção de pequenas plantações, podas técnicas de árvores, adubação de solo e cuidados agro-residenciais especializados.',
    basePrice: 160,
    badgeColor: 'bg-green-100 text-green-800 border-green-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 120
  },
  {
    id: 'servicos_drone',
    name: 'Operador de Drone',
    iconName: 'Plane',
    description: 'Mapeamento técnico aéreo, inspeção predial de telhados, filmagens de alta resolução e monitoramento especializado.',
    basePrice: 200,
    badgeColor: 'bg-sky-100 text-sky-800 border-sky-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 90
  },
  {
    id: 'pesca_magnetica',
    name: 'Pesca Magnética',
    iconName: 'Magnet',
    description: 'Recuperação de ferramentas, chaves, celulares e detritos metálicos em poços, lagos e canais com superímãs.',
    basePrice: 150,
    badgeColor: 'bg-rose-100 text-rose-800 border-rose-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 90
  },
  {
    id: 'cuidador',
    name: 'Cuidador & Acompanhante',
    iconName: 'HeartHandshake',
    description: 'Cuidados e acompanhamento humanizado especializado para idosos, gestantes ou pessoas em recuperação pós-cirúrgica.',
    basePrice: 130,
    badgeColor: 'bg-teal-100 text-teal-800 border-teal-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 120
  },
  {
    id: 'limpeza_pos_morte',
    name: 'Limpeza Pós-Morte',
    iconName: 'Trash2',
    description: 'Higienização técnica profunda, desinfecção biológica e eliminação de odores após óbito com alto protocolo sanitário.',
    basePrice: 350,
    badgeColor: 'bg-stone-100 text-stone-800 border-stone-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 180
  },
  {
    id: 'dedetizacao',
    name: 'Dedetização & Controle',
    iconName: 'Bug',
    description: 'Controle de pragas residenciais, baratas, cupins, formigas, aranhas e desinfecção de ambientes homologada.',
    basePrice: 160,
    badgeColor: 'bg-emerald-100 text-emerald-800 border-emerald-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 90
  },
  {
    id: 'estetica_automotiva',
    name: 'Estética Automotiva',
    iconName: 'Car',
    description: 'Lavagem técnica detalhada, polimento de faróis, cristalização de pintura e higienização interna de veículos.',
    basePrice: 140,
    badgeColor: 'bg-blue-100 text-blue-800 border-blue-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 90
  },
  {
    id: 'beleza_feminina',
    name: 'Beleza Feminina',
    iconName: 'Crown',
    description: 'Serviços de escova, alisamento capilar, manicure, pedicure, design de sobrancelhas e maquiagem profissional.',
    basePrice: 130,
    badgeColor: 'bg-fuchsia-100 text-fuchsia-800 border-fuchsia-200',
    defaultEtaMinutes: 15,
    averageExecutionMinutes: 90
  }
];

export const PRESET_SAMPLE_MEDIA: Record<ServiceCategory, { title: string; media: MediaItem[]; sampleAfter?: MediaItem[] }> = {
  hidraulica: {
    title: 'Vazamento urgente na tubulação sob a pia da cozinha',
    media: [
      {
        id: 'sample-h1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1585704032915-c3400ca199e7?auto=format&fit=crop&w=800&q=80',
        timestamp: '14:30',
        caption: 'Cano sifão rachado vertendo água no armário'
      }
    ],
    sampleAfter: [
      {
        id: 'sample-h-after1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1607472586893-edb57bdc0e39?auto=format&fit=crop&w=800&q=80',
        timestamp: '15:45',
        caption: 'Sifão articulado novo instalado e vedação reforçada'
      }
    ]
  },
  eletrica: {
    title: 'Curto no quadro de disjuntores e chuveiro queimado',
    media: [
      {
        id: 'sample-e1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1621905251189-08b45d6a269e?auto=format&fit=crop&w=800&q=80',
        timestamp: '11:15',
        caption: 'Disjuntor geral desarmando com cheiro de queimado'
      }
    ],
    sampleAfter: [
      {
        id: 'sample-e-after1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80',
        timestamp: '12:30',
        caption: 'Quadro refeito com disjuntor DIN novo'
      }
    ]
  },
  ar_condicionado: {
    title: 'Ar condicionado Split 12.000 BTU pingando água na sala',
    media: [
      {
        id: 'sample-ac1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1621905252507-b35492cc74b4?auto=format&fit=crop&w=800&q=80',
        timestamp: '09:10',
        caption: 'Dreno entupido e serpentina com sujeira acumulada'
      }
    ],
    sampleAfter: [
      {
        id: 'sample-ac-after1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1631545806609-b4b7dd77e233?auto=format&fit=crop&w=800&q=80',
        timestamp: '10:40',
        caption: 'Higienização química concluída e dreno desobstruído'
      }
    ]
  },
  pintura: {
    title: 'Retoque de infiltração e pintura em parede da sala',
    media: [
      {
        id: 'sample-p1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1589939705384-5185137a7f0f?auto=format&fit=crop&w=800&q=80',
        timestamp: '13:00',
        caption: 'Descascado de tinta com marcas de umidade antiga'
      }
    ],
    sampleAfter: [
      {
        id: 'sample-p-after1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1562259949-e8e7689d7828?auto=format&fit=crop&w=800&q=80',
        timestamp: '16:00',
        caption: 'Parede lixada, emassada e com 2 demãos de tinta'
      }
    ]
  },
  chaveiro: {
    title: 'Chave quebrada dentro da fechadura tetra',
    media: [
      {
        id: 'sample-c1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1582139329536-e7284fece509?auto=format&fit=crop&w=800&q=80',
        timestamp: '18:15',
        caption: 'Pedaço da chave travado no miolo'
      }
    ]
  },
  limpeza: {
    title: 'Higienização de sofá retrátil de 3 lugares',
    media: [
      {
        id: 'sample-l1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1555041469-a586c61ea9bc?auto=format&fit=crop&w=800&q=80',
        timestamp: '08:45',
        caption: 'Manchas de café e poeira acumulada'
      }
    ]
  },
  jardinagem: {
    title: 'Poda de cerca-viva e corte de grama',
    media: [
      {
        id: 'sample-j1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1558904541-efa8c4a52636?auto=format&fit=crop&w=800&q=80',
        timestamp: '07:30',
        caption: 'Mato alto e ramos crescendo fora do limite'
      }
    ]
  },
  geral: {
    title: 'Instalação de suporte articulado para TV de 55 polegadas',
    media: [
      {
        id: 'sample-g1',
        type: 'photo',
        url: 'https://images.unsplash.com/photo-1538688525198-9b88f6f53126?auto=format&fit=crop&w=800&q=80',
        timestamp: '10:20',
        caption: 'Suporte fixo antigo com defeito no encaixe'
      }
    ]
  }
};

export const INITIAL_CLIENTS: ClientProfile[] = [];

export const INITIAL_PROVIDERS: ProviderProfile[] = [];

export const INITIAL_SERVICES: ServiceRequest[] = [];

export const INITIAL_REVIEWS: ServiceRating[] = [];

export const INITIAL_ADMIN_ALARMS: AdminAlarm[] = [];

export const INITIAL_TRANSACTIONS: PlatformTransaction[] = [];
