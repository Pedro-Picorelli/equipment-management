import request from 'supertest';
import app from '../app';
import { EquipmentStatus } from '../models';

describe('equipments', () => {
  it('POST /api/equipments -> 201 (cria com default AVAILABLE)', async () => {
    const res = await request(app)
      .post('/api/equipments')
      .send({ name: 'Notebook Dell 5420', category: 'Laptop' });

    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({
      id: expect.any(String),
      name: 'Notebook Dell 5420',
      category: 'Laptop',
      status: EquipmentStatus.AVAILABLE,
    });
  });

  it('POST /api/equipments -> 400 (validação faltando campos)', async () => {
    const res = await request(app)
      .post('/api/equipments')
      .send({ name: 'Sem categoria' });

    expect(res.status).toBe(400);
    expect(res.body).toMatchObject({ code: 'VALIDATION_ERROR' });
  });

  it('GET /api/equipments?status=AVAILABLE -> 200 filtra por status', async () => {
    await request(app).post('/api/equipments').send({ name: 'A', category: 'Lap' });
    await request(app).post('/api/equipments').send({ name: 'B', category: 'Lap', status: EquipmentStatus.MAINTENANCE });

    const res = await request(app).get('/api/equipments').query({ status: EquipmentStatus.AVAILABLE });
    expect(res.status).toBe(200);
    expect(res.body.every((e: any) => e.status === EquipmentStatus.AVAILABLE)).toBe(true);
  });

  it('GET /api/equipments/:id -> 500 INTERNAL_SERVER_ERROR', async () => {
    const res = await request(app).get('/api/equipments/not-a-uuid');
    expect(res.status).toBe(500);
    expect(res.body.code).toBe('INTERNAL_SERVER_ERROR');
  });

  it('PUT /api/equipments/:id -> 404 VALIDATION_ERROR', async () => {
    const id = '123e4567-e89b-12d3-a456-426614174000'; // UUID válido mas inexistente
    const res = await request(app).put(`/api/equipments/${id}`).send({ name: 'X' });
    expect(res.status).toBe(404);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('DELETE /api/equipments/:id -> 200', async () => {
    const created = await request(app).post('/api/equipments').send({ name: 'Tmp', category: 'Lap' });
    const del = await request(app).delete(`/api/equipments/${created.body.id}`);
    expect(del.status).toBe(200);
  });
});
