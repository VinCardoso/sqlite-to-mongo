const db = require('better-sqlite3')('../can-bus-tcc/database.db', { verbose: console.log });
const request = require('request');

const update = () => {

    const row = db.prepare('SELECT * FROM data WHERE upload = ?').get(0);

    var json = {
        "ts": row.ts,
        "ts_u": row.ts_u,
        "ts_complete": row.ts_complete,
        "data_time": row.data_time,
        "mod": row.module,
        "info": row.info
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
        const query = db.prepare('UPDATE data SET upload=1 WHERE id = ?');
        query.run(row.id);
        console.log("send: " + row.id);
    });
}


update();

setInterval(update, 100);





