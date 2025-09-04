import { Router } from 'express';

import { EmployeeController } from '../controllers/employees.controller';

const r = Router();

r.post('/', EmployeeController.create);
r.get('/', EmployeeController.list);
r.get('/:id', EmployeeController.get);
r.put('/:id', EmployeeController.update);
r.delete('/:id', EmployeeController.remove);

export default r;