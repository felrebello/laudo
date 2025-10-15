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
  UNIQUE(clinic_name, specialist_name)
);

-- Criar índices para performance
CREATE INDEX IF NOT EXISTS idx_clinic_specialist_prices_clinic
  ON clinic_specialist_prices(clinic_name);

CREATE INDEX IF NOT EXISTS idx_clinic_specialist_prices_specialist
  ON clinic_specialist_prices(specialist_name);

-- Habilitar RLS
ALTER TABLE clinic_specialist_prices ENABLE ROW LEVEL SECURITY;

-- Políticas para clinic_specialist_prices
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