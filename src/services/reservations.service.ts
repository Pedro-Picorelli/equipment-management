import { sequelize, EquipmentStatus } from '../models';
import { Reservation } from '../models/Reservation';
import { Equipment } from '../models/Equipment';
import { Employee } from '../models/Employee';
import { AppError } from '../erros/AppError';

export const ReservationsService = {
  async create(data: { employeeId: string; equipmentId: string; startDate: Date }) {
    return sequelize.transaction(async (t) => {
      const emp = await Employee.findByPk(data.employeeId, { transaction: t });
      if (!emp) throw new AppError('Employee not found', 404, 'NOT_FOUND');

      const eq = await Equipment.findByPk(data.equipmentId, { transaction: t });
      if (!eq) throw new AppError('Equipment not found', 404, 'NOT_FOUND');

      if (eq.status !== EquipmentStatus.AVAILABLE) {
        throw new AppError('Equipment not available', 400, 'EQUIPMENT_NOT_AVAILABLE');
      }

      const active = await Reservation.findOne({
        where: { employeeId: emp.id, endDate: null },
        transaction: t,
      });
      if (active) {
        throw new AppError('Employee already has an active reservation', 400, 'ACTIVE_RESERVATION_EXISTS');
      }

      const reservation = await Reservation.create(
        { employeeId: emp.id, equipmentId: eq.id, startDate: data.startDate },
        { transaction: t }
      );

      await eq.update({ status: EquipmentStatus.LOANED }, { transaction: t });
      return reservation;
    });
  },

  async finish(id: string, endDate: Date) {
    return sequelize.transaction(async (t) => {
      const resv = await Reservation.findByPk(id, { transaction: t });
      if (!resv) throw new AppError('Reservation not found', 404, 'NOT_FOUND');
      if (resv.endDate) throw new AppError('Reservation already finished', 400, 'ALREADY_FINISHED');

      await resv.update({ endDate }, { transaction: t });
      await Equipment.update(
        { status: EquipmentStatus.AVAILABLE },
        { where: { id: resv.equipmentId }, transaction: t }
      );
      return resv;
    });
  },

  async list() {
    return Reservation.findAll({
      include: [
        { model: Employee, as: 'employee', attributes: ['id', 'name', 'department'] },
        { model: Equipment, as: 'equipment', attributes: ['id', 'name', 'category', 'status'] },
      ],
      order: [['startDate', 'DESC']],
    });
  },
};
