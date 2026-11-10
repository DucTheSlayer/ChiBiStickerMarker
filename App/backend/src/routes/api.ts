import { Router } from 'express';
import * as catalog from '../services/catalog.service.js';

export class ApiError extends Error {
  constructor(public status: number, public code: string, message: string) {
    super(message);
  }
}

function intParam(raw: unknown, name: string, def: number, min: number, max: number): number {
  if (raw === undefined) return def;
  const n = Number(raw);
  if (!Number.isInteger(n) || n < min || n > max) {
    throw new ApiError(400, 'BAD_QUERY', `${name} must be an integer between ${min} and ${max}`);
  }
  return n;
}

export const api = Router();

api.get('/health', (_req, res) => {
  res.json({ ok: true, version: '1.0.0' });
});

api.get('/config', (_req, res) => {
  res.json(catalog.getConfig());
});

api.get('/categories', (_req, res) => {
  res.json(catalog.getCategories());
});

api.get('/fonts', (_req, res) => {
  res.json(catalog.getFonts());
});

api.get('/decorations', (_req, res) => {
  res.json(catalog.getDecorations());
});

api.get('/packs', (req, res) => {
  const page = intParam(req.query.page, 'page', 1, 1, 10_000);
  const pageSize = intParam(req.query.pageSize, 'pageSize', 12, 1, 50);
  const category = typeof req.query.category === 'string' && req.query.category ? req.query.category : undefined;
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  res.json(catalog.listPacks({ page, pageSize, category, q }));
});

api.get('/packs/:id', (req, res) => {
  const pack = catalog.getPack(req.params.id);
  if (!pack) throw new ApiError(404, 'PACK_NOT_FOUND', `Pack "${req.params.id}" not found`);
  res.json(pack);
});
