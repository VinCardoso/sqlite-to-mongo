// Import Librarys
const Database = require('better-sqlite3');
const request = require('request');
const dotenv = require('dotenv');

dotenv.config();

// Select the Log Database File
const db = Database(process.env.SQLITE_LOG_DB);
const db_file_name = process.env.SQLITE_LOG_DB;

const sendPerRequest = process.env.LOG_LINES_TO_UPDATE; // How many log lines send each request?

// Create SYNC Database and Search Last ID Updated
const sync_db = new Database(process.env.SQLITE_SYNC_DB);
// sync_db.exec("CREATE TABLE if not exists sync (id INTEGER PRIMARY KEY AUTOINCREMENT, db_file TEXT, id_on_file INTEGER, upload INTEGER )");
sync_db.exec("CREATE TABLE if not exists last_sync (id INTEGER PRIMARY KEY AUTOINCREMENT, db_file TEXT UNIQUE, last_id_sync INTEGER )");
sync_db.prepare('INSERT OR IGNORE INTO last_sync (db_file, last_id_sync) VALUES (?, ?)').run(db_file_name, 0);

var l = sync_db.prepare('SELECT last_id_sync FROM last_sync WHERE db_file = ?').get(db_file_name);

// Prepare Querys
// const query_add_to_list = sync_db.prepare('INSERT INTO sync(db_file, id_on_file, upload) VALUES(?, ?, ?)');
const query_update_last_id_sync = sync_db.prepare('UPDATE last_sync SET last_id_sync = ? WHERE db_file = ?');

// Define Request Default
const options = {
    url: process.env.API_URL,
    method: 'POST',
    headers: {
        'Content-Type': 'application/json'
    },
    json: true
};

const update = () => {

    const list = db.prepare('SELECT * FROM data WHERE id > ? LIMIT ?').all(l.last_id_sync, sendPerRequest);

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
        
        console.log({ statusCode: res.statusCode , statusMessage: res.statusMessage });
        
        if (res.statusCode >= 400 ){
            return console.log('Data not saved');
        }else{
            // list.forEach(i => {
            //     l.last_id_sync = i.id;
            //     query_add_to_list.run(db_file_name, i.id, 1)
            //     query_update_last_id_sync.run(l.last_id_sync, db_file_name)
            // });

            l.last_id_sync = list[list.length-1].id;
            console.log({ storedNumber: list.length, lastItem: l.last_id_sync});
            query_update_last_id_sync.run(l.last_id_sync, db_file_name)

        }
        
        setTimeout(update, 100);
    
    });
}

update();