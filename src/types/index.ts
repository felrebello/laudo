// Tipos principais do sistema de cálculo de laudos

// Categorias de exames definidas no sistema
export type ExamCategory = '2D Total' | '2D Parcial' | '3D Parcial' | '3D Total' | 'Não Cobrar';

// Tipos de exames 2D
export const EXAM_TYPES_2D = [
  'Diagnóstico de Panorâmica',
  'Diagnóstico de Periapical',
  'Diagnóstico de Interproximal (Bite Wing)',
  'Cefalometria Lateral',
  'Laudo Ilustrado',
  'Análise Idade Óssea',
  'Diagnóstico de Boca Toda',
  'Diagnóstico (Outro)',
] as const;

// Tipos de exames 3D Parcial
export const EXAM_TYPES_3D_PARTIAL = [
  'Tomografia de até 2 dentes',
  'Tomografia de até 4 dentes',
  'Tomografia de até 6 dentes',
] as const;

// Tipos de exames 3D Total
export const EXAM_TYPES_3D_TOTAL = [
  'Tomografia da Maxila',
  'Tomografia da Mandíbula',
  'Tomografia (Outro)',
] as const;

// União de todos os tipos de exames
export type ExamType =
  | typeof EXAM_TYPES_2D[number]
  | typeof EXAM_TYPES_3D_PARTIAL[number]
  | typeof EXAM_TYPES_3D_TOTAL[number];

// Interface para linha de exame processada
export interface ExamRecord {
  patient: string;
  examType: string;
  clinic: string;
  category: ExamCategory | 'Sem Categoria';
  value: number;
  specialist: string;
  quantity: number;
  hasPrice: boolean;
  notChargeable?: boolean;
}

// Interface para totais por especialista
export interface SpecialistTotal {
  specialist: string;
  total: number;
  count: number;
}

// Interface para totais por clínica
export interface ClinicTotal {
  clinic: string;
  total: number;
  specialists: SpecialistTotal[];
}

// Alias para manter compatibilidade com código antigo
export type RadiologistTotal = SpecialistTotal;
export type UnitTotal = ClinicTotal;

// Interface para upload de arquivo CSV/XLSX
export interface UploadedRow {
  Paciente: string;
  'Tipo de análise': string;
  Clínica: string;
  Especialista?: string;
  Quantidade?: number;
}
