/*
  # Tabela de Preços por Clínica e Especialista

  ## Descrição
  Este migration adiciona suporte para preços específicos por combinação clínica + especialista.
  Permite configurar valores diferentes para cada especialista em cada clínica.

  ## Nova Tabela

  ### `clinic_specialist_prices`
  - `id` (uuid, primary key) - Identificador único
  - `clinic_name` (text, not null) - Nome da clínica
  - `specialist_name` (text, not null) - Nome do especialista
  - `price_2d` (numeric) - Preço para exames 2D
  - `price_3d_total` (numeric) - Preço para exames 3D Total
  - `price_3d_partial` (numeric) - Preço para exames 3D Parcial
  - `created_at` (timestamptz) - Data de criação
  - `updated_at` (timestamptz) - Data de atualização

  ## Segurança
  - Row Level Security (RLS) habilitado
  - Políticas permitem acesso público (aplicação single-user)

  ## Notas Importantes
  1. A combinação clínica + especialista deve ser única
  2. Preços específicos têm prioridade sobre preços gerais da clínica
  3. Se não houver preço específico, sistema usa preço da tabela units
*/

-- Criar tabela de preços por clínica e especialista
CREATE TABLE IF NOT EXISTS clinic_specialist_prices (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  clinic_name text NOT NULL,
  specialist_name text NOT NULL,
  price_2d numeric(10,2) DEFAULT 0,
  price_3d_total numeric(10,2) DEFAULT 0,
  price_3d_partial numeric(10,2) DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),

  -- Garantir que cada combinação clínica + especialista seja única
  UNIQUE(clinic_name, specialist_name)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_clinic_specialist_prices_clinic
  ON clinic_specialist_prices(clinic_name);

CREATE INDEX IF NOT EXISTS idx_clinic_specialist_prices_specialist
  ON clinic_specialist_prices(specialist_name);

-- Habilitar RLS
ALTER TABLE clinic_specialist_prices ENABLE ROW LEVEL SECURITY;

-- Políticas para clinic_specialist_prices (acesso público para single-user app)
CREATE POLICY "Allow public read access to clinic_specialist_prices"
  ON clinic_specialist_prices FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to clinic_specialist_prices"
  ON clinic_specialist_prices FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to clinic_specialist_prices"
  ON clinic_specialist_prices FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to clinic_specialist_prices"
  ON clinic_specialist_prices FOR DELETE
  TO anon
  USING (true);

-- Trigger para atualizar updated_at automaticamente
DROP TRIGGER IF EXISTS update_clinic_specialist_prices_updated_at ON clinic_specialist_prices;
CREATE TRIGGER update_clinic_specialist_prices_updated_at
  BEFORE UPDATE ON clinic_specialist_prices
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();
