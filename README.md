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
- Ready lot: lot bid/offer yang benar-benar bisa dieksekusi oleh order saat itu.
- Market cap: nilai kapitalisasi pasar; makin besar biasanya makin berat digerakkan.
- Free float: porsi saham yang aktif beredar. Float kecil lebih sensitif.
- ARA/ARB: batas auto rejection atas/bawah simulasi.
- FCA Mode: mode auction sederhana, order dikumpulkan lalu dicocokkan dengan Run Auction.
- Running trade: daftar transaksi yang benar-benar terjadi.
- Trade summary: ringkasan buy/sell lot dan average price tiap pelaku sejak reset.
- Pecah lot: membagi order besar menjadi beberapa limit order bertahap.

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

Row bid-offer kosong disembunyikan agar layar lebih efisien, terutama di mobile.
Lot book dibatasi terhadap visible float agar antrian tidak melebihi setting
market. Kalau Emiten tidak aktif/netral, visible float mengikuti free float.
Kalau Emiten aktif, sebagian kecil barang Emiten boleh ikut menambah likuiditas
book. Cap per level dibuat fleksibel agar saham dengan market cap/free float
besar bisa menampilkan ribuan sampai puluhan ribu lot. Angka lot dibuat acak di
bawah cap, bukan dipotong rata ke angka maksimum. Batas ini hanya untuk likuiditas
buatan simulator/AI. Order User tidak diperkecil oleh cap book: kalau User
memasang 10.000 lot dan cash/posisi cukup, pending order tetap 10.000 lot.

## Kondisi Market

Di Settings ada pilihan `Kondisi market`:

- Sepi: order book lebih tipis, aktivitas lebih rendah, volatilitas lebih kecil.
- Normal: kondisi default.
- Rame: order book lebih tebal, transaksi lebih aktif, volatilitas lebih tinggi.
- Random: simulator berganti-ganti rasa market antar tick.

Skenario actor ikut memberi bias visual pada book: Akum menebalkan bid,
Distri menebalkan offer, Pompom mengikuti fasenya, sedangkan Agresif bisa
menciptakan antrian besar atau sweep.

Ukuran transaksi AI ikut menyesuaikan visible float, kondisi market, dan tipe
pelaku. Tick kecil hanya mencuil best bid/offer. Harga baru loncat ke level
berikutnya jika lot level sebelumnya benar-benar habis tersapu.

## Fitur Trading

- Buy Mkt: User langsung membeli offer terdekat.
- Sell Mkt: User langsung menjual ke bid terdekat.
- Hajar Semua Offer: membeli offer yang tersedia selama cash cukup.
- Buang Semua Bid: menjual posisi User ke bid.
- Limit Buy/Sell: memasang pending order di harga limit.
- Pecah Lot: membagi lot besar menjadi beberapa limit order. Split Buy menyebar
  order beli turun dari harga Limit; Split Sell menyebar order jual naik dari
  harga Limit.
- Cancel order: pending order bisa dibatalkan satu per satu atau semua.
- Reset Bid Offer: membangun ulang book mengikuti harga Settings dan mode spread.
- Reset: mengulang simulator dari harga Settings, modal, actor, dan book baru.
- Normal / ARA Shock: Normal memberi efek sweep biasa; ARA Shock mensimulasikan
  lonjakan ke area auto rejection saat sweep besar.
- Running Trade: daftar transaksi semua pelaku, termasuk User, Retail, Bandar,
  Emiten, dan auction.
- Trade Summary: ringkasan buy/sell lot dan avg price masing-masing pelaku.

Input lot User otomatis dipotong:

- Buy market mengikuti cash dan offer tersedia.
- Sell market mengikuti posisi User dan bid tersedia.
- Limit buy marketable mengikuti cash dan offer yang berada di harga limit atau lebih murah.
- Limit sell marketable mengikuti posisi User dan bid yang berada di harga limit atau lebih mahal.
- Limit pending yang belum menyentuh harga tetap boleh lebih besar dari ready lot saat ini, selama cash/posisi cukup.

Saat input lebih besar dari ready lot/cash/posisi, simulator menampilkan notif
dan mengganti input Lot ke angka maksimal yang bisa dieksekusi.

Jika order besar ingin dibuat lebih halus, buka `Pecah Lot`, isi jumlah pecahan
dan jarak tick. Contoh: 10.000 lot, 5 pecahan, jarak 1 tick akan membuat sekitar
5 order bertahap dari harga Limit.

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
- Persen barang: porsi holder yang ditampilkan proporsional terhadap total lot
  simulasi. Jika total posisi simulasi melewati total lot karena likuiditas
  publik/AI, tampilan dinormalisasi agar total visual tidak melewati 100%.
- Avg: harga rata-rata.
- Cash: sisa uang.
- U/P/L: unrealized profit/loss.
- R/P/L: realized profit/loss.
- Net: perubahan lot bersih sejak simulasi mulai.

Di Settings, setiap actor punya On/Off sendiri. Toggle global Retail/Bandar/Emiten
sudah dihapus. Kalau actor Off, dia diam.

Trade summary dihitung sejak simulator mulai atau sejak tombol Reset ditekan.

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
7. Untuk order besar, buka Pecah Lot agar order terbagi menjadi beberapa entry.
8. Baca Running Trade untuk melihat transaksi aktual.
9. Baca Trade Summary untuk melihat siapa net buy/sell dan average price-nya.
10. Baca Holders untuk melihat siapa akumulasi, siapa distribusi, dan siapa yang
   masih pegang barang.

## Mobile

Di mobile, navigasi berubah menjadi bottom tab bar: Chart, Holders, Settings,
dan Guide. Panel Reaksi, Running Trade, dan Trade Summary dibuat collapsible
agar layar tidak terlalu panjang. Desktop tetap direkomendasikan untuk latihan
lebih nyaman karena tabel bid-offer dan holder lebih luas.

## Batasan

Ini simulator edukasi, bukan rekomendasi beli/jual dan bukan data real-time.
Perilaku AI, ARA/ARB, FCA, pompom, dan pasar nego disederhanakan untuk latihan
membaca reaksi bid-offer.
