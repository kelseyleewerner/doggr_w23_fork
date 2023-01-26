import url from "url";

// www.doggr.com -> www.doggr.com/admin
// server.use('/admin', aFunctionThatAuthenticates)
// server.use('/notAdmin', () => { console.log("Not an admin page"); });
// server.use('*', () => { console.log("Generic any path");})
// server.use(, () => { console.log("Generic any path");})
// req => doggr.com/nopage

export function request(req) {
    const parsedUrl = url.parse(`${req.headers.host}${req.url}`, true);
    const keys = Object.keys(parsedUrl);
    keys.forEach((key) => (req[key] = parsedUrl[key]));
}

