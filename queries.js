const Pool = require('pg').Pool

const pool = new Pool({
    user: 'jaivalpatel',
    host: 'localhost',
    database: 'ecommerce',
    password:'password',
    port: 5000

})


const getStores = (request, response) => {
    pool.query('SELECT * FROM stores', (error, results) => {
        if (error) {
            console.log("error")
            throw error
        }
        response.status(200).json(results.rows)
    })
}

const getItems = (request, response) => {
    pool.query('SELECT * FROM items', (error, results) => {
        if (error) {
            console.log("error")
            throw error
        }

        response.status(200).json(results.rows)
    })
}

const getCustomers = (request, response) => {
    pool.query('SELECT * FROM customer', (error, results) => {
        if (error) {
            console.log("error")
            throw error
        }

        response.status(200).json(results.rows)
    })
}


module.exports = {getStores, getItems, getCustomers}