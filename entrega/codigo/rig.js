// Tia Nastácia atlética — 2D vetorial inflado (vinil). Desenho por código.
const {Path2D} = require('@napi-rs/canvas');
const PI = Math.PI, sin = Math.sin, cos = Math.cos, hyp = Math.hypot;
const clamp = (v, a, b) => Math.max(a, Math.min(b, v)), mix = (a, b, t) => a + (b - a) * t;
const P = {
  skin: {b: '#D46520', s: '#AC5319', l: '#EAA661', o: '#6A2A08'},
  skinFar: {b: '#B9561A', s: '#96460F', l: '#CF8549', o: '#5A2306'},
  tank: {b: '#F0BB26', s: '#D59E14', l: '#FBD568', o: '#93680A'},
  short: {b: '#1F1F2B', s: '#14141C', l: '#4A4A5E', o: '#08080C'},
  shortFar: {b: '#191922', s: '#101016', l: '#38384A', o: '#08080C'},
  shoe: {b: '#FBF7E9', s: '#D8D0BA', l: '#FFFFFF', o: '#7D735D'},
  hair: {b: '#2D1D14', s: '#1E130C', l: '#584429', o: '#120904'},
  scarf: {b: '#F22B0F', s: '#C43D24', l: '#FF6A4A', o: '#7E1A08'},
  gold: '#F3CD25', goldO: '#9A7808', goldL: '#FEF6C7', blush: '#E64A27', red: '#F22B0F', yel: '#F0BB26', wht: '#FBF7E9'
};
let x; // ctx
const setCtx = c => (x = c);

function capsule(ax, ay, bx, by, ra, rb) {
  const p = new Path2D(), g = Math.atan2(by - ay, bx - ax);
  p.arc(ax, ay, ra, g + PI / 2, g + 3 * PI / 2); p.arc(bx, by, rb, g - PI / 2, g + PI / 2); p.closePath(); return p;
}
function ell(cx, cy, rx, ry, r = 0) { const p = new Path2D(); p.ellipse(cx, cy, rx, ry, r, 0, 2 * PI); p.closePath(); return p; }
// contorno suave fechado passando pelos pontos médios (sentido horário = mesmo winding)
function blob(pts) {
  const p = new Path2D(), n = pts.length, m = i => [(pts[i % n][0] + pts[(i + 1) % n][0]) / 2, (pts[i % n][1] + pts[(i + 1) % n][1]) / 2];
  const s = m(n - 1); p.moveTo(s[0], s[1]);
  for (let i = 0; i < n; i++) { const e = m(i); p.quadraticCurveTo(pts[i][0], pts[i][1], e[0], e[1]); }
  p.closePath(); return p;
}
function union(paths) { const u = new Path2D(); for (const p of paths) u.addPath(p); return u; }
// grupo inflado: contorno na cor escura da peça, sombra em 2 tons (lado de baixo/direita), manchas de brilho
function vinyl(paths, pal, o = {}) {
  const ow = o.ow ?? 6.5, sh = o.sh ?? [-9, -11];
  x.save(); x.lineJoin = 'round'; x.lineCap = 'round';
  x.strokeStyle = pal.o; x.lineWidth = ow * 2; for (const p of paths) x.stroke(p);
  const U = union(paths);
  x.fillStyle = pal.s; x.fill(U);
  x.save(); x.clip(U); x.translate(sh[0], sh[1]); x.fillStyle = pal.b; x.fill(U); x.restore();
  if (o.hl) { x.save(); x.clip(U); x.fillStyle = pal.l; for (const h of o.hl) { x.globalAlpha = h[5] ?? .9; x.fill(ell(h[0], h[1], h[2], h[3], h[4] || 0)); } x.restore(); }
  if (o.after) { x.save(); x.clip(U); o.after(); x.restore(); }
  x.restore();
}
function line(pts, w, col, a = 1, cap = 'round') { x.save(); x.globalAlpha = a; x.strokeStyle = col; x.lineWidth = w; x.lineCap = cap; x.lineJoin = 'round'; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.stroke(); x.restore(); }
function curve(pts, w, col, a = 1) { x.save(); x.globalAlpha = a; x.strokeStyle = col; x.lineWidth = w; x.lineCap = 'round'; x.beginPath(); x.moveTo(pts[0][0], pts[0][1]); if (pts.length === 3) x.quadraticCurveTo(pts[1][0], pts[1][1], pts[2][0], pts[2][1]); else for (let i = 1; i < pts.length; i++) x.lineTo(pts[i][0], pts[i][1]); x.stroke(); x.restore(); }
function daisy(cx, cy, r) { x.save(); x.fillStyle = '#FFFFFF'; for (let i = 0; i < 6; i++) { const a = i / 6 * 2 * PI + .3; x.beginPath(); x.ellipse(cx + cos(a) * r * .66, cy + sin(a) * r * .66, r * .42, r * .28, a, 0, 2 * PI); x.fill(); } x.fillStyle = P.gold; x.beginPath(); x.arc(cx, cy, r * .35, 0, 2 * PI); x.fill(); x.restore(); }
function hoop(cx, cy, r, sw = 0) { x.save(); x.translate(cx, cy - r); x.rotate(sw); x.translate(-cx, -(cy - r)); x.lineWidth = r * .62; x.strokeStyle = P.goldO; x.beginPath(); x.arc(cx, cy, r, 0, 2 * PI); x.stroke(); x.lineWidth = r * .34; x.strokeStyle = P.gold; x.stroke(); x.lineWidth = r * .12; x.strokeStyle = P.goldL; x.beginPath(); x.arc(cx, cy, r, 3.5, 4.8); x.stroke(); x.restore(); }

