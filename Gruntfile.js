module.exports = function(grunt) {
  'use strict';

  // Project configuration.
  grunt.initConfig({
    // Metadata.
    pkg: grunt.file.readJSON('package.json'),
    banner: '/*! <%= pkg.title || pkg.name %> - v<%= pkg.version %> - ' +
      '<%= grunt.template.today("yyyy-mm-dd") %>\n' +
      '<%= pkg.homepage ? "* " + pkg.homepage + "\\n" : "" %>' +
      '* Copyright (c) <%= grunt.template.today("yyyy") %> <%= pkg.author.name %>;' +
      ' Licensed <%= _.pluck(pkg.licenses, "type").join(", ") %> */\n',
    // Task configuration.
    clean: {
      files: ['dist']
    },
    frame: {
      options: {
        frame: 'src/Eventi.frame'
      },
      dist: {
        dest: 'dist/<%= pkg.name %>.js',
        src: ['src/core.js','src/fire.js','src/on.js', 'src/alias.js',
              'src/delegate.js', 'src/declare.js', 'src/key.js', 'src/location.js',
              'src/off.js', 'src/singleton.js', 'src/end.js', 'src/sequence.js', 'src/combo.js']
      },
      server: {
        dest: 'dist/<%= pkg.name %>.server.js',
        src: ['src/core.js','src/fire.js','src/on.js', 'src/alias.js',
              'src/off.js', 'src/singleton.js', 'src/end.js', 'src/sequence.js', 'src/combo.js']
      },
    },
    uglify: {
      options: {
        banner: '<%= banner %>'
      },
      dist: {
        src: 'dist/<%= pkg.name %>.js',
        dest: 'dist/<%= pkg.name %>.min.js'
      },
      server: {
        src: 'dist/<%= pkg.name %>.server.js',
        dest: 'dist/<%= pkg.name %>.server.min.js'
      },
      debug: {
        src: 'src/debug.js',
        dest: 'dist/<%= pkg.name %>.debug.min.js'
      }
    },
    compress: {
      options: {
        mode: 'gzip'
      },
      dist: {
        src: ['dist/<%= pkg.name %>.min.js'],
        dest: 'dist/<%= pkg.name %>.min.js'
      },
      server: {
        src: ['dist/<%= pkg.name %>.server.min.js'],
        dest: 'dist/<%= pkg.name %>.server.min.js'
      },
    },
    qunit: {
      files: ['test/**/*.html']
    },
    jshint: {
      gruntfile: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        src: 'Gruntfile.js'
      },
      src: {
        options: {
          jshintrc: 'src/.jshintrc'
        },
        src: ['src/*.js']
      },
      dist: {
        options: {
          jshintrc: '.jshintrc'
        },
        src: ['dist/*.js']
      },
      test: {
        options: {
          jshintrc: 'test/.jshintrc'
        },
        src: ['test/**/*.js']
      },
    },
    watch: {
      gruntfile: {
        files: '<%= jshint.gruntfile.src %>',
        tasks: ['jshint:gruntfile']
      },
      src: {
        files: '<%= jshint.src.src %>',
        tasks: ['jshint:src', 'qunit']
      },
      test: {
        files: '<%= jshint.test.src %>',
        tasks: ['jshint:test', 'qunit']
      },
    },
  });

  // These plugins provide necessary tasks.
  grunt.loadTasks('tasks');
  grunt.loadNpmTasks('grunt-contrib-clean');
  grunt.loadNpmTasks('grunt-contrib-uglify');
  grunt.loadNpmTasks('grunt-contrib-qunit');
  grunt.loadNpmTasks('grunt-contrib-jshint');
  grunt.loadNpmTasks('grunt-contrib-watch');
  grunt.loadNpmTasks('grunt-contrib-compress');

  // Default task.
  grunt.registerTask('default', ['jshint:src', 'clean', 'frame', 'jshint:dist', 'jshint:test', 'qunit', 'uglify', 'compress']);

};
