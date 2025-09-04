import { DataTypes, Model, Optional } from 'sequelize';
import { sequelize } from './index';

export interface EmployeeAttributes { 
  id: string; 
  name: string; 
  department: string; 
  deletedAt?: Date;
  createdAt?: Date; 
  updatedAt?: Date; 
}
type Creation = Optional<EmployeeAttributes, 'id'>;

export class Employee extends Model<EmployeeAttributes, Creation> implements EmployeeAttributes {
  public id!: string; 
  public name!: string; 
  public department!: string;
  public deletedAt!: Date;
  public readonly createdAt!: Date; 
  public readonly updatedAt!: Date;
}

Employee.init(
  {
    id: { type: DataTypes.UUID, defaultValue: DataTypes.UUIDV4, primaryKey: true },
    name: { type: DataTypes.STRING, allowNull: false },
    department: { type: DataTypes.STRING, allowNull: false },
    deletedAt: { type: DataTypes.DATE, allowNull: true },
  },
  { 
    sequelize, 
    tableName: 'employees', 
    paranoid: true,
    deletedAt: 'deletedAt',
  }
);
