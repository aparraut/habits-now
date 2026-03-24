# Arquitectura y Lógica de Flujo - Habits Now

Este documento detalla los flujos lógicos clave del proyecto, sus limitaciones actuales como código base (boilerplate) y la hoja de ruta arquitectónica para mejoras a nivel de producción.

## 1. Sincronización de Datos (Offline-First)
### Estado Actual
La app usa `next-pwa` para cachear recursos estáticos (HTML/CSS/JS) y configuración del manifiesto, lo que permite abrirla sin red y funcionar como app nativa. Sin embargo, las escrituras directas a Supabase requieren conectividad en tiempo real.
### Hoja de Ruta Evolutiva
- **Implementar Base de Datos Local (IndexedDB / Dexie.js):**
  1. Al puntear o modificar un hábito, el guardado de estado debe priorizar la IndexedDB local primero para ofrecer persistencia desconectada.
  2. Implementar una cola (Queue) en IndexedDB para mutaciones que ocurren sin conexión.
  3. Usar **Service Worker Background Sync** para iterar sobre la cola local cuando se detecte el evento `online` del navegador y hacer un volcado batch hacia Supabase de forma invisible.

## 2. Flujo de Autenticación y Rutas Privadas
### Estado Actual
- Arquitectura de soporte para Magic Links y Google OAuth implementada vía componentes SSR de Supabase.
- El archivo `src/proxy.ts` (Next 16) intercepta actualmente las llamadas para refrescar los *tokens* caducados de forma proactiva.
### Hoja de Ruta Evolutiva
- **Protección Estricta por Middleware:** Modificar `proxy.ts` para establecer bloques de acceso. Se debe evaluar la ruta destino y forzar redirecciones automáticas (HTTP 307) a `/login` si no existe la cookie de sesión (`!user`), para restringir completamente los paneles protegidos.

## 3. Estado Optimista (Optimistic UI)
### Estado Actual
El componente interactivo `HabitCard.tsx` mantiene un estado local asíncrono básico.
### Hoja de Ruta Evolutiva
- **Integración de `useOptimistic` (React 19):**
  Al ejecutar acciones en la tarjeta (ej. pulsar un 5 en un hábito), la interfaz se debe colorear *inmediatamente* sin esperar la confirmación de base de datos o red. Si la posterior llamada asíncrona hacia Supabase responde con un error, la UI debe revertir silenciosamente a su valor inicial garantizando cero desincronización de la fuente de verdad.

## 4. Estrategia Híbrida de Obtención de Datos
### Estado Actual
El Panel Principal (`app/page.tsx`) inyecta un mock estático de información (`MOCK_HABITS`) a los componentes clientes.
### Hoja de Ruta Evolutiva
- Fomentar un patrón agresivo de **Server Components**.
- En el ciclo de vida inicial de `/`, el servidor Node.js es quien debe ejecutar las consultas SQL asíncronas para cruzar la tabla `habitos` y los correspondientes `registros_diarios` por la fecha de hoy. Estos datos deben inyectarse a los clientes a través de *props*, resultando en un TTI (Time to Interactive) casi instantáneo y una interfaz cargada desde el milisegundo cero sin *loading spinners*.

## 5. Internacionalización Absoluta (i18n)
### Estado Actual
Diccionarios funcionales en formato JSON. Existencia de heurísticas primitivas en componentes cliente (`window.navigator.language`) para resolver casos límite.
### Hoja de Ruta Evolutiva
- **React Context Universal y Server Headers:** Convertir a `proxy.ts` en la única fuente de verdad, leyendo cabeceras HTTP nativas (`Accept-Language`) o cookies de "preferencia" inyectadas por el usuario. Ese locale debe enviarse al RootLayout quien establecerá un Context Provider, previniendo para siempre el clásico error de hidratación de React por disparidad Server/Client.
