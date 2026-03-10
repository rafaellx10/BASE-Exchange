# BASE Exchange - Sistema de Gerenciamento de Ordens

![Sistema BASE Exchange - Gerenciamento de Ordens](image.png)

_Imagem do sistema de gerenciamento de ordens de compra e venda de ativos financeiros_

Sistema front-end para visualização e gerenciamento de ordens de compra e venda de ativos financeiros, desenvolvido como parte de um desafio técnico.

## ✅ Requisitos

- Node.js 18+ (recomendado)
- npm 9+ (ou compatível com a versão do Node)

## 🚀 Tecnologias Utilizadas

- **Linguagem**: TypeScript
- **Framework**: React 19
- **Build Tool**: Vite
- **Estilização**: TailwindCSS + CSS Modules
- **Gerenciamento de Estado**: Zustand
- **API Mock**: JSON Server + axios
- **Validações**: Zod + React Hook Form
- **Testes**: Vitest + React Testing Library
- **Linting/Formatação**: ESLint + Prettier + TypeScript ESLint

## 📦 Instalação e Execução

1. **Clone o repositório**

   ```bash
   git clone https://github.com/SEU_USUARIO/base-exchange.git
   cd base-exchange
   ```

2. **Instale as dependências**

   ```bash
   npm install
   ```

3. **Scripts principais**

   ```bash
   # Desenvolvimento - apenas front-end (usa mock local em src/mock/db.json)
   npm run dev

   # API mock com JSON Server (http://localhost:3001)
   npm run server

   # Front-end + API mock em paralelo
   npm run dev:full

   # Build para produção
   npm run build

   # Lint do código
   npm run lint

   # Ajustar formatação com Prettier
   npm run format

   # Executar todos os testes
   npm test

   # Testes com UI do Vitest
   npm run test:ui

   # Gerar relatório de cobertura
   npm run test:coverage
   ```

4. **Acesse a aplicação**

- Front-end: http://localhost:5173
- API Mock (JSON Server): http://localhost:3001

> 💡 **Nota:** O front atualmente carrega as ordens diretamente de `src/mock/db.json` (mock local) usando Zustand. O client HTTP (`src/services/api.ts`) e o `OrderService` (`src/services/orderService.ts`) já estão preparados para integração real com a API mock/real.

## 🏗️ Estrutura do Projeto

```bash
src/
├── App.tsx                    # Componente raiz da aplicação
├── main.tsx                   # Bootstrap do React/Vite
├── assets/                    # Assets estáticos
│   └── react.svg
├── components/                # Componentes reutilizáveis
│   ├── BaseLoading/           # Componente de loading genérico
│   ├── BaseModal/             # Componente de modal genérico
│   └── orders/                # Componentes relacionados a ordens
│       ├── CreateOrderForm.tsx
│       └── OrderDataGrid/     # DataGrid de ordens + testes
│           ├── OrderDataGrid.tsx
│           ├── OrderDataGrid.module.css
│           └── __tests__/
├── hooks/                     # Custom hooks (reservado/expansível)
├── services/                  # Chamadas HTTP e serviços de domínio
│   ├── api.ts                 # Instância axios configurada
│   └── orderService.ts        # Service de ordens (CRUD + filtros)
├── stores/                    # Gerenciamento de estado com Zustand
│   └── orderStore.ts
├── types/                     # Tipagens TypeScript de domínio
│   └── order.ts
├── utils/                     # Funções utilitárias e regras de negócio
│   ├── orderMatching.ts       # Algoritmo de matching de ordens
│   ├── validation/            # Schemas/validações (Zod)
│   │   └── orderSchemas.ts
│   └── __tests__/             # Testes unitários de utilitários
│       └── orderMatching.test.ts
├── mock/                      # Dados mock usados pelo front e JSON Server
│   └── db.json
├── pages/                     # Páginas da aplicação (para expansão futura)
└── test/                      # Configuração global de testes
    └── setup.ts
```

## 🔄 Fluxo de Dados

1. O mock de ordens é definido em `src/mock/db.json`.
2. `App.tsx` importa diretamente esse arquivo e converte os dados para o tipo `Order`.
3. As ordens são armazenadas no Zustand store (`src/stores/orderStore.ts`).
4. O componente `OrderDataGrid` consome o store para listar, filtrar e paginar as ordens.
5. O componente `CreateOrderForm` é usado para criação de novas ordens (com validação via Zod + React Hook Form).
6. O `OrderService` (`src/services/orderService.ts`) encapsula chamadas HTTP para `/orders`, pronto para ser usado quando a aplicação estiver consumindo a API mock (JSON Server) ou uma API real.

