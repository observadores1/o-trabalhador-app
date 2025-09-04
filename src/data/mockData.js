// Dados simulados para desenvolvimento
export const trabalhadores = [
  {
    id: 1,
    nome: "João S.",
    foto: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face",
    avaliacao: 4.8,
    totalAvaliacoes: 127,
    habilidades: ["Pintor", "Ajudante Geral", "Reforma"],
    precoMinimo: 80,
    localizacao: "Centro",
    servicos: ["pintor", "reforma", "ajudante"]
  },
  {
    id: 2,
    nome: "Maria C.",
    foto: "https://images.unsplash.com/photo-1494790108755-2616b612b786?w=150&h=150&fit=crop&crop=face",
    avaliacao: 4.9,
    totalAvaliacoes: 89,
    habilidades: ["Eletricista", "Instalação", "Manutenção"],
    precoMinimo: 120,
    localizacao: "Copacabana",
    servicos: ["eletricista", "instalacao", "manutencao"]
  },
  {
    id: 3,
    nome: "Carlos R.",
    foto: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face",
    avaliacao: 4.6,
    totalAvaliacoes: 156,
    habilidades: ["Encanador", "Hidráulica", "Desentupimento"],
    precoMinimo: 100,
    localizacao: "Ipanema",
    servicos: ["encanador", "hidraulica", "desentupimento"]
  },
  {
    id: 4,
    nome: "Ana P.",
    foto: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face",
    avaliacao: 4.7,
    totalAvaliacoes: 203,
    habilidades: ["Faxineira", "Limpeza Pesada", "Organização"],
    precoMinimo: 60,
    localizacao: "Botafogo",
    servicos: ["faxineira", "limpeza", "organizacao"]
  },
  {
    id: 5,
    nome: "Roberto M.",
    foto: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face",
    avaliacao: 4.5,
    totalAvaliacoes: 78,
    habilidades: ["Marceneiro", "Móveis", "Carpintaria"],
    precoMinimo: 150,
    localizacao: "Tijuca",
    servicos: ["marceneiro", "moveis", "carpintaria"]
  },
  {
    id: 6,
    nome: "Lucia F.",
    foto: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face",
    avaliacao: 4.9,
    totalAvaliacoes: 145,
    habilidades: ["Jardineira", "Paisagismo", "Manutenção"],
    precoMinimo: 90,
    localizacao: "Barra da Tijuca",
    servicos: ["jardineira", "paisagismo", "jardim"]
  }
];

// Função para simular busca de trabalhadores
export const buscarTrabalhadores = (servico, localizacao) => {
  const servicoLower = servico.toLowerCase();
  const localizacaoLower = localizacao.toLowerCase();
  
  return trabalhadores.filter(trabalhador => {
    const servicoMatch = trabalhador.servicos.some(s => 
      s.includes(servicoLower) || servicoLower.includes(s)
    );
    
    const localizacaoMatch = trabalhador.localizacao.toLowerCase().includes(localizacaoLower) ||
                            localizacaoLower.includes(trabalhador.localizacao.toLowerCase());
    
    return servicoMatch || localizacaoMatch;
  });
};

