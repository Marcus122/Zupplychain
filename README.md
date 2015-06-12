# Zupplychain
Zupplychain

To run app
node server

To debug app
node debug server

Commands
c - continue
n - step next
s - step in
o - step out
pause - pause running code
Breakpoints
sb() - set breakpoint
sb(line) - set breakpoint on specific line
sb('script.js',1) - set breakpoint on first line of script.js
cb() - clear breakpoint

Debugging Express. More Info - http://expressjs.com/guide/debugging.html

Windows Systems    - set DEBUG=express:* & node server
UNIX Based Systems - DEBUG=express:* node server

To Increase CMD's size to show more lines follow the instructions at - https://technet.microsoft.com/en-gb/library/bb491037.aspx

To run MongoDB

mongod

(on some installs might need the full path to mongod.exe)

/PROGRA~1/MongoDB/Server/3.0/bin/mongod.exe 

For MongoDB gui I have used https://www.npmjs.com/package/mongo-express
Need to set up config file or copy config.default.js into a new file called config.js
To run use command node app and go to http://localhost:8081


Exporting/importing Mongo data to/from json.

To export warehouse data:
/PROGRA~1/MongoDB/Server/3.0/bin/mongoexport.exe /o warehouses.json /db ZupplyChain /collection warehouses /pretty

To import warehouse data:
/PROGRA~1/MongoDB/Server/3.0/bin/mongoimport.exe  /db ZupplyChain /collection warehouses warehouses.json





Sharing Mongo databases for testing.

mongodump
or
/PROGRA~1/MongoDB/Server/3.0/bin/mongodump.exe dumps the database into a /dump folder in the current dir

mongorestore
or
PROGRA~1/MongoDB/Server/3.0/bin/mongorestore.exe updates a database from a previous /dump.

mongorestore doesn't update, only inserts, so ensure database is empty before you restore.


Server

server servers from /var/www

run 
./server.sh &
to start the server.

run 
./stop.sh
to stop it.




For MongoDB shell 
mongo

shell commands
db.help() - Show help for database methods
db.<collection>.help() - Show help on collection methods. The <collection> can be the name of an existing collection or a non-existing collection.
show dbs - Print a list of all databases on the server.
use <db> - Switch current database to <db>. The mongo shell variable db is set to the current database.
show collections - Print a list of all collections for current database
show users - Print a list of users for current database.
show profile - Print the five most recent operations that took 1 millisecond or more. See documentation on the database profiler for more information.
db.collection.find() - Find all documents in the collection and returns a cursor.
db.collection.insert() - Insert a new document into the collection.
db.collection.update() - Update an existing document in the collection.
db.collection.save() - Insert either a new document or update an existing document in the collection.
db.collection.remove() - Delete documents from the collection.
db.collection.drop() - Drops or removes completely the collection.
db.collection.ensureIndex() - Create a new index on the collection if the index does not exist; otherwise, the operation has no effect.

Google API Key
The API Key for the Google Geolocation API should be stored in the object variable "extra" in app/controller/search.js line 4.