import RabbitMQBufferManager from "./src/RabbitMQBufferManager";


const listenner = new RabbitMQBufferManager('test');
listenner.receive((value) => {
    console.log(value.content.toString())
}, {noAck: true})


const sender = new RabbitMQBufferManager('test');
sender.send('hi');
sender.send('coucou');




