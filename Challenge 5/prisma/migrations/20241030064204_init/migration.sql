-- CreateTable
CREATE TABLE "Nasabah" (
    "idNasabah" SERIAL NOT NULL,
    "nama" TEXT NOT NULL,
    "nomorTelepon" TEXT NOT NULL,
    "alamat" TEXT NOT NULL,

    CONSTRAINT "Nasabah_pkey" PRIMARY KEY ("idNasabah")
);

-- CreateTable
CREATE TABLE "Akun" (
    "idAkun" SERIAL NOT NULL,
    "nomorRekening" TEXT NOT NULL,
    "saldo" DOUBLE PRECISION NOT NULL,
    "tipeAkun" TEXT NOT NULL,
    "nasabahId" INTEGER NOT NULL,

    CONSTRAINT "Akun_pkey" PRIMARY KEY ("idAkun")
);

-- CreateTable
CREATE TABLE "Transaksi" (
    "idTransaksi" SERIAL NOT NULL,
    "jumlah" DOUBLE PRECISION NOT NULL,
    "tanggal" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "tipeTransaksi" TEXT NOT NULL,
    "akunId" INTEGER NOT NULL,

    CONSTRAINT "Transaksi_pkey" PRIMARY KEY ("idTransaksi")
);

-- AddForeignKey
ALTER TABLE "Akun" ADD CONSTRAINT "Akun_nasabahId_fkey" FOREIGN KEY ("nasabahId") REFERENCES "Nasabah"("idNasabah") ON DELETE RESTRICT ON UPDATE CASCADE;

-- AddForeignKey
ALTER TABLE "Transaksi" ADD CONSTRAINT "Transaksi_akunId_fkey" FOREIGN KEY ("akunId") REFERENCES "Akun"("idAkun") ON DELETE RESTRICT ON UPDATE CASCADE;