function ik(h, f, L1, L2, pick) { // pick(k1,k2) -> escolhe solução
  let dx = f[0] - h[0], dy = f[1] - h[1], d = hyp(dx, dy); const m = L1 + L2 - .5; if (d > m) { f = [h[0] + dx / d * m, h[1] + dy / d * m]; dx = f[0] - h[0]; dy = f[1] - h[1]; d = m; }
  const a = (L1 * L1 - L2 * L2 + d * d) / (2 * d), hh = Math.sqrt(Math.max(L1 * L1 - a * a, 0)), px = h[0] + dx / d * a, py = h[1] + dy / d * a;
  const k1 = [px - dy / d * hh, py + dx / d * hh], k2 = [px + dy / d * hh, py - dx / d * hh]; return {k: pick(k1, k2), f};
}
const along = (a, b, u, w) => { const dx = b[0] - a[0], dy = b[1] - a[1], m = hyp(dx, dy), ux = dx / m, uy = dy / m; return [a[0] + dx * u - uy * w, a[1] + dy * u + ux * w]; };

/* ===================== CABEÇA DE PERFIL (olhando p/ direita) ===================== */
function headSide(F, cx, cy, rot, sc) {
  x.save(); x.translate(cx, cy); x.rotate(rot); x.scale(sc, sc);
  // laço (lado esquerdo dela = lado de lá) aparecendo atrás, no topo
  const l1 = blob([[-50, -78], [-96, -120], [-116, -96], [-96, -70]]), l2 = blob([[-52, -76], [-112, -64], [-118, -34], [-84, -48]]);
  const t1 = blob([[-60, -70], [-108, -20], [-96, -8], [-70, -50]]);
  vinyl([t1], P.scarf, {ow: 5, sh: [-4, -5]});
  vinyl([l1, l2], P.scarf, {ow: 5, sh: [-4, -6], after: () => { daisy(-98, -98, 10); daisy(-102, -56, 9); }});
  // cabelo cacheado atrás
  const C = [[-78, -18, 34], [-88, 16, 32], [-74, 50, 30], [-48, 70, 26], [-20, 78, 20], [-90, -50, 26], [-62, 34, 28]];
  vinyl(C.map(c => ell(c[0], c[1], c[2], c[2] * .95)), P.hair, {ow: 5, sh: [-5, -6], hl: C.map(c => [c[0] - 6, c[1] - 8, c[2] * .45, c[2] * .3, 0, .8])});
  // rosto
  const face = blob([[-62, -40], [-62, 30], [-40, 70], [0, 86], [46, 76], [63, 54], [68, 38], [66, 26], [73, 13], [81, -1], [71, -14], [70, -42], [40, -84], [-30, -86]]);
  vinyl([face], P.skin, {sh: [-8, -9], hl: [[10, -10, 34, 26, -.3], [67, 0, 7, 5, 0]], after: () => {
    x.fillStyle = P.blush; x.globalAlpha = .92; x.fill(ell(26, 26, 22, 14)); x.globalAlpha = 1;
  }});
  // orelha + argola
  vinyl([ell(-20, 10, 14, 20)], P.skin, {ow: 4.5, sh: [-3, -3]});
  curve([[-24, 2], [-16, 10], [-22, 20]], 3.5, P.skin.o, .6);
  hoop(-20, 50, 19, sin(F.t * 2.2) * .06);
  // lenço
  const sc2 = blob([[-74, 4], [-82, -54], [-46, -104], [20, -110], [66, -78], [78, -36], [56, -40], [10, -46], [-40, -32], [-58, -6]]);
  vinyl([sc2], P.scarf, {ow: 5.5, sh: [-6, -8], hl: [[0, -88, 40, 12, -.15, .7]], after: () => { [[-50, -66], [-14, -88], [30, -82], [-58, -24], [52, -56], [-18, -54], [14, -62]].forEach(p => daisy(p[0], p[1], 11)); }});
  // olho
  const ex = 44, ey = -14;
  if (F.happy || F.blink) curve([[ex - 11, ey + 3], [ex, ey - 9], [ex + 11, ey + 3]], 5.5, '#1C0E07');
  else { x.fillStyle = '#1C0E07'; x.fill(ell(ex, ey, 8 + (F.wide || 0) * 2, 12 + (F.wide || 0) * 3)); x.fillStyle = '#fff'; x.fill(ell(ex + 2, ey - 5, 3, 3.5)); }
  // sobrancelha
  const by = -36 + (F.brow || 0) * 6, bt = F.worry ? -.25 : 0;
  x.save(); x.translate(ex, by); x.rotate(bt); curve([[-16, 3], [0, -4], [16, 0]], 6.5, '#2D1D14'); x.restore();
  // boca
  const mo = clamp(F.mouth || 0, 0, 1);
  if (mo > .08) { const m = blob([[46, 38], [60, 32], [66, 40 + mo * 6], [58, 46 + mo * 16], [46, 46 + mo * 10]]); x.fillStyle = '#4A0E06'; x.fill(m); x.strokeStyle = '#6A2A08'; x.lineWidth = 3; x.stroke(m); x.save(); x.clip(m); x.fillStyle = '#C43D24'; x.fill(ell(56, 50 + mo * 14, 10, 6)); x.restore(); }
  else if (F.sad) curve([[44, 46], [55, 40], [64, 44]], 5, '#5A1A06');
  else curve([[42, 38], [54, 48], [66, 36]], 5, '#5A1A06');
  x.restore();
}

