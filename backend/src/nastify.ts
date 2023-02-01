import http from "http";
import fs from "fs/promises";
import path from "path";
import {request} from "./request";
import {response} from "./response";
import {checkMiddlewareInputs, matchPath} from "./lib/helpers";
import {Router} from "./router/router";

//https://www.expressjs.com/en/starter/hello-world.html?sort=newest?country=en_us

// path ("/admin")
// parameters (":userId")
// http verb (GET POST)
// handler fn (describes what to do with a request at a given path)
// /admin
// -GET => execute myAdminFnHandler
// -POST => execute MyPostFnHandler
// Router => Route[] => PathHandler(Maps GET/POST to a specific function handler)

export function Nastify() {
    const middlewares = [];
    const router = new Router();

    async function listen(port = 8080, cb) {
        return http
            .createServer(async (req, res) => {

                request(req);
                response(res);
                handleMiddleware(req, res, () => router.handle(req, res));


            }).listen({ port }, () => {
                if (cb) {
                    if (typeof cb === 'function') {
                        return cb();
                    }
                    throw new Error('Listen callback needs to be a function');
                }
            });
    }

    function handleMiddleware(req, res, cb) {
        req.handler = cb;
        const next = findNext(req, res);
        next();
    }

    /*
    app.use("/admin", () => ValidateInputs());
    app.get("/admins"
    app.use("/admin", () => DBSanitize());
    middlewares => [ValidateInputs, DBSanitize]
    this.middlewares[0] => validateinputs
     */
    function findNext(req, res) {
        let current = -1;

        const next = () => {
            current += 1;
            const middleware = middlewares[current];

            const { matched = false, params = {} }
                = middleware ? matchPath(middleware.path, req.pathname) : {};

            if (matched) {
                console.log("Middleware for path found");
                req.params = params;
                middleware.handler(req, res, next);
            } else if (current <= middlewares.length) {
                next();
            } else {
                // we're done with middleware execution
                req.handler(req, res);
            }
        }

        return next;
    }



    /* lecture question info
    app.use("hello", myNonAnonFn, "george")
    app.use(7, myNonAnonFn, "hello")
    let myNonAnonFn = function() {
        console.log("hi");
    }

    Code example
    app.use("/admin", AuthorizeUser);
     */
    function use(...args) {
       const { path, handler } = checkMiddlewareInputs(args);

       middlewares.push({
           path,
           handler
       });
    }

    function get(...args) {
        const { path, handler } = checkMiddlewareInputs(args);
        return router.get(path, handler);
    }
    function post(...args) {
        const { path, handler } = checkMiddlewareInputs(args);
        return router.post(path, handler);
    }

    return {
        listen,
        use,
        get,
        post
    }
}

// let app = Nastify();
// app.listen();

/*

function MyJSObjectWithUserName() {
    function getUserName() {
     return "john";
    }

    return {
     getUserName
    }
}

let count = 5;
let myFunc = MyJsObjectWithUserName;
myFunc.MyJsObj...

let myUserName = MyJSObjectWithUserName();
console.log(myUserName.getUserName()) => // "john"

const express = require('express')
const app = express()
const port = 3000

app.get('/', (req, res) => {
    res.send('Hello World!')
})

app.listen(port, () => {
    console.log(`Example app listening on port ${port}`)
})
*/

