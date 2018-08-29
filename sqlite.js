var sqlite3 = require('sqlite3').verbose(),
    db = new sqlite3.Database('./database.db'),
    path = require('./path.js'),
    fs = require('fs'),
    randomString = require('randomstring'),
    rl = require('./readLine.js'); 

exports.createDBandTable = function(){
    const dbPath = path.getPath('') + '/database.db';

    console.log(dbPath)
    if(fs.existsSync(dbPath)) {
      console.log('database.db was created before');
    } else {
      fs.openSync(dbPath, 'w');
      console.log('database.db is being created');
    }
    var createTableSQL = 'CREATE TABLE IF NOT EXISTS pathTiles (root_dir varchar(255) NOT NULL,lote varchar(255),cuadrant varchar(255),level_zoom varchar(255),dir_1 varchar(255),file_name varchar(255),repeat integer,repeat_flag integer);';
    db.run(createTableSQL);
    createTableSQL = 'CREATE TABLE IF NOT EXISTS pathTilesLevel16 (root_dir varchar(255) NOT NULL,lote varchar(255),cuadrant varchar(255),level_zoom varchar(255),dir_1 varchar(255),file_name varchar(255),repeat integer,repeat_flag integer);';
    db.run(createTableSQL);
    createTableSQL = 'CREATE TABLE IF NOT EXISTS pathTilesLevel15 (root_dir varchar(255) NOT NULL,lote varchar(255),cuadrant varchar(255),level_zoom varchar(255),dir_1 varchar(255),file_name varchar(255),repeat integer,repeat_flag integer);';
    db.run(createTableSQL);
    createTableSQL = 'CREATE TABLE IF NOT EXISTS pathTilesLevel14 (root_dir varchar(255) NOT NULL,lote varchar(255),cuadrant varchar(255),level_zoom varchar(255),dir_1 varchar(255),file_name varchar(255),repeat integer,repeat_flag integer);';
    db.run(createTableSQL);
    createTableSQL = 'CREATE TABLE IF NOT EXISTS pathTilesRepeat (root_dir varchar(255) NOT NULL,lote varchar(255),cuadrant varchar(255),level_zoom varchar(255),dir_1 varchar(255),file_name varchar(255),repeat integer,repeat_flag integer);';
    db.run(createTableSQL);
    createTableSQL = 'CREATE TABLE IF NOT EXISTS pathTilesRepeatLevel16 (root_dir varchar(255) NOT NULL,lote varchar(255),cuadrant varchar(255),level_zoom varchar(255),dir_1 varchar(255),file_name varchar(255),repeat integer,repeat_flag integer);';
    db.run(createTableSQL);
    createTableSQL = 'CREATE TABLE IF NOT EXISTS pathTilesRepeatLevel15 (root_dir varchar(255) NOT NULL,lote varchar(255),cuadrant varchar(255),level_zoom varchar(255),dir_1 varchar(255),file_name varchar(255),repeat integer,repeat_flag integer);';
    db.run(createTableSQL);
    createTableSQL = 'CREATE TABLE IF NOT EXISTS pathTilesRepeatLevel14 (root_dir varchar(255) NOT NULL,lote varchar(255),cuadrant varchar(255),level_zoom varchar(255),dir_1 varchar(255),file_name varchar(255),repeat integer,repeat_flag integer);';
    db.run(createTableSQL);
}

exports.insertRecord = function(jsonArray, table){
    buildSQLinsert(jsonArray, table, (sqlInsertQ) => {
        db.run(sqlInsertQ, (err, resp) => {         //asynch form
            if(err){throw err}
            console.log(`'${jsonArray[jsonArray.length-1].lote}' insert ${jsonArray.length} records success on ${table}`);
            rl.prompt();
        });      
    });
}

exports.insertRecordRepeat = function(jsonArray, table){
    buildSQLinsertRepeat(jsonArray, table, (sqlInsertQ) => {
        db.run(sqlInsertQ, (err, resp) => {         //asynch form
            if(err){throw err}
            console.log(`${jsonArray[jsonArray.length-1].lote}, level: ${jsonArray[jsonArray.length-1].level_zoom}: insert ${jsonArray.length} records success on ${table}`);
            rl.prompt();
        });      
    });
}

