module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-docco');
  
  // Project configuration.
  grunt.initConfig({
    docco: {
      main: {
        src: ['zucchi.js'],
        options: {
          output: 'docs/'
        }
      }
    },
    uglify: {
      all: {
        files: {
          'zucchi-min.js': ['zucchi.js']
        }
      }
    },
    jshint: {
      all: ["zucchi.js"]
    }
  });
  
  grunt.registerTask('default', ['jshint', 'uglify', 'docco']);
};