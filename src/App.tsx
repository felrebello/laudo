// Aplicação principal de cálculo de laudos
import { useState, useEffect } from 'react';
import { FileSpreadsheet } from 'lucide-react';
import { ClinicsPanel } from './components/ClinicsPanel';
import { ConfigPanel } from './components/ConfigPanel';
import { FileUpload } from './components/FileUpload';
import { FilterPanel } from './components/FilterPanel';
import { ResultsTable } from './components/ResultsTable';
import { UnknownExamTypesModal } from './components/UnknownExamTypesModal';
import {
  getAllClinics,
  getAllSpecialistPrices,
  getAllExamMappings,
  createMultipleExamMappings,
} from './services/firestoreService';
import type { Clinic, ClinicSpecialistPrice, ExamTypeMapping } from './lib/firestore.types';
import type { UploadedRow, ExamRecord, UnitTotal, SpecialistTotal, ExamCategory } from './types';
import { mapExamTypeToCategory, getPriceForCategory } from './utils/examMapping';
import { generateReportPDF, generateInvoicePDF } from './utils/pdfGenerator';

// Type alias para compatibilidade
type Unit = Clinic;
type AppConfig = { id: string; [key: string]: any };

function App() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [specialistPrices, setSpecialistPrices] = useState<ClinicSpecialistPrice[]>([]);
  const [examTypeMappings, setExamTypeMappings] = useState<ExamTypeMapping[]>([]);
  const [uploadedData, setUploadedData] = useState<UploadedRow[]>([]);
  const [processedRecords, setProcessedRecords] = useState<ExamRecord[]>([]);
  const [unitTotals, setUnitTotals] = useState<UnitTotal[]>([]);
  const [grandTotal, setGrandTotal] = useState(0);

  // Estados para tipos de exames desconhecidos
  const [unknownExamTypes, setUnknownExamTypes] = useState<Array<{ name: string; count: number }>>([]);
  const [showUnknownTypesModal, setShowUnknownTypesModal] = useState(false);
  const [pendingUploadData, setPendingUploadData] = useState<UploadedRow[]>([]);

  // Estados dos filtros
  const [selectedClinics, setSelectedClinics] = useState<string[]>([]);
  const [selectedSpecialists, setSelectedSpecialists] = useState<string[]>([]);
  const [selectedExamTypes, setSelectedExamTypes] = useState<string[]>([]);
  const [selectedCategories, setSelectedCategories] = useState<(ExamCategory | 'Sem Categoria')[]>([]);

  // Registros e totais filtrados
  const [filteredRecords, setFilteredRecords] = useState<ExamRecord[]>([]);
  const [filteredUnitTotals, setFilteredUnitTotals] = useState<UnitTotal[]>([]);
  const [filteredGrandTotal, setFilteredGrandTotal] = useState(0);
  
  // ===================== INÍCIO DA CORREÇÃO =====================
  // Estado para controlar o modo offline
  const [isOfflineMode, setIsOfflineMode] = useState(!navigator.onLine);

  // Efeito para ouvir mudanças no status da conexão
  useEffect(() => {
    const handleOnline = () => setIsOfflineMode(false);
    const handleOffline = () => setIsOfflineMode(true);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    // Limpeza ao desmontar o componente
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);
  // ====================== FIM DA CORREÇÃO =======================

  // Carregar unidades, configuração, preços de especialistas e mapeamentos ao montar
  useEffect(() => {
    loadUnits();
    loadConfig();
    loadSpecialistPrices();
    loadExamTypeMappings();
  }, []);

  // Processar dados quando houver upload ou mudança nas unidades/preços/mapeamentos
  useEffect(() => {
    if (uploadedData.length > 0) {
      processData();
    }
  }, [uploadedData, units, specialistPrices, examTypeMappings]);

  // Aplicar filtros quando mudarem os dados processados ou os filtros
  useEffect(() => {
    applyFilters();
  }, [processedRecords, selectedClinics, selectedSpecialists, selectedExamTypes, selectedCategories]);

  async function loadUnits() {
    try {
      const data = await getAllClinics();
      setUnits(data);
    } catch (error) {
      console.error('Erro ao carregar clínicas:', error);
    }
  }

  async function loadConfig() {
    // Config não é mais necessário com Firebase, mas mantemos для compatibilidade
    setConfig({ id: 'firebase-config' });
  }

  async function loadSpecialistPrices() {
    try {
      const data = await getAllSpecialistPrices();
      setSpecialistPrices(data);
    } catch (error) {
      console.error('Erro ao carregar preços de especialistas:', error);
    }
  }

  async function loadExamTypeMappings() {
    try {
      const data = await getAllExamMappings();
      setExamTypeMappings(data);
    } catch (error) {
      console.error('Erro ao carregar mapeamentos de exames:', error);
    }
  }

  async function saveExamTypeMappings(mappings: Record<string, ExamCategory>) {
    try {
      const mappingsArray = Object.entries(mappings).map(([original_name, mapped_category]) => ({
        original_name,
        mapped_category,
      }));

      await createMultipleExamMappings(mappingsArray);

      await loadExamTypeMappings();
      setShowUnknownTypesModal(false);

      // Processar os dados pendentes agora que temos os mapeamentos
      if (pendingUploadData.length > 0) {
        setUploadedData(pendingUploadData);
        setPendingUploadData([]);
      }
    } catch (error) {
      console.error('Erro ao salvar mapeamentos:', error);
      alert('Erro ao salvar mapeamentos');
    }
  }

  function handleDataLoaded(data: UploadedRow[]) {
    // Verificar se há tipos de exames desconhecidos
    const customMappingsMap = new Map<string, ExamCategory>();
    examTypeMappings.forEach(mapping => {
      customMappingsMap.set(mapping.original_name, mapping.mapped_category);
    });

    const unknownTypes = new Map<string, number>();
    data.forEach(row => {
      const examType = row['Tipo de análise'].trim();
      const category = mapExamTypeToCategory(examType, customMappingsMap);

      if (category === 'Sem Categoria') {
        unknownTypes.set(examType, (unknownTypes.get(examType) || 0) + 1);
      }
    });

    if (unknownTypes.size > 0) {
      // Há tipos desconhecidos - mostrar modal
      const unknownTypesArray = Array.from(unknownTypes.entries()).map(([name, count]) => ({
        name,
        count,
      }));
      setUnknownExamTypes(unknownTypesArray);
      setPendingUploadData(data);
      setShowUnknownTypesModal(true);
    } else {
      // Tudo reconhecido - processar normalmente
      setUploadedData(data);
    }
  }

  function processData() {
    // Criar mapa de unidades para lookup rápido
    const unitsMap = new Map<string, Unit>();
    units.forEach(unit => {
      unitsMap.set(unit.name.toLowerCase().trim(), unit);
    });

    // Criar mapa de preços específicos para lookup rápido
    const specialistPricesMap = new Map<string, ClinicSpecialistPrice>();
    specialistPrices.forEach(price => {
      const key = `${price.clinic_name.toLowerCase().trim()}|${price.specialist_name.toLowerCase().trim()}`;
      specialistPricesMap.set(key, price);
    });

    // Criar mapa de mapeamentos personalizados
    const customMappingsMap = new Map<string, ExamCategory>();
    examTypeMappings.forEach(mapping => {
      customMappingsMap.set(mapping.original_name, mapping.mapped_category);
    });

    // Processar cada linha do upload
    const records: ExamRecord[] = uploadedData.map(row => {
      const clinicName = row.Clínica.toLowerCase().trim();
      const specialistName = (row.Especialista || 'Não especificado').toLowerCase().trim();
      const unit = unitsMap.get(clinicName);

      // Mapear tipo de exame para categoria (usando mapeamentos personalizados)
      const category = mapExamTypeToCategory(row['Tipo de análise'], customMappingsMap);

      // Verificar se é exame não cobrável
      const notChargeable = category === 'Não Cobrar';

      // Buscar preço: primeiro verifica se existe preço específico para clínica + especialista
      let basePrice = 0;
      let hasPrice = false;

      if (category !== 'Sem Categoria' && !notChargeable) {
        // Tentar buscar preço específico primeiro
        const specialistPriceKey = `${clinicName}|${specialistName}`;
        const specialistPrice = specialistPricesMap.get(specialistPriceKey);

        if (specialistPrice) {
          // Usar preço específico do especialista na clínica
          basePrice = getPriceForCategory(category, {
            price_2d_total: specialistPrice.price_2d_total,
            price_2d_partial: specialistPrice.price_2d_partial,
            price_3d_total: specialistPrice.price_3d_total,
            price_3d_partial: specialistPrice.price_3d_partial,
          });
          hasPrice = basePrice > 0;
        } else if (unit) {
          // Usar preço geral da clínica como fallback
          basePrice = getPriceForCategory(category, {
            price_2d_total: unit.price_2d_total,
            price_2d_partial: unit.price_2d_partial,
            price_3d_total: unit.price_3d_total,
            price_3d_partial: unit.price_3d_partial,
          });
          hasPrice = basePrice > 0;
        }
      }

      // Calcular valor total multiplicando pelo quantidade (0 se não cobrável)
      const quantity = row.Quantidade || 1;
      const value = notChargeable ? 0 : basePrice * quantity;

      return {
        patient: row.Paciente,
        examType: row['Tipo de análise'],
        clinic: row.Clínica,
        category,
        value,
        specialist: row.Especialista || 'Não especificado',
        quantity,
        hasPrice: notChargeable ? true : hasPrice,
        notChargeable,
      };
    });

    setProcessedRecords(records);

    // Calcular totais iniciais
    const { totals, grandTotalValue } = calculateTotals(records);
    setUnitTotals(totals);
    setGrandTotal(grandTotalValue);
  }

  function applyFilters() {
    let filtered = processedRecords;

    // Filtrar por clínicas
    if (selectedClinics.length > 0) {
      filtered = filtered.filter(record => selectedClinics.includes(record.clinic));
    }

    // Filtrar por especialistas
    if (selectedSpecialists.length > 0) {
      filtered = filtered.filter(record => selectedSpecialists.includes(record.specialist));
    }

    // Filtrar por tipos de análise
    if (selectedExamTypes.length > 0) {
      filtered = filtered.filter(record => selectedExamTypes.includes(record.examType));
    }

    // Filtrar por categorias
    if (selectedCategories.length > 0) {
      filtered = filtered.filter(record => selectedCategories.includes(record.category));
    }

    setFilteredRecords(filtered);

    // Recalcular totais com dados filtrados
    const { totals, grandTotalValue } = calculateTotals(filtered);
    setFilteredUnitTotals(totals);
    setFilteredGrandTotal(grandTotalValue);
  }

  function calculateTotals(records: ExamRecord[]): { totals: UnitTotal[]; grandTotalValue: number } {
    // Agrupar por clínica -> especialista
    const clinicMap = new Map<string, Map<string, { total: number; count: number }>>();

    records.forEach(record => {
      if (!clinicMap.has(record.clinic)) {
        clinicMap.set(record.clinic, new Map());
      }

      const specialistMap = clinicMap.get(record.clinic)!;
      if (!specialistMap.has(record.specialist)) {
        specialistMap.set(record.specialist, { total: 0, count: 0 });
      }

      const specialistData = specialistMap.get(record.specialist)!;
      specialistData.total += record.value;
      specialistData.count += record.quantity;
    });

    // Converter para estrutura de UnitTotal
    const totals: UnitTotal[] = [];
    let grandTotalValue = 0;

    clinicMap.forEach((specialistMap, clinicName) => {
      const specialists: SpecialistTotal[] = [];
      let clinicTotal = 0;

      specialistMap.forEach((data, specialistName) => {
        specialists.push({
          specialist: specialistName,
          total: data.total,
          count: data.count,
        });
        clinicTotal += data.total;
      });

      // Ordenar especialistas por nome
      specialists.sort((a, b) => a.specialist.localeCompare(b.specialist));

      totals.push({
        clinic: clinicName,
        total: clinicTotal,
        specialists: specialists,
      });

      grandTotalValue += clinicTotal;
    });

    // Ordenar clínicas por nome
    totals.sort((a, b) => a.clinic.localeCompare(b.clinic));

    return { totals, grandTotalValue };
  }

  function handleGenerateReport() {
    const recordsToUse = filteredRecords.length > 0 ? filteredRecords : processedRecords;
    const totalsToUse = filteredRecords.length > 0 ? filteredUnitTotals : unitTotals;
    const grandTotalToUse = filteredRecords.length > 0 ? filteredGrandTotal : grandTotal;

    if (recordsToUse.length === 0) {
      alert('Nenhum dado para gerar relatório');
      return;
    }

    generateReportPDF(recordsToUse, totalsToUse, grandTotalToUse, config);
  }

  function handleGenerateInvoice() {
    const totalsToUse = filteredRecords.length > 0 ? filteredUnitTotals : unitTotals;
    const grandTotalToUse = filteredRecords.length > 0 ? filteredGrandTotal : grandTotal;

    if (totalsToUse.length === 0) {
      alert('Nenhum dado para gerar fatura');
      return;
    }

    generateInvoicePDF(totalsToUse, grandTotalToUse, config);
  }

  function handleClearFilters() {
    setSelectedClinics([]);
    setSelectedSpecialists([]);
    setSelectedExamTypes([]);
    setSelectedCategories([]);
  }

  // Extrair valores únicos para os filtros
  const availableClinics = Array.from(new Set(processedRecords.map(r => r.clinic))).sort();
  const availableSpecialists = Array.from(new Set(processedRecords.map(r => r.specialist))).sort();
  const availableExamTypes = Array.from(new Set(processedRecords.map(r => r.examType))).sort();
  const availableCategories = Array.from(new Set(processedRecords.map(r => r.category))).sort() as (ExamCategory | 'Sem Categoria')[];

  // Determinar quais dados mostrar
  const hasActiveFilters =
    selectedClinics.length > 0 ||
    selectedSpecialists.length > 0 ||
    selectedExamTypes.length > 0 ||
    selectedCategories.length > 0;

  const displayRecords = hasActiveFilters ? filteredRecords : processedRecords;
  const displayUnitTotals = hasActiveFilters ? filteredUnitTotals : unitTotals;
  const displayGrandTotal = hasActiveFilters ? filteredGrandTotal : grandTotal;
  
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-gray-100">
      {/* Offline Mode Banner */}
      {isOfflineMode && (
        <div className="bg-yellow-50 border-b border-yellow-200">
          <div className="max-w-[1800px] mx-auto px-6 py-2">
            <p className="text-sm text-yellow-800 text-center">
              <strong>Modo Offline:</strong> Dados armazenados no navegador (localStorage). Configure Supabase para persistência em nuvem.
            </p>
          </div>
        </div>
      )}

      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-[1800px] mx-auto px-6 py-4">
          <div className="flex items-center gap-3">
            <FileSpreadsheet size={32} className="text-blue-600" />
            <div>
              <h1 className="text-2xl font-bold text-gray-800">
                Sistema de Cálculo de Laudos
              </h1>
              <p className="text-sm text-gray-600">
                Gerencie unidades, calcule pagamentos e gere relatórios
              </p>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-[1800px] mx-auto px-6 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Coluna Esquerda: Configurações */}
          <div className="space-y-6">
            <ClinicsPanel />
            <ConfigPanel />
          </div>

          {/* Coluna Direita: Upload e Resultados */}
          <div className="space-y-6">
            <FileUpload onDataLoaded={handleDataLoaded} />

            {processedRecords.length > 0 && (
              <>
                <FilterPanel
                  availableClinics={availableClinics}
                  availableSpecialists={availableSpecialists}
                  availableExamTypes={availableExamTypes}
                  availableCategories={availableCategories}
                  selectedClinics={selectedClinics}
                  selectedSpecialists={selectedSpecialists}
                  selectedExamTypes={selectedExamTypes}
                  selectedCategories={selectedCategories}
                  onClinicsChange={setSelectedClinics}
                  onSpecialistsChange={setSelectedSpecialists}
                  onExamTypesChange={setSelectedExamTypes}
                  onCategoriesChange={setSelectedCategories}
                  onClearFilters={handleClearFilters}
                />

                <ResultsTable
                  records={displayRecords}
                  unitTotals={displayUnitTotals}
                  grandTotal={displayGrandTotal}
                  onGenerateReport={handleGenerateReport}
                  onGenerateInvoice={handleGenerateInvoice}
                />
              </>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-gray-200 mt-12">
        <div className="max-w-[1800px] mx-auto px-6 py-4 text-center text-sm text-gray-600">
          Sistema de Cálculo de Laudos - {new Date().getFullYear()}
        </div>
      </footer>

      {/* Modal de Tipos Desconhecidos */}
      {showUnknownTypesModal && (
        <UnknownExamTypesModal
          unknownTypes={unknownExamTypes}
          onMap={saveExamTypeMappings}
          onClose={() => setShowUnknownTypesModal(false)}
        />
      )}
    </div>
  );
}

export default App;