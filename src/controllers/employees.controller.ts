import { Request, Response, NextFunction } from 'express';
import { Op } from 'sequelize';

import { EmployeesService } from '../services/employees.service';
import { AppError } from '../erros/AppError';


export const EmployeeController = {
    async create(req: Request, res: Response, next: NextFunction) {
        try {
            const { name, department } = req.body || {};
            if (!name || !department) {
                throw new AppError(
                    'Name and department are required',
                    400, 
                    'VALIDATION_ERROR'
                );
            }
            const created = await EmployeesService.create({ name, department });
            res.status(201).json(created);
        } catch(e) {
            next(e);
        }
    },

    async list(req: Request, res: Response, next: NextFunction){
        try {
            const name = (req.query.name as string | undefined)?.trim();
            const department = (req.query.department as string | undefined)?.trim();
            const items = await EmployeesService.list({ name, department });
            res.json(items);
        } catch(e) {
            next(e);
        }
    },

    async get(req: Request, res: Response, next: NextFunction){
        try{     
            const item = await EmployeesService.getById(req.params.id);
            res.json(item);
        }catch(e){
            next(e);
        }
    },

    async update(req: Request, res: Response, next: NextFunction){
        try{
            const { name, department } = req.body || {};
            const { id } = req.params;
            const item = await EmployeesService.update(id, { name, department });
            res.json(item);
        }catch(e){
            next(e);
        }
    },

    async remove(req: Request, res: Response, next: NextFunction){
        try{
            await EmployeesService.remove(req.params.id);
            res.status(200).json({ message: 'Employee deleted' });
        }catch(e){
            next(e);
        }
    }
}