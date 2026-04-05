/* ===== VOTO CONSCIENTE 2026 · APP.JS ===== */

// ── CONFIG ──────────────────────────────────────────────────────────────
const DIMS_PRES = [
  { key:'integ', label:'INTEGR.',   color:'#7c6fcd', w:25 },
  { key:'econ',  label:'ECON.',     color:'#2e9e6a', w:20 },
  { key:'capac', label:'CAPAC.',    color:'#3080cc', w:20 },
  { key:'inst',  label:'INSTIT.',   color:'#b07820', w:15 },
  { key:'segur', label:'SEGUR.',    color:'#c04040', w:10 },
  { key:'soc',   label:'SOCIAL',    color:'#b0408a', w:10 },
];
const DIMS_CONG = [
  { key:'integ', label:'INTEGR.',   color:'#7c6fcd', w:35 },
  { key:'prop',  label:'PROP.LEG.', color:'#2e9e6a', w:25 },
  { key:'asist', label:'ASIST.',    color:'#3080cc', w:25 },
  { key:'repr',  label:'REPRES.',   color:'#b07820', w:15 },
];

// State — showElim true por defecto para que se vean todos
const state = {
  presidentes: { data:[], weights:{}, sort:'score', asc:false, search:'', showElim:true, open:null },
  senadores:   { data:[], weights:{}, sort:'score', asc:false, search:'', showElim:true, open:null },
  diputados:   { data:[], weights:{}, sort:'score', asc:false, search:'', showElim:true, open:null },
  currentView: 'presidentes',
};

// ── INIT ──────────────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', async () => {
  await Promise.all([
    loadData('presidentes', 'data/presidentes.json'),
    loadData('senadores',   'data/senadores.json'),
    loadData('diputados',   'data/diputados.json'),
  ]);
  initWeights('presidentes', DIMS_PRES);
  initWeights('senadores',   DIMS_CONG);
  initWeights('diputados',   DIMS_CONG);
  buildMatrix('presidentes', DIMS_PRES, 'pres-container');
  buildMatrix('senadores',   DIMS_CONG, 'sen-container');
  buildMatrix('diputados',   DIMS_CONG, 'dip-container');
  updateHeroStats();
  setupNav();
  updateCountdown();
});

async function loadData(key, url) {
  try {
    const r = await fetch(url + '?v=' + Date.now());
    if (!r.ok) throw new Error('HTTP ' + r.status);
    const data = await r.json();
    // Normalizar: asegurar que eliminado sea boolean y filtro exista
    state[key].data = data.map(c => ({
      ...c,
      eliminado: c.eliminado === true,
      filtro: c.filtro || 'ok',
      puntajes: c.puntajes || {},
      encuesta_pct: c.encuesta_pct || 0,
    }));
    console.log(`✓ ${key}: ${state[key].data.length} candidatos cargados`);
  } catch(e) {
    console.error('Error cargando', url, e);
    state[key].data = [];
  }
}

function initWeights(key, dims) {
  const w = {};
  dims.forEach(d => w[d.key] = d.w);
  state[key].weights = w;
}

// ── NAV ──────────────────────────────────────────────────────────────
function setupNav() {
  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      const v = btn.dataset.view;
      if (!v) return; // ignorar el link de Congreso
      document.querySelectorAll('.nav-btn').forEach(b => b.classList.toggle('active', b===btn));
      document.querySelectorAll('.view').forEach(el => el.classList.toggle('active', el.id === 'view-'+v));
      state.currentView = v;
    });
  });
}

// ── SCORE ──────────────────────────────────────────────────────────────
function calcScore(cand, dims, weights) {
  let total = 0, wsum = 0;
  dims.forEach(d => {
    const w = weights[d.key] || 0;
    const v = cand.puntajes[d.key] ?? 0;
    total += v * w;
    wsum  += w;
  });
  return wsum > 0 ? Math.round(total / wsum) : 0;
}

