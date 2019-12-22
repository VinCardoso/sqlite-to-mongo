const db = require('better-sqlite3')('../can-bus-tcc/database.db');
const request = require('request');



const update = () => {
    const row = db.prepare('SELECT * FROM data WHERE upload = ?');
    const cat = row.get(0);

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
        const query = db.prepare('UPDATE data SET upload=1 WHERE ts_complete = ?');
        query.run(cat.ts_complete);
        console.log("send: " + cat.ts_complete);
    });
}


update();

setInterval(update, 20);





