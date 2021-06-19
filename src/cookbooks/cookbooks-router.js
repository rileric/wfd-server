const express = require('express');
const xss = require('xss');
const logger = require('../logger');
const CookbooksService = require('./cookbooks-service');

const cookbooksRouter = express.Router();
const bodyParser = express.json();

const serializeCookbook = cookbook => ({
    cookbook_id: cookbook.cookbook_id,
    cookbook_owner: cookbook.cookbook_owner,
    cookbook_name: xss(cookbook.cookbook_name),
    cookbook_public: cookbook.cookbook_public,
});

cookbooksRouter
    .route('/public')
    .get((req,res,next) => {
        CookbooksService.getAllPublicCookbooks(req.app.get('db'))
            .then(cookbooks => {
                res.json(cookbooks.map(serializeCookbook))
            })
            .catch(next);
    });

cookbooksRouter
    .route('/')
    .post(bodyParser, (req,res,next) => {
        const {cookbook_name } = req.body.cookbook;
        for(const [key,value] of Object.entries({cookbook_name})) {
            if(value == null) {
                logger.error(`${key} is required`);
                return res.status(400).send(`${key} is required`);
            }
        }

        const  newCookbook = req.body.cookbook;

        CookbooksService.insertCookbook(
            req.app.get('db'),
            newCookbook
        )
        .then(cookbook => {
            logger.info(`Cookbook with id ${cookbook.cookbook_id} created`)
            res
                .status(201)
                .location(`/cookbooks/${cookbook.cookbook_id}`)
                .json(serializeCookbook(cookbook))
        })
        .catch(next);
    });

    // get user cookbooks
    cookbooksRouter
    .route('/private/:user_id')
    .get((req,res,next) => {
        const user_id = req.params.user_id;
        CookbooksService.getPrivateCookbooks(req.app.get('db'), user_id)
            .then(cookbooks => {
                res.json(cookbooks.map(serializeCookbook))
            })
            .catch(next);
    });

cookbooksRouter
    .route('/:cookbook_id')
    .all((req,res,next) => {
        CookbooksService.getCookbookById(
            req.app.get('db'),
            req.params.cookbook_id
        )
        .then(cookbook => {
            if(!cookbook) {
                return res.status(404).json({
                    error: {message: 'Cookbook not found'}
                });
            }
            res.cookbooks = cookbook;
            next();
        })
        .catch(next);
    })
    .get((req,res) => {
        // TODO change to get recipes based on array of recipe_id
        res.json(serializeCookbook(res.cookbook));
    })
    .delete((req,res,next) => {
        CookbooksService.deleteCookbook(
            req.app.get('db'),
            req.params.cookbook_id
        )
        .then(affectedRows => {
            logger.info(`Cookbook with id ${req.params.cookbook_id} deleted.`);
            res.status(204).end();
        })
        .catch(next);
    })

module.exports = cookbooksRouter;