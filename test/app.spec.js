const knex = require('knex');
const fixtures = require('./wfd-fixtures');
const app = require('../src/app');
const supertest = require('supertest');

describe('App', () => {
  it('GET / responds with 200 containing "Hello, world!"', () => {
    return supertest(app)
      .get('/')
      .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
      .expect(200, 'Hello, world!');
  });
});

describe(`What's for Dinner endpoints`, () => {

  before('make knex instance', () => {
    db = knex({
      client: 'pg',
      connection: process.env.TEST_DATABASE_URL
    });
    app.set('db', db);
  });

  after('disconnect from db', () => db.destroy() );
  before('cleanup', () => db.raw('TRUNCATE TABLE wfd_cookbookrecipes, wfd_cookbooks, wfd_recipes CASCADE') );
  afterEach('cleanup', () => db.raw('TRUNCATE TABLE wfd_cookbookrecipes, wfd_cookbooks, wfd_recipes CASCADE') );

  describe(`Unauthorized requests`, () => {
    const testRecipes = fixtures.makeWFDRecipesArray();
    const testCookbooks = fixtures.makeCookbooksArray();
    const testCookbookRecipes = fixtures.makeCookbookRecipesArray();

    beforeEach('insert recipes', () => {
      return db
        .into('wfd_recipes')
        .insert(testRecipes)
    });

    beforeEach('insert cookbooks', () => {
      return db
        .into('wfd_cookbooks')
        .insert(testCookbooks)
    });

    beforeEach('insert cookbookRecipes', () => {
      return db
        .into('wfd_cookbookrecipes')
        .insert(testCookbookRecipes)
    });

    it('responds with 401 Unauthorized for GET /recipes', () => {
      return supertest(app)
        .get('/recipes/public')
        .expect(401);
    })
    
    it('responds with 401 Unauthorized for GET /cookbooks', () => {
      return supertest(app)
        .get('/cookbooks/public')
        .expect(401);
    })
  })

  describe('GET /recipes', () => {
    context('Given no recipes', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/recipes/public')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, [] );
      })
    })

    context('Given there are recipes', () => {
      const testRecipes = fixtures.makeWFDRecipesArray();

      beforeEach('insert recipes', () => {
        return db
          .into('wfd_recipes')
          .insert(testRecipes);
      })

      it('gets the recipes from the database', () => {
        return supertest(app)
          .get('/recipes/public')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testRecipes)
      })
    })
  })

  describe('GET /recipes/:recipe_id', () => {
    context('Given no recipes', () => {
      it('responds with 404', () => {
        return supertest(app)
          .get('/recipes/1')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404);
      })
    })

    context('Given there are recipes', () => {
      const testRecipes = fixtures.makeWFDRecipesArray();

      beforeEach('insert recipes', () => {
        return db
          .into('wfd_recipes')
          .insert(testRecipes);
      })

      it('gets the recipes from the database', () => {
        return supertest(app)
          .get('/recipes/1')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, testRecipes[0])
      })
    })    
  })

  describe('DELETE /recipes/:recipe_id', () => {
    context('Given no recipes', () => {
      it('responds with 404', () => {
        return supertest(app)
          .delete('/recipes/1')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(404);
      })
    })

    context('Given there are recipes', () => {
      const testRecipes = fixtures.makeWFDRecipesArray();

      beforeEach('insert recipes', () => {
        return db
          .into('wfd_recipes')
          .insert(testRecipes);
      })

      it('removes the recipe by ID from the database', () => {
        return supertest(app)
          .delete('/recipes/1')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(204)
      })
    })    
  })

  // Cookbook test cases
  describe('GET /cookbooks', () => {
    context('Given no cookbooks', () => {
      it('responds with 200 and an empty list', () => {
        return supertest(app)
          .get('/cookbooks/public')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, [] );
      })
    })

    context('Given there are cookbooks', () => {
      const testCookbooks = fixtures.makeCookbooksArray();
      const publicCookbooks = fixtures.makePublicCookbooksResultsArray();

      beforeEach('insert cookbooks', () => {
        return db
          .into('wfd_cookbooks')
          .insert(testCookbooks);
      })

      it('gets the cookbooks from the database', () => {
        return supertest(app)
          .get('/cookbooks/public')
          .set('Authorization', `Bearer ${process.env.API_TOKEN}`)
          .expect(200, publicCookbooks)
      })
    })
  })
});