# 🌐 Wally Commerce — Guía de Despliegue en Producción

Guía paso a paso para el despliegue de Wally Commerce tanto en Servidores Propios / VPS (Ubuntu, Docker, Nginx) como en Plataformas PaaS / Serverless Cloud.

---

## 🖥️ Opción 1: Despliegue en Servidor VPS (Ubuntu 22.04 LTS / Debian)

### 1. Preparación del Servidor
```bash
# Actualizar el sistema
sudo apt update && sudo apt upgrade -y

# Instalar Docker y Docker Compose
sudo apt install -y curl ufw git
curl -fsSL https://get.docker.com | sh
sudo usermod -aG docker $USER
```

### 2. Clonar y Configurar Entorno
```bash
git clone <URL_DEL_REPOSITORIO> /var/www/wally
cd /var/www/wally

# Configurar variables de producción
cp .env.docker.example .env
nano .env
```

### 3. Iniciar la Plataforma con Docker Compose
```bash
docker-compose up --build -d
```

### 4. Configurar Nginx como Reverse Proxy con SSL (Certbot Let's Encrypt)
Instalar Nginx y Certbot:
```bash
sudo apt install -y nginx certbot python3-certbot-nginx
```

Crear archivo `/etc/nginx/sites-available/wally.conf`:
```nginx
# Storefront (Frontend Next.js)
server {
    server_name tu-tienda.com www.tu-tienda.com;

    location / {
        proxy_pass http://127.0.0.1:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }
}

# API Backend (NestJS)
server {
    server_name api.tu-tienda.com;

    location / {
        proxy_pass http://127.0.0.1:4000;
        proxy_http_version 1.1;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
    }
}
```

Habilitar sitio y generar certificados SSL gratuitos:
```bash
sudo ln -s /etc/nginx/sites-available/wally.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d tu-tienda.com -d www.tu-tienda.com -d api.tu-tienda.com
```

---

## ☁️ Opción 2: Despliegue en Plataformas Cloud Serverless / PaaS

| Componente | Plataforma Recomendada | Variables Clave |
| :--- | :--- | :--- |
| **Frontend (Next.js 14)** | **Vercel** | `NEXT_PUBLIC_API_URL=https://api.tu-tienda.com/api/v1` |
| **Backend API (NestJS)** | **Render** / **Railway** | `DATABASE_URL`, `REDIS_HOST`, `JWT_ACCESS_SECRET`, `JWT_REFRESH_SECRET`, `CORS_ORIGIN` |
| **Base de Datos PostgreSQL** | **Neon** / **Supabase** | Conexión SSL pooled (`?sslmode=require`) |
| **Cache & Throttling** | **Upstash Redis** | `REDIS_HOST`, `REDIS_PORT`, `REDIS_PASSWORD` |

---

## 💾 Respaldo y Mantenimiento de la Base de Datos

### Script Automatizado de Respaldo (`backup.sh`):
```bash
#!/bin/bash
BACKUP_DIR="/var/backups/wally"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
mkdir -p $BACKUP_DIR

docker exec wally-postgres pg_dump -U wally_user wally_commerce_db | gzip > "$BACKUP_DIR/db_$TIMESTAMP.sql.gz"

# Mantener únicamente los últimos 14 respaldos
find $BACKUP_DIR -type f -name "*.sql.gz" -mtime +14 -delete
```

Programar en `cron` para ejecutarse cada medianoche:
```bash
crontab -e
# Agregar línea:
0 0 * * * /var/www/wally/backup.sh > /dev/null 2>&1
```
