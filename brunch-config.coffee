module.exports = config:
    files:
        javascripts:
            joinTo:
                'libs.js': /^(bower_components|vendor)/
                'lida.js': /^app/
        stylesheets:
            joinTo: 'lida.css'
    paths:
        watched: ['app', 'vendor']
        public: 'public_html'
