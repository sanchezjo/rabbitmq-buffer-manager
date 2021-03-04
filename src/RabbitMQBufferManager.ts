import {EventEmitter} from 'events';
import amqp, {Channel, Connection, Replies} from "amqplib";
import {CLOUDAMQP_URL} from "./utils/config";

export default class RabbitMQBufferManager extends EventEmitter {
    private server: Connection | null = null;
    private channel: Channel | null = null;
    connected = false;
    commandsQueue: (() => any)[] = [];

    constructor(private queue: string) {
        super();
        this.init()
    }

    send(message: string) {
        if (!this.connected) {
            const command = () => {
                this.send(message);
            }
            this.commandsQueue.push(command);

            return false;
        }

        return this.channel!.sendToQueue(this.queue, Buffer.from(message));

    }

    receive(cb: (arg:any)=>void, option: any): undefined | Promise<Replies.Consume> {
        if (!this.connected) {
            const command = () => {
                this.receive(cb, option);
            }
            this.commandsQueue.push(command);

            return;
        }
        return this.channel!.consume(this.queue, cb, option);
    }

    async init(): Promise<any>  {

        try {
            this.server = await amqp.connect(CLOUDAMQP_URL + "?heartbeat=60");
        } catch (err) {
            console.error("[AMQP]", err.message);
            return setTimeout(() => this.init(), 1000);
        }

        this.setServerEvent();

        console.log("[amqp] connected");

        try {
            this.channel = await this.server.createChannel();
        } catch (err) {
            console.error("[AMQP] channel error", err.message);
            return
        }

        this.setChannelEvent();

        await this.channel.assertQueue(this.queue, {
            durable: false
        });

        this.connected = true;
        this.emit('connected');
        this.commandsQueue.forEach(command => command())
        this.commandsQueue = [];

    }

    private setServerEvent() {
        this.server!.on("error", err => {
            if (err.message !== "Connection closing") {
                console.error("[AMQP] conn error", err.message);
            }
        });

        this.server!.on("close", () => {
            console.error("[AMQP] reconnecting");
            setTimeout(() => this.init(), 1000);
        });
    }

    private setChannelEvent() {
        this.channel!.on("close", () => {
            console.log("[AMQP] channel closed");
        })
    }



}

