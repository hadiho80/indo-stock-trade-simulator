# Panduan Membaca Bid Offer Saham Indonesia

Ini alat edukasi untuk membantu membaca order book saham Indonesia. Buka
`index.html` di browser, masukkan level bid-offer dari aplikasi sekuritas, lalu
lihat ringkasan tekanan buyer/seller.

## Istilah utama

- Bid: harga dan lot antrian beli. Bid terbaik adalah harga beli tertinggi.
- Offer atau ask: harga dan lot antrian jual. Offer terbaik adalah harga jual
  terendah.
- Last price: harga transaksi terakhir, bukan harga antrian.
- Spread: selisih offer terbaik dan bid terbaik.
- Lot: satuan transaksi saham Indonesia, 1 lot = 100 lembar.
- Queue: antrian pada level harga tertentu.
- Wall: lot yang sangat besar pada salah satu level harga.
- Imbalance: ketimpangan total lot bid dibanding offer.

## Cara baca langkah demi langkah

1. Lihat best bid dan best offer.
   Kalau best bid 9600 dan best offer 9625, artinya buyer tertinggi baru mau
   beli di 9600, sedangkan seller termurah baru mau jual di 9625.

2. Hitung spread.
   Spread kecil biasanya menandakan saham likuid dan mudah keluar-masuk.
   Spread lebar membuat entry dan exit lebih mahal, terutama untuk trading
   cepat.

3. Bandingkan lot dekat harga.
   Prioritaskan 3 sampai 5 level terdekat, bukan hanya total seluruh antrian.
   Bid tebal dekat harga bisa menjadi bantalan. Offer tebal dekat harga bisa
   menjadi penahan kenaikan.

4. Cari wall.
   Wall bid sering dianggap support intraday. Wall offer sering dianggap
   resistance intraday. Tapi wall bisa dipasang lalu dicabut, jadi lihat apakah
   lotnya bertahan saat harga mendekat.

5. Cocokkan dengan transaksi berjalan.
   Order book adalah niat beli/jual. Transaksi berjalan adalah uang yang benar
   benar sudah mengeksekusi. Bid tebal tetapi transaksi banyak memukul bid bisa
   tetap bearish.

6. Perhatikan posisi last price.
   Kalau last price sering terjadi di offer, buyer sedang agresif. Kalau last
   price sering terjadi di bid, seller sedang agresif.

7. Hitung kebutuhan lot pribadi.
   Kalau mau beli 1.000 lot tetapi offer dekat hanya 300 lot, kamu mungkin
   perlu mengambil beberapa level harga. Average price bisa lebih tinggi dari
   best offer.

## Pola umum

- Bid tebal, offer tipis: buyer terlihat lebih siap menampung, potensi naik
  lebih ringan jika transaksi mulai mengangkat offer.
- Bid tipis, offer tebal: seller lebih dominan, kenaikan perlu menyerap banyak
  lot.
- Spread lebar: hindari mengejar harga kecuali alasan trading sangat kuat.
- Wall bid hilang saat disentuh: sinyal lemah, karena support antrian tidak
  benar-benar bertahan.
- Wall offer habis dimakan: sinyal kuat, terutama jika volume transaksi ikut
  besar.
- Total bid besar jauh di bawah harga: belum tentu bullish, karena tidak dekat
  dengan area eksekusi.

## Cara memakai tool versi simulator

1. Buka `index.html`.
2. Edit kode saham, modal awal, lot, limit price, dan order book bila perlu.
3. Gunakan chart candlestick mini di kiri untuk melihat reaksi harga.
4. Gunakan order book di kanan untuk melihat bid, offer, dan sisa lot.

## Simulator trading virtual

Default modal awal adalah Rp1.000.000.000. Semua simulasi berjalan offline di
browser tanpa koneksi data real-time.

Fitur yang tersedia:

- Buy Market: langsung mengambil offer terdekat sampai lot terpenuhi.
- Sell Market: langsung menjual ke bid terdekat sampai lot terpenuhi.
- Hajar Semua Offer: membeli semua offer yang tampil sampai 10 level, selama
  cash cukup. Jika cash atau offer tidak cukup, hasilnya akan menampilkan
  requested, filled, dan unfilled lot.
