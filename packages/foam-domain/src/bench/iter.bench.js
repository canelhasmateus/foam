var Benchmark = require( 'benchmark' )

const suite = new Benchmark.Suite;

const tasks = []
for ( let i = 0; i < 10144; i++ ) {
    tasks.push( { value: Math.random() } )
}


suite
    .add( "Unroll", () => {
        let c = 0

        var iterations = Math.floor(tasks.length / 8);
        var remainder = tasks.length % 8;
        var i = 0;

        if (remainder > 0) {
            do {
                c += tasks[i++].value;
            } while (--remainder > 0);
        }

        do {
            c += tasks[i++].value
            c += tasks[i++].value
            c += tasks[i++].value
            c += tasks[i++].value
            c += tasks[i++].value
            c += tasks[i++].value
            c += tasks[i++].value
            c += tasks[i++].value
        } while (--iterations > 0);


    } )
    .add( "Index", () => {
        let a = 0
        for ( let i = 0; i < tasks.length; i++ ) {
            a += tasks[ i ].value
        }

    } )
    .add( "Loop", () => {
        let a = 0
        for ( let task of tasks ) {
            a += task.value
        }
    } )
    .add( "Reduce", () => {
        let b = tasks.reduce( ( prev, current ) => prev + current.value, 0 )
    } )
    .on( 'cycle', ( event ) => {
        console.log( String( event.target ) );
    } )
    .on( 'complete', function () {
        console.log( 'Fastest is ' + this.filter( 'fastest' ).map( 'name' ) );
    } ).run()
