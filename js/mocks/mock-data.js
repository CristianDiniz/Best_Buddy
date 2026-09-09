/**
 * Dados fake usados pelos services enquanto BB_CONFIG.USE_MOCKS = true.
 *
 * O formato aqui segue o CONTRATO desejado (ver API_CONTRACT.md),
 * não necessariamente o que o backend real devolve hoje —
 * a ideia é o front já nascer certo e o backend alcançar depois.
 */

const BB_MOCK_USER = {
  id: 1,
  email: "usuario@bestbuddy.com",
  tipo: "PF",
  nome: "Ana Souza",
};

const BB_MOCK_CREDENTIALS = {
  email: "usuario@bestbuddy.com",
  password: "123456",
};

const BB_MOCK_ANIMALS = [
  { id: 1, nome: "Max", raca: "SRD", sexo: "M", idade_aproximada: "Adulto", medicamento: "Não", vacinacao: "Sim", contato: "(16) 99999-0001", descricao: "Dócil, adora brincar com bola.", imagem: null },
  { id: 2, nome: "Luna", raca: "Vira-lata caramelo", sexo: "F", idade_aproximada: "Filhote", medicamento: "Não", vacinacao: "Não", contato: "(16) 99999-0002", descricao: "Muito brincalhona, ótima com crianças.", imagem: null },
  { id: 3, nome: "Thor", raca: "Pastor Alemão", sexo: "M", idade_aproximada: "Adulto", medicamento: "Sim", vacinacao: "Sim", contato: "(16) 99999-0003", descricao: "Protetor, precisa de espaço para correr.", imagem: null },
  { id: 4, nome: "Nina", raca: "SRD", sexo: "F", idade_aproximada: "Idoso", medicamento: "Sim", vacinacao: "Sim", contato: "(16) 99999-0004", descricao: "Calma, ideal para apartamento.", imagem: null },
  { id: 5, nome: "Bidu", raca: "Poodle", sexo: "M", idade_aproximada: "Adulto", medicamento: "Não", vacinacao: "Sim", contato: "(16) 99999-0005", descricao: "Late pouco, já é castrado.", imagem: null },
  { id: 6, nome: "Mel", raca: "SRD", sexo: "F", idade_aproximada: "Filhote", medicamento: "Não", vacinacao: "Não", contato: "(16) 99999-0006", descricao: "Resgatada há 1 semana, em observação.", imagem: null },
];

const BB_MOCK_COMMUNITY_POSTS = [
  { id: 1, autor: "Carlos Lima", texto: "Hoje foi dia de campanha de castração no bairro Jardim Elite. Obrigado a todos que ajudaram!", created_at: "2026-07-28T14:00:00Z" },
  { id: 2, autor: "Best Buddy ONG", texto: "Precisamos de doações de ração para os próximos 15 dias. Ponto de coleta na sede.", created_at: "2026-07-27T10:30:00Z" },
];

const BB_MOCK_MISSING_ANIMALS = [
  { id: 1, nome: "Max", local: "Jardim Botânico, São Paulo, SP", contato: "(11) 91234-5678", descricao: "Sumiu durante um passeio, muito medroso com estranhos.", created_at: "2026-07-25T09:00:00Z" },
  { id: 2, nome: "Bela", local: "Parque SP, Araraquara, SP", contato: "(16) 98888-1122", descricao: "Desapareceu após fogos de artifício.", created_at: "2026-07-24T18:20:00Z" },
  { id: 3, nome: "Patrick Estrela", local: "Jd. Carmo, Araraquara, SP", contato: "(16) 97777-3344", descricao: "Última vez visto perto do mercado.", created_at: "2026-07-23T20:15:00Z" },
];

const BB_MOCK_NEWS = [
  { id: 1, titulo: "Sorry, this image is missing", resumo: "Espaço reservado para notícias e informações da comunidade.", created_at: "2026-07-20T00:00:00Z" },
];