/* ===================== CORPO DE PERFIL ===================== */
// S: {hip:[x,y], lean(rad), fa:[x,y] tornozelo da frente, ra:[x,y] tornozelo de trás (no sofá), face, mus:{col,a,flex}, armUp}
const L1 = 255, L2 = 245;
function sideRig(S) {
  const hip = S.hip, ln = S.lean, u = [sin(ln), -cos(ln)], n = [cos(ln), sin(ln)];
  const at = (f, s) => [hip[0] + n[0] * f + u[0] * s, hip[1] + n[1] * f + u[1] * s];
  const fl = ik(hip, S.fa, L1, L2, (a, b) => a[0] > b[0] ? a : b);
  const rhip = [hip[0] - 6, hip[1] - 4];
  const rl = ik(rhip, S.ra, L1, L2 - 15, (a, b) => a[1] > b[1] ? a : b);
  const sh = at(-4, 280);
  const J = {hip, u, n, at, fk: fl.k, ff: fl.f, rk: rl.k, rf: rl.f, rhip, sh};
  return J;
}
function drawSide(S) {
  const J = sideRig(S), {hip, at, u, n} = J, F = S.face || {};
  // braço do lado de lá
  arm(J, true, S);
  // perna de trás (lado de lá) — coxa, canela, pé deitado no sofá
  legSide(J.rhip, J.rk, J.rf, true, S);
  rearShoe(J.rf);
  // tronco
  const tor = blob([[-66, -8], [-50, 110], [-62, 220], [-44, 290], [8, 310], [56, 266], [70, 196], [48, 112], [62, 0]].map(p => at(p[0], p[1])));
  const neck = capsule(...at(4, 280), ...at(18, 360), 28, 26);
  vinyl([tor, neck], P.skin, {hl: [[...at(30, 230), 30, 20, 0]]});
  // regata
  const tk = blob([[-70, 14], [-52, 112], [-64, 214], [-50, 268], [-26, 278], [-4, 240], [26, 252], [52, 262], [72, 196], [52, 112], [66, 14]].map(p => at(p[0], p[1])));
  vinyl([tk], P.tank, {sh: [-10, -10], hl: [[...at(20, 190), 28, 46, S.lean, .55]]});
  curve([at(-50, 268), at(-28, 282), at(-4, 240), at(26, 252), at(52, 262)], 13, P.tank.o);
  curve([at(-50, 268), at(-28, 282), at(-4, 240), at(26, 252), at(52, 262)], 7, P.wht);
  // short do lado de lá (sobre a coxa de trás)
  const fe = along(hip, J.fk, .5, 0), re = along(J.rhip, J.rk, .48, 0);
  vinyl([capsule(...J.rhip, ...re, 64, 52)], P.shortFar, {sh: [-7, -8]});
  // perna da frente (lado de cá)
  legSide(hip, J.fk, J.ff, false, S);
  frontShoe(J.ff);
  // short: quadril + glúteo + coxa da frente até o meio
  const sp = [blob([[-80, -40], [-92, 20], [-70, 70], [0, 82], [70, 60], [74, -10], [60, -44], [0, -50]].map(p => at(p[0], p[1]))), capsule(...hip, ...fe, 66, 56)];
  vinyl(sp, P.short, {sh: [-8, -9], hl: [[...at(-46, 20), 22, 30, 0, .35], [...along(hip, J.fk, .3, -30), 40, 12, Math.atan2(J.fk[1] - hip[1], J.fk[0] - hip[0]), .3]], after: () => {
    curve([at(-10, 60), hip, along(hip, J.fk, .55, -6)], 14, P.red);
  }});
  if (S.mus && S.mus.a > 0) { muscleGlute(J, S.mus); muscleLeg(J, S.mus); }
  // braço de cá
  arm(J, false, S);
  // cabeça
  const hc = at(34, 432);
  headSide(F, hc[0], hc[1], S.lean * .55 + (S.headTilt || 0), 1.04);
  return J;
}
function legSide(h, k, f, far, S) {
  const pal = far ? P.skinFar : P.skin;
  const th = capsule(...h, ...k, 54, 40), shn = capsule(...k, ...f, 42, 26);
  const calf = (() => { const a = Math.atan2(f[1] - k[1], f[0] - k[0]); const c = along(k, f, .34, 26); return ell(c[0], c[1], 74, 34, a); })();
  const quad = (() => { const a = Math.atan2(k[1] - h[1], k[0] - h[0]); const c = along(h, k, .55, -16); return ell(c[0], c[1], 100, 44, a); })();
  const ta = Math.atan2(k[1] - h[1], k[0] - h[0]), sa = Math.atan2(f[1] - k[1], f[0] - k[0]);
  vinyl([th, quad, shn, calf], pal, {hl: [[...along(h, k, .6, -24), 52, 16, ta, .75], [...along(k, f, .3, 18), 40, 11, sa, .7], [...k, 14, 12, 0, .6]], after: () => {
    curve([along(k, f, .12, -24), along(k, f, .3, -30), along(k, f, .5, -22)], 3.5, pal.o, .35);
    curve([along(h, k, .9, -30), along(h, k, 1.02, 0), along(h, k, .9, 30)], 3.5, pal.o, .35);
  }});
}
function frontShoe(a) { // tênis no chão, bico para a direita
  const fx = a[0], fy = a[1], FL = fy + 38;
  const up = blob([[fx - 40, FL - 6], [fx - 42, fy - 22], [fx + 6, fy - 26], [fx + 52, FL - 46], [fx + 104, FL - 30], [fx + 112, FL - 6]]);
  vinyl([up], P.shoe, {ow: 5.5, sh: [-5, -6], hl: [[fx + 20, fy - 6, 26, 10, .4, .9]], after: () => { x.fillStyle = P.yel; x.beginPath(); x.moveTo(fx - 10, FL - 8); x.quadraticCurveTo(fx + 30, fy - 10, fx + 70, FL - 8); x.closePath(); x.fill(); line([[fx + 22, FL - 42], [fx + 40, FL - 50]], 4, P.shoe.o, .6); line([[fx + 34, FL - 36], [fx + 52, FL - 44]], 4, P.shoe.o, .6); }});
  const sole = blob([[fx - 46, FL - 12], [fx + 116, FL - 12], [fx + 118, FL + 2], [fx - 46, FL + 2]]);
  vinyl([sole], {b: '#E9E2CF', s: '#CFC6AE', l: '#fff', o: P.shoe.o}, {ow: 5, sh: [-2, -3]});
}
function rearShoe(a) { // pé de trás deitado no assento: peito do pé para baixo, sola para cima, bico para a esquerda
  const fx = a[0], fy = a[1];
  const up = blob([[fx + 26, fy - 18], [fx + 22, fy + 26], [fx - 40, fy + 34], [fx - 116, fy + 30], [fx - 128, fy + 12], [fx - 110, fy - 4], [fx - 30, fy - 16]]);
  vinyl([up], P.shoe, {ow: 5.5, sh: [-5, -6], hl: [[fx - 50, fy + 6, 28, 8, 0, .9]], after: () => { x.fillStyle = P.yel; x.fill(ell(fx - 20, fy + 12, 30, 12)); }});
  const sole = blob([[fx + 30, fy - 30], [fx + 30, fy - 12], [fx - 120, fy - 2], [fx - 132, fy - 10], [fx - 118, fy - 20]]);
  vinyl([sole], {b: '#E9E2CF', s: '#CFC6AE', l: '#fff', o: P.shoe.o}, {ow: 5, sh: [-2, -3]});
}
function arm(J, far, S) {
  const pal = far ? P.skinFar : P.skin, off = far ? [-14, -6] : [0, 0];
  const sh = [J.at(-10, 266)[0] + off[0], J.at(-10, 266)[1] + off[1]];
  const hand = J.at(far ? 2 : 10, 78); hand[0] += off[0]; hand[1] += off[1];
  const r = ik(sh, hand, 132, 124, (a, b) => (a[0] - b[0]) * J.n[0] + (a[1] - b[1]) * J.n[1] < 0 ? a : b);
  const e = r.k, w = r.f;
  const ua = Math.atan2(e[1] - sh[1], e[0] - sh[0]);
  vinyl([ell(sh[0], sh[1] + 6, 34, 30, ua), capsule(...sh, ...e, 26, 21), capsule(...e, ...w, 21, 16), ell(w[0] + 4, w[1] + 2, 22, 17, .4)], pal, {hl: [[sh[0] - 6, sh[1] - 4, 20, 13, ua, .8], [...along(sh, e, .5, -14), 30, 9, ua, .7]]});
}
function muscleShape(c, rx, ry, a, col, alpha, flex) {
  const p = ell(c[0], c[1], rx, ry * (1 + .12 * flex), a);
  x.save(); x.globalAlpha = alpha;
  x.fillStyle = col.b; x.fill(p); x.strokeStyle = col.o; x.lineWidth = 4; x.stroke(p);
  x.save(); x.clip(p); x.strokeStyle = col.l; x.lineWidth = 3.5; x.globalAlpha = alpha * .8;
  for (let i = -3; i <= 3; i++) { x.beginPath(); const ox = -sin(a) * i * ry * .28, oy = cos(a) * i * ry * .28; x.moveTo(c[0] - cos(a) * rx + ox, c[1] - sin(a) * rx + oy); x.quadraticCurveTo(c[0] + ox * 1.25, c[1] + oy * 1.25, c[0] + cos(a) * rx + ox, c[1] + sin(a) * rx + oy); x.stroke(); }
  x.restore(); x.fillStyle = col.l; x.globalAlpha = alpha * .6; x.fill(ell(c[0] - cos(a) * rx * .2, c[1] - sin(a) * rx * .2 - 8, rx * .35, ry * .18, a)); x.restore();
}
const MC = {red: {b: '#D7263D', o: '#7E0F1E', l: '#FF7A88'}, green: {b: '#22B45A', o: '#0E6A30', l: '#8CF0AE'}};
function muscleLeg(J, m) {
  const col = MC[m.col] || MC.red, h = J.hip, k = J.fk, f = J.ff, a = Math.atan2(k[1] - h[1], k[0] - h[0]), b = Math.atan2(f[1] - k[1], f[0] - k[0]);
  muscleShape(along(h, k, .58, -22), 96, 30, a, col, m.a, m.flex || 0); // quadríceps
  muscleShape(along(h, k, .62, 18), 70, 18, a, col, m.a * .85, m.flex || 0);
  muscleShape(along(k, f, .34, 26), 58, 20, b, col, m.a, m.flex || 0); // panturrilha
}
function muscleGlute(J, m) { const col = MC[m.col] || MC.red; muscleShape(J.at(-62, 22), 42, 52, .2, col, m.a, m.flex || 0); }