function scoreColor(v) {
  if (v >= 70) return '#4db87a';
  if (v >= 50) return '#f0a030';
  return '#e05050';
}

// ── BUILD MATRIX ──────────────────────────────────────────────────────
function buildMatrix(key, dims, containerId) {
  const container = document.getElementById(containerId);
  if (!container) return;

  const isPresidente = key === 'presidentes';
  const titleMap = {
    presidentes:'Candidatos a Presidencia',
    senadores:'Candidatos al Senado',
    diputados:'Candidatos a Diputados'
  };
  const subMap = {
    presidentes:'Elección: 12 abril 2026 · Fuentes: JNE · Poder Judicial · MP',
    senadores:'Datos verificables de ex congresistas y nuevos candidatos',
    diputados:'Datos verificables de ex congresistas y nuevos candidatos'
  };

  // Contar alertas para el resumen
  const total = state[key].data.length;
  const elim  = state[key].data.filter(c => c.eliminado).length;
  const warn  = state[key].data.filter(c => c.filtro === 'warn').length;
  const bad   = state[key].data.filter(c => c.filtro === 'bad').length;

  container.innerHTML = `
    <div class="matrix-header">
      <div>
        <div class="matrix-title">${titleMap[key]}</div>
        <div class="matrix-subtitle">${subMap[key]}</div>
      </div>
      <div style="display:flex;gap:12px;flex-wrap:wrap;font-size:11px;font-family:var(--font-mono)">
        <span style="color:#4db87a">✓ ${total - bad - warn} sin alertas</span>
        <span style="color:#f0a030">⚠ ${warn} con alerta</span>
        <span style="color:#e05050">✕ ${bad} descalificados</span>
      </div>
    </div>
    <div class="controls-bar" id="${key}-controls">
      <div class="ctrl-group">
        <span class="ctrl-label">ORDENAR:</span>
        <button class="pill-btn active" data-sort="score" onclick="setSort('${key}','score',this)">Puntaje</button>
        <button class="pill-btn" data-sort="name" onclick="setSort('${key}','name',this)">Nombre</button>
        ${isPresidente ? `<button class="pill-btn" data-sort="poll" onclick="setSort('${key}','poll',this)">Encuestas</button>` : ''}
        <button class="pill-btn" data-sort="filter" onclick="setSort('${key}','filter',this)">Alertas</button>
      </div>
      <input class="search-input" type="text" placeholder="Buscar candidato o partido…" oninput="setSearch('${key}',this.value)">
      <label class="toggle-label">
        <input type="checkbox" checked onchange="toggleElim('${key}',this.checked)">
        Mostrar descalificados
      </label>
    </div>
    <div class="legend-bar">
      <div class="leg-item"><div class="leg-dot" style="background:#4db87a"></div>Sin procesos graves</div>
      <div class="leg-item"><div class="leg-dot" style="background:#f0a030"></div>Investigación / alerta</div>
      <div class="leg-item"><div class="leg-dot" style="background:#e05050"></div>Sentencia / inhabilitado</div>
    </div>
    <div class="table-wrap">
      <table id="${key}-table">
        <thead>
          <tr>
            <th>#</th>
            <th onclick="setSort('${key}','name',null)">CANDIDATO</th>
            <th onclick="setSort('${key}','filter',null)">FILTRO LEGAL</th>
            <th onclick="setSort('${key}','score',null)">PUNTAJE</th>
            ${dims.map(d=>`<th onclick="setSort('${key}','${d.key}',null)" style="color:${d.color}">${d.label}</th>`).join('')}
            ${isPresidente ? `<th>ENCUESTA</th>` : ''}
          </tr>
        </thead>
        <tbody id="${key}-tbody"></tbody>
      </table>
    </div>
    <div id="${key}-weights" class="weights-panel">
      <div class="wp-title">AJUSTA LOS PESOS SEGÚN TUS PRIORIDADES</div>
      ${dims.map(d=>`
        <div class="w-row">
          <span class="w-label">${
            d.label === 'INTEGR.'   ? 'Integridad' :
            d.label === 'ECON.'     ? 'Propuesta económica' :
            d.label === 'CAPAC.'    ? 'Capacidad de gobierno' :
            d.label === 'INSTIT.'   ? 'Propuesta institucional' :
            d.label === 'SEGUR.'    ? 'Seguridad' :
            d.label === 'SOCIAL'    ? 'Agenda social' :
            d.label === 'PROP.LEG.' ? 'Propuestas legislativas' :
            d.label === 'ASIST.'    ? 'Asistencia' : 'Representatividad'
          }</span>
          <input type="range" min="0" max="60" step="1" value="${d.w}"
            oninput="updateWeight('${key}','${d.key}',+this.value,this)">
          <span class="w-val" id="${key}-wv-${d.key}">${d.w}%</span>
        </div>
      `).join('')}
      <div class="w-total" id="${key}-wtotal">Total: 100%</div>
    </div>
    <div style="margin-top:.8rem;font-size:10px;color:#5c5a55;font-family:'DM Mono',monospace;line-height:1.8">
      Fuentes: JNE · Poder Judicial · Ministerio Público · Contraloría · Congreso de la República<br>
      Los puntajes son estimaciones editoriales basadas en información pública verificable.
      <strong style="color:#9b9890">No representan una recomendación de voto.</strong>
    </div>
  `;
  renderTable(key, dims);
}

