# Sistema de Cálculo de Laudos

Sistema web completo para calcular pagamentos de laudos médicos com geração de relatórios e faturas em PDF.

## Características

- **Modo Offline/Online Automático**: Funciona sem configuração usando localStorage ou com Supabase para persistência em nuvem
- **Gerenciamento de Unidades**: CRUD completo com preços por categoria (2D, 3D Total, 3D Parcial)
- **Upload de Arquivos**: Suporte para CSV e XLSX com validação
- **Cálculos Automáticos**: Mapeia tipos de exames para categorias e calcula valores
- **Totais Detalhados**: Por radiologista, por unidade e total geral
- **Exportação**: CSV e PDFs (Relatório Detalhado e Fatura)
- **Configurável**: Competência, dados bancários, PIX, logo e observações

## Como Usar

1. **Abra o preview** - Sistema inicia automaticamente em modo offline
2. **Cadastre unidades** - Adicione unidades e defina preços
3. **Configure o sistema** - Defina período, dados de pagamento e logo
4. **Faça upload** - Arraste um arquivo CSV/XLSX com os exames
5. **Gere relatórios** - Exporte CSV ou PDFs

## Tecnologias

- React + TypeScript
- Tailwind CSS
- Supabase (opcional)
- XLSX (parsing de planilhas)
- jsPDF (geração de PDFs)

## Configuração (Opcional)

Para usar persistência em nuvem, configure as variáveis de ambiente no arquivo `.env`:

```env
VITE_SUPABASE_URL=sua_url_do_supabase
VITE_SUPABASE_ANON_KEY=sua_chave_anon_do_supabase
```

Veja [SETUP.md](./SETUP.md) para instruções completas.

## Desenvolvimento

```bash
npm install
npm run dev
```

## Build

```bash
npm run build
```
