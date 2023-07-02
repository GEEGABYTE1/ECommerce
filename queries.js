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

var prev_store_id = 1
var prev_item_id = 0

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
        } else {
            console.log("It was added to stores table")
            for (let i =0; i < store_items.length; i++) {
                console.log(i)
                const current_item_name = store_items[i]
                const store_id = prev_store_id 
                var item_id = prev_item_id
                var stock = item_stock[i]
                pool.query('INSERT INTO items (id, store_id, amount_supplied, item_name) VALUES ($1, $2, $3, $4);', [item_id, store_id, stock, current_item_name]), (error, results) => {
                    if (error) {
                        console.log(error)
                    }
                    
                    console.log("it worked")
                    //return response.status(200).json(results.rows)
                }
                prev_item_id += 1
            }
            prev_store_id += 1
            response.status(200).send("Store Added Successfully with Stock")
        }
        
                
    })



    

}

var prev_user_id = 0

const SignUp = async (request, response) => {
    try {
        const hashedPassword = await bcrypt.hash(request.body.password, 10)
        const email = request.body.email
        const user_id = prev_user_id
        
        
        pool.query("INSERT INTO customer (id, customer_email, customer_password, items_owned, purchase_date, store_ids, customer_cart, wallet_amount) VALUES ($1, $2, $3, ARRAY [0], ARRAY [' '], ARRAY [0], ARRAY[' '], 100.00)", [user_id, email, hashedPassword], (error, results) => {
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

const getCart = (request, response) => {
    const email = request.params['email']
    console.log("Cart of Email: ", email)
    pool.query("SELECT customer_cart FROM customer WHERE customer_email = $1;", [email], (error, results) => {
        if (error) {
            throw error
        } else {
            response.status(200).json(results.rows)
        }
    })
}

const addToCart = (request, response) => {
    const results = request.params
    const email = results['email']
    const store = results['store']
    const stringed_array = results['items']
    const array = eval(stringed_array)
    console.log("Array of items to query: ", array)
    var store_array = []
    var store_id = 0
    var stock_store_array = []
    

    pool.query('SELECT store_items, item_stock FROM stores WHERE id = $1;', [store], (error, results) => {
        if (error) {
            throw error
        } else {
            store_array = results.rows[0]["store_items"]
            stock_store_array = results.rows[0]['item_stock']
            console.log("Result Stock Array of Store: ", store_array)
            console.log("Result of Item Stock Array: ", stock_store_array)
            //return response.status(200).json(results.rows)
        }
    })




    var user_cart_from_db = []  // prev cart for adding new objects
    var store_ids = [] 
    pool.query('SELECT customer_cart, store_ids FROM customer WHERE customer_email = $1', [email], (error, results) => {
        if (error) {
            throw error
        } else {
            user_cart_from_db = results.rows[0]['customer_cart']
            store_ids = results.rows[0]['store_ids']
            console.log("Local Cart: ", user_cart_from_db)
            console.log("Local Store ids: ", store_ids)


            
            for (let i = 0; i <= array.length; i++) {
                const user_item_to_buy = array[i]
                if (user_item_to_buy === undefined) {
                    continue 
                }
        
                if (store_array.includes(user_item_to_buy)) {
                    console.log("Objects Match!")

                    const index_of_elm = user_cart_from_db.indexOf(user_item_to_buy)
                    if (index_of_elm === -1) { // new item to cart
                        user_cart_from_db.push(user_item_to_buy)
                        store_ids.push(store)
            
                    } else {
                        const store_id_at_index = store_ids[index_of_elm]
                        if (store_id_at_index === store) {  // see if the item was already bought from another store
                            console.log("Item Already in Cart!")
                        } else {
                            user_cart_from_db.push(user_item_to_buy)    // final good case -> same item bought from another store
                            store_ids.push(store)
                        }

                    }



                
                    
                    
                } else {
                    
                    return response.status(500).send(`${user_item_to_buy} not in store: ${store}`)
                }
        
        
            }
        
            console.log("Updated User Cart From Db: ", user_cart_from_db)
            console.log("Update Store_ids:  ", store_ids)
            
            pool.query("UPDATE customer SET customer_cart = $1, store_ids = $2 WHERE customer_email = $3;", [user_cart_from_db, store_ids, email], (error, results) => {
                if (error) {
                    throw error
                } else {
                    console.log("Cart Successfully Updated!")
                    


                    // updating stock in stores and items
                    
                    // Updating Store Stock
                    for (let j =0; j <= user_cart_from_db.length; j++) {
                        const item_in_cart = user_cart_from_db[j]
                        if (item_in_cart === ' ' || item_in_cart === undefined) {
                            continue
                        }

                        const index_of_item_in_store = store_array.indexOf(item_in_cart)
                        var stock_of_item_in_store = stock_store_array[index_of_item_in_store]
                        console.log("Stock of Item in STore: ", stock_of_item_in_store)
                        stock_store_array[index_of_item_in_store] -= 1
                        console.log("Stock of item in store updated: ", stock_store_array[index_of_item_in_store])
                       

                    }
                    console.log("Total Updated Stock Array: ", stock_store_array)
                    
                    pool.query("UPDATE stores SET item_stock = $1 WHERE id = $2", [stock_store_array, store], (error, results) => {
                        if (error) {
                            throw error
                        } else {
                            console.log("Store stock successfully updated!")
                        }
                    })

                    // Updating Item Stock
                    






                }
            })
            

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
    updateUserPassword,
    getCart,
    addToCart
}