// ── RENDER TABLE ──────────────────────────────────────────────────────
function renderTable(key, dims) {
  const s = state[key];
  const isPresidente = key === 'presidentes';
  let list = [...s.data];

  // Sort
  list.sort((a, b) => {
    let va, vb;
    if (s.sort === 'score') {
      va = calcScore(a, dims, s.weights);
      vb = calcScore(b, dims, s.weights);
    } else if (s.sort === 'name') {
      return s.asc
        ? a.nombre.localeCompare(b.nombre)
        : b.nombre.localeCompare(a.nombre);
    } else if (s.sort === 'poll') {
      va = a.encuesta_pct || 0;
      vb = b.encuesta_pct || 0;
    } else if (s.sort === 'filter') {
      const o = { ok:0, warn:1, bad:2 };
      va = o[a.filtro] ?? 0;
      vb = o[b.filtro] ?? 0;
    } else {
      va = (a.puntajes && a.puntajes[s.sort]) || 0;
      vb = (b.puntajes && b.puntajes[s.sort]) || 0;
    }
    return s.asc ? va - vb : vb - va;
  });

  const tbody = document.getElementById(key + '-tbody');
  if (!tbody) return;

  tbody.innerHTML = '';
  let rank = 0;

  list.forEach(c => {
    const isElim = c.eliminado === true;
    const score  = calcScore(c, dims, s.weights);
    const q      = (s.search || '').toLowerCase().trim();
    const visible = !q ||
      (c.nombre || '').toLowerCase().includes(q) ||
      (c.partido || '').toLowerCase().includes(q);

    if (isElim && !s.showElim) return;
    if (!visible) return;

    if (!isElim) rank++;
    const rankStr = isElim ? '—' : rank;

    // Filter badge
    const fmap = {
      ok:   '✓ Sin procesos graves',
      warn: '⚠ Investigación activa',
      bad:  '✕ Sentencia / inhabilitado'
    };
    const filtro = c.filtro || 'ok';
    const fbadge = `<span class="fbadge ${filtro}">${fmap[filtro] || filtro}</span>`;

    // Dim cells
    const dimCells = dims.map(d => {
      const v = (c.puntajes && c.puntajes[d.key] != null) ? c.puntajes[d.key] : 0;
      return `<td class="dval" style="color:${scoreColor(v)}">
        ${v}
        <div class="dbar" style="background:${d.color};width:${v}%;opacity:.5"></div>
      </td>`;
    }).join('');

    const pollCell = isPresidente
      ? `<td class="poll-val">${(c.encuesta_pct || 0)}%</td>`
      : '';

    const tr = document.createElement('tr');
    tr.className = isElim ? 'eliminated-row' : '';
    tr.dataset.id  = c.id;
    tr.dataset.key = key;
    tr.innerHTML = `
      <td style="color:#5c5a55;font-family:'DM Mono',monospace;font-size:11px">${rankStr}</td>
      <td>
        <div class="cname">${c.nombre || '—'}</div>
        <div class="cparty">${c.partido || '—'}</div>
      </td>
      <td>${fbadge}</td>
      <td class="score-cell">
        <span class="score-num" style="color:${scoreColor(score)}">${score}</span>
        <div class="score-bar-bg">
          <div class="score-bar-fill" style="width:${score}%;background:${scoreColor(score)}"></div>
        </div>
      </td>
      ${dimCells}
      ${pollCell}
    `;
    tr.addEventListener('click', () => toggleDetail(c, key, dims, tr));
    tbody.appendChild(tr);

    // Detail row (hidden)
    const dtr = document.createElement('tr');
    dtr.className = 'detail-row';
    dtr.id = `detail-${c.id}`;
    dtr.style.display = 'none';
    dtr.innerHTML = `<td colspan="${5 + dims.length + (isPresidente ? 1 : 0)}"></td>`;
    tbody.appendChild(dtr);
  });

  if (!tbody.children.length) {
    tbody.innerHTML = `<tr><td colspan="20">
      <div class="empty-state">No se encontraron candidatos con esos criterios.</div>
    </td></tr>`;
  }
}

