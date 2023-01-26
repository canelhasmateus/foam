var Benchmark = require( 'benchmark' )

const suite = new Benchmark.Suite;

const obj = { foo: 1, bar: 2, baz: 3, a: 4, b: 5 };
const update = { foo: 2 };
const result = { ...obj };

suite
    .add( 'Object spread', () => {
        let _ = { ...result, ...update }
    } )
    .add( 'Object.assign()', () => {
        Object.assign( result, update );
    } )
    .add( 'Keys for Each', () => {
        Object.keys( update ).forEach( ( key => {
            result[ key ] = update[ key ]
        } ) )
    } )
    .add( 'Keys for of', () => {
        for ( let key of Object.keys( update ) ) {
            result[ key ] = update[ key ]
        }
    } )
    .add( 'Keys for i', () => {
        const keys = Object.keys( update );
        for ( let i = 0; i < keys.length; i++ ) {
            const key = keys[ i ]
            result[ key ] = update[ key ]
        }
    } )
    .add( 'entries for each ', () => {
        Object.entries( update ).forEach( ( entry ) => {
            result[ entry[ 0 ] ] = entry[ 1 ]
        } )
    } )
    .add( 'entries for of ', () => {
        for ( let entry of Object.entries( update ) ) {
            result[ entry[ 0 ] ] = entry[ 1 ]
        }
    } )
    .add( 'entries for i', () => {
        const entries = Object.entries( update );
        for ( let i = 0; i < entries.length; i++ ) {
            const entry = entries[ i ]
            result[ entry[ 0 ] ] = entry[ 1 ]
        }
    } )
    .on( 'cycle', ( event ) => {
        console.log( String( event.target ) );
    } )
    .on( 'complete', function () {
        console.log( 'Fastest is ' + this.filter( 'fastest' ).map( 'name' ) );
    } ).run()