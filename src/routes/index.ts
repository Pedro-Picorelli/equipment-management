import { Router } from 'express';

import equipments from './equipments.routes';
import employees from './employees.routes';
import reservations from './reservations.routes';

const router = Router();

router.get('/', (_req, res) => res.json({ api: 'ok' }));
router.use('/equipments', equipments);
router.use('/employees', employees);
router.use('/reservations', reservations);

export default router;