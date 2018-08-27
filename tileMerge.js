const readLine = require('readline'),
      pathVar = require('./path.js'),
      readDir = require('./readDir.js'),
      overlay = require('./overlay.js'),
      sqlite = require('./sqlite.js'),
      path = require('./path.js'),
      fs = require('fs'),
      utils = require('./Utils.js'),
      rl = readLine.createInterface({
        input: process.stdin,
        output: process.stdout,
        prompt: 'tileMerge > '
      });

var sqlObjectsRepeat = [];
var sqlRepeat = [];
var mainCounter = 0
var lenghtOfRepeatPaths = 0

var path1 = pathVar.getPath('tiles.1') + '/tiles1/0/57.png';
var path2 = pathVar.getPath('tiles.1') + '/tiles2/0/57.png';
//var path1 = '/Users/aramirez/Desktop/rootDir/lote4/11020447/16/14563/28953.png';
//var path2 = '/Users/aramirez/Desktop/rootDir/lote4/11020448/16/14563/28953.png';
sqlite.createDBandTable();

rl.prompt();

rl.on('line', (line) => {
  switch (line.trim()) {
    case 'sqlite':
      sqliteF();
      break;
    case 'path':
      pathF();
      break;
    case 'query repeat':
      sqliteQueryR();
      break;
    case 'repeat':
      repeatT();
      break;
    case 'getrepeat':
      moveToDBRepeat();
      break;
    case 'merget':
      overlayF();
      break;
    case 'merge':
      getRepeatPathsT();
      break;
    case 'clear':
      clearScreen();
      break;
    case 'onlyone':
      OnlyOneDirectory();
      break;
    case 'exit':
      console.log('Have a nice Day!');
      process.exit(0);
    default:
      console.log(`Say what? I might have heard '${line.trim()}'`);
      break;
  }
  rl.prompt();
}).on('close', () => {
  console.log('Have a great day!');
  process.exit(0);
});

//query: select * from table_name
function sqliteF() {
  var query = 'select * from pathTiles;';  
  sqlite.query(query, (resp) => {
    //console.log(resp);
    resp.forEach(row => {
      console.log(path.getFullPath(row));
    });
    rl.prompt();
  });
}

function sqliteQueryR(){
  var queryR = 'select *, count(*) from pathTiles group by file_name, level_zoom, dir_1 having count(*) > 1;';
  sqlite.query(queryR, (resp) => {
    var counter = 0;
    var rowsToUpdate = [];
    resp.forEach(row => {
      rowsToUpdate.push(row);
      counter++;
      if(counter == 900){
        console.log(counter + ' rows to update!');
        sqlite.updateRecord(rowsToUpdate);
        counter = 0;
        rowsToUpdate = [];
      }
    });
    sqlite.updateRecord(rowsToUpdate);
    console.log(rowsToUpdate.length + ' rows to update at last time');
    console.log('\n\n' + resp.length + '\n\n')
    rl.prompt();

  });
}

function moveToDBRepeat() {
  var query = 'select * from pathTiles group by file_name, level_zoom, dir_1 having count(*) > 1;';  
  sqlite.query(query, (resp) => {
    console.log(resp.length);
    var counter = 0;
    var rowsToUpdate = [];
    resp.forEach(row => {
      rowsToUpdate.push(row);
      counter++;
      if(counter == 15000){
        console.log(counter + ' rows to insert!');
        sqlite.insertRecord(rowsToUpdate, 'pathTilesRepeat');
        counter = 0;
        rowsToUpdate = [];

      }
    });
    sqlite.insertRecord(rowsToUpdate, 'pathTilesRepeat');
    console.log(rowsToUpdate.length + ' rows to insert at last time');
    console.log('\n\n' + resp.length + '\n\n')
    rl.prompt();
  });
}

function pathF() {
  rl.question('Please enter the root directory path: ', (rootPath) => {
    clearScreen();
    readDir.readDir(rootPath);
    rl.prompt();
  });
}

function overlayF() {
  console.log('merging images!');
  overlay.overlayTest(path1, path2, (oldPath) => {
    if(oldPath != false){
      unlinkFile(path1);
      unlinkFile(path2);
      fs.rename(oldPath,path1, (err) => {
        if(err){
          console.log(err);
        }
      });
    }
  });
}

function repeatF(){
  var query = 'select * from pathTilesRepeat;';  
  sqlite.query(query, (resp) => {
    console.log(resp.length);
    resp.forEach(row => {
        if(row.file_name = row.file_name){
          //const queryUpdateRepeat = `select *, rowid from pathTiles where lote='${row.lote}' and level_zoom='${row.level_zoom}' and dir_1='${row.dir_1}';`;
          const queryUpdateRepeat = `select * from pathTiles where repeat_flag=1 and file_name ='${row.file_name}' and level_zoom='${row.level_zoom}' and dir_1='${row.dir_1}';`;
          sqlite.selectRepeatRows(queryUpdateRepeat);
        }
    });
    rl.prompt(); 
  });
}

