// Modal para mapear tipos de exames não reconhecidos
import { AlertCircle, X, Save } from 'lucide-react';
import { useState } from 'react';
import type { ExamCategory } from '../types';

// Interface para um tipo de exame desconhecido
interface UnknownExamType {
  name: string;
  count: number;
}

interface UnknownExamTypesModalProps {
  unknownTypes: UnknownExamType[];
  onMap: (mappings: Record<string, ExamCategory>) => void;
  onClose: () => void;
}

export function UnknownExamTypesModal({ unknownTypes, onMap, onClose }: UnknownExamTypesModalProps) {
  // Estado para armazenar os mapeamentos selecionados
  const [mappings, setMappings] = useState<Record<string, ExamCategory>>(
    unknownTypes.reduce((acc, type) => {
      acc[type.name] = '2D Total';
      return acc;
    }, {} as Record<string, ExamCategory>)
  );

  // Opções de categorias disponíveis
  const categories: ExamCategory[] = ['2D Total', '2D Parcial', '3D Total', '3D Parcial', 'Não Cobrar'];

  // Descrições das categorias
  const categoryDescriptions: Record<ExamCategory, string> = {
    '2D Total': 'Panorâmica, Boca Toda, Ilustrado, Idade Óssea, Cefalometria',
    '2D Parcial': 'Periapical, Bite Wing',
    '3D Total': 'Tomografia Maxila, Mandíbula',
    '3D Parcial': 'Tomografia até 2, 4 ou 6 dentes',
    'Não Cobrar': 'Este tipo de exame não será incluído nos cálculos de valores',
  };

  function handleSave() {
    onMap(mappings);
  }

  function handleCategoryChange(examName: string, category: ExamCategory) {
    setMappings(prev => ({
      ...prev,
      [examName]: category,
    }));
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-3xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} className="text-orange-600" />
            <div>
              <h2 className="text-xl font-bold text-gray-800">
                Tipos de Exames Não Reconhecidos
              </h2>
              <p className="text-sm text-gray-600">
                Classifique os tipos de exames encontrados no arquivo
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
            title="Fechar"
          >
            <X size={20} />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="space-y-4">
            {unknownTypes.map((type) => (
              <div key={type.name} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <h3 className="font-semibold text-gray-800">{type.name}</h3>
                    <p className="text-sm text-gray-600">
                      Encontrado {type.count} {type.count === 1 ? 'vez' : 'vezes'} no arquivo
                    </p>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Selecione a categoria:
                  </label>
                  <div className="space-y-2">
                    {categories.map((category) => (
                      <label
                        key={category}
                        className="flex items-start gap-3 p-3 border-2 rounded-lg cursor-pointer hover:bg-white transition-colors"
                        style={{
                          borderColor: mappings[type.name] === category ? '#3B82F6' : '#E5E7EB',
                          backgroundColor: mappings[type.name] === category ? '#EFF6FF' : 'transparent',
                        }}
                      >
                        <input
                          type="radio"
                          name={`mapping-${type.name}`}
                          value={category}
                          checked={mappings[type.name] === category}
                          onChange={() => handleCategoryChange(type.name, category)}
                          className="mt-1"
                        />
                        <div className="flex-1">
                          <span className="font-medium text-gray-800">{category}</span>
                          <p className="text-xs text-gray-600 mt-0.5">
                            {categoryDescriptions[category]}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-200 bg-gray-50">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
          >
            Cancelar
          </button>
          <button
            onClick={handleSave}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Save size={18} />
            Salvar Mapeamentos
          </button>
        </div>
      </div>
    </div>
  );
}
