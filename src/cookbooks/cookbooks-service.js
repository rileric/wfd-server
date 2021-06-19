const cookbooksTable = 'wfd_cookbooks';
const bridgeTable = 'wfd_cookbookRecipes';
const recipesTable = 'wfd_recipes';

const CookbooksService = {

    getAllPublicCookbooks(knex) {
        return knex
            .select('*')
            .from(cookbooksTable)
            .where('cookbook_public', 'true')
            .orWhere('cookbook_owner', '1'); // default user
    },

    getPrivateCookbooks(knex, user_id) {
        return knex
            .select('*')
            .from(cookbooksTable)
            .where('cookbook_owner', user_id)
            .andWhere('cookbook_public', 'false'); // already grabbed public cookbooks
    },

    getCookbookRecipeIDs(knex, cookbook_id) {
        return knex
            .from(bridgeTable)
            .select('recipe_id')
            .where({cookbook_id});    
    },

    insertCookbook(knex, newCookbook) {
        return knex
            .insert(newCookbook)
            .into(cookbooksTable)
            .returning('*')
            .then(rows => {
                return rows[0];
            });
    },

    deleteCookbook(knex, cookbook_id) {
        return knex
            .from(cookbooksTable)
            .where({cookbook_id})
            .delete();
    }

};
module.exports = CookbooksService;