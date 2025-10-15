// Painel unificado de gerenciamento de clínicas, preços e especialistas
import { useState, useEffect } from 'react';
import { Building2, Plus, Trash2, Save, X, ChevronDown, ChevronRight, UserPlus, Copy } from 'lucide-react';
import {
  getAllClinics,
  createClinic,
  updateClinic,
  deleteClinic,
  getAllSpecialistPrices,
  createSpecialistPrice,
  updateSpecialistPrice,
  deleteSpecialistPrice,
} from '../services/firestoreService';
import type { Clinic, ClinicSpecialistPrice } from '../lib/firestore.types';

type Unit = Clinic;

export function ClinicsPanel() {
  const [units, setUnits] = useState<Unit[]>([]);
  const [specialistPrices, setSpecialistPrices] = useState<ClinicSpecialistPrice[]>([]);
  const [expandedClinics, setExpandedClinics] = useState<Set<string>>(new Set());
  const [isAddingClinic, setIsAddingClinic] = useState(false);
  const [editingClinicId, setEditingClinicId] = useState<string | null>(null);
  const [addingSpecialistFor, setAddingSpecialistFor] = useState<string | null>(null);
  const [duplicatingSpecialist, setDuplicatingSpecialist] = useState<ClinicSpecialistPrice | null>(null);
  const [loading, setLoading] = useState(false);

  // Form state para clínica
  const [clinicFormData, setClinicFormData] = useState({
    name: '',
    price_2d_total: 0,
    price_2d_partial: 0,
    price_3d_total: 0,
    price_3d_partial: 0,
  });

  // Form state para especialista
  const [specialistFormData, setSpecialistFormData] = useState({
    specialist_name: '',
    price_2d_total: 0,
    price_2d_partial: 0,
    price_3d_total: 0,
    price_3d_partial: 0,
  });

  useEffect(() => {
    loadData();
  }, []);

  async function loadData() {
    setLoading(true);
    try {
      const [unitsData, pricesData] = await Promise.all([
        getAllClinics(),
        getAllSpecialistPrices(),
      ]);

      setUnits(unitsData);
      setSpecialistPrices(pricesData);
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      alert('Erro ao carregar dados');
    }
    setLoading(false);
  }

  function toggleClinic(clinicId: string) {
    const newExpanded = new Set(expandedClinics);
    if (newExpanded.has(clinicId)) {
      newExpanded.delete(clinicId);
    } else {
      newExpanded.add(clinicId);
    }
    setExpandedClinics(newExpanded);
  }

  function resetClinicForm() {
    setClinicFormData({
      name: '',
      price_2d_total: 0,
      price_2d_partial: 0,
      price_3d_total: 0,
      price_3d_partial: 0,
    });
    setIsAddingClinic(false);
    setEditingClinicId(null);
  }

  function resetSpecialistForm() {
    setSpecialistFormData({
      specialist_name: '',
      price_2d_total: 0,
      price_2d_partial: 0,
      price_3d_total: 0,
      price_3d_partial: 0,
    });
    setAddingSpecialistFor(null);
  }

  async function handleAddClinic() {
    if (!clinicFormData.name.trim()) {
      alert('Nome da clínica é obrigatório');
      return;
    }

    setLoading(true);
    try {
      const newClinicId = await createClinic(clinicFormData);
      resetClinicForm();
      await loadData();
      // Expandir a clínica recém-criada automaticamente
      setExpandedClinics(new Set([newClinicId]));
    } catch (error) {
      console.error('Erro ao adicionar clínica:', error);
      alert('Erro ao adicionar clínica');
    }
    setLoading(false);
  }

  async function handleUpdateClinic(id: string) {
    if (!clinicFormData.name.trim()) {
      alert('Nome da clínica é obrigatório');
      return;
    }

    setLoading(true);
    try {
      await updateClinic(id, clinicFormData);
      resetClinicForm();
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar clínica:', error);
      alert('Erro ao atualizar clínica');
    }
    setLoading(false);
  }

  async function handleDeleteClinic(id: string, name: string) {
    if (!confirm(`Tem certeza que deseja excluir a clínica "${name}"? Isso também removerá todos os preços específicos de especialistas desta clínica.`)) {
      return;
    }

    setLoading(true);
    try {
      // Deletar preços de especialistas primeiro
      const prices = specialistPrices.filter(p => p.clinic_name === name);
      await Promise.all(prices.map(p => p.id && deleteSpecialistPrice(p.id)));

      // Depois deletar a clínica
      await deleteClinic(id);
      loadData();
    } catch (error) {
      console.error('Erro ao excluir clínica:', error);
      alert('Erro ao excluir clínica');
    }
    setLoading(false);
  }

  function startEditClinic(unit: Unit) {
    setEditingClinicId(unit.id!);
    setClinicFormData({
      name: unit.name,
      price_2d_total: unit.price_2d_total,
      price_2d_partial: unit.price_2d_partial,
      price_3d_total: unit.price_3d_total,
      price_3d_partial: unit.price_3d_partial,
    });
    setIsAddingClinic(false);
  }

  async function handleAddSpecialist(clinicName: string) {
    if (!specialistFormData.specialist_name.trim()) {
      alert('Nome do especialista é obrigatório');
      return;
    }

    setLoading(true);
    try {
      await createSpecialistPrice({
        clinic_name: clinicName,
        ...specialistFormData,
      });
      resetSpecialistForm();
      loadData();
    } catch (error: any) {
      console.error('Erro ao adicionar especialista:', error);
      if (error.code === 'already-exists') {
        alert('Já existe um preço configurado para este especialista nesta clínica');
      } else {
        alert('Erro ao adicionar especialista');
      }
    }
    setLoading(false);
  }

  async function handleDeleteSpecialist(id: string, specialistName: string) {
    if (!confirm(`Deseja realmente remover o especialista "${specialistName}"?`)) {
      return;
    }

    setLoading(true);
    try {
      await deleteSpecialistPrice(id);
      loadData();
    } catch (error) {
      console.error('Erro ao excluir especialista:', error);
      alert('Erro ao excluir especialista');
    }
    setLoading(false);
  }

  async function handleUpdateSpecialistPrice(id: string, field: string, value: number) {
    setLoading(true);
    try {
      await updateSpecialistPrice(id, { [field]: value });
      loadData();
    } catch (error) {
      console.error('Erro ao atualizar preço:', error);
      alert('Erro ao atualizar preço');
    }
    setLoading(false);
  }

  async function handleDuplicateClinic(unit: Unit) {
    const newName = prompt('Nome para a nova clínica:', `${unit.name} (cópia)`);
    if (!newName || !newName.trim()) return;

    setLoading(true);

    try {
      const newClinic = {
        name: newName.trim(),
        price_2d_total: unit.price_2d_total,
        price_2d_partial: unit.price_2d_partial,
        price_3d_total: unit.price_3d_total,
        price_3d_partial: unit.price_3d_partial,
      };

      const newClinicId = await createClinic(newClinic);

      const specialists = getSpecialistsForClinic(unit.name);

      if (specialists.length > 0) {
        const shouldCopySpecialists = confirm(
          `Deseja copiar também os ${specialists.length} especialista(s) desta clínica?`
        );

        if (shouldCopySpecialists) {
          const newSpecialists = specialists.map(sp => ({
            clinic_name: newName.trim(),
            specialist_name: sp.specialist_name,
            price_2d_total: sp.price_2d_total,
            price_2d_partial: sp.price_2d_partial,
            price_3d_total: sp.price_3d_total,
            price_3d_partial: sp.price_3d_partial,
          }));

          try {
            await Promise.all(
              newSpecialists.map(sp => createSpecialistPrice(sp))
            );
          } catch (specialistError: any) {
            console.error('Erro ao copiar especialistas:', specialistError);
            alert(`Aviso: Clínica criada, mas houve erro ao copiar especialistas: ${specialistError.message}`);
          }
        }
      }

      await loadData();
      setExpandedClinics(new Set([newClinicId]));
    } catch (err) {
      console.error('Erro inesperado ao duplicar clínica:', err);
      alert('Erro inesperado ao duplicar clínica. Verifique o console.');
    } finally {
      setLoading(false);
    }
  }

  async function handleDuplicateSpecialistToClinic(specialist: ClinicSpecialistPrice, targetClinicName: string) {
    setLoading(true);

    try {
      const newSpecialist = {
        clinic_name: targetClinicName,
        specialist_name: specialist.specialist_name,
        price_2d_total: specialist.price_2d_total,
        price_2d_partial: specialist.price_2d_partial,
        price_3d_total: specialist.price_3d_total,
        price_3d_partial: specialist.price_3d_partial,
      };

      await createSpecialistPrice(newSpecialist);
      setDuplicatingSpecialist(null);
      await loadData();
    } catch (err) {
      console.error('Erro inesperado ao duplicar especialista:', err);
      alert('Erro inesperado ao duplicar especialista. Verifique o console.');
    } finally {
      setLoading(false);
    }
  }

  function getSpecialistsForClinic(clinicName: string): ClinicSpecialistPrice[] {
    return specialistPrices.filter(sp => sp.clinic_name === clinicName);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <Building2 size={20} className="text-blue-600" />
          <h2 className="text-xl font-bold text-gray-800">Clínicas e Preços</h2>
        </div>
        <button
          onClick={() => setIsAddingClinic(true)}
          disabled={isAddingClinic || editingClinicId !== null || loading}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
        >
          <Plus size={20} />
          Nova Clínica
        </button>
      </div>

      <p className="text-sm text-gray-600 mb-4">
        Configure os preços padrão para cada clínica e, opcionalmente, defina preços específicos por especialista.
      </p>

      {/* Formulário de adição de clínica */}
      {isAddingClinic && (
        <div className="mb-4 p-4 bg-blue-50 rounded-lg border-2 border-blue-200">
          <h3 className="font-semibold mb-3 text-gray-700">Nova Clínica</h3>
          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nome da Clínica *
              </label>
              <input
                type="text"
                value={clinicFormData.name}
                onChange={(e) => setClinicFormData({ ...clinicFormData, name: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Ex: Clínica Centro"
              />
            </div>
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço 2D Total (R$)
                  <span className="text-xs text-gray-500 block">Panorâmica, Boca Toda, etc.</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={clinicFormData.price_2d_total}
                  onChange={(e) => setClinicFormData({ ...clinicFormData, price_2d_total: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço 2D Parcial (R$)
                  <span className="text-xs text-gray-500 block">Periapical, Bite Wing</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={clinicFormData.price_2d_partial}
                  onChange={(e) => setClinicFormData({ ...clinicFormData, price_2d_partial: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço 3D Total (R$)
                  <span className="text-xs text-gray-500 block">Maxila, Mandíbula</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={clinicFormData.price_3d_total}
                  onChange={(e) => setClinicFormData({ ...clinicFormData, price_3d_total: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Preço 3D Parcial (R$)
                  <span className="text-xs text-gray-500 block">Até 2, 4 ou 6 dentes</span>
                </label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={clinicFormData.price_3d_partial}
                  onChange={(e) => setClinicFormData({ ...clinicFormData, price_3d_partial: parseFloat(e.target.value) || 0 })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
            </div>
          </div>
          <div className="flex gap-2 mt-4">
            <button
              onClick={handleAddClinic}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
            >
              <Save size={18} />
              Salvar
            </button>
            <button
              onClick={resetClinicForm}
              disabled={loading}
              className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              <X size={18} />
              Cancelar
            </button>
          </div>
        </div>
      )}

      {/* Lista de clínicas */}
      <div className="space-y-3">
        {loading && units.length === 0 ? (
          <div className="text-center py-8 text-gray-500">Carregando...</div>
        ) : units.length === 0 ? (
          <div className="text-center py-8 text-gray-500">
            Nenhuma clínica cadastrada. Clique em "Nova Clínica" para começar.
          </div>
        ) : (
          units.map((unit) => {
            const isExpanded = expandedClinics.has(unit.id);
            const specialists = getSpecialistsForClinic(unit.name);
            const isEditing = editingClinicId === unit.id;

            return (
              <div key={unit.id} className="border border-gray-200 rounded-lg">
                {/* Cabeçalho da clínica */}
                <div className="p-4 bg-gray-50">
                  {isEditing ? (
                    <div>
                      <h3 className="font-semibold mb-3 text-gray-700">Editando: {unit.name}</h3>
                      <div className="space-y-3">
                        <div>
                          <label className="block text-sm font-medium text-gray-700 mb-1">
                            Nome da Clínica *
                          </label>
                          <input
                            type="text"
                            value={clinicFormData.name}
                            onChange={(e) => setClinicFormData({ ...clinicFormData, name: e.target.value })}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          />
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Preço 2D Total (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={clinicFormData.price_2d_total}
                              onChange={(e) => setClinicFormData({ ...clinicFormData, price_2d_total: parseFloat(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Preço 2D Parcial (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={clinicFormData.price_2d_partial}
                              onChange={(e) => setClinicFormData({ ...clinicFormData, price_2d_partial: parseFloat(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Preço 3D Total (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={clinicFormData.price_3d_total}
                              onChange={(e) => setClinicFormData({ ...clinicFormData, price_3d_total: parseFloat(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                          <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                              Preço 3D Parcial (R$)
                            </label>
                            <input
                              type="number"
                              step="0.01"
                              min="0"
                              value={clinicFormData.price_3d_partial}
                              onChange={(e) => setClinicFormData({ ...clinicFormData, price_3d_partial: parseFloat(e.target.value) || 0 })}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                          </div>
                        </div>
                      </div>
                      <div className="flex gap-2 mt-4">
                        <button
                          onClick={() => handleUpdateClinic(unit.id)}
                          disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                        >
                          <Save size={18} />
                          Salvar
                        </button>
                        <button
                          onClick={resetClinicForm}
                          disabled={loading}
                          className="flex items-center gap-2 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
                        >
                          <X size={18} />
                          Cancelar
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div>
                      <div className="flex items-center justify-between">
                        <button
                          onClick={() => toggleClinic(unit.id)}
                          className="flex items-center gap-2 flex-1 text-left"
                        >
                          {isExpanded ? <ChevronDown size={20} /> : <ChevronRight size={20} />}
                          <h3 className="font-semibold text-lg text-gray-800">{unit.name}</h3>
                          {specialists.length > 0 && (
                            <span className="text-sm text-gray-500">
                              ({specialists.length} {specialists.length === 1 ? 'especialista' : 'especialistas'})
                            </span>
                          )}
                        </button>
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleDuplicateClinic(unit)}
                            disabled={loading || isAddingClinic || editingClinicId !== null}
                            className="flex items-center gap-1 px-3 py-1 text-sm text-green-600 hover:bg-green-100 rounded transition-colors disabled:opacity-50"
                            title="Duplicar clínica"
                          >
                            <Copy size={14} />
                            Duplicar
                          </button>
                          <button
                            onClick={() => startEditClinic(unit)}
                            disabled={loading || isAddingClinic || editingClinicId !== null}
                            className="px-3 py-1 text-sm text-blue-600 hover:bg-blue-100 rounded transition-colors disabled:opacity-50"
                          >
                            Editar
                          </button>
                          <button
                            onClick={() => handleDeleteClinic(unit.id, unit.name)}
                            disabled={loading || isAddingClinic || editingClinicId !== null}
                            className="px-3 py-1 text-sm text-red-600 hover:bg-red-100 rounded transition-colors disabled:opacity-50"
                          >
                            Excluir
                          </button>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-3 mt-3 text-sm">
                        <div>
                          <span className="text-gray-600">2D Total:</span>
                          <span className="ml-2 font-semibold text-gray-800">
                            {unit.price_2d_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">2D Parcial:</span>
                          <span className="ml-2 font-semibold text-gray-800">
                            {unit.price_2d_partial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">3D Total:</span>
                          <span className="ml-2 font-semibold text-gray-800">
                            {unit.price_3d_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-600">3D Parcial:</span>
                          <span className="ml-2 font-semibold text-gray-800">
                            {unit.price_3d_partial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Especialistas da clínica (visível quando expandido) */}
                {isExpanded && !isEditing && (
                  <div className="p-4 border-t border-gray-200 bg-white">
                    <div className="flex items-center justify-between mb-3">
                      <h4 className="font-semibold text-gray-700">Preços por Especialista</h4>
                      <button
                        onClick={() => setAddingSpecialistFor(unit.name)}
                        disabled={loading || addingSpecialistFor !== null}
                        className="flex items-center gap-1 px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400 transition-colors"
                      >
                        <UserPlus size={16} />
                        Adicionar Especialista
                      </button>
                    </div>

                    {addingSpecialistFor === unit.name && (
                      <div className="mb-3 p-3 bg-green-50 rounded border border-green-200">
                        <h5 className="font-medium text-sm text-gray-700 mb-2">Novo Especialista</h5>
                        <div className="space-y-2">
                          <input
                            type="text"
                            placeholder="Nome do especialista"
                            value={specialistFormData.specialist_name}
                            onChange={(e) => setSpecialistFormData({ ...specialistFormData, specialist_name: e.target.value })}
                            className="w-full px-3 py-2 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                          />
                          <div className="grid grid-cols-4 gap-2">
                            <input
                              type="number"
                              step="0.01"
                              placeholder="2D Total"
                              value={specialistFormData.price_2d_total}
                              onChange={(e) => setSpecialistFormData({ ...specialistFormData, price_2d_total: parseFloat(e.target.value) || 0 })}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                            />
                            <input
                              type="number"
                              step="0.01"
                              placeholder="2D Parcial"
                              value={specialistFormData.price_2d_partial}
                              onChange={(e) => setSpecialistFormData({ ...specialistFormData, price_2d_partial: parseFloat(e.target.value) || 0 })}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                            />
                            <input
                              type="number"
                              step="0.01"
                              placeholder="3D Total"
                              value={specialistFormData.price_3d_total}
                              onChange={(e) => setSpecialistFormData({ ...specialistFormData, price_3d_total: parseFloat(e.target.value) || 0 })}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                            />
                            <input
                              type="number"
                              step="0.01"
                              placeholder="3D Parcial"
                              value={specialistFormData.price_3d_partial}
                              onChange={(e) => setSpecialistFormData({ ...specialistFormData, price_3d_partial: parseFloat(e.target.value) || 0 })}
                              className="px-2 py-1 text-sm border border-gray-300 rounded focus:ring-2 focus:ring-green-500"
                            />
                          </div>
                        </div>
                        <div className="flex gap-2 mt-2">
                          <button
                            onClick={() => handleAddSpecialist(unit.name)}
                            disabled={loading}
                            className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:bg-gray-400"
                          >
                            Salvar
                          </button>
                          <button
                            onClick={resetSpecialistForm}
                            disabled={loading}
                            className="px-3 py-1 text-sm bg-gray-500 text-white rounded hover:bg-gray-600"
                          >
                            Cancelar
                          </button>
                        </div>
                      </div>
                    )}

                    {specialists.length === 0 ? (
                      <p className="text-sm text-gray-500 text-center py-4">
                        Nenhum especialista com preço específico. Os preços padrão da clínica serão usados.
                      </p>
                    ) : (
                      <div className="space-y-2">
                        {specialists.map((specialist) => (
                          <div key={specialist.id} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                            <div className="flex-1 font-medium text-sm text-gray-700">
                              {specialist.specialist_name}
                            </div>
                            <div className="flex gap-2">
                              <div className="text-xs">
                                <label className="text-gray-600 block">2DT</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={specialist.price_2d_total}
                                  onChange={(e) => handleUpdateSpecialistPrice(specialist.id, 'price_2d_total', parseFloat(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
                                  disabled={loading}
                                />
                              </div>
                              <div className="text-xs">
                                <label className="text-gray-600 block">2DP</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={specialist.price_2d_partial}
                                  onChange={(e) => handleUpdateSpecialistPrice(specialist.id, 'price_2d_partial', parseFloat(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
                                  disabled={loading}
                                />
                              </div>
                              <div className="text-xs">
                                <label className="text-gray-600 block">3DT</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={specialist.price_3d_total}
                                  onChange={(e) => handleUpdateSpecialistPrice(specialist.id, 'price_3d_total', parseFloat(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
                                  disabled={loading}
                                />
                              </div>
                              <div className="text-xs">
                                <label className="text-gray-600 block">3DP</label>
                                <input
                                  type="number"
                                  step="0.01"
                                  value={specialist.price_3d_partial}
                                  onChange={(e) => handleUpdateSpecialistPrice(specialist.id, 'price_3d_partial', parseFloat(e.target.value) || 0)}
                                  className="w-20 px-2 py-1 border border-gray-300 rounded text-xs"
                                  disabled={loading}
                                />
                              </div>
                              <button
                                onClick={() => setDuplicatingSpecialist(specialist)}
                                disabled={loading}
                                className="p-1 text-green-600 hover:bg-green-100 rounded transition-colors"
                                title="Duplicar para outra clínica"
                              >
                                <Copy size={16} />
                              </button>
                              <button
                                onClick={() => handleDeleteSpecialist(specialist.id, specialist.specialist_name)}
                                disabled={loading}
                                className="p-1 text-red-600 hover:bg-red-100 rounded transition-colors"
                                title="Remover especialista"
                              >
                                <Trash2 size={16} />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                )}
              </div>
            );
          })
        )}
      </div>

      {/* Modal de duplicação de especialista */}
      {duplicatingSpecialist && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold text-gray-800">Duplicar Especialista</h3>
              <button
                onClick={() => setDuplicatingSpecialist(null)}
                className="p-1 hover:bg-gray-100 rounded transition-colors"
              >
                <X size={20} />
              </button>
            </div>

            <p className="text-sm text-gray-600 mb-4">
              Duplicar <span className="font-semibold">{duplicatingSpecialist.specialist_name}</span> de{' '}
              <span className="font-semibold">{duplicatingSpecialist.clinic_name}</span> para:
            </p>

            <div className="space-y-2 max-h-96 overflow-y-auto">
              {units
                .filter(unit => unit.name !== duplicatingSpecialist.clinic_name)
                .map(unit => (
                  <button
                    key={unit.id}
                    onClick={() => handleDuplicateSpecialistToClinic(duplicatingSpecialist, unit.name)}
                    disabled={loading}
                    className="w-full text-left px-4 py-3 border border-gray-200 rounded-lg hover:bg-blue-50 hover:border-blue-300 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    <div className="font-medium text-gray-800">{unit.name}</div>
                    <div className="text-xs text-gray-500 mt-1">
                      2DT: {unit.price_2d_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} •
                      2DP: {unit.price_2d_partial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} •
                      3DT: {unit.price_3d_total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })} •
                      3DP: {unit.price_3d_partial.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' })}
                    </div>
                  </button>
                ))}
            </div>

            {units.filter(unit => unit.name !== duplicatingSpecialist.clinic_name).length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Não há outras clínicas disponíveis para duplicar este especialista.
              </p>
            )}

            <button
              onClick={() => setDuplicatingSpecialist(null)}
              disabled={loading}
              className="w-full mt-4 px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancelar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
