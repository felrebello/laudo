/*
  # Sistema de Cálculo de Laudos - Schema Inicial

  ## Descrição
  Este migration cria a estrutura completa para o sistema de cálculo de pagamentos de laudos médicos.

  ## Novas Tabelas

  ### `units` (Unidades)
  - `id` (uuid, primary key) - Identificador único da unidade
  - `name` (text) - Nome da unidade
  - `price_2d` (numeric) - Preço para exames 2D
  - `price_3d_total` (numeric) - Preço para exames 3D Total
  - `price_3d_partial` (numeric) - Preço para exames 3D Parcial
  - `created_at` (timestamptz) - Data de criação
  - `updated_at` (timestamptz) - Data de atualização

  ### `app_config` (Configurações do Sistema)
  - `id` (uuid, primary key) - Identificador único
  - `competency` (text) - Competência/período (ex: "Janeiro/2025")
  - `bank_data` (text) - Dados bancários formatados
  - `pix_key` (text) - Chave PIX
  - `logo_url` (text) - URL do logo (base64 ou URL externa)
  - `observations` (text) - Observações adicionais para fatura
  - `created_at` (timestamptz) - Data de criação
  - `updated_at` (timestamptz) - Data de atualização

  ## Segurança
  - Row Level Security (RLS) habilitado em todas as tabelas
  - Políticas permitem acesso público para leitura e escrita (aplicação single-user)

  ## Notas Importantes
  1. Sistema single-user, sem autenticação necessária
  2. Dados persistidos no Supabase substituindo localStorage
  3. Preços armazenados como NUMERIC para precisão decimal
*/

-- Criar tabela de unidades
CREATE TABLE IF NOT EXISTS units (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL UNIQUE,
  price_2d numeric(10,2) DEFAULT 0,
  price_3d_total numeric(10,2) DEFAULT 0,
  price_3d_partial numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Criar tabela de configurações
CREATE TABLE IF NOT EXISTS app_config (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  competency text DEFAULT '',
  bank_data text DEFAULT '',
  pix_key text DEFAULT '',
  logo_url text DEFAULT '',
  observations text DEFAULT '',
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Inserir configuração padrão (apenas uma linha)
INSERT INTO app_config (id, competency, bank_data, pix_key, observations)
VALUES ('00000000-0000-0000-0000-000000000001', '', '', '', '')
ON CONFLICT (id) DO NOTHING;

-- Habilitar RLS
ALTER TABLE units ENABLE ROW LEVEL SECURITY;
ALTER TABLE app_config ENABLE ROW LEVEL SECURITY;

-- Políticas para units (acesso público para single-user app)
CREATE POLICY "Allow public read access to units"
  ON units FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to units"
  ON units FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to units"
  ON units FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to units"
  ON units FOR DELETE
  TO anon
  USING (true);

-- Políticas para app_config (acesso público para single-user app)
CREATE POLICY "Allow public read access to config"
  ON app_config FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public update access to config"
  ON app_config FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_units_updated_at
  BEFORE UPDATE ON units
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_config_updated_at
  BEFORE UPDATE ON app_config
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
