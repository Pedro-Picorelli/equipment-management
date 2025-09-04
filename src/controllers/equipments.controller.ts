import { Request, Response, NextFunction } from 'express';

import { EquipmentsService } from '../services/equipments.service';
import { EquipmentStatus } from '../models';
import { AppError } from '../erros/AppError';
import { it } from 'node:test';

export const EquipmentsController = {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, category, status } = req.body || {};
            if (!name || !category) {
                throw new AppError('Name and category are required', 400, 'VALIDATION_ERROR');
            }
            if (status && !Object.values(EquipmentStatus).includes(status)) {
                throw new AppError(
                    `invalid status. Allowed: ${Object.values(EquipmentStatus).join(', ')}`,
                    400, 
                    'VALIDATION_ERROR'
                );
            }
            const created = await EquipmentsService.create({ name, category, status });
            res.status(201).json(created);
        } catch(e) {
            next(e);
        }
    },

    async linst(req: Request, res: Response, next: NextFunction) {
        try{
            const name = (req.query.name as string | undefined)?.trim();
            const status = req.query.status as EquipmentStatus | undefined;
            const category = (req.query.category as string | undefined)?.trim();

            if (status && !Object.values(EquipmentStatus).includes(status)) {
                throw new AppError(
                    `invalid status. Allowed: ${Object.values(EquipmentStatus).join(', ')}`,
                    400, 
                    'VALIDATION_ERROR'
                );
            }
            const items = await EquipmentsService.list({ name, status, category });
            res.json(items);
        }catch(e){
            next(e);
        }
    },

    async getById(req: Request, res: Response, next: NextFunction) {
        try{
            const item = await EquipmentsService.getById(req.params.id);
            res.json(item);
        }catch(e){
            next(e);
        }
    },

    async update(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, category, status } = req.body || {};
      if (status && !Object.values(EquipmentStatus).includes(status)) {
        throw new AppError(
          `invalid status. Allowed: ${Object.values(EquipmentStatus).join(', ')}`,
          400,
          'VALIDATION_ERROR'
        );
      }
      const item = await EquipmentsService.update(req.params.id, { name, category, status });
      res.json(item);
    } catch (e) { 
        next(e);
    }
  },

  async remove(req: Request, res: Response, next: NextFunction) {
    try {
      await EquipmentsService.remove(req.params.id);
      res.status(200).send({ message: 'Employee deleted' });
    } catch (e) { 
        next(e);
    }
  },
}