- Buang Semua Bid: menjual seluruh posisi yang kamu punya ke bid yang tampil.
  Jika bid 10 level tidak cukup, sisa posisi ditampilkan sebagai unfilled.
- Place Limit Buy: memasang antrian bid di harga limit.
- Place Limit Sell: memasang antrian offer di harga limit.
- Next Tick: menggerakkan order book satu langkah berdasarkan tekanan bid/offer.
- Auto Simulate: menjalankan tick otomatis setiap sekitar 1,2 detik.
- Reset Simulator: mengembalikan modal, posisi, pending order, dan order book
  ke contoh awal.
- Toggle Normal / ARA Shock: Normal menaikkan/menurunkan harga beberapa fraksi
  setelah sweep besar. ARA Shock mensimulasikan lonjakan ke area auto rejection
  atas atau bawah berdasarkan acuan harga simulasi.
- Retail AI: bisa transaksi kecil dan memasang limit order kecil secara acak.
- Bandar AI: bisa diaktifkan untuk skenario random, akumulasi, atau distribusi.
  Mode akumulasi cenderung menebalkan bid dan sesekali mengangkat offer. Mode
  distribusi cenderung menebalkan offer dan sesekali memukul bid.
- Market cap: memengaruhi sensitivitas harga. Market cap kecil dibuat lebih
  mudah bergerak oleh lot yang sama, sedangkan market cap besar lebih berat.
- Preset market cap: Small Cap, Mid Cap, Big Cap, dan Bank Jumbo bisa dipilih
  langsung tanpa mengetik angka manual.
- Free float %: dipakai untuk menghitung barang beredar simulasi. Free float
  kecil membuat harga lebih mudah bergerak karena barang yang aktif beredar
  lebih sedikit.
- Timeframe chart: tombol S, M, H, D mengubah penggabungan candle simulasi.
  S membuat tiap tick menjadi candle, sedangkan M/H/D menggabungkan beberapa
  tick agar terasa seperti timeframe lebih besar.
- Tab Holders: menampilkan Bandar A, Bandar B, Bandar C, dan Retail Pool.
  Default-nya Bandar A akumulasi, Bandar B distribusi, Bandar C random.
- Tab Settings: modal, barang/lot, dan skenario tiap bandar bisa diubah manual.
- Pasar nego: saat Bandar AI aktif, sebagian tick dapat memindahkan barang antar
  pelaku tanpa langsung makan bid-offer, lalu memberi bias ke gerak tick
  berikutnya.
- Tab Guide: panduan pemula untuk bid, offer, market order, limit order, market
  cap, akumulasi, distribusi, dan pasar nego.

Panel akun virtual menampilkan cash, lot dimiliki, average price, unrealized
P/L, unrealized P/L %, realized P/L, return %, dan equity. Fee simulasi
menggunakan asumsi beli 0,15% dan jual 0,25%.

Cara latihan yang enak:

1. Tekan Next Tick beberapa kali tanpa posisi untuk membaca perubahan bid-offer.
2. Pasang Limit Buy di bawah best bid, lalu lihat apakah market sell menyentuh
   antrian kamu.
3. Coba Buy Market saat offer tipis, lalu perhatikan average price.
4. Coba Sell Market saat bid tipis, lalu perhatikan seberapa cepat harga turun.
5. Jalankan Auto Simulate untuk melihat pending order bisa fill atau tidak.

## Batasan penting

Tool ini tidak memberi rekomendasi beli atau jual. Order book dapat berubah
sangat cepat, terutama pada saham kecil atau saham yang sedang ramai. Gunakan
bersama chart, volume, berita, indeks sektor, broker summary, dan rencana risiko.

Referensi aturan yang dipakai: fraksi harga umum saham Indonesia dan batas auto
rejection BEI efektif 8 April 2025 untuk saham papan utama, ekonomi baru, dan
pengembangan.
