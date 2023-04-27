"use strict";
const Broker = require("@sap/sbf");

const broker = new Broker({
    autoCredentials: true,
    enableAuditLog: false,
    hooks: {
        onBind(params, callback){
            const credentials = {
                grant_type: 'client_credentials',
                saasregistryenabled: false
            };

            callback(null, { credentials });
        }
    }
});

const server = broker.start();

server.on("error", err => console.error(err));
server.on("listening", () => console.log("Server started"));
