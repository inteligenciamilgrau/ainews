/*
 * MODELOS — as linhas coloridas do radar
 * ------------------------------------------------------------------
 * Para ADICIONAR um modelo, copie o bloco MODELO-EXEMPLO lá embaixo,
 * cole no fim da lista e preencha. Veja o radar/LEIA-ME.md para saber de
 * onde tirar cada número na Artificial Analysis. Depois de editar, aumente
 * o ?v= deste arquivo no index.html para o navegador buscar a versão nova.
 *
 *   id            identificador curto, sem espaços e único
 *   nome          nome completo            curto   nome curto (celular)
 *   config        configuração avaliada (Max, High, Xhigh…)
 *   cor           cor da linha, formato #rrggbb (escolha uma bem diferente das outras)
 *   corClara      (opcional) versão clara da cor, usada no tooltip escuro
 *   notaAA        nota oficial no índice da AA (0–100)
 *   eloBriefcase  Elo do AA-Briefcase; o site converte em nota 0–100 sozinho
 *   notas         { idDoBenchmark: nota 0–100 } — veja os ids em benchmarks.js
 *   fontes        links exibidos no rodapé
 *   observacao    (opcional) frase extra para o rodapé
 *   oculto        (opcional) true = começa escondido no radar (dá para ligar no botão)
 *
 * Se faltar alguma nota, o modelo aparece mesmo assim: o eixo fica sem ponto,
 * o tooltip mostra "sem dado" e a nota no botão do modelo ganha um * (parcial).
 */
window.RADAR = window.RADAR || {};

RADAR.atualizadoEm = '19 de novembro de 2026';

