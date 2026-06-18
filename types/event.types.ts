export interface Event {
  id: string;
  nama: string;
  deskripsi: string;
  tanggalMulai: string;
  tanggalSelesai: string;
  jamMulaiSubmit: string;
  jamBatasSubmit: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface EventSummary {
  id: string;
  nama: string;
  deskripsi: string;
  tanggalMulai: Date;
  tanggalSelesai: Date;
  isActive: boolean;
}

export interface EventFilterOption {
  id: string;
  nama: string;
  isActive: boolean;
  isCurrent: boolean;
}
