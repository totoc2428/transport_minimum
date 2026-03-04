# Transport Minimum - Solveur du Problème de Transport

[![Python](https://img.shields.io/badge/Python-3.10+-blue.svg)](https://www.python.org/)
[![Tests](https://img.shields.io/badge/Tests-pytest-green.svg)](https://pytest.org/)

Implémentation de l'algorithme du simplexe pour résoudre le **problème de transport à coût minimum**. Ce projet est une solution optimisée pour le kata Codewars correspondant (problème de temps sur le défi sauvegardé ici en attendant).

## 📋 Description du Problème

Étant donné :

- Une liste de **fournisseurs** avec leurs capacités de production
- Une liste de **consommateurs** avec leurs demandes
- Une **matrice de coûts** de transport unitaire

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

## 🧮 Algorithme Implémenté

### Choix d'Architecture

L'algorithme utilise la **méthode du simplexe pour le transport** avec plusieurs optimisations :

#### 1. Initialisation par Coût Minimum (Greedy)

```
Complexité : O(n·m·log(n·m))
```

- Tri unique de toutes les cellules par coût croissant
- Allocation gloutonne en priorisant les coûts faibles
- **Choix** : Plus rapide que la méthode de Vogel pour les grandes matrices (150×150)

#### 2. Complétion de la Base avec Union-Find

```
Complexité : O(n·m·α(n+m)) ≈ O(n·m)
```

- Garantit une base valide (exactement `n + m - 1` cellules)
- Évite les cycles grâce à l'Union-Find avec compression de chemin
- **Choix** : Permet de gérer la dégénérescence de manière robuste

#### 3. Calcul des Potentiels (U-V) par DFS

```
Complexité : O(n + m)
```

- Parcours en profondeur du graphe de la base
- Calcul itératif (pile) au lieu de récursif pour éviter les stack overflows
- **Choix** : DFS plus simple que BFS pour ce cas

#### 4. Pricing Exhaustif

```
Complexité : O(n·m)
```

- Recherche de la cellule entrante avec le plus grand coût réduit positif
- Utilisation d'un set pour exclure rapidement les cellules de base
- **Choix** : Plus stable que la règle de Dantzig classique

#### 5. Recherche de Cycle par BFS

```
Complexité : O(n + m)
```

- Recherche du chemin unique dans l'arbre de la base
- Construction du cycle pour le pivotage
- **Choix** : BFS garantit le chemin le plus court

### Complexité Globale

| Étape          | Par itération   | Total (k itérations) |
| -------------- | --------------- | -------------------- |
| Initialisation | O(n·m·log(n·m)) | Une seule fois       |
| Potentiels     | O(n + m)        | O(k·(n + m))         |
| Pricing        | O(n·m)          | O(k·n·m)             |
| Cycle + Pivot  | O(n + m)        | O(k·(n + m))         |

**Complexité dominante** : `O(n·m·log(n·m) + k·n·m)` où `k` est le nombre de pivots.

## 🚀 Installation

```bash
# Cloner le repository
git clone https://github.com/votre-username/transport_minimum.git
cd transport_minimum

# Installer avec pip (mode éditable)
pip install -e .

# Ou installer les dépendances de développement
pip install -e ".[dev]"
```

## 💻 Utilisation

```python
from transport_minimum import minimum_transportation_price

suppliers = [10, 20, 20]
consumers = [5, 25, 10, 10]
costs = [
    [2, 5, 3, 0],
    [3, 4, 1, 4],
    [2, 6, 5, 2]
]

result = minimum_transportation_price(suppliers, consumers, costs)
print(f"Coût minimum : {result}")  # Output: Coût minimum : 150
```

## 🧪 Tests

```bash
# Lancer tous les tests
pytest

# Avec couverture
pytest --cov=transport_minimum

# Tests verbeux
pytest -v
```

## 📁 Structure du Projet

```
transport_minimum/
├── src/
│   └── transport_minimum/
│       ├── __init__.py      # Point d'entrée du module
│       └── solver.py        # Implémentation de l'algorithme
├── tests/
│   ├── __init__.py
│   └── test_solver.py       # Tests unitaires (pytest)
├── pyproject.toml           # Configuration du projet
├── README.md
└── .gitignore
```

## 📊 Performance

L'implémentation passe les tests de performance Codewars :

- **12 matrices 150×150** en moins de 8500 ms
- Optimisée pour éviter les modules interdits (scipy, sklearn)

## 🔧 Contraintes Techniques

- Python 3.10+
- Aucune dépendance externe (stdlib uniquement)
- Pas d'utilisation de scipy/sklearn
- Pas de fonctions interdites (exec, eval, open, globals, locals, exit)

## 📚 Références

- [Problème de transport (Wikipedia)](https://fr.wikipedia.org/wiki/Probl%C3%A8me_de_transport)
- [Méthode du simplexe](https://fr.wikipedia.org/wiki/Algorithme_du_simplexe)
- [Kata Codewars](https://www.codewars.com/)

## 📄 Licence

MIT License - Voir [LICENSE](LICENSE) pour plus de détails.
