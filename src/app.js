require('dotenv').config();
const express = require('express');
const morgan = require('morgan');
const cors = require('cors');
const helmet = require('helmet');
const { NODE_ENV } = require('./config');
const validateBearerToken = require('./validate-bearer-token');
const errorHandler = require('./error-handler');
const recipesRouter = require('../src/recipes/recipes-router');
const { oneTimeFetches, fetchMealDBRecipeById, fetchMealDBRecipesTenRandom, fetchMealDBByIngredientList, fetchMealDBByCategory, fetchMealDBByCuisine } = require('../src/mealDB/mealDB-fetches');
const cookbooksRouter = require('./cookbooks/cookbooks-router');

const app = express();
const myDebug = console.log;

const morganOption = (NODE_ENV === 'production')
  ? 'tiny'
  : 'common';

app.use(morgan(morganOption));
app.use(helmet());
app.use(cors());
app.use(validateBearerToken);


app.use('/recipes', recipesRouter);
app.use('/cookbooks', cookbooksRouter);

app.get('/meal-db-one-time', async (req,res) => {
  let oneTimeResponse = await oneTimeFetches(); // returns both category and cuisine lists
  res.json(oneTimeResponse);
});

app.get('/meal-db-recipe/:recipe_id', async (req,res) => {
  let mealDBRecipe = await fetchMealDBRecipeById(req.params.recipe_id);
  res.send(mealDBRecipe);
});

app.get('/meal-db-random', async (req,res) => {
  let mealDBRecipes = await fetchMealDBRecipesTenRandom();
  res.send(mealDBRecipes);
});

// Meals include mealdb_id, recipe_name, recipe_pic
app.get('/meal-db-search-ingredients/:search_string', async (req,res) => {
  let ingredientList = req.params.search_string;
  let mealDBmeals = await fetchMealDBByIngredientList(ingredientList);
  res.send(mealDBmeals);
});

app.get('/meal-db-search-category/:search_string', async (req,res) => {
  let category = req.params.search_string;
  let mealDBmeals = await fetchMealDBByCategory(category);
  res.send(mealDBmeals);
});

app.get('/meal-db-search-cuisine/:search_string', async (req,res) => {
  let cuisine = req.params.search_string;
  let mealDBmeals = await fetchMealDBByCuisine(cuisine);
  res.send(mealDBmeals);
});

app.get('/', (req, res) => {
    res.send('Hello, world!');
});

app.use(errorHandler);
module.exports = app;