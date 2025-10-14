# Resumen de Refactorización JavaScript

## Lo Que Se Hizo

Se completó exitosamente la refactorización del código JavaScript inline de `consultor_integral.html` hacia archivos externos modulares.

## Archivos Creados

### 1. `webapp/static/config.js`
- **Propósito**: Configuración y definiciones de pasos
- **Contenido**: Array de configuración del wizard de 4 pasos
- **Tamaño**: ~200 líneas

### 2. `webapp/static/validation.js`
- **Propósito**: Validación de formularios y manejo de eventos
- **Funciones Clave**:
  - `attachEventListeners()` - Adjunta manejadores de click a botones e inputs
  - `validateStep()` - Valida el paso actual antes de proceder
  - `validateDemographicsStep()` - Asegura que al menos un empleado sea ingresado
  - `updateProporcionInputs()` - Muestra/oculta inputs de proporción
  - `updateTotalPorcentaje()` - Actualiza el display del total de porcentajes
- **Tamaño**: ~180 líneas

### 3. `webapp/static/api.js`
- **Propósito**: Capa de comunicación con APIs
- **Funciones Clave**:
  - `calculateConsumption()` - Cálculo inicial de consumo
  - `recalcularConsumo()` - Recalcula para referencias cambiadas
  - `saveReporte()` - Guarda portafolio en la base de datos
- **Tamaño**: ~200 líneas

### 4. `webapp/static/ui-handlers.js`
- **Propósito**: Interacciones de UI y utilidades
- **Funciones Clave**:
  - `updateReferenceImage()` - Actualiza imágenes de referencias de productos
  - `updateDispenserImage()` - Actualiza imágenes de dispensadores
  - `handleReferenceClick()` - Maneja clicks en botones de referencia
  - `handleDispenserClick()` - Maneja clicks en botones de dispensador
  - `generatePDF()` - Crea reporte PDF
  - Inicialización DOMContentLoaded
- **Tamaño**: ~170 líneas

## Archivos Modificados

### `webapp/templates/consultor_integral.html`
- **Antes**: ~1,556 líneas (1,500+ líneas de JavaScript inline)
- **Después**: 71 líneas (HTML limpio con referencias a scripts externos)
- **Reducción**: ~95% más pequeño

### Archivos Existentes (Ya Existían, Sin Cambios Necesarios)
- `webapp/static/Portfolio.js` - Gestión de estado y lógica de negocio
- `webapp/static/Steps.js` - Renderizado de UI y navegación

## Orden de Carga de Módulos

El HTML ahora carga los scripts en este orden específico (importante para las dependencias):

1. `config.js` - Definiciones de pasos (requerido por todos los otros módulos)
2. `Portfolio.js` - Estado global y lógica de negocio
3. `Steps.js` - Funciones de renderizado de UI
4. `validation.js` - Validación y manejadores de eventos
5. `api.js` - Comunicación con APIs
6. `ui-handlers.js` - Manejadores de eventos e inicialización

## Beneficios de Esta Refactorización

### 1. **Mantenibilidad**
- Cada módulo tiene una responsabilidad única y clara
- Más fácil localizar y arreglar bugs
- Los cambios en un área no afectan a otras

### 2. **Legibilidad**
- La plantilla HTML ahora está limpia y es fácil de entender
- La lógica JavaScript está organizada por función
- Mejor organización y documentación del código

### 3. **Reusabilidad**
- Los módulos pueden ser reutilizados en otras plantillas
- Las funciones están aisladas y son testeables
- Más fácil extender funcionalidad

### 4. **Rendimiento**
- El navegador puede cachear archivos JS externos
- Tamaño de página reducido (71 líneas vs 1,556 líneas)
- Cargas de página subsecuentes más rápidas

### 5. **Colaboración**
- Múltiples desarrolladores pueden trabajar en diferentes módulos
- Diffs de git más claros y revisiones de código mejores
- Más fácil incorporar nuevos desarrolladores

## Checklist de Pruebas

Antes de desplegar, verificar:
- [ ] La página carga sin errores de consola
- [ ] Los 4 pasos se muestran correctamente
- [ ] La navegación de pasos (Siguiente/Anterior) funciona
- [ ] La validación de formularios se activa apropiadamente
- [ ] La selección de productos resalta correctamente
- [ ] La selección de tipos de público y proporciones funciona
- [ ] El cálculo de nivel de tráfico es preciso
- [ ] Las llamadas a API tienen éxito (cálculo de consumo)
- [ ] El dropdown de referencias carga con Selectize
- [ ] El cambio de referencia dispara el recálculo
- [ ] Las imágenes se actualizan cuando se hace click en referencias/dispensadores
- [ ] La generación de PDF funciona
- [ ] El portafolio se guarda en la base de datos

## Mejoras Futuras

