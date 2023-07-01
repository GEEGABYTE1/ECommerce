const Pool = require('pg').Pool
const bcrypt = require('bcrypt')








const pool = new Pool({
    user: 'jaivalpatel', // username
    host: 'localhost',
    database: 'Ecommerce', // database name
    password: 'password', // pass of user
    port: 5000, // port
  })





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

var prev_store_id = 5
var prev_item_id = 103

const updateStore = (request, response) => {
    const result = request.params
    console.log(result)
    const id = prev_store_id
    const store_items = eval(result['store_items'])
    const item_stock = eval(result['item_stock'])
    const item_costs = eval(result['item_cost'])
    console.log(store_items)
    pool.query('INSERT INTO stores (id, store_items, item_stock, item_cost) VALUES ($1, $2, $3, $4);', [id, store_items, item_stock, item_costs], (error, results) => {
        if (error) {
            throw error
        }
        prev_store_id += 1
        return response.status(200).json(results.rows)
        
    })
    for (let i =0; i <= store_items.length; i++) {
        console.log(i)
        const current_item_name = store_items[i]
        const store_id = prev_store_id 
        var item_id = prev_item_id
        var stock = Math.floor((Math.random() * 100) + 1);
        pool.query('INSERT INTO items (id, store_id, amount_supplied, item_name) VALUES ($1, $2, $3, $4);', [item_id, store_id, stock, current_item_name]), (error, results) => {
            if (error) {
                console.log(error)
            }
            prev_item_id += 1
            return response.status(200).json(results.rows)
        }
    }

}

var prev_user_id = 14

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

const searchItemById = (request, response) => {
    const result = request.params
    const search_item_id = result['id']
    const num_id = parseInt(search_item_id)
    console.log("Num Id: ", num_id)
    pool.query('SELECT * FROM items WHERE id = $1;', [num_id], (error, results) => {
        if (error) {
            throw error
        } else {
            response.status(200).json(results.rows)
        }
})
    
}

const searchItemByName = (request, response) => {
    const result = request.params
    const name = result['name']
    console.log("Item name: ", name)
    pool.query('SELECT * FROM items WHERE item_name = $1;', [name], (error, results) => {
        if (error) {
            throw error
        } else {
            response.status(200).json(results.rows)
        }
    })

}

const searchStoreById = (request, response) => {

    const result = request.params
    const str_id = result['id']
    console.log("Id: ", str_id)
    const num_id = parseInt(str_id)
    pool.query('SELECT * FROM stores WHERE id = $1', [num_id], (error, results) => {
        if (error) {
            throw error
        } else{
            response.status(200).json(results.rows)
        }
    })
}

const getUserInfo = (request, response) => {
    const result = request.params
    console.log('Result: ', result)
    const user_email = result['email']
    pool.query('SELECT (id, customer_email, items_owned, purchase_date, store_ids) FROM customer WHERE customer_email = $1;', [user_email], (error, results) => {
        if (error) {
            throw error
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const updateUserEmail = (request, response) => {
    const results = request.params
    console.log("Result: ", results)
    const prev_user_email = results['email']
    const new_user_email = results['newemail']
    pool.query('UPDATE customer SET customer_email = $1 WHERE customer_email = $2', [new_user_email, prev_user_email], (error, results) => {
        if (error) {
            throw error
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const updateUserPassword = async (request, response) => {
    const results = request.params
    console.log("Result: ", results)
    const email = results['email']
    const old_password= results['oldpassword']
    
    const new_password_str = results['newpassword']
    
    
    pool.query('SELECT customer_password FROM customer WHERE customer_email = $1', [email], async (error, results) => {
        if (error) {
            throw error
        } else {
            if (await bcrypt.compare(old_password, results.rows[0]['customer_password'])) {
                console.log("Passwords match")
                
                try {
        
                    // ensure that the user knows their old password for security 
                    
            
                    const new_password_hashed = await bcrypt.hash(new_password_str, 10)
                    if (await bcrypt.compare(old_password, new_password_hashed)) {
                        console.log("New and Old Passwords match, will not update")
                        return response.status(400)
                    } else {
                        console.log("New Password Hashed: ", new_password_hashed)
                        pool.query('UPDATE customer SET customer_password = $1 WHERE customer_email = $2;', [new_password_hashed, email], (error, results) => {
                        if (error) {
                            throw error
                        } else {
                            return response.status(200).json(results.rows)
                        }
                    })
                        
                    }
                } catch(err) {
                    console.log(err)
                }


            } else {
                console.log("passwords will not match")
                return response.status(400)
            }
        }
    })



}

module.exports = {
    getStores,
    updateStore,
    SignUp,
    pool,
    searchItemById,
    searchItemByName,
    searchStoreById,
    getUserInfo,
    updateUserEmail,
    updateUserPassword
}