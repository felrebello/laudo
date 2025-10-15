// Componente de upload e processamento de arquivos CSV/XLSX
import { useState } from 'react';
import { Upload, FileSpreadsheet } from 'lucide-react';
import { parseFile } from '../utils/fileParser';
import type { UploadedRow } from '../types';

interface FileUploadProps {
  onDataLoaded: (data: UploadedRow[]) => void;
}

export function FileUpload({ onDataLoaded }: FileUploadProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [fileName, setFileName] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(file: File) {
    setLoading(true);
    setError(null);

    try {
      const data = await parseFile(file);
      setFileName(file.name);
      onDataLoaded(data);
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Erro ao processar arquivo';
      setError(errorMessage);
      setFileName(null);
    } finally {
      setLoading(false);
    }
  }

  function handleFileInput(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleDrop(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(false);

    const file = e.dataTransfer.files[0];
    if (file) {
      handleFile(file);
    }
  }

  function handleDragOver(e: React.DragEvent<HTMLDivElement>) {
    e.preventDefault();
    setIsDragging(true);
  }

  function handleDragLeave() {
    setIsDragging(false);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Upload de Arquivo</h2>

      <div
        onDrop={handleDrop}
        onDragOver={handleDragOver}
        onDragLeave={handleDragLeave}
        className={`
          border-2 border-dashed rounded-lg p-8 text-center transition-colors
          ${isDragging ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-gray-50'}
          ${loading ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:border-blue-400 hover:bg-blue-50'}
        `}
      >
        <label className="cursor-pointer block">
          <input
            type="file"
            accept=".csv,.xlsx,.xls"
            onChange={handleFileInput}
            disabled={loading}
            className="hidden"
          />

          <div className="flex flex-col items-center gap-3">
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                <p className="text-gray-600">Processando arquivo...</p>
              </>
            ) : (
              <>
                <Upload size={48} className="text-gray-400" />
                <div>
                  <p className="text-lg font-semibold text-gray-700">
                    Arraste um arquivo ou clique para selecionar
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    Formatos aceitos: CSV, XLSX
                  </p>
                </div>
              </>
            )}
          </div>
        </label>
      </div>

      {/* Arquivo carregado */}
      {fileName && !error && (
        <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-lg flex items-center gap-2">
          <FileSpreadsheet size={20} className="text-green-600" />
          <span className="text-sm text-green-800 font-medium">
            Arquivo carregado: {fileName}
          </span>
        </div>
      )}

      {/* Erro */}
      {error && (
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-sm text-red-800 font-medium">Erro: {error}</p>
        </div>
      )}

      {/* Instruções */}
      <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <h3 className="font-semibold text-blue-900 mb-2">Formato do arquivo:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• <strong>Colunas obrigatórias:</strong> paciente, tipo_exame, unidade</li>
          <li>• <strong>Coluna opcional:</strong> radiologista</li>
          <li>• O arquivo deve conter cabeçalho na primeira linha</li>
          <li>• Se radiologista não for informado, será marcado como "Não especificado"</li>
        </ul>
      </div>
    </div>
  );
}