Considerar estas mejoras:
1. Convertir a módulos ES6 (import/export) para mejor gestión de dependencias
2. Agregar TypeScript para seguridad de tipos
3. Implementar pruebas unitarias para funciones de lógica de negocio
4. Agregar comentarios JSDoc para mejor soporte de IDE
5. Empaquetar y minificar archivos JS para producción
6. Agregar límites de error y mejor manejo de errores
7. Implementar gestión de estado con una librería (ej., Redux)

## Plan de Rollback

Si surgen problemas, puedes hacer rollback:
1. Restaurando el `consultor_integral.html` original del historial de git
2. El archivo antiguo tenía todo el JavaScript inline, por lo que es auto-contenido

## Diccionario de Variables Globales

Todas las variables globales están definidas en `Portfolio.js` y son compartidas entre todos los módulos:

### Variables de Estado Principal

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `companyData` | Object | Almacena toda la información de la empresa del usuario recopilada en el wizard |
| `companyData.sector` | String | Sector de la empresa (ej: "Oficinas / Corporativo", "Salud", etc.) |
| `companyData.size` | String | Tamaño de la empresa (ej: "11-50", "51-200", "200+") |
| `companyData.numMujeres` | Number | Número de empleadas mujeres |
| `companyData.numHombres` | Number | Número de empleados hombres |
| `companyData.diasLaborales` | Number | Días laborales por mes (1-31) |
| `companyData.horasLaborales` | Number | Horas laborales por día (1-24) |
| `companyData.tipoPublico` | Array | Lista de tipos de público seleccionados (ej: ["administrativo", "operativo"]) |
| `companyData.proporciones` | Object | Proporciones de distribución de público cuando hay múltiples tipos (ej: {administrativo: 60, operativo: 40}) |
| `companyData.numVisitantes` | Number | Número de visitantes diarios (usado para público "flotante") |
| `companyData.products` | Array | Lista de productos seleccionados (ej: ["Papel Higiénico", "Toallas de Manos", "Jabones y Gel"]) |
| `companyData.bathroomSegment` | String | Segmento de baños seleccionado (ej: "Essential", "Restroom Plus", "Wow Factor", "Higiene Crítica") |
| `companyData.selectedReferences` | Object | Referencias de productos seleccionadas por producto (ej: {"Papel Higiénico": "202581"}) |

### Variables de Datos

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `productData` | Object | Datos de recomendaciones cargados desde Portfolio.xlsx vía API. Estructura: `productData[producto][segmento][nivelTráfico]` |
| `consumptionData` | Object | Resultados de cálculo de consumo por producto (ej: {"Papel Higiénico": {consumo_mensual: 45, referencia_usada: "202581"}}) |

### Variables de Control del Wizard

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `currentStep` | Number | Índice del paso actual del wizard (0-3) |
| `selectedProducts` | Array | Productos seleccionados temporalmente durante el paso de selección |
| `selectedPublicTypes` | Array | Tipos de público seleccionados temporalmente durante el paso de selección |
| `selectedBathroomSegment` | String | Segmento de baños seleccionado temporalmente durante el paso de selección |

### Variables de Configuración

| Variable | Tipo | Descripción |
|----------|------|-------------|
| `steps` | Array | Array de objetos que definen cada paso del wizard (definido en config.js) |
| `steps[i].id` | String | Identificador único del paso (ej: "company-sector", "demographics") |
| `steps[i].title` | String | Título completo mostrado en el encabezado |
| `steps[i].shortTitle` | String | Título corto mostrado en la barra lateral |
| `steps[i].content` | String | HTML del contenido del paso |

### Niveles de Tráfico Calculados

Los valores posibles para `trafficLevel` (calculados por `determineTrafficLevel()`):
- `"Tráfico Bajo"` - Menos de 40 en el índice de tráfico ajustado
- `"Tráfico Medio"` - 40-179 en el índice de tráfico ajustado
- `"Tráfico Alto"` - 180-449 en el índice de tráfico ajustado
- `"Tráfico Pico"` - 450+ en el índice de tráfico ajustado

**Fórmula del índice de tráfico**: `empleados_totales × factor_intensidad_horaria × factor_frecuencia_mensual`

### Tipos de Público

Valores posibles para elementos en `selectedPublicTypes` y `companyData.tipoPublico`:
- `"administrativo"` - Personal de oficina, gerentes, empleados de escritorio
- `"operativo"` - Personal de producción, técnicos, trabajadores de campo
- `"flotante"` - Visitantes, clientes, personal temporal o externo

### Segmentos de Baños

Valores posibles para `selectedBathroomSegment` y `companyData.bathroomSegment`:
- `"Essential"` - Funcionalidad básica y costo-eficiente
- `"Restroom Plus"` - Balance entre experiencia, calidad y costos
- `"Wow Factor"` - Imagen y experiencia premium
- `"Higiene Crítica"` - Máximos estándares de higiene

## Notas

- Todos los archivos JS externos usan scope global (aún no hay sistema de módulos)
- Las variables globales están definidas en `Portfolio.js`
- Las funciones están disponibles globalmente para los manejadores onclick
- La plantilla todavía usa sintaxis Jinja2 `{{ url_for() }}`, convertida a `/static/` en archivos externos
