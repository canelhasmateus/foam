import { Benchmark, MeasureOptions } from "kelonio";
import { createConcernTopic, createIntercept } from "./events";

type CFG = Readonly<Partial<Omit<MeasureOptions, "verify">>>;

type CurrencyRates = {
	USD: number;
	EUR: number;
}

type TransactionData = {
	seller: string;
	buyer: string;
	price: number;
}

function currencyRate(): CurrencyRates {
	return {
		USD: Math.random(),
		EUR: Math.random()
	}
}

function transactionData(): TransactionData {
	return {
		seller: Math.random().toString(),
		buyer:  Math.random().toString(),
		price:  Math.random()
	}
}

const STATIC_TOPIC       = createConcernTopic<TransactionData>()
const STATIC_TRANSACTION = transactionData();

async function benchTopicInit( benchmark: Benchmark, options: CFG ) {
	await benchmark.record( "Topic Init", () => {

		createConcernTopic<TransactionData>()

	}, options )
}

async function benchInterceptInit( benchmark: Benchmark, options: CFG ) {
	await benchmark.record( "Intercept Init", () => {

		const intercept = createIntercept( { TradeStarted: STATIC_TOPIC } );

	}, options )

}

async function benchAdditionRemoval( benchmark: Benchmark, options: CFG ) {
	const intercept = createIntercept( { STATIC_TOPIC } );
	await benchmark.record( "Addition and Removal", () => {

		const subscription = intercept.add( STATIC_TOPIC, ( _ ) => {
			return null;
		} )

		intercept.remove( subscription )

	}, options )
}

async function benchInspect( benchmark: Benchmark, advisors: number, options: CFG ) {
	const intercept = createIntercept( { TradeStarted: STATIC_TOPIC } );
	for ( let i = 0; i < advisors; i++ ) {
		intercept.add( STATIC_TOPIC, ( _ ) => {
			return null;
		} )
	}

	await benchmark.record( `${ advisors } inspect`, () => {
		intercept.inspect( STATIC_TOPIC, STATIC_TRANSACTION )

	}, options )
}


async function benchMutation( benchmark: Benchmark, advisors: number, options: CFG ) {
	const intercept = createIntercept( { TradeStarted: STATIC_TOPIC } );
	for ( let i = 0; i < advisors; i++ ) {
		intercept.add( STATIC_TOPIC, ( data ) => {
			return { ...data, price: data.price + 1 };
		} )
	}

	await benchmark.record( `${ advisors } mutation`, () => {
		intercept.inspect( STATIC_TOPIC, STATIC_TRANSACTION )

	}, options )
}

async function run() {

	const benchmark = new Benchmark();


	let options = { iterations: 1000 };
	await benchTopicInit( benchmark, options )
	await benchInterceptInit( benchmark, options )
	await benchAdditionRemoval( benchmark, options )

	await benchInspect( benchmark, 0, options )
	await benchInspect( benchmark, 1000, options )
	await benchMutation( benchmark, 1000, options )


	console.log( benchmark.report() );


}

describe( "Events benchmark", () => {

	test( "Events benchmark", async () => {
		await run()
	}, 10_000 )
} )