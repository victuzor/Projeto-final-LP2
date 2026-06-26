# MarketMenu

Sistema de gerenciamento de despensa doméstica com controle de gastos, validades e lista de compras inteligente.

## Sobre o Projeto

O MarketMenu ajuda usuários a:

- Controlar o estoque da despensa com datas de validade
- Registrar compras e acompanhar gastos mensais
- Gerar listas de compras inteligentes baseadas no histórico
- Comparar preços estimados entre supermercados

> **Status:** Em desenvolvimento — MVP funcional com operações básicas implementadas.

## Tecnologias

**Backend**
- Java 21 + Spring Boot
- PostgreSQL 16
- Flyway (migrações de banco)
- Lombok

**Frontend**
- React 19 + TypeScript
- Vite
- Axios
- Lucide React

## Pré-requisitos

- Java 21+
- Node.js 18+
- Docker e Docker Compose

## Como executar

### 1. Banco de dados

```bash
docker-compose up -d
```

### 2. Backend

```bash
cd backend
./mvnw spring-boot:run
```

A API ficará disponível em `http://localhost:8080`.

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

A aplicação ficará disponível em `http://localhost:5173`.

## Estrutura do Projeto

```
Projeto-final-LP2/
├── backend/
│   └── src/main/java/br/com/marketmenu/backend/
│       ├── controller/     # Endpoints REST
│       ├── service/        # Regras de negócio
│       ├── repository/     # Acesso ao banco (JPA)
│       ├── domain/         # Entidades
│       └── dto/            # Objetos de transferência
├── frontend/
│   └── src/
│       ├── App.tsx         # Componente principal
│       ├── types.ts        # Tipos TypeScript
│       └── services/api.ts # Cliente HTTP
├── requests/               # Exemplos de requisições HTTP
└── docker-compose.yml
```

## Funcionalidades

| Módulo | Descrição | Status |
|--------|-----------|--------|
| Dashboard | Resumo mensal de gastos e alertas de validade | Implementado |
| Despensa | Cadastro e controle de itens com validade | Implementado |
| Registro de Compras | Registro de compras por mercado com itens e preços | Implementado |
| Lista Inteligente | Sugestão de produtos baseada no histórico de compras | Implementado |
| Comparação de Mercados | Estimativa de custo total por supermercado | Implementado |
| Autenticação | Login e controle de usuários | Não implementado |

## API

Os principais endpoints estão documentados em [`requests/marketmenu.http`](requests/marketmenu.http).

Resumo:

```
GET  /api/health
GET  /api/dashboard/summary
GET  /api/pantry
POST /api/pantry
GET  /api/purchases
POST /api/purchases
GET  /api/smart-list
GET  /api/markets
GET  /api/categories
GET  /api/products
```

## Banco de Dados

O schema é gerenciado pelo Flyway com duas migrações:

- `V1__create_initial_tables.sql` — criação das tabelas
- `V2__seed_demo_data.sql` — dados iniciais de demonstração

Entidades: `Market`, `Category`, `Product`, `Purchase`, `PurchaseItem`, `PantryItem`.

## Configuração

As configurações do banco de dados ficam em `backend/src/main/resources/application.properties`. Por padrão:

```
spring.datasource.url=jdbc:postgresql://localhost:5432/marketmenu
spring.datasource.username=marketmenu
spring.datasource.password=marketmenu
```

Esses valores correspondem ao serviço definido no `docker-compose.yml`.
