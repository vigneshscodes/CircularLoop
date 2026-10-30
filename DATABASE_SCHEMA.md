# CircularLoop Neo4j Database Schema

## Labels

| Label | Properties |
|---|---|
| `Item` | `id`, `name`, `category`, `brand`, `condition`, `description` |
| `Component` | `id`, `name`, `condition`, `reusable` |
| `Material` | `id`, `name`, `recyclability`, `environmental_value` |
| `Action` | `id`, `name`, `description`, `difficulty`, `estimated_cost`, `impact`, optional `custom` |
| `Facility` | `id`, `name`, `type`, `location`, `description` |
| `Category` | `id`, `name` |

## Relationships

```text
(Item)-[:BELONGS_TO]->(Category)
(Item)-[:CONTAINS]->(Component)
(Component)-[:MADE_OF]->(Material)
(Item)-[:ELIGIBLE_FOR]->(Action)
(Action)-[:AVAILABLE_AT]->(Facility)
(Action)-[:LEADS_TO]->(Action)
(Component)-[:CAN_BE_REUSED_AS]->(Component)
```

## Constraints

`backend/scripts/schema.js` creates uniqueness constraints for `id` on each label using `IF NOT EXISTS`. Schema setup can safely be run again.

## Initialization

```bash
cd backend
npm install
npm run db:setup
npm run db:seed
```

The seed uses `MERGE` for nodes and relationships. It updates the known sample records and does not erase unrelated data. It includes eight devices, seventeen components, ten materials, ten actions, five facilities and five categories.

## Useful verification queries

```cypher
MATCH (n)
RETURN labels(n)[0] AS label, count(*) AS total
ORDER BY label;
```

```cypher
MATCH ()-[r]->()
RETURN type(r) AS relationship, count(*) AS total
ORDER BY relationship;
```

```cypher
MATCH (i:Item)-[:CONTAINS]->(c:Component)-[:MADE_OF]->(m:Material)
RETURN i.name, c.name, collect(m.name) AS materials
ORDER BY i.name, c.name;
```

```cypher
MATCH p=(i:Item {id: 'item-laptop'})-[:ELIGIBLE_FOR]->(a:Action)-[:LEADS_TO*1..3]->(next:Action)
RETURN p LIMIT 30;
```

## Recommendation traversal

The recommendation query starts from the selected `Item`, follows `ELIGIBLE_FOR` to its possible `Action` nodes, and traverses `LEADS_TO` with a variable path length of zero to three. It also follows `CONTAINS` and `MADE_OF` to gather components and materials, and `AVAILABLE_AT` to find facilities. A simple condition-fit expression prioritizes the relevant action families. The graph determines which options are reachable. The condition rule only orders those reachable options.

## CRUD safety

Custom actions are created with `custom:true`. Seeded actions are marked `custom:false`. The delete endpoint matches only custom actions and detaches the selected action node. This protects the curated seed action catalogue from accidental deletion. No unrelated node is deleted.
