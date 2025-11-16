# Safety Cloud - Instrucciones de Configuración

## Descripción

Safety Cloud es una aplicación web que ofrece recursos digitales descargables relacionados con Seguridad Industrial, Salud Laboral, Protección Civil, Medio Ambiente y Sistemas de Gestión Industrial.

## Características Principales

- Autenticación con correo y contraseña mediante Supabase
- Búsqueda y filtrado avanzado de recursos
- Vistas en cuadrícula y tabla
- Sistema de descargas con seguimiento
- Calificaciones de recursos
- Panel de administración para gestión CRUD
- Tema claro/oscuro
- Diseño responsive y futurista
- Perfiles de usuario personalizables

## Configuración Inicial

### 1. Variables de Entorno

Crea un archivo `.env` en la raíz del proyecto con las siguientes variables:

```
VITE_SUPABASE_URL=tu_url_de_supabase
VITE_SUPABASE_ANON_KEY=tu_clave_anonima_de_supabase
```

Estas credenciales se encuentran en tu proyecto de Supabase en: Settings > API

### 2. Base de Datos

La migración de base de datos ya fue aplicada e incluye:

- Tabla `user_profiles` - Perfiles de usuario extendidos
- Tabla `user_preferences` - Preferencias de contenido por usuario
- Tabla `recursos` - Recursos descargables
- Tabla `descargas` - Seguimiento de descargas
- Tabla `calificaciones` - Calificaciones de recursos
- Tabla `blog_posts` - Posts del blog (para futura implementación)

Todas las tablas tienen Row Level Security (RLS) habilitadas.

### 3. Storage de Supabase

Para las imágenes de los recursos, debes crear el siguiente bucket en Supabase Storage:

1. Ve a Storage en tu dashboard de Supabase
2. Crea un bucket público llamado `recursos-publicos`
3. Dentro de este bucket, crea una carpeta llamada `assets-img`
4. Sube las siguientes imágenes (1502x1127 px cada una):
   - aplicación-móvil 1502 1127.png
   - aplicación-multiplataforma 1502 1127.png
   - archivo-imagen_1502x1127.png
   - archivo-video_1502x1127.png
   - documento-excel_1502x1127.png
   - documento-pdf 1502 1127.png
   - documento-powerpoint 1502 1127.png
   - documento-word 1502 1127.png
   - enlace-youtube_1502x1127.png
   - página-web 1502x1127.png
   - recursos-varios 1502 1127.png

### 4. Instalar Dependencias

```bash
npm install
```

### 5. Ejecutar en Desarrollo

```bash
npm run dev
```

### 6. Compilar para Producción

```bash
npm run build
```

## Estructura de la Aplicación

### Para Usuarios Públicos

- Pueden navegar y ver todos los recursos
- Necesitan registrarse/iniciar sesión para descargar recursos
- Pueden usar filtros y búsqueda sin autenticación

### Para Usuarios Registrados

- Acceso completo a descargas de recursos
- Pueden calificar recursos descargados
- Perfil personalizable con preferencias
- Seguimiento de descargas

### Para Administradores

Para convertir un usuario en administrador, debes actualizar manualmente su rol en la base de datos:

1. Ve a la tabla `user_profiles` en Supabase
2. Encuentra al usuario que quieres hacer administrador
3. Cambia su campo `role` de `'usuario'` a `'administrador'`

Los administradores tienen acceso a:

- Panel de control con estadísticas
- Gestión completa de recursos (CRUD)
- Acceso a `/admin` en la URL

## Rutas de la Aplicación

- `/` - Página principal con recursos
- `/login` - Inicio de sesión
- `/registro` - Registro de nuevos usuarios
- `/perfil` - Perfil de usuario (requiere autenticación)
- `/admin` - Panel de administración (requiere rol de administrador)
- `/nosotros` - Página sobre la organización
- `/recursos` - Vista de recursos (igual que `/`)
- `/apoyo` - Página de apoyo (en construcción)
- `/blog` - Blog (en construcción)

## Tema de Colores

### Tema Oscuro (predeterminado)
- Fondo: #000000
- Superficie: #1a1a1a
- Primario: #0BBEFF
- Texto principal: #FFFFFF
- Texto secundario: #8C8C8C

### Tema Claro
- Fondo: #FFFFFF
- Superficie: #f5f5f5
- Primario: #0BBEFF
- Texto principal: #000000
- Texto secundario: #8C8C8C

## Tipografías

- **Orbitron** - Títulos y slogan
- **Jura** - Texto general
- **Monospace** - Código y claves

## Funcionalidades Avanzadas

### Sistema de Filtros

Los usuarios pueden filtrar recursos por:
- Tipo de recurso
- Área
- Función
- Clasificación
- Modalidad

### Sistema de Descargas

1. Usuario hace clic en "Descargar"
2. Se registra la descarga en la base de datos
3. Se incrementa el contador de descargas
4. Se abre el enlace de descarga
5. Se invita al usuario a calificar el recurso

### Perfiles de Usuario

Los usuarios pueden actualizar:
- Nombre de usuario
- Información personal (nombre completo, CURP, fecha de nacimiento)
- Preferencias de contenido para notificaciones personalizadas

## Consideraciones de Seguridad

- Todas las contraseñas son gestionadas por Supabase Auth
- Row Level Security (RLS) está habilitado en todas las tablas
- Solo los administradores pueden crear/editar/eliminar recursos
- Los usuarios solo pueden ver y editar su propio perfil
- Las descargas y calificaciones están vinculadas al usuario autenticado

## Soporte

Para problemas o preguntas, consulta la documentación de:
- [Supabase](https://supabase.com/docs)
- [React](https://react.dev)
- [Vite](https://vitejs.dev)