RADAR.modelos = [
  {
    id: 'fable', nome: 'Claude Fable 5.2', curto: 'Fable 5.2', config: 'Max',
    cor: '#8846bf', corClara: '#dbb1ff', notaAA: 64.6,
    eloBriefcase: 1785,
    notas: { automation: 76.4, pdf: 24.2, frontier: 48.8, terminal: 59.6, science: 73.3, physics: 76.5, factual: 79.1, halluc: 40.7, hle: 80.2 },
    fontes: [
      { texto: 'Claude Fable 5.2 (Max)', url: 'https://www.mypriors.com/models/claude-fable-5.2' },
      { texto: 'nota oficial do Fable 5.2 na AA', url: 'https://artificialanalysis.ai/models/claude-fable-5-2' }
    ],
    observacao: 'A nota oficial do Fable 5.2 (Max) aparece arredondada como 65 na AA.'
  },
  {
    id: 'carbon', nome: 'Gemini 4 Carbon', curto: 'Carbon', config: 'High',
    cor: '#2763df', corClara: '#9fc0ff', notaAA: 60.0,
    eloBriefcase: 1610.19,
    notas: { automation: 77.82, pdf: 28.4, frontier: 40.56, terminal: 65.15, science: 64.76, physics: 69, factual: 58.3, halluc: 88.6, hle: 69.1 },
    fontes: [
      { texto: 'Gemini 4 Carbon (High)', url: 'https://vascend.it/en/benchmark/gemini-4-carbon' },
      { texto: 'Gemini 4 Carbon na AA', url: 'https://artificialanalysis.ai/models/gemini-4-carbon' }
    ]
  },
  {
    id: 'opus', nome: 'Claude Opus 5.5', curto: 'Opus 5.5', config: 'Max',
    cor: '#e48239', corClara: '#ffb87f', notaAA: 59.1,
    eloBriefcase: 1800,
    notas: { automation: 69.5, pdf: 26.2, frontier: 46.4, terminal: 59.6, science: 59.1, physics: 68, factual: 65.5, halluc: 49.7, hle: 67.9 },
    fontes: [
      { texto: 'Claude Opus 5.5 (Max)', url: 'https://vascend.it/en/benchmark/claude-opus-5-5' },
      { texto: 'Claude Opus 5.5 na AA', url: 'https://artificialanalysis.ai/models/claude-opus-5-5' }
    ]
  },
  {
    id: 'astra', nome: 'GPT-6 Astra', curto: 'Astra', config: 'Max',
    cor: '#089f92', corClara: '#68e4d6', notaAA: 56.9,
    eloBriefcase: 1568,
    notas: { automation: 68.5, pdf: 31, frontier: 42.4, terminal: 59.1, science: 63.3, physics: 70.5, factual: 61.6, halluc: 50.2, hle: 63.8 },
    fontes: [
      { texto: 'GPT-6 Astra (Max)', url: 'https://vascend.it/en/benchmark/gpt-6-astra' }
    ]
  },
  {
    id: 'muse', nome: 'Muse Wonder', curto: 'Muse', config: 'Max',
    cor: '#cc3e6b', corClara: '#ff92b1', notaAA: 43.6,
    eloBriefcase: 1659,
    notas: { automation: 68.1, pdf: 30.6, frontier: 27.9, terminal: 52, science: 25.7, physics: 50.5, factual: 38, halluc: 79.1, hle: 39 },
    fontes: [
      { texto: 'Muse Wonder (Max) na AA', url: 'https://artificialanalysis.ai/models/comparisons/muse-wonder-vs-gpt-6-astra' },
      { texto: 'Muse Wonder (Max), valores por componente', url: 'https://www.mypriors.com/models/aa-muse-wonder' }
    ],
    observacao: 'Muse Wonder (Max) é diferente de Muse Wonder Full (Max), que possui outros resultados.'
  },
  {
    id: 'hydrogen', nome: 'Gemini 4 Hydrogen', curto: 'Hydrogen', config: 'Xhigh',
    cor: '#067206', corClara: '#8ee39b', notaAA: 53.9,
    eloBriefcase: 1566.85,
    notas: { automation: 76.14, pdf: 27.6, frontier: 38.96, terminal: 53.54, science: 49.52, physics: 66, factual: 50.47, halluc: 91.52, hle: 58.8 },
    fontes: [
      { texto: 'Gemini 4 Hydrogen (Xhigh) na AA', url: 'https://artificialanalysis.ai/models/gemini-4-hydrogen' }
    ]
  },
  {
    id: 'astra62', nome: 'GPT-6.2 Astra', curto: 'Astra 6.2', config: 'Max',
    cor: '#90006c', corClara: '#f3a2dc', notaAA: 62.1,
    eloBriefcase: 1643.35,
    notas: { automation: 77.25, pdf: 29.8, frontier: 45.38, terminal: 64.14, science: 78.1, physics: 71.5, factual: 68.57, halluc: 40.93, hle: 72.2 },
    fontes: [
      { texto: 'GPT-6.2 Astra (Max) na AA', url: 'https://artificialanalysis.ai/models/gpt-6-2-astra' }
    ]
  },
  {
    id: 'sol62', nome: 'GPT-6.2 Sol', curto: 'Sol 6.2', config: 'Max',
    cor: '#7890ea', corClara: '#bccaff', notaAA: 57.3,
    eloBriefcase: 1611.92,
    notas: { automation: 71.28, pdf: 30, frontier: 44.38, terminal: 60.1, science: 67.62, physics: 62.5, factual: 61.63, halluc: 44.57, hle: 64 },
    fontes: [
      { texto: 'GPT-6.2 Sol (Max) na AA', url: 'https://artificialanalysis.ai/models/gpt-6-2-sol' }
    ]
  },
  {
    id: 'neon', nome: 'Gemini 4 Neon', curto: 'Neon', config: 'Xhigh',
    cor: '#ff46c3', corClara: '#ff85d6', notaAA: 61.4,
    eloBriefcase: 1700.15,
    notas: { automation: 79.34, pdf: 28, frontier: 44.41, terminal: 63.64, science: 70, physics: 60.5, factual: 60.47, halluc: 85.58, hle: 71.3 },
    fontes: [
      { texto: 'Gemini 4 Neon (Xhigh) na AA', url: 'https://artificialanalysis.ai/models/gemini-4-neon' }
    ]
  }

  /* ---- MODELO-EXEMPLO: copie, cole acima (com uma vírgula antes) e preencha ----
  ,{
    id: 'novo', nome: 'Nome do Modelo', curto: 'Curto', config: 'Max',
    cor: '#000000', notaAA: 0,
    eloBriefcase: 0,
    notas: { automation: 0, pdf: 0, frontier: 0, terminal: 0, science: 0, physics: 0, factual: 0, halluc: 0, hle: 0 },
    fontes: [ { texto: 'Nome do Modelo na AA', url: 'https://artificialanalysis.ai/models/...' } ]
  }
  ---------------------------------------------------------------------------- */
];
