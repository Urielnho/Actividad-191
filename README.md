# WorkSafe

Aplicación móvil local de seguridad y productividad, implementada con React Native 0.86, Expo SDK 57, TypeScript y Expo Router. Interfaz en español para iOS y Android. No utiliza backend, API, Firebase, Supabase, SQLite ni otra base de datos.

## Ejecutar

Requiere Node.js compatible con Expo SDK 57 (desarrollo verificado con Node 24) y npm.

```bash
npm ci
npm start
```

Escanea el QR con Expo Go. La computadora y el teléfono deben poder comunicarse por la red local. Si la red bloquea la conexión, puedes usar `npx expo start --go --tunnel` (Expo puede solicitar instalar su herramienta de túnel).

La primera pantalla siempre es el bloqueo. El botón **Explorar WorkSafe** permite revisar Inicio, Proyectos, Archivos y Configuración usando exclusivamente ejemplos ficticios. Esa vista no autentica, no lee la biblioteca real y no permite importar ni abrir archivos privados. Para utilizar la aplicación completa se necesita biometría disponible y registrada.

```bash
npm run android   # Expo Go en Android conectado o emulador
npm run ios       # simulador iOS, requiere macOS
npm run web       # bloqueo y demostración; no admite biometría ni biblioteca real
```

### Android

1. Instala una versión de Expo Go compatible con SDK 57 o crea el Development Build descrito abajo.
2. Configura un bloqueo del dispositivo y registra una huella o rostro compatible.
3. Abre el proyecto y pulsa **Acceder con huella** o el método detectado.
4. Para un emulador, configura la biometría en sus ajustes y utiliza los controles de huella del emulador para probar coincidencia y error. Esto prueba el flujo del sistema emulado, no un sensor físico.

`Platform.OS` detecta Android automáticamente. Se consulta hardware, registro, métodos soportados y nivel de seguridad; no se presume que exista huella. Android decide qué modalidad presentar cuando hay varias. Se permite biometría de clase 2 o 3 (`biometricsSecurityLevel: 'weak'`) para incluir reconocimiento facial compatible; un simple desbloqueo facial que Android no exponga como biometría no es suficiente. El código/PIN del dispositivo no sustituye la autenticación biométrica de WorkSafe.

### iPhone y limitaciones de Expo Go

Puedes escanear el QR con un iPhone para revisar la interfaz. **Face ID real no funciona en Expo Go**: se muestra un mensaje que solicita un Development Build y nunca se devuelve un éxito simulado. Touch ID se detecta únicamente si el dispositivo lo informa. Si falta hardware o registro, la biblioteca real permanece bloqueada.

En Windows puedes ejecutar Metro y construir iOS mediante EAS en la nube. El simulador iOS y las compilaciones locales de iOS requieren macOS/Xcode.

## Development Build

El proyecto ya incluye `expo-dev-client`, el plugin de `expo-local-authentication`, `NSFaceIDUsageDescription` y perfiles en `eas.json`.

Mensaje configurado:

> WorkSafe utiliza Face ID para proteger tus archivos de trabajo.

Para un iPhone físico necesitas tu cuenta Expo y las credenciales de Apple para firmar y distribuir una compilación de desarrollo. EAS indicará los pasos de registro del dispositivo y firma. Revisa que `com.uriel.worksafe` sea el identificador que deseas utilizar antes de configurar tu proyecto.

```bash
npx eas-cli@latest login
npx eas-cli@latest build:configure
npx eas-cli@latest device:create
npx eas-cli@latest build --profile development --platform ios
```

Instala la compilación en el iPhone siguiendo el enlace de EAS, activa el modo de desarrollador si iOS lo solicita y ejecuta:

```bash
npm run dev
```

Abre ese QR desde el Development Build de WorkSafe. Si cambias permisos o plugins nativos debes reconstruirlo.

Android:

```bash
npx eas-cli@latest build --profile development --platform android
npm run dev
```

El perfil Android produce un APK instalable. Para compilación local con Android SDK/JDK configurados: `npx expo run:android`. Para simulador iOS con EAS: `npx eas-cli@latest build --profile development-simulator --platform ios`; esto no verifica Face ID físico.

No se ha creado ni publicado una compilación firmada en una cuenta externa.

## Funcionalidades

- Pantalla de bloqueo con detección real de Face ID, Touch ID, huella, reconocimiento facial e iris según el dispositivo.
- Cuatro pestañas: Inicio, Proyectos, Archivos y Configuración; pantallas de contratos, documentos, evidencias, carpetas y detalles.
- Proyectos locales con descripción, conteos y fecha de actualización; filtros por documentos, fotos, videos y evidencias.
- Búsqueda de archivos por nombre, descripción y empresa; categorías, filtro de protegidos y orden por fecha, nombre o tamaño.
- Cámara para fotografías, selección de imágenes, videos y documentos mediante selectores nativos. La cámara solicita permiso; el selector moderno de fotos no requiere pedir acceso general a toda la galería.
- Importación con nombre, descripción, categoría, empresa para contratos, proyecto, carpeta y protección biométrica.
- Copia persistente a almacenamiento privado con rutas relativas para soportar cambios del contenedor de iOS.
- Vista previa de imágenes y reproducción local de videos. Los documentos se abren mediante el selector **Abrir en otra aplicación** del sistema (`expo-sharing`); hace falta una aplicación compatible con su formato. Los archivos exportados quedan fuera del control de WorkSafe.
- Creación de carpetas normales o protegidas, cambio de protección y protección heredada por los archivos contenidos. Los enlaces directos al detalle también verifican la protección de su carpeta.
- Eliminación de la copia local sin modificar el original del dispositivo.
- Datos iniciales identificados como **DEMO**. Los archivos ficticios no tienen bytes ni un botón de apertura habilitado; se pueden eliminar. Los proyectos demo pueden utilizarse para probar importaciones reales, identificadas por separado.

