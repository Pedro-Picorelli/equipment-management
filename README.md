# Gestão de Equipamentos – API (Node + Express + Sequelize + PostgreSQL)

API para cadastro de **Funcionários** e **Equipamentos**, e **Reservas** com regras de negócio:
- Um equipamento só pode estar com **um funcionário por vez**;
- Um funcionário com **reserva ativa** não pode reservar outro equipamento;
- Finalizar a reserva devolve o equipamento para `AVAILABLE`.

---

## ✅ Passo a passo (modo Docker) — do zero ao “rodando”

> **O que você vai fazer:** clonar o projeto, garantir Docker aberto, criar arquivos `.env`, subir com Docker Compose, testar os endpoints e (se quiser) rodar os testes automatizados dentro do Docker.

### 1) Pré-requisitos
- **Docker Desktop** instalado e **aberto** (rodando).
- (Opcional) `curl` para testar endpoints via terminal.
- (Opcional) Node 18+ caso deseje rodar localmente sem Docker.

### 2) Baixe/clone este repositório
```bash
# HTTPS
git clone <URL_DO_REPOSITORIO>
# ou SSH
git clone git@github.com:<ORG>/<REPO>.git

cd equipment-management
```

### 3) Crie o arquivo `.env` (na raiz)
Esse arquivo será usado para subir **db** e **app** no Docker. Exemplo seguro para ambiente local:
```ini
# .env (desenvolvimento / docker)
NODE_ENV=development
PORT=3000

# Postgres (serviço "db")
DB_HOST=127.0.0.1          # <- usado quando a API roda FORA do docker; dentro do docker usamos DB_HOST=db
DB_PORT=5432               # se sua 5432 local estiver ocupada, mude o mapeamento no compose p/ 5433:5432 e ajuste aqui se for rodar fora do docker
DB_USER=app
DB_PASS=app
DB_NAME=appdb

# pgAdmin (opcional)
PGADMIN_DEFAULT_EMAIL=admin@example.com
PGADMIN_DEFAULT_PASSWORD=admin

# Banco de teste (opcional)
DB_NAME_TEST=appdb_test
```

> **Importante:** o compose injeta essas variáveis nos containers. Quando a **API roda dentro do Docker**, ela se conecta no Postgres usando `DB_HOST=db` (nome do serviço na rede do compose). O compose do projeto já força isso para você.

### 4) (Opcional, mas recomendado para testes) Crie `.env.test.docker`
Esse arquivo é usado **pelos testes automatizados** (a API *dentro do container de teste* fala com o Postgres pelo host `db`):
```ini
# .env.test.docker
NODE_ENV=test
PORT=3001
DB_HOST=db
DB_PORT=5432
DB_USER=app
DB_PASS=app
DB_NAME=appdb_test
```

### 5) Suba os containers
Com o Docker Desktop **aberto**, rode:
```bash
docker compose build --no-cache
docker compose up -d
```

