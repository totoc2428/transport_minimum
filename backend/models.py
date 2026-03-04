"""
Schémas Pydantic pour l'API du problème de transport.
"""

from pydantic import BaseModel, Field, model_validator # type: ignore


class Point(BaseModel):
    """Point sur le canvas avec coordonnées et quantité."""

    x: float = Field(..., ge=0, description="Coordonnée X sur le canvas")
    y: float = Field(..., ge=0, description="Coordonnée Y sur le canvas")
    name: str = Field(..., min_length=1, max_length=50, description="Nom du point")


class Warehouse(Point):
    """Entrepôt (fournisseur) avec son stock."""

    stock: int = Field(..., ge=1, description="Quantité disponible")


class Store(Point):
    """Magasin (consommateur) avec sa demande."""

    demand: int = Field(..., ge=1, description="Quantité demandée")


class SolveRequest(BaseModel):
    """Requête pour résoudre le problème de transport."""

    warehouses: list[Warehouse] = Field(
        ..., min_length=1, description="Liste des entrepôts"
    )
    stores: list[Store] = Field(..., min_length=1, description="Liste des magasins")
    cost_mode: str = Field(
        default="euclidean",
        pattern="^(euclidean|manhattan)$",
        description="Mode de calcul des coûts",
    )

    @model_validator(mode="after")
    def validate_supply_equals_demand(self) -> "SolveRequest":
        """Vérifie que l'offre totale égale la demande totale."""
        total_supply = sum(w.stock for w in self.warehouses)
        total_demand = sum(s.demand for s in self.stores)
        if total_supply != total_demand:
            raise ValueError(
                f"L'offre totale ({total_supply}) doit égaler "
                f"la demande totale ({total_demand})"
            )
        return self


class Flow(BaseModel):
    """Flux optimal entre un entrepôt et un magasin."""

    from_warehouse: int = Field(..., description="Index de l'entrepôt source")
    to_store: int = Field(..., description="Index du magasin destination")
    warehouse_name: str = Field(..., description="Nom de l'entrepôt")
    store_name: str = Field(..., description="Nom du magasin")
    quantity: int = Field(..., ge=0, description="Quantité transportée")
    cost: float = Field(..., ge=0, description="Coût unitaire du transport")
    total_cost: float = Field(..., ge=0, description="Coût total (quantité × coût)")


class SolveResponse(BaseModel):
    """Réponse avec la solution optimale."""

    total_cost: float = Field(..., description="Coût total minimum")
    flows: list[Flow] = Field(..., description="Liste des flux optimaux")
    cost_matrix: list[list[float]] = Field(
        ..., description="Matrice des coûts calculée"
    )