## Seguridad y ciclo de vida

`services/biometricService.ts` centraliza todas las llamadas a `expo-local-authentication`. Solo `success === true` concede acceso. Cancelación, errores del sistema, falta de hardware o registro, demasiados intentos y bloqueos temporales muestran mensajes y no conceden acceso. `unlock()` también autentica; no es un bypass.

`context/SecurityContext.tsx` cubre todas las rutas con una pantalla opaca cuando el estado es `inactive` o `background`. La capa privada queda invisible e inaccesible a interacción y accesibilidad. Se activa protección nativa de capturas y del selector de aplicaciones con `expo-screen-capture`; si falla, no se revela el contenido privado.

Cada bloqueo invalida los permisos temporales de archivos y carpetas. Una autenticación que termina después de ir al fondo o bloquear manualmente no puede reabrir la app. La interrupción `inactive` del diálogo biométrico de iOS mantiene la cubierta hasta que el sistema vuelve a `active` y confirma éxito. Los videos dejan de renderizarse al bloquearse.

La navegación se conserva bajo la cubierta para mantener el formulario al regresar del selector de documentos, fotos o cámara. Por eso puede ser necesario desbloquear de nuevo antes de completar una importación. Las opciones **Bloquear al salir** y **Solicitar biometría en archivos protegidos** se muestran activadas y fijas para respetar la protección obligatoria solicitada.

No se guardan huellas, rostros, plantillas biométricas ni un estado de sesión autenticada persistente. El sistema operativo realiza la verificación. No se usa `@expo/fingerprint` para autenticar; puede aparecer indirectamente entre herramientas de compilación de Expo.

La biometría protege el acceso dentro de la aplicación, **no cifra individualmente los archivos**. Los bytes y metadatos se guardan en el contenedor privado de la app, sujeto a la seguridad del sistema operativo. Android tiene desactivado el respaldo automático; iOS tiene desactivada la exposición de documentos por intercambio de archivos. WorkSafe no ofrece sincronización ni recuperación remota. Desinstalar la app o borrar sus datos elimina la biblioteca.

## Almacenamiento y estructura

```text
app/                       Rutas Expo Router
components/                Interfaz y componentes reutilizables
context/                   Sesión biométrica y biblioteca local
hooks/                     Acceso a contextos y permisos de contenido
services/                  Biometría, archivos y JSON local
types/                     WorkFile, WorkProject, WorkFolder
utils/                     Formato y ejemplos demo
tests/                     Pruebas de biometría, ciclo de vida y almacenamiento

Paths.document/WorkSafe/
  contracts/
  documents/
  projects/
  evidence/
  images/
  videos/
  metadata.json
  metadata.backup.json
```

El JSON contiene solo metadatos. La importación espera la copia asíncrona de Expo SDK 57 antes de registrar el archivo. La escritura pequeña de metadatos utiliza copia síncrona, archivo temporal y respaldo de la versión anterior. Si el JSON principal se corrompe se intenta recuperar el respaldo; si ambos fallan se informa del error sin reemplazar la biblioteca por datos demo. El respaldo es una recuperación local de metadatos, no una copia de seguridad completa de archivos.

## Verificación

```bash
npm run typecheck
npm run lint
npm test
npm run check
npx expo install --check
npm run build
```

`npm run build` genera bundles JavaScript/Hermes y recursos para Android, iOS y web en `dist/`. No genera un APK/IPA ni demuestra que un sensor físico funciona; para eso se utiliza el Development Build.

Las pruebas automatizadas usan dobles de los módulos nativos exclusivamente dentro de `tests/`; el código de la aplicación siempre usa la API real. Cubren detección, errores, cancelaciones, Face ID en Expo Go, bloqueo en primer arranque, ciclo de vida, resultados tardíos, recuperación del JSON, importación y rechazo de rutas externas.

Pruebas de aceptación que requieren un teléfono:

1. Autenticar correctamente; cancelar y fallar una verificación sin obtener acceso.
2. Importar foto, video y PDF; crear proyecto y carpeta; cerrar por completo y verificar persistencia al volver a autenticar.
3. Abrir archivo protegido desde Inicio, búsqueda, proyecto y carpeta: nunca debe aparecer su vista previa antes de verificar.
4. Ir a Inicio del teléfono, abrir el selector de aplicaciones y regresar durante una vista previa y durante una autenticación: debe aparecer el bloqueo.
5. Cancelar selectores y permisos; completar una importación después de desbloquear al regresar.
6. Proteger/desproteger carpeta y archivo; verificar herencia, abrir documento externo y eliminar únicamente la copia de WorkSafe.

No había navegador ni dispositivo/emulador conectado durante la implementación; la revisión visual y las pruebas de sensores físicos están pendientes. Consulta `VALIDATION.md` para los resultados de los controles ejecutados y las observaciones de dependencias.

## Referencias de Expo

- [LocalAuthentication y limitación de Face ID en Expo Go](https://docs.expo.dev/versions/latest/sdk/local-authentication/)
- [FileSystem: File, Directory y Paths](https://docs.expo.dev/versions/latest/sdk/filesystem/)
- [Development Builds](https://docs.expo.dev/develop/development-builds/introduction/)
- [Creación de una compilación de desarrollo](https://docs.expo.dev/develop/development-builds/create-a-build/)
