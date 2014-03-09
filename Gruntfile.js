module.exports = function(grunt) {
  grunt.loadNpmTasks('grunt-contrib-jshint');
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
    jshint: {
      all: ["zucchi.js"]
    }
  });
  
  grunt.registerTask('default', ['jshint','docco']);
};