//Tom N building this file at the mo.

// to run this you will need to run 
// grunt build in the JS dir.
// grunt CLI will be required.




//Grunt is just JavaScript running in node, after all...
module.exports = function(grunt) {

  // All upfront config goes in a massive nested object.
  grunt.initConfig({
      requirejs: {
          compile: {
            options: {
              baseUrl: "./js",
              mainConfigFile: "./js/app.js",
              name: "main", 
              out: "./js/_dist/main.js",
              removeCombined: true, 			 // Doesnt copy source files to output dir.
              findNestedDependencies: true 	 // pulls all modules needed by nested require()s into the main file.
            }
          }
      },
      
      less: {
        compile: {
            options: {
                paths: ["css"]
            },
            files: {
                "./css/_dist/main.css": "./css/styles.less"
            }
        }
      },
      watch: {
          CSS: {
            files: "./css/**/*.less",
            tasks: ["less"]
          },
          JS : {
            files: "./**/*.js",
            tasks: ["requirejs"]
          }
      }
      
  });
  
  
  
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  grunt.registerTask('build', ['requirejs', 'less']);
  grunt.registerTask('development', ['watch']);
  
};