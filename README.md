# Habits Now (PWA)

Una aplicación web progresiva y offline-first diseñada para el seguimiento de hábitos diarios con un diseño oscuro y acentos de neón vibrantes.

## 🚀 Tecnologías Principales
- **Framework:** Next.js 16 (App Router) + TypeScript
- **Estilos:** Tailwind CSS v4 + Lucide Icons + Headless UI
- **PWA:** `@ducanh2912/next-pwa` (Offline cache y Service Workers)
- **Base de Datos & Auth:** Supabase (PostgreSQL) con `@supabase/ssr`

## 📦 Estructura del Proyecto
- `src/app/`: Rutas, Layout principal y vistas (Dashboard, Login).
- `src/components/`: Componentes UI reutilizables (`BottomBar`, `HabitCard`, `JournalModal`).
- `src/lib/`: Utilidades principales (Cliente Supabase, diccionarios i18n).
- `src/types/`: Definiciones de TypeScript generadas a partir del esquema SQL.
- `src/dictionaries/`: Archivos JSON para la internacionalización (`es`, `en`).
- `src/proxy.ts`: Middleware de Next.js para gestionar sesiones y redirecciones.

## 🛠️ Configuración Local
1. Clona el repositorio.
2. Asegúrate de estar usando Node.js v20+.
3. Ejecuta `npm install` para instalar dependencias.
4. Configura tus variables de entorno en `.env.local`:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=tu_url_de_supabase
   NEXT_PUBLIC_SUPABASE_ANON_KEY=tu_anon_key
   ```
5. Ejecuta el servidor de desarrollo en modo Webpack (requerido para PWA):
   ```bash
   npm run dev
   ```

Para detalles sobre la lógica interna de estado, sincronización y flujos, consulta [ARCHITECTURE.md](ARCHITECTURE.md).
