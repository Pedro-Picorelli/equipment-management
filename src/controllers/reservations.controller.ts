import { Request, Response, NextFunction } from 'express';
import { ReservationsService } from '../services/reservations.service';
import { AppError } from '../erros/AppError';

export const ReservationsController = {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { employeeId, equipmentId, startDate } = req.body || {};
      if (!employeeId || !equipmentId || !startDate) {
        throw new AppError('employeeId, equipmentId and startDate are required', 400, 'VALIDATION_ERROR');
      }
      const start = new Date(startDate);
      if (isNaN(start.valueOf())) {
        throw new AppError('startDate must be a valid ISO date', 400, 'VALIDATION_ERROR');
      }
      const reservation = await ReservationsService.create({ employeeId, equipmentId, startDate: start });
      res.status(201).json(reservation);
    } catch (e) { next(e); }
  },

  async finish(req: Request, res: Response, next: NextFunction) {
    try {
      const { endDate } = req.body || {};
      const end = new Date(endDate);
      if (isNaN(end.valueOf())) {
        throw new AppError('endDate must be a valid ISO date', 400, 'VALIDATION_ERROR');
      }
      const updated = await ReservationsService.finish(req.params.id, end);
      res.json(updated);
    } catch (e) { next(e); }
  },

  async list(_req: Request, res: Response, next: NextFunction) {
    try {
      const items = await ReservationsService.list();
      res.json(items);
    } catch (e) { next(e); }
  },
};
