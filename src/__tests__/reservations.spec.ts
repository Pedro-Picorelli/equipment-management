import request from 'supertest';
import app from '../app';
import { EquipmentStatus } from '../models';

async function createEmployee(name = 'Ana', department = 'Financeiro') {
  const res = await request(app).post('/api/employees').send({ name, department });
  return res.body;
}
async function createEquipment(name = 'Notebook', category = 'Laptop', status?: EquipmentStatus) {
  const res = await request(app).post('/api/equipments').send({ name, category, status });
  return res.body;
}
async function createReservation(employeeId: string, equipmentId: string, startDateISO = new Date().toISOString()) {
  const res = await request(app).post('/api/reservations').send({ employeeId, equipmentId, startDate: startDateISO });
  return res;
}

describe('reservations (business rules)', () => {
  it('cria reserva quando equipamento AVAILABLE e funcionário sem reserva ativa', async () => {
    const emp = await createEmployee();
    const eq = await createEquipment('Dell 5420', 'Laptop');

    const res = await createReservation(emp.id, eq.id);
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ id: expect.any(String), employeeId: emp.id, equipmentId: eq.id });

    // equipamento deve virar LOANED
    const eqAfter = await request(app).get(`/api/equipments/${eq.id}`);
    expect(eqAfter.body.status).toBe(EquipmentStatus.LOANED);
  });

  it('recusa reserva se equipamento não está AVAILABLE', async () => {
    const emp = await createEmployee();
    const eq = await createEquipment('Lenovo', 'Laptop', EquipmentStatus.MAINTENANCE);

    const res = await createReservation(emp.id, eq.id);
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('EQUIPMENT_NOT_AVAILABLE');
  });

  it('recusa reserva se funcionário já tem reserva ativa', async () => {
    const emp = await createEmployee('Bruno', 'TI');
    const eq1 = await createEquipment('HP', 'Laptop');
    const eq2 = await createEquipment('Macbook', 'Laptop');

    const ok = await createReservation(emp.id, eq1.id);
    expect(ok.status).toBe(201);

    const deny = await createReservation(emp.id, eq2.id);
    expect(deny.status).toBe(400);
    expect(deny.body.code).toBe('ACTIVE_RESERVATION_EXISTS');
  });

  it('finaliza reserva e devolve equipamento para AVAILABLE', async () => {
    const emp = await createEmployee('Carla', 'Ops');
    const eq = await createEquipment('Acer', 'Laptop');

    const start = await createReservation(emp.id, eq.id);
    const resId = start.body.id;

    const end = await request(app)
      .put(`/api/reservations/${resId}/finish`)
      .send({ endDate: new Date().toISOString() });

    expect(end.status).toBe(200);
    expect(end.body.endDate).toBeTruthy();

    const eqAfter = await request(app).get(`/api/equipments/${eq.id}`);
    expect(eqAfter.body.status).toBe(EquipmentStatus.AVAILABLE);
  });
});
