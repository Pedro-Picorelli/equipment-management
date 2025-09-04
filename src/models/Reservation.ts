import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index';

export interface ReservationAttributes { id: string; startDate: Date; endDate?: Date | null; employeeId: string; equipmentId: string; createdAt?: Date; }
type Creation = Optional<ReservationAttributes, 'id' | 'endDate' | 'createdAt'>;

export class Reservation extends Model<ReservationAttributes, Creation> implements ReservationAttributes {
  public id!: string; public startDate!: Date; public endDate!: Date | null; public employeeId!: string; public equipmentId!: string; public readonly createdAt!: Date;
}

Reservation.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    startDate: { type: DataTypes.DATE, allowNull: false },
    endDate: { type: DataTypes.DATE, allowNull: true },
    employeeId: { type: DataTypes.UUID, allowNull: false },
    equipmentId: { type: DataTypes.UUID, allowNull: false },
    createdAt: { type: DataTypes.DATE, defaultValue: DataTypes.NOW },
  },
  { sequelize, tableName: 'reservations', updatedAt: false }
);
