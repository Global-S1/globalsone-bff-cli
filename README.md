# GlobalS1 BFF CLI

CLI para generar codigo para el Backend for Frontend (BFF) de GlobalS1.

## Instalacion

```bash
# Global
npm install -g globalsone-bff-cli

# O como devDependency
npm install -D globalsone-bff-cli
```

## Uso

```bash
# Ver ayuda
bff --help

# Ver version
bff --version
```

## Comandos

### Generate Aggregator

Genera agregadores de datos que combinan respuestas de multiples servicios.

```bash
# Agregador basico
bff generate aggregator dashboard
bff g a dashboard

# Con servicios especificos
bff g a user-profile --services "user,orders,preferences"

# Con cache
bff g a product-catalog --cache 300

# Para cliente especifico
bff g a mobile-home --client mobile

# Preview
bff g a my-aggregator --dry-run
```

**Opciones:**

| Opcion | Descripcion | Default |
|--------|-------------|---------|
| `-s, --services <services>` | Servicios a agregar (separados por coma) | |
| `-c, --cache <ttl>` | TTL de cache en segundos | |
| `--client <type>` | Tipo de cliente (web, mobile, tv) | |
| `--dry-run` | Preview sin crear archivos | false |
| `--force` | Sobrescribir archivos existentes | false |

### Generate Orchestrator

Genera orquestadores de flujos que coordinan operaciones secuenciales.

```bash
# Orquestador basico
bff generate orchestrator checkout-flow
bff g o checkout-flow

# Con pasos especificos
bff g o onboarding --steps "validate,create-user,send-email,setup-preferences"

# Con rollback
bff g o payment-process --with-rollback

# Con retry
bff g o import-data --with-retry --max-retries 5

# Preview
bff g o my-flow --dry-run
```

**Opciones:**

| Opcion | Descripcion | Default |
|--------|-------------|---------|
| `--steps <steps>` | Pasos del flujo (separados por coma) | |
| `--with-rollback` | Incluir logica de rollback | false |
| `--with-retry` | Incluir logica de retry | false |
| `--max-retries <n>` | Numero maximo de reintentos | 3 |
| `--dry-run` | Preview sin crear archivos | false |
| `--force` | Sobrescribir archivos existentes | false |

### Generate Adapter

Genera adaptadores para comunicarse con servicios externos.

```bash
# Adapter basico
bff generate adapter user-service
bff g ad user-service

# Con URL base
bff g ad order-service --base-url "http://localhost:3002"

# Con metodos especificos
bff g ad payment-service --methods "getById,charge,refund"

# Con resiliencia
bff g ad external-api --with-retry --with-circuit-breaker

# Preview
bff g ad my-service --dry-run
```

**Opciones:**

| Opcion | Descripcion | Default |
|--------|-------------|---------|
| `-u, --base-url <url>` | URL base del servicio | |
| `-m, --methods <methods>` | Metodos a generar (separados por coma) | getById,getAll,create,update,delete |
| `--timeout <ms>` | Timeout en ms | 5000 |
| `--with-retry` | Incluir logica de retry | false |
| `--with-circuit-breaker` | Incluir circuit breaker | false |
| `--dry-run` | Preview sin crear archivos | false |
| `--force` | Sobrescribir archivos existentes | false |

### Generate Transformer

Genera transformadores para adaptar datos a diferentes formatos.

```bash
# Transformer basico
bff generate transformer user
bff g t user

# Para cliente especifico
bff g t product --client mobile

# Con campos especificos
bff g t order --fields "id,total,status"

# Preview
bff g t my-transformer --dry-run
```

**Opciones:**

| Opcion | Descripcion | Default |
|--------|-------------|---------|
| `--client <type>` | Tipo de cliente (web, mobile, tv) | |
| `--fields <fields>` | Campos a incluir (separados por coma) | |
| `--dry-run` | Preview sin crear archivos | false |
| `--force` | Sobrescribir archivos existentes | false |

### Generate Cache

Genera estrategias de cache.

```bash
# Cache basico
bff generate cache user
bff g c user

# Con estrategia especifica
bff g c product --strategy stale-while-revalidate

# Con TTL custom
bff g c session --ttl 3600

# Con tags para invalidacion
bff g c order --tags "orders,user-data"

# Preview
bff g c my-cache --dry-run
```

**Opciones:**

| Opcion | Descripcion | Default |
|--------|-------------|---------|
| `--strategy <strategy>` | Estrategia (cache-aside, write-through, stale-while-revalidate) | cache-aside |
| `--ttl <seconds>` | TTL por defecto | 300 |
| `--tags <tags>` | Tags para invalidacion (separados por coma) | |
| `--dry-run` | Preview sin crear archivos | false |
| `--force` | Sobrescribir archivos existentes | false |

### Generate Endpoint

Genera endpoints HTTP para el BFF.

```bash
# Endpoint con agregador
bff generate endpoint /api/dashboard --aggregator dashboard
bff g e /api/dashboard -a dashboard

# Endpoint con orquestador
bff g e /api/checkout -o checkout --method POST

# Endpoint con autenticacion
bff g e /api/profile -a user-profile --auth

# Preview
bff g e /api/test --dry-run
```

**Opciones:**

| Opcion | Descripcion | Default |
|--------|-------------|---------|
| `-a, --aggregator <name>` | Agregador a usar | |
| `-o, --orchestrator <name>` | Orquestador a usar | |
| `-m, --method <method>` | Metodo HTTP | GET |
| `--auth` | Requiere autenticacion | false |
| `--dry-run` | Preview sin crear archivos | false |
| `--force` | Sobrescribir archivos existentes | false |

## Estructura Generada

```
src/
├── aggregators/
│   ├── {name}.aggregator.ts
│   └── __tests__/
│       └── {name}.aggregator.test.ts
├── orchestrators/
│   ├── {name}.orchestrator.ts
│   └── __tests__/
│       └── {name}.orchestrator.test.ts
├── adapters/
│   ├── {name}.adapter.ts
│   └── __tests__/
│       └── {name}.adapter.test.ts
├── transformers/
│   └── {name}.transformer.ts
├── cache/
│   └── {name}.cache.ts
└── routes/
    └── {name}.routes.ts
```

## Desarrollo

```bash
# Clonar repositorio
git clone https://github.com/GlobalS1/globalsone-bff-cli.git
cd globalsone-bff-cli

# Instalar dependencias
npm install

# Build
npm run build

# Desarrollo (watch mode)
npm run dev

# Link local para testing
npm link
```

## Licencia

MIT
