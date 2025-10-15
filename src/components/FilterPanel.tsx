// Componente de filtros para resultados de análises
import { Filter, X } from 'lucide-react';
import type { ExamCategory } from '../types';

interface FilterPanelProps {
  // Opções disponíveis para filtros
  availableClinics: string[];
  availableSpecialists: string[];
  availableExamTypes: string[];
  availableCategories: (ExamCategory | 'Sem Categoria')[];

  // Estado dos filtros
  selectedClinics: string[];
  selectedSpecialists: string[];
  selectedExamTypes: string[];
  selectedCategories: (ExamCategory | 'Sem Categoria')[];

  // Callbacks para atualizar filtros
  onClinicsChange: (clinics: string[]) => void;
  onSpecialistsChange: (specialists: string[]) => void;
  onExamTypesChange: (examTypes: string[]) => void;
  onCategoriesChange: (categories: (ExamCategory | 'Sem Categoria')[]) => void;
  onClearFilters: () => void;
}

export function FilterPanel({
  availableClinics,
  availableSpecialists,
  availableExamTypes,
  availableCategories,
  selectedClinics,
  selectedSpecialists,
  selectedExamTypes,
  selectedCategories,
  onClinicsChange,
  onSpecialistsChange,
  onExamTypesChange,
  onCategoriesChange,
  onClearFilters,
}: FilterPanelProps) {
  const hasActiveFilters =
    selectedClinics.length > 0 ||
    selectedSpecialists.length > 0 ||
    selectedExamTypes.length > 0 ||
    selectedCategories.length > 0;

  function toggleClinic(clinic: string) {
    if (selectedClinics.includes(clinic)) {
      onClinicsChange(selectedClinics.filter(c => c !== clinic));
    } else {
      onClinicsChange([...selectedClinics, clinic]);
    }
  }

  function toggleSpecialist(specialist: string) {
    if (selectedSpecialists.includes(specialist)) {
      onSpecialistsChange(selectedSpecialists.filter(s => s !== specialist));
    } else {
      onSpecialistsChange([...selectedSpecialists, specialist]);
    }
  }

  function toggleExamType(examType: string) {
    if (selectedExamTypes.includes(examType)) {
      onExamTypesChange(selectedExamTypes.filter(e => e !== examType));
    } else {
      onExamTypesChange([...selectedExamTypes, examType]);
    }
  }

  function toggleCategory(category: ExamCategory | 'Sem Categoria') {
    if (selectedCategories.includes(category)) {
      onCategoriesChange(selectedCategories.filter(c => c !== category));
    } else {
      onCategoriesChange([...selectedCategories, category]);
    }
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Filter size={20} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Filtros</h2>
        </div>
        {hasActiveFilters && (
          <button
            onClick={onClearFilters}
            className="flex items-center gap-1 px-3 py-1 text-sm text-red-600 hover:text-red-700 hover:bg-red-50 rounded transition-colors"
          >
            <X size={16} />
            Limpar Filtros
          </button>
        )}
      </div>

      <div className="space-y-4">
        {/* Filtro por Clínica */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Clínicas</h3>
          <div className="flex flex-wrap gap-2">
            {availableClinics.map(clinic => (
              <button
                key={clinic}
                onClick={() => toggleClinic(clinic)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedClinics.includes(clinic)
                    ? 'bg-blue-600 text-white hover:bg-blue-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {clinic}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por Especialista */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Especialistas</h3>
          <div className="flex flex-wrap gap-2">
            {availableSpecialists.map(specialist => (
              <button
                key={specialist}
                onClick={() => toggleSpecialist(specialist)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedSpecialists.includes(specialist)
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {specialist}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por Categoria */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Categorias</h3>
          <div className="flex flex-wrap gap-2">
            {availableCategories.map(category => (
              <button
                key={category}
                onClick={() => toggleCategory(category)}
                className={`px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                  selectedCategories.includes(category)
                    ? category === '2D'
                      ? 'bg-blue-600 text-white hover:bg-blue-700'
                      : category === '3D Parcial'
                      ? 'bg-green-600 text-white hover:bg-green-700'
                      : category === '3D Total'
                      ? 'bg-purple-600 text-white hover:bg-purple-700'
                      : 'bg-gray-600 text-white hover:bg-gray-700'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Filtro por Tipo de Análise */}
        <div>
          <h3 className="font-semibold text-gray-700 mb-2">Tipos de Análise</h3>
          <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-2">
            <div className="space-y-1">
              {availableExamTypes.map(examType => (
                <label
                  key={examType}
                  className="flex items-center gap-2 px-2 py-1 hover:bg-gray-50 rounded cursor-pointer"
                >
                  <input
                    type="checkbox"
                    checked={selectedExamTypes.includes(examType)}
                    onChange={() => toggleExamType(examType)}
                    className="w-4 h-4 text-blue-600 rounded focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="text-sm text-gray-700">{examType}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Indicador de registros filtrados */}
      {hasActiveFilters && (
        <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
          <p className="text-sm text-blue-800">
            <strong>Filtros ativos:</strong>{' '}
            {[
              selectedClinics.length > 0 && `${selectedClinics.length} clínica(s)`,
              selectedSpecialists.length > 0 && `${selectedSpecialists.length} especialista(s)`,
              selectedCategories.length > 0 && `${selectedCategories.length} categoria(s)`,
              selectedExamTypes.length > 0 && `${selectedExamTypes.length} tipo(s) de análise`,
            ]
              .filter(Boolean)
              .join(', ')}
          </p>
        </div>
      )}
    </div>
  );
}
