import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize, EquipmentStatus } from './index';

export interface EquipmentAttributes { 
  id: string; 
  name: string;
  category: string;
  status: EquipmentStatus;
  deletedAt?: Date | null;
  createdAt?: Date;
  updatedAt?: Date;
 }
type Creation = Optional<EquipmentAttributes, 'id' | 'status'>;

export class Equipment extends Model<EquipmentAttributes, Creation> implements EquipmentAttributes {
  public id!: string; 
  public name!: string; 
  public category!: string; 
  public status!: EquipmentStatus;
  public deletedAt!: Date | null;
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Equipment.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    category: { type: DataTypes.STRING, allowNull: false },
    status: { type: DataTypes.ENUM(...Object.values(EquipmentStatus)), allowNull: false, defaultValue: EquipmentStatus.AVAILABLE },
    deletedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { 
    sequelize,
    tableName: 'equipments',
    paranoid: true,
    deletedAt: 'deletedAt',
  }
);
