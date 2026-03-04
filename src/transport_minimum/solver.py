"""
Implémentation de l'algorithme du simplexe pour le problème de transport.

L'algorithme utilise:
1. Une initialisation gloutonne par coût minimum
2. Un Union-Find pour garantir une base valide (arbre couvrant)
3. La méthode des potentiels (U-V) pour le pricing
4. Un pivotage classique avec recherche de cycle par BFS
"""


def minimum_transportation_price(
    suppliers: list[int], consumers: list[int], costs: list[list[int]]
) -> int:
    """
    Calcule le coût minimum de transport entre fournisseurs et consommateurs.

    Args:
        suppliers: Liste des quantités disponibles chez chaque fournisseur.
        consumers: Liste des demandes de chaque consommateur.
        costs: Matrice des coûts où costs[i][j] est le coût unitaire
               de transport du fournisseur i vers le consommateur j.

    Returns:
        Le coût total minimum pour satisfaire toute la demande.

    Note:
        L'offre totale doit être égale à la demande totale.
    """
    num_s, num_c = len(suppliers), len(consumers)
    num_nodes = num_s + num_c

    # 1. Initialisation Gloutonne (Greedy) par Coût Minimum
    # Plus rapide que la méthode de Vogel pour les grandes matrices (150x150)
    s_avail = list(suppliers)
    c_req = list(consumers)
    basis = []  # Liste de (r, c) représentant les cellules de base
    flows = [[0] * num_c for _ in range(num_s)]

    # Tri des coûts une seule fois pour une initialisation efficace
    flat_costs = sorted(
        ((costs[r][c], r, c) for r in range(num_s) for c in range(num_c))
    )

    for _, r, c in flat_costs:
        if s_avail[r] > 0 and c_req[c] > 0:
            amt = min(s_avail[r], c_req[c])
            flows[r][c] = amt
            basis.append((r, c))
            s_avail[r] -= amt
            c_req[c] -= amt

    # 2. Complétion de la base (Arbre couvrant)
    # Utilisation d'un Union-Find avec compression de chemin
    # pour garantir l'absence de cycles dans la base
    parent_uf = list(range(num_nodes))

    def find_uf(i: int) -> int:
        """Trouve la racine avec compression de chemin."""
        while parent_uf[i] != i:
            parent_uf[i] = parent_uf[parent_uf[i]]
            i = parent_uf[i]
        return i

    # Ajouter les arêtes de base existantes à l'Union-Find
    for r, c in basis:
        root_r, root_c = find_uf(r), find_uf(num_s + c)
        if root_r != root_c:
            parent_uf[root_r] = root_c

    # Compléter jusqu'à num_nodes - 1 arêtes (arbre couvrant)
    for r in range(num_s):
        for c in range(num_c):
            if len(basis) >= num_nodes - 1:
                break
            root_r, root_c = find_uf(r), find_uf(num_s + c)
            if root_r != root_c:
                parent_uf[root_r] = root_c
                basis.append((r, c))  # Flux reste à 0 (cellule dégénérée)

    # 3. Boucle de pivotage (Algorithme du Simplexe)
    while True:
        # Construction du graphe d'adjacence pour les potentiels
        adj = [[] for _ in range(num_nodes)]
        for r, c in basis:
            cost = costs[r][c]
            adj[r].append((num_s + c, cost))
            adj[num_s + c].append((r, cost))

        # Calcul des potentiels U et V par DFS
        # u[i] + v[j] = costs[i][j] pour toute cellule de base
        u = [None] * num_s
        v = [None] * num_c
        u[0] = 0  # type: ignore # Ancrage arbitraire
        stack = [0]

        while stack:
            curr = stack.pop()
            if curr < num_s:
                val = u[curr]
                for nxt, cost in adj[curr]:
                    c_idx = nxt - num_s
                    if v[c_idx] is None:
                        v[c_idx] = cost - val
                        stack.append(nxt)
            else:
                c_idx = curr - num_s
                val = v[c_idx]
                for nxt, cost in adj[curr]:
                    if u[nxt] is None:
                        u[nxt] = cost - val
                        stack.append(nxt)

        # 4. Pricing : Recherche de la cellule entrante
        # On cherche la cellule hors-base avec le plus grand coût réduit positif
        max_improvement = 0
        entering = None
        basis_set = set(basis)

        for r in range(num_s):
            u_r = u[r]
            cost_row = costs[r]
            for c in range(num_c):
                improvement = u_r + v[c] - cost_row[c] # type: ignore
                if improvement > max_improvement:
                    if (r, c) not in basis_set:
                        max_improvement = improvement
                        entering = (r, c)

        # Critère d'optimalité : aucune amélioration possible
        if not entering or max_improvement < 1e-8:
            break

        # 5. Recherche du cycle (BFS dans l'arbre)
        start_r, start_c = entering
        target = num_s + start_c

        path = []
        q = [(start_r, [(start_r, start_c)])]
        visited = {start_r}
        idx = 0

        while idx < len(q):
            curr, p = q[idx]
            idx += 1
            if curr == target:
                path = p
                break
            for nxt, _ in adj[curr]:
                if nxt not in visited:
                    visited.add(nxt)
                    cell = (curr, nxt - num_s) if curr < num_s else (nxt, curr - num_s)
                    q.append((nxt, p + [cell]))

        # 6. Pivotage : mise à jour des flux
        minus_cells = path[1::2]  # Cellules de rang impair (flux décrémenté)
        theta = min(flows[r][c] for r, c in minus_cells)

        for i, (r, c) in enumerate(path):
            if i % 2 == 0:
                flows[r][c] += theta
            else:
                flows[r][c] -= theta

        # Mise à jour de la base
        basis_set.add(entering)
        basis.append(entering)
        for r, c in minus_cells:
            if flows[r][c] == 0:
                basis.remove((r, c))
                basis_set.remove((r, c))
                break

    # Calcul du coût total
    return sum(
        flows[r][c] * costs[r][c]
        for r in range(num_s)
        for c in range(num_c)
        if flows[r][c] > 0
    )
