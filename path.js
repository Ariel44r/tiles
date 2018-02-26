const path = require('path'),
      utilsjs = require('./Utils.js'),
      utils = require('./Utils.js'),
      fs = require('fs');
var mainPath;

exports.mainPath = function(_mainPath) {
    mainPath = _mainPath;
}

exports.getPath = function(fileName) {
    return(path.resolve(fileName));
}

exports.getMainPath = function() {
    return (mainPath);
}

exports.basename = function(fileName) {
    return (path.basename(fileName));
}

exports.getFullPath = function(sqlObject){
    return(`${sqlObject.root_dir}/${sqlObject.lote}/${sqlObject.cuadrant}/${sqlObject.level_zoom}/${sqlObject.dir_1}/${sqlObject.file_name}.png`);
}

exports.getFinalPathFromObject = function(sqliteObject){
    return `${utils.finalPath}/${sqliteObject.level_zoom}/${sqliteObject.dir_1}/${sqliteObject.file_name}.png`;
}