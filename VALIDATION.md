# Verificación de WorkSafe

Controles ejecutados en Windows con Node 24.14.0 y Expo SDK 57:

| Control | Resultado |
| --- | --- |
| TypeScript (`npm run typecheck`) | Sin errores |
| ESLint (`npm run lint`) | Sin errores ni advertencias |
| Jest (`npm test`) | 21 pruebas correctas, 3 suites |
| Expo Doctor (`npm run check`) | 21/21 comprobaciones correctas |
| Dependencias (`npx expo install --check`) | Versiones compatibles |
| Exportación (`npm run build`) | Bundles Android, iOS y web generados en `dist/` |
| Configuración nativa (`npx expo config --type introspect`) | Plugins procesados; permiso de Face ID presente; respaldo Android desactivado |

La exportación compila el código y los recursos; no equivale a compilar/instalar un APK o IPA firmado ni a verificar el comportamiento de los sensores. No había dispositivos conectados en `adb devices` ni navegador conectado para inspección visual. Las pruebas físicas y visuales descritas en README están pendientes.

## Dependencias

`npm audit` reportó 14 entradas de severidad moderada en el árbol de dependencias de Expo. Las causas directas señaladas fueron `decode-uri-component` y `uuid`, con propagación a herramientas y paquetes de Expo. Las correcciones automáticas propuestas por npm incluían versiones mayores incompatibles o retroceder Expo/Router, por lo que no se aplicó `npm audit fix --force`. Conviene revisar futuras actualizaciones compatibles del SDK. Expo Doctor confirma compatibilidad, no ausencia de vulnerabilidades.

## Alcance de las pruebas automáticas

- Detección de huella, rostro e iris y distinción de Touch ID en iOS.
- Rechazo de Face ID en Expo Go, biometría sin registrar y fallos del sistema.
- Cancelación, autenticación incorrecta, bloqueo temporal y éxito real de la API.
- Inicio bloqueado y verificación obligatoria en `unlock()`.
- Bloqueo por `inactive` y `background`, sin apertura automática al regresar.
- Invalidación de resultados tardíos tras bloqueo manual o salida al fondo.
- Cubierta durante el diálogo biométrico nativo.
- Inicialización única de ejemplos, persistencia, recuperación del JSON y error sin sobrescribir datos corruptos.
- Copia a categorías privadas con rutas relativas; rechazo de rutas fuera del contenedor.

Los módulos nativos se reemplazan únicamente dentro de Jest. La app de producción no tiene autenticación simulada.