function repeatT(){
  var query = 'select * from pathTiles where repeat_flag=1;';  
  sqlite.query(query, (resp) => {
    console.log(`${resp.length} + 'tiles with repeat_flag = 1'`);
    sqlObjectsRepeat = resp
    var query2 = 'select *, count(*) from pathTiles group by file_name, level_zoom, dir_1 having count(*) > 1;';
    sqlite.query(query2, (resp2) => {
      lenghtOfRepeatPaths = resp2.length
      console.log(`${resp2.length} tiles grouped`);
      for(var i=0;i<resp2.length;i++){
        getRepeatSQLObjects(resp2[i]);
      }
      //insertSecondDB();
    });
    rl.prompt();
  });
}

function getRepeatSQLObjects(sqlObject){
  sqlite.randomStringVal((rndmString) =>{
    sqlObject.repeat = rndmString;
    for(var i=0;i<sqlObjectsRepeat.length;i++){
      var sqlObjectN = sqlObjectsRepeat[i]
      if(sqlObject != sqlObjectN && sqlObject.level_zoom == sqlObjectsRepeat[i].level_zoom && sqlObject.dir_1 == sqlObjectsRepeat[i].dir_1 && sqlObject.file_name == sqlObjectsRepeat[i].file_name){
        sqlObjectsRepeat[i].repeat = rndmString;
        mainCounter++;
        console.log(`\n progress: ${100*mainCounter/sqlObjectsRepeat.length}%`)
        sqlRepeat.push(sqlObjectsRepeat[i]);
        console.log(`\rcounter: ${sqlRepeat.length}, randomString: ${rndmString}`)
        console.log(path.getFullPath(sqlObjectN))
        const index = sqlObjectsRepeat.indexOf(sqlObjectN);
        sqlObjectsRepeat.splice(index, 1);
        console.log(`\r ${sqlObjectsRepeat.length} objects remain @ sqlObjectRepeat`)
        if (sqlRepeat.length == 150000) {
          insertSnippetSQLSecondDB(sqlRepeat)
          sqlRepeat = []
          
        }
        if (mainCounter == lenghtOfRepeatPaths) {
          insertSnippetSQLSecondDB(sqlRepeat)
          sqlRepeat = []

        }
      } else {
        //console.log(`counterNotChange: ${sqlRepeat.length}, randomString: ${rndmString}`)
        process.stdout.write(`\rcounterNotChange: ${sqlRepeat.length}, randomString: ${rndmString}`);
      }
    }
  });
}

function insertSnippetSQLSecondDB(sqlObjectSnippet){
  var maxValue = 150000;
  if(sqlRepeat.length > maxValue){
    var integer = Math.floor(sqlRepeat.length/maxValue);
    for(var h=0; h<integer; h++){
      var sqlRepeatSplit = [];
      for(var i=0;i<maxValue;i++){
        sqlRepeatSplit.push(sqlRepeat[i + h*maxValue]);
      }
      sqlite.insertRecordRepeat(sqlRepeatSplit,'pathTilesRepeat');
    }
    var integeer2 = sqlRepeat.length - integer*maxValue;
    var initVal = sqlRepeat.length - integeer2;
    sqlRepeatSplit = [];
    for(var j=initVal;j<sqlRepeat.length;j++){
      sqlRepeatSplit.push(sqlRepeat[j]);
    }
    sqlite.insertRecordRepeat(sqlRepeatSplit,'pathTilesRepeat');
  } else{
    sqlite.insertRecordRepeat(sqlObjectSnippet,'pathTilesRepeat');
  }
}

function insertSecondDB(){
  var maxValue = 150000;
  if(sqlRepeat.length > maxValue){
    var integer = Math.floor(sqlRepeat.length/maxValue);
    for(var h=0; h<integer; h++){
      var sqlRepeatSplit = [];
      for(var i=0;i<maxValue;i++){
        sqlRepeatSplit.push(sqlRepeat[i + h*maxValue]);
      }
      sqlite.insertRecordRepeat(sqlRepeatSplit,'pathTilesRepeat');
    }
    var integeer2 = sqlRepeat.length - integer*maxValue;
    var initVal = sqlRepeat.length - integeer2;
    sqlRepeatSplit = [];
    for(var j=initVal;j<sqlRepeat.length;j++){
      sqlRepeatSplit.push(sqlRepeat[j]);
    }
    sqlite.insertRecordRepeat(sqlRepeatSplit,'pathTilesRepeat');
  } else{
    sqlite.insertRecordRepeat(sqlRepeat,'pathTilesRepeat');
  }
}

function getRepeatPathsF(){
  const queryRepeatPaths = 'select *, rowid from pathTiles where repeat_flag=1;';
  sqlite.query(queryRepeatPaths, (rowsRepeat) => {
    sqlObjectsRepeat = rowsRepeat;
    rowsRepeat.forEach(row => {
      rowsRepeat.forEach(row2 => {
        //if(row.cuadrant != row2.cuadrant && row.level_zoom == row2.level_zoom && row.dir_1 == row2.dir_1 && row.file_name == row2.file_name){
        if(row.repeat=row2.repeat){ 
          overlay.overlay(path.getFullPath(row), path.getFullPath(row2), (oldPath) => {
            if(oldPath != false){
              var pathArray = [oldPath,path.getFullPath(row), path.getFullPath(row2)];
              renameFile(pathArray, (isMerged) => {
                if(isMerged){
                  unlinkFile(pathArray[0]);
                }
              });
            }
          });
        }
      });
    });
    rl.prompt();
  });
}

