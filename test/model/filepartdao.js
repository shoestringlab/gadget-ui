const dbConfig = require( "../config/dbconfig.js" );

module.exports = init;

const pool = dbConfig.pool;

function init(){
  return dao;
}

var dao = {
  create: function( fileId, filepath, filepart, parts ){
    return new Promise( function( resolve, reject ){
          pool.getConnection()
            .then( connection => {
              connection.query(`INSERT INTO filepart ( fileId, filepath, filepart, parts )
                              VALUES ( ?, ?, ?, ? )`, [fileId, filepath, filepart, parts] )
                .then( ( results ) =>{
                  connection.end();
                  resolve( true );
                })
                .catch( err =>{
                  connection.end();
                  reject( err );
                });
            })
            .catch( err =>{
              reject( err );
            });
        });
  },
  read: function( fileId ){
    return new Promise( function( resolve, reject ){
          pool.getConnection()
            .then( connection =>{
              connection.query(`SELECT fileId, filepath, filepart, parts
                                FROM filepart
                                WHERE fileId = ?
                                ORDER BY filepart`, [fileId] )
                .then( ( results ) =>{
                  connection.end();
                  resolve( results );
                })
                .catch( err =>{
                  connection.end();
                  reject( err );
                });
            })
            .catch( err =>{
              reject( err );
            });
        });
  },
  delete: function( fileId ){
    return new Promise( function( resolve, reject ){
        pool.getConnection()
          .then( connection => {
          connection.query(`DELETE FROM filepart
                            WHERE fileId = ?`, [fileId])
            .then( ( results ) =>{
              connection.end();
              resolve( true ); // successful delete
            })
            .catch( err =>{
              connection.end();
              reject( err );
            });
          })
          .catch( err =>{
            reject( err );
          });
      });
  }
};
