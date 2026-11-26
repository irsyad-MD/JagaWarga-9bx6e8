# Jaga Warga

## Hak akses tetap

- Peran dibaca dari `user_profiles.account_role` dan keanggotaan terverifikasi di Supabase. Tidak ada pergantian Mode Admin/Warga.
- `accgameskuy@gmail.com` menjadi Super Admin hanya setelah email akun terverifikasi. Aplikasi tidak membuat akun ini atau menebak kata sandinya.
- Super Admin membuka **Peran Pengurus**, mengisi email akun terverifikasi, lalu menetapkan Admin pada wilayah aktif. Admin biasa tidak memiliki menu tersebut dan RPC memeriksa kewenangan di server.
- Warga baru bergabung menggunakan kode undangan, nomor rumah, dan bukti domisili privat; pengurus meninjau pendaftaran.

## Navigasi dan alur

- Katalog di `constants/featureCatalog.ts` memetakan 30 fitur Admin, 40 fitur Warga, dan 5 inovasi ke layar/alur nyata.
- Verifikasi, disposisi, progres, komentar, eskalasi, rating, dan evaluasi menggunakan detail laporan yang sama; tidak membuat halaman kosong untuk tiap variasi tindakan.
- Menu data membuka daftar, pencarian, detail, dan formulir sesuai izin. Data kosong tidak diisi contoh. Pengguna tanpa izin menulis dapat memeriksa data resmi, bukan membuat data pengurus.
- `schema.sql` adalah skema konsolidasi instalasi baru, termasuk tabel, FK, indeks, RLS, RPC, trigger, dan Storage. Database proyek ini telah dimigrasikan melalui dialog SQL; jangan menjalankannya ulang sebagai migrasi destruktif pada database yang sudah terisi.
- Media privat menggunakan Edge Function `private-file` untuk tiket upload/download yang memeriksa akun dan wilayah. Biner tidak disimpan di PostgreSQL.

## Fungsi yang bergantung pada perangkat dan konfigurasi

- Kamera, mikrofon, pemindaian QR, GPS, peta native, audio, ekspor PDF, dan deep links perlu diuji di build iOS/Android; Live Preview bukan pengujian perangkat.
- **Aktifkan Notifikasi Perangkat** meminta izin dan mendaftarkan Expo push token jika EAS projectId tersedia. Tanpa projectId, aplikasi menjelaskan bahwa hanya izin notifikasi lokal yang aktif. Tidak ada token push fiktif.
- Banner dalam aplikasi dan notifikasi akun berasal dari tabel Supabase. Tombol **Kirim Push Peringatan** mengirim melalui Expo; tiket layanan tidak dianggap bukti notifikasi diterima perangkat.
- Worker webhook dipanggil selama panel pengurus aktif. Pengiriman server saat tidak ada aplikasi terbuka masih memerlukan penjadwalan worker `dispatch-webhooks`. Endpoint harus HTTPS publik; status HTTP dan kegagalan dicatat.
- Neighbor Relay mengantrekan SOS/laporan teks pada perangkat ini dengan request ID idempoten. Sinkronisasi memerlukan aplikasi aktif dan koneksi kembali. Tidak ada relay Bluetooth atau sinkronisasi antarperangkat yang dipalsukan.
- Media offline tetap berada di formulir; pengiriman teks tanpa media dapat diantrekan. Antrean belum tersinkron tidak ditampilkan sebagai sinyal yang sudah diterima pengurus.
- Live location berjalan selama aplikasi aktif, untuk penerima ID akun yang dipilih, sampai durasi habis; hemat baterai menjeda pelacakan. Tidak menjanjikan pelacakan background yang belum dikonfigurasi.
- Panduan mitigasi berasal dari pengurus dan tersedia offline setelah dimuat pada akun/wilayah ini; bukan konten seed.
- Safe Corridor menampilkan jalur yang dicatat pengurus serta laporan gangguan sekitar titik rute. Bukan layanan turn-by-turn atau jaminan keselamatan.
- Cuaca menggunakan Open-Meteo pada koordinat nyata. TMA berasal dari pengukuran pengurus. Tidak menampilkan suhu atau tinggi air contoh.
- Mode hemat baterai menyediakan panel gelap, mematikan animasi rute, mengurangi polling, dan menjeda pelacakan; bukan kontrol sistem operasi atas baterai atau kecerahan.

## Pemeriksaan sebelum publikasi

1. Daftarkan dan verifikasi email pemilik, login, lalu pastikan peran Super Admin dan akses wilayah.
2. Daftarkan warga kedua, unggah domisili, tinjau oleh pengurus, dan pastikan warga tidak dapat membuka layar/RPC pengurus.
3. Tambahkan Admin melalui email; pastikan akses berubah setelah profil di-refresh dan warga tidak dapat menaikkan perannya sendiri.
4. Buat laporan teks/foto/video/audio, verifikasi, tugaskan, catat progres dan bukti; periksa linimasa dan komentar pada dua akun.
5. Uji SOS online, offline, respons, pembatalan, dan status aman. Jangan memakai pengujian sebagai pengganti panggilan layanan darurat.
6. Uji check-in pada waktu/radius pos yang tepat dan salah, QR benar/salah, tugas milik akun lain, dan pertukaran jadwal dua warga.
7. Uji konfirmasi pembayaran dua kali: transaksi kas hanya dibuat satu kali oleh RPC. Uji voting dua kali: satu suara per polling.
8. Uji akses media privat antarwilayah, akhir masa berbagi lokasi, akun ditangguhkan, ekspor CSV/PDF, dan cache panduan offline.
9. Konfigurasikan EAS push dan worker terjadwal, lalu uji penerimaan perangkat dan HTTP webhook. Tidak ada klaim pengujian perangkat otomatis dalam sesi ini.

Pembuka dan identitas aplikasi mempertahankan **By ImsyadDeveloper**.
