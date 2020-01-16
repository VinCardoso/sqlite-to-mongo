const dotenv = require('dotenv');
dotenv.config();

// const db = require('better-sqlite3')(process.env.SQLITE_FILE, { verbose: console.log });
const db = require('better-sqlite3')(process.env.SQLITE_FILE)
const request = require('request');

const options = {
    url: process.env.API_URL,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    json: true
};

const query_update_id = db.prepare('UPDATE data SET upload=1 WHERE id = ?');

const update = () => {

    const list = db.prepare('SELECT * FROM data WHERE upload = ? LIMIT 50').all(0);

    var json = list.map(u => ({ 
        ts: u.ts, 
        ts_u: u.ts_u,
        ts_complete: u.ts_complete,
        data_time: u.data_time,
        mod: u.module,
        info: u.info
    }));

    options.body = json;

    request.post(options, (err, res, body) => {
        if (err) {
            return console.log(err);
        }
        list.forEach(i => {
            query_update_id.run(i.id)
            console.log({ id_change: i.id});
        });
        
        setTimeout(update, 100);
    
    });
}

update();