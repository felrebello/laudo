// Utilidades para mapeamento de tipos de exames para categorias
import type { ExamCategory } from '../types';
import { EXAM_TYPES_2D, EXAM_TYPES_3D_PARTIAL, EXAM_TYPES_3D_TOTAL } from '../types';

// Exames 2D Total: Diagnóstico boca toda, Panorâmica, Ilustrado, Análise Idade Óssea
const EXAM_TYPES_2D_TOTAL = [
  'Diagnóstico de Panorâmica',
  'Laudo Ilustrado',
  'Análise Idade Óssea',
  'Diagnóstico de Boca Toda',
  'Cefalometria Lateral',
  'Diagnóstico (Outro)',
] as const;

// Exames 2D Parcial: Periapical, Interproximal (Bite Wing)
const EXAM_TYPES_2D_PARTIAL = [
  'Diagnóstico de Periapical',
  'Diagnóstico de Interproximal (Bite Wing)',
] as const;

/**
 * Mapeia um tipo de exame para sua categoria correspondente
 * @param examType - Nome do tipo de exame
 * @param customMappings - Mapeamentos personalizados do banco de dados
 * @returns Categoria do exame ou 'Sem Categoria' se não encontrado
 */
export function mapExamTypeToCategory(
  examType: string,
  customMappings?: Map<string, ExamCategory>
): ExamCategory | 'Sem Categoria' {
  const normalizedType = examType.trim();

  // Primeiro, verificar se existe mapeamento personalizado
  if (customMappings && customMappings.has(normalizedType)) {
    return customMappings.get(normalizedType)!;
  }

  // Verificar se é 2D Total
  if (EXAM_TYPES_2D_TOTAL.some(type => type === normalizedType)) {
    return '2D Total';
  }

  // Verificar se é 2D Parcial
  if (EXAM_TYPES_2D_PARTIAL.some(type => type === normalizedType)) {
    return '2D Parcial';
  }

  // Verificar se é 3D Parcial
  if (EXAM_TYPES_3D_PARTIAL.some(type => type === normalizedType)) {
    return '3D Parcial';
  }

  // Verificar se é 3D Total
  if (EXAM_TYPES_3D_TOTAL.some(type => type === normalizedType)) {
    return '3D Total';
  }

  // Não encontrou categoria
  return 'Sem Categoria';
}

/**
 * Busca o preço de um exame baseado na categoria e unidade
 * @param category - Categoria do exame
 * @param unitPrices - Objeto com os preços da unidade
 * @returns Preço do exame ou 0 se não houver preço definido
 */
export function getPriceForCategory(
  category: ExamCategory | 'Sem Categoria',
  unitPrices: {
    price_2d_total: number;
    price_2d_partial: number;
    price_3d_total: number;
    price_3d_partial: number;
  }
): number {
  switch (category) {
    case '2D Total':
      return unitPrices.price_2d_total || 0;
    case '2D Parcial':
      return unitPrices.price_2d_partial || 0;
    case '3D Parcial':
      return unitPrices.price_3d_partial || 0;
    case '3D Total':
      return unitPrices.price_3d_total || 0;
    case 'Não Cobrar':
      return 0;
    default:
      return 0;
  }
}

/**
 * Retorna todos os tipos de exames disponíveis agrupados por categoria
 */
export function getAllExamTypes(): Record<string, readonly string[]> {
  return {
    '2D Total': EXAM_TYPES_2D_TOTAL,
    '2D Parcial': EXAM_TYPES_2D_PARTIAL,
    '3D Parcial': EXAM_TYPES_3D_PARTIAL,
    '3D Total': EXAM_TYPES_3D_TOTAL,
  };
}
