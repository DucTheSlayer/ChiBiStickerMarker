import { Router, type Response } from 'express';
import * as catalog from '../services/catalog.service.js';
import { ApiError } from './api.js';

function sendSvg(res: Response, svg: string | undefined, what: string) {
  if (!svg) throw new ApiError(404, 'ASSET_NOT_FOUND', `${what} not found`);
  res.setHeader('Content-Type', 'image/svg+xml; charset=utf-8');
  res.setHeader('Cache-Control', 'public, max-age=86400, immutable');
  res.send(svg);
}

export const assets = Router();

assets.get('/packs/:packId/:file.svg', (req, res) => {
  sendSvg(res, catalog.renderSticker(req.params.packId, req.params.file), `Sticker ${req.params.file}`);
});

assets.get('/decor/:id.svg', (req, res) => {
  sendSvg(res, catalog.renderDecor(req.params.id), `Decoration ${req.params.id}`);
});
