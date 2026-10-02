FROM python:3.11-slim

ENV PYTHONDONTWRITEBYTECODE=1
ENV PYTHONUNBUFFERED=1
ENV PORT=8000

WORKDIR /app

# Instalar dependências básicas
RUN apt-get update && apt-get install -y --no-install-recommends curl && rm -rf /var/lib/apt/lists/*

# Instalar dependências Python do backend
COPY backend/requirements.txt ./backend/requirements.txt
RUN pip install --no-cache-dir -r backend/requirements.txt

# Copiar backend e o frontend pré-compilado (dist)
COPY backend ./backend
COPY frontend/dist ./frontend/dist

WORKDIR /app/backend

EXPOSE 8000

# Executar FastAPI no endereço 0.0.0.0 e porta dinâmica do Railway
CMD sh -c "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-8000}"
