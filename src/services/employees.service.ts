import { Op } from 'sequelize';

import { Employee } from '../models/Employee';
import { AppError } from '../erros/AppError';

export const EmployeesService = {
    async create(data: { name: string; department: string }) {
        return Employee.create(data);
    },

    async list(filters: { name?: string; department?: string }) {
        const { name, department } = filters;
        return Employee.findAll({
            where: {
                ...(name ? { name: { [Op.iLike]: `%${(name)}%` } } : {}),
                ...(department ? { department: { [Op.iLike]: `%${department}%` } } : {}),
            },
            order: [['createdAt', 'DESC']]
        });
    },

    async getById( id: string ) {      
        const item = await Employee.findByPk(id);
        if (!item) {
            throw new AppError(
                'Employee not found',
                400, 
                'VALIDATION_ERROR'
            );
        }
        return item;
    },

    async update(id: string, data: Partial<{ name: string; department: string }>){
        const item = await this.getById(id);
        return item.update(data);
    },

    async remove(id: string){
        const item = await this.getById(id);
        const result = item.destroy();
        return result;
    }
}