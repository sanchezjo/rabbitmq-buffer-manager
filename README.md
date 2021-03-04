#RabbitMQ-buffer-manager

## what is it for
***Instanciate a RabbitMq connection for both send and receive message without using cb, promise, await...**

## how it works

Add one .env file with

```env 
CLOUDAMQP_URL=here-the-url@toyour-favorite-rabbit
```

then instanciate a receiver or a sender and play
```ts
import RabbitMQBufferManager from "./src/RabbitMQBufferManager";


const listenner = new RabbitMQBufferManager('test');
listenner.receive((value) => {
    console.log(value.content.toString())
}, {noAck: true})


const sender = new RabbitMQBufferManager('test');
sender.send('hi');
sender.send('coucou');
sender.send('nihao');
```
