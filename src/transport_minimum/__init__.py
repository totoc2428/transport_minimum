"""
Solveur du problème de transport à coût minimum.

Ce module implémente l'algorithme du simplexe pour le transport,
permettant de trouver l'allocation optimale entre fournisseurs
et consommateurs minimisant les coûts de transport.
"""

from .solver import TransportSolution, minimum_transportation_price, solve_transport

__all__ = ["minimum_transportation_price", "solve_transport", "TransportSolution"]
__version__ = "1.0.0"
