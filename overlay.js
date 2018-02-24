const sharp = require('sharp'),
      fs = require('fs'),
      rl = require('./readLine.js'),
      path = require('./path.js');

var flagMerge = true;

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

exports.mergeImg = function(pathArray, id){
  for(var i=1;i<pathArray.length; i++){
    flagMerge = true;
    sharpIm(pathArray[0], pathArray[i], id);
    do{
      if(i == pathArray.length-1){
        console.log(i);
      }
    } while(flagMerge);
  }
}

function sharpIm(source, target, id){
  var oldPath = `testOverlay2/${id}_${path.basename(source)}`;
  var tile = sharp(source)
    tile.overlayWith(target, { gravity: sharp.gravity.southeast } )
    flagMerge = false;
    tile.toFile(oldPath, (err => {
      if(err == null){
        //callback(oldPath, id);
        renameFile(oldPath, source);
        flagMerge = false;
      } else {
        console.log(err);
      }
    }))
}

function renameFile(source, target){
  unlinkFile(target);
  if(fs.existsSync(source)){
    if(!fs.existsSync(target)){
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