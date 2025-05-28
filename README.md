#  Todo App - Ionic + Angular

Una aplicación móvil desarrollada con **Ionic + Angular** que permite gestionar tareas y categorías de forma práctica e intuitiva. Incluye integración con **Firebase Remote Config** para habilitar funciones dinámicamente.

---

## Funcionalidades principales

- Crear, editar y eliminar tareas
- Asignar tareas a categorías
- Filtrar y ordenar tareas por fecha, estado o categoría
- Confirmación antes de marcar una tarea como completada
- Conteo de tareas pendientes y completadas
- Configuración remota con Firebase Remote Config
- Interfaz responsive con Ionic Grid y FontAwesome
- Borrar todas las tareas (modo desarrollo)

---

## Tecnologías usadas

- **Ionic Framework** 8.5.7
- **Angular** 16+
- **Firebase** (Remote Config)
- **FontAwesome** (iconos)
- **HTML5 + SCSS**
- **LocalStorage** para persistencia

---

## 📱 Instalación y ejecución local

### 1. Clona el repositorio

```bash
git clone https://github.com/jdarredondo21/todo-acc.git
cd todo-acc
```

### 2. Instala dependencias

```bash
npm install
```

### 3. Ejecuta la app en navegador

```bash
ionic serve
```

---

## Compilación para Android/iOS

### Android

```bash
ionic build
ionic cap add android
ionic cap open android
```

Luego compila y genera el `.apk` desde Android Studio.

### iOS (en Mac)

```bash
ionic build
ionic cap add ios
ionic cap open ios
```

Luego compila y genera el `.ipa` desde Xcode.

---

## Firebase Remote Config

Para que la app active o desactive funciones (como categorías), se conecta a **Firebase Remote Config**.

Parámetro usado:

- `show_categories` (booleano): muestra u oculta el selector de categorías dinámicamente.

---

## Estructura del proyecto

```
src/
├── app/
│   ├── home/               # Página principal
│   ├── services/           # Servicios (task.service.ts, category.service.ts)
│   ├── models/             # Modelos de datos (Task, Category)
│   └── environments/       # Configuración de entorno
├── assets/
└── theme/
```

---

## Notas técnicas

- Código limpio, estructurado y comentado.
- Validaciones para evitar tareas vacías o repetidas.
- Uso de observables y promesas (`async/await`) para una mejor gestión de datos.
- Diseño responsive para móvil y escritorio.
- Integración de **FontAwesome** vía CDN.

---

## Autor

**jdarredondo21**

Desarrollado como prueba técnica para desarrollador/a Mobile con Ionic + Angular.

---