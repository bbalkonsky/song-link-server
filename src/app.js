const express = require("express");
const app = express();
const sqlite3 = require('sqlite3').verbose();
const cors = require('cors');


// let db = new sqlite3.Database('/home/telebot/databases/log-base.db', sqlite3.OPEN_READONLY, (err) => {
let db = new sqlite3.Database('src/log-base.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

// let error_db = new sqlite3.Database('/home/telebot/databases/error-base.db', sqlite3.OPEN_READONLY, (err) => {
let error_db = new sqlite3.Database('src/error-base.db', sqlite3.OPEN_READONLY, (err) => {
    if (err) {
        console.error(err.message);
    }
    console.log('Connected to the database.');
});

function getQuery(sql, response, param=null) {
    db.serialize(() => {
        db.all(sql, param, (err, result) => {
            if (err) {
                console.error(err.message);
            }
            response.json(result);
        });
    });
}
function getPeriodDays(period) {
    result = '';
    switch (period) {
        case 'week':
            result = '-7 day';
            break;
        case 'month':
            result = '-1 month';
            break;
        case 'year':
            result = '-1 year';
            break;
        // default:
        //     response.redirect("/");
        //     return;
    }
    return result;
}

app.use(cors());

// app.use(express.static("/home/front"));
app.use(express.static(__dirname + "/dist"));

app.get("/errors", function(request, response){
    const sql = `SELECT * FROM errors`;
    error_db.serialize(() => {
        error_db.all(sql, (err, result) => {
            if (err) {
                console.error(err.message);
            }
            response.json(result);
        });
    });
});

app.get("/user/:userId", function(request, response){
    const sql = `SELECT * FROM logs WHERE user_id = ?`;
    const userId = request.params["userId"];
    getQuery(sql, response, userId);
});

app.get("/day/:dayDate", function(request, response){
    const sql = 'SELECT * FROM logs WHERE date(time) = ?';
    const parseDate = request.params["dayDate"];
    getQuery(sql, response, parseDate);
});

app.get("/period/:period", function(request, response){
    const sql = 'SELECT * FROM logs WHERE date(time) > DATE("now", ?)';
    const selectedPeriod = getPeriodDays(request.params["period"]);
    getQuery(sql, response, selectedPeriod);
});

app.get("/usersFirst/:period", function(request, response){
    const sql = 'SELECT COUNT (user_id) AS count, time FROM ' +
        '(SELECT user_id, date(MIN(time)) AS time FROM logs GROUP BY user_id ORDER BY time) AS dates ' +
        'WHERE time > DATE("now", ?) GROUP BY time';
    const selectedPeriod = getPeriodDays(request.params["period"]);
    getQuery(sql, response, selectedPeriod);
});

// app.get("/", function(request, response){
//     const sql = `SELECT * FROM logs`;
//
//     db.serialize(() => {
//         db.all(sql, (err, result) => {
//             if (err) {
//                 console.error(err.message);
//             }
//             response.json(result);
//         });
//     });
// });

const conn = app.listen(3000, '0.0.0.0');

process.on('SIGINT', () => {
    db.close();
    conn.close();
});