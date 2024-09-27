saldo = 0;

function format(angka){
    return angka.toLocaleString('id-ID',{style:'currency',currency:'IDR'});
}

function tambahSaldo() {
    tambah = +prompt('Tambah Saldo Sejumlah');
    if (isNaN(tambah) || tambah <= 0) {
        alert("Input Tidak Valid");
    } else {
        saldo += tambah;
        alert(`Berhasil! Saldo Anda Sekarang ${format(saldo)}`);
    }
}

function kurangiSaldo() {
    if (saldo <= 0) {
        alert("Saldo Anda Kosong");
        return;
    }

    kurang = +prompt('Kurangi Saldo Sejumlah');
    if (isNaN(kurang) || kurang <= 0) {
        alert("Input Tidak Valid");
    } else if (kurang > saldo) {
        alert("Saldo Tidak Cukup");
    } else {
        saldo -= kurang;
        alert(`Berhasil! Saldo Anda Sekarang ${format(saldo)}`);
    }
}

function menu() {
    do {
        tombol = +prompt(`Saldo Anda Sekarang ${format(saldo)} \n1 Tambah Saldo \n2 Kurangi Saldo \n3 Keluar \nMasukkan Angka Menu Tujuan`);

        switch (tombol) {
            case 1:
                tambahSaldo();
                break;
            case 2:
                kurangiSaldo();
                break;
            case 3:
                alert('Keluar Menu');
                break;
            default:
                alert('Pilihan tidak valid. \nMasukkan angka 1, 2, atau 3.');
                break;
        }
    } while (tombol !== 3);
}

menu();
