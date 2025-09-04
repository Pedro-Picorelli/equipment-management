import { Sequelize } from 'sequelize';
import dotenv from 'dotenv';
dotenv.config({ override: true });

export const sequelize = new Sequelize({
  dialect: 'postgres',
  host: process.env.DB_HOST || '127.0.0.1',
  port: Number(process.env.DB_PORT) || 5432,
  username: process.env.DB_USER || 'app',
  password: process.env.DB_PASS || 'app',
  database: process.env.DB_NAME || 'appdb',
});

export enum EquipmentStatus {
  AVAILABLE = 'AVAILABLE',
  MAINTENANCE = 'MAINTENANCE',
  LOANED = 'LOANED',
}

export const initSequelize = async () => {
  await sequelize.authenticate();
  console.log('✅ Autenticado no Postgres');

  // 2) Registra modelos e associações
  await import('./Employee');
  await import('./Equipment');
  await import('./Reservation');
  const { associateAll } = await import('./relations');
  associateAll();

  // 3) Sincroniza
  await sequelize.sync({ alter: process.env.NODE_ENV !== 'production' });
  console.log('✅ DB conectado e modelos sincronizados');
};