// ── DETAIL ROW ──────────────────────────────────────────────────────
function toggleDetail(c, key, dims, tr) {
  const dtr = document.getElementById(`detail-${c.id}`);
  if (!dtr) return;
  const isOpen = dtr.style.display !== 'none';

  document.querySelectorAll('.detail-row').forEach(r => r.style.display = 'none');
  document.querySelectorAll('tbody tr.detail-open').forEach(r => r.classList.remove('detail-open'));

  if (isOpen) return;

  tr.classList.add('detail-open');
  dtr.style.display = '';
  const score = calcScore(c, dims, state[key].weights);

  const dimLabels = {
    'INTEGR.':'Integridad','ECON.':'Economía','CAPAC.':'Capacidad',
    'INSTIT.':'Institucional','SEGUR.':'Seguridad','SOCIAL':'Social',
    'PROP.LEG.':'Propuestas','ASIST.':'Asistencia','REPRES.':'Representat.'
  };

  const dimGrid = dims.map(d => {
    const v = (c.puntajes && c.puntajes[d.key] != null) ? c.puntajes[d.key] : 0;
    return `<div class="detail-dim">
      <div class="ddim-name">${dimLabels[d.label] || d.label}</div>
      <div class="ddim-val" style="color:${scoreColor(v)}">${v}<span style="font-size:11px;color:#5c5a55">/100</span></div>
    </div>`;
  }).join('');

  const sourceLinks = (c.fuentes || []).map(f => {
    if (typeof f === 'string') return `· ${f}`;
    const link = f.url
      ? `<a href="${f.url}" target="_blank" class="src-link" rel="noopener noreferrer">↗ ver fuente</a>`
      : '';
    return `· ${f.texto} ${link}`;
  }).join('<br>');

  const fmap   = { ok:'Sin procesos graves', warn:'Investigación / alerta activa', bad:'Sentencia firme o inhabilitación vigente' };
  const fcolor = { ok:'#4db87a', warn:'#f0a030', bad:'#e05050' };
  const filtro = c.filtro || 'ok';

  dtr.querySelector('td').innerHTML = `
    <div class="detail-inner">
      <div class="detail-section">
        <h4>EVALUACIÓN POR DIMENSIÓN · Puntaje total:
          <span style="color:${scoreColor(score)}">${score}/100</span>
        </h4>
        <div class="detail-dim-grid">${dimGrid}</div>
      </div>
      <div class="detail-section">
        <h4>ESTADO LEGAL · <span style="color:${fcolor[filtro]}">${fmap[filtro] || filtro}</span></h4>
        <div class="detail-filter-note">${c.filtro_nota || 'Sin información adicional.'}</div>
        <br>
        <h4 style="margin-top:.8rem">PERFIL Y CONTEXTO</h4>
        <div class="detail-resumen">${c.resumen_html || c.notas || 'Sin datos adicionales.'}</div>
        <div class="detail-sources">
          <br>FUENTES VERIFICADAS:<br>${sourceLinks || '— Sin fuentes listadas'}
        </div>
      </div>
    </div>
  `;
}

