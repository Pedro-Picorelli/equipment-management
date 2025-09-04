import request from 'supertest';
import app from '../app';

describe('health', () => {
  it('GET /health -> 200 { ok: true }', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
  });

  it('GET /health/db -> 200 { db: "up" }', async () => {
    const res = await request(app).get('/health/db');
    expect(res.status).toBe(200);
    expect(res.body.db).toBe('up');
  });
});
