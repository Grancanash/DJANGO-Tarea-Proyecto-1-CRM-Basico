# Usamos una imagen ligera de Python
FROM python:3.12-slim

# Evitamos que Python genere archivos .pyc y permitimos logs en tiempo real
ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1

# Directorio de trabajo dentro del contenedor
WORKDIR /app

# Instalamos dependencias del sistema necesarias para PostgreSQL
RUN apt-get update && apt-get install -y libpq-dev gcc && rm -rf /var/lib/apt/lists/*

# Instalamos las librerías de Python
COPY requirements.txt /app/
RUN pip install --no-cache-dir -r requirements.txt

# Copiamos el código del proyecto
COPY . /app/

# Exponemos el puerto donde correrá Gunicorn
EXPOSE 8000

# Comando para arrancar el servidor en producción
CMD ["gunicorn", "core.wsgi:application", "--bind", "0.0.0.0:8000"]