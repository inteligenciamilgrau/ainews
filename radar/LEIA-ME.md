# Radar AA — Inteligência não é uma nota só

Aba **Radar** do site: um radar interativo com os benchmarks do
**Artificial Analysis Intelligence Index (v5.0.1)**. Os sliders mudam o peso de
cada capacidade e recalculam o ranking.

Nasceu como projeto separado (`radar_da_ia`) e foi integrado ao site em
19/11/2026. A versão que vale agora é a desta pasta.

## Estrutura

```
ainews/
├── index.html              a aba (seção #radarView) e as tags que carregam os arquivos abaixo
├── app.js                  só conhece o nome da aba ("radar") e abre nela quando o link traz ?pesos=
└── radar/
    ├── radar.css           visual da aba, com as cores do site (variáveis de styles.css)
    ├── radar.js            lógica do radar (normalmente não precisa mexer)
    └── dados/
        ├── modelos.js      ← modelos comparados (é aqui que você mais vai editar)
        ├── benchmarks.js   ← eixos do radar + pesos oficiais da AA
        └── perfis.js       ← botões "Direito", "Medicina", "Criar jogos"…
```

Título, subtítulo, legenda, botões dos modelos e lista de fontes se ajustam
sozinhos à quantidade de modelos: não é preciso mexer no HTML para incluir um
modelo.

**Para ver no computador:** a aba faz parte do site, então abra o site por um
servidor local (o `index.html` aberto direto do disco não carrega a base de
lançamentos).

**Depois de editar qualquer arquivo desta pasta**, aumente o número do `?v=` da
tag correspondente no `index.html` (por exemplo `radar/dados/modelos.js?v=1` →
`?v=2`). Sem isso o navegador de quem já visitou o site pode continuar usando a
versão antiga por um tempo.

## Como a aba funciona

- **Cards dos modelos** (à esquerda do radar; no celular, acima dele): mostram a
  nota de cada modelo com os pesos atuais, da maior para a menor. Um clique liga
  ou desliga a linha no radar. Passar o mouse destaca a linha e mostra os números
  dela nos vértices.
- **Radar**: se enquadra sozinho no espaço disponível (sem margens sobrando) e
  cresce até a altura útil da tela.
- **Memória**: a página lembra, neste navegador, quais modelos estavam ligados e
  quais pesos ou perfil estavam escolhidos. Um link com `?pesos=` tem prioridade.
  Para voltar ao padrão, use **Restaurar AA** e religue os modelos.
- **⚙️ Ajustar pesos**: abre o menu "O que é importante pra você?", com os perfis
  prontos e os controles de cada benchmark. O menu começa recolhido. O selo ao
  lado do botão mostra quais pesos estão valendo (oficiais, um perfil ou
  personalizados).
- **Filtros do site** (busca, tipo de IA, empresa, ano): não afetam o Radar, do
  mesmo jeito que não afetam o Mapa e a História.

## Adicionar um modelo

1. Abra `dados/modelos.js`.
2. Copie o bloco `MODELO-EXEMPLO` do fim do arquivo e cole depois do último
   modelo (não esqueça a vírgula entre um modelo e outro).
3. Preencha os campos com os números da página do modelo na Artificial Analysis
   (`https://artificialanalysis.ai/models/<nome-do-modelo>`):

| Campo em `notas` | Benchmark na AA | Como preencher |
|---|---|---|
| `eloBriefcase` (fora de `notas`) | AA-Briefcase | o **Elo**; o site converte em nota 0–100 |
| `automation` | AutomationBench-AA | % (0–100) |
| `pdf` | GDP.pdf | % (0–100) |
| `frontier` | FrontierCode 2.0 | % (0–100) |
| `terminal` | Terminal-Bench 4.0 | % (0–100) |
| `science` | Terminal-Bench-Science 0.1 | % (0–100) |
| `physics` | CritPt v2 (Hard Subset) | % (0–100) |
| `factual` | AA-Omniscience · Accuracy | % (0–100) |
| `halluc` | AA-Omniscience · Non-Hallucination | **100 − taxa de alucinação** (ex.: 8,48% → 91.52) |
| `hle` | HLE-Diamond | % (0–100) |

4. Escolha uma `cor` **bem diferente** das que já existem (veja "Cores" abaixo).
5. Atualize `RADAR.atualizadoEm` no topo do arquivo e aumente o `?v=` do
   `modelos.js` no `index.html`.
6. Salve e recarregue a página.

> Use **ponto** como separador decimal (`53.9`, não `53,9`).

**Confira o resultado:** com os pesos oficiais ("Pesos do AA"), a nota no botão
do modelo deve ficar a poucos décimos da `notaAA`. Se ficar longe, algum número
foi digitado errado.

