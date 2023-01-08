import { Async, createBus, createConsumer, createTopic, Sync } from "./events";
import * as console from "console";


type CurrencyRates = {
	USD: number;
	EUR: number;
	BRL: number;
}

type TransactionData = {
	value: number;
}

const MarketOpen  = createTopic<CurrencyRates, Async>()
const RateUpdate  = createTopic<CurrencyRates, Sync>();
const Transaction = createTopic<TransactionData, Sync | Async>()


type SyncTopics = typeof RateUpdate | typeof Transaction
type AsyncTopics = typeof MarketOpen | typeof Transaction

//


const webhooks = createBus( { MarketOpen, Transaction, RateUpdate } );
var subscribe  = webhooks.subscribe( MarketOpen, createConsumer( ( data: CurrencyRates ) => {
	console.log( data )
} ) );
webhooks.subscribe( MarketOpen, ( data: TransactionData ) => {
} )


// webhooks.subscribe( MarketOpen, regulator );

