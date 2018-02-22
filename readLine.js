const readLine = require('readline');

const rl = readLine.createInterface({
  input: process.stdin,
  output: process.stdout,
  prompt: 'tileMerge > '
});

exports.prompt = function(){
    rl.prompt();
}