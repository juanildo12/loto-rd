# LOTO RD - Aplicación de Análisis Estadístico

Aplicación web para analizar los sorteos del Loto de LEIDSA (República Dominicana).

## Características

- 📊 **Estadísticas**: Frecuencia de números, números calientes/fríos, distribución pares/impares
- 🎲 **Generador**: Genera combinaciones basadas en estrategias (aleatorio, números frecuentes, etc.)
- 📋 **Resultados**: Historial de sorteos con filtro por tipo de juego
- 🔄 **Scraping**: Actualización de datos desde yelu.do

## Tecnologías

- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- Prisma + SQLite (desarrollo) / PostgreSQL (producción)
- Recharts (gráficos)

## Inicio Rápido

```bash
# 1. Instalar dependencias
npm install

# 2. Generar cliente de Prisma y crear base de datos
npx prisma generate
npx prisma db push

# 3. Iniciar el servidor
npm run dev
```

La app estará en http://localhost:3000

## Configuración

### Desarrollo (SQLite - sin instalación)
Ya configurado por defecto. La base de datos se crea automáticamente en `prisma/dev.db`

### Producción (PostgreSQL)
1. Crea una cuenta gratuita en [Neon](https://neon.com) o [Supabase](https://supabase.com)
2. Actualiza `prisma/schema.prisma`:

```prisma
datasource db {
  provider = "postgresql"
  url      = env("DATABASE_URL")
}
```

3. Actualiza el archivo `.env`:

```env
DATABASE_URL="postgresql://user:password@host:5432/database"
```

4. Regenera y haz push:

```bash
npx prisma generate
npx prisma db push
```

## Uso

1. **Importar datos**: Ve a `/resultados` y haz clic en "Actualizar" para scrapear datos de yelu.do
2. **Ver estadísticas**: Navega a `/estadisticas` para ver gráficos y análisis
3. **Generar números**: Usa `/generador` para crear combinaciones

## Despliegue en Vercel

1. Sube el proyecto a GitHub
2. Crea un proyecto en [Vercel](https://vercel.com)
3. Conecta tu repositorio
4. Agrega la variable de entorno `DATABASE_URL` (usando Neon o Supabase)
5. Deploy automático

## Estructura del Proyecto

```
src/
├── app/
│   ├── api/
│   │   ├── draws/       # API de sorteos
│   │   ├── scrape/      # API de scraping
│   │   ├── stats/      # API de estadísticas
│   │   └── generate/   # API de generación
│   ├── resultados/      # Página de resultados
│   ├── estadisticas/   # Página de estadísticas
│   └── generador/      # Página del generador
├── components/         # Componentes React
├── lib/
│   ├── db.ts           # Conexión a Prisma
│   ├── scraper.ts     # Lógica de scraping
│   └── statistics.ts   # Funciones estadísticas
└── types/              # Tipos TypeScript
```

## Juegos Soportados

| Juego | Números | Bono |
|-------|---------|------|
| Loto | 6 del 1-40 | - |
| MAS | 6 del 1-40 | 1 del 1-12 |
| Supermas | 6 del 1-40 | 2 Bonos (1-12, 1-15) |

## Nota Legal

Esta aplicación es solo para fines informativos y de entretenimiento. 
Las loterías son juegos de azar. No garantizamos ganancias.