// ── CONTROLS ──────────────────────────────────────────────────────────
function setSort(key, sort, btn) {
  const s = state[key];
  if (s.sort === sort) s.asc = !s.asc;
  else { s.sort = sort; s.asc = false; }
  if (btn) {
    const parent = btn.closest('.ctrl-group') || btn.closest('.controls-bar');
    if (parent) parent.querySelectorAll('.pill-btn').forEach(b => b.classList.toggle('active', b === btn));
  }
  const dims = key === 'presidentes' ? DIMS_PRES : DIMS_CONG;
  renderTable(key, dims);
}

function setSearch(key, val) {
  state[key].search = val;
  const dims = key === 'presidentes' ? DIMS_PRES : DIMS_CONG;
  renderTable(key, dims);
}

function toggleElim(key, val) {
  state[key].showElim = val;
  const dims = key === 'presidentes' ? DIMS_PRES : DIMS_CONG;
  renderTable(key, dims);
}

function updateWeight(key, dimKey, val, input) {
  state[key].weights[dimKey] = val;
  const el = document.getElementById(`${key}-wv-${dimKey}`);
  if (el) el.textContent = val + '%';
  updateTotalMsg(key);
  const dims = key === 'presidentes' ? DIMS_PRES : DIMS_CONG;
  renderTable(key, dims);
}

function updateTotalMsg(key) {
  const total = Object.values(state[key].weights).reduce((a, b) => a + b, 0);
  const el = document.getElementById(`${key}-wtotal`);
  if (!el) return;
  el.textContent = `Total: ${total}%${total !== 100 ? ' — ajusta hasta llegar a 100%' : ''}`;
  el.className = 'w-total' + (total !== 100 ? ' warn' : '');
}

// ── HERO STATS ──────────────────────────────────────────────────────
function updateHeroStats() {
  const all   = [...state.presidentes.data, ...state.senadores.data, ...state.diputados.data];
  const total = all.length;
  const elim  = all.filter(c => c.eliminado).length;
  const warn  = all.filter(c => c.filtro === 'warn').length;
  const el1 = document.getElementById('stat-total');
  const el2 = document.getElementById('stat-elim');
  const el3 = document.getElementById('stat-warn');
  if (el1) el1.textContent = total;
  if (el2) el2.textContent = elim;
  if (el3) el3.textContent = warn;
}

// ── COUNTDOWN ──────────────────────────────────────────────────────
function updateCountdown() {
  const eleccion = new Date('2026-04-12T08:00:00-05:00');
  const ahora    = new Date();
  const diff     = eleccion - ahora;
  const el       = document.getElementById('countdown');
  if (!el) return;
  if (diff <= 0) { el.textContent = '¡HOY SE VOTA!'; return; }
  const dias = Math.floor(diff / 86400000);
  if (dias === 0)      el.textContent = '¡HOY SE VOTA!';
  else if (dias === 1) el.textContent = 'MAÑANA SE VOTA';
  else                 el.textContent = `${dias} DÍAS`;
}
