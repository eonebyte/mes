# Sistem MES untuk Industri Manufaktur

Repositori ini berisi kode sumber untuk Sistem MES (Manufacturing Execution System) yang dirancang khusus untuk lingkungan manufaktur industri. Sistem ini dibangun menggunakan **Node.js** dengan **Fastify** untuk backend, **PostgreSQL** dan **InfluxDB** sebagai basis data, serta **React** dengan **Ant Design** untuk frontend. Sistem ini bertujuan untuk menyederhanakan dan memantau proses produksi secara real-time.

## Daftar Isi

1. [Ringkasan](#ringkasan)
2. [Fitur](#fitur)
3. [Teknologi](#teknologi)
4. [Instalasi](#instalasi)


---

### Ringkasan

Sistem MES ini berfungsi sebagai penghubung antara proses produksi di lapangan dengan manajemen. Dengan menggunakan data yang dikumpulkan langsung dari mesin dan operator, sistem ini memberikan informasi yang akurat dan real-time tentang status produksi, kualitas produk, dan efisiensi proses.

### Fitur

- **Manajemen Data Produksi**: Memantau proses produksi, bahan baku, dan hasil produksi.
- **Pelaporan Waktu Nyata**: Memberikan laporan real-time tentang performa mesin dan status produksi.
- **Analitik Historis**: Menyimpan dan menganalisis data historis menggunakan InfluxDB.
- **User Interface Responsif**: Tampilan frontend yang modern dan intuitif dengan Ant Design dan React.
- **Integrasi API**: Menggunakan Fastify.js untuk backend dengan API yang cepat dan aman.

### Teknologi

- **Backend**: Node.js, Fastify.js
- **Database**: PostgreSQL (untuk data aplikasi utama), InfluxDB (untuk data historis dan waktu nyata)
- **Frontend**: React.js, Ant Design

### Instalasi

1. **Clone repositori ini**:
   ```bash
   git clone https://github.com/eonebyte/mes.git
   cd mes
   cd client
   client/ npm install
   cd web_service
   web_service/ npm install
