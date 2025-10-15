// Utilitários para parsing de arquivos CSV e XLSX
import * as XLSX from 'xlsx';
import type { UploadedRow } from '../types';

/**
 * Faz o parse de um arquivo CSV ou XLSX e retorna as linhas processadas
 * @param file - Arquivo carregado pelo usuário
 * @returns Promise com array de linhas parseadas
 */
export async function parseFile(file: File): Promise<UploadedRow[]> {
  const extension = file.name.split('.').pop()?.toLowerCase();

  if (extension === 'csv') {
    return parseCSV(file);
  } else if (extension === 'xlsx' || extension === 'xls') {
    return parseXLSX(file);
  } else {
    throw new Error('Formato de arquivo não suportado. Use CSV ou XLSX.');
  }
}

/**
 * Parse de arquivo CSV
 */
async function parseCSV(file: File): Promise<UploadedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const text = e.target?.result as string;
        const lines = text.split('\n').filter(line => line.trim());

        if (lines.length < 2) {
          reject(new Error('Arquivo CSV vazio ou inválido'));
          return;
        }

        // Primeira linha como cabeçalho
        const headers = lines[0].split(',').map(h => h.trim());

        // Normalizar headers para busca case-insensitive
        const normalizedHeaders = headers.map(h => h.toLowerCase());

        // Validar colunas obrigatórias (case-insensitive)
        const requiredColumns = ['paciente', 'tipo de análise', 'clínica', 'especialista', 'quantidade'];
        const missingColumns = requiredColumns.filter(col =>
          !normalizedHeaders.includes(col) &&
          !normalizedHeaders.includes(col.replace(/[áàâã]/g, 'a').replace(/[íì]/g, 'i'))
        );

        if (missingColumns.length > 0) {
          reject(new Error(`Colunas obrigatórias faltando: ${missingColumns.join(', ')}`));
          return;
        }

        // Função helper para buscar valor independente de case e acentos
        const getValue = (row: any, possibleNames: string[]) => {
          for (const name of possibleNames) {
            const key = headers.find(h =>
              h.toLowerCase() === name.toLowerCase() ||
              h.toLowerCase().replace(/[áàâã]/g, 'a').replace(/[íì]/g, 'i') === name.toLowerCase().replace(/[áàâã]/g, 'a').replace(/[íì]/g, 'i')
            );
            if (key && row[key]) return row[key];
          }
          return '';
        };

        // Processar linhas de dados
        const rows: UploadedRow[] = [];
        for (let i = 1; i < lines.length; i++) {
          const values = lines[i].split(',').map(v => v.trim());
          const row: any = {};

          headers.forEach((header, index) => {
            row[header] = values[index] || '';
          });

          const quantidade = getValue(row, ['Quantidade', 'quantidade', 'qtd', 'qty']);

          rows.push({
            Paciente: getValue(row, ['Paciente', 'paciente', 'Patient', 'nome']),
            'Tipo de análise': getValue(row, ['Tipo de análise', 'tipo de analise', 'Tipo de anÃ¡lise', 'tipo_exame', 'tipo exame']),
            Clínica: getValue(row, ['Clínica', 'clinica', 'ClÃ­nica', 'unidade', 'unit']),
            Especialista: getValue(row, ['Especialista', 'especialista', 'radiologista', 'medico']) || 'Não especificado',
            Quantidade: quantidade ? parseInt(quantidade) : 1,
          });
        }

        resolve(rows);
      } catch (error) {
        reject(new Error('Erro ao processar arquivo CSV'));
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsText(file);
  });
}

/**
 * Parse de arquivo XLSX
 */
async function parseXLSX(file: File): Promise<UploadedRow[]> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });

        // Pegar a primeira planilha
        const firstSheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[firstSheetName];

        // Converter para JSON
        const jsonData = XLSX.utils.sheet_to_json(worksheet, { defval: '' });

        if (jsonData.length === 0) {
          reject(new Error('Planilha vazia'));
          return;
        }

        // Normalizar nomes das colunas
        const rows: UploadedRow[] = jsonData.map((row: any) => {
          // Buscar colunas com nomes variados (case-insensitive e sem acentos)
          const keys = Object.keys(row);
          const getProp = (names: string[]) => {
            const key = keys.find(k => {
              const normalized = k.toLowerCase().trim().replace(/[áàâã]/g, 'a').replace(/[íì]/g, 'i');
              return names.some(name => {
                const normalizedName = name.toLowerCase().replace(/[áàâã]/g, 'a').replace(/[íì]/g, 'i');
                return normalized === normalizedName;
              });
            });
            return key ? row[key] : '';
          };

          const quantidade = getProp(['quantidade', 'qtd', 'qty', 'quantity']);

          return {
            Paciente: getProp(['paciente', 'patient', 'nome', 'name']),
            'Tipo de análise': getProp(['tipo de análise', 'tipo de analise', 'tipo_exame', 'tipo exame', 'exam_type', 'exame']),
            Clínica: getProp(['clínica', 'clinica', 'unidade', 'unit']),
            Especialista: getProp(['especialista', 'radiologista', 'radiologist', 'medico', 'doctor']) || 'Não especificado',
            Quantidade: quantidade ? parseInt(String(quantidade)) : 1,
          };
        });

        // Validar se tem dados nas colunas obrigatórias
        const hasValidData = rows.some(row => row.Paciente && row['Tipo de análise'] && row.Clínica);
        if (!hasValidData) {
          reject(new Error('Arquivo não contém as colunas obrigatórias: Paciente, Tipo de análise, Clínica, Especialista, Quantidade'));
          return;
        }

        resolve(rows);
      } catch (error) {
        reject(new Error('Erro ao processar arquivo XLSX'));
      }
    };

    reader.onerror = () => reject(new Error('Erro ao ler arquivo'));
    reader.readAsBinaryString(file);
  });
}

/**
 * Exporta dados processados para CSV
 */
export function exportToCSV(data: any[], filename: string): void {
  if (data.length === 0) return;

  // Criar cabeçalhos
  const headers = Object.keys(data[0]);
  const csvContent = [
    headers.join(','),
    ...data.map(row => headers.map(header => {
      const value = row[header];
      // Escapar vírgulas e aspas
      if (typeof value === 'string' && (value.includes(',') || value.includes('"'))) {
        return `"${value.replace(/"/g, '""')}"`;
      }
      return value;
    }).join(','))
  ].join('\n');

  // Criar blob e fazer download
  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement('a');
  const url = URL.createObjectURL(blob);

  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
