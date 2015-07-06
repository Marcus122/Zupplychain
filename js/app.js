//Just config and loads the main.js file as the main entry point.

require.config({
    urlArgs: "bust=" + (new Date()).getTime(),
    baseUrl : '/js',
    deps: ["main"], //entry point for the app.
	paths: { 
        lib : './library', 
        comps : './components',
        controllers : './controllers',
        loom : './loom',
        async: './_require-plugins/async', //https://github.com/millermedeiros/requirejs-plugins asynchronous loader for google maps. // useage: 'require(['async!http://maps.google.com/maps/api/js?sensor=false'], etc..
        jqueryPlugins : "./_jquery-plugins",
        debounce : "./_jquery-plugins/jquery.ba-throttle-debounce.min"
        },
    shim :{
        "jqueryPlugins" : ["jquery"],
        "jquery-ui.min": {
            exports: "$",
            deps: ['jquery']
        },
        "debounce" : ["jquery"],
        "jqueryPlugins/jquery.scrollTo.min" : ["jquery"]
    } 
});