**Faltam dados?** Tudo bem. Deixe de fora as notas que não tiver: o eixo fica sem
ponto, o tooltip mostra "sem dado" e a nota no botão ganha um **\*** (nota parcial).

## Avisos automáticos

Ao abrir a página, o `radar.js` confere os arquivos de dados. Se encontrar algo
estranho, mostra uma **caixa amarela no topo da aba** explicando o problema, como:

- id de benchmark digitado errado (`hle2` em vez de `hle`);
- nota fora de 0–100 ou que não é número;
- cor inválida ou repetida;
- modelo sem nota em algum benchmark;
- pesos oficiais que não somam 100.

Sem problemas, a caixa não aparece.

## Adicionar um benchmark

1. Em `dados/benchmarks.js`, acrescente um objeto com `id`, `nome`, `teste`,
   `pesoAA`, `polemica`, `explicacao` e `critica`.
2. Em `dados/modelos.js`, inclua a nota de cada modelo com o mesmo `id`.
3. Se quiser, adicione o peso dele nos perfis de `dados/perfis.js`. Perfis que não
   citarem o benchmark dão peso 0 a ele.

O radar se redesenha com o número novo de eixos. Se a AA mudar os pesos oficiais,
basta atualizar os `pesoAA`.

## Adicionar um perfil

Em `dados/perfis.js`, acrescente um objeto com `id`, `nome`, `nota` e `pesos`
(`{ idDoBenchmark: peso }`, de 0 a 30). Os pesos são relativos: o site normaliza
para 100%.

## Cores

A interface da aba usa as cores do site (verde, creme e as superfícies escuras
dos balões). As cores abaixo são só as **linhas dos modelos**.

Em radar todas as linhas se cruzam, então cada cor precisa se distinguir de **todas**
as outras, inclusive para quem tem daltonismo. As cores atuais:

| Modelo | Cor |
|---|---|
| Claude Fable 5.2 | `#8846bf` roxo |
| Gemini 4 Carbon | `#2763df` azul |
| Claude Opus 5.5 | `#e48239` laranja |
| GPT-6 Astra | `#089f92` verde-azulado |
| Muse Wonder | `#cc3e6b` rosa |
| Gemini 4 Hydrogen | `#067206` verde-floresta |
| GPT-6.2 Astra | `#90006c` ameixa |
| GPT-6.2 Sol | `#7890ea` azul-lavanda |
| Gemini 4 Neon | `#ff46c3` rosa-neon |

Com nove cores o espaço passou do limite confortável. O rosa-neon do Gemini 4 Neon
foi a única faixa que ainda ficava acima dos mínimos de distância contra as oito
anteriores (a mais próxima é o rosa do Muse). O par mais parecido da lista
continua sendo o roxo do Fable com o azul do Carbon, que já existia antes. Para um
10º modelo, em vez de procurar outra cor, prefira **reaproveitar a cor de um
modelo que saiu** ou deixar modelos antigos escondidos por padrão com
`oculto: true` em `modelos.js`. O botão deles continua aparecendo, apagado e com
a nota, e um clique os traz de volta ao radar.

## Links com pesos

O botão **Copiar link com pesos** gera links no formato
`https://<site>/?pesos=briefcase:15,automation:5,...`. Quem abre um link assim cai
direto na aba Radar, com os pesos do link. Esse formato continua válido quando
benchmarks forem adicionados. Links antigos (`?pesos=15,5,5,...`) também funcionam.

## Histórico dos dados

- **19/11/2026:** radar integrado ao site como aba, com as cores do site.
  Adicionado **Gemini 4 Neon (Xhigh)**, nota AA 61,4. Os outros modelos não foram
  alterados. Na página do Neon na AA, o Elo do AA-Briefcase de seis deles aparece
  com menos de 1 ponto de diferença em relação ao que está aqui, sem efeito visível
  nas notas; GPT-6 Astra e Muse Wonder não aparecem nessa página e não foram
  reconferidos.
- **18/11/2026:** adicionados **GPT-6.2 Astra (Max)**, nota AA 62,1, e
  **GPT-6.2 Sol (Max)**, nota AA 57,3. Os seis modelos anteriores foram
  conferidos de novo com a AA e não mudaram.
- **12/11/2026:** adicionado **Gemini 4 Hydrogen (Xhigh)**, nota AA 53,9.
  Na mesma conferência com a AA, **CritPt** foi atualizado no Gemini 4 Carbon
  (63 → 69) e no Claude Opus 5.5 (61 → 68), e com isso as notas oficiais passaram
  a 60,0 e 59,1. Os demais valores conferiram com a AA.
- **11/11/2026:** versão original (arquivo único, cinco modelos).
