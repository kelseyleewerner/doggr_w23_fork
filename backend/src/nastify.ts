import http from "http";
import fs from "fs/promises";
import path from "path";
import {request} from "./request";
import {response} from "./response";

//https://www.expressjs.com/en/starter/hello-world.html?sort=newest?country=en_us

export function Nastify() {
    async function listen(port = 8080, cb) {
        return http
            .createServer(async (req, res) => {

                request(req);
                response(res);

                const indexFile = await fs.readFile(path.resolve(__dirname, 'public', 'index.html'))
                    .catch(err => {
                        console.error(err);
                        //send error result - 500!
                        res.setHeader('Content-Type', 'text/html');
                        res.writeHead(500);
                        return res.end(err);
                    });

                res.setHeader('Content-Type', 'text/html');
                res.writeHead(200);
                return res.end(indexFile);
            }).listen({ port }, () => {
                if (cb) {
                    if (typeof cb === 'function') {
                        return cb();
                    }
                    throw new Error('Listen callback needs to be a function');
                }
            });
    }


    function get() {}
    function post() {}

    return {
        listen,
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

