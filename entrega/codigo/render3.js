// Reel: agachamento búlgaro no sofá — Tia Nastácia (2D vinil) — @tianastacia.dicas
const {createCanvas, GlobalFonts, Path2D} = require('@napi-rs/canvas');
const fs = require('fs'), path = require('path'), {spawn} = require('child_process');
const R = require('./rig.js');
const ROOT = path.resolve(__dirname, '..');
GlobalFonts.registerFromPath(ROOT + '/fonts/Poppins-Bold.ttf', 'PopB');
GlobalFonts.registerFromPath(ROOT + '/fonts/Poppins-ExtraBold.ttf', 'PopXB');
GlobalFonts.registerFromPath(ROOT + '/fonts/Poppins-Black.ttf', 'PopK');
const W = 1080, H = 1920, FPS = 30, FL = 1320;
const WORDS = JSON.parse(fs.readFileSync(ROOT + '/work3/words.json'));
const ENV = JSON.parse(fs.readFileSync(ROOT + '/work3/env.json'));
let TN = 0;
const DUR = 72.2, NF = Math.round(DUR * FPS);
const cv = createCanvas(W, H), x = cv.getContext('2d'); R.setCtx(x);
const {clamp, mix} = R, PI = Math.PI, sin = Math.sin, cos = Math.cos;
const ss = t => { t = clamp(t, 0, 1); return t * t * (3 - 2 * t); };
const easeBack = t => { t = clamp(t, 0, 1); const c = 1.9; return 1 + (c + 1) * Math.pow(t - 1, 3) + c * Math.pow(t - 1, 2); };
const COL = {dark: '#17141A', red: '#E8364B', blue: '#2F86F0', green: '#1FAF55', orange: '#F08A24', purple: '#8B5CF0', yellow: '#F6C731'};

/* ---------------- cenário ---------------- */
function background() {
  const g = x.createLinearGradient(0, 0, 0, FL); g.addColorStop(0, '#2C6BE1'); g.addColorStop(1, '#1E52B4');
  x.fillStyle = g; x.fillRect(0, 0, W, FL);
  const f = x.createRadialGradient(540, FL + 140, 60, 540, FL + 140, 760); f.addColorStop(0, '#1F55B9'); f.addColorStop(1, '#1C4EAF');
  x.fillStyle = f; x.fillRect(0, FL, W, H - FL);
  x.fillStyle = '#18469E'; x.fillRect(0, FL - 2, W, 5);
}
function shadow(cx, rx) { x.save(); x.fillStyle = 'rgba(10,28,88,.38)'; x.beginPath(); x.ellipse(cx, FL + 22, rx, 22, 0, 0, 2 * PI); x.fill(); x.restore(); }