/* ===================== DE FRENTE ===================== */
// origem: centro entre os pés, no chão. F: face; A: {thumb:0..1}
function headFront(F, cx, cy, sc) {
  x.save(); x.translate(cx, cy); x.scale(sc, sc);
  const C = [[-82, -6, 34], [-90, 30, 32], [-74, 62, 28], [82, -6, 34], [90, 30, 32], [74, 62, 28], [-50, 80, 22], [50, 80, 22]];
  vinyl(C.map(c => ell(c[0], c[1], c[2], c[2])), P.hair, {ow: 5, sh: [-5, -6], hl: C.map(c => [c[0] - 6, c[1] - 8, c[2] * .45, c[2] * .3, 0, .8])});
  vinyl([ell(-70, 18, 14, 20), ell(70, 18, 14, 20)], P.skin, {ow: 4.5, sh: [-3, -3]});
  const face = blob([[-70, -40], [-68, 30], [-44, 72], [0, 88], [44, 72], [68, 30], [70, -40], [40, -80], [-40, -80]]);
  vinyl([face], P.skin, {sh: [-7, -9], hl: [[-8, -16, 40, 26, -.2]], after: () => { x.fillStyle = P.blush; x.globalAlpha = .92; x.fill(ell(-42, 28, 20, 13)); x.fill(ell(42, 28, 20, 13)); }});
  hoop(-72, 60, 19, sin(F.t * 2.2) * .05); hoop(72, 60, 19, -sin(F.t * 2.2) * .05);
  const sc2 = blob([[-82, 0], [-84, -56], [-44, -104], [0, -112], [44, -104], [84, -56], [82, 0], [60, -34], [0, -46], [-60, -34]]);
  vinyl([sc2], P.scarf, {ow: 5.5, sh: [-6, -8], hl: [[-10, -92, 44, 12, -.1, .7]], after: () => { [[-60, -50], [-24, -84], [20, -88], [58, -58], [-4, -60], [-38, -60], [36, -64]].forEach(p => daisy(p[0], p[1], 11)); }});
  // laço do lado esquerdo dela = direita da tela
  const l1 = blob([[70, -70], [118, -116], [138, -88], [104, -62]]), l2 = blob([[72, -66], [132, -54], [128, -20], [96, -40]]);
  vinyl([l1, l2], P.scarf, {ow: 5, sh: [-4, -6], after: () => { daisy(118, -90, 10); daisy(118, -42, 9); }});
  vinyl([ell(80, -64, 18, 16)], P.scarf, {ow: 5, sh: [-3, -3]});
  // olhos
  const eye = (ex) => { const ey = -2; if (F.happy || F.blink) curve([[ex - 13, ey + 4], [ex, ey - 9], [ex + 13, ey + 4]], 6, '#1C0E07'); else { x.fillStyle = '#1C0E07'; x.fill(ell(ex, ey, 9 + (F.wide || 0) * 2, 13 + (F.wide || 0) * 3)); x.fillStyle = '#fff'; x.fill(ell(ex - 3, ey - 5, 3.4, 3.8)); } };
  eye(-30); eye(30);
  const by = -30 + (F.brow || 0) * 6, wt = F.worry ? .22 : 0;
  x.save(); x.translate(-30, by); x.rotate(wt); curve([[-16, 2], [0, -4], [16, 1]], 6.5, '#2D1D14'); x.restore();
  x.save(); x.translate(30, by); x.rotate(-wt); curve([[-16, 1], [0, -4], [16, 2]], 6.5, '#2D1D14'); x.restore();
  curve([[-8, 22], [0, 30], [8, 22]], 4.5, P.skin.o, .7);
  const mo = clamp(F.mouth || 0, 0, 1);
  if (mo > .08) { const m = blob([[-22, 44], [22, 44], [16, 50 + mo * 18], [0, 54 + mo * 22], [-16, 50 + mo * 18]]); x.fillStyle = '#4A0E06'; x.fill(m); x.save(); x.clip(m); x.fillStyle = '#fff'; x.fillRect(-24, 40, 48, 8); x.fillStyle = '#C43D24'; x.fill(ell(0, 56 + mo * 20, 13, 7)); x.restore(); x.strokeStyle = '#6A2A08'; x.lineWidth = 3; x.stroke(m); }
  else if (F.sad) curve([[-18, 54], [0, 46], [18, 54]], 5, '#5A1A06');
  else curve([[-22, 44], [0, 58], [22, 44]], 5.5, '#5A1A06');
  x.restore();
}
function drawFront(cx, fy, sc, F, A = {}) {
  x.save(); x.translate(cx, fy); x.scale(sc, sc);
  const br = sin(F.t * 2.4) * 3; // respiração
  // pernas
  const legs = [-1, 1].map(s => ({s, h: [s * 58, -500], k: [s * 62, -250], a: [s * 64, -46]}));
  for (const g of legs) {
    const th = capsule(...g.h, ...g.k, 62, 44), sh = capsule(...g.k, ...g.a, 44, 28), calf = ell(g.s * 82, -175, 30, 70, g.s * .08), quad = ell(g.s * 54, -380, 54, 104, -g.s * .06);
    vinyl([th, quad, sh, calf], P.skin, {hl: [[g.s * 40, -400, 16, 56, 0, .75], [g.s * 50, -170, 12, 40, 0, .7], [g.s * 60, -258, 14, 12, 0, .6]], after: () => { curve([[g.s * 34, -268], [g.s * 62, -250], [g.s * 88, -268]], 3.5, P.skin.o, .35); }});
    if (A.legGlow) { x.save(); x.globalAlpha = A.legGlow; muscleShape([g.s * 54, -380], 100, 42, PI / 2, MC.green, 1, 0); muscleShape([g.s * 80, -180], 56, 22, PI / 2, MC.green, 1, 0); x.restore(); }
    // tênis de frente
    const up = blob([[g.s * 64 - 44, -40], [g.s * 64 + 44, -40], [g.s * 64 + 58, 0], [g.s * 64 + 62, 14], [g.s * 64 - 62, 14], [g.s * 64 - 58, 0]]);
    vinyl([up], P.shoe, {ow: 5.5, sh: [-4, -5], hl: [[g.s * 64, -24, 30, 10, 0, .9]], after: () => { x.fillStyle = P.yel; x.fill(ell(g.s * 64 + g.s * 46, -6, 14, 18)); line([[g.s * 64 - 16, -28], [g.s * 64 + 16, -28]], 4, P.shoe.o, .6); line([[g.s * 64 - 18, -16], [g.s * 64 + 18, -16]], 4, P.shoe.o, .6); }});
    vinyl([blob([[g.s * 64 - 66, 6], [g.s * 64 + 66, 6], [g.s * 64 + 66, 22], [g.s * 64 - 66, 22]])], {b: '#E9E2CF', s: '#CFC6AE', l: '#fff', o: P.shoe.o}, {ow: 5, sh: [-2, -3]});
  }
  // short
  const shp = [blob([[-118, -620], [118, -620], [130, -520], [100, -470], [0, -440], [-100, -470], [-130, -520]]), capsule(-58, -520, -60, -400, 70, 62), capsule(58, -520, 60, -400, 70, 62)];
  vinyl(shp, P.short, {sh: [-8, -9], hl: [[-50, -560, 30, 14, 0, .35]], after: () => { for (const s of [-1, 1]) curve([[s * 124, -600], [s * 126, -500], [s * 116, -420]], 14, P.red); curve([[0, -540], [0, -470]], 4, '#3A3A4C'); }});
  if (A.gluteGlow) { muscleShape([-55, -520], 60, 40, 0, MC.green, A.gluteGlow, 0); muscleShape([55, -520], 60, 40, 0, MC.green, A.gluteGlow, 0); }
  // tronco
  x.save(); x.translate(0, br);
  const tor = blob([[-112, -900], [-122, -830], [-96, -720], [-104, -640], [-120, -600], [120, -600], [104, -640], [96, -720], [122, -830], [112, -900], [40, -930], [-40, -930]]);
  const neck = capsule(0, -920, 0, -980, 40, 38);
  vinyl([tor, neck], P.skin, {hl: [[-40, -880, 34, 18, 0]]});
  const tk = blob([[-100, -880], [-106, -820], [-92, -720], [-100, -640], [-124, -598], [124, -598], [100, -640], [92, -720], [106, -820], [100, -880], [60, -890], [40, -850], [0, -828], [-40, -850], [-60, -890]]);
  vinyl([tk], P.tank, {sh: [-10, -10], hl: [[-36, -770, 34, 60, .1, .55]]});
  curve([[-62, -890], [-40, -848], [0, -826], [40, -848], [62, -890]], 13, P.tank.o); curve([[-62, -890], [-40, -848], [0, -826], [40, -848], [62, -890]], 7, P.wht);
  for (const s of [-1, 1]) { curve([[s * 100, -884], [s * 108, -820], [s * 94, -740]], 13, P.tank.o); curve([[s * 100, -884], [s * 108, -820], [s * 94, -740]], 7, P.wht); }
  // braços
  for (const s of [-1, 1]) {
    const S0 = [s * 128, -880], up = (s === 1 && A.thumb) ? A.thumb : 0;
    const handHip = [s * 112, -620], elbHip = [s * 200, -740];
    const handUp = [s * 220, -1040], elbUp = [s * 250, -850];
    const e = [mix(elbHip[0], elbUp[0], up), mix(elbHip[1], elbUp[1], up)], w = [mix(handHip[0], handUp[0], up), mix(handHip[1], handUp[1], up)];
    const ua = Math.atan2(e[1] - S0[1], e[0] - S0[0]);
    const parts = [ell(S0[0], S0[1] + 4, 44, 40, ua), capsule(...S0, ...e, 34, 26), capsule(...e, ...w, 26, 20)];
    if (up > .5) parts.push(ell(w[0], w[1] - 6, 26, 30), capsule(w[0] + s * 8, w[1] - 24, w[0] + s * 4, w[1] - 70, 11, 11));
    else parts.push(ell(w[0], w[1] + 6, 24, 28, -s * .3));
    vinyl(parts, P.skin, {hl: [[S0[0] - s * 6, S0[1] - 6, 22, 14, ua, .8], [...along(S0, e, .5, -12 * s), 30, 9, ua, .7]]});
  }
  x.restore();
  headFront(F, 0, -1065 + br, 1.12);
  x.restore();
}

/* ===================== SOFÁ ===================== */
const SOFA = {b: '#B7C3FF', s: '#93A2F2', l: '#DCE3FF', o: '#2B2F7A'};
function sofa() {
  vinyl([blob([[64, 930], [154, 930], [158, 1300], [60, 1300]])], SOFA, {sh: [-8, -9], hl: [[96, 980, 14, 30, 0, .8]]});
  vinyl([blob([[100, 1225], [440, 1225], [440, 1300], [100, 1300]])], SOFA, {sh: [-8, -8]});
  vinyl([blob([[96, 1108], [430, 1108], [440, 1180], [430, 1232], [96, 1232]])], SOFA, {sh: [-9, -10], hl: [[230, 1132, 90, 12, 0, .8]]});
  for (const lx of [130, 400]) vinyl([blob([[lx - 16, 1298], [lx + 16, 1298], [lx + 14, 1322], [lx - 14, 1322]])], {b: '#5A3A28', s: '#45291b', l: '#7a5440', o: '#2a160c'}, {ow: 4, sh: [-2, -2]});
}

module.exports = {setCtx, drawSide, drawFront, headFront, sofa, sideRig, P, MC, muscleShape, vinyl, blob, ell, capsule, curve, line, clamp, mix};
