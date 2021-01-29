const mysql = require('mysql2/promise');

module.exports = async() => {

    // create the connection
    const connection = await mysql.createConnection({
        host: process.env.MYSQL_HOST || 'localhost',
        port: process.env.MYSQL_PORT || 3306,
        user: process.env.MYSQL_USER,
        password: process.env.MYSQL_PASS || process.env.MYSQL_PASSWORD,
        database: process.env.MYSQL_DB || process.env.MYSQL_DATABASE || 'sync'
    });
    // query database
    await connection.execute(
        "CREATE TABLE IF NOT EXISTS `sync` (`token` VARCHAR(60) NOT NULL primary key,`data` TEXT NOT NULL, created TIMESTAMP DEFAULT CURRENT_TIMESTAMP)"
    )

    return connection;
}