function getRepeatPathsT(){
  const queryRepeatPaths = 'select *, rowid from pathTilesRepeat;';
  sqlite.query(queryRepeatPaths, (rowsRepeat) => {
    sqlObjectsRepeat = rowsRepeat;
    const queryRepeatDistinct = 'select distinct repeat from pathTilesRepeat;';
    sqlite.query(queryRepeatDistinct, (repeatDistinct) => {
      for(var i=0; i<repeatDistinct.length; i++){
        overlay.overlayRec(getObjectsWithID(repeatDistinct[i]));
        console.log(`[ Progress: ${100*i/repeatDistinct.length} % ]\n`);
      }  
    });
    rl.prompt();
  });
}

function getPathWithID(rowRepeat){
  if(sqlObjectsRepeat.length != 0){
    var repeatItems = [];
    for(var i=0;i<sqlObjectsRepeat.length;i++){
      if(sqlObjectsRepeat[i].repeat == rowRepeat.repeat){
        repeatItems.push(path.getFullPath(sqlObjectsRepeat[i]));
      }
    }
    return repeatItems;
  }
}

function getObjectsWithID(rowRepeat){
  if(sqlObjectsRepeat.length != 0){
    var repeatItems = [];
    for(var i=0;i<sqlObjectsRepeat.length;i++){
      if(sqlObjectsRepeat[i].repeat == rowRepeat.repeat){
        repeatItems.push(sqlObjectsRepeat[i]);
      }
    }
    return repeatItems;
  }
}

function unlinkFile(unlinkPath){
  if(fs.existsSync(unlinkPath)){
    fs.unlinkSync(unlinkPath);
  } else {
    console.log(`\nunlinkFile: ${unlinkPath} not exists!\n`);
  }
}

/*function renameFile(pathArray, callback){
  unlinkFile(pathArray[1]);
  //unlinkFile(pathArray[2]);
  fs.readFile(pathArray[0], (err, data) => {
    //if(err){throw err}
    if(data){
      fs.writeFile(pathArray[1],data, (err) => {
        console.log('writeFile: ' + pathArray[1]);
        callback(true);
      });
    }
  });
}*/

var notFound = [];

function renameFile(pathArray, callback){
  unlinkFile(pathArray[1]);
  if(fs.existsSync(pathArray[0])){
    if(!fs.existsSync(pathArray[1])){
      fs.renameSync(pathArray[0], pathArray[1]);
      console.log('writeFile: ' + pathArray[1]);
      unlinkFile(pathArray[0]);
      unlinkFile(pathArray[2]);
      callback(true);
    } else{
      console.log('FileNotFound: ' + pathArray[1]);
    }
  }
}

var alreadyExists = [];

function OnlyOneDirectory(){
  var finalPath = utils.finalPath;
  console.log('getting paths OnlyOneDirectory!\n');
  const query = 'select distinct cuadrant from pathTiles;';
  sqlite.query(query, (cuadrants) => {
    cuadrants.forEach(cuadrant => {
      var counterProgress = 0;
      const query2 = `select *, rowid from pathTiles where cuadrant='${cuadrant.cuadrant}' and repeat_flag=0 and level_zoom>0;`;
      sqlite.query(query2, (objects) => {
        objects.forEach(sqliteObject => {
          counterProgress++;
          if(sqliteObject.cuadrant != ''){
            if(!fs.existsSync(`${finalPath}/${sqliteObject.level_zoom}/${sqliteObject.dir_1}`)){
              fs.mkdirSync(`${finalPath}/${sqliteObject.level_zoom}/${sqliteObject.dir_1}`, 0o777)
            }
            const path_1 = `${path.getFullPath(sqliteObject)}`;
            const path_2 = `${finalPath}/${sqliteObject.level_zoom}/${sqliteObject.dir_1}/${sqliteObject.file_name}.png`;
            var pathArray = [path_1, path_2];
            moveFile(pathArray);
            console.log(`\n\nCuadrant: ${cuadrant.cuadrant}`);
            console.log(`[ progress: ${100*counterProgress/objects.length} % ]`);
          }
        })
        alreadyExists.forEach(element => {
          console.log(`already exists: ${element}`);
        });
        console.log(`already exits: contain ${alreadyExists.length} elements`);
      });
    });
  });
}

function moveFile(pathArray){
  //unlinkFile(pathArray[1]);
  if(fs.existsSync(pathArray[0])){
    if(!fs.existsSync(pathArray[1])){
      fs.renameSync(pathArray[0], pathArray[1]);
      console.log('move file: success! :D');
      console.log(`source: ${pathArray[0]}`);
      console.log(`target: ${pathArray[1]}`);
      //callback(true);
    } else{
      alreadyExists.push(pathArray[1]);
    }
  }
}

function clearScreen() {
  console.clear();
}