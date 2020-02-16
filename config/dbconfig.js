
var mysql = require( 'mariadb' );

const pool = mysql.createPool({
  connectionLimit : 50,
  host            : 'localhost',
  user            : 'gadgetui_mdb',
  password        : 'password',
  database        : 'gadgetui'
});

module.exports = {
  pool: pool
};