exports.query = function(query, callback){
    //Perform SELECT Operation
    db.all(query, function(err,rows){
        //rows contain values while errors, well you can figure out.
        if(err){throw err}
        else{
            callback(rows);
        }
    });
}

function randomStringVal(callback) {
    callback(randomString.generate({
        length: '12',
        charset: 'numeric'
    }));
}

exports.randomStringVal = function (callback) {
    callback(randomString.generate({
        length: '12',
        charset: 'numeric'
    }));
}

function buildSQLinsert(jsonArray_, table, callback){
    var sql = `insert into ${table} values`;
    var counter = 0;
    jsonArray_.forEach(element => {
        counter++;
        if (counter == jsonArray_.length){
            sql = sql +`('${element.root_dir}','${element.lote}','${element.cuadrant}','${element.level_zoom}','${element.dir_1}','${element.file_name}',0,0);`;
            //console.log(sql);
            callback(sql);
        } else{
            sql = sql + `('${element.root_dir}','${element.lote}','${element.cuadrant}','${element.level_zoom}','${element.dir_1}','${element.file_name}',0,0),`;
        }
    });
}

function buildSQLinsertRepeat(jsonArray_, table, callback){
    var sql = `insert into ${table} values`;
    var counter = 0;
    jsonArray_.forEach(element => {
        counter++;
        if (counter == jsonArray_.length){
            sql = sql +`('${element.root_dir}','${element.lote}','${element.cuadrant}','${element.level_zoom}','${element.dir_1}','${element.file_name}',${element.repeat},0);`;
            //console.log(sql);
            callback(sql);
        } else{
            sql = sql + `('${element.root_dir}','${element.lote}','${element.cuadrant}','${element.level_zoom}','${element.dir_1}','${element.file_name}',${element.repeat},0),`;
        }
    });
}

exports.selectRepeatRows = function(queryRepeatRows){
    db.all(queryRepeatRows, (err, rows) => {
        if (err) {
            throw err;
        } else {
            for(var h=0;h<rows.length;h++){
                for(var i=0;i<rows.length;i++){
                    console.log(rows[h]);
                    console.log(rows[i]);
                    console.log("\n");
                    if(rows[h] != rows[i]){
                        if(rows[h].file_name == rows[i].file_name){
                            randomStringVal((rndmString) => {
                                console.log(rndmString);
                                console.log(path.getFullPath(rows[h]));
                                console.log(path.getFullPath(rows[i]));
                                var queryUpdate = `update pathTilesRepeat set repeat=${rndmString} where (repeat_flag=1 and file_name ='${rows[h].file_name}' and level_zoom='${rows[h].level_zoom}' and dir_1='${rows[h].dir_1}') or (repeat_flag=1 and file_name ='${rows[i].file_name}' and level_zoom='${rows[i].level_zoom}' and dir_1='${rows[i].dir_1}');`;
                                updateRecordSQL(queryUpdate);
                            });
                        }
                    }
                }
            }
        }
    });
}

function updateRecordSQL(sqlUpdateQ){
    db.run(sqlUpdateQ, (err) => {
        if(err){throw err}
        else{
            console.log('update record success!');
            rl.prompt();
        }
    });
}

exports.updateRecord = function(jsonArray){
    buildSQLUpdate(jsonArray, (sqlUpdateQ) => {
        db.run(sqlUpdateQ, (err) => {
            if(err) {throw err}
            else {
                console.log(`Update ${jsonArray.length} elements success!`);
            }
            rl.prompt();
        }); 
    });
}

function buildSQLUpdate(jsonArray_, callback){
    var sql = `update pathTiles set repeat_flag=1 where `;
    var counter = 0;
    jsonArray_.forEach(element => {
        counter++;
        if (counter == jsonArray_.length){
            sql = sql +`(file_name='${element.file_name}' and level_zoom='${element.level_zoom}' and dir_1='${element.dir_1}');`;
            //console.log(sql);
            callback(sql);
        } else{
            sql = sql + `(file_name='${element.file_name}' and level_zoom='${element.level_zoom}' and dir_1='${element.dir_1}') or `;
        }
    });
}
