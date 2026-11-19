/*
 * Radar AA — lógica da aba "Radar" do site (gráfico interativo de benchmarks).
 *
 * Normalmente você NÃO precisa editar este arquivo. Para adicionar modelos,
 * benchmarks ou perfis, edite os arquivos da pasta radar/dados (veja radar/LEIA-ME.md).
 * Ao abrir a página, os dados são conferidos; problemas aparecem num aviso
 * amarelo no topo da aba e no console do navegador.
 *
 * O visual fica em radar/radar.css e usa as cores do site (styles.css).
 */
(function () {
'use strict';

const DADOS = window.RADAR || {};
const HEX = new RegExp('^#[0-9a-f]{6}$', 'i');
// Ordem dos benchmarks nos links antigos (?pesos=15,5,5,...) da primeira versão.
const ORDEM_LINKS_ANTIGOS = ['briefcase', 'automation', 'pdf', 'frontier', 'terminal', 'science', 'physics', 'factual', 'halluc', 'hle'];

const $ = id => document.getElementById(id);
const caixaAvisos = $('radarAvisos');
if (!caixaAvisos) return; // página sem a aba Radar

const avisos = [];
const aviso = msg => { avisos.push(msg); console.warn('[Radar] ' + msg); };
const esc = s => String(s ?? '').replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
const numero = v => (v === null || v === undefined || v === '' ? null : (Number.isFinite(Number(v)) ? Number(v) : NaN));
function clarear(hex, t = .5) {
  const n = parseInt(hex.slice(1), 16);
  return '#' + [n >> 16 & 255, n >> 8 & 255, n & 255].map(c => Math.round(c + (255 - c) * t).toString(16).padStart(2, '0')).join('');
}
function listaPt(partes) { return partes.length < 2 ? partes.join('') : partes.slice(0, -1).join(', ') + ' e ' + partes[partes.length - 1]; }

// ============ 1. Preparação e validação dos dados ============
const items = [];
const idsBench = new Set();
(DADOS.benchmarks || []).forEach((b, n) => {
  if (!b || !b.id) { aviso(`Benchmark nº ${n + 1} está sem "id" e foi ignorado.`); return; }
  if (idsBench.has(b.id)) { aviso(`Benchmark "${b.id}" aparece duas vezes; só a primeira definição foi usada.`); return; }
  idsBench.add(b.id);
  let peso = numero(b.pesoAA);
  if (peso === null || Number.isNaN(peso) || peso < 0) { aviso(`Benchmark "${b.id}": pesoAA inválido (${b.pesoAA}); usando 0.`); peso = 0; }
  let risco = numero(b.polemica);
  if (risco === null || Number.isNaN(risco)) risco = 3;
  items.push({
    id: b.id, name: b.nome || b.id, test: b.teste || '', official: peso,
    risk: Math.min(5, Math.max(1, risco)),
    explain: b.explicacao || '', controversy: b.critica || 'Sem observações cadastradas.',
    calcular: typeof b.calcularNota === 'function' ? b.calcularNota : null
  });
});
const somaAA = items.reduce((a, it) => a + it.official, 0);
if (items.length && Math.abs(somaAA - 100) > 0.01) aviso(`A soma dos pesos oficiais (pesoAA) é ${somaAA}, não 100. O cálculo normaliza, mas vale conferir.`);
const PESO_MAX = Math.max(30, ...items.map(it => it.official));

const models = [];
const idsModelo = new Set();
(DADOS.modelos || []).forEach((m, n) => {
  if (!m || !m.id) { aviso(`Modelo nº ${n + 1} está sem "id" e foi ignorado.`); return; }
  if (idsModelo.has(m.id)) { aviso(`Modelo "${m.id}" aparece duas vezes; só o primeiro foi usado.`); return; }
  idsModelo.add(m.id);
  const nome = m.nome || m.id;
  let cor = m.cor;
  if (!HEX.test(cor || '')) { aviso(`Modelo "${nome}": cor "${m.cor}" inválida (use o formato #rrggbb). Usando cinza.`); cor = '#64748b'; }
  const usadas = new Set(models.map(x => x.color.toLowerCase()));
  if (usadas.has(cor.toLowerCase())) aviso(`Modelo "${nome}": a cor ${cor} já é usada por outro modelo.`);
  const notas = m.notas || {};
  Object.keys(notas).forEach(k => { if (!idsBench.has(k)) aviso(`Modelo "${nome}": nota para o benchmark desconhecido "${k}" (erro de digitação?).`); });
  const faltando = [];
  const scores = items.map(it => {
    let v = numero(notas[it.id]);
    if (v === null && it.calcular) { try { v = numero(it.calcular(m)); } catch (e) { v = NaN; } }
    if (v === null) { faltando.push(it.name); return null; }
    if (Number.isNaN(v)) { aviso(`Modelo "${nome}": nota inválida em "${it.id}".`); faltando.push(it.name); return null; }
    if (v < 0 || v > 100) { aviso(`Modelo "${nome}": nota ${v} em "${it.id}" está fora de 0–100 e foi limitada.`); v = Math.min(100, Math.max(0, v)); }
    return v;
  });
  if (faltando.length) aviso(`Modelo "${nome}" está sem dados em: ${faltando.join(', ')}. A nota personalizada dele usa só os benchmarks disponíveis.`);
  let oficial = numero(m.notaAA);
  if (Number.isNaN(oficial)) { aviso(`Modelo "${nome}": notaAA inválida.`); oficial = null; }
  models.push({
    id: m.id, name: nome, short: m.curto || nome, setting: m.config || '',
    color: cor, tipColor: HEX.test(m.corClara || '') ? m.corClara : clarear(cor),
    official: oficial, scores,
    fontes: Array.isArray(m.fontes) ? m.fontes.filter(f => f && f.url) : [],
    observacao: m.observacao || '',
    oculto: m.oculto === true
  });
});

const clampPeso = v => { const n = Math.round(Number(v)); return Number.isFinite(n) ? Math.min(PESO_MAX, Math.max(0, n)) : 0; };
let profiles = {};
(DADOS.perfis || []).forEach((p, n) => {
  if (!p || !p.id) { aviso(`Perfil nº ${n + 1} está sem "id" e foi ignorado.`); return; }
  const oficial = p.pesos === 'AA';
  let ws;
  if (oficial) ws = items.map(it => it.official);
  else {
    const src = p.pesos || {};
    Object.keys(src).forEach(k => { if (!idsBench.has(k)) aviso(`Perfil "${p.nome || p.id}": peso para o benchmark desconhecido "${k}".`); });
    ws = items.map(it => clampPeso(src[it.id]));
  }
  profiles[p.id] = { name: p.nome || p.id, weights: ws, note: p.nota || '', oficial };
});
let AA_KEY = Object.keys(profiles).find(k => profiles[k].oficial);
if (!AA_KEY) {
  AA_KEY = 'aa';
  profiles = { aa: { name: '⚖️ Pesos do AA', weights: items.map(it => it.official), note: 'Pesos oficiais do índice.', oficial: true }, ...profiles };
}

function mostrarAvisos() {
  if (!avisos.length) { caixaAvisos.hidden = true; return; }
  const itens = avisos.map(a => '<li>' + esc(a) + '</li>').join('');
  caixaAvisos.innerHTML = `<strong>Atenção aos dados (pasta radar/dados)</strong><ul>${itens}</ul>`;
  caixaAvisos.hidden = false;
}
if (!items.length || !models.length) {
  if (!items.length) aviso('Nenhum benchmark carregado. Confira se radar/dados/benchmarks.js existe e é carregado no index.html.');
  if (!models.length) aviso('Nenhum modelo carregado. Confira se radar/dados/modelos.js existe e é carregado no index.html.');
  mostrarAvisos();
  return;
}

// ============ 2. Textos que dependem dos dados ============
const rotulo = m => m.setting ? `${m.name} (${m.setting})` : m.name;
const porNotaAA = models.slice().sort((a, b) => (b.official ?? -1) - (a.official ?? -1));
const nomeIndice = (DADOS.indice && DADOS.indice.nome) || 'AA Index';
(function textosDinamicos() {
  const [lider, ...outros] = porNotaAA;
  const negrito = m => '<b>' + esc(m.name) + '</b>';
  const demais = outros.length ? ', além de ' + listaPt(outros.map(negrito)) : '';
  $('radarSubtitulo').innerHTML = `Um radar interativo para investigar o líder ${negrito(lider)}${demais} no <b>${esc(nomeIndice)}</b>. Arraste os pesos para descobrir quem vence no seu cenário.`;
  $('radarLegendaModelos').textContent = `Linhas: resultados de ${models.length} ${models.length === 1 ? 'modelo' : 'modelos'} · 0–100`;
  $('radarSvg').setAttribute('aria-label', `Radar comparativo de ${items.length} competências entre ${listaPt(models.map(m => m.name))}. Alterar os sliders muda os pesos e reposiciona os eixos.`);
  if (DADOS.indice && DADOS.indice.metodologia) $('radarLinkMetodologia').href = DADOS.indice.metodologia;
  const link = f => `<a href="${esc(f.url)}" target="_blank" rel="noopener noreferrer">${esc(f.texto || f.url)}</a>`;
  $('radarFontes').innerHTML = models.filter(m => m.fontes.length).map(m => m.fontes.map(link).join(', ')).join('; ');
  $('radarDataAtualizacao').textContent = DADOS.atualizadoEm || 'data não informada';
  $('radarObservacoes').textContent = models.map(m => m.observacao).filter(Boolean).join(' ');
})();

// ============ 3. Radar interativo ============
const fmt = (n, d = 1) => Number(n).toLocaleString('pt-BR', { minimumFractionDigits: d, maximumFractionDigits: d });
const S = (tag, attrs = {}, txt) => { const e = document.createElementNS('http://www.w3.org/2000/svg', tag); Object.entries(attrs).forEach(([key, value]) => e.setAttribute(key, String(value))); if (txt !== undefined) e.textContent = txt; return e; };
const svg = $('radarSvg'), tooltip = $('radarTooltip'), slidersEl = $('radarSliders');
const visible = new Set(models.filter(m => !m.oculto).map(m => m.id));
// focusModel começa vazio: o update() destaca o 1º colocado entre os visíveis (já com a seleção memorizada).
let weights = [...profiles[AA_KEY].weights], activeProfile = AA_KEY, focusModel = null;
let previewModel = null; // destaque temporário enquanto o mouse está sobre o botão de um modelo

function wTotal() { return weights.reduce((a, b) => a + b, 0); }
// Média ponderada só com os benchmarks que o modelo tem; "partial" indica que faltou algum com peso > 0.
function scoreFor(model, ws = weights) {
  let total = 0, coberto = 0, soma = 0;
  ws.forEach((w, i) => { total += w; const v = model.scores[i]; if (v !== null) { coberto += w; soma += v * w; } });
  return { value: coberto ? soma / coberto : null, partial: coberto < total };
}
function normalWeight(i) { const t = wTotal(); return t ? weights[i] * 100 / t : 0; }
function colorRisk(risk) { const x = (risk - 1) / 4; return `hsl(${Math.round(125 - 121 * x)} 76% ${x > .66 ? '51%' : '48%'})`; }
function polar(a, r) { return [480 + Math.cos(a) * r, 405 + Math.sin(a) * r]; }
function add(parent, tag, attrs = {}, txt) { const x = S(tag, attrs, txt); parent.appendChild(x); return x; }
function orderByWeight() { const n = items.length; const slots = Array.from({ length: n }, (_, k) => ({ k, ang: -Math.PI / 2 + 2 * Math.PI * k / n })); slots.sort((a, b) => Math.sin(a.ang) - Math.sin(b.ang) || a.k - b.k); const ranks = items.map((it, i) => ({ i, weight: weights[i], official: it.official })).sort((a, b) => b.weight - a.weight || b.official - a.official || a.i - b.i); const ordered = Array(n); ranks.forEach((m, i) => ordered[slots[i].k] = m.i); return ordered; }
function scoredModels() { return models.map(m => { const s = scoreFor(m); return { ...m, value: s.value, partial: s.partial }; }).sort((a, b) => (b.value ?? -1) - (a.value ?? -1)); }

function tipText(it, i) {
  const perc = normalWeight(i);
  const scoreLines = models.map(m => `<span><span><i style="background:${m.color}"></i>${esc(rotulo(m))}</span><b style="color:${m.tipColor}">${m.scores[i] === null ? 'sem dado' : fmt(m.scores[i])}</b></span>`).join('');
  tooltip.innerHTML = `<strong>${esc(it.name)}</strong><div class="radar-tip-sub">${esc(it.test)} · peso atual ${fmt(perc)}%</div><div class="radar-tip-reading">${scoreLines}</div><p>${esc(it.explain)}</p><p class="radar-tip-why"><em>Por que é discutível?</em><br>${esc(it.controversy)}</p><div class="radar-tip-note">Polêmica: nossa avaliação editorial (${fmt(it.risk)}/5)</div>`;
}
function moveTip(e) { const g = 16, w = tooltip.offsetWidth || 320, h = tooltip.offsetHeight || 280; let x = e.clientX + g, y = e.clientY + g; if (x + w > window.innerWidth - 10) x = e.clientX - w - g; if (y + h > window.innerHeight - 10) y = e.clientY - h - g; tooltip.style.left = Math.max(8, x) + 'px'; tooltip.style.top = Math.max(8, y) + 'px'; }
function showTip(e, i) { tipText(items[i], i); tooltip.classList.add('is-visible'); moveTip(e); }
function focusTip(node, i) { const r = node.getBoundingClientRect(); showTip({ clientX: r.left + r.width / 2, clientY: r.top + r.height / 2 }, i); }
function hideTip() { tooltip.classList.remove('is-visible'); }
function wireTip(node, i) { node.classList.add('radar-axis-hover'); node.setAttribute('tabindex', '0'); node.setAttribute('role', 'button'); node.setAttribute('aria-label', `${items[i].name}, detalhes e comparação de resultados`); node.addEventListener('pointerenter', e => showTip(e, i)); node.addEventListener('pointermove', moveTip); node.addEventListener('pointerleave', hideTip); node.addEventListener('focus', () => focusTip(node, i)); node.addEventListener('blur', hideTip); node.addEventListener('click', () => { focusTip(node, i); clearTimeout(wireTip.timer); wireTip.timer = setTimeout(hideTip, 7000); }); node.addEventListener('keydown', e => { if (e.key === 'Escape') hideTip(); }); }

// Geometria (unidades do SVG): raio do gráfico, das bolinhas de polêmica e do ponto onde começa cada rótulo.
const R_BOLINHA = 236 + 24, R_ROTULO = 236 + 44;
function draw() {
  svg.replaceChildren(); const R = 236, cx = 480, cy = 405, order = orderByWeight(), count = items.length;
  const ang = k => -Math.PI / 2 + 2 * Math.PI * k / count;
  const fundo = add(svg, 'g'); // fundo + grade: junto com os rótulos, define o enquadramento
  add(fundo, 'circle', { cx, cy, r: R + 8, class: 'radar-chart-bg' });
  for (let t = 20; t <= 100; t += 20) { const pts = Array.from({ length: 120 }, (_, j) => polar(-Math.PI / 2 + j * Math.PI * 2 / 120, R * t / 100).join(',')).join(' '); add(fundo, 'polygon', { points: pts, class: 'radar-chart-line' }); add(fundo, 'text', { x: cx + 10, y: cy - R * t / 100 - 5, class: 'radar-grid-label' }, String(t)); }
  order.forEach((idx, k) => { const p = polar(ang(k), R); add(fundo, 'line', { x1: cx, y1: cy, x2: p[0], y2: p[1], class: 'radar-chart-spoke' }); });
  const foco = previewModel && visible.has(previewModel) ? previewModel : focusModel;
  const drawn = models.filter(m => visible.has(m.id)); const front = drawn.find(m => m.id === foco); const layers = [...drawn.filter(m => m.id !== foco), ...(front ? [front] : [])];
  // Eixos sem dado são pulados: a linha liga os vizinhos disponíveis.
  layers.forEach(m => { const verts = []; order.forEach((idx, k) => { const v = m.scores[idx]; if (v !== null) verts.push(polar(ang(k), R * v / 100)); }); if (verts.length < 2) return; add(svg, 'polygon', { points: verts.map(p => p.join(',')).join(' '), fill: m.color, 'fill-opacity': m.id === foco ? '0.10' : '0.045', stroke: m.color, 'stroke-width': m.id === foco ? 3.6 : 2.8, 'stroke-linejoin': 'round', 'stroke-opacity': m.id === foco ? 1 : .89 }); });
  layers.forEach(m => { order.forEach((idx, k) => { const v = m.scores[idx]; if (v === null) return; const pt = polar(ang(k), R * v / 100); add(svg, 'circle', { cx: pt[0], cy: pt[1], r: m.id === foco ? 5.9 : 4.4, fill: '#fff', stroke: m.color, 'stroke-width': m.id === foco ? 2.6 : 2 }); const hit = add(svg, 'circle', { cx: pt[0], cy: pt[1], r: 12, fill: 'transparent', class: 'radar-point-hit' }); wireTip(hit, idx); }); });
  const chosen = models.find(m => m.id === foco) || models[0];
  const rotulos = add(svg, 'g');
  order.forEach((idx, k) => {
    const a = ang(k), it = items[idx], ca = Math.cos(a), sa = Math.sin(a), [lx, ly] = polar(a, R_ROTULO), anchor = ca > .35 ? 'start' : ca < -.35 ? 'end' : 'middle', weight = normalWeight(idx); const tx = lx + (anchor === 'start' ? 8 : anchor === 'end' ? -8 : 0);
    // Bloco de 3 linhas (nome, teste, peso) encostado no círculo: em cima, a base do bloco encosta no ponto;
    // embaixo, o topo; nos lados, o centro. "base" é a linha de base do nome.
    const base = ly - 13 + sa * 24;
    const v = chosen.scores[idx];
    if (visible.has(chosen.id) && v !== null) { const pt = polar(a, R * v / 100); let px = pt[0] + (ca > .3 ? 10 : ca < -.3 ? -10 : 10), py = pt[1] + (sa > 0 ? 15 : -10); if (Math.abs(ca) < .4) px = pt[0] + 13; add(svg, 'text', { x: px, y: py, 'text-anchor': ca < -.3 ? 'end' : 'start', class: 'radar-value-label', fill: chosen.color, style: `fill:${chosen.color}` }, fmt(v)); }
    const group = add(rotulos, 'g'); add(group, 'text', { x: tx, y: base, 'text-anchor': anchor, class: 'radar-axis-label' }, it.name); add(group, 'text', { x: tx, y: base + 18, 'text-anchor': anchor, class: 'radar-axis-sub' }, it.test); add(group, 'text', { x: tx, y: base + 34, 'text-anchor': anchor, class: 'radar-axis-weight' }, `Peso: ${fmt(weight)}%`); add(group, 'title', {}, `Compare os modelos; críticas: ${it.controversy}`);
    const pp = polar(a, R_BOLINHA); const dot = add(rotulos, 'circle', { cx: pp[0], cy: pp[1], r: 8.5, fill: colorRisk(it.risk), class: 'radar-risk-dot' }); wireTip(dot, idx); wireTip(group, idx);
  });
  // Enquadramento: o viewBox abraça só o fundo e os rótulos (sem margens sobrando), então o radar
  // ocupa todo o espaço disponível. Destacar outro modelo não muda o enquadramento.
  // Com a aba oculta (display:none) o SVG não tem layout para medir: mantém o enquadramento
  // anterior e o aoMostrar() redesenha quando a aba aparece.
  if (!svg.getClientRects().length) return;
  try {
    const caixas = [fundo.getBBox(), rotulos.getBBox()], m = 6;
    const x0 = Math.floor(Math.min(...caixas.map(b => b.x))) - m, y0 = Math.floor(Math.min(...caixas.map(b => b.y))) - m;
    const x1 = Math.ceil(Math.max(...caixas.map(b => b.x + b.width))) + m, y1 = Math.ceil(Math.max(...caixas.map(b => b.y + b.height))) + m;
    if (x1 - x0 > 100 && y1 - y0 > 100) svg.setAttribute('viewBox', `${x0} ${y0} ${x1 - x0} ${y1 - y0}`);
  } catch (e) { /* SVG sem layout: mantém o enquadramento anterior */ }
}

// Botões dos modelos: clique liga/desliga a linha; mouse por cima (ou foco pelo teclado) destaca no radar.
// Ficam em ordem de nota no perfil atual — a ordem muda quando os pesos mudam, não ao ligar/desligar.
function renderModels() {
  const el = $('radarModelos');
  const focado = el.contains(document.activeElement) ? document.activeElement.dataset.model : null;
  el.replaceChildren(); previewModel = null;
  scoredModels().forEach((m, rank) => {
    const on = visible.has(m.id), nota = m.value === null ? '—' : fmt(m.value, 2);
    const b = document.createElement('button'); b.type = 'button'; b.dataset.model = m.id;
    b.className = 'radar-model-btn' + (on ? ' is-on' : '') + (focusModel === m.id ? ' is-foco' : '');
    b.style.setProperty('--model-color', m.color); b.setAttribute('aria-pressed', String(on));
    b.setAttribute('aria-label', `${rotulo(m)}: nota ${nota}${m.partial ? ' (parcial)' : ''}, ${rank + 1}º lugar. ${on ? 'Visível no radar' : 'Oculto'}.`);
    b.title = `${rank + 1}º no seu perfil · nota oficial AA: ${m.official === null ? '—' : fmt(m.official)}${m.partial ? '\n* Nota parcial: faltam dados deste modelo em algum benchmark com peso.' : ''}\nClique para ${on ? 'ocultar' : 'mostrar'} a linha.`;
    const cfg = m.setting ? '<small class="radar-model-cfg">' + esc(m.setting) + '</small>' : '';
    b.innerHTML = `<span class="radar-model-line"></span><span class="radar-model-name"><span class="radar-full-name">${esc(m.name)}</span><span class="radar-short-name">${esc(m.short)}</span>${cfg}</span><span class="radar-model-score">${nota}${m.partial ? '<sup>*</sup>' : ''}</span>`;
    b.addEventListener('click', () => { if (on) { visible.delete(m.id); if (focusModel === m.id) focusModel = null; } else { visible.add(m.id); focusModel = m.id; } update(); });
    const destacar = () => { if (visible.has(m.id) && previewModel !== m.id) { previewModel = m.id; draw(); } };
    const soltar = () => { if (previewModel === m.id) { previewModel = null; draw(); } };
    b.addEventListener('pointerenter', destacar); b.addEventListener('pointerleave', soltar);
    b.addEventListener('focus', destacar); b.addEventListener('blur', soltar);
    el.appendChild(b);
  });
  if (focado) { const alvo = [...el.children].find(x => x.dataset.model === focado); if (alvo) alvo.focus({ preventScroll: true }); }
}
function renderSliders() {
  slidersEl.replaceChildren();
  items.forEach((it, i) => {
    const card = document.createElement('div'); card.className = 'radar-slider-card';
    card.innerHTML = `<div class="radar-slider-head"><div class="radar-slider-name"><button type="button" class="radar-danger-dot" style="background:${colorRisk(it.risk)}" aria-label="Ver polêmica de ${esc(it.test)}" title="Por que este benchmark é discutível?"></button><div class="radar-slider-name-wrap"><strong>${esc(it.name)}</strong><small>${esc(it.test)}</small></div></div><span class="radar-weight"></span></div><div class="radar-slider-row"><input class="radar-range" type="range" min="0" max="${PESO_MAX}" step="1" value="${weights[i]}" aria-label="Importância de ${esc(it.name)}"><span class="radar-original">AA: ${it.official}%</span></div>`;
    it.input = card.querySelector('input'); it.weightLabel = card.querySelector('.radar-weight');
    it.input.addEventListener('input', e => { weights[i] = Number(e.target.value); activeProfile = 'custom'; update(); });
    wireTip(card.querySelector('button'), i); slidersEl.appendChild(card);
  });
}
function renderPresets() { const el = $('radarPerfis'); el.replaceChildren(); Object.entries(profiles).forEach(([key, p]) => { const b = document.createElement('button'); b.className = 'radar-preset' + (activeProfile === key ? ' is-on' : ''); b.textContent = p.name; b.type = 'button'; b.dataset.perfil = key; b.setAttribute('aria-pressed', String(activeProfile === key)); b.addEventListener('click', () => { weights = [...p.weights]; activeProfile = key; update(); }); el.appendChild(b); }); }

function update() {
  const total = wTotal(); const status = $('radarPesosStatus');
  const perfil = profiles[activeProfile];
  status.textContent = perfil ? (perfil.oficial ? 'Pesos oficiais do AA' : `Perfil: ${perfil.name}`) : 'Pesos personalizados';
  $('radarSomaPesos').textContent = `Soma dos controles: ${total}`;
  $('radarPerfilNota').textContent = profiles[activeProfile]?.note || 'Perfil personalizado: seus pesos são relativos e são normalizados para somarem 100%. As notas de cada benchmark permanecem constantes.';
  $('radarPerfis').querySelectorAll('.radar-preset').forEach(b => { const on = b.dataset.perfil === activeProfile; b.classList.toggle('is-on', on); b.setAttribute('aria-pressed', String(on)); });
  items.forEach((it, i) => { if (it.input) { it.input.value = weights[i]; it.weightLabel.textContent = total ? `${fmt(normalWeight(i))}%` : '0,0%'; } });
  const sum = $('radarInsight');
  if (!total) { sum.textContent = 'Todos os pesos estão zerados. Aumente pelo menos um para comparar as notas.'; }
  else {
    const ranked = scoredModels(), winner = ranked[0];
    const top = items.map((it, i) => ({ ...it, i, w: normalWeight(i) })).sort((a, b) => b.w - a.w).slice(0, 3);
    const leaderByCriterion = top.slice().sort((a, b) => a.i - b.i).map(t => { const comNota = models.filter(m => m.scores[t.i] !== null); const best = comNota.length ? comNota.reduce((a, b) => a.scores[t.i] >= b.scores[t.i] ? a : b) : null; return `${esc(t.name.toLowerCase())}: ${best ? esc(best.short) : '—'}`; });
    sum.innerHTML = winner.value === null ? 'Nenhum modelo tem dados nos benchmarks com peso.' : `Com seus pesos, <b>${esc(winner.name)}</b> lidera (${fmt(winner.value, 2)}${winner.partial ? ', nota parcial' : ''}). As maiores prioridades são <b>${top.map(x => esc(x.name.toLowerCase())).join(', ')}</b>.<br><br>Melhor em cada prioridade: <b>${leaderByCriterion.join(' · ')}</b>.`;
  }
  // Sem modelo destacado (ou se ele foi ocultado), destaca o primeiro colocado entre os visíveis.
  if (!focusModel || !visible.has(focusModel)) focusModel = scoredModels().find(m => visible.has(m.id))?.id || null;
  renderModels(); draw(); salvarSelecao();
}
function toast(message) { const el = $('radarToast'); el.textContent = message; el.classList.add('is-on'); clearTimeout(toast.timer); toast.timer = setTimeout(() => el.classList.remove('is-on'), 2600); }
async function copyText(t) { try { await navigator.clipboard.writeText(t); toast('Copiado!'); } catch (e) { const input = document.createElement('textarea'); input.value = t; document.body.appendChild(input); input.select(); document.execCommand('copy'); input.remove(); toast('Copiado!'); } }

// Memória da última seleção (modelos ligados/desligados e pesos), guardada neste navegador.
// Modelos novos, que ainda não estão na memória, aparecem conforme modelos.js. Um link com ?pesos= tem prioridade.
const CHAVE_MEMORIA = 'radarAA.selecao.v1';
function salvarSelecao() {
  try {
    localStorage.setItem(CHAVE_MEMORIA, JSON.stringify({
      visiveis: Object.fromEntries(models.map(m => [m.id, visible.has(m.id)])),
      perfil: activeProfile,
      pesos: Object.fromEntries(items.map((it, i) => [it.id, weights[i]]))
    }));
  } catch (e) { /* navegador sem armazenamento (ex.: janela anônima restrita): segue sem memória */ }
}
function restaurarSelecao() {
  try {
    const salvo = JSON.parse(localStorage.getItem(CHAVE_MEMORIA) || 'null');
    if (!salvo || typeof salvo !== 'object') return;
    if (salvo.visiveis && typeof salvo.visiveis === 'object') models.forEach(m => { const v = salvo.visiveis[m.id]; if (v === true) visible.add(m.id); else if (v === false) visible.delete(m.id); });
    if (salvo.perfil && profiles[salvo.perfil]) { weights = [...profiles[salvo.perfil].weights]; activeProfile = salvo.perfil; }
    else if (salvo.pesos && typeof salvo.pesos === 'object') { weights = items.map(it => clampPeso(salvo.pesos[it.id])); activeProfile = 'custom'; }
  } catch (e) { /* memória ilegível: usa o padrão */ }
}

// Links: ?pesos=briefcase:15,automation:5,...  (também aceita o formato antigo ?pesos=15,5,5,...)
// O app.js abre a aba Radar sozinho quando o link traz ?pesos=.
function bootFromUrl() {
  try {
    const raw = new URLSearchParams(location.search).get('pesos'); if (!raw) return;
    const partes = raw.split(','); const valido = x => Number.isInteger(x) && x >= 0 && x <= PESO_MAX;
    let mapa = null;
    if (partes.every(p => p.includes(':'))) { mapa = {}; partes.forEach(p => { const [k, v] = p.split(':'); mapa[k] = Number(v); }); }
    else { const nums = partes.map(Number); const ordem = nums.length === items.length ? items.map(it => it.id) : nums.length === ORDEM_LINKS_ANTIGOS.length ? ORDEM_LINKS_ANTIGOS : null; if (ordem) { mapa = {}; ordem.forEach((id, i) => mapa[id] = nums[i]); } }
    if (mapa && Object.values(mapa).every(valido)) { weights = items.map(it => mapa[it.id] ?? 0); activeProfile = 'custom'; }
  } catch (e) { /* link inválido: mantém os pesos oficiais */ }
}

mostrarAvisos();
restaurarSelecao(); bootFromUrl(); renderPresets(); renderSliders(); update();

// A aba Radar costuma estar oculta quando a página carrega. Quando ela aparece, o radar é
// redesenhado para se enquadrar no espaço; no celular, a primeira exibição começa com o centro
// do gráfico na tela (a pessoa pode arrastar para ver os rótulos laterais).
const palco = document.querySelector('.radar-chart-wrap');
let estavaVisivel = false, jaCentralizou = false;
function aoMostrar() {
  draw();
  if (!jaCentralizou && window.matchMedia('(max-width: 620px)').matches) palco.scrollLeft = Math.max(0, (palco.scrollWidth - palco.clientWidth) / 2);
  jaCentralizou = true;
}
function conferirVisibilidade() { const agora = palco.clientWidth > 0; if (agora && !estavaVisivel) aoMostrar(); estavaVisivel = agora; }
if ('ResizeObserver' in window) new ResizeObserver(conferirVisibilidade).observe(palco);
conferirVisibilidade();
window.RADAR.aoMostrar = conferirVisibilidade; // o app.js chama ao trocar de aba (reforço para navegadores sem ResizeObserver)

// Menu "O que é importante pra você?": começa recolhido; aberto, vira a coluna da direita (ou desce para baixo do radar em telas estreitas).
const grade = document.querySelector('.radar-grid'), menu = $('radarMenu'), botaoMenu = $('radarMenuToggle');
function abrirMenu(aberto) {
  const focoDentro = menu.contains(document.activeElement);
  menu.hidden = !aberto; grade.classList.toggle('menu-aberto', aberto); botaoMenu.setAttribute('aria-expanded', String(aberto));
  if (aberto && window.matchMedia('(max-width: 1100px)').matches) menu.scrollIntoView({ behavior: 'smooth', block: 'start' });
  if (!aberto && focoDentro) botaoMenu.focus();
}
botaoMenu.addEventListener('click', () => abrirMenu(menu.hidden));
$('radarMenuFechar').addEventListener('click', () => abrirMenu(false));
$('radarReset').addEventListener('click', () => { weights = [...profiles[AA_KEY].weights]; activeProfile = AA_KEY; update(); });
$('radarCopiarConfig').addEventListener('click', () => { const payload = { indice: `${nomeIndice} · notas reconstruídas`, modelos: scoredModels().map(m => ({ nome: m.name, configuracao: m.setting, nota: m.value, parcial: m.partial, referenciaAA: m.official })), pesos: Object.fromEntries(items.map((it, i) => [it.id, normalWeight(i)])) }; copyText(JSON.stringify(payload, null, 2)); });
$('radarCopiarLink').addEventListener('click', () => { const url = new URL(window.location.href); url.searchParams.set('pesos', items.map((it, i) => `${it.id}:${weights[i]}`).join(',')); copyText(url.toString()); });
document.addEventListener('keydown', e => { if (e.key === 'Escape') hideTip(); });
document.addEventListener('pointerdown', e => { if (!(e.target instanceof Element) || !e.target.closest('.radar-axis-hover')) hideTip(); });
})();
