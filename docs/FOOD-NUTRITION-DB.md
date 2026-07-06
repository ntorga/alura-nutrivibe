# Food Nutrition Database

The project includes offline Brazilian food nutrition data from [TACO (Tabela Brasileira de Composição de Alimentos)](https://www.nepa.unicamp.br/taco/tabela.php), maintained by NEPA/UNICAMP and funded by the Brazilian government.

**Location:** `assets/food-nutrition-db/`

**Contents:**
- 597 Brazilian foods across 15 categories
- 33 fields per food (description, category, taco_id, and 29 nutritional fields: calories, protein, carbs, fat, fiber, vitamins, minerals)
- Full-text search enabled for Portuguese food names

## Data Files

- **`nutrivibe.db`** — SQLite database with full-text search
- **`taco_foods.json`** — Structured JSON with all nutritional data
- **`taco_foods.csv`** — Formatted CSV (easier to read)
- **`taco_fatty_acids.csv`** — Detailed fatty acid breakdown

## Importing into PocketBase

> **Prerequisites:** PocketBase binary downloaded and running (`./pocketbase/pocketbase serve`), superuser created.

Use the **SQLite database** (`nutrivibe.db`) as the import source — it has a cleaner schema (32 columns) than the JSON (69 columns), since the detailed fatty acid and amino acid breakdowns were already filtered out.

### Schema

The `foods` collection has 33 fields:

- `id` — PocketBase auto-generated
- `description` (text) — food name in Portuguese
- `category` (text) — one of 15 TACO food categories
- `taco_id` (number) — original TACO database ID
- 29 nutritional NumberFields — `energy_kcal`, `protein_g`, `lipid_g`, `carbohydrate_g`, `fiber_g`, minerals, vitamins, fatty acids, etc.

All 15 categories: `Alimentos preparados`, `Bebidas (alcoólicas e não alcoólicas)`, `Carnes e derivados`, `Cereais e derivados`, `Frutas e derivados`, `Gorduras e óleos`, `Leguminosas e derivados`, `Leite e derivados`, `Miscelâneas`, `Nozes e sementes`, `Outros alimentos industrializados`, `Ovos e derivados`, `Pescados e frutos do mar`, `Produtos açucarados`, `Verduras, hortaliças e derivados`.

### Import steps

1. **Auth as superuser** to get an API token:
   ```bash
   export superuserToken=$(curl -s -X POST 'http://127.0.0.1:8090/api/collections/_superusers/auth-with-password' \
     -H 'Content-Type: application/json' \
     -d '{"identity":"admin@nutrivibe.local","password":"NutriVibe2026!"}' \
     | python3 -c "import sys,json; print(json.load(sys.stdin)['token'])")
   ```

2. **Create the `foods` collection** — run this Python script (uses `superuserToken` from step 1):
   ```python
   import json, os, urllib.request

   superuserToken = os.environ.get('superuserToken')
   nutritionalFieldNames = [
       'taco_id', 'humidity_percents', 'energy_kcal', 'energy_kj', 'protein_g', 'lipid_g', 'cholesterol_mg',
       'carbohydrate_g', 'fiber_g', 'ashes_g', 'calcium_mg', 'magnesium_mg', 'manganese_mg',
       'phosphorus_mg', 'iron_mg', 'sodium_mg', 'potassium_mg', 'copper_mg', 'zinc_mg',
       'retinol_mcg', 're_mcg', 'rae_mcg', 'thiamine_mg', 'riboflavin_mg', 'pyridoxine_mg',
       'niacin_mg', 'vitamin_c_mg', 'saturated_g', 'monounsaturated_g', 'polyunsaturated_g'
   ]
    collectionFields = [
        {'name': 'description', 'type': 'text', 'min': 1},
        {'name': 'category', 'type': 'text'},
    ] + [{'name': fieldName, 'type': 'number'} for fieldName in nutritionalFieldNames]

   requestBody = json.dumps({
       'name': 'foods', 'type': 'base', 'fields': collectionFields,
       'listRule': '', 'viewRule': ''
   }).encode()
   apiRequest = urllib.request.Request('http://127.0.0.1:8090/api/collections', data=requestBody, method='POST')
   apiRequest.add_header('Content-Type', 'application/json')
   apiRequest.add_header('Authorization', superuserToken)
   apiResponse = urllib.request.urlopen(apiRequest)
   collectionData = json.loads(apiResponse.read())
   print(f'Created collection "{collectionData["name"]}" with {len(collectionData["fields"])} fields')
   ```

3. **Import 597 food records** from SQLite into PocketBase:
   ```python
   import json, os, sqlite3, urllib.request

   superuserToken = os.environ.get('superuserToken')
   databaseConnection = sqlite3.connect('assets/food-nutrition-db/nutrivibe.db')
   databaseConnection.row_factory = sqlite3.Row
   foodRecords = [dict(row) for row in databaseConnection.execute('SELECT * FROM foods').fetchall()]
   databaseConnection.close()

   numericFieldNames = [
       'humidity_percents', 'energy_kcal', 'energy_kj', 'protein_g', 'lipid_g', 'cholesterol_mg',
       'carbohydrate_g', 'fiber_g', 'ashes_g', 'calcium_mg', 'magnesium_mg', 'manganese_mg',
       'phosphorus_mg', 'iron_mg', 'sodium_mg', 'potassium_mg', 'copper_mg', 'zinc_mg',
       'retinol_mcg', 're_mcg', 'rae_mcg', 'thiamine_mg', 'riboflavin_mg', 'pyridoxine_mg',
       'niacin_mg', 'vitamin_c_mg', 'saturated_g', 'monounsaturated_g', 'polyunsaturated_g'
   ]
   createdCount = 0
   for foodItem in foodRecords:
       recordData = {
           'taco_id': foodItem['id'],
           'description': foodItem['description'] or '',
           'category': foodItem['category'] or '',
       }
       for fieldName in numericFieldNames:
           recordData[fieldName] = foodItem[fieldName] if foodItem[fieldName] is not None else 0
       requestBody = json.dumps(recordData).encode()
       apiRequest = urllib.request.Request('http://127.0.0.1:8090/api/collections/foods/records', data=requestBody, method='POST')
       apiRequest.add_header('Content-Type', 'application/json')
       apiRequest.add_header('Authorization', superuserToken)
       urllib.request.urlopen(apiRequest)
       createdCount += 1
   print(f'Imported {createdCount} food records')
   ```

4. **Verify** — search and filter via the API:
   ```bash
   # Search for chicken dishes
   curl -s --get 'http://127.0.0.1:8090/api/collections/foods/records' \
     --data-urlencode 'filter=description~"frango"'

   # Filter by category
   curl -s --get 'http://127.0.0.1:8090/api/collections/foods/records' \
     --data-urlencode 'filter=category="Frutas e derivados"' \
     --data-urlencode 'sort=-energy_kcal'
   ```

### Gotchas

- **Field options go at the top level**, not nested in an `options` wrapper. Use `{'name': 'description', 'type': 'text', 'min': 1}` NOT `{'name': 'description', 'type': 'text', 'options': {'min': 1}}`. Wrapping options in an `options` key either causes `validation_required` errors (for required fields like `collectionId` on relation fields) or silently drops the constraint (for optional fields like `min` on text fields).
- **NULL values** from SQLite become `0` in PocketBase (NumberField is non-nullable with zero-default).
- **Authorization header** (not query param) is required for superuser API calls: `Authorization: $superuserToken`.
- **Collection creation** uses `fields` key (not `schema`) in the REST API body.

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
