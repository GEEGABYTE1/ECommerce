const Pool = require('pg').Pool
const pool = new Pool({
    user: 'jaivalpatel', // username
    host: 'localhost',
    database: 'Ecommerce', // database name
    password: 'password', // pass of user
    port: 5000, // port
  })

const bcrypt = require('bcrypt')

const getStores = (req, res) => {
    pool.query('SELECT * FROM stores', (error, results) => {
        if (error) {
            throw error
        } else{
            console.log(results.rows)
            res.status(200).json(results.rows)
        }
    })
}

var prev_store_id = 0

const updateStore = (request, response) => {
    const result = request.params
    console.log(result)
    const id = prev_store_id
    const store_items = eval(result['store_items'])
    const item_stock = eval(result['item_stock'])
    const item_costs = eval(result['item_cost'])
    console.log(store_items)
    pool.query('INSERT INTO stores (id, store_items, item_stock, item_cost) VALUES ($1, $2, $3, $4)', [id, store_items, item_stock, item_costs], (error, results) => {
        if (error) {
            throw error
        }
        response.status(200).json(results.rows)
        prev_store_id += 1
    })

}

var prev_user_id = 12

const SignUp = async (request, response) => {
    try {
        const hashedPassword = await bcrypt.hash(request.body.password, 10)
        const email = request.body.email
        const user_id = prev_user_id
        
        pool.query("INSERT INTO customer (id, customer_email, customer_password, items_owned, purchase_date, store_ids) VALUES ($1, $2, $3, ARRAY [0], ARRAY [' '], ARRAY [0])", [user_id, email, hashedPassword], (error, results) => {
            if (error) {
                throw error
            }
            prev_user_id += 1
            //return response.status(200).json(results.rows)
            
            
        })

        return response.redirect('/login')
        
    } catch (err) {
        
        console.log(err)
    }
    
    

}

module.exports = {
    getStores,
    updateStore,
    SignUp
}