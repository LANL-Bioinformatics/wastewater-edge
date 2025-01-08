# Development

## Dependencies

* node.js v20
* MongoDB

## Install the webapp

    cd installation
    ./install-local.sh
    
## Start api server

    cd webapp/server
    (change NODE_ENV=prod to NODE_ENV=dev in .env)
    npm start

## Start ui client

    cd webapp/client
    npm start

## View the website

    http://localhost:3000

## Note

- Have to restart the client when any changes made in client/.env.
- Have to restart the server when any changes made in server code or server/.env.
    
#### Restart api server

    cd webapp/server
    use Ctrl-C to stop the webapp server
    npm start

#### Restart ui client

    cd webapp/client
    use Ctrl-C to stop the webapp client
    npm start

    