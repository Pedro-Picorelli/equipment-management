import { Op } from "sequelize";

import { Equipment } from "../models/Equipment";
import { EquipmentStatus } from "../models";
import { AppError } from "../erros/AppError";

export const EquipmentsService = {
    async create(data: { name: string; category: string; status?: EquipmentStatus }) {
        return Equipment.create(data);
    },

    async list(filters: { name?: string; category?: string; status?: EquipmentStatus }) {
        const { name, category, status } = filters || {};
        return Equipment.findAll({
            where: {
                ...(name ? { name: { [Op.iLike]: `%${(name)}%` } } : {}),
                ...(status ? { status } : {}), // [ 'AVAILABLE', 'MAINTENANCE', 'LOANED' ]
                ...(category ? { category: { [Op.iLike]: `%${category}%` } } : {}),
            },
            order: [['createdAt', 'DESC']],
        });
    },

    async getById(id: string) {
        const item = await Equipment.findByPk(id);
        if (!item) {
            throw new AppError(
                'Equipment not found',
                404, 
                'VALIDATION_ERROR'
            );
        }
        return item;
    },

    async update(id: string, data: Partial<{ name: string; category: string; status: EquipmentStatus }>) {
    const item = await this.getById(id);
    if (!item) throw new AppError('Equipment not found', 404, 'NOT_FOUND');
    await item.update(data);
    return item;
  },

  async remove(id: string) {
    const item = await this.getById(id);
    return item.destroy();
    // return;
  },
}