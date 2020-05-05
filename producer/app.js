const express = require('express')
const RSMQPromise = require('rsmq-promise');
const app = express()
const port = 8000

const redisPort = process.env.REDIS_PORT || 6379;
const redisHost = process.env.REDIS_HOST || "127.0.0.1";
const rsmq = new RSMQPromise({ host: redisHost, port: redisPort, ns: "rsmq" });

//Middleware
app.use(function (req, res, next) {
  res.header('Content-Type', "application/json");
  res.removeHeader("X-Powered-By");
  next();
});

//Config
app.configure(function () {
  app.use(express.logger("dev"));
  app.use(express.bodyParser());
});


app.post('/messages/:qname/:times', async ({ body: { message, delay }, params: { qname, times } }, res) => {
  //Create que if it doesnt exist
  var queList = await rsmq.listQueues()
  if(!queList.includes(qname)){
    console.log("Creating new queue")
    await rsmq.createQueue({qname: qname})
  }
  //Send and compose list of sent messages
  var messageList = await Promise.all([...Array(Number(times))].map(async (_, i) => {
    let msgId = await rsmq.sendMessage({ message: JSON.stringify(message), delay, qname });
    return {id: msgId, message}
  }))

  //Send response to client
  res.send({
    messages: messageList
  });
});

app.listen(port, () => console.log(`App listening at http://localhost:${port}`))
