// Tipos para collections do Firestore
import type { ExamCategory } from '../types';

// Interface para clínicas (equivalente a units)
export interface Clinic {
  id?: string;
  name: string;
  price_2d_total: number;
  price_2d_partial: number;
  price_3d_total: number;
  price_3d_partial: number;
  created_at?: Date;
  updated_at?: Date;
}

// Interface para preços específicos de especialistas em clínicas
export interface ClinicSpecialistPrice {
  id?: string;
  clinic_name: string;
  specialist_name: string;
  price_2d_total: number;
  price_2d_partial: number;
  price_3d_total: number;
  price_3d_partial: number;
  created_at?: Date;
  updated_at?: Date;
}

// Interface para mapeamentos personalizados de tipos de exames
export interface ExamTypeMapping {
  id?: string;
  original_name: string;
  mapped_category: ExamCategory;
  created_at?: Date;
  updated_at?: Date;
}
