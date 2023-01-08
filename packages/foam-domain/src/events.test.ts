import { Async, AsyncTopic, Consumer, createConsumer, createTopic, MessageBus, Subscription, Sync } from "./events";
import * as console from "console";


interface CurrencyRates {
	USD: number;
	EUR: number;
	BRL: number;
}

interface TransactionData {
	USD: number;
	EUR: number;
	BRL: number;
}

const MarketOpen  = createTopic<"MarketOpen", CurrencyRates, Async>()
const Transaction = createTopic<"Transaction", TransactionData, Sync | Async>()
const RateUpdate  = createTopic<"RateUpdate", CurrencyRates, Sync>();


type SyncTopics = typeof RateUpdate | typeof Transaction
type AsyncTopics = typeof MarketOpen | typeof Transaction

//


class Webhooks implements MessageBus<AsyncTopics> {
	//todo
	private consumers: Map<symbol, Consumer<any>[]>;

	constructor() {
		this.consumers = new Map();
	}

	subscribe<K, S extends AsyncTopic<K>>( topic: S, consumer: Consumer<K> ): Subscription {
		const old = this.consumers.get( topic.name ) || []
		this.consumers.set( topic.name, [ ...old, consumer ] )
		return consumer.id as unknown as Subscription;
	}
	create< T extends AsyncTopics>( topic: T ): Subscription {
		const old = this.consumers.get( topic.name ) || []
		this.consumers.set( topic.name, [ ...old, consumer ] )
		return consumer.id as unknown as Subscription;
	}

	publish<K>( topic: AsyncTopics, message: K ): void {
		const interested = this.consumers.get( topic.name ) || []
		for ( const consumer of interested ) {
			consumer.notify( message )
		}
	}

	cancel( pick: Subscription ): void {
	}


}

const liveChart = createConsumer( ( data: CurrencyRates ) => {
	console.log( data )
} );
const regulator = createConsumer( ( data: TransactionData ) => {
	console.log( data )
} );

const chart = new Webhooks();
chart.subscribe( MarketOpen, liveChart )
chart.subscribe( MarketOpen, regulator )

