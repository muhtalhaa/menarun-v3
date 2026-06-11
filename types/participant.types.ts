export interface Participant {
  id: string;
  token: string;
  nama: string;
  noAims: string;
  majlis: string;
  email: string;
  usia: number;
  noHp: string;
  createdAt: string;
}

export interface RegistrationInput {
  nama: string;
  noAims: string;
  majlis: string;
  email: string;
  usia: number;
  noHp: string;
}

export interface TokenRecoveryInput {
  noAims: string;
  email: string;
}
