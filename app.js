const db = require('better-sqlite3')('../can-bus-tcc/database.db');
const request = require('request');

const row = db.prepare('SELECT * FROM data WHERE upload = ?');
const cat = row.get(0);

// console.log(cat);

var json = {
    "ts": cat.ts,
    "ts_u": cat.ts_u,
    "ts_complete": cat.ts_complete,
    "data_time": cat.data_time,
    "mod": cat.mod,
    "info": cat.info
};

var options = {
    url: 'http://localhost:3000/api/data',
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    json: true,
    body: json
};


request.post(options, (err, res, body) => {
    if (err) {
        return console.log(err);
    }
    console.log(body);
});
