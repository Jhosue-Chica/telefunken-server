# Telefunken Game Server

Servidor backend para el juego Telefunken, desarrollado con Node.js, Express y Firebase. Este servidor gestiona las mesas de juego, partidas y registro de victorias.

## Estructura del Proyecto

```plaintext
telefunken-server/
├── config/
│   └── firebase.js          # Configuración de Firebase
├── routes/
│   ├── mesaRoutes.js        # Rutas para mesas de juego
│   ├── partidaRoutes.js     # Rutas para partidas
│   └── winsRoutes.js        # Rutas para registro de victorias
├── controllers/
│   ├── mesaController.js    # Controlador de mesas
│   ├── partidaController.js # Controlador de partidas
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
- `PATCH /api/mesas/:id/estado` - Actualizar estado de la mesa
```json
// POST /api/mesas
{
  "cant_jugadores": 4,
  "cant_barajas": 2,
  "cod_sala": "SALA123"
}

// PATCH /api/mesas/:id/estado
{
  "estado": "en_juego"
}
```

### Partidas
- `GET /api/partidas` - Obtener todas las partidas
- `GET /api/partidas/:id` - Obtener una partida específica
- `POST /api/partidas` - Crear nueva partida
- `PATCH /api/partidas/:id/ronda` - Actualizar ronda de una partida
```json
// POST /api/partidas
{
  "id_mesa": "ID_MESA",
  "jugadores": [
    {
      "id": "jugador1",
      "nombre": "Juan"
    },
    {
      "id": "jugador2",
      "nombre": "María"
    }
  ]
}

// PATCH /api/partidas/:id/ronda
{
  "jugador_id": "jugador1",
  "ronda": "1/3",
  "valores": ["30", "40", "25", "35"],
  "puntuacion": 130
}
```

### Victorias
- `GET /api/wins` - Obtener todas las victorias
- `POST /api/wins` - Registrar victoria
```json
{
  "mesa_ref": "mesas/ID_MESA",
  "jugador": {
    "id": "jugador1",
    "nombre": "Juan"
  },
  "puntuacion": 150
}
```

## Estructura de la Base de Datos

### Colección: mesas
```javascript
{
  cant_jugadores: number,
  cant_barajas: number,
  cod_sala: string,
  estado: string, // 'disponible' | 'en_juego'
  jugadores: array,
  fecha_creacion: timestamp,
  ultima_actualizacion: timestamp
}
```

### Colección: partidas
```javascript
{
  id_mesa: reference, // Referencia a documento en colección mesas
  fecha_creacion: timestamp,
  estado: string, // 'en_curso' | 'terminada'
  jugadores: {
    [jugador_id]: {
      nombre: string,
      puntuacion_total: number,
      rondas: {
        "1/3": {
          valores: array[4],
          puntuacion: number
        },
        "2/3": { ... },
        "1/4": { ... },
        "2/4": { ... },
        "1/5": { ... },
        "2/5": { ... },
        "Escalera": { ... }
      }
    }
  }
}
```

### Colección: wins
```javascript
{
  mesa_ref: reference, // Referencia a documento en colección mesas
  jugador: {
    id: string,
    nombre: string
  },
  puntuacion: number,
  fecha: timestamp
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
