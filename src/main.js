const express = require("express");
const app = express();
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');


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

// app.use(express.static(__dirname + "/dist"));

app.get("/user/:userId", function(request, response){
    const sql = `SELECT * FROM logs WHERE user_id = ?`;
    const userId = request.params["userId"];

    db.serialize(() => {
        db.all(sql, userId, (err, result) => {
            if (err) {
                console.error(err.message);
            }
            response.json(result);
        });
    });
});

app.get("/day/:dayDate", function(request, response){
    const sql = 'SELECT * FROM logs WHERE date(time) = ?';
    const parseDate = request.params["dayDate"];

    db.serialize(() => {
        db.all(sql, parseDate, (err, result) => {
            if (err) {
                console.error(err.message);
            }
            response.json(result);
        });
    });
});

app.get("/period/:period", function(request, response){
    const sql = 'SELECT * FROM logs WHERE date(time) > DATE("now", ?)';
    let selectedPeriod = '';
    switch (request.params["period"]) {
        case 'week':
            selectedPeriod = '-7 day';
            break;
        case 'month':
            selectedPeriod = '-1 month';
            break;
        case 'year':
            selectedPeriod = '-1 year';
            break;
        default:
            response.redirect("/");
            return;
    }

    db.serialize(() => {
        db.all(sql, selectedPeriod, (err, result) => {
            if (err) {
                console.error(err.message);
            }
            response.json(result);
        });
    });
});

app.get("/", function(request, response){
    const sql = `SELECT * FROM logs`;

    db.serialize(() => {
        db.all(sql, (err, result) => {
            if (err) {
                console.error(err.message);
            }
            response.json(result);
        });
    });
});

app.listen(3000);