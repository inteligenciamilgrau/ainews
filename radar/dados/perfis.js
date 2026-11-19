/*
 * PERFIS — os botões de ponto de partida ("Direito", "Medicina"…)
 * ------------------------------------------------------------------
 *   id     identificador curto, sem espaços
 *   nome   texto do botão
 *   pesos  'AA' para usar os pesos oficiais definidos em benchmarks.js,
 *          ou um objeto { idDoBenchmark: peso } com valores inteiros de 0 a 30.
 *          Benchmarks que não aparecerem recebem peso 0.
 *   nota   explicação exibida ao escolher o perfil
 *
 * Os pesos são relativos: o site normaliza tudo para somar 100%.
 */
window.RADAR = window.RADAR || {};

RADAR.perfis = [
  {
    id: 'aa', nome: '⚖️ Pesos do AA', pesos: 'AA',
    nota: 'Padrão oficial do AA Index v5.0.1. Quatro categorias recebem 25% cada. Esta é a referência para comparar a nota original.'
  },
  {
    id: 'law', nome: '⚖️ Direito',
    pesos: { briefcase: 18, automation: 8, pdf: 15, frontier: 3, terminal: 2, science: 2, physics: 1, factual: 17, halluc: 25, hle: 9 },
    nota: 'Dá prioridade a confiabilidade factual, documentos e trabalho jurídico. Atenção: nenhum destes testes substitui benchmarks jurídicos ou checagem de fontes legais.'
  },
  {
    id: 'medicine', nome: '🩺 Medicina',
    pesos: { briefcase: 6, automation: 4, pdf: 14, frontier: 2, terminal: 2, science: 10, physics: 5, factual: 21, halluc: 28, hle: 8 },
    nota: 'Dá prioridade a evitar afirmações incorretas e interpretar documentos. Isso não mede risco clínico; uma falha rara pode ser grave demais para ser resumida por média.'
  },
  {
    id: 'games', nome: '🎮 Criar jogos',
    pesos: { briefcase: 5, automation: 9, pdf: 2, frontier: 28, terminal: 24, science: 3, physics: 2, factual: 8, halluc: 6, hle: 13 },
    nota: 'Perfil para DESENVOLVER jogos: mais peso para código e execução técnica. Jogar jogos, aprender regras e agir em tempo real exigiria outros benchmarks que não estão aqui.'
  }
];
