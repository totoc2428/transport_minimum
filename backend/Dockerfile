FROM python:3.12-slim

WORKDIR /app

# Copier les fichiers de dépendances
COPY backend/requirements.txt ./backend/
COPY src/ ./src/
COPY pyproject.toml ./

# Installer les dépendances
RUN pip install --no-cache-dir -r backend/requirements.txt
RUN pip install --no-cache-dir -e .

# Copier le code backend
COPY backend/ ./backend/

# Exposer le port
EXPOSE 8000

# Commande de démarrage
CMD ["uvicorn", "backend.main:app", "--host", "0.0.0.0", "--port", "8000"]
