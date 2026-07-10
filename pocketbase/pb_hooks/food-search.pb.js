routerAdd("GET", "/api/foods/search", (e) => {
  function normalizeString(inputString) {
    return inputString.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
  }

  let searchQuery = e.requestInfo().query.q || ""
  if (!searchQuery || searchQuery.length < 2) {
    return e.json(200, { items: [] })
  }

  let normalizedQuery = normalizeString(searchQuery)

  let allFoodRecords = $app.findRecordsByFilter("foods", "1=1", "", 600, 0)
  let matchingFoods = []

  for (let i = 0; i < allFoodRecords.length; i++) {
    let foodRecord = allFoodRecords[i]
    let foodDescription = foodRecord.getString("description")
    let normalizedDescription = normalizeString(foodDescription)

    if (normalizedDescription.indexOf(normalizedQuery) !== -1) {
      matchingFoods.push({
        id: foodRecord.id,
        description: foodDescription,
        category: foodRecord.getString("category"),
        energy_kcal: foodRecord.getFloat("energy_kcal"),
        protein_g: foodRecord.getFloat("protein_g"),
        carbohydrate_g: foodRecord.getFloat("carbohydrate_g"),
        lipid_g: foodRecord.getFloat("lipid_g"),
        fiber_g: foodRecord.getFloat("fiber_g"),
      })

      if (matchingFoods.length >= 20) break
    }
  }

  matchingFoods.sort(function(foodA, foodB) {
    return foodB.energy_kcal - foodA.energy_kcal
  })

  return e.json(200, { items: matchingFoods })
})