/* ---------------- grafismos ---------------- */
function rrect(px, py, w, h, r) { x.beginPath(); x.moveTo(px + r, py); x.arcTo(px + w, py, px + w, py + h, r); x.arcTo(px + w, py + h, px, py + h, r); x.arcTo(px, py + h, px, py, r); x.arcTo(px, py, px + w, py, r); x.closePath(); }
function popK(t, t0) { return t0 === undefined ? 1 : easeBack((t - t0) / .15) ; }
// pílula de etiqueta: align 'left' (x = borda esquerda) ou 'center'
function pill(t, t0, text, bg, px, py, o = {}) {
  if (t < t0) return 0;
  const h = o.h || 44, fs = o.fs || 24, fg = o.fg || '#fff', font = `${fs}px ${o.font || 'PopXB'}`;
  x.save(); x.font = font; const check = text.startsWith('✓'); const label = check ? text.slice(1).trim() : text;
  const tw = x.measureText(label).width + (check ? fs * 1.1 : 0), w = tw + h * .9;
  const k = popK(t, t0), left = o.align === 'center' ? px - w / 2 : px;
  x.translate(left + (o.align === 'center' ? w / 2 : 0), py + h / 2); x.scale(k, k); x.translate(-(o.align === 'center' ? w / 2 : 0), -h / 2);
  x.fillStyle = 'rgba(8,20,70,.28)'; rrect(3, 5, w, h, h / 2); x.fill();
  x.fillStyle = '#fff'; rrect(-3, -3, w + 6, h + 6, h / 2 + 3); x.fill();
  x.fillStyle = bg; rrect(0, 0, w, h, h / 2); x.fill();
  x.fillStyle = fg; x.textBaseline = 'middle'; x.textAlign = 'left';
  let tx = h * .45;
  if (check) { x.strokeStyle = fg; x.lineWidth = fs * .17; x.lineCap = 'round'; x.lineJoin = 'round'; x.beginPath(); x.moveTo(tx, h / 2); x.lineTo(tx + fs * .3, h / 2 + fs * .3); x.lineTo(tx + fs * .78, h / 2 - fs * .32); x.stroke(); tx += fs * 1.1; }
  x.fillText(label, tx, h / 2 + fs * .06);
  x.restore(); return w;
}
// pilha de etiquetas no canto superior esquerdo. items: [t0, texto, cor, header?]
function stackLeft(t, items) {
  let y = 70;
  for (const [t0, tx, c, hd, fg] of items) { if (t < t0) continue; const h = hd ? 58 : 46; pill(t, t0, tx, COL[c] || c, 46, y, {h, fs: hd ? 30 : 24, fg}); y += h + 14; }
}
function stackCenter(t, items, y = 74) {
  for (const [t0, tx, c, hd, fg] of items) { if (t < t0) continue; const h = hd ? 62 : 48; pill(t, t0, tx, COL[c] || c, 540, y, {h, fs: hd ? 32 : 25, align: 'center', fg}); y += h + 14; }
}
function calendar(t, t0) {
  if (t < t0) return; const k = popK(t, t0); x.save(); x.translate(205, 560); x.scale(k, k); x.rotate(-.06);
  x.fillStyle = 'rgba(8,20,70,.3)'; rrect(-92, -100, 190, 212, 22); x.fill();
  x.fillStyle = '#fff'; rrect(-96, -106, 192, 212, 22); x.fill();
  x.save(); rrect(-96, -106, 192, 212, 22); x.clip(); x.fillStyle = COL.red; x.fillRect(-96, -106, 192, 58); x.restore();
  x.fillStyle = '#fff'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '26px PopXB'; x.fillText('DESAFIO', 0, -75);
  x.fillStyle = COL.dark; x.font = '96px PopK'; x.fillText('30', 0, 12); x.fillStyle = '#7A7A86'; x.font = '24px PopXB'; x.fillText('DIAS', 0, 76);
  for (const s of [-1, 1]) { x.fillStyle = '#C9CDD8'; x.beginPath(); x.arc(s * 58, -106, 11, 0, 2 * PI); x.fill(); }
  x.restore();
}
function counter(t, t0, n, max) {
  if (t < t0) return; const k = popK(t, t0); x.save(); x.translate(200, 560); x.scale(k, k);
  x.fillStyle = 'rgba(8,20,70,.3)'; rrect(-126 + 4, -92 + 6, 252, 168, 26); x.fill();
  x.fillStyle = '#B98A0C'; rrect(-130, -96, 260, 176, 28); x.fill();
  x.fillStyle = COL.yellow; rrect(-122, -88, 244, 160, 22); x.fill();
  x.fillStyle = COL.dark; x.textAlign = 'center'; x.textBaseline = 'middle'; x.font = '104px PopK'; x.fillText(String(n), 0, -14); x.font = '25px PopXB'; x.fillText('REPS POR PERNA', 0, 50);
  x.fillStyle = 'rgba(255,255,255,.85)'; rrect(-110, 100, 220, 16, 8); x.fill(); x.fillStyle = COL.orange; rrect(-110, 100, Math.max(16, 220 * n / max), 16, 8); x.fill();
  x.restore();
}
function ring(cx, cy, col, t, t0, r0 = 46) {
  if (t < t0) return; const k = popK(t, t0); x.save(); x.lineWidth = 7; x.strokeStyle = col;
  x.globalAlpha = 1; x.beginPath(); x.arc(cx, cy, r0 * k, 0, 2 * PI); x.stroke();
  const ph = ((t - t0) % .9) / .9; x.globalAlpha = 1 - ph; x.beginPath(); x.arc(cx, cy, r0 + ph * 50, 0, 2 * PI); x.stroke(); x.restore();
}
function badge(t, t0, ok, cx = 900, cy = 330) {
  if (t < t0) return; const k = popK(t, t0); x.save(); x.translate(cx, cy); x.scale(k, k);
  x.fillStyle = '#fff'; x.beginPath(); x.arc(0, 0, 58, 0, 2 * PI); x.fill(); x.lineWidth = 10; x.strokeStyle = ok ? COL.green : COL.red; x.beginPath(); x.arc(0, 0, 48, 0, 2 * PI); x.stroke();
  x.lineCap = 'round'; x.lineWidth = 14; x.beginPath(); if (ok) { x.moveTo(-24, 2); x.lineTo(-6, 22); x.lineTo(26, -18); } else { x.moveTo(-20, -20); x.lineTo(20, 20); x.moveTo(20, -20); x.lineTo(-20, 20); } x.stroke(); x.restore();
}
function arrowV(t, t0, t1, cx, y0, y1, col) {
  if (t < t0 || t > t1) return; const k = popK(t, t0), a = Math.min(1, (t1 - t) / .15); x.save(); x.globalAlpha = a; x.translate(cx, (y0 + y1) / 2); x.scale(k, k); x.translate(-cx, -(y0 + y1) / 2);
  const dir = Math.sign(y1 - y0), bob = sin(t * 6) * 8 * dir;
  x.strokeStyle = '#fff'; x.lineWidth = 34; x.lineCap = 'round'; x.beginPath(); x.moveTo(cx, y0 + bob); x.lineTo(cx, y1 - dir * 30 + bob); x.stroke();
  x.strokeStyle = col; x.lineWidth = 20; x.stroke();
  x.fillStyle = '#fff'; x.beginPath(); x.moveTo(cx - 48, y1 - dir * 56 + bob); x.lineTo(cx + 48, y1 - dir * 56 + bob); x.lineTo(cx, y1 + dir * 14 + bob); x.closePath(); x.fill();
  x.fillStyle = col; x.beginPath(); x.moveTo(cx - 34, y1 - dir * 48 + bob); x.lineTo(cx + 34, y1 - dir * 48 + bob); x.lineTo(cx, y1 + bob); x.closePath(); x.fill(); x.restore();
}
function floorArrow(t, t0, x0, x1, y) {
  if (t < t0) return; const g = ss((t - t0) / .45), xe = mix(x0, x1, g); x.save(); x.strokeStyle = '#4BE38A'; x.lineWidth = 9; x.setLineDash([22, 14]); x.lineDashOffset = -t * 40;
  x.beginPath(); x.moveTo(x0, y); x.lineTo(xe, y); x.stroke(); x.setLineDash([]); x.fillStyle = '#4BE38A';
  for (const [px, d] of [[x0, -1], [xe, 1]]) { x.beginPath(); x.moveTo(px + d * 26, y); x.lineTo(px - d * 6, y - 20); x.lineTo(px - d * 6, y + 20); x.closePath(); x.fill(); }
  x.restore();
}
function label(t, t0, text, lx, ly, tx, ty) {
  if (t < t0) return; const k = popK(t, t0); x.save();
  x.strokeStyle = '#fff'; x.lineWidth = 4; x.globalAlpha = Math.min(1, (t - t0) / .15); x.beginPath(); x.moveTo(lx, ly); x.lineTo(tx, ty); x.stroke();
  x.fillStyle = '#fff'; x.beginPath(); x.arc(tx, ty, 9, 0, 2 * PI); x.fill(); x.fillStyle = COL.dark; x.beginPath(); x.arc(tx, ty, 4.5, 0, 2 * PI); x.fill(); x.restore();
  pill(t, t0, text, COL.yellow, lx, ly - 26, {h: 52, fs: 27, fg: COL.dark, align: 'center'});
}
function star(cx, cy, r, a = 1) { x.save(); x.globalAlpha = a; x.fillStyle = '#FFE15A'; x.beginPath(); for (let i = 0; i < 8; i++) { const rr = i % 2 ? r * .32 : r, an = i / 8 * 2 * PI - PI / 2; x.lineTo(cx + cos(an) * rr, cy + sin(an) * rr); } x.closePath(); x.fill(); x.restore(); }
function sparkles(t, t0, pts) { if (t < t0) return; pts.forEach(([px, py], i) => { const ph = (t - t0) * 2.2 + i * .7, s = .5 + .5 * sin(ph * PI); star(px, py, 14 + 16 * s, .35 + .65 * s); }); }
function tremble(t, t0, J) { if (t < t0) return; const k = J.fk; for (let i = 0; i < 3; i++) { const a = -.9 + i * .5, j = sin(t * 60 + i) * 4, r0 = 70, r1 = 100; R.line([[k[0] + cos(a) * r0 + j, k[1] + sin(a) * r0], [k[0] + cos(a) * r1 + j, k[1] + sin(a) * r1]], 7, '#FF4D5E'); R.line([[k[0] - 120 + cos(a + PI) * 0 + j, k[1] - 40 + i * 30], [k[0] - 150 + j, k[1] - 50 + i * 30]], 6, '#FF4D5E', .8); } }
function flames(t, t0, J) {
  if (t < t0) return; const g = clamp((t - t0) / .25, 0, 1);
  for (let i = 0; i < 4; i++) { const p = [mix(J.hip[0], J.fk[0], .25 + i * .2), mix(J.hip[1], J.fk[1], .25 + i * .2) - 56], fl = 1 + .18 * sin(t * 14 + i * 2), s = g * (i % 2 ? .8 : 1);
    for (const [c, sc] of [['#FF5A1F', 1], ['#FFC23A', .58]]) { x.save(); x.translate(p[0], p[1]); x.scale(s * sc, s * sc * fl); x.fillStyle = c; x.beginPath(); x.moveTo(0, -62); x.bezierCurveTo(30, -26, 34, 6, 0, 24); x.bezierCurveTo(-34, 6, -30, -26, 0, -62); x.fill(); x.restore(); } }
}
function flash(t, t0) { const a = 1 - clamp((t - t0) / .3, 0, 1); if (t >= t0 && a > 0) { x.save(); x.globalAlpha = a * .75; x.fillStyle = '#DCE8FF'; x.fillRect(0, 0, W, H); x.restore(); } }

