/**
 * StickerEditor – engine canvas thuần TypeScript (không phụ thuộc Vue).
 * Layer: image (đã tách nền) / text / decoration / paint (cọ vẽ).
 * Lịch sử: snapshot bất biến (canvas chỉ bị thay thế, không sửa tại chỗ sau khi snapshot).
 */
import { canvasToWebp, STICKER_SIZE } from '@/services/imageExport';

export interface Transform { x: number; y: number; scale: number; rotation: number }

interface Base { id: string; transform: Transform; hidden: boolean }
export interface ImageLayer extends Base { kind: 'image'; canvas: HTMLCanvasElement }
export interface DecorLayer extends Base { kind: 'decor'; img: HTMLImageElement; url: string; width: number; height: number }
export interface TextLayer extends Base {
  kind: 'text'; text: string; font: string; color: string; strokeColor: string; strokeWidth: number; size: number;
}
export interface PaintLayer extends Base { kind: 'paint'; canvas: HTMLCanvasElement }
export type Layer = ImageLayer | DecorLayer | TextLayer | PaintLayer;

export type Tool = 'move' | 'brush' | 'erase';
export interface Background { color: string | null }
export interface BrushSettings { color: string; size: number }

interface Snapshot { layers: Layer[]; background: Background; selectedId: string | null }

let uid = 0;
const nextId = () => `l${Date.now().toString(36)}${(uid++).toString(36)}`;

function cloneCanvas(c: HTMLCanvasElement): HTMLCanvasElement {
  const n = document.createElement('canvas');
  n.width = c.width;
  n.height = c.height;
  n.getContext('2d')!.drawImage(c, 0, 0);
  return n;
}

export class StickerEditor {
  readonly size = STICKER_SIZE;
  layers: Layer[] = [];
  background: Background = { color: null };
  selectedId: string | null = null;
  tool: Tool = 'move';
  brush: BrushSettings = { color: '#ff6aa0', size: 14 };
  eraserSize = 28;

  private ctx: CanvasRenderingContext2D;
  private undoStack: Snapshot[] = [];
  private redoStack: Snapshot[] = [];
  private listeners = new Set<() => void>();
  private pointers = new Map<number, { x: number; y: number }>();
  private drag: { id: string; dx: number; dy: number } | null = null;
  private pinch: { dist: number; angle: number; scale: number; rotation: number } | null = null;
  private stroke: { layerId: string; last: { x: number; y: number } } | null = null;
  private raf = 0;
  private detach: (() => void) | null = null;

  constructor(private canvas: HTMLCanvasElement) {
    canvas.width = this.size;
    canvas.height = this.size;
    this.ctx = canvas.getContext('2d')!;
    this.attach();
    this.render();
  }

  /* ---------------- subscription ---------------- */
  onChange(fn: () => void): () => void {
    this.listeners.add(fn);
    return () => this.listeners.delete(fn);
  }
  private emit() {
    this.listeners.forEach((f) => f());
    this.requestRender();
  }
  private requestRender() {
    if (this.raf) return;
    this.raf = requestAnimationFrame(() => { this.raf = 0; this.render(); });
  }

  /* ---------------- history ---------------- */
  private snapshot(): Snapshot {
    return { layers: this.layers.map((l) => ({ ...l, transform: { ...l.transform } }) as Layer), background: { ...this.background }, selectedId: this.selectedId };
  }
  private restore(s: Snapshot) {
    this.layers = s.layers.map((l) => ({ ...l, transform: { ...l.transform } }) as Layer);
    this.background = { ...s.background };
    this.selectedId = s.selectedId && this.layers.some((l) => l.id === s.selectedId) ? s.selectedId : null;
  }
  /** Gọi TRƯỚC khi thay đổi để lưu trạng thái cũ. */
  private commit() {
    this.undoStack.push(this.snapshot());
    if (this.undoStack.length > 50) this.undoStack.shift();
    this.redoStack = [];
  }
  get canUndo() { return this.undoStack.length > 0; }
  get canRedo() { return this.redoStack.length > 0; }
  undo() {
    const prev = this.undoStack.pop();
    if (!prev) return;
    this.redoStack.push(this.snapshot());
    this.restore(prev);
    this.emit();
  }
  redo() {
    const next = this.redoStack.pop();
    if (!next) return;
    this.undoStack.push(this.snapshot());
    this.restore(next);
    this.emit();
  }

  /* ---------------- layer operations ---------------- */
  get selected(): Layer | undefined {
    return this.layers.find((l) => l.id === this.selectedId);
  }
  select(id: string | null) {
    this.selectedId = id;
    this.emit();
  }
  private add(layer: Layer) {
    this.commit();
    this.layers.push(layer);
    this.selectedId = layer.id;
    this.emit();
  }

