const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const RecipesService = require('./recipes-service');

const recipesRouter = express.Router();
const bodyParser = express.json();

const serializeRecipe = recipe => ({
    recipe_id: recipe.recipe_id,
    recipe_owner: recipe.recipe_owner,
    recipe_name: xss(recipe.recipe_name),
    mealdb_id: recipe.mealdb_id,
    recipe_pic: recipe.recipe_pic,
    recipe_cuisine: recipe.recipe_cuisine,
    recipe_category: recipe.recipe_category,
    recipe_ingredient_list: recipe.recipe_ingredient_list,
    recipe_instructions: xss(recipe.recipe_instructions),
    recipe_tags: recipe.recipe_tags,
    recipe_video: recipe.recipe_video,
    tweaked_original_id: recipe.tweaked_original_id, 
    recipe_source: recipe.recipe_source,
    recipe_public: recipe.recipe_public,
});

recipesRouter
    .route('/public')
    .get((req,res,next) => {
        RecipesService.getAllPublicRecipes(req.app.get('db'))
            .then(recipes => {
                res.json(recipes.map(serializeRecipe))
            })
            .catch(next);
    });

recipesRouter
    .route('/')
    .post(bodyParser, (req,res,next) => {
        const {recipe_name, recipe_category, recipe_cuisine} = req.body.recipe;
        for(const [key,value] of Object.entries({recipe_name, recipe_category, recipe_cuisine}) ) {
            if(!value == null) {
                logger.error(`${key} is required`);
                return res.status(400).send(`${key} is required`);
            }
        }

        const  newRecipe = req.body.recipe;

        RecipesService.insertRecipe(
            req.app.get('db'),
            newRecipe
        )
        .then(recipe => {
            logger.info(`Recipe with id ${recipe.recipe_id} created`)
            res
                .status(201)
                .location(`/recipes/${recipe.recipe_id}`)
                .json(serializeRecipe(recipe))
        })
        .catch(next);
    });

    // get user recipes
    recipesRouter
    .route('/private/:user_id')
    .get((req,res,next) => {
        const user_id = req.params.user_id;
        RecipesService.getPrivateRecipes(req.app.get('db'), user_id)
            .then(recipes => {
                res.json(recipes.map(serializeRecipe))
            })
            .catch(next);
    });
    // get recipes by category
    // get recipes by cuisine
    // get 10 random recipes --- Handled in app.js, uses MealDB api
    // get recipes based off ingredients

recipesRouter
    .route('/:recipe_id')
    .all((req,res,next) => {
        RecipesService.getRecipeById(
            req.app.get('db'),
            req.params.recipe_id
        )
        .then(recipe => {
            if(!recipe) {
                return res.status(404).json({
                    error: {message: 'Recipe not found'}
                });
            }
            res.recipe = recipe;
            next();
        })
        .catch(next);
    })
    .get((req,res) => {
        res.json(serializeRecipe(res.recipe));
    })
    .delete((req,res,next) => {
        RecipesService.deleteRecipe(
            req.app.get('db'),
            req.params.recipe_id
        )
        .then(affectedRows => {
            logger.info(`Recipe with id ${req.params.recipe_id} deleted.`);
            res.status(204).end();
        })
        .catch(next);
    })

module.exports = recipesRouter;