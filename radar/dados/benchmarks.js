/*
 * BENCHMARKS — os eixos do radar
 * ------------------------------------------------------------------
 * Cada objeto abaixo vira um eixo do radar e um controle deslizante.
 *
 *   id          identificador curto, sem espaços (usado em modelos.js e perfis.js)
 *   nome        nome amigável exibido no gráfico
 *   teste       nome oficial do benchmark
 *   pesoAA      peso oficial no índice da Artificial Analysis (os pesos somam 100)
 *   polemica    1 a 5 — nossa leitura editorial das limitações do teste (cor da bolinha)
 *   categoria   apenas informativo (Trabalho, Código, Ciência, Geral…)
 *   explicacao  o que o teste mede
 *   critica     por que o teste é discutível
 *   calcularNota (opcional) função que gera a nota 0–100 a partir de outro campo
 *               do modelo — usada quando o modelo não traz a nota pronta em `notas`.
 *
 * Para ADICIONAR um benchmark: acrescente um objeto aqui e, em modelos.js,
 * a nota de cada modelo com o mesmo `id`. Modelos sem a nota continuam
 * funcionando — o site avisa e calcula a nota só com os testes disponíveis.
 */
window.RADAR = window.RADAR || {};

RADAR.indice = {
  nome: 'AA Index v5.0.1',
  metodologia: 'https://artificialanalysis.ai/methodology/intelligence-benchmarking'
};

RADAR.benchmarks = [
  {
    id: 'briefcase', nome: 'Trabalho profissional', teste: 'AA-Briefcase v1.1',
    pesoAA: 15, polemica: 3.1, categoria: 'Trabalho',
    explicacao: 'Produzir apresentações, relatórios e arquivos úteis em projetos empresariais longos.',
    critica: 'A qualidade de análise e apresentação depende parcialmente de julgamentos comparativos por modelos; o Elo também depende dos concorrentes avaliados. Projetos simulados não reproduzem todo o cotidiano profissional.',
    // A AA publica um Elo. A nota 0–100 é clamp((Elo − 500) / 2000) × 100.
    // Assim, em modelos.js basta informar `eloBriefcase`.
    calcularNota: modelo => modelo.eloBriefcase == null ? null
      : Math.min(1, Math.max(0, (modelo.eloBriefcase - 500) / 2000)) * 100
  },
  {
    id: 'automation', nome: 'Automações', teste: 'AutomationBench-AA',
    pesoAA: 5, polemica: 3.8, categoria: 'Trabalho',
    explicacao: 'Executar sequências de ações em softwares de trabalho por APIs.',
    critica: 'Os aplicativos e tarefas são simulados; concluir uma sequência de APIs não garante segurança, bons resultados ou robustez em sistemas empresariais reais. Há perda total da tarefa em violações de regras.'
  },
  {
    id: 'pdf', nome: 'Documentos e PDFs', teste: 'GDP.pdf',
    pesoAA: 5, polemica: 4.2, categoria: 'Trabalho',
    explicacao: 'Responder corretamente a exigências de documentos profissionais longos.',
    critica: 'Critério “tudo ou nada”: basta falhar uma exigência para perder a tentativa inteira. A avaliação usa um modelo julgador; interpretar PDFs pode depender do pré-processamento.'
  },
  {
    id: 'frontier', nome: 'Engenharia de software', teste: 'FrontierCode 2.0',
    pesoAA: 15, polemica: 2.6, categoria: 'Código',
    explicacao: 'Alterar e consertar código em repositórios reais de software.',
    critica: 'Testes automáticos e critérios de julgamento cobrem só parte da qualidade do código; desempenho depende do ambiente, ferramentas e seleção dos projetos. Não mede diretamente criar jogos.'
  },
  {
    id: 'terminal', nome: 'Código no terminal', teste: 'Terminal-Bench 4.0',
    pesoAA: 10, polemica: 2.2, categoria: 'Código',
    explicacao: 'Resolver tarefas práticas com comandos, arquivos e ferramentas de desenvolvimento.',
    critica: 'Uma tarefa é aprovada ou reprovada pelos testes. Isso pode não capturar qualidade de manutenção, ergonomia e soluções alternativas válidas; ambiente de execução influencia o resultado.'
  },
  {
    id: 'science', nome: 'Pesquisa científica', teste: 'Terminal-Bench-Science 0.1',
    pesoAA: 15, polemica: 3.0, categoria: 'Ciência',
    explicacao: 'Concluir fluxos computacionais de pesquisa científica.',
    critica: 'Abrange um conjunto finito de tarefas científicas, em sandbox, com aprovação binária dos verificadores; ciência real exige replicação, julgamento crítico e trabalho experimental.'
  },
  {
    id: 'physics', nome: 'Física avançada', teste: 'CritPt v2 (Hard Subset)',
    pesoAA: 10, polemica: 3.3, categoria: 'Ciência',
    explicacao: 'Resolver problemas técnicos difíceis de física e matemática aplicada.',
    critica: 'O subconjunto usado tem apenas 40 problemas difíceis selecionados, e representa física de pesquisa — não ciência inteira. Mudanças pequenas podem gerar variação relevante na pontuação.'
  },
  {
    id: 'factual', nome: 'Conhecimento factual', teste: 'AA-Omniscience · Accuracy',
    pesoAA: 10, polemica: 3.3, categoria: 'Geral',
    explicacao: 'Acertar fatos em perguntas abertas de conhecimento.',
    critica: 'Avaliar respostas abertas envolve escolhas de equivalência e redação; abster-se não ganha ponto de acerto. Acertar trivia factual não equivale a agir com segurança clínica ou jurídica.'
  },
  {
    id: 'halluc', nome: 'Evitar alucinação', teste: 'AA-Omniscience · Non-Hallucination',
    pesoAA: 5, polemica: 4.0, categoria: 'Geral',
    explicacao: 'Evitar afirmações factuais erradas nas perguntas do teste.',
    critica: 'Uma taxa baixa de alucinação pode resultar de maior cautela ou abstenção; isso não prova precisão de citações legais ou segurança de recomendações médicas. É uma métrica complementar, não um selo de confiabilidade absoluta.'
  },
  {
    id: 'hle', nome: 'Raciocínio e conhecimento', teste: 'HLE-Diamond',
    pesoAA: 10, polemica: 3.0, categoria: 'Geral',
    explicacao: 'Responder questões muito difíceis de raciocínio e conhecimento especializado.',
    critica: 'Questões de prova, mesmo difíceis, não representam todas as tarefas reais. A correção de respostas abertas recorre a um verificador com IA, sujeito a erros de equivalência.'
  }
];