/* ---------------- legenda (igual à referência: pílula branca, Poppins Bold, 1 palavra por vez) ---------------- */
const KEY = new Set(['perna', 'pernas', 'búlgaro', '30', 'sofá', 'cuidado', 'erro', 'perto', 'equilíbrio', 'peito', 'tronco', 'devagar', 'controle', 'empurrando', 'chão', 'acontece', 'descida', 'subida', 'quadríceps', 'glúteos', 'força', 'fortalecer', 'Semana', '1', '2', '3', '4', '8', '10', '12', '15', 'repetições', 'tremendo', 'queimar', 'firmeza', 'estável', 'controlado', 'ativos', 'melhorar', 'casa', 'Instagram', 'Tia', 'Nastácia', 'frente', 'passo', 'incline', 'coxa', 'músculos', 'esforço', 'trás', 'afastado', 'desça', 'subindo', 'academia', 'aparelho', 'exercício', 'siga']);
x.font = '100px PopB'; const ASC = x.measureText('l').actualBoundingBoxAscent / 100; const CAP_FS = Math.round(60 / ASC);
function caption(t) {
  const w = WORDS.find(w => t >= w.t0 && t < w.t1); if (!w) return;
  const s = w.w, kk = 1 - .14 * Math.pow(1 - clamp((t - w.t0) / .0667, 0, 1), 1.2); x.save(); x.font = `${CAP_FS}px PopB`; const tw = x.measureText(s).width, pw = tw + 102, ph = 107, cx = 540, cy = 1649;
  x.translate(cx, cy); x.scale(kk, kk); x.translate(-cx, -cy); x.fillStyle = '#FFFFFF'; rrect(cx - pw / 2, cy - ph / 2, pw, ph, 18); x.fill();
  x.fillStyle = KEY.has(s) ? '#EC8824' : '#17141A'; x.textAlign = 'center'; x.textBaseline = 'alphabetic';
  x.fillText(s, cx, cy + 60 / 2 - 1); x.restore();
}

