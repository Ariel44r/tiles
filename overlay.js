const sharp = require('sharp'),
      fs = require('fs'),
      rl = require('./readLine.js'),
      path = require('./path.js');

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

exports.overlay = function(path1, path2, id, callback) {
  var oldPath = `testOverlay2/${id}_${path.basename(path1)}`;
  fs.exists(path1, (exists) => {
    if (exists) {
      fs.exists(path2, (exists) => {
          if (exists == true) {
            sharp(path1)
            .overlayWith(path2, { gravity: sharp.gravity.southeast } )
            .toFile(oldPath, (err => {
              if(err == null){
                unlinkFile(path1);
                unlinkFile(path2);
                callback(oldPath, id);
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

function unlinkFile(unlinkPath){
  if(fs.existsSync(unlinkPath)){
    fs.unlinkSync(unlinkPath);
  } else {
    console.log(`\nunlinkFile: '${unlinkPath}' not exists!\n`);
  }
}