import { Async, Consumer, MessageBus, Sync, Topic, Trap } from "./events";


interface CurrencyRates {
	USD: number;
	EUR: number;
	BRL: number;
}

type MarketOpen = Topic<Async, CurrencyRates>;
type Transaction = Topic<Sync, CurrencyRates>;
type RateUpdate = Topic<Sync | Async, CurrencyRates>;


type AsyncTopics = Transaction | MarketOpen
type SyncTopics = Transaction | RateUpdate
type Topics = AsyncTopics | SyncTopics

//


class Exchange implements MessageBus<Topics> {
	private traps: Map<Topics, Trap<Topics>[]>;
	private consumers: Map<Topics, Consumer<Topics>[]>;

	constructor() {
		this.traps     = new Map();
		this.consumers = new Map();
	}

	set( topic: SyncTopics, trap: Trap<SyncTopics> ): any {
		const old = this.traps.get( topic ) || []
		this.traps.set( topic, [ ...old, trap ] )
		return {
			trap
		}
	}

	disarm( pick: any ): void {
		return undefined;
	}

	subscribe( topic: Topics, consumer: Consumer<Topics> ): any {
		const old = this.consumers.get( topic ) || []
		this.consumers.set( topic, [ ...old, consumer ] )
		return [ topic, consumer ];
	}

	cancel( subscription: any ): void {
		return undefined;
	}


}


test(``, () => {

	expect()
})