  addImage(canvas: HTMLCanvasElement) {
    const fit = (this.size * 0.82) / Math.max(canvas.width, canvas.height);
    this.add({ id: nextId(), kind: 'image', canvas, hidden: false, transform: { x: this.size / 2, y: this.size / 2, scale: fit, rotation: 0 } });
  }

  async addDecor(url: string) {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    await new Promise<void>((res, rej) => { img.onload = () => res(); img.onerror = () => rej(new Error('decor load failed')); img.src = url; });
    const w = img.naturalWidth || 100, h = img.naturalHeight || 100;
    this.add({ id: nextId(), kind: 'decor', img, url, width: w, height: h, hidden: false, transform: { x: this.size / 2, y: this.size / 2, scale: 150 / Math.max(w, h), rotation: 0 } });
  }

  /** Thay canvas của layer ảnh (vd. sau khi tách nền) – một bước undo. */
  replaceImageCanvas(id: string, canvas: HTMLCanvasElement) {
    const l = this.layers.find((x) => x.id === id);
    if (!l || l.kind !== 'image') return;
    this.commit();
    l.canvas = canvas;
    this.emit();
  }

  addText(text: string, font = 'Fredoka', color = '#ffffff') {
    this.add({ id: nextId(), kind: 'text', text, font, color, strokeColor: '#3a2a3f', strokeWidth: 8, size: 64, hidden: false, transform: { x: this.size / 2, y: this.size * 0.8, scale: 1, rotation: 0 } });
  }

  updateText(patch: Partial<Pick<TextLayer, 'text' | 'font' | 'color' | 'strokeColor' | 'strokeWidth' | 'size'>>) {
    const l = this.selected;
    if (!l || l.kind !== 'text') return;
    this.commit();
    Object.assign(l, patch);
    this.emit();
  }

  setBackground(color: string | null) {
    this.commit();
    this.background = { color };
    this.emit();
  }

  removeSelected() {
    if (!this.selectedId) return;
    this.commit();
    this.layers = this.layers.filter((l) => l.id !== this.selectedId);
    this.selectedId = null;
    this.emit();
  }

  duplicateSelected() {
    const l = this.selected;
    if (!l || l.kind === 'paint') return;
    this.commit();
    const copy = { ...l, id: nextId(), transform: { ...l.transform, x: l.transform.x + 24, y: l.transform.y + 24 } } as Layer;
    if (copy.kind === 'image') copy.canvas = cloneCanvas(copy.canvas);
    this.layers.push(copy);
    this.selectedId = copy.id;
    this.emit();
  }

  move(dir: 'up' | 'down') {
    const i = this.layers.findIndex((l) => l.id === this.selectedId);
    const j = dir === 'up' ? i + 1 : i - 1;
    if (i < 0 || j < 0 || j >= this.layers.length) return;
    this.commit();
    const [l] = this.layers.splice(i, 1);
    this.layers.splice(j, 0, l!);
    this.emit();
  }

  toggleHidden(id: string) {
    const l = this.layers.find((x) => x.id === id);
    if (!l) return;
    this.commit();
    l.hidden = !l.hidden;
    this.emit();
  }

  /** Slider kích thước/xoay từ UI (một lần commit mỗi lần kéo → gọi beginAdjust trước). */
  beginAdjust() { this.commit(); }
  adjustSelected(patch: Partial<Transform>) {
    const l = this.selected;
    if (!l) return;
    Object.assign(l.transform, patch);
    this.emit();
  }

  /* ---------------- geometry ---------------- */
  private bounds(l: Layer): { w: number; h: number } {
    switch (l.kind) {
      case 'image': case 'paint': return { w: l.canvas.width, h: l.canvas.height };
      case 'decor': return { w: l.width, h: l.height };
      case 'text': {
        this.ctx.save();
        this.ctx.font = `700 ${l.size}px "${l.font}", sans-serif`;
        const w = this.ctx.measureText(l.text).width + l.strokeWidth * 2;
        this.ctx.restore();
        return { w, h: l.size * 1.3 };
      }
    }
  }
  private toLocal(l: Layer, p: { x: number; y: number }): { x: number; y: number } {
    const t = l.transform;
    const dx = p.x - t.x, dy = p.y - t.y;
    const c = Math.cos(-t.rotation), s = Math.sin(-t.rotation);
    return { x: (dx * c - dy * s) / t.scale, y: (dx * s + dy * c) / t.scale };
  }
  hit(p: { x: number; y: number }): Layer | undefined {
    for (let i = this.layers.length - 1; i >= 0; i--) {
      const l = this.layers[i]!;
      if (l.hidden || l.kind === 'paint') continue;
      const b = this.bounds(l);
      const q = this.toLocal(l, p);
      if (Math.abs(q.x) <= b.w / 2 && Math.abs(q.y) <= b.h / 2) return l;
    }
    return undefined;
  }

