#!/bin/bash
echo 'Taking down node and server.js...'
forever stop server.js
pkill node
echo '...done'
echo 'Taking down mongod...'
pkill mongod
echo '...done'
echo 'server stopped.'
