import { Router, Request, Response, NextFunction  } from 'express';

import { ReservationsController } from '../controllers/reservations.controller';

const r = Router();

r.post('/', ReservationsController.create);
r.put('/:id/finish', ReservationsController.finish);
r.get('/', ReservationsController.list);

export default r;