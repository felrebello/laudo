# Guia Rápido - Sistema de Cálculo de Laudos

## Teste Rápido (3 minutos)

### 1. Cadastrar Clínicas
No painel "Clínicas e Preços" (lado esquerdo):
- Clique em "Nova Clínica"
- Nome: `Clínica Centro`
- Preço 2D: `50.00`
- Preço 3D Total: `150.00`
- Preço 3D Parcial: `100.00`
- Clique em "Salvar"

Repita para mais clínicas (opcional):
- `Clínica Norte` com preços diferentes
- `Clínica Sul` com preços diferentes

### 2. Configurar Sistema (Opcional)
No painel "Configurações" (lado esquerdo):
- Competência: `Janeiro/2025`
- Dados Bancários: `Banco do Brasil - Ag: 1234 - CC: 56789-0`
- Chave PIX: `seuemail@exemplo.com`
- Clique em "Salvar Configurações"

### 3. Fazer Upload
No painel direito:
- Use o arquivo `exemplo_laudos.csv` incluído no projeto
- Ou arraste/selecione seu próprio arquivo CSV/XLSX

### 4. Ver Resultados
Após o upload:
- Veja a tabela com todos os exames calculados
- Totais por radiologista dentro de cada unidade
- Total geral

### 5. Gerar PDFs
Clique nos botões:
- **Exportar CSV**: Baixa os dados calculados
- **Relatório PDF**: Documento detalhado com todos os exames
- **Fatura PDF**: Documento formatado para cobrança

## Tipos de Exames Aceitos

### 2D (usa Preço 2D)
- Diagnóstico de Panorâmica
- Diagnóstico de Periapical
- Diagnóstico de Interproximal (Bite Wing)
- Cefalometria Lateral
- Laudo Ilustrado
- Análise Idade Óssea
- Diagnóstico de Boca Toda
- Diagnóstico (Outro)

### 3D Parcial (usa Preço 3D Parcial)
- Tomografia de até 2 dentes
- Tomografia de até 4 dentes
- Tomografia de até 6 dentes

### 3D Total (usa Preço 3D Total)
- Tomografia da Maxila
- Tomografia da Mandíbula
- Tomografia (Outro)

## Formato do Arquivo

### CSV/XLSX deve ter estas colunas:

```csv
Paciente,Tipo de análise,Clínica,Especialista,Quantidade
João Silva,Diagnóstico de Panorâmica,Clínica Centro,Dr. Carlos,1
Maria Santos,Tomografia da Maxila,Clínica Centro,Dr. Carlos,2
```

**Obrigatório:**
- Paciente
- Tipo de análise (deve ser exato de uma das listas acima)
- Clínica (deve existir no sistema)
- Especialista
- Quantidade

**Nota:**
- Quantidade: Número de análises daquele tipo (padrão: 1)
- Especialista: padrão "Não especificado" se vazio

## Modo Offline

O sistema funciona automaticamente em modo offline:
- Dados salvos no navegador (localStorage)
- Todas as funcionalidades disponíveis
- Banner amarelo indica modo offline
- Perfeito para testes e preview

## Dicas

1. **Nomes devem coincidir**: O nome da clínica no arquivo CSV deve ser igual ao cadastrado
2. **Tipos exatos**: Use os tipos de análise exatamente como listados acima
3. **Quantidade**: Se uma linha tem quantidade 3, serão contabilizadas 3 análises daquele tipo
4. **Sem preço**: Análises de clínicas sem preço aparecem como "Sem preço" e valor R$ 0,00
5. **Logo**: Faça upload de uma imagem PNG/JPG no painel de configurações para aparecer nos PDFs
6. **Persistência**: Em modo offline, dados ficam salvos no navegador mesmo após recarregar
