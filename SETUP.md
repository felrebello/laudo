# Setup do Sistema de Cálculo de Laudos

## Modo Offline (Preview/StackBlitz)

**O sistema funciona automaticamente em modo offline sem necessidade de configuração!**

Quando as variáveis de ambiente do Supabase não estão configuradas, o sistema automaticamente:
- Usa localStorage para persistir dados localmente no navegador
- Todas as funcionalidades funcionam normalmente (CRUD de clínicas, configurações, upload de arquivos, geração de PDFs)
- Exibe um aviso no console: "Running in offline preview mode: Supabase disabled"

## Modo Online (Produção com Supabase)

Para usar persistência em nuvem com Supabase:

### 1. Configurar Variáveis de Ambiente

Crie um arquivo `.env` na raiz do projeto com:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

### 2. Aplicar Migration do Banco de Dados

1. Acesse o dashboard do Supabase
2. Navegue até "SQL Editor" no menu lateral
3. Clique em "New Query"
4. Copie todo o conteúdo do arquivo `supabase/migrations/20250101000000_initial_schema.sql`
5. Cole no editor SQL
6. Clique em "Run" para executar

### 3. Reiniciar o Servidor

Após configurar as variáveis de ambiente, reinicie o servidor de desenvolvimento para que o sistema use o Supabase em vez do localStorage.

## Estrutura do Banco de Dados

O sistema cria duas tabelas principais:

### `units` (Clínicas)
- Armazena informações sobre clínicas e seus preços
- Campos: id, name, price_2d, price_3d_total, price_3d_partial
- Nota: Tabela manteve nome `units` por compatibilidade, mas representa clínicas

### `app_config` (Configurações)
- Armazena configurações globais do sistema
- Campos: id, competency, bank_data, pix_key, logo_url, observations
- Apenas um registro fixo (single-user app)

## Como Usar o Sistema

1. **Configure as Clínicas**: Adicione clínicas e defina preços para 2D, 3D Total e 3D Parcial
2. **Configure o Sistema**: Defina competência, dados bancários, PIX e logo
3. **Faça Upload do Arquivo**: Carregue CSV ou XLSX com colunas: Paciente, Tipo de análise, Clínica, Especialista, Quantidade
4. **Veja os Resultados**: Sistema calcula automaticamente valores por categoria e quantidade
5. **Gere Relatórios**: Exporte CSV ou gere PDFs (Relatório Detalhado e Fatura)

## Tipos de Exames Suportados

### Categoria 2D
- Diagnóstico de Panorâmica
- Diagnóstico de Periapical
- Diagnóstico de Interproximal (Bite Wing)
- Cefalometria Lateral
- Laudo Ilustrado
- Análise Idade Óssea
- Diagnóstico de Boca Toda
- Diagnóstico (Outro)

### Categoria 3D Parcial
- Tomografia de até 2 dentes
- Tomografia de até 4 dentes
- Tomografia de até 6 dentes

### Categoria 3D Total
- Tomografia da Maxila
- Tomografia da Mandíbula
- Tomografia (Outro)

## Formato do Arquivo CSV/XLSX

O arquivo deve conter as seguintes colunas (cabeçalho na primeira linha):

- **Paciente** (obrigatório): Nome do paciente
- **Tipo de análise** (obrigatório): Tipo de análise exato da lista acima
- **Clínica** (obrigatório): Nome da clínica (deve existir no sistema)
- **Especialista** (obrigatório): Nome do especialista
- **Quantidade** (obrigatório): Número de análises daquele tipo

### Exemplo CSV:
```csv
Paciente,Tipo de análise,Clínica,Especialista,Quantidade
João Silva,Diagnóstico de Panorâmica,Clínica Centro,Dr. Carlos,1
Maria Santos,Tomografia da Maxila,Clínica Norte,Dra. Ana,2
```

## Observações

- Sistema single-user (sem autenticação necessária)
- **Modo Offline**: Dados persistidos no localStorage do navegador
- **Modo Online**: Dados persistidos no Supabase (banco de dados em nuvem)
- Análises sem preço definido são marcadas como "Sem preço" e valor = R$ 0,00
- Totais calculados por especialista dentro de cada clínica
- Quantidade permite registrar múltiplas análises do mesmo tipo em uma linha
- PDFs incluem logo e informações de competência/pagamento
- Sistema detecta automaticamente se deve usar localStorage ou Supabase
