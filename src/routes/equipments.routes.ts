import { Router, Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';

import { Equipment } from '../models/Equipment';
import { EquipmentStatus } from '../models';
import { EquipmentsController } from '../controllers/equipments.controller';
import { AppError } from '../erros/AppError';

const r = Router();

r.post('/', EquipmentsController.create);
r.get('/', EquipmentsController.linst);
r.get('/:id', EquipmentsController.getById);
r.put('/:id', EquipmentsController.update);
r.delete('/:id', EquipmentsController.remove);

export default r;