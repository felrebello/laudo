// Painel de configurações: competência, dados bancários, PIX e logo
import { useState, useEffect } from 'react';
import { Save, Upload } from 'lucide-react';
import { supabase } from '../lib/supabase';
import type { AppConfig } from '../lib/database.types';

const CONFIG_ID = '00000000-0000-0000-0000-000000000001';

export function ConfigPanel() {
  const [config, setConfig] = useState<AppConfig | null>(null);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    competency: '',
    bank_data: '',
    pix_key: '',
    logo_url: '',
    observations: '',
  });

  // Carregar configuração ao montar componente
  useEffect(() => {
    loadConfig();
  }, []);

  async function loadConfig() {
    setLoading(true);
    const { data, error } = await supabase
      .from('app_config')
      .select('*')
      .eq('id', CONFIG_ID)
      .maybeSingle();

    if (error) {
      console.error('Erro ao carregar configuração:', error);
    } else if (data) {
      setConfig(data);
      setFormData({
        competency: data.competency,
        bank_data: data.bank_data,
        pix_key: data.pix_key,
        logo_url: data.logo_url,
        observations: data.observations,
      });
    }
    setLoading(false);
  }

  async function handleSave() {
    setLoading(true);
    const { error } = await supabase
      .from('app_config')
      .update(formData)
      .eq('id', CONFIG_ID);

    if (error) {
      console.error('Erro ao salvar configuração:', error);
      alert('Erro ao salvar configuração');
    } else {
      alert('Configuração salva com sucesso!');
      loadConfig();
    }
    setLoading(false);
  }

  // Upload de logo (converte para base64)
  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validar tipo de arquivo
    if (!file.type.startsWith('image/')) {
      alert('Por favor, selecione um arquivo de imagem válido');
      return;
    }

    // Validar tamanho (máx 2MB)
    if (file.size > 2 * 1024 * 1024) {
      alert('Imagem muito grande. Máximo 2MB');
      return;
    }

    // Converter para base64
    const reader = new FileReader();
    reader.onload = (event) => {
      const base64 = event.target?.result as string;
      setFormData({ ...formData, logo_url: base64 });
    };
    reader.readAsDataURL(file);
  }

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <h2 className="text-xl font-bold text-gray-800 mb-4">Configurações</h2>

      <div className="space-y-4">
        {/* Competência/Período */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Competência / Período
          </label>
          <input
            type="text"
            value={formData.competency}
            onChange={(e) => setFormData({ ...formData, competency: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Janeiro/2025"
          />
          <p className="text-xs text-gray-500 mt-1">
            Será exibido no cabeçalho dos PDFs
          </p>
        </div>

        {/* Dados Bancários */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Dados Bancários
          </label>
          <textarea
            value={formData.bank_data}
            onChange={(e) => setFormData({ ...formData, bank_data: e.target.value })}
            rows={3}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Banco do Brasil&#10;Agência: 1234-5&#10;Conta: 12345-6"
          />
          <p className="text-xs text-gray-500 mt-1">
            Será exibido na fatura
          </p>
        </div>

        {/* Chave PIX */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Chave PIX
          </label>
          <input
            type="text"
            value={formData.pix_key}
            onChange={(e) => setFormData({ ...formData, pix_key: e.target.value })}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: email@exemplo.com ou CPF/CNPJ"
          />
          <p className="text-xs text-gray-500 mt-1">
            Será exibido na fatura
          </p>
        </div>

        {/* Observações */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Observações (Fatura)
          </label>
          <textarea
            value={formData.observations}
            onChange={(e) => setFormData({ ...formData, observations: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            placeholder="Ex: Pagamento em até 5 dias úteis"
          />
          <p className="text-xs text-gray-500 mt-1">
            Observações adicionais para a fatura
          </p>
        </div>

        {/* Upload de Logo */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Logo (Opcional)
          </label>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 cursor-pointer transition-colors border border-gray-300">
              <Upload size={18} />
              Escolher Imagem
              <input
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                className="hidden"
              />
            </label>
            {formData.logo_url && (
              <button
                onClick={() => setFormData({ ...formData, logo_url: '' })}
                className="text-sm text-red-600 hover:text-red-700"
              >
                Remover
              </button>
            )}
          </div>
          {formData.logo_url && (
            <div className="mt-3">
              <p className="text-xs text-gray-500 mb-2">Preview:</p>
              <img
                src={formData.logo_url}
                alt="Logo preview"
                className="max-h-20 rounded border border-gray-200"
              />
            </div>
          )}
          <p className="text-xs text-gray-500 mt-1">
            Máximo 2MB. Será exibido no cabeçalho dos PDFs.
          </p>
        </div>

        {/* Botão Salvar */}
        <button
          onClick={handleSave}
          disabled={loading}
          className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors font-semibold"
        >
          <Save size={20} />
          {loading ? 'Salvando...' : 'Salvar Configurações'}
        </button>
      </div>
    </div>
  );
}
