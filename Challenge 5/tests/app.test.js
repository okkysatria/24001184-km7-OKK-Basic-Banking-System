const request = require('supertest');
const app = require('../app'); 
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

describe('Banking API Integration Tests', () => {
    let user, account;

    beforeAll(async () => {
        user = await prisma.nasabah.create({
            data: {
                nama: 'Budi Handuk',
                nomorTelepon: '08123456789',
                alamat: 'Jalan SBY No. 1',
            },
        });

        account = await prisma.akun.create({
            data: {
                nomorRekening: '123456789',
                saldo: 1000,
                tipeAkun: 'Tabungan',
                nasabahId: user.idNasabah,
            },
        });
    });

    afterAll(async () => {
        await prisma.akun.deleteMany({});
        await prisma.nasabah.deleteMany({});
        await prisma.$disconnect();
    });

    test('Membuat pengguna baru', async () => {
        const response = await request(app)
            .post('/api/v1/users')
            .send({
                nama: 'Siti Nurbaya',
                nomorTelepon: '08123456780',
                alamat: 'Jalan SBY No. 2',
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.nama).toBe('Siti Nurbaya');
    });

    test('Mendapatkan daftar pengguna', async () => {
        const response = await request(app).get('/api/v1/users');

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('Mendapatkan pengguna berdasarkan ID', async () => {
        const response = await request(app).get(`/api/v1/users/${user.idNasabah}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.nama).toBe(user.nama);
    });

    test('Membuat akun baru', async () => {
        const response = await request(app)
            .post('/api/v1/accounts')
            .send({
                nomorRekening: '987654321',
                saldo: 2000,
                tipeAkun: 'Tabungan',
                nasabahId: user.idNasabah,
            });

        expect(response.statusCode).toBe(201);
        expect(response.body.nomorRekening).toBe('987654321');
    });

    test('Mendapatkan daftar akun', async () => {
        const response = await request(app).get('/api/v1/accounts');

        expect(response.statusCode).toBe(200);
        expect(response.body.length).toBeGreaterThan(0);
    });

    test('Mendapatkan akun berdasarkan ID', async () => {
        const response = await request(app).get(`/api/v1/accounts/${account.idAkun}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.nomorRekening).toBe(account.nomorRekening);
    });

    test('Menghapus akun', async () => {
        const response = await request(app).delete(`/api/v1/accounts/${account.idAkun}`);

        expect(response.statusCode).toBe(200);
        expect(response.body.message).toContain('Account deleted successfully');
    });
});
