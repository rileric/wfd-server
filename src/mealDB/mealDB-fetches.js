const { MEALDB_KEY } = require('../config');
const fetch = require('node-fetch');

const myDebug = console.log;

const fetchParams = {
    "method": "GET",
    "headers": {
    "x-rapidapi-key": MEALDB_KEY,
    "x-rapidapi-host": "themealdb.p.rapidapi.com"
    }
}

const convertMealDBIngredients = (mealDBRecipe) => {
    let ingredientArray = [];

    for( let i = 1; i <= 20; i++) {
        let ingKey = 'strIngredient' + i;
        let measKey = 'strMeasure' + i;
        
        if(mealDBRecipe[ingKey]) {
            let ingredientLine = mealDBRecipe[measKey] + ' ' + mealDBRecipe[ingKey];
            ingredientArray.push(ingredientLine);
        }
    }
    return ingredientArray;
}

const convertMealDBtoWFD = (mealDBRecipe) => {
    const newWFDRecipe = {
        recipe_id: null,
        recipe_owner: '1', // default user
        recipe_name: mealDBRecipe.strMeal, // name and mealdb_id are basic info
        mealdb_id: mealDBRecipe.idMeal,
        recipe_pic: mealDBRecipe.strMealThumb || '',
        recipe_cuisine: mealDBRecipe.strArea || '',
        recipe_category:mealDBRecipe.strCategory || '',
        recipe_ingredient_list: convertMealDBIngredients(mealDBRecipe),
        recipe_instructions: mealDBRecipe.strInstructions || '',
        recipe_tags: mealDBRecipe.strTags ? mealDBRecipe.strTags.split(',') : '',
        recipe_video: mealDBRecipe.strYoutube || '',
        tweaked_original_id: '', // not tweaked
        recipe_source: mealDBRecipe.strSource || ''
    }

    return newWFDRecipe;
}


//------ one-time fetch requests------//
/* List all meal categories
Includes strCategory, strCategoryDescription, and strCategoryThumb
for each object in the response array. */
async function fetchMealCategories() {
    let searchUrl = "https://themealdb.p.rapidapi.com/categories.php";

    return fetch(searchUrl, fetchParams)
    .then(response => {return response.json()} )
    .then(responseJson => {
        // myDebug(`responseJson for MealCategories: `, responseJson);
        return responseJson;
    })
    .catch(err => {
      console.log("There was an error with the request: " + err);
    });
    
}

/* List all areas (cuisines)
Includes strArea 
for each object in the response array. */
async function fetchMealCuisines() {
    let searchUrl = "https://themealdb.p.rapidapi.com/list.php?a=list";

    return fetch(searchUrl, fetchParams)
    .then(response => response.json() )
    .then(responseJson => {
        // myDebug(`responseJson for MealCuisines: `, responseJson);
        return responseJson;
    })
    .catch(err => {
        console.log("There was an error with the request: " + err);
  });
}

//------ Repeat Requests------//
/* List meals by ingredient list
Includes idMeal, strMeal, and strMealThumb
for each object in the response array. Ingredients are separated by %2C */
function fetchMealDBByIngredientList( ingredientList) {

    let searchUrl = `https://themealdb.p.rapidapi.com/filter.php?i=${ingredientList}`;
  
    return fetch(searchUrl, fetchParams)
    .then(response => response.json() )
    .then(responseJson => {
        // myDebug('fetchMealDBByIngredientList response = ', responseJson);
        let convertedRecipes = responseJson.meals.map(mealDBRecipe => convertMealDBtoWFD(mealDBRecipe));
        // myDebug(convertedRecipes);
        return convertedRecipes;
    })
    .catch(err => {
      console.log("There was an error with the request: " + err);
    });
  }
  
  /* List meals by category
  Includes idMeal, strMeal, and strMealThumb
  for each object in the response array. */
  function fetchMealDBByCategory( searchCategory) {
    let searchUrl = `https://themealdb.p.rapidapi.com/filter.php?c=${searchCategory}`;
  
    return fetch(searchUrl, fetchParams)
    .then(response => response.json() )
    .then(responseJson => {
        // myDebug('fetchMealDBByCategory response = ', responseJson);
        let convertedRecipes = responseJson.meals.map(mealDBRecipe => convertMealDBtoWFD(mealDBRecipe));
        // myDebug(convertedRecipes);
        return convertedRecipes;
    })
    .catch(err => {
      console.log("There was an error with the request: " + err);
    });
  }
  
  /* List meals by Area (cuisines)
  Includes idMeal, strMeal, and strMealThumb
  for each object in the response array. */
  function fetchMealDBByCuisine( searchArea) {
    let searchUrl = `https://themealdb.p.rapidapi.com/filter.php?a=${searchArea}`;
  
    return fetch(searchUrl, fetchParams)
    .then(response => response.json() )
    .then(responseJson => {
        // myDebug('fetchMealDBByCuisine response = ', responseJson);
        let convertedRecipes = responseJson.meals.map(mealDBRecipe => convertMealDBtoWFD(mealDBRecipe));
        // myDebug(convertedRecipes);
        return convertedRecipes;
    })
    .catch(err => {
      console.log("There was an error with the request: " + err);
    });
  }

//------ Full Recipe Requests ------//
/* Returns:
idMeal, strArea, strCategory, strMeal, strMealThumb,
strIngredient1-20
strMeasure1-20
strInstructions, strYoutube
for each object in the array
*/
// id
async function fetchMealDBRecipeById(recipeId) {
    let searchUrl = `https://themealdb.p.rapidapi.com/lookup.php?i=${recipeId}`;
    
    return fetch(searchUrl, fetchParams)
    .then(response => response.json() )
    .then(responseJson => {
        // myDebug('fetchMealDBRecipesTenRandom response = ', responseJson.meals);
      let convertedRecipes = responseJson.meals.map(mealDBRecipe => convertMealDBtoWFD(mealDBRecipe));
      // myDebug(convertedRecipes);
      return convertedRecipes;
    })
    .catch(err => {
      console.log("There was an error with the request: " + err);
    });
}

async function fetchMealDBRecipesTenRandom() {
    let searchUrl = "https://themealdb.p.rapidapi.com/randomselection.php";

    return fetch(searchUrl, fetchParams)
    .then(response => response.json() )
    .then(responseJson => {
      // myDebug('fetchMealDBRecipesTenRandom response = ', responseJson.meals);
      let convertedRecipes = responseJson.meals.map(mealDBRecipe => convertMealDBtoWFD(mealDBRecipe));
      // myDebug(convertedRecipes);
      return convertedRecipes;
    })
    .catch(err => {
      console.log("There was an error with the request: " + err);
    });
}

async function oneTimeFetches() {
    
    let categoriesFetched = await fetchMealCategories();
    let cuisinesFetched = await fetchMealCuisines();

    let res = {
        categories: categoriesFetched.categories,
        cuisines: cuisinesFetched.meals
    }

    return res;
}



module.exports = {
    oneTimeFetches,
    fetchMealDBRecipeById,
    fetchMealDBRecipesTenRandom,
    fetchMealDBByIngredientList,
    fetchMealDBByCategory,
    fetchMealDBByCuisine
}




