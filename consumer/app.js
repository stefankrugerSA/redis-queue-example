const RSMQWorker = require("rsmq-worker");
const Redis = require("redis");

const redisPort = process.env.REDIS_PORT || 6379;
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const consumingQue = process.env.REDIS_QUE || "dowork";
const redisClient = Redis.createClient({host: redisHost, port: redisPort});
const worker = new RSMQWorker(consumingQue, { host: redisHost, port: redisPort, ns: "rsmq", autostart: true });

worker.on("message", function (msg, next, id) {
    //check cache for duplicate (Redis does not gurantee once only simantics, so we need to be highly impotent)
    redisClient.get(id, (err, data) => {
        if (err) {
            console.log(err);
            return false;
        }

        if (data != null) {
            //there is a duplicate message - > maybe write to duplicate topic that can send a message to slack etc...
            console.log(`-> Duplicate consumption, msg id : ${id}`)
            next()
        } else {
            //insert new record to redis cache
            redisClient.setex(id, 3600, msg);
            // process your message
            console.log(`Message id : ${id} content: ${msg}`);
            next()
        }
    })

});

// optional error listeners
worker.on('error', function (err, msg) {
    console.log("ERROR", err, msg.id);
});
worker.on('exceeded', function (msg) {
    console.log("EXCEEDED", msg.id);
});
worker.on('timeout', function (msg) {
    console.log("TIMEOUT", msg.id, msg.rc);
});

worker.start();