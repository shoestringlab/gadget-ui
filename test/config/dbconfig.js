var mysql = require('mariadb')

const pool = mysql.createPool({
	connectionLimit: 50,
	host: 'localhost',
	user: '',
	password: '',
	database: 'gadgetui',
})

module.exports = {
	pool: pool,
}
