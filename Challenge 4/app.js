const express = require('express');
const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
const app = express();
app.use(express.json());

app.get('/', (req, res) => {
    res.send('Welcome to the Bank API');
});

app.get('/api/v1/users', async (req, res) => {
    try {
        const users = await prisma.user.findMany({
            include: { profile: true, accounts: true }
        });
        res.status(200).json(users);
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil daftar pengguna' });
    }
});

app.get('/api/v1/users/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(userId) },
            include: { profile: true, accounts: true },
        });
        if (!user) {
            return res.status(404).json({ error: 'Pengguna tidak ditemukan' });
        }
        res.status(200).json(user);
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil detail pengguna' });
    }
});

app.post('/api/v1/users', async (req, res) => {
    const { name, email, profileData } = req.body;
    if (!name || !email || !profileData) {
        return res.status(400).json({ error: 'Nama, email, dan data profil diperlukan' });
    }
    try {
        const newUser = await prisma.user.create({
            data: {
                name,
                email,
                profile: {
                    create: profileData,
                },
            },
            include: { profile: true }
        });
        res.status(201).json(newUser);
    } catch (err) {
        res.status(400).json({ error: 'Gagal menambahkan pengguna' });
    }
});

app.post('/api/v1/accounts', async (req, res) => {
    const { userId, name, balance } = req.body;
    if (!userId || !name || balance === undefined) {
        return res.status(400).json({ error: 'UserId, nama, dan saldo diperlukan' });
    }
    try {
        const newAccount = await prisma.bankAccount.create({
            data: {
                user: {
                    connect: { id: parseInt(userId) }
                },
                name,
                balance: parseFloat(balance),
            }
        });
        res.status(201).json(newAccount);
    } catch (err) {
        res.status(400).json({ error: 'Gagal menambahkan akun' });
    }
});

app.post('/api/v1/transactions', async (req, res) => {
    const { senderAccountId, receiverAccountId, amount } = req.body;
    if (!senderAccountId || !receiverAccountId || !amount) {
        return res.status(400).json({ error: 'SenderAccountId, ReceiverAccountId, dan jumlah diperlukan' });
    }
    try {
        const sender = await prisma.bankAccount.update({
            where: { id: parseInt(senderAccountId) },
            data: { balance: { decrement: parseFloat(amount) } },
        });

        const receiver = await prisma.bankAccount.update({
            where: { id: parseInt(receiverAccountId) },
            data: { balance: { increment: parseFloat(amount) } },
        });

        const transaction = await prisma.transaction.create({
            data: {
                senderAccount: { connect: { id: parseInt(senderAccountId) } },
                receiverAccount: { connect: { id: parseInt(receiverAccountId) } },
                amount: parseFloat(amount),
            }
        });

        res.status(200).json(transaction);
    } catch (err) {
        res.status(400).json({ error: 'Transaksi gagal' });
    }
});

app.get('/api/v1/transactions', async (req, res) => {
    try {
        const transactions = await prisma.transaction.findMany({
            include: { senderAccount: true, receiverAccount: true }
        });
        res.status(200).json(transactions);
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil daftar transaksi' });
    }
});

app.get('/api/v1/transactions/:transactionId', async (req, res) => {
    const { transactionId } = req.params;
    try {
        const transaction = await prisma.transaction.findUnique({
            where: { id: parseInt(transactionId) },
            include: { senderAccount: true, receiverAccount: true },
        });
        if (!transaction) {
            return res.status(404).json({ error: 'Transaksi tidak ditemukan' });
        }
        res.status(200).json(transaction);
    } catch (err) {
        res.status(500).json({ error: 'Gagal mengambil detail transaksi' });
    }
});

app.listen(3000, () => {
    console.log('Server berjalan di port 3000');
});
