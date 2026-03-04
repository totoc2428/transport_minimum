# Transport Minimum - Solveur du Problème de Transport

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![React](https://img.shields.io/badge/React-18-61dafb.svg)](https://react.dev/)
[![FastAPI](https://img.shields.io/badge/FastAPI-0.109+-009688.svg)](https://fastapi.tiangolo.com/)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED.svg)](https://docker.com/)
[![Tests](https://img.shields.io/badge/Tests-pytest-green.svg)](https://pytest.org/)

Implémentation de l'algorithme du simplexe pour résoudre le **problème de transport à coût minimum**, avec une **interface visuelle interactive** pour placer des entrepôts et magasins sur un canvas et visualiser les flux optimaux.

## 🎯 Fonctionnalités

- **Algorithme optimisé** : Simplexe pour le transport passant les tests de performance Codewars (150×150)
- **Interface visuelle** : Canvas interactif pour placer entrepôts (📦) et magasins (🏪)
- **Visualisation des flux** : Lignes d'épaisseur proportionnelle à la quantité transportée
- **API REST** : Backend FastAPI exposant l'algorithme
- **Déploiement Docker** : Configuration docker-compose prête à l'emploi

## 📋 Description du Problème

Étant donné :

- Une liste de **fournisseurs** (entrepôts) avec leurs stocks
- Une liste de **consommateurs** (magasins) avec leurs demandes
- Une **matrice de coûts** de transport (calculée automatiquement via distance euclidienne)

Trouver l'allocation qui **minimise le coût total** de transport tout en satisfaisant toute la demande.

### Exemple

```python
suppliers = [10, 20, 20]
consumers = [5, 25, 10, 10]
costs = [
    [2, 5, 3, 0],
    [3, 4, 1, 4],
    [2, 6, 5, 2]
]

# Solution optimale : coût = 150
```

## 🚀 Démarrage Rapide

### Option 1 : Docker (Recommandé)

```bash
# Cloner le repository
git clone https://github.com/totoc2428/transport_minimum.git
cd transport_minimum

# Lancer avec Docker Compose
docker-compose up --build

# Accéder à l'interface : http://localhost:3000
# API disponible sur : http://localhost:8000
```

### Option 2 : Installation Locale

#### Backend (Python)

```bash
# Créer un environnement virtuel
python -m venv .venv
source .venv/bin/activate  # Linux/Mac
# ou .venv\Scripts\activate  # Windows

# Installer le package et les dépendances
pip install -e .
pip install -r backend/requirements.txt

# Lancer le serveur
uvicorn backend.main:app --reload
```

#### Frontend (React)

```bash
cd frontend

# Installer les dépendances
npm install

# Lancer en développement
npm run dev

# Accéder à http://localhost:5173
```

## 💻 Utilisation

### Interface Visuelle

1. **📦 Placer des entrepôts** : Sélectionner l'outil "Entrepôt" et cliquer sur le canvas
2. **🏪 Placer des magasins** : Sélectionner l'outil "Magasin" et cliquer sur le canvas
3. **✋ Déplacer** : Glisser-déposer pour repositionner les points
4. **📝 Modifier** : Cliquer sur un point pour éditer son nom et stock/demande
5. **🧮 Calculer** : Cliquer sur "Calculer" pour voir les flux optimaux

### API Python

```python
from transport_minimum import minimum_transportation_price, solve_transport

# Obtenir uniquement le coût minimum
cost = minimum_transportation_price(suppliers, consumers, costs)

# Obtenir la solution complète avec les flux
solution = solve_transport(suppliers, consumers, costs)
print(solution["total_cost"])  # 150
print(solution["flows"])       # [[0, 0, 0, 10], [0, 10, 10, 0], [5, 15, 0, 0]]
```

### API REST

```bash
# POST /api/solve
curl -X POST http://localhost:8000/api/solve \
  -H "Content-Type: application/json" \
  -d '{
    "warehouses": [
      {"x": 100, "y": 100, "name": "Entrepôt A", "stock": 100}
    ],
    "stores": [
      {"x": 300, "y": 200, "name": "Magasin 1", "demand": 100}
    ],
    "cost_mode": "euclidean"
  }'
```

## 🧮 Algorithme

L'algorithme utilise la **méthode du simplexe pour le transport** avec plusieurs optimisations :

| Étape           | Technique               | Complexité      |
| --------------- | ----------------------- | --------------- |
| Initialisation  | Greedy par coût minimum | O(n·m·log(n·m)) |
| Complétion base | Union-Find              | O(n·m·α(n+m))   |
| Potentiels U-V  | DFS itératif            | O(n + m)        |
| Pricing         | Recherche exhaustive    | O(n·m)          |
| Cycle           | BFS                     | O(n + m)        |

**Complexité totale** : `O(n·m·log(n·m) + k·n·m)` où `k` est le nombre de pivots.

### Choix d'Architecture

- **Initialisation Greedy** : Plus rapide que Vogel pour les grandes matrices (150×150)
- **Union-Find** : Gestion robuste de la dégénérescence
- **DFS itératif** : Évite les stack overflows sur les grands problèmes
- **Canvas 2D** : Rendu léger sans dépendances externes

## 📁 Structure du Projet

```
transport_minimum/
├── src/transport_minimum/     # Algorithme Python
│   ├── __init__.py
│   └── solver.py              # Simplexe pour le transport
├── backend/                   # API FastAPI
│   ├── main.py                # Routes et logique
│   ├── models.py              # Schémas Pydantic
│   ├── requirements.txt
│   └── Dockerfile
├── frontend/                  # Interface React
│   ├── src/
│   │   ├── components/
│   │   │   ├── Canvas.tsx     # Canvas interactif
│   │   │   └── Sidebar.tsx    # Panneau de contrôle
│   │   ├── store.ts           # État Zustand
│   │   └── App.tsx
│   ├── package.json
│   └── Dockerfile
├── tests/                     # Tests pytest
├── docker-compose.yml
└── pyproject.toml
```

## 🧪 Tests

```bash
# Tests de l'algorithme
pytest -v

# Avec couverture
pytest --cov=transport_minimum
```

## 🛠️ Technologies

| Composant         | Stack                               |
| ----------------- | ----------------------------------- |
| **Algorithme**    | Python 3.10+, stdlib uniquement     |
| **Backend**       | FastAPI, Pydantic, Uvicorn          |
| **Frontend**      | React 18, TypeScript, Vite, Zustand |
| **Visualisation** | Canvas 2D natif                     |
| **Déploiement**   | Docker, Docker Compose, Nginx       |

## 📊 Performance

- **Algorithme** : 12 matrices 150×150 en < 8500 ms (tests Codewars)
- **API** : < 50 ms pour résoudre des problèmes typiques (10×10)
- **Frontend** : Rendu 60 FPS avec Canvas 2D optimisé

## 🎓 Contexte

Ce projet démontre l'application de la **Recherche Opérationnelle** à un problème industriel réel :

- Optimisation de la logistique de distribution
- Visualisation interactive des solutions
- Architecture fullstack moderne

Développé initialement comme solution au kata Codewars "Minimum Transportation Price".

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE) pour plus de détails.
