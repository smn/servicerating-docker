

module.exports = function (grunt) {
    grunt.loadNpmTasks('grunt-contrib-jshint');
    grunt.loadNpmTasks('grunt-mocha-test');
    grunt.loadNpmTasks('grunt-contrib-concat');
    grunt.loadNpmTasks('grunt-contrib-watch');

    grunt.initConfig({
        paths: {
            src: {
                app: {
                    servicerating: 'src/servicerating.js',
                },
                servicerating: [
                    'src/index.js',
                    'src/utils.js',
                    'src/session_length_helper.js',
                    '<%= paths.src.app.servicerating %>',
                    'src/init.js'
                ],
                all: [
                    'src/**/*.js'
                ]
            },
            dest: {
                servicerating: 'go-app-servicerating.js',
            },
            test: {
                servicerating: [
                    'test/setup.js',
                    'src/utils.js',
                    'src/session_length_helper.js',
                    '<%= paths.src.app.servicerating %>',
                    'test/servicerating.test.js'
                ],
                session_length_helper: [
                    'src/session_length_helper.js',
                    'test/session_length_helper.test.js',
                ],
            }
        },

        jshint: {
            options: {jshintrc: '.jshintrc'},
            all: [
                'Gruntfile.js',
                '<%= paths.src.all %>'
            ]
        },

        watch: {
            src: {
                files: ['<%= paths.src.all %>'],
                tasks: ['build']
            }
        },

        concat: {
            servicerating: {
                src: ['<%= paths.src.servicerating %>'],
                dest: '<%= paths.dest.servicerating %>'
            },
        },

        mochaTest: {
            options: {
                reporter: 'spec'
            },
            test_servicerating: {
                src: ['<%= paths.test.servicerating %>']
            },
            test_session_length_helper: {
                src: ['<%= paths.test.session_length_helper %>']
            }
        }
    });

    grunt.registerTask('test', [
        'jshint',
        'build',
        'mochaTest'
    ]);

    grunt.registerTask('build', [
        'concat'
    ]);

    grunt.registerTask('default', [
        'build',
        'test'
    ]);
};
