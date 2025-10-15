# Configuração do Firebase - Laudos Realizados

## Migração Completa do Supabase para Firebase

Este projeto foi migrado do Supabase para o Firebase. Todas as funcionalidades agora usam Firebase Firestore para armazenamento de dados.

## Passo 1: Configuração já Realizada

✅ As credenciais do Firebase já estão configuradas no arquivo `src/lib/firebase.ts`
✅ Pacote Firebase instalado (`npm install firebase`)
✅ Código migrado para usar Firestore

## Passo 2: Configurar o Firestore Database

Você precisa ativar e configurar o Firestore no console do Firebase:

### 2.1 Acessar o Console do Firebase

1. Acesse [https://console.firebase.google.com](https://console.firebase.google.com)
2. Faça login com sua conta Google
3. Selecione o projeto "laudosrealizados"

### 2.2 Ativar o Firestore Database

1. No menu lateral, clique em **"Firestore Database"**
2. Clique em **"Criar banco de dados"**
3. Escolha o modo:
   - **Modo de produção** (recomendado) - Começa com regras restr itivas
   - **Modo de teste** (apenas para desenvolvimento) - Permite acesso total por 30 dias

4. Escolha a localização:
   - Recomendado: **southamerica-east1** (São Paulo, Brasil)

5. Clique em **"Ativar"**

### 2.3 Configurar Regras de Segurança

Após criar o banco, vá em **"Regras"** e configure as regras de segurança:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Permitir leitura e escrita apenas para usuários autenticados
    match /{document=**} {
      allow read, write: if request.time < timestamp.date(2025, 11, 14); // Temporário para testes
    }
  }
}
```

**IMPORTANTE:** As regras acima são temporárias e permitem acesso até 14/11/2025. Para produção, você deve implementar regras mais restritivas baseadas em autenticação.

### 2.4 Criar Collections Iniciais

O Firestore criará automaticamente as collections quando você adicionar o primeiro documento. As collections usadas são:

1. **`clinics`** - Armazena informações das clínicas
   - name (string)
   - price_2d_total (number)
   - price_2d_partial (number)
   - price_3d_total (number)
   - price_3d_partial (number)
   - created_at (timestamp)
   - updated_at (timestamp)

2. **`clinic_specialist_prices`** - Preços específicos por especialista e clínica
   - clinic_name (string)
   - specialist_name (string)
   - price_2d_total (number)
   - price_2d_partial (number)
   - price_3d_total (number)
   - price_3d_partial (number)
   - created_at (timestamp)
   - updated_at (timestamp)

3. **`exam_type_mappings`** - Mapeamentos personalizados de tipos de exames
   - original_name (string)
   - mapped_category (string)
   - created_at (timestamp)
   - updated_at (timestamp)

## Passo 3: Criar Índices (Opcional mas Recomendado)

Para melhor performance, crie índices compostos:

1. No console do Firestore, vá em **"Índices"**
2. Clique em **"Adicionar índice"**

**Índice 1: clinic_specialist_prices**
- Collection: `clinic_specialist_prices`
- Campos:
  - `clinic_name` (Crescente)
  - `specialist_name` (Crescente)

## Passo 4: Testar a Aplicação

1. Inicie o servidor de desenvolvimento:
   ```bash
   npm run dev
   ```

2. Abra o navegador em [http://localhost:5173](http://localhost:5173)

3. Teste as funcionalidades:
   - ✅ Adicionar clínica
   - ✅ Editar clínica
   - ✅ Excluir clínica
   - ✅ Adicionar especialista
   - ✅ Editar preços de especialista
   - ✅ Excluir especialista
   - ✅ Duplicar clínica
   - ✅ Duplicar especialista para outra clínica
   - ✅ Upload de arquivo CSV/XLSX
   - ✅ Classificar tipos de exames não reconhecidos
   - ✅ Gerar relatórios PDF

## Estrutura de Dados

### Exemplo de Documento: Clínica

```json
{
  "name": "Clínica São Paulo",
  "price_2d_total": 50,
  "price_2d_partial": 30,
  "price_3d_total": 150,
  "price_3d_partial": 100,
  "created_at": "2025-10-14T12:00:00.000Z",
  "updated_at": "2025-10-14T12:00:00.000Z"
}
```

### Exemplo de Documento: Preço de Especialista

```json
{
  "clinic_name": "Clínica São Paulo",
  "specialist_name": "Dr. João Silva",
  "price_2d_total": 60,
  "price_2d_partial": 35,
  "price_3d_total": 180,
  "price_3d_partial": 120,
  "created_at": "2025-10-14T12:00:00.000Z",
  "updated_at": "2025-10-14T12:00:00.000Z"
}
```

## Solução de Problemas

### Erro: "Missing or insufficient permissions"

**Causa:** Regras de segurança do Firestore muito restritivas.

**Solução:** Verifique as regras no console do Firebase e certifique-se de que permitem leitura e escrita.

### Erro: "Firebase: No Firebase App '[DEFAULT]' has been created"

**Causa:** Configuração do Firebase não foi inicializada corretamente.

**Solução:** Verifique se o arquivo `src/lib/firebase.ts` está sendo importado corretamente.

### Dados não aparecem na interface

**Causa:** Firestore ainda não foi ativado ou não há dados.

**Solução:**
1. Verifique se o Firestore está ativado no console
2. Tente adicionar uma clínica pela interface

## Próximos Passos

Para produção, considere:

1. **Autenticação**: Implementar Firebase Authentication
2. **Regras de Segurança**: Configurar regras baseadas em autenticação de usuários
3. **Backup**: Configurar exportações automáticas do Firestore
4. **Monitoramento**: Ativar o Firebase Analytics

## Suporte

Se encontrar problemas, verifique:
- Console do navegador (F12) para erros JavaScript
- Console do Firebase para erros de permissão
- Certifique-se de que o Firestore está ativado e configurado corretamente
