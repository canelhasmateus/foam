import { createIntercept, createConcernTopic } from "./events";
import { describe, expect, it, test } from "@jest/globals";

type CurrencyRates = {
	USD: number;
	EUR: number;
}

type TransactionData = {
	seller: string;
	buyer: string;
	price: number;
}

describe( "Concerns", () => {

	const TradeStarted = createConcernTopic<TransactionData>()
	const input        = { price: 1, buyer: "me", seller: "other" }

	it( "acts as identity if no advisors", () => {
		const intercept = createIntercept( { TradeStarted } )
		const result    = intercept.inspect( TradeStarted, input )
		expect( result ).toStrictEqual( input )
	} )

	it( "ignores advice if nullable return", () => {
		const intercept = createIntercept( { TradeStarted } )
		const link      = intercept.add( TradeStarted, data => {
			return null
		} );
		const result    = intercept.inspect( TradeStarted, input )
		expect( result ).toStrictEqual( input )
	} )

	it( "returns new content when prompted for advice", () => {
		const intercept = createIntercept( { TradeStarted } )
		intercept.add( TradeStarted, data => {
			return { ...data, price: 2 }
		} );
		const result = intercept.inspect( TradeStarted, input )
		expect( input.price ).toBe( 1 )
		expect( result.price ).toBe( 2 )
	} )

	it( "cumulatively applies advices", () => {
		const intercept = createIntercept( { TradeStarted } )
		intercept.add( TradeStarted, data => {
			return { ...data, price: 2 }
		} );
		intercept.add( TradeStarted, data => {
			return { ...data, seller: "test" }
		} );

		const result = intercept.inspect( TradeStarted, input )
		expect( result.price ).toBe( 2 )
		expect( result.seller ).toBe( "test" )
	} )

	it( "removes advice when asked", () => {
		const intercept = createIntercept( { TradeStarted } )
		const link      = intercept.add( TradeStarted, data => {
			return { ...data, price: data.price + 1 }
		} );
		intercept.remove( link )
		const result = intercept.inspect( TradeStarted, input )
		expect( result ).toStrictEqual( input )
	} )

	it( "propagates thrown errors", () => {
		const intercept = createIntercept( { TradeStarted } )
		intercept.add( TradeStarted, data => {
			throw new Error( "some error" )
		} );
		expect( () => intercept.inspect( TradeStarted, input ) ).toThrow( "some error" )
	} )


} )