/* ---------------- personagem ---------------- */
function faceAt(t, extra = {}) {
  const f = Math.floor(TN * FPS), speaking = WORDS.some(w => TN >= w.t0 - .02 && TN < w.t1 + .02);
  const e = speaking ? (ENV[f] || 0) : 0; const blink = (t % 3.4) < .12 && !extra.happy;
  return Object.assign({t, mouth: clamp(e * 1.1 - .12, 0, 1), blink}, extra);
}
function sideState(d, mode = 'ok', lean0 = 0) {
  if (mode === 'wrong') return {hip: [mix(548, 560, d), mix(880, 975, d)], lean: mix(.34, .56, d), fa: [650, FL - 38], ra: [410, 1076]};
  return {hip: [mix(612, 632, d), mix(832, 1010, d)], lean: mix(.1, .24, d) + lean0, fa: [800, FL - 38], ra: [410, 1076]};
}
const rep = (t, t0, T) => t < t0 ? 0 : (1 - cos(2 * PI * (t - t0) / T)) / 2;
function side(t, d, o = {}) {
  const S = Object.assign(sideState(d, o.mode, o.lean0 || 0), {face: faceAt(t, o.face || {}), mus: o.mus || null});
  if (o.shake) { S.hip = [S.hip[0] + sin(t * 47) * o.shake, S.hip[1] + cos(t * 39) * o.shake * .5]; }
  if (o.sway) { S.lean += sin(t * 5.5) * o.sway; S.hip = [S.hip[0] + sin(t * 5.5) * o.sway * 60, S.hip[1]]; }
  const K = 1.12, mp = p => [540 + (p[0] - 540) * K, FL + (p[1] - FL) * K];
  x.save(); x.translate(540, FL); x.scale(K, K); x.translate(-540, -FL);
  R.sofa(); shadow(640, 330); const J = R.drawSide(S); x.restore();
  return {hip: mp(J.hip), fk: mp(J.fk), ff: mp(J.ff), rf: mp(J.rf), at: (a, b) => mp(J.at(a, b))};
}
function front(t, o = {}) { shadow(540, 190); R.drawFront(540, 1336, .82, faceAt(t, o.face || {}), o.A || {}); }

