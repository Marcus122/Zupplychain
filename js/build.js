/* 
 *
 *   requirejs buildfile for tescosubscriptions
 *   
 *
 
 HOW TO BUILD 
 
install node.js http://nodejs.org/

use node package manager to install requirejs in your node environment.

$   npm install -g requirejs

r.js.cmd is now callable from your command line.
To build a requireJS project, cd to the directory with the buildfile and run r.js.cmd -o build.js 

On windows, we cant use UNC paths for some reason when running the command, so I had to first map the share over the network to a local drive:

$   net use I: \\waapc.weaveabilitysap.com\www\com\weaveability\tescosubscriptions\test\js /USER:www Weaveability1
$   cd I:
$   r.js.cmd -o build.js 

(If you get an error about 'Multiple connections with different users' try ommiting the " /USER:www Weaveability1 " bit)


This will create the output file main.js in the folder js/dist

then update the require script tag (in the scripts template) from this:
<script data-main="/js/app/app.js" src="/js/app/require.js" type="application/javascript"/>
To this:
<script data-main="/js/dist/main.js" src="/js/app/require.js" type="application/javascript"/>


*/

({
    mainConfigFile : "./main.js", // Pulls the 'paths' through from this file.
	baseUrl : "./",					
    name: "main",					
    out: "_dist/main.js",			 // File location for the minified .js
	removeCombined: true, 			 // Doesnt copy source files to output dir.
    findNestedDependencies: true 	 // pulls all modules needed by nested require()s into the main file. This may or may not be a good thing as codebase grows but fine for now.
})