- Isso sobe:
  - **db** (PostgreSQL),
  - **equipment-management** (sua API),
  - **pgadmin** (opcional, UI web em http://localhost:5050).

> Se o compose do seu projeto tiver o sidecar `db-init-test`, ele **cria** o banco de teste `appdb_test` automaticamente. Caso contrário, você pode criar manualmente (veja Troubleshooting).

### 6) Verifique se está tudo de pé
```bash
docker compose ps
docker compose logs -f equipment-management   # (Ctrl+C para sair)
```

### 7) Teste os endpoints
```bash
curl http://localhost:3000/health
# → { "ok": true }

curl http://localhost:3000/health/db
# → { "db": "up" }
```

#### Exemplos rápidos (cURL)
```bash
# Criar funcionário
curl -X POST http://localhost:3000/api/employees \
  -H "Content-Type: application/json" \
  -d '{"name":"Ana","department":"Financeiro"}'

# Criar equipamento
curl -X POST http://localhost:3000/api/equipments \
  -H "Content-Type: application/json" \
  -d '{"name":"Notebook Dell 5420","category":"Laptop"}'

# Criar reserva (use os IDs retornados acima)
curl -X POST http://localhost:3000/api/reservations \
  -H "Content-Type: application/json" \
  -d '{"employeeId":"<EMP_ID>","equipmentId":"<EQ_ID>","startDate":"2025-09-02T12:00:00.000Z"}'

# Finalizar reserva
curl -X PUT http://localhost:3000/api/reservations/<RES_ID>/finish \
  -H "Content-Type: application/json" \
  -d '{"endDate":"2025-09-02T18:00:00.000Z"}'
```

---

## 🧪 Testes automatizados (Jest + Supertest) dentro do Docker

### 1) Garanta o `.env.test.docker`
Veja o passo **4** acima. Ele deve conter `DB_HOST=db`.

### 2) Crie o banco de teste (se o sidecar não existir)
Se o compose **não** tem o serviço `db-init-test`, crie o DB manualmente:
```bash
docker compose exec db psql -U app -d postgres -c "CREATE DATABASE appdb_test;"
```

### 3) Rode os testes
```bash
docker compose run --rm test
```
- O serviço `test` usa a imagem do Node, instala dependências (`npm ci`) e executa `npm test` dentro do container, usando o Postgres do compose.

> Na suíte, o Jest faz o `sync({ force: true })` e dá `TRUNCATE` entre testes — não suja o banco de dev.

---

## 📦 Estrutura do projeto (resumo)

```
src/
  app.ts
  server.ts
  routes/ (index + equipments/employees/reservations)
  controllers/
  services/
  models/ (index + Employee/Equipment/Reservation/relations)
  middlewares/ (validateUuidParam)
  erros/ (AppError)
  utils/ (validators)
  __tests__/ (setup + *.spec.ts)

docker/
  initdb/ (opcional para scripts de init do Postgres)

.github/workflows/
  ci.yml (opcional: pipeline CI)
```

---

## 🔧 Comandos úteis

```bash
# Ver logs em tempo real
docker compose logs -f db
docker compose logs -f equipment-management

# Reiniciar somente a API
docker compose restart equipment-management

# Executar comandos dentro do container da API
docker compose exec equipment-management sh

# Derrubar containers mantendo dados
docker compose down

# Derrubar containers e APAGAR volumes (⚠️ apaga dados do Postgres)
docker compose down -v
```

---

## ❗Troubleshooting (os mais comuns)

**Porta 5432 já em uso**  
Outro Postgres está na 5432 do host.
```bash
# Windows
netstat -ano | findstr :5432
# Soluções:
# - Pare o serviço local de Postgres, ou
# - Mapeie a porta do db no compose para 5433:5432 (e ajuste o que for necessário se for rodar fora do docker)
```

**`password authentication failed for user "app"`**  
Geralmente é a API tentando conectar no Postgres **errado** (ex.: local vs docker). Dentro do compose:
- Use `DB_HOST=db` (o compose já faz isso para você na API).
- Confira variáveis no container: `docker compose exec equipment-management env | grep DB_`.

**`.env.test.docker not found`**  
Crie o arquivo na raiz, exatamente com esse nome (ver passo 4).

**UUID inválido nos endpoints**  
A API retorna `400 INVALID_UUID` se o `:id` não for UUID v4.

**pgAdmin**  
Acesse http://localhost:5050 e cadastre um servidor com:
- **Host**: `db`
- **User**: `app`
- **Password**: `app`
- **Database**: `appdb` (e **appdb_test** se criado)

---

## 🔐 Boas práticas
- **Não** versione `.env`. Deixe um `.env.example` com chaves “falsas”.
- Em produção, use **migrações** do Sequelize (no lugar de `sync({ alter: true })`), *secrets* de ambiente e restrinja o acesso ao pgAdmin (ou nem rode pgAdmin em prod).
- Adicione CORS/Helmet, logs estruturados e observabilidade conforme necessidade.

---

## 📝 Endpoints (lembrete)
- `GET /health` → `{ ok: true }`
- `GET /health/db` → `{ db: "up" }`
- **Employees**: `POST/GET/GET/:id/PUT/:id/DELETE/:id`
- **Equipments**: `POST/GET/GET/:id/PUT/:id/DELETE/:id` (+ filtros `name`, `category`, `status`)
- **Reservations**: `POST /api/reservations`, `PUT /api/reservations/:id/finish`, `GET /api/reservations`

---

## Licença
MIT
