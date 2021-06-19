const recipesTable = 'wfd_recipes';

const RecipesService = {

    getAllPublicRecipes(knex) {
        return knex
            .select('*')
            .from(recipesTable)
            .where('recipe_public', 'true')
            .orWhere('recipe_owner', '1'); // default user
    },

    getPrivateRecipes(knex, user_id) {
        return knex
            .select('*')
            .from(recipesTable)
            .where('recipe_owner', user_id)
            .andWhere('recipe_public', 'false'); // already grabbed public recipes
    },

    getRecipeById(knex, recipe_id) {
        return knex
            .from(recipesTable)
            .select('*')
            .where({recipe_id})
            .first();
    },

    getRecipesByCategory(knex, recipe_category) {
        return knex
            .from(recipesTable)
            .select('*')
            .where({recipe_category});
    },

    getRecipesByCuisine(knex, recipe_cuisine) {
        return knex
            .from(recipesTable)
            .select('*')
            .where({recipe_cuisine});
    },

    insertRecipe(knex, newRecipe) {
        return knex
            .insert(newRecipe)
            .into(recipesTable)
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },

    deleteRecipe(knex, recipe_id) {
        return knex
            .from(recipesTable)
            .where({recipe_id})
            .delete();
    }
}

module.exports = RecipesService;