/* ---------------- roteiro (tempos vindos do áudio) ---------------- */
/* ---------------- roteiro v3 (tempos do áudio novo, mesmos movimentos e grafismos) ---------------- */
function frame(t) {
  TN = t;
  background();
  // CENA 1 — gancho (0 – 7.36)
  if (t < 7.36) {
    side(t, rep(t, .3, 2.6), {mus: t > 1.24 ? {col: 'red', a: ss((t - 1.24) / .25), flex: rep(t, .3, 2.6)} : null, face: {}});
    stackLeft(t, [[0, 'O QUE ACONTECE?', 'dark', 1], [2.82, 'AGACHAMENTO BÚLGARO', 'red'], [6.52, 'SÓ PRECISA DE UM SOFÁ', 'blue']]);
    calendar(t, 4.3);
  }
  // CENA 2 — "mas cuidado com um erro comum" (7.36 – 9.3)
  else if (t < 9.3) {
    front(t, {face: {worry: 1, brow: -.5}});
    stackCenter(t, [[7.36, 'MAS CUIDADO...', 'dark', 1], [8.3, 'O ERRO MAIS COMUM', 'red']]);
  }
  // CENA 3 — ERRADO (9.3 – 14.22)
  else if (t < 14.22) {
    const d = .25 + .25 * sin((t - 9.3) * 2.2);
    const J = side(t, d, {mode: 'wrong', face: {worry: 1, sad: 1, wide: .5}, sway: t > 11.68 ? .05 : 0});
    ring(J.ff[0] + 34, J.ff[1] + 4, '#FF3B4E', t, 9.72, 62);
    stackLeft(t, [[9.3, 'ERRADO', 'red', 1], [10.46, 'PÉ PERTO DEMAIS DO SOFÁ', 'dark'], [12.46, 'PERDE O EQUILÍBRIO', 'dark'], [13.2, 'TRAVA O MOVIMENTO', 'red']]);
    badge(t, 13.2, false, 880, 300);
  }
  // CENA 4 — CERTO: posição (14.22 – 19.1)
  else if (t < 19.1) {
    const J = side(t, .04 + .03 * sin(t * 2.4), {lean0: .02, face: {happy: t < 15.4}});
    ring(J.rf[0] - 50, J.rf[1] + 4, '#4BE38A', t, 15.4, 60);
    floorArrow(t, 17.39, 440, 820, FL + 60);
    stackLeft(t, [[14.22, 'CERTO', 'green', 1], [15.4, 'PÉ DE TRÁS NO SOFÁ', 'green'], [17.39, 'PÉ DA FRENTE AFASTADO', 'green']]);
  }
  // CENA 5 — desce devagar / sobe com a perna da frente (19.1 – 23.15)
  else if (t < 23.15) {
    const d = t < 20.4 ? ss((t - 19.1) / 1.3) : t < 20.52 ? 1 : 1 - ss((t - 20.52) / 1.7);
    const J = side(t, d, {lean0: .06, face: {happy: t > 22.3}});
    arrowV(t, 19.1, 20.5, 960, 640, 900, COL.orange);
    arrowV(t, 20.52, 22.6, 960, 900, 640, COL.green);
    if (t > 21.78) ring(J.ff[0] + 34, J.ff[1] + 10, '#4BE38A', t, 21.78, 62);
    stackLeft(t, [[19.1, 'CERTO', 'green', 1], [19.1, 'DESÇA DEVAGAR', 'green'], [20.52, 'SUBA COM A PERNA DA FRENTE', 'blue']]);
    badge(t, 22.3, true, 880, 300);
  }
  // CENA 6 — por dentro da perna (23.15 – 31.7)
  else if (t < 31.7) {
    let d, flex = 0;
    if (t < 23.32) d = 0; else if (t < 25.9) d = ss((t - 23.32) / 2.5); else if (t < 26.04) d = 1; else if (t < 28.7) { d = 1 - ss((t - 26.04) / 2.6); flex = 1; } else { d = rep(t, 29.24, 1.7); flex = d; }
    const green = t > 29.55;
    const J = side(t, d, {lean0: .06, mus: {col: green ? 'green' : 'red', a: ss((t - 23.15) / .3), flex}, face: {happy: t > 29.55}});
    stackCenter(t, [[23.15, 'POR DENTRO DA PERNA', 'dark', 1]]);
    if (t < 26.04) stackCenter(t, [[23.32, 'NA DESCIDA: CONTROLE', 'blue']], 150);
    else if (t < 29.55) stackCenter(t, [[26.04, 'NA SUBIDA: FORÇA', 'red']], 150);
    else stackCenter(t, [[29.55, 'É AÍ QUE A PERNA FORTALECE', 'green']], 150);
    if (t < 29.55) {
      const q = [mix(J.hip[0], J.fk[0], .58), mix(J.hip[1], J.fk[1], .58) - 22], gl = J.at(-62, 22);
      label(t, 27.66, 'QUADRÍCEPS', 930, 760, q[0], q[1]);
      label(t, 28.24, 'GLÚTEOS', 250, 700, gl[0], gl[1]);
    }
    sparkles(t, 29.55, [[860, 760], [430, 820], [900, 1000], [520, 640]]);
  }
  // CENAS 7–10 — semanas
  else if (t < 52.75) {
    const WK = [[31.7, 37.0, 1, 8, 'orange', 35.84, 'PERNA TREMENDO', 'red'], [37.0, 41.74, 2, 10, 'blue', 39.88, 'COXA QUEIMANDO', 'red'], [41.74, 47.22, 3, 12, 'purple', 45.68, 'MAIS FORÇA E FIRMEZA', 'green'], [47.22, 52.75, 4, 15, 'green', 51.22, 'MAIS ESTÁVEL E CONTROLADO', 'green']];
    const k = WK.find(w => t >= w[0] && t < w[1]); const [a, b, n, reps, c, tt, ttx, tc] = k;
    const T = n === 1 ? 1.5 : n === 2 ? 1.4 : n === 3 ? 1.35 : 1.6, d = rep(t, a + .25, T);
    const cnt = Math.min(reps, Math.floor(clamp((t - (a + .4)) / (b - a - 1.0), 0, 1) * reps + .0001));
    const J = side(t, d, {lean0: .06, mus: {col: n >= 3 && t > tt ? 'green' : 'red', a: 1, flex: d}, shake: n === 1 && t > tt ? 3 : 0, face: n === 1 && t > tt ? {worry: 1, wide: .4} : n === 2 && t > tt ? {worry: 1} : n === 4 && t > tt ? {happy: 1} : {}});
    if (n === 1) tremble(t, tt, J);
    if (n === 2) flames(t, tt, J);
    if (n === 4) sparkles(t, tt, [[860, 700], [440, 760], [920, 980]]);
    if (n === 3 && t > tt) sparkles(t, tt, [[900, 820], [420, 880]]);
    stackCenter(t, [[a, `SEMANA ${n}`, c, 1], [tt, ttx, tc]]);
    counter(t, a + .1, cnt, reps);
    flash(t, a);
  }
  // CENA 11 — em 30 dias (52.75 – 60.62)
  else if (t < 60.62) {
    front(t, {face: {happy: t > 55.6 && (t % 2.6) < 1.6}, A: {legGlow: ss((t - 55.6) / .3) * .9, gluteGlow: ss((t - 57.8) / .3) * .9}});
    stackCenter(t, [[52.75, 'EM 30 DIAS', 'orange', 1], [55.6, '✓ PERNAS MAIS FORTES', 'green'], [57.8, '✓ GLÚTEOS MAIS ATIVOS', 'green'], [59.52, '✓ EQUILÍBRIO MELHOR', 'blue']]);
    if (t > 59.52) sparkles(t, 59.52, [[300, 900], [800, 980], [260, 1180], [820, 1200]]);
  }
  // CENA 12 — em casa, só com um sofá (60.62 – 63.4)
  else if (t < 63.4) {
    side(t, rep(t, 60.62, 1.5), {lean0: .06, face: {happy: t > 62.04}});
    stackCenter(t, [[61.18, 'SEM ACADEMIA, EM CASA', 'red', 1], [62.04, 'SÓ COM UM SOFÁ', 'blue']]);
  }
  // CENA 13 — CTA (63.4 – fim)
  else {
    const up = ss((t - 63.5) / .45);
    shadow(640, 190); R.drawFront(640, 1336, .82, faceAt(t, {happy: t > 67.12 && t < 68.0}), {thumb: up});
    if (t >= 65.7) {
      const k = popK(t, 65.7); x.save(); x.translate(540, 112); x.scale(k, k);
      x.fillStyle = '#fff'; x.beginPath(); x.arc(0, 0, 70, 0, 2 * PI); x.fill(); x.fillStyle = '#FFD9A8'; x.beginPath(); x.arc(0, 0, 63, 0, 2 * PI); x.fill();
      x.save(); x.beginPath(); x.arc(0, 0, 63, 0, 2 * PI); x.clip(); R.headFront({t, happy: 1}, 0, 18, .5); x.restore(); x.restore();
    }
    pill(t, 66.88, 'SIGA A TIA NASTÁCIA', COL.green, 540, 196, {h: 58, fs: 30, align: 'center'});
    if (t >= 67.12) { const k2 = popK(t, 67.12); x.save(); x.translate(540, 290); x.scale(k2, k2); x.font = '34px PopXB'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillStyle = 'rgba(8,20,70,.35)'; x.fillText('@tianastacia.dicas', 2, 3); x.fillStyle = '#fff'; x.fillText('@tianastacia.dicas', 0, 0); x.restore(); }
    stackLeft2(t, [[68.04, '1 EXERCÍCIO POR DIA', 'orange'], [69.64, 'SEM ACADEMIA', 'red'], [70.73, 'SEM APARELHO', 'purple']]);
  }
  caption(TN);
}
function stackLeft2(t, items) { let y = 700; for (const [t0, tx, c] of items) { if (t < t0) continue; pill(t, t0, tx, COL[c], 40, y, {h: 54, fs: 27}); y += 70; } }

