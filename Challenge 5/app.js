const express = require('express');
const { PrismaClient } = require('@prisma/client');
const swaggerJsDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');

const app = express();
const prisma = new PrismaClient();

app.use(express.json());

const swaggerOptions = {
    swaggerDefinition: {
        openapi: '3.0.0',
        info: {
            title: 'Banking API',
            version: '1.0.0',
            description: 'API untuk mengelola pengguna, akun, dan transaksi.',
        },
        servers: [
            {
                url: 'http://localhost:3000',
            },
        ],
    },
    apis: ['./app.js'],
};

const swaggerDocs = swaggerJsDoc(swaggerOptions);
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerDocs));

const JWT_SECRET = '33135b5a251ac47bf8b18562efcf14717e5eb14e562cdb2ed00f82b3fbaf72fbe1afa8ef112adb78ee0c78b22f2efed86cacf44d6f00a04dac447617cec90277';

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Mendaftar pengguna baru
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *               nomorTelepon:
 *                 type: string
 *               alamat:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pengguna berhasil terdaftar
 *       500:
 *         description: Terjadi kesalahan
 */
app.post('/auth/register', async (req, res) => {
    const { nama, nomorTelepon, alamat, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const newUser = await prisma.nasabah.create({
            data: { nama, nomorTelepon, alamat, password: hashedPassword },
        });
        res.status(201).json({ message: 'User registered successfully', user: newUser });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login pengguna
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomorTelepon:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login berhasil
 *       401:
 *         description: Kredensial salah
 *       500:
 *         description: Terjadi kesalahan
 */
app.post('/auth/login', async (req, res) => {
    const { nomorTelepon, password } = req.body;
    try {
        const user = await prisma.nasabah.findUnique({
            where: { nomorTelepon },
        });
        if (!user) {
            return res.status(401).json({ error: 'Kredensial salah' });
        }

        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ error: 'Kredensial salah' });
        }

        const token = jwt.sign({ id: user.idNasabah }, JWT_SECRET, { expiresIn: '1h' });
        res.json({ message: 'Login berhasil', token });
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /auth/authenticate:
 *   get:
 *     summary: Memeriksa autentikasi
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Autentikasi berhasil
 *       401:
 *         description: Tidak terautentikasi
 */
app.get('/auth/authenticate', (req, res) => {
    const token = req.headers['authorization']?.split(' ')[1];
    if (!token) {
        return res.status(401).json({ error: 'Tidak terautentikasi' });
    }

    jwt.verify(token, JWT_SECRET, (err) => {
        if (err) {
            return res.status(401).json({ error: 'Token tidak valid' });
        }
        res.json({ message: 'Autentikasi berhasil' });
    });
});

/**
 * @swagger
 * /api/v1/users:
 *   post:
 *     summary: Membuat pengguna baru
 *     tags: [Users]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *               nomorTelepon:
 *                 type: string
 *               alamat:
 *                 type: string
 *     responses:
 *       201:
 *         description: Pengguna berhasil dibuat
 *       500:
 *         description: Terjadi kesalahan
 */
app.post('/api/v1/users', async (req, res) => {
    const { nama, nomorTelepon, alamat } = req.body;
    try {
        const newUser = await prisma.nasabah.create({
            data: { nama, nomorTelepon, alamat },
        });
        res.status(201).json(newUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/users:
 *   get:
 *     summary: Mendapatkan daftar pengguna
 *     tags: [Users]
 *     responses:
 *       200:
 *         description: Daftar pengguna berhasil diambil
 *       500:
 *         description: Terjadi kesalahan
 */
app.get('/api/v1/users', async (req, res) => {
    try {
        const users = await prisma.nasabah.findMany();
        res.json(users);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   get:
 *     summary: Mendapatkan pengguna berdasarkan ID
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pengguna berhasil diambil
 *       404:
 *         description: Pengguna tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan
 */
app.get('/api/v1/users/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await prisma.nasabah.findUnique({
            where: { idNasabah: Number(userId) },
            include: { akun: true },
        });
        res.json(user);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   put:
 *     summary: Memperbarui pengguna
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nama:
 *                 type: string
 *               nomorTelepon:
 *                 type: string
 *               alamat:
 *                 type: string
 *     responses:
 *       200:
 *         description: Pengguna berhasil diperbarui
 *       404:
 *         description: Pengguna tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan
 */
app.put('/api/v1/users/:userId', async (req, res) => {
    const { userId } = req.params;
    const { nama, nomorTelepon, alamat } = req.body;
    try {
        const updatedUser = await prisma.nasabah.update({
            where: { idNasabah: Number(userId) },
            data: { nama, nomorTelepon, alamat },
        });
        res.json(updatedUser);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/users/{userId}:
 *   delete:
 *     summary: Menghapus pengguna
 *     tags: [Users]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Pengguna berhasil dihapus
 *       404:
 *         description: Pengguna tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan
 */
app.delete('/api/v1/users/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const deletedUser = await prisma.nasabah.delete({
            where: { idNasabah: Number(userId) },
        });
        res.json({ message: 'User deleted successfully', deletedUser });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'User not found' });
        }
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/accounts:
 *   post:
 *     summary: Membuat akun baru
 *     tags: [Accounts]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomorRekening:
 *                 type: string
 *               saldo:
 *                 type: number
 *               tipeAkun:
 *                 type: string
 *               nasabahId:
 *                 type: integer
 *     responses:
 *       201:
 *         description: Akun berhasil dibuat
 *       404:
 *         description: Nasabah tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan
 */
app.post('/api/v1/accounts', async (req, res) => {
    const { nomorRekening, saldo, tipeAkun, nasabahId } = req.body;
    try {
        const nasabahExists = await prisma.nasabah.findUnique({
            where: { idNasabah: nasabahId },
        });

        if (!nasabahExists) {
            return res.status(404).json({ error: 'Nasabah tidak ditemukan.' });
        }

        const newAccount = await prisma.akun.create({
            data: {
                nomorRekening,
                saldo,
                tipeAkun,
                nasabah: { connect: { idNasabah: nasabahId } },
            },
        });
        res.status(201).json(newAccount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/accounts:
 *   get:
 *     summary: Mendapatkan daftar akun
 *     tags: [Accounts]
 *     responses:
 *       200:
 *         description: Daftar akun berhasil diambil
 *       500:
 *         description: Terjadi kesalahan
 */
app.get('/api/v1/accounts', async (req, res) => {
    try {
        const accounts = await prisma.akun.findMany();
        res.json(accounts);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/accounts/{accountId}:
 *   get:
 *     summary: Mendapatkan akun berdasarkan ID
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Akun berhasil diambil
 *       404:
 *         description: Akun tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan
 */
app.get('/api/v1/accounts/:accountId', async (req, res) => {
    const { accountId } = req.params;
    try {
        const account = await prisma.akun.findUnique({
            where: { idAkun: Number(accountId) },
            include: { transaksi: true },
        });
        res.json(account);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/accounts/{accountId}:
 *   put:
 *     summary: Memperbarui akun
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nomorRekening:
 *                 type: string
 *               saldo:
 *                 type: number
 *               tipeAkun:
 *                 type: string
 *     responses:
 *       200:
 *         description: Akun berhasil diperbarui
 *       404:
 *         description: Akun tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan
 */
app.put('/api/v1/accounts/:accountId', async (req, res) => {
    const { accountId } = req.params;
    const { nomorRekening, saldo, tipeAkun } = req.body;
    try {
        const updatedAccount = await prisma.akun.update({
            where: { idAkun: Number(accountId) },
            data: { nomorRekening, saldo, tipeAkun },
        });
        res.json(updatedAccount);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/accounts/{accountId}:
 *   delete:
 *     summary: Menghapus akun
 *     tags: [Accounts]
 *     parameters:
 *       - in: path
 *         name: accountId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Akun berhasil dihapus
 *       404:
 *         description: Akun tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan
 */
app.delete('/api/v1/accounts/:accountId', async (req, res) => {
    const { accountId } = req.params;
    try {
        const deletedAccount = await prisma.akun.delete({
            where: { idAkun: Number(accountId) },
        });
        res.json({ message: 'Account deleted successfully', deletedAccount });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Account not found' });
        }
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/transactions:
 *   post:
 *     summary: Membuat transaksi baru
 *     tags: [Transactions]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               dariAkunId:
 *                 type: integer
 *               keAkunId:
 *                 type: integer
 *               jumlah:
 *                 type: number
 *     responses:
 *       201:
 *         description: Transaksi berhasil dibuat
 *       404:
 *         description: Akun tidak ditemukan
 *       400:
 *         description: Saldo tidak cukup
 *       500:
 *         description: Terjadi kesalahan
 */
app.post('/api/v1/transactions', async (req, res) => {
    const { dariAkunId, keAkunId, jumlah } = req.body;
    try {
        const accountFrom = await prisma.akun.findUnique({ where: { idAkun: dariAkunId } });
        if (!accountFrom) {
            return res.status(404).json({ error: 'Akun asal tidak ditemukan.' });
        }

        if (accountFrom.saldo < jumlah) {
            return res.status(400).json({ error: 'Saldo tidak cukup.' });
        }

        const accountTo = await prisma.akun.findUnique({ where: { idAkun: keAkunId } });
        if (!accountTo) {
            return res.status(404).json({ error: 'Akun tujuan tidak ditemukan.' });
        }

        const transaction = await prisma.transaksi.create({
            data: {
                jumlah,
                tipeTransaksi: 'Transfer',
                akun: { connect: { idAkun: dariAkunId } },
            },
        });

        await prisma.akun.update({
            where: { idAkun: dariAkunId },
            data: { saldo: accountFrom.saldo - jumlah },
        });

        await prisma.akun.update({
            where: { idAkun: keAkunId },
            data: { saldo: accountTo.saldo + jumlah },
        });

        res.status(201).json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/transactions:
 *   get:
 *     summary: Mendapatkan daftar transaksi
 *     tags: [Transactions]
 *     responses:
 *       200:
 *         description: Daftar transaksi berhasil diambil
 *       500:
 *         description: Terjadi kesalahan
 */
app.get('/api/v1/transactions', async (req, res) => {
    try {
        const transactions = await prisma.transaksi.findMany({
            include: { akun: true },
        });
        res.json(transactions);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/transactions/{transactionId}:
 *   get:
 *     summary: Mendapatkan transaksi berdasarkan ID
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaksi berhasil diambil
 *       404:
 *         description: Transaksi tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan
 */
app.get('/api/v1/transactions/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    try {
        const transaction = await prisma.transaksi.findUnique({
            where: { idTransaksi: Number(transactionId) },
            include: { akun: true },
        });
        res.json(transaction);
    } catch (error) {
        res.status(500).json({ error: error.message });
    }
});

/**
 * @swagger
 * /api/v1/transactions/{transactionId}:
 *   delete:
 *     summary: Menghapus transaksi
 *     tags: [Transactions]
 *     parameters:
 *       - in: path
 *         name: transactionId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Transaksi berhasil dihapus
 *       404:
 *         description: Transaksi tidak ditemukan
 *       500:
 *         description: Terjadi kesalahan
 */
app.delete('/api/v1/transactions/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    try {
        const deletedTransaction = await prisma.transaksi.delete({
            where: { idTransaksi: Number(transactionId) },
        });
        res.json({ message: 'Transaction deleted successfully', deletedTransaction });
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: 'Transaction not found' });
        }
        res.status(500).json({ error: error.message });
    }
});

module.exports = app;
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server berjalan di http://localhost:${PORT}`);
});
