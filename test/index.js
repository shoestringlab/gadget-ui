const express = require( 'express' );
const app = express();
const cuid = require( 'cuid' );

app.use( express.static( './' ) );
//app.use( "/dist", express.static( '../dist' ) );
app.use( "/", express.static( '../' ) );

app.post( "/upload", function( req, res){
    let args = {
      id: req.get("x-id"),
      filename: req.get( "x-filename" ),
      filesize: req.get( "x-filesize" ),
      part: req.get( "x-filepart" ),
      parts: req.get( "x-parts" ),
      contentlength: req.get( "Content-Length" ),
      mimetype: req.get( "x-mimetype" )
    };

    if( parseInt( args.part, 10 ) === 1 ){
      args.id = cuid();
    }

    console.log( args );
    res.set("x-Id", args.id );
    res.end("");
});

// set our listener
var server = app.listen( 8000, function(){

});
