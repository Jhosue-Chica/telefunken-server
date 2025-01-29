# Telefunken Game Server

Servidor backend para el juego Telefunken, desarrollado con Node.js, Express y Firebase. Este servidor gestiona las mesas de juego, jugadores y registro de partidas.

## Estructura del Proyecto

```plaintext
telefunken-server/
├── config/
│   └── firebase.js          # Configuración de Firebase
├── routes/
│   ├── mesaRoutes.js        # Rutas para mesas de juego
│   ├── playerRoutes.js      # Rutas para jugadores
│   └── winsRoutes.js        # Rutas para registro de victorias
├── controllers/
│   ├── mesaController.js    # Controlador de mesas
│   ├── playerController.js  # Controlador de jugadores
│   └── winsController.js    # Controlador de victorias
├── .env                     # Variables de entorno
├── server.js               # Punto de entrada de la aplicación
└── serviceAccountKey.json  # Credenciales de Firebase (no incluido en repo)
```

## Prerequisitos

- Node.js (versión 14.x o superior)
- NPM (versión 6.x o superior)
- Cuenta en Firebase
- Proyecto creado en Firebase

## Instalación

1. Clonar el repositorio:
```bash
git clone [URL_DEL_REPOSITORIO]
cd telefunken-server
```

2. Instalar dependencias:
```bash
npm install
```

3. Configurar Firebase:
   - Ir a la consola de Firebase
   - Crear un nuevo proyecto o seleccionar uno existente
   - Ir a Configuración del Proyecto > Cuentas de servicio
   - Generar nueva clave privada
   - Guardar el archivo como `serviceAccountKey.json` en la raíz del proyecto

4. Crear archivo `.env`:
```env
PORT=3000
```

## Uso

Para iniciar el servidor en modo desarrollo:
```bash
npm run dev
```

Para iniciar el servidor en modo producción:
```bash
npm start
```

## Endpoints API

### Mesas
- `GET /api/mesas` - Obtener todas las mesas
- `POST /api/mesas` - Crear nueva mesa
```json
{
  "cant_jugadores": 4,
  "cant_barajas": 2,
  "cod_sala": "SALA123"
}
```

### Jugadores
- `POST /api/players` - Registrar nuevo jugador
```json
{
  "nombre": "Jugador1"
}
```

### Victorias
- `POST /api/wins` - Registrar victoria
```json
{
  "wins_player": "Jugador1",
  "wins_score": 100,
  "wins_timegame": "2024-01-28T15:00:00Z"
}
```

## Estructura de la Base de Datos

### Colección: mesas
```javascript
{
  idmesa: int,
  cant_jugadores: int,
  cant_barajas: int,
  cod_sala: string
}
```

### Colección: players
```javascript
{
  id_player: int,
  nombre: string
}
```

### Colección: wins
```javascript
{
  id_wins: int,
  wins_player: string,
  wins_score: int,
  wins_timegame: timestamp
}
```

## Seguridad

El archivo `serviceAccountKey.json` contiene credenciales sensibles y no debe ser incluido en el control de versiones. Asegúrate de agregarlo a `.gitignore`:

```plaintext
# .gitignore
node_modules/
.env
serviceAccountKey.json
```

## Scripts Disponibles

- `npm start` - Inicia el servidor
- `npm run dev` - Inicia el servidor con nodemon para desarrollo
- `npm test` - Ejecuta las pruebas (cuando estén implementadas)

## Contribuir

1. Fork el proyecto
2. Crear una nueva rama (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abrir un Pull Request

## Licencia

Este proyecto está licenciado bajo la Licencia MIT - ver el archivo [LICENSE.md](LICENSE.md) para más detalles.