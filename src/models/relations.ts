import { Employee } from './Employee';
import { Equipment } from './Equipment';
import { Reservation } from './Reservation';

export const associateAll = () => {
  Employee.hasMany(Reservation, { foreignKey: 'employeeId', as: 'reservations' });
  Reservation.belongsTo(Employee, { foreignKey: 'employeeId', as: 'employee' });

  Equipment.hasMany(Reservation, { foreignKey: 'equipmentId', as: 'reservations' });
  Reservation.belongsTo(Equipment, { foreignKey: 'equipmentId', as: 'equipment' });
};
