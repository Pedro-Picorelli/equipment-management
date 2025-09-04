# Gestão de Equipamentos – Web API (Node + Express + Sequelize + PostgreSQL)

API para cadastro de **Funcionários** e **Equipamentos**, e **Reservas** com regras de negócio:
- Um equipamento só pode estar com **um funcionário por vez**.
- Um funcionário com **reserva ativa** não pode reservar outro equipamento.
- Finalização de reserva libera o equipamento.

## Stack
- Node.js (TypeScript) + Express
- Sequelize (PostgreSQL)
- Jest + Supertest
- Docker Compose (Postgres + Adminer/pgAdmin opcional)

## Estrutura
```
src/
  app.ts
  server.ts
  routes/
    index.ts
    employees.routes.ts
    equipments.routes.ts
    reservations.routes.ts
  controllers/
    employees.controller.ts
    equipments.controller.ts
    reservations.controller.ts
  services/
    employees.service.ts
    equipments.service.ts
    reservations.service.ts
  models/
    index.ts
    Employee.ts
    Equipment.ts
    Reservation.ts
    relations.ts
  middlewares/
    validateUuidParam.ts
  erros/
    AppError.ts
  __tests__/   # Jest + Supertest
    setup.ts
    health.spec.ts
    employees.spec.ts
    equipments.spec.ts
    reservations.spec.ts
```

## Requisitos
- Node 18+
- Docker Desktop (recomendado) ou Postgres local

## Configuração de ambiente
Crie **.env** (desenvolvimento) e **.env.test** (testes). Exemplo:

`.env`
```ini
NODE_ENV=development
PORT=3000
DB_HOST=127.0.0.1
DB_PORT=5432       # se usar outra porta no Docker, ajuste aqui
DB_USER=app
DB_PASS=app
DB_NAME=appdb
```

`.env.test`
```ini
NODE_ENV=test
PORT=3001
DB_HOST=127.0.0.1
DB_PORT=5432
DB_USER=app
DB_PASS=app
DB_NAME=appdb_test
```

> O banco de teste pode ser criado com:
> `docker exec -it pg_gestao_equip psql -U app -d postgres -c "CREATE DATABASE appdb_test;"`

## Subir o banco (Docker)
`docker-compose.yml` (exemplo mínimo):
```yaml
version: "3.9"
services:
  db:
    image: postgres:16
    container_name: pg_gestao_equip
    environment:
      POSTGRES_USER: ${DB_USER}
      POSTGRES_PASSWORD: ${DB_PASS}
      POSTGRES_DB: ${DB_NAME}
      TZ: America/Sao_Paulo
      PGTZ: America/Sao_Paulo
    ports:
      - "5432:5432"   # se conflitar com Postgres local, use "5433:5432" e ajuste DB_PORT
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -U ${DB_USER} -d ${DB_NAME}"]
      interval: 5s
      timeout: 3s
      retries: 10
    volumes:
      - pgdata:/var/lib/postgresql/data

  # Opcional: Adminer (UI web)
  adminer:
    image: adminer:4
    container_name: adminer_gestao_equip
    depends_on:
      db:
        condition: service_healthy
    ports:
      - "8080:8080"

volumes:
  pgdata:
```

Subir:
```bash
docker compose up -d
```

## Rodar em desenvolvimento
```bash
npm install
npm run dev
# health
curl http://localhost:3000/health
curl http://localhost:3000/health/db
```
> Em desenvolvimento, o Sequelize roda `sync({ alter: true })` criando/ajustando tabelas automaticamente.

## Endpoints

### Health
- `GET /health` → `{ ok: true }`
- `GET /health/db` → `{ db: "up" }`

### Employees
- `POST /api/employees` `{ name, department }`
- `GET  /api/employees`
- `GET  /api/employees/:id`
- `PUT  /api/employees/:id`
- `DELETE /api/employees/:id`

### Equipments
- `POST /api/equipments` `{ name, category, status? }`  
  `status ∈ { AVAILABLE | MAINTENANCE | LOANED }`
- `GET  /api/equipments?name&category&status`
- `GET  /api/equipments/:id`
- `PUT  /api/equipments/:id`
- `DELETE /api/equipments/:id`

### Reservations
- `POST /api/reservations` `{ employeeId, equipmentId, startDate(ISO) }`
- `PUT  /api/reservations/:id/finish` `{ endDate(ISO) }`
- `GET  /api/reservations` (join employee + equipment)

## Exemplos (cURL)

Criar funcionário:
```bash
curl -X POST http://localhost:3000/api/employees   -H "Content-Type: application/json"   -d '{"name":"Ana","department":"Financeiro"}'
```

Criar equipamento:
```bash
curl -X POST http://localhost:3000/api/equipments   -H "Content-Type: application/json"   -d '{"name":"Notebook Dell 5420","category":"Laptop"}'
```

Criar reserva:
```bash
curl -X POST http://localhost:3000/api/reservations   -H "Content-Type: application/json"   -d '{"employeeId":"<EMP_ID>","equipmentId":"<EQ_ID>","startDate":"2025-09-02T12:00:00.000Z"}'
```

Finalizar reserva:
```bash
curl -X PUT http://localhost:3000/api/reservations/<RES_ID>/finish   -H "Content-Type: application/json"   -d '{"endDate":"2025-09-02T18:00:00.000Z"}'
```

## Formato de erro (padronizado)
```json
{
  "error": "Validation error",
  "code": "VALIDATION_ERROR",
  "details": { "...": "..." },
  "stack": "apenas em NODE_ENV != production"
}
```
> O middleware `validateUuidParam` retorna `400 INVALID_UUID` quando o `:id` não é um UUID v4.

## Testes
```bash
# garanta o banco docker e o appdb_test criado
npm test
```
- A suíte usa `initSequelize()` e reseta o schema com `sequelize.sync({ force: true })` + `TRUNCATE` entre testes.
- Cobertura:
  - Health
  - Employees/Equipments (CRUD e validações)
  - Reservations (regras: equipamento AVAILABLE, uma reserva ativa por funcionário, finalizar libera equipamento)

## Produção (recomendações)
- Migrar de `sync({ alter: true })` para **migrações** (Sequelize CLI).
- Adicionar CORS/Helmet, logs estruturados, observabilidade, retries/backoff no DB, etc.

## Troubleshooting
- **Conflito na porta 5432**: use `netstat -ano | findstr :5432` (Windows). Se houver Postgres local, mapeie o Docker para `5433:5432` e ajuste `DB_PORT=5433`.
- **`password authentication failed`**: garanta que seu app aponta para o **Docker** (host/porta corretos) e não para outro Postgres local.
- **ENUM `status`**: para adicionar novos valores, prefira migração SQL (`ALTER TYPE ... ADD VALUE`).

## Licença
MIT