  /* ---------------- render ---------------- */
  private drawLayer(ctx: CanvasRenderingContext2D, l: Layer) {
    const t = l.transform;
    ctx.save();
    ctx.translate(t.x, t.y);
    ctx.rotate(t.rotation);
    ctx.scale(t.scale, t.scale);
    switch (l.kind) {
      case 'image': case 'paint':
        ctx.drawImage(l.canvas, -l.canvas.width / 2, -l.canvas.height / 2);
        break;
      case 'decor':
        ctx.drawImage(l.img, -l.width / 2, -l.height / 2, l.width, l.height);
        break;
      case 'text':
        ctx.font = `700 ${l.size}px "${l.font}", sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.lineJoin = 'round';
        if (l.strokeWidth > 0) {
          ctx.lineWidth = l.strokeWidth * 2;
          ctx.strokeStyle = l.strokeColor;
          ctx.strokeText(l.text, 0, 0);
        }
        ctx.fillStyle = l.color;
        ctx.fillText(l.text, 0, 0);
        break;
    }
    ctx.restore();
  }

  render(withSelection = true) {
    this.paint(this.ctx, withSelection);
  }

  private paint(ctx: CanvasRenderingContext2D, withSelection: boolean) {
    ctx.clearRect(0, 0, this.size, this.size);
    if (this.background.color) {
      ctx.fillStyle = this.background.color;
      ctx.fillRect(0, 0, this.size, this.size);
    }
    for (const l of this.layers) if (!l.hidden) this.drawLayer(ctx, l);
    const sel = this.selected;
    if (withSelection && sel && sel.kind !== 'paint') {
      const b = this.bounds(sel);
      const t = sel.transform;
      ctx.save();
      ctx.translate(t.x, t.y);
      ctx.rotate(t.rotation);
      ctx.scale(t.scale, t.scale);
      ctx.strokeStyle = '#ff6aa0';
      ctx.lineWidth = 3 / t.scale;
      ctx.setLineDash([8 / t.scale, 6 / t.scale]);
      ctx.strokeRect(-b.w / 2, -b.h / 2, b.w, b.h);
      ctx.restore();
    }
  }

  async exportBlob(): Promise<Blob> {
    const out = document.createElement('canvas');
    out.width = this.size;
    out.height = this.size;
    this.paint(out.getContext('2d')!, false);
    return canvasToWebp(out);
  }

  /* ---------------- pointer input ---------------- */
  private point(e: PointerEvent): { x: number; y: number } {
    const r = this.canvas.getBoundingClientRect();
    return { x: ((e.clientX - r.left) / r.width) * this.size, y: ((e.clientY - r.top) / r.height) * this.size };
  }

  private attach() {
    const c = this.canvas;
    c.style.touchAction = 'none';
    const down = (e: PointerEvent) => {
      c.setPointerCapture(e.pointerId);
      const p = this.point(e);
      this.pointers.set(e.pointerId, p);
      if (this.tool === 'brush') return this.beginPaint(p);
      if (this.tool === 'erase') return this.beginErase(p);
      if (this.pointers.size === 2 && this.selected) {
        const [a, b] = [...this.pointers.values()] as [typeof p, typeof p];
        const t = this.selected.transform;
        this.commit();
        this.pinch = { dist: Math.hypot(a.x - b.x, a.y - b.y), angle: Math.atan2(b.y - a.y, b.x - a.x), scale: t.scale, rotation: t.rotation };
        this.drag = null;
        return;
      }
      const hit = this.hit(p);
      this.selectedId = hit?.id ?? null;
      if (hit) {
        this.commit();
        this.drag = { id: hit.id, dx: hit.transform.x - p.x, dy: hit.transform.y - p.y };
      }
      this.emit();
    };
    const move = (e: PointerEvent) => {
      if (!this.pointers.has(e.pointerId)) return;
      const p = this.point(e);
      this.pointers.set(e.pointerId, p);
      if (this.stroke) return this.continueStroke(p);
      if (this.pinch && this.selected && this.pointers.size >= 2) {
        const [a, b] = [...this.pointers.values()] as [typeof p, typeof p];
        const d = Math.hypot(a.x - b.x, a.y - b.y) || 1;
        this.selected.transform.scale = Math.max(0.05, (this.pinch.scale * d) / this.pinch.dist);
        this.selected.transform.rotation = this.pinch.rotation + (Math.atan2(b.y - a.y, b.x - a.x) - this.pinch.angle);
        this.emit();
        return;
      }
      if (this.drag) {
        const l = this.layers.find((x) => x.id === this.drag!.id);
        if (l) { l.transform.x = p.x + this.drag.dx; l.transform.y = p.y + this.drag.dy; this.emit(); }
      }
    };
    const up = (e: PointerEvent) => {
      this.pointers.delete(e.pointerId);
      if (this.pointers.size < 2) this.pinch = null;
      if (this.pointers.size === 0) { this.drag = null; this.stroke = null; }
    };
    const wheel = (e: WheelEvent) => {
      const l = this.selected;
      if (!l) return;
      e.preventDefault();
      l.transform.scale = Math.max(0.05, l.transform.scale * (e.deltaY < 0 ? 1.06 : 0.94));
      this.emit();
    };
    c.addEventListener('pointerdown', down);
    c.addEventListener('pointermove', move);
    c.addEventListener('pointerup', up);
    c.addEventListener('pointercancel', up);
    c.addEventListener('wheel', wheel, { passive: false });
    this.detach = () => {
      c.removeEventListener('pointerdown', down);
      c.removeEventListener('pointermove', move);
      c.removeEventListener('pointerup', up);
      c.removeEventListener('pointercancel', up);
      c.removeEventListener('wheel', wheel);
    };
  }

  /* ---------------- brush / eraser ---------------- */
  private ensurePaintLayer(): PaintLayer {
    let l = this.layers.find((x): x is PaintLayer => x.kind === 'paint');
    if (!l) {
      const canvas = document.createElement('canvas');
      canvas.width = this.size;
      canvas.height = this.size;
      l = { id: nextId(), kind: 'paint', canvas, hidden: false, transform: { x: this.size / 2, y: this.size / 2, scale: 1, rotation: 0 } };
      this.layers.push(l);
    }
    return l;
  }

  private beginPaint(p: { x: number; y: number }) {
    this.commit();
    const l = this.ensurePaintLayer();
    l.canvas = cloneCanvas(l.canvas); // snapshot cũ giữ canvas gốc
    this.stroke = { layerId: l.id, last: p };
    this.dot(l.canvas, p, this.brush.size, this.brush.color, false);
    this.emit();
  }

  private beginErase(p: { x: number; y: number }) {
    const l = this.selected && this.selected.kind === 'image' ? this.selected : [...this.layers].reverse().find((x): x is ImageLayer => x.kind === 'image');
    if (!l) return;
    this.commit();
    l.canvas = cloneCanvas(l.canvas);
    this.stroke = { layerId: l.id, last: p };
    this.eraseAt(l, p, p);
    this.emit();
  }

  private continueStroke(p: { x: number; y: number }) {
    const s = this.stroke!;
    const l = this.layers.find((x) => x.id === s.layerId);
    if (!l) return;
    if (l.kind === 'paint') this.line(l.canvas, s.last, p, this.brush.size, this.brush.color);
    else if (l.kind === 'image') this.eraseAt(l, s.last, p);
    s.last = p;
    this.emit();
  }

  private dot(c: HTMLCanvasElement, p: { x: number; y: number }, size: number, color: string, erase: boolean) {
    const g = c.getContext('2d')!;
    g.globalCompositeOperation = erase ? 'destination-out' : 'source-over';
    g.fillStyle = color;
    g.beginPath();
    g.arc(p.x, p.y, size / 2, 0, Math.PI * 2);
    g.fill();
  }
  private line(c: HTMLCanvasElement, a: { x: number; y: number }, b: { x: number; y: number }, size: number, color: string) {
    const g = c.getContext('2d')!;
    g.globalCompositeOperation = 'source-over';
    g.strokeStyle = color;
    g.lineWidth = size;
    g.lineCap = 'round';
    g.beginPath();
    g.moveTo(a.x, a.y);
    g.lineTo(b.x, b.y);
    g.stroke();
  }
  private eraseAt(l: ImageLayer, a: { x: number; y: number }, b: { x: number; y: number }) {
    const la = this.toLocal(l, a), lb = this.toLocal(l, b);
    const off = { x: l.canvas.width / 2, y: l.canvas.height / 2 };
    const g = l.canvas.getContext('2d')!;
    g.globalCompositeOperation = 'destination-out';
    g.lineCap = 'round';
    g.lineWidth = this.eraserSize / l.transform.scale;
    g.beginPath();
    g.moveTo(la.x + off.x, la.y + off.y);
    g.lineTo(lb.x + off.x, lb.y + off.y);
    g.stroke();
    g.globalCompositeOperation = 'source-over';
  }

  destroy() {
    this.detach?.();
    cancelAnimationFrame(this.raf);
    this.listeners.clear();
  }
}
