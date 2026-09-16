# Tarea 1 - API con Stored Procedures 

**Nombre y carné de los integrantes:**
Deiner Céspedes Molina - Carné: 2024242294

**Estado de la tarea:**
Finalizada al 100%

**Enlace del video:**
https://youtu.be/H9Me1fxYd00

## 1. Introducción

Esta tarea tiene como objetivo implementar una arquitectura descentralizada donde una aplicación cliente se comunica con una base de datos SQL Server a través de una API REST. Se utilizó la base de datos AdventureWorks, y todas las operaciones (CRUD y búsquedas) se realizan mediante Stored Procedures, siguiendo el principio de separar la lógica de datos de la lógica de la aplicación.

La solución corre completamente sobre Linux (Ubuntu Server 22.04) e incluye:

- SQL Server 2022 corriendo en Linux.
- Base de datos AdventureWorks2022 restaurada.
- API REST desarrollada en Node.js + Express.
- Conexión a la base mediante la librería `mssql`.
- Pruebas realizadas en Postman, ejecutándose desde Windows.

## 2. Requisitos previos

- Una máquina virtual con Ubuntu Server 22.04 LTS.
- Conexión a internet.
- Postman instalado en Windows (o `curl` desde CMD/PowerShell).

## 3. Instalación paso a paso

Clonar el repositorio:

```bash
git clone https://github.com/D31N3R/Tarea1-AdventureWorks-API.git
```

### 3.1 Preparar Ubuntu Server

```bash
sudo apt-get update && sudo apt-get upgrade -y
```

### 3.2 Instalar SQL Server 2022 en Linux

Importar la clave GPG de Microsoft y registrar el repositorio:

```bash
curl -fsSL https://packages.microsoft.com/keys/microsoft.asc | sudo gpg --dearmor -o /usr/share/keyrings/microsoft-prod.gpg
echo "deb [arch=amd64,arm64,armhf signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/ubuntu/22.04/mssql-server-2022 jammy main" | sudo tee /etc/apt/sources.list.d/mssql-server-2022.list
```

Instalar SQL Server:

```bash
sudo apt-get update
sudo apt-get install -y mssql-server
```

Elegir la edición (Developer), aceptar términos y definir la contraseña de `sa`:

```bash
sudo /opt/mssql/bin/mssql-conf setup
```

Verificar que el servicio está corriendo:

```bash
systemctl status mssql-server --no-pager
```

### 3.3 Instalar herramientas de línea de comandos (sqlcmd)

```bash
echo "deb [arch=amd64,arm64,armhf signed-by=/usr/share/keyrings/microsoft-prod.gpg] https://packages.microsoft.com/ubuntu/22.04/prod jammy main" | sudo tee /etc/apt/sources.list.d/mssql-release.list
sudo apt-get update
sudo apt-get install -y mssql-tools18 unixodbc-dev

echo 'export PATH="$PATH:/opt/mssql-tools18/bin"' >> ~/.bashrc
source ~/.bashrc
```

### 3.4 Restaurar AdventureWorks

Descargar el backup:

```bash
sudo mkdir -p /var/opt/mssql/backup
sudo curl -L -o /var/opt/mssql/backup/AdventureWorks2022.bak https://github.com/Microsoft/sql-server-samples/releases/download/adventureworks/AdventureWorks2022.bak
sudo chown mssql:mssql /var/opt/mssql/backup/AdventureWorks2022.bak
```

Restaurar la base de datos (cambiar `PASSWORD` por la contraseña de `sa`):

```bash
sqlcmd -S localhost -U sa -P 'PASSWORD' -C -Q "
RESTORE DATABASE AdventureWorks2022
FROM DISK='/var/opt/mssql/backup/AdventureWorks2022.bak'
WITH
    MOVE 'AdventureWorks2022' TO '/var/opt/mssql/data/AdventureWorks2022.mdf',
    MOVE 'AdventureWorks2022_log' TO '/var/opt/mssql/data/AdventureWorks2022_log.ldf',
    RECOVERY, REPLACE, STATS = 5"
```

