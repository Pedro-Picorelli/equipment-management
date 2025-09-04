import request from 'supertest';
import app from '../app';

describe('employees', () => {
  it('POST /api/employees -> 201', async () => {
    const res = await request(app).post('/api/employees').send({ name: 'Ana', department: 'Financeiro' });
    expect(res.status).toBe(201);
    expect(res.body).toMatchObject({ name: 'Ana', department: 'Financeiro', id: expect.any(String) });
  });

  it('POST /api/employees -> 400 VALIDATION_ERROR', async () => {
    const res = await request(app).post('/api/employees').send({ name: 'Sem dep' });
    expect(res.status).toBe(400);
    expect(res.body.code).toBe('VALIDATION_ERROR');
  });

  it('GET /api/employees/:id -> 500 INTERNAL_SERVER_ERROR', async () => {
    const res = await request(app).get('/api/employees/not-uuid');
    expect(res.status).toBe(500);
    expect(res.body.code).toBe('INTERNAL_SERVER_ERROR');
  });
});
