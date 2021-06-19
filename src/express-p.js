// async middleware handler from https://stackoverflow.com/questions/61086833/async-await-in-express-middleware
// this is for mealDB-fetches
const express = require('express');

// promise-aware handler substitute
function handleP(verb) {
    return function (...args) {
        function wrap(fn) {
            return async function(req, res, next) {
                // catch both synchronous exceptions and asynchronous rejections
                try {
                    await fn(req, res, next);
                } catch(e) {
                    next(e);
                }
            }
        }

        // reconstruct arguments with wrapped functions
        let newArgs = args.map(arg => {
            if (typeof arg === "function") {
                return wrap(arg);
            } else {
                return arg;
            }
        });
        // register actual middleware with wrapped functions
        this[verb](...newArgs);
    }
}

// modify prototypes for app and router
// to add useP, allP, getP, postP, optionsP, deleteP variants
["use", "all", "get", "post", "options", "delete"].forEach(verb => {
    let handler = handleP(verb);
    express.Router[verb + "P"] = handler;
    express.application[verb + "P"] = handler;
});

module.exports = express;