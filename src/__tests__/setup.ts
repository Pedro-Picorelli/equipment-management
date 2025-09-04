import { sequelize } from '../models';
import { initSequelize } from '../models';

beforeAll(async () => {
  // garante que estamos em test
  process.env.NODE_ENV = 'test';
  // conecta e registra modelos
  await initSequelize();
  // cria schema do zero
  await sequelize.sync({ force: true });
});

beforeEach(async () => {
  // limpa tabelas entre testes (ordem não importa com TRUNCATE CASCADE)
  // Postgres: nomes com aspas duplas preservam minúsculas
  await sequelize.query('TRUNCATE "reservations","equipments","employees" RESTART IDENTITY CASCADE;');
});

afterAll(async () => {
  await sequelize.close();
});
