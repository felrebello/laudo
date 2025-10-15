// Tabela de resultados com cálculos e totais
import { Download, FileText, Receipt, AlertCircle } from 'lucide-react';
import type { ExamRecord, UnitTotal } from '../types';
import { exportToCSV } from '../utils/fileParser';

interface ResultsTableProps {
  records: ExamRecord[];
  unitTotals: UnitTotal[];
  grandTotal: number;
  onGenerateReport: () => void;
  onGenerateInvoice: () => void;
}

export function ResultsTable({
  records,
  unitTotals,
  grandTotal,
  onGenerateReport,
  onGenerateInvoice,
}: ResultsTableProps) {
  function handleExportCSV() {
    const exportData = records.map(record => ({
      Paciente: record.patient,
      'Tipo de Análise': record.examType,
      Clínica: record.clinic,
      Categoria: record.category,
      'Valor (R$)': record.value.toFixed(2),
      Especialista: record.specialist,
      Quantidade: record.quantity,
      Status: record.hasPrice ? 'Com preço' : 'Sem preço',
    }));

    exportToCSV(exportData, `laudos_calculados_${new Date().toISOString().split('T')[0]}.csv`);
  }

  if (records.length === 0) {
    return null;
  }

  // Identificar clínicas sem preço
  const clinicsWithoutPrice = [...new Set(
    records
      .filter(r => !r.hasPrice)
      .map(r => r.clinic)
  )];

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      {clinicsWithoutPrice.length > 0 && (
        <div className="mb-4 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <div className="flex items-start gap-2">
            <AlertCircle size={20} className="text-yellow-600 mt-0.5 flex-shrink-0" />
            <div className="flex-1">
              <h3 className="font-semibold text-yellow-800 mb-1">
                Atenção: Clínicas sem preço configurado
              </h3>
              <p className="text-sm text-yellow-700 mb-2">
                As seguintes clínicas não têm preços configurados. Configure os preços no painel "Unidades" usando EXATAMENTE os mesmos nomes:
              </p>
              <ul className="list-disc list-inside text-sm text-yellow-700 space-y-1">
                {clinicsWithoutPrice.map(clinic => (
                  <li key={clinic}>
                    <span className="font-medium">{clinic}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>
      )}

      <div className="flex items-center justify-between mb-4">
        <h2 className="text-xl font-bold text-gray-800">Resultados</h2>
        <div className="flex gap-2">
          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
          >
            <Download size={18} />
            Exportar CSV
          </button>
          <button
            onClick={onGenerateReport}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
          >
            <FileText size={18} />
            Relatório PDF
          </button>
          <button
            onClick={onGenerateInvoice}
            className="flex items-center gap-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm"
          >
            <Receipt size={18} />
            Fatura PDF
          </button>
        </div>
      </div>

      {/* Tabela de exames */}
      <div className="overflow-x-auto mb-6">
        <table className="w-full text-sm">
          <thead>
            <tr className="bg-gray-100 border-b-2 border-gray-300">
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Paciente</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Tipo de Análise</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Clínica</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Categoria</th>
              <th className="px-4 py-3 text-right font-semibold text-gray-700">Valor</th>
              <th className="px-4 py-3 text-left font-semibold text-gray-700">Especialista</th>
            </tr>
          </thead>
          <tbody>
            {records.map((record, index) => (
              <tr
                key={index}
                className={`border-b border-gray-200 hover:bg-gray-50 ${
                  record.notChargeable ? 'bg-gray-100' : !record.hasPrice ? 'bg-yellow-50' : ''
                }`}
              >
                <td className="px-4 py-2 text-gray-800">{record.patient}</td>
                <td className="px-4 py-2 text-gray-800">{record.examType}</td>
                <td className="px-4 py-2 text-gray-700">{record.clinic}</td>
                <td className="px-4 py-2">
                  <span
                    className={`px-2 py-1 rounded text-xs font-semibold ${
                      record.category === 'Não Cobrar'
                        ? 'bg-gray-200 text-gray-700'
                        : record.category === '2D Total' || record.category === '2D Parcial'
                        ? 'bg-blue-100 text-blue-800'
                        : record.category === '3D Parcial'
                        ? 'bg-green-100 text-green-800'
                        : record.category === '3D Total'
                        ? 'bg-purple-100 text-purple-800'
                        : 'bg-gray-100 text-gray-800'
                    }`}
                  >
                    {record.category}
                  </span>
                </td>
                <td className="px-4 py-2 text-right font-semibold">
                  {record.notChargeable ? (
                    <span className="text-gray-500 italic">Não cobrar</span>
                  ) : record.hasPrice ? (
                    <span className="text-gray-800">
                      {record.value.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </span>
                  ) : (
                    <span className="text-red-600">Sem preço</span>
                  )}
                </td>
                <td className="px-4 py-2 text-gray-700">{record.specialist}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Totais por clínica e especialista */}
      <div className="space-y-4">
        <h3 className="text-lg font-bold text-gray-800">Totais por Clínica e Especialista</h3>

        {unitTotals.map((unitTotal, unitIndex) => (
          <div key={unitIndex} className="border border-gray-200 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-semibold text-gray-800 text-base">{unitTotal.clinic}</h4>
              <span className="text-lg font-bold text-gray-900">
                {unitTotal.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
              </span>
            </div>

            {/* Totais por especialista dentro da clínica */}
            <div className="ml-4 space-y-2">
              {unitTotal.specialists.map((specTotal, specIndex) => (
                <div
                  key={specIndex}
                  className="flex items-center justify-between text-sm bg-white px-3 py-2 rounded border border-gray-200"
                >
                  <span className="text-gray-700">
                    {specTotal.specialist} ({specTotal.count} análise{specTotal.count !== 1 ? 's' : ''})
                  </span>
                  <span className="font-semibold text-gray-800">
                    {specTotal.total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                  </span>
                </div>
              ))}
            </div>
          </div>
        ))}

        {/* Total Geral */}
        <div className="border-2 border-blue-500 rounded-lg p-4 bg-blue-50">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold text-blue-900">Total Geral</h3>
            <span className="text-2xl font-bold text-blue-900">
              {grandTotal.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
