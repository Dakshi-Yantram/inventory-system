// const mysql = require('mysql2')
// const dotenv = require('dotenv')
// dotenv.config()

// const pool = mysql.createPool({
//     host:'localhost',
//     user:'root',
//     password:'root',
//     database:'inventory'
// }).promise()



// console.log(`${process.env.SQL_LOCAL_ADDRESS}`)
// console.log(`${process.env.SQL_LOCAL_USER}`)
// console.log(`${process.env.SQL_LOCAL_PASSWORD}`)
// console.log(`${process.env.SQL_LOCAL_DATABASE}`)

// module.exports = pool;

const mysql = require('mysql2')
const dotenv = require('dotenv')

dotenv.config()

const pool = mysql.createPool({
  host: process.env.SQL_LOCAL_ADDRESS,
  user: process.env.SQL_LOCAL_USER,
  password: process.env.SQL_LOCAL_PASSWORD,
  database: process.env.SQL_LOCAL_DATABASE,
  port: process.env.SQL_LOCAL_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 5,
  queueLimit: 0,
}).promise();

console.log("✅ DB Host:", process.env.SQL_LOCAL_ADDRESS)
console.log("✅ DB User:", process.env.SQL_LOCAL_USER)
console.log("✅ DB Name:", process.env.SQL_LOCAL_DATABASE)
console.log("✅ DB Port:", process.env.SQL_LOCAL_PORT || 3306)

module.exports = pool
