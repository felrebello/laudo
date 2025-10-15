/*
  # Adicionar preço 2D Parcial

  1. Mudanças na estrutura
    - Renomear `price_2d` para `price_2d_total` em todas as tabelas
    - Adicionar coluna `price_2d_partial` em todas as tabelas
  
  2. Categorias de preços
    - Preço 2D Total: Diagnóstico boca toda, Panorâmica, Ilustrado, Análise Idade Óssea
    - Preço 2D Parcial: Periapical, Interproximal (Bite Wing)
    - Preço 3D Total: Tomografias completas
    - Preço 3D Parcial: Tomografias parciais

  3. Tabelas afetadas
    - units
    - clinic_specialist_prices
*/

-- Adicionar coluna price_2d_partial na tabela units
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'units' AND column_name = 'price_2d_partial'
  ) THEN
    ALTER TABLE units ADD COLUMN price_2d_partial numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Renomear price_2d para price_2d_total na tabela units
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'units' AND column_name = 'price_2d'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'units' AND column_name = 'price_2d_total'
  ) THEN
    ALTER TABLE units RENAME COLUMN price_2d TO price_2d_total;
  END IF;
END $$;

-- Adicionar coluna price_2d_partial na tabela clinic_specialist_prices
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinic_specialist_prices' AND column_name = 'price_2d_partial'
  ) THEN
    ALTER TABLE clinic_specialist_prices ADD COLUMN price_2d_partial numeric(10,2) DEFAULT 0;
  END IF;
END $$;

-- Renomear price_2d para price_2d_total na tabela clinic_specialist_prices
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinic_specialist_prices' AND column_name = 'price_2d'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'clinic_specialist_prices' AND column_name = 'price_2d_total'
  ) THEN
    ALTER TABLE clinic_specialist_prices RENAME COLUMN price_2d TO price_2d_total;
  END IF;
END $$;