#!/bin/bash
echo 'killing running server processes'
forever stop server.js
pkill nano
pkill mongod
echo 'starting mongod'
mongod --dbpath="/var/www/data" >> /var/mongo.log 2>&1 &
echo 'done'
echo 'forever is starting server.js'
forever server.js live >> /var/node.log 2>&1 &
echo 'done'
echo 'Started Node (server.js) and Mongo DB, startup logfiles are /var/node.log and /var/mongo.log respectively'
echo './stop.sh to kill the server'
