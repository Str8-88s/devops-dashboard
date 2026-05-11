import request from 'supertest';
import { app } from '../app';
import prisma from '../lib/prisma';

const testUser = {
  email: 'test@example.com',
  password: 'TestPass123!',
  name: 'Test User',
};

beforeEach(async () => {
  await prisma.refreshToken.deleteMany();
  await prisma.user.deleteMany();
});

describe('POST /api/auth/register', () => {
  it('creates a user and returns 201', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send(testUser);

    expect(res.status).toBe(201);
    expect(res.body.data).toHaveProperty('accessToken');
    expect(res.body.data.user.email).toBe(testUser.email);
    expect(res.body.data.user).not.toHaveProperty('password');
  });

  it('returns 409 on duplicate email', async () => {
    await request(app).post('/api/auth/register').send(testUser);
    const res = await request(app).post('/api/auth/register').send(testUser);
    expect(res.status).toBe(409);
  });

  it('returns 400 on invalid email', async () => {
    const res = await request(app)
      .post('/api/auth/register')
      .send({ ...testUser, email: 'not-an-email' });
    expect(res.status).toBe(400);
  });
});

describe('POST /api/auth/login', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(testUser);
  });

  it('returns access token on valid credentials', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('returns 401 on wrong password', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: 'wrongpassword' });
    expect(res.status).toBe(401);
  });

  it('returns 401 on unknown email', async () => {
    const res = await request(app)
      .post('/api/auth/login')
      .send({ email: 'nobody@example.com', password: testUser.password });
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/refresh', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(testUser);
  });

  it('returns new access token with valid refresh cookie', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    const cookies = loginRes.headers['set-cookie'];
    const cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies;

    const res = await request(app)
      .post('/api/auth/refresh')
      .set('Cookie', cookieHeader);

    expect(res.status).toBe(200);
    expect(res.body.data).toHaveProperty('accessToken');
  });

  it('returns 401 with no cookie', async () => {
    const res = await request(app).post('/api/auth/refresh');
    expect(res.status).toBe(401);
  });
});

describe('POST /api/auth/logout', () => {
  beforeEach(async () => {
    await request(app).post('/api/auth/register').send(testUser);
  });

  it('clears cookie and returns 200', async () => {
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({ email: testUser.email, password: testUser.password });

    const cookies = loginRes.headers['set-cookie'];
    const cookieHeader = Array.isArray(cookies) ? cookies.join('; ') : cookies;

    const res = await request(app)
      .post('/api/auth/logout')
      .set('Cookie', cookieHeader);

    expect(res.status).toBe(200);
  });
});