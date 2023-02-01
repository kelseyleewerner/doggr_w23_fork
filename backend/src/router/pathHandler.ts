
// GET doggr.com/users
// "/users"
// GET
// handler
import {Route} from "./route";
import {matchPath} from "../lib/helpers";

export class PathHandler{

    name: string;
    path: string;
    route: Route;
    method: string;
    handler: any;

    constructor(path, handler) {
        this.handler = handler;
        this.path = path;

        this.name = handler.name || "<anonymous>";

    }

    // If the current request path matches our PathHandler's path, then run its handle function
    requestHandler(...args) {
        const handler = this.handler;
        handler ? handler(...args) : null;
    }

    match(path) {
        return matchPath(this.path, path);
    }

}