/* ---------------- saída ---------------- */
async function main() {
  const args = process.argv.slice(2);
  if (args[0] === '--frames') { // quadros de conferência
    const ts = args[1].split(',').map(Number); fs.mkdirSync(ROOT + '/work/frames', {recursive: true});
    for (const t of ts) { frame(t); fs.writeFileSync(`${ROOT}/work/frames/f_${t.toFixed(2)}.png`, cv.toBuffer('image/png')); }
    return;
  }
  const out = args[0] || ROOT + '/work3/silent.mp4';
  const ff = spawn('ffmpeg', ['-y', '-v', 'error', '-f', 'rawvideo', '-pix_fmt', 'rgba', '-s', `${W}x${H}`, '-r', String(FPS), '-i', '-', '-c:v', 'libx264', '-preset', 'medium', '-crf', '18', '-pix_fmt', 'yuv420p', out], {stdio: ['pipe', 'inherit', 'inherit']});
  for (let f = 0; f < NF; f++) {
    frame(f / FPS);
    const buf = Buffer.from(x.getImageData(0, 0, W, H).data.buffer);
    if (!ff.stdin.write(buf)) await new Promise(r => ff.stdin.once('drain', r));
    if (f % 300 === 0) console.log('frame', f, '/', NF);
  }
  ff.stdin.end(); await new Promise(r => ff.on('close', r)); console.log('ok', out);
}
main();
