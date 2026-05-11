import request from 'supertest';
import { app } from '../app';
import prisma from '../lib/prisma';

const testUser = {
  email: 'user@example.com',
  password: 'TestPass123!',
  name: 'Test User',
};

let accessToken: string;
let userId: string;

beforeEach(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();

  const res = await request(app)
    .post('/api/auth/register')
    .send(testUser);

  accessToken = res.body.data.accessToken;
  userId = res.body.data.user.id;
});

describe('POST /api/users', () => {
  it('creates a user and returns 201', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'new@example.com', password: 'TestPass123!', name: 'New User' });

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('id');
    expect(res.body.data.email).toBe('new@example.com');
    expect(res.body.data).not.toHaveProperty('password');
  });

  it('returns 409 on duplicate email', async () => {
    const res = await request(app)
      .post('/api/users')
      .send(testUser);

    expect(res.status).toBe(409);
  });

  it('returns 400 on missing fields', async () => {
    const res = await request(app)
      .post('/api/users')
      .send({ email: 'bad@example.com' });

    expect(res.status).toBe(400);
  });
});

describe('GET /api/users/:id', () => {
  it('returns user by id', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(200);
    expect(res.body.data.id).toBe(userId);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app)
      .get('/api/users/nonexistentid')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .get(`/api/users/${userId}`);

    expect(res.status).toBe(401);
  });
});

describe('PUT /api/users/:id', () => {
  it('updates user name', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(200);
    expect(res.body.data.name).toBe('Updated Name');
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app)
      .put('/api/users/nonexistentid')
      .set('Authorization', `Bearer ${accessToken}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .put(`/api/users/${userId}`)
      .send({ name: 'Updated Name' });

    expect(res.status).toBe(401);
  });
});

describe('DELETE /api/users/:id', () => {
  it('deletes user and returns 204', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}`)
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(204);
  });

  it('returns 404 for unknown id', async () => {
    const res = await request(app)
      .delete('/api/users/nonexistentid')
      .set('Authorization', `Bearer ${accessToken}`);

    expect(res.status).toBe(404);
  });

  it('returns 401 without token', async () => {
    const res = await request(app)
      .delete(`/api/users/${userId}`);

    expect(res.status).toBe(401);
  });
});