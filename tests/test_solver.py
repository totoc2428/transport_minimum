"""
Tests unitaires pour le solveur du problème de transport.

Ces tests sont adaptés des tests Codewars pour valider
l'implémentation de l'algorithme du simplexe pour le transport.
"""

import pytest

from transport_minimum import minimum_transportation_price


class TestMinimumTransportationPrice:
    """Tests pour la fonction minimum_transportation_price."""

    def test_basic_3x3_matrix(self):
        """Test avec une matrice 3x3 simple."""
        suppliers = [10, 7, 13]
        consumers = [6, 20, 4]
        costs = [
            [4, 12, 3],
            [20, 1, 6],
            [7, 0, 5],
        ]
        assert minimum_transportation_price(suppliers, consumers, costs) == 43

    def test_3x2_matrix(self):
        """Test avec une matrice 3x2."""
        suppliers = [8, 15, 21]
        consumers = [8, 36]
        costs = [
            [9, 16],
            [7, 13],
            [25, 1],
        ]
        assert minimum_transportation_price(suppliers, consumers, costs) == 288

    def test_2x3_matrix(self):
        """Test avec une matrice 2x3."""
        suppliers = [31, 16]
        consumers = [14, 17, 16]
        costs = [
            [41, 18, 0],
            [4, 16, 37],
        ]
        assert minimum_transportation_price(suppliers, consumers, costs) == 358

    def test_example_from_description(self):
        """Test de l'exemple donné dans la description du kata."""
        suppliers = [10, 20, 20]
        consumers = [5, 25, 10, 10]
        costs = [
            [2, 5, 3, 0],
            [3, 4, 1, 4],
            [2, 6, 5, 2],
        ]
        assert minimum_transportation_price(suppliers, consumers, costs) == 150

    def test_5x6_matrix(self):
        """Test avec une matrice 5x6 plus complexe."""
        suppliers = [13, 44, 27, 39, 17]
        consumers = [28, 12, 30, 17, 19, 34]
        costs = [
            [6, 6, 12, 8, 13, 13],
            [7, 20, 5, 16, 11, 16],
            [4, 6, 19, 0, 2, 18],
            [1, 16, 6, 11, 8, 11],
            [5, 6, 11, 1, 6, 14],
        ]
        assert minimum_transportation_price(suppliers, consumers, costs) == 759


class TestEdgeCases:
    """Tests pour les cas limites."""

    def test_single_supplier_single_consumer(self):
        """Test avec un seul fournisseur et un seul consommateur."""
        suppliers = [100]
        consumers = [100]
        costs = [[5]]
        assert minimum_transportation_price(suppliers, consumers, costs) == 500

    def test_zero_cost_path(self):
        """Test avec des chemins à coût zéro."""
        suppliers = [10, 10]
        consumers = [10, 10]
        costs = [
            [0, 100],
            [100, 0],
        ]
        assert minimum_transportation_price(suppliers, consumers, costs) == 0

    def test_uniform_costs(self):
        """Test avec des coûts uniformes."""
        suppliers = [5, 5]
        consumers = [5, 5]
        costs = [
            [1, 1],
            [1, 1],
        ]
        assert minimum_transportation_price(suppliers, consumers, costs) == 10


class TestPerformance:
    """Tests de performance avec des matrices plus grandes."""

    def test_medium_matrix_10x10(self):
        """Test avec une matrice 10x10."""
        import random

        random.seed(42)  # Pour la reproductibilité

        size = 10
        total = 1000

        # Génération de données aléatoires mais équilibrées
        suppliers = [total // size] * size
        consumers = [total // size] * size
        costs = [[random.randint(0, 100) for _ in range(size)] for _ in range(size)]

        # On vérifie juste que ça s'exécute sans erreur
        result = minimum_transportation_price(suppliers, consumers, costs)
        assert result >= 0


if __name__ == "__main__":
    pytest.main([__file__, "-v"])
