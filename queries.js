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

var prev_id = 0

const signIn = (request, response) => {
    const name = request.params['username']
    const password = request.params['password']
    const random_id = prev_id 
    console.log('Name: ', name)
    console.log('Password: ', password)
    pool.query("INSERT INTO customer (id, customer_name, customer_password, items_owned, purchase_date, store_ids) VALUES ($1, $2, $3, ARRAY['*'], ARRAY['*'], ARRAY[0]) ", [random_id, name, password], (error, results) => {
        if (error) {
            throw error
        } else {
            response.status(200).json(results.rows)
            prev_id += 1
        }
    })

    

}
   


module.exports = {getStores, getItems, getCustomers, signIn}