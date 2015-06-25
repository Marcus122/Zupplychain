//Tom N building this file at the mo.

// to run this you will need to run 
// grunt build in the JS dir.
// grunt CLI will be required.




//Grunt is just JavaScript running in node, after all...
module.exports = function(grunt) {
    
    var time = new Date();
    var stamp = time.toISOString().substring(0,19);
    var dirpath = '/var/www-backup/Zupply-backup-' + stamp;
  
  // All upfront config goes in a massive nested object.
  grunt.initConfig({
      secret: grunt.file.readJSON('./secret.json'),
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
      scp: {
        options: {
            host: '10.10.20.155',
            username: 'root',
            password: '<%= secret.rootpassword %>' //need a file in root of project called secret.json that contains this- { "rootpassword" : "thePassword"}
        },
        live: {
            files: [{
                cwd: './',
                src: ["**/*", "!Gruntfile.js", "!**/node_modules/**", "!**/test/**", "!**/secret.json"],
                filter: 'isFile',
                // path on the server 
                dest: '/var/www/'
            }]
        },
      },
    sshexec: {
        backup : {
            command: "mkdir '" + dirpath + "'; mv '/var/www/'* '" + dirpath  + "/'; cp -r /var/www-backup/DB/data /var/www/data ;"  ,
            options: {
              ignoreErrors: true,
              host: '10.10.20.155',
              username: 'root',
              password: '<%= secret.rootpassword %>'
            }
          },
          startServer: {
            command: 'cd /var/www; npm install; dos2unix server.sh;dos2unix stop.sh;chmod 777 ./images;nohup /var/www/server.sh; ps;',
            options: {
              host: '10.10.20.155',
              username: 'root',
              password: '<%= secret.rootpassword %>'
            }
          },
          
      },
      less: {
        compile: {
            options: {
                paths: ["css"],
                compress : true
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
  
  grunt.loadNpmTasks('grunt-ssh');
  grunt.loadNpmTasks('grunt-scp');
  grunt.loadNpmTasks('grunt-contrib-requirejs');
  grunt.loadNpmTasks('grunt-contrib-less');
  grunt.loadNpmTasks('grunt-contrib-watch');
  
  grunt.registerTask('build', ['requirejs', 'less']);
  grunt.registerTask('development', ['watch']);
  grunt.registerTask('deploy', ['requirejs', 'less', 'sshexec:backup','scp','sshexec:startServer' ]);
  grunt.registerTask('ssh', ['sshexec']);
};