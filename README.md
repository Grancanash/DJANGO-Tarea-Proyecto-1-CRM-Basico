# 🚀 BASIC_CRM - Sistema de Gestión Comercial

Este es un **CRM Básico** desarrollado como proyecto para la formación en **ConquerBlocks**. Es una aplicación Full Stack que utiliza **Django** para el backend y **React** para el frontend, diseñada para gestionar clientes, empresas e interacciones comerciales de forma eficiente.

## 🔗 Demo En Vivo
Puedes probar la aplicación aquí: [https://crm.grancanash.es](https://crm.grancanash.es)  
*Los datos se resetean automáticamente cada día a las 07:00 AM (España).*

### 🔑 Credenciales para la Demo:
- **Usuario:** `vendedor_1`
- **Contraseña:** `basic_crm`

---

## 🛠️ Tecnologías Utilizadas

### Backend
- **Python / Django 6.0**: Framework principal.
- **Django REST Framework**: Para la creación de la API.
- **PostgreSQL**: Base de datos relacional.
- **JWT (SimpleJWT)**: Autenticación segura mediante tokens.
- **Docker**: Containerización completa del entorno.

### Frontend
- **React / TypeScript**: Interfaz de usuario dinámica y tipada.
- **Tailwind CSS v4**: Framework de estilos de última generación.
- **daisyUI**: Componentes de interfaz profesionales.
- **Lucide React**: Set de iconos minimalistas.
- **Recharts**: Visualización de estadísticas y métricas.

---

## ✨ Funcionalidades Clave

- ✅ **Gestión de Clientes & Empresas**: CRUD completo con relaciones inteligentes.
- ✅ **Historial de Actividad**: Registro inmutable de llamadas, correos y reuniones.
- ✅ **Sistema de Tareas**: Agenda dinámica con alertas de tareas vencidas.
- ✅ **Buscador Avanzado**: Filtrado en tiempo real con *Debouncing* para optimizar el rendimiento.
- ✅ **Dashboard Estadístico**: Gráficos de distribución de cartera y resumen de trabajo diario.
- ✅ **Exportación de Datos**: Generación y descarga de archivos CSV.
- ✅ **Seguridad**: Filtrado de datos por Agente comercial y acceso restringido mediante JWT.

---

## 🏗️ Instalación y despliegue

Si tienes Docker instalado, puedes levantar el proyecto completo con un solo comando:

1. Clona el repositorio.
2. Crea un archivo `.env` basado en el código de configuración.
3. Ejecuta:
   ```bash
   docker compose up -d --build