### 3.5 Instalar Node.js

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt-get install -y nodejs
node -v
```

### 3.6 Instalar dependencias de la API

```bash
cd codigo
npm install
```

## 4. Configuración de los servicios

### 4.1 Crear los Stored Procedures

Ejecutar el script ubicado en `Script sql/stored_procedures.sql` (cambiar `PASSWORD` por la contraseña real):

```bash
sqlcmd -S localhost -U sa -P 'PASSWORD' -C -i "Script sql/stored_procedures.sql"
```

Verificar que las 5 SPs existan:

```bash
sqlcmd -S localhost -U sa -P 'PASSWORD' -C -d AdventureWorks2022 -Q "SELECT name FROM sys.procedures WHERE name LIKE 'usp_%'"
```

Resultado esperado (entre otras del sistema):

```
usp_DeleteProduct
usp_GetProducts
usp_GetProductsWithCategory
usp_InsertProduct
usp_UpdateProduct
```

### 4.2 Configurar la conexión a la base de datos

El archivo `codigo/.env` controla la conexión (copiar desde `.env.example` y completar):

```bash
cd codigo
cp .env.example .env
nano .env
```

- `DB_USER`: usuario de SQL Server. Ejemplo: `sa`
- `DB_PASSWORD`: password del usuario `sa` (tu password real, no se sube al repo)
- `DB_SERVER`: host de SQL Server. Ejemplo: `localhost`
- `DB_DATABASE`: nombre de la base de datos restaurada. Ejemplo: `AdventureWorks2022`
- `DB_PORT`: puerto de SQL Server. Ejemplo: `1433`
- `PORT`: puerto donde escucha la API. Ejemplo: `3000`

### 4.3 Configurar Postman

Las pruebas se hicieron manualmente en Postman contra `http://localhost:3000`, gracias al reenvío de puertos configurado en la VM (modo NAT, puerto `3000 -> 3000`).

### 4.4 Arrancar la API

```bash
cd codigo
node src/server.js
```

Salida esperada:

```
Servidor corriendo en http://0.0.0.0:3000
Conectado a SQL Server: AdventureWorks2022
```

## 5. Estructura del repositorio

```
Tarea1-AdventureWorks-API/
├── README.md
├── Script sql/
│   └── stored_procedures.sql          <- Los 5 stored procedures (CRUD + select + join)
├── codigo/
│   ├── package.json
│   ├── .env.example
│   └── src/
│       ├── server.js                  <- Punto de entrada de Express
│       ├── config/db.js               <- Conexión a SQL Server
│       ├── routes/productRoutes.js    <- Definición de endpoints
│       └── controllers/productController.js  <- Lógica de cada endpoint
└── proyectos/
    └── adventureworks-api.zip         <- Proyecto completo comprimido (respaldo)
```

## 6. Endpoints de la API

- **GET** `/api/products` -> `usp_GetProducts` — Lista todos los productos (select simple)
- **GET** `/api/products/with-category` -> `usp_GetProductsWithCategory` — Lista productos con su categoría (JOIN)
- **POST** `/api/products` -> `usp_InsertProduct` — Crea un producto nuevo
- **PUT** `/api/products/:id` -> `usp_UpdateProduct` — Actualiza un producto existente
- **DELETE** `/api/products/:id` -> `usp_DeleteProduct` — Elimina un producto

## 7. Datos de prueba

### 7.1 Consultar todos los productos (select simple)

Petición:

```
GET http://localhost:3000/api/products
```

Respuesta (solo se muestra una parte, son 504 productos en total):

```json
[
  {
    "ProductID": 1,
    "Name": "Adjustable Race",
    "ProductNumber": "AR-5381",
    "Color": null,
    "ListPrice": 0,
    "ProductSubcategoryID": null
  }
]
```

### 7.2 Consultar productos con categoría (JOIN)

Petición:

```
GET http://localhost:3000/api/products/with-category
```

Respuesta (parcial):

```json
[
  {
    "ProductID": 680,
    "ProductName": "HL Road Frame - Black, 58",
    "ProductNumber": "FR-R92B-58",
    "ListPrice": 1431.5,
    "SubcategoryName": "Road Frames",
    "CategoryName": "Components"
  }
]
```

### 7.3 Insertar producto

Petición:

```
POST http://localhost:3000/api/products
Content-Type: application/json

{
  "name": "Bola de prueba",
  "productNumber": "TEST-0001",
  "color": "Azul",
  "listPrice": 15.99,
  "subcategoryId": 1
}
```

Respuesta esperada:

```json
{ "NewProductID": 1001 }
```

### 7.4 Actualizar producto

Petición (cambiar `1001` por el `NewProductID` obtenido):

```
PUT http://localhost:3000/api/products/1001
Content-Type: application/json

{
  "name": "Bola de prueba actualizada",
  "color": "Verde",
  "listPrice": 19.99
}
```

Respuesta esperada:

```json
{ "RowsAffected": 1 }
```

### 7.5 Eliminar producto

Petición (cambiar `1001` por el `NewProductID` obtenido):

```
DELETE http://localhost:3000/api/products/1001
```

Respuesta esperada:

```json
{ "RowsAffected": 1 }
```

> **Nota:** solo se eliminan productos creados durante las pruebas. Los productos originales de AdventureWorks tienen relaciones con otras tablas (ventas, inventario) y borrarlos puede fallar por integridad referencial.

## 8. Autor

- **Nombre:** Deiner Céspedes Molina
- **Carné:** 2024242294
- **Curso:** Bases de Datos 2 - Tarea 1
- **Repositorio:** https://github.com/D31N3R/Tarea1-AdventureWorks-API
