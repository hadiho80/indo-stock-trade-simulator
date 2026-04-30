# Simulator Bid Offer Saham Indonesia

Tool edukasi offline untuk latihan membaca bid-offer, reaksi harga, limit order,
TP/SL, dan perilaku pelaku pasar seperti retail, bandar, dan emiten. Buka
`index.html` langsung di browser, atau deploy sebagai static site.

## Istilah Utama

- Bid: antrian beli. Bid terbaik adalah harga beli tertinggi.
- Offer: antrian jual. Offer terbaik adalah harga jual terendah.
- Last price: harga transaksi terakhir, bukan harga antrian.
- Spread: jarak antara best bid dan best offer.
- Lot: 1 lot saham Indonesia = 100 lembar.
- Market order: order yang langsung makan offer atau pukul bid.
- Limit order: order yang antre di harga tertentu sampai tersentuh.
- Market cap: nilai kapitalisasi pasar; makin besar biasanya makin berat digerakkan.
- Free float: porsi saham yang aktif beredar. Float kecil lebih sensitif.
- ARA/ARB: batas auto rejection atas/bawah simulasi.
- FCA Mode: mode auction sederhana, order dikumpulkan lalu dicocokkan dengan Run Auction.

## Fraksi Harga

Simulator memakai fraksi harga saham Indonesia:

- Di bawah Rp200: tick Rp1
- Rp200 sampai di bawah Rp500: tick Rp2
- Rp500 sampai di bawah Rp2.000: tick Rp5
- Rp2.000 sampai di bawah Rp5.000: tick Rp10
- Rp5.000 ke atas: tick Rp25

Spread dan pergerakan order book mengikuti fraksi ini.

## Spread Bid-Offer

Di Settings ada pilihan `Spread bid-offer`:

- Kecil: bid-offer rapat dengan depth lebih tipis.
- Normal: bid-offer rapat dengan depth standar.
- Lebar: gap dibuat lebih renggang.

Setelah harga loncat karena offer/bid tipis dimakan order besar, simulator
menambal book lagi mengikuti last price baru. Contoh: last dari 150 lompat ke
160, maka mode rapat akan membentuk best bid sekitar 159 dan best offer sekitar
161.

## Fitur Trading

- Buy Mkt: User langsung membeli offer terdekat.
- Sell Mkt: User langsung menjual ke bid terdekat.
- Hajar Semua Offer: membeli offer yang tersedia selama cash cukup.
- Buang Semua Bid: menjual posisi User ke bid.
- Limit Buy/Sell: memasang pending order di harga limit.
- Cancel order: pending order bisa dibatalkan satu per satu atau semua.
- Reset Bid Offer: membangun ulang book mengikuti harga Settings dan mode spread.
- Reset: mengulang simulator dari harga Settings, modal, actor, dan book baru.
- Normal / ARA Shock: Normal memberi efek sweep biasa; ARA Shock mensimulasikan
  lonjakan ke area auto rejection saat sweep besar.

Input lot User otomatis dipotong:

- Buy market mengikuti cash dan offer tersedia.
- Limit buy mengikuti cash pada harga limit.
- Sell market dan limit sell mengikuti lot yang dimiliki User.

## TP, SL, dan Trailing Stop

Panel `TP/SL` tersembunyi dulu. Klik tombol `TP/SL` untuk membukanya.

- TP: isi harga trigger dan jumlah lot.
- SL: isi harga trigger dan jumlah lot.
- Trailing Stop: isi persen trailing dan jumlah lot.
- Apply TP/SL: mengaktifkan risk order dan menampilkan status aktif.
- Cancel TP/SL: membatalkan semua risk order aktif.

Saat trigger aktif, simulator tidak langsung sell market. Ia memasang limit sell
di harga trigger, sehingga order muncul sebagai pending order dan ikut bid-offer.
Order akan fill jika harga menyentuh atau melewati harga limit sesuai logic
simulator.

## Actor dan Holder

Tab Holders menampilkan:

- User: portfolio utama kamu.
- Emiten: porsi non-free-float.
- Bandar A, Bandar B, Bandar C.
- Retail Pool: kumpulan 10 retail kecil.

Kolom penting:

- Barang: jumlah lot yang dipegang.
- Avg: harga rata-rata.
- Cash: sisa uang.
- U/P/L: unrealized profit/loss.
- R/P/L: realized profit/loss.
- Net: perubahan lot bersih sejak simulasi mulai.

Di Settings, setiap actor punya On/Off sendiri. Toggle global Retail/Bandar/Emiten
sudah dihapus. Kalau actor Off, dia diam.

## Skenario Actor

- Akum: menambah barang, menebalkan bid, dan sering mengangkat offer.
- Distri: melepas barang, menebalkan offer, dan sering memukul bid.
- Random: acak antara akum dan distri.
- Agresif: pump/dump spontan dengan lot besar.
- Pompom: fase akumulasi, pump, distribusi, lalu dump.
- Netral: diam, kecuali masih tercatat sebagai holder.

## Pompom Settings

Skenario Pompom punya pengaturan:

- Target pump %: target kenaikan sebelum masuk distribusi.
- Durasi pump tick: batas jumlah tick fase pump.
- Dump barang %: persentase barang actor yang dibuang saat fase dump.
- Retail FOMO: jika On, Retail Pool ikut beli saat fase pump.

Pompom dibuat untuk latihan membaca kondisi harga yang digoreng: bid terlihat
tebal, candle naik, retail ikut masuk, lalu actor besar mulai distribusi dan
bisa membanting harga.

## Cara Latihan

1. Mulai dari Chart. Lihat last price, candle, spread, best bid, dan best offer.
2. Masuk Settings, pilih market cap, free float, spread, dan skenario actor.
3. Tekan Next Tick untuk langkah manual, atau Auto untuk simulasi berjalan.
4. Coba Limit Buy di bawah harga dan lihat kapan fill.
5. Coba Buy Mkt saat offer tipis untuk melihat harga loncat.
6. Coba TP/SL, tekan Apply, lalu lihat status aktif dan pending order saat trigger.
7. Baca Holders untuk melihat siapa akumulasi, siapa distribusi, dan siapa yang
   masih pegang barang.

## Batasan

Ini simulator edukasi, bukan rekomendasi beli/jual dan bukan data real-time.
Perilaku AI, ARA/ARB, FCA, pompom, dan pasar nego disederhanakan untuk latihan
membaca reaksi bid-offer.