## 🧪 Testes

Os testes são escritos com **Vitest** + **React Testing Library**.

```bash
# Executar todos os testes em modo padrão
npm test

# Testes com UI (dashboard do Vitest)
npm run test:ui

# Gerar relatório de cobertura
npm run test:coverage
```

Os testes de utilitários (como o algoritmo de matching de ordens) ficam em `src/utils/__tests__`, e os testes de componentes em pastas `__tests__` ao lado dos componentes (por exemplo, `OrderDataGrid`).

## 📋 Funcionalidades Implementadas

### 1. Visualização de Ordens

✅ DataGrid com colunas: ID, Instrumento, Lado (Compra/Venda), Preço, Quantidade, Quantidade Restante, Status, Data/Hora  
✅ Filtros por ID, instrumento, status, data e lado  
✅ Ordenação e paginação  
✅ Responsividade e UI/UX otimizada

### 2. Detalhes da Ordem

✅ Modal de visualização ao clicar em uma ordem  
✅ Exibição de informações detalhadas da ordem (datas, quantidades, status)

### 3. Criação de Ordem

✅ Formulário de criação com validações (React Hook Form + Zod)  
✅ Toda ordem criada inicia com status **OPEN** (Aberta)

### 4. Cancelamento de Ordem

✅ Fluxo de cancelamento com confirmação  
✅ Apenas ordens com status **OPEN** ou **PARTIAL** podem ser canceladas

### 5. Lógica de Execução de Ordens

✅ Algoritmo de matching de ordens (`src/utils/orderMatching.ts`)  
✅ Atualização automática de status (OPEN → PARTIAL → EXECUTED)  
✅ Quantidade restante atualizada automaticamente

## 🎨 Design System

O sistema utiliza **TailwindCSS com CSS Modules**, seguindo o padrão especificado:

```css
/* Exemplo: OrderDataGrid.module.css */
.container {
  @apply w-full overflow-hidden rounded-lg border border-gray-200 shadow-sm;
}

.statusBadge {
  @apply inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium;
}

.statusOpen {
  @apply bg-green-100 text-green-800;
}
```

## 🔧 Configuração do .gitignore

O projeto inclui um `.gitignore` abrangente gerado via [gitignore.io](https://www.toptal.com/developers/gitignore) contendo, entre outros:

- `node_modules`
- Arquivos de build (`dist/`)
- Variáveis de ambiente
- Arquivos de configuração de IDE
- Arquivos de log

## 📊 API Mock (JSON Server)

O projeto utiliza **JSON Server** para simular uma API RESTful completa, baseada em `src/mock/db.json`:

```json
{
  "orders": [
    {
      "id": "ORD-001",
      "instrument": "PETR4",
      "side": "BUY",
      "price": 35.75,
      "quantity": 1000,
      "remainingQuantity": 0,
      "status": "EXECUTED",
      "createdAt": "2026-03-08T10:30:00Z"
    }
  ]
}
```

Endpoints disponíveis (quando `npm run server` está rodando):

- `GET /orders` - Listar todas as ordens
- `GET /orders/:id` - Obter uma ordem específica
- `POST /orders` - Criar nova ordem
- `PATCH /orders/:id` - Atualizar ordem
- `DELETE /orders/:id` - Excluir ordem

## 🧩 Componente Principal: OrderDataGrid

O `OrderDataGrid` é o componente central de listagem do sistema, implementando:

- **Ordenação**: clique nos cabeçalhos das colunas para ordenar
- **Filtragem**: filtros avançados por múltiplos critérios
- **Paginação**: controle de itens por página e navegação
- **Responsividade**: layout adaptável para diferentes tamanhos de tela
- **Acessibilidade**: suporte a navegação por teclado e leitores de tela

## 🚀 Deploy

Para gerar uma build de produção:

```bash
npm run build
```

Os arquivos otimizados serão gerados na pasta `dist/`, prontos para serem servidos por qualquer servidor web estático.

## 🙌 Créditos

Este projeto foi desenvolvido como parte de um desafio técnico da [Coodesh](https://coodesh.com/).

---

**Nota:** O foco deste projeto é demonstrar boas práticas de desenvolvimento front-end, arquitetura limpa, organização de pastas e uma experiência do usuário fluida para visualização e gerenciamento de ordens.
