# Food Nutrition Database

The project includes offline Brazilian food nutrition data from [TACO (Tabela Brasileira de Composição de Alimentos)](https://www.nepa.unicamp.br/taco/tabela.php), maintained by NEPA/UNICAMP and funded by the Brazilian government.

**Location:** `assets/food-nutrition-db/`

**Contents:**
- 597 Brazilian foods across 15 categories
- 32 nutritional fields per food (calories, protein, carbs, fat, fiber, vitamins, minerals)
- Full-text search enabled for Portuguese food names

## Data Files

- **`nutrivibe.db`** — SQLite database with full-text search
- **`taco_foods.json`** — Structured JSON with all nutritional data
- **`taco_foods.csv`** — Formatted CSV (easier to read)
- **`taco_fatty_acids.csv`** — Detailed fatty acid breakdown

## Importing into PocketBase

The TACO data can be imported into PocketBase as a collection for use in the app. Use the JSON or CSV file with PocketBase's import feature, or create a migration script.

## Querying the SQLite Database

If you need to query the standalone database directly:

```sql
-- Search by name (full-text search)
SELECT id, description, category, energy_kcal, protein_g
FROM foods_fts JOIN foods ON foods.id = foods_fts.rowid
WHERE foods_fts MATCH 'frango';

-- Get all foods in a category
SELECT description, energy_kcal, protein_g, carbohydrate_g, lipid_g
FROM foods
WHERE category = 'Carnes e derivados'
ORDER BY energy_kcal DESC;

-- Find high-protein foods
SELECT description, protein_g, energy_kcal
FROM foods
WHERE protein_g IS NOT NULL
ORDER BY protein_g DESC
LIMIT 20;
```

## Refreshing the Source Data

To update the data from the upstream TACO project:

```bash
# Clone the formatted CSV source
git clone --depth 1 https://github.com/machine-learning-mocha/taco.git /tmp/taco-repo
cp /tmp/taco-repo/formatados/alimentos.csv assets/food-nutrition-db/taco_foods.csv
cp /tmp/taco-repo/formatados/acidos-graxos.csv assets/food-nutrition-db/taco_fatty_acids.csv

# Clone the JSON-structured version
git clone --depth 1 https://github.com/marcelosanto/tabela_taco.git /tmp/tabela-taco
cp /tmp/tabela-taco/TACO.json assets/food-nutrition-db/taco_foods.json

# Clean up
rm -rf /tmp/taco-repo /tmp/tabela-taco
```
