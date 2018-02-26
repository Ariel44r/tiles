const sharp = require('sharp'),
      fs = require('fs'),
      rl = require('./readLine.js'),
      utils = require('./Utils.js'),
      path = require('./path.js');

var flagMerge = true;
var finalPath = utils.finalPath;

exports.overlayTest = function(path1, path2, callback) {
  fs.exists(path1, (exists) => {
    if (exists == true) {
      fs.exists(path2, (exists) => {
          if (exists == true) {
            sharp(path1)
            .overlayWith(path2, { gravity: sharp.gravity.southeast } )
            .toFile(`testOverlay2/${path.basename(path1)}`, (err => {
              if(err == null){
                callback(`testOverlay2/${path.basename(path1)}`);
              } else {
                console.log(err);
              }
            }))
          } else {
            console.log(`File '${path2}' not exists`);
            callback(false);
            rl.prompt();
          }
      });
    } else {
      console.log(`File '${path1}' not exists`);
      callback(false);
      rl.prompt();
    }
  });
}

exports.overlay = function(path1, path2) {
  var oldPath = `testOverlay2/${path.basename(path1)}`;
    if (fs.existsSync(path1)) {
          if (fs.existsSync(path2)) {
            var tile = sharp(fs.readFileSync(path1));
              tile.overlayWith(path2, { gravity: 'centre' } )
              //unlinkFile(path1);
              tile.toFile(path1, (err => {
                if(err == null){
                  //callback(oldPath, id);
                  //renameFile(oldPath, path1);
                  console.log(`file merged: ${path1}`);
                } else {
                  console.log(oldPath);
                  console.log(err);
                }
              }))
          } else {
            console.log(`File2 '${path2}' not exists`);
            //callback(false);
            rl.prompt();
          }
    } else {
      console.log(`File1 '${path1}' not exists`);
      //callback(false);
      rl.prompt();
    }
}

exports.overlayRec = function(objectArray){
  overlayRecursive(objectArray);
}

function overlayRecursive(objectArray){
  var path0 = path.getFullPath(objectArray[0]);
  var path1 = path.getFullPath(objectArray[1]);
  if (fs.existsSync(path0)) {
    if (fs.existsSync(path1)) {
      var tile = sharp(fs.readFileSync(path0));
        tile.overlayWith(path1, { gravity: 'centre' } )
        tile.toFile(path0, (err => {
          if(err == null){
            objectArray.splice(1,1);
            console.log(objectArray.length);
            if(objectArray.length > 1){
              overlayRecursive(objectArray);
            } else {
              renameFile(objectArray[0]);
              console.log(`rename file to: ${path0}`);
            }
            console.log(`file merged: ${path.getFinalPathFromObject(objectArray[0])}`);
          } else {
            console.log(err);
          }
        }))
    } else {
      console.log(`File2 '${path1}' not exists`);
      //callback(false);
      rl.prompt();
    }
  } else {
    console.log(`File1 '${path0}' not exists`);
    //callback(false);
    rl.prompt();
  }
}

function renameFile(sourceObj){
  var source = path.getFullPath(sourceObj);
  var target = `${finalPath}/${sourceObj.level_zoom}/${sourceObj.dir_1}/${sourceObj.file_name}.png`;
  unlinkFile(target);
  if(fs.existsSync(source)){
    if(!fs.existsSync(target)){
      if(!fs.existsSync(`${finalPath}/${sourceObj.level_zoom}/${sourceObj.dir_1}`)){
        fs.mkdirSync(`${finalPath}/${sourceObj.level_zoom}/${sourceObj.dir_1}`, 0o777);
      }
      fs.renameSync(source, target);
      console.log('writeFile: ' + target);
      //callback(true);
      console.log('writeFile: success!');
      console.log(`source: ${source}`);
      console.log(`target: ${target}`);
    } else{
      console.log('FileNotFound: ' + target);
    }
  }
}

function unlinkFile(unlinkPath){
  if(fs.existsSync(unlinkPath)){
    fs.unlinkSync(unlinkPath);
  } else {
    console.log(`\nunlinkFile: '${unlinkPath}' not exists!\n`);
  }
}