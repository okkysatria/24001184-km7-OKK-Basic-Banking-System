class Nasabah {
    constructor(nama, saldo = 0) {
        this.nama = nama;
        this.saldo = saldo;
    }

    formatRupiah(jumlah) {
        return jumlah.toLocaleString('id-ID', { style: 'currency', currency: 'IDR' });
    }

    deposit(jumlah) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (isNaN(jumlah) || jumlah <= 0) {
                    reject('Jumlah deposit salah.');
                } else {
                    this.saldo += jumlah;
                    resolve(`Berhasil! Saldo sekarang: ${this.formatRupiah(this.saldo)}`);
                }
            }, 1000);
        });
    }

    withdraw(jumlah) {
        return new Promise((resolve, reject) => {
            setTimeout(() => {
                if (isNaN(jumlah) || jumlah <= 0) {
                    reject('Jumlah penarikan harus positif.');
                } else if (jumlah > this.saldo) {
                    reject('Saldo tidak cukup.');
                } else {
                    this.saldo -= jumlah;
                    resolve(`Berhasil! Saldo sekarang: ${this.formatRupiah(this.saldo)}`);
                }
            }, 1000);
        });
    }
}

const daftarAkun = [];
akunAktif = null;

function perbaruiUI() {
    if (akunAktif) {
        document.getElementById("owner-name").textContent = akunAktif.nama;
        document.getElementById("balance-amount").textContent = akunAktif.formatRupiah(akunAktif.saldo);
        document.getElementById("account-section").style.display = "block";
        document.getElementById("menu-section").style.display = "none";
    } else {
        document.getElementById("account-section").style.display = "none";
        document.getElementById("menu-section").style.display = "block";
    }
}

function kelolaAkun() {
    pilihan = +prompt("1. Buat Akun Baru\n2. Pilih Akun\nPilih:");
    try {
        if (pilihan === 1) {
            const namaNasabah = prompt("Masukkan nama:");
            if (!namaNasabah) {
                throw new Error("Nama tidak boleh kosong.");
            }
            for (let i = 0; i < daftarAkun.length; i++) {
                if (daftarAkun[i].nama.toLowerCase() === namaNasabah.toLowerCase()) {
                    akunSudahAda = daftarAkun[i];
                    break;
                }
            }
            if (akunSudahAda) {
                throw new Error("Nama ini sudah ada. Coba nama lain.");
            }
            const nasabahBaru = new Nasabah(namaNasabah);
            daftarAkun.push(nasabahBaru);
            akunAktif = nasabahBaru;
            alert(`Akun baru untuk ${namaNasabah} sudah dibuat.`);
            perbaruiUI();
        } else if (pilihan === 2) {
            if (daftarAkun.length === 0) {
                throw new Error("Tidak ada akun. Buat akun baru dulu.");
            }
            const pilihanAkun = daftarAkun.map((acc, index) => `${index + 1}. ${acc.nama}`).join('\n');
            const noAkun = +prompt(`Pilih akun (0 untuk kembali):\n${pilihanAkun}`);

            if (noAkun === 0) {
                return;
            } else if (noAkun > 0 && noAkun <= daftarAkun.length) {
                akunAktif = daftarAkun[noAkun - 1];
                alert(`Berpindah ke akun ${akunAktif.nama}.`);
                perbaruiUI();
            } else {
                throw new Error("Pilihan tidak valid.");
            }
        } else {
            throw new Error("Opsi tidak valid.");
        }
    } catch (error) {
        alert(`Error: ${error.message}`);
    }
}

document.getElementById("LOGIN").addEventListener("click", kelolaAkun);

async function deposit() {
    if (!akunAktif) {
        alert("Pilih akun dulu.");
        return;
    }
    const jumlahDeposit = +prompt("Masukkan jumlah deposit:");
    if (isNaN(jumlahDeposit)) {
        alert("Input harus berupa angka bulat.");
        return;
    }
    try {
        const hasilDeposit = await akunAktif.deposit(jumlahDeposit);
        alert(hasilDeposit);
        perbaruiUI();
    } catch (error) {
        alert(`Error: ${error}`);
    }
}

async function withdraw() {
    if (!akunAktif) {
        alert("Pilih akun dulu.");
        return;
    }
    const jumlahPenarikan = +prompt("Masukkan jumlah penarikan:");
    if (isNaN(jumlahPenarikan)) {
        alert("Input harus berupa angka bulat.");
        return;
    }
    try {
        const hasilPenarikan = await akunAktif.withdraw(jumlahPenarikan);
        alert(hasilPenarikan);
        perbaruiUI();
    } catch (error) {
        alert(`Error: ${error}`);
    }
}

function logout() {
    akunAktif = null;
    perbaruiUI();
}

perbaruiUI();
