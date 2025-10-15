/*
  # Adicionar tabela de mapeamentos de tipos de exames

  1. Nova Tabela
    - `exam_type_mappings`
      - `id` (uuid, primary key)
      - `original_name` (text, unique) - Nome original do exame no CSV
      - `mapped_category` (text) - Categoria mapeada pelo usuário
      - `created_at` (timestamptz)
      - `updated_at` (timestamptz)
  
  2. Segurança
    - Habilitar RLS
    - Políticas públicas para single-user app
  
  3. Propósito
    - Armazenar mapeamentos personalizados de tipos de exames
    - Permitir que o usuário defina categorias para exames não reconhecidos
*/

-- Criar tabela de mapeamentos
CREATE TABLE IF NOT EXISTS exam_type_mappings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  original_name text NOT NULL UNIQUE,
  mapped_category text NOT NULL,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Habilitar RLS
ALTER TABLE exam_type_mappings ENABLE ROW LEVEL SECURITY;

-- Políticas para exam_type_mappings (acesso público para single-user app)
CREATE POLICY "Allow public read access to exam_type_mappings"
  ON exam_type_mappings FOR SELECT
  TO anon
  USING (true);

CREATE POLICY "Allow public insert access to exam_type_mappings"
  ON exam_type_mappings FOR INSERT
  TO anon
  WITH CHECK (true);

CREATE POLICY "Allow public update access to exam_type_mappings"
  ON exam_type_mappings FOR UPDATE
  TO anon
  USING (true)
  WITH CHECK (true);

CREATE POLICY "Allow public delete access to exam_type_mappings"
  ON exam_type_mappings FOR DELETE
  TO anon
  USING (true);

-- Trigger para atualizar updated_at automaticamente
CREATE TRIGGER update_exam_type_mappings_updated_at
  BEFORE UPDATE ON exam_type_mappings
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();