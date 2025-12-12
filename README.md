# 🍺 Proyecto Bar Pirata  
**Aplicación Web Full-Stack II – Evaluación Académica**

**Proyecto Bar Pirata** es una aplicación web full-stack desarrollada con fines exclusivamente académicos, cuyo objetivo es aplicar y consolidar conocimientos de desarrollo web, consumo de APIs REST, autenticación y modelado de datos.

La aplicación simula el funcionamiento de un e-commerce de bar temático, permitiendo a los usuarios interactuar con productos, gestionar un carrito de compras y generar órdenes mediante una arquitectura cliente-servidor.


## 🎯 Objetivo Académico

El objetivo principal del proyecto es evaluar:

- Implementación de un frontend moderno con React  
- Consumo de una API REST externa  
- Autenticación basada en token  
- Persistencia y gestión de datos  
- Separación de responsabilidades frontend / backend  
- Uso de control de versiones  


## 🚀 Tecnologías Utilizadas

### 🖥️ Frontend
- React  
- Vite  
- JavaScript (ES6+)  
- HTML5  
- CSS3  
- Bootstrap  
- Fetch API  

### ⚙️ Backend
- Xano (Backend as a Service)  
- API REST  
- Autenticación mediante Token (JWT)  

### 🗄️ Base de Datos
- Xano Database  
- Entidades principales:
  - usuarios  
  - productos  
  - categorías  
  - carrito  
  - items_carrito  
  - órdenes  

### 🛠️ Herramientas
- Git & GitHub  
- Postman  
- Visual Studio Code  
- Firebase Hosting (deploy del frontend)  


## 🧱 Arquitectura del Sistema

El proyecto utiliza una arquitectura cliente–servidor desacoplada:

Frontend (React + Vite)
│
│ HTTP / JSON
▼
Backend (Xano – API REST)
│
▼
Base de Datos (Xano DB)


- El frontend consume los endpoints del backend.  
- El backend centraliza la lógica de negocio.  
- El token JWT controla el acceso a rutas protegidas.  


## 🔐 Funcionalidades Implementadas

- Registro de usuarios  
- Inicio de sesión con autenticación por token  
- Persistencia de sesión  
- Listado de productos  
- Visualización por categorías  
- Agregar productos al carrito  
- Actualización de cantidades  
- Cálculo del total del carrito  
- Creación de órdenes de compra  


## 📁 Estructura del Proyecto (Frontend)

/src
├── components
├── pages
├── services
├── context
├── App.jsx
└── main.jsx



## ⬇️ Clonar, Instalar y Ejecutar el Proyecto

### 🔹 Requisitos Previos
- Node.js v18 o superior  
- npm  
- Git  
- Navegador web actualizado  


### 🔹 Clonar el Repositorio

git clone https://github.com/OHernandezB/Bar-Pirata.git   
cd Proyecto-Bar-Pirata


### 🔹 Instalar Dependencias

npm install 

Este comando instalará todos los módulos necesarios definidos en `package.json`.


### 🔹 Configuración de Variables de Entorno

Crear un archivo `.env` en la raíz del proyecto con la siguiente estructura:

VITE_API_URL=https://x8ki-letl-twmt.n7.xano.io/workspace/127801-0/api

Esta URL corresponde al backend configurado en Xano.


### 🔹 Ejecutar en Modo Desarrollo

npm run dev

La aplicación se ejecutará en:

http://localhost:5173

## 🔌 Endpoints Utilizados (Resumen)

| Método | Endpoint | Descripción |
|------|---------|------------|
| POST | /auth/login | Inicio de sesión |
| POST | /auth/signup | Registro |
| GET | /productos | Listar productos |
| GET | /categorias | Listar categorías |
| POST | /carrito/agregar | Agregar al carrito |
| GET | /carrito | Obtener carrito |
| POST | /orden | Crear orden |


## 🧪 Pruebas

Las pruebas del sistema se realizaron directamente desde el **entorno de pruebas integrado de Xano**, utilizando las herramientas internas del backend para:

- Validar el funcionamiento de los endpoints  
- Comprobar la autenticación mediante token  
- Verificar la persistencia de datos en la base de datos  
- Confirmar el correcto manejo de respuestas y errores  

## 🎓 Contexto Académico

Este proyecto fue desarrollado exclusivamente con fines académicos como parte de la carrera de **Ingeniería en Informática**, cumpliendo con los criterios de evaluación establecidos en la asignatura.


## 📌 Estado del Proyecto

🟢 Finalizado para evaluación académica

## 👩‍💻 Autores

- **Pamela Albanese** – Estudiante de Ingeniería en Informática  
- **Omar Hernandez** – Estudiante de Ingeniería en Informática  








