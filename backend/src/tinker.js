console.log("Hello world!");
console.log("hi 2");

// async/await

let databaseReady = () => {
    return new Promise( resolve => {
        //imagine we do some database boot
        // lets fake it by pausing for 5 seconds
        setTimeout( () => resolve("Our fake database is ready"), 1000);
    })
}

let connectToDatabase = () => {
    return new Promise( resolve => {
        setTimeout(() => resolve("Connected To Database"), 1000);
    })
}

let databaseQuery = () => {
    return new Promise( resolve => {
        setTimeout(() => resolve("Query Successful"), 1000);
    })
}

function Add(a, b) {
    return a + b;
}

async function myMain() {
    //initlogger
    Add(2, 2);
    await bootInit();
}

async function bootInit() {
    //init auth
    //init files
    return checkDatabase();
}


async function checkDatabase() {
    try {
        const dbStatus = await databaseReady();
        const dbConn = await connectToDatabase();
        const dbQuery = await databaseQuery();
    } catch (err) {

    }



    console.log("Database ready? ", dbStatus, dbConn);
    return dbStatus;
}

checkDatabase();
