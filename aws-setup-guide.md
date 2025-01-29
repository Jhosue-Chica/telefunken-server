# Guía de Configuración: Servidor Express en AWS EC2

## 1. Crear Instancia EC2

### 1.1 Acceso a AWS
1. Inicia sesión en la consola AWS (https://aws.amazon.com)
2. En el menú de servicios, selecciona EC2
3. Click en "Launch Instance"

### 1.2 Configuración de la Instancia
1. **Nombre y tags**
   - Nombre: telefunken-server
   
2. **Selección de AMI**
   - Selecciona "Amazon Linux 2023"
   - Arquitectura: 64-bit (x86)

3. **Tipo de Instancia**
   - Selecciona t2.micro (capa gratuita)

4. **Par de Claves**
   - Click en "Create new key pair"
   - Nombre: telefunken-key
   - Tipo: RSA
   - Formato: .pem
   - Descargar y guardar el archivo .pem en lugar seguro

5. **Configuración de Red**
   - Crear nuevo Security Group
   - Nombre: telefunken-sg
   - Descripción: Security group for Telefunken server
   - Reglas de entrada:
     * SSH - Puerto 22 - Source: My IP
     * HTTP - Puerto 80 - Source: Anywhere
     * Custom TCP - Puerto 3000 - Source: Anywhere

6. **Almacenamiento**
   - Volumen raíz: 8 GB gp2 (predeterminado)

7. Click en "Launch Instance"

## 2. Conectarse a la Instancia

### 2.1 Preparar la Conexión
1. Abrir PowerShell o terminal
2. Navegar a la carpeta donde está el archivo .pem
3. Cambiar permisos del archivo .pem:
```bash
chmod 400 telefunken-key.pem
```

### 2.2 Conectar vía SSH
```bash
ssh -i "telefunken-key.pem" ec2-user@tu-dns-publica
```
Reemplaza "tu-dns-publica" con la DNS pública de tu instancia.

## 3. Configurar el Servidor

### 3.1 Actualizar el Sistema
```bash
sudo yum update -y
```

### 3.2 Instalar Node.js
```bash
curl -fsSL https://rpm.nodesource.com/setup_18.x | sudo bash -
sudo yum install -y nodejs
```

### 3.3 Instalar Git
```bash
sudo yum install git -y
```

### 3.4 Instalar PM2
```bash
sudo npm install pm2 -g
```

## 4. Configurar el Proyecto

### 4.1 Crear Directorio del Proyecto
```bash
mkdir ~/telefunken-server
cd ~/telefunken-server
```

### 4.2 Transferir Archivos del Proyecto
Desde tu máquina local (PowerShell/CMD), ejecuta:
```bash
scp -i "telefunken-key.pem" -r D:\Angular\Avanzada\telefunken-server\* ec2-user@tu-dns-publica:~/telefunken-server/
```

### 4.3 Configurar Variables de Entorno
```bash
cd ~/telefunken-server
nano .env
```
Añadir:
```
PORT=3000
```

### 4.4 Instalar Dependencias
```bash
npm install
```

## 5. Ejecutar la Aplicación

### 5.1 Iniciar con PM2
```bash
pm2 start server.js --name telefunken
```

### 5.2 Configurar Inicio Automático
```bash
pm2 startup
sudo env PATH=$PATH:/usr/bin pm2 startup systemd -u ec2-user --hp /home/ec2-user
pm2 save
```

## 6. Monitoreo y Mantenimiento

### 6.1 Comandos Útiles PM2
```bash
# Ver estado de las aplicaciones
pm2 status

# Ver logs
pm2 logs telefunken

# Reiniciar aplicación
pm2 restart telefunken

# Detener aplicación
pm2 stop telefunken

# Monitoreo en tiempo real
pm2 monit
```

### 6.2 Actualizar la Aplicación
Para actualizar el código:
1. Detener la aplicación:
```bash
pm2 stop telefunken
```

2. Transferir nuevos archivos:
```bash
scp -i "telefunken-key.pem" -r D:\Angular\Avanzada\telefunken-server\* ec2-user@tu-dns-publica:~/telefunken-server/
```

3. Reiniciar la aplicación:
```bash
pm2 restart telefunken
```

## 7. Notas de Seguridad

### 7.1 Archivo serviceAccountKey.json
- Asegúrate de que el archivo serviceAccountKey.json esté en la carpeta correcta
- Verifica los permisos del archivo:
```bash
chmod 600 serviceAccountKey.json
```

### 7.2 Backups
Regularmente respalda:
- Archivo .env
- serviceAccountKey.json
- Cualquier otro archivo de configuración crítico

### 7.3 Monitoreo de Logs
Revisa regularmente los logs:
```bash
pm2 logs telefunken
```

## 8. Solución de Problemas Comunes

### 8.1 La Aplicación No Inicia
1. Verificar logs:
```bash
pm2 logs telefunken
```

2. Verificar que el puerto está libre:
```bash
sudo lsof -i :3000
```

3. Verificar archivos de configuración:
```bash
ls -la ~/telefunken-server/
cat ~/telefunken-server/.env
```

### 8.2 Problemas de Conexión
1. Verificar reglas del Security Group
2. Verificar que la aplicación está escuchando en 0.0.0.0
3. Probar conexión local:
```bash
curl localhost:3000
```

## 9. URLs Importantes
- Aplicación: http://tu-dns-publica:3000
- Consola AWS: https://aws.amazon.com/console
- Documentación PM2: https://pm2.keymetrics.io/docs/usage/quick-start/
