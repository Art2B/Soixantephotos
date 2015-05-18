var colors = require('colors');
var fs = require('fs');
var sass = require('node-sass');

// Sass compiler
function compileSass(){
  sass.render({
    file: 'sass/main.scss',
    outFile: 'public/css/style.css',
    // outputStyle: 'compressed'
  }, function(err, result) {
    fs.writeFile('public/css/style.css', result.css, function(err){
      if(err) console.log('Error in compiling sass: ', err);
      else console.log('Sass compiled'.cyan);
    });
  });
}

compileSass();

fs.watch('sass/', function(event, filename){
  console.log('Sass files changed'.cyan);
  compileSass();
});
