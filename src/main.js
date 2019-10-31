const express = require("express");
const app = express();
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');

let responseResult;

let db = new sqlite3.Database('src/log-base.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});



// db.close((err) => {
//     if (err) {
//         console.error(err.message);
//     }
//     console.log('Close the database connection.');
// });

app.use(cors());

app.get("/user/:userId", function(request, response){
    const sql = `SELECT * FROM logs WHERE user_id = ?`;
    const userId = request.params["userId"];

    db.serialize(() => {
        db.all(sql, userId, (err, response) => {
            if (err) {
                console.error(err.message);
            }
            responseResult = response;
        });
    });
    response.json(responseResult);
});

app.get("/day/:dayDate", function(request, response){
    const sql = 'SELECT * FROM logs WHERE time < :today AND time > :yesterday';
    response.json(request.params["dayDate"]);
});

app.get("/period/:startDate", function(request, response){
    const sql = 'SELECT * FROM logs WHERE time > ?';
    const startDate = request.params["startDate"];

    db.serialize(() => {
        db.all(sql, startDate, (err, response) => {
            if (err) {
                console.error(err.message);
            }
            responseResult = response;
        });
    });
    response.json(responseResult);
});

app.get("/", function(request, response){
    const sql = `SELECT * FROM logs`;

    db.serialize(() => {
        db.all(sql, (err, response) => {
            if (err) {
                console.error(err.message);
            }
            responseResult = response;
        });
    });
    response.json(responseResult);
});

app.listen(3000);