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
        
        
        pool.query("INSERT INTO customer (id, customer_email, customer_password, total_purchases, purchase_date, store_ids, customer_cart, wallet_amount, quantity) VALUES ($1, $2, $3, ARRAY [0], ARRAY [' '], ARRAY [0], ARRAY[' '], 100.00, ARRAY[0])", [user_id, email, hashedPassword], (error, results) => {
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
    pool.query('SELECT (id, customer_email, total_purchases, purchase_date, store_ids) FROM customer WHERE customer_email = $1;', [user_email], (error, results) => {
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
    var quantity = eval(results['quantity']) // must be an array
    console.log("Array of items to query: ", array)
    console.log("Quantity Array: ", quantity)
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
    var quantities = []
    pool.query('SELECT customer_cart, store_ids, quantity FROM customer WHERE customer_email = $1', [email], (error, results) => {
        if (error) {
            throw error
        } else {
            user_cart_from_db = results.rows[0]['customer_cart']
            store_ids = results.rows[0]['store_ids']
            quantities = results.rows[0]['quantity']
            console.log("Local Cart: ", user_cart_from_db)
            console.log("Local Store ids: ", store_ids)
            console.log("Local quantities: ", quantities)


            
            for (let i = 0; i <= array.length; i++) {
                const user_item_to_buy = array[i]
                if (user_item_to_buy === undefined) {
                    continue 
                }
        
                if (store_array.includes(user_item_to_buy)) {
                    console.log("Objects Match!")

                    user_cart_from_db.push(user_item_to_buy)
                    store_ids.push(store)

                    
                } else {
                    
                    return response.status(500).send(`${user_item_to_buy} not in store: ${store}`)
                }
        
        
            }
        
            console.log("Updated User Cart From Db: ", user_cart_from_db)
            console.log("Update Store_ids:  ", store_ids)
            var updating_status = false

            for (let idx = 0; idx <= user_cart_from_db.length; idx ++) {
                
                const item = user_cart_from_db[idx]
                
                
                const user_quantity = quantity[idx]
                console.log("Item: ", item)
                if (item === undefined || item === ' ') {
                    continue
                }
                const item_index_in_store_array = store_array.indexOf(item)
                const stock = stock_store_array[item_index_in_store_array]
                console.log("stock store array: ", stock_store_array)
                console.log("elemt of stock store array: ", stock_store_array[idx - 1])
                console.log(`Item: ${item} Stock: ${stock} Desired Quantity: ${user_quantity}`)
                if (stock <= 0) {
                    console.log("Item is out of stock")
                    return response.status(500).send("Item is out of stock.")
                    updating_status = false
                }
                else if (user_quantity > stock) {
                    return response.status(500).send("User Quantity is greater than stock provided. Please reduce your desired quantity")
                    updating_status = false
                } else {
                    updating_status = true
                }

                
                
            }
            var final_quantity_array = quantities.concat(quantity)
            if (updating_status === true) {
                pool.query("UPDATE customer SET customer_cart = $1, store_ids = $2, quantity=$3 WHERE customer_email = $4;", [user_cart_from_db, store_ids, final_quantity_array, email], (error, results) => {
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
                            
                            const index_of_item_in_req = array.indexOf(item_in_cart)
                            const index_of_item_in_store = store_array.indexOf(item_in_cart)
                            var stock_of_item_in_store = stock_store_array[index_of_item_in_store]
                            console.log("Stock of Item in STore: ", stock_of_item_in_store)
                            console.log("Quantity for subtraction: ", quantity[index_of_item_in_req])
                            stock_store_array[index_of_item_in_store] -= quantity[index_of_item_in_req]

                            var updated_stock_store_array = []
                            var updated_store_array = []
                            for (let k = 0; k <= stock_store_array.length; k++) {
                                if (stock_store_array[k] === undefined) {
                                    continue
                                } else {
                                    if (stock_store_array[k] === 0) {
                                        console.log("The item is now out of stock and will be removed from marketplace")
                                        continue
                                    } else {
                                        updated_stock_store_array.push(stock_store_array[k])
                                        updated_store_array.push(store_array[k])
                                    }
                                }

                            }

                            console.log("Stock of item in store updated: ", stock_store_array[index_of_item_in_store])
                           
    
                        }
                        console.log("Total Updated Stock Array: ", updated_stock_store_array)
                        
                        pool.query("UPDATE stores SET store_items = $1, item_stock = $2 WHERE id = $3", [updated_store_array, updated_stock_store_array, store], (error, results) => {
                            if (error) {
                                throw error
                            } else {
                                console.log("Store stock successfully updated!")
                            }
                        })
    
                        // Updating Item Stock
                        for (let j =0; j <= user_cart_from_db.length; j++) {
                            const item_in_cart = user_cart_from_db[j]
                            if (item_in_cart === ' ' || item_in_cart === undefined) {
                                continue
                            }
                            const index_of_item_in_req = array.indexOf(item_in_cart)
                            pool.query('SELECT amount_supplied FROM items WHERE item_name = $1 AND store_id = $2', [item_in_cart, store], (error, results) => {
                                if (error) {
                                    throw error
                                } 
                                var amount_supplied = results.rows[0]['amount_supplied']
                                console.log("amount supplied: ", amount_supplied)
                                var new_amount_supplied = amount_supplied - quantity[index_of_item_in_req]
                                console.log("New Amount Supplied: ", new_amount_supplied)
    
                                pool.query("UPDATE items SET amount_supplied = $1 WHERE store_id = $2 AND item_name = $3", [new_amount_supplied, store, item_in_cart], (error, results) => {
                                    if (error) {
                                        throw error
                                    } else {
                                        return response.status(200).send("Item stock successfully Updated. The items have been completely added to Cart.")
                                    }
                                })
        
    
                            })
    
                        }
    
    
    
    
    
    
                    }
                })
            } else {
                return response.status(500).send("There seems to be an error regarding 'quantity' for ordering.")


            }

            

            

        }
    })


}

const removeFromCart = (request, response) => {
    // removal of only one item at a time
    const user_email = request.params['email']
    const item_name = request.params['item']
    const item_quantity = eval(request.params['quantity'])[0] // must be an array
    const store_id = request.params['store']

    pool.query("SELECT * FROM customer WHERE customer_email = $1", [user_email], (error, results) => {
        if (error) {
            throw error
        } else {
            console.log(results.rows[0])
            const customer_cart = results.rows[0]['customer_cart']
            console.log("Customer Cart: ", customer_cart)
            console.log("Item Name: ", item_name)
            const customer_quantity_array = results.rows[0]['quantity']
            const customer_store_ids = results.rows[0]['store_ids']
            const index_of_removal_item_in_customer = customer_cart.indexOf(item_name)
            if (index_of_removal_item_in_customer === -1) {
                return response.status(500).send("Item does not exist in cart")
            } 
            
            var updated_customer_cart = []
            var updated_quantity_array = []
            var updated_store_ids = []
            for (let i =0; i<= customer_cart.length; i++) { // updating cart
                
                if (i === index_of_removal_item_in_customer) {
                    if (customer_quantity_array[i] >= item_quantity) {
                        
                        const difference = customer_quantity_array[i] - item_quantity
                        if (difference > 0) {
                            updated_quantity_array.push(difference)
                            updated_customer_cart.push(customer_cart[i])
                            updated_store_ids.push(customer_store_ids[i])
                        } else {
                            continue
                        }
                        
                    } else {
                        return response.status(500).send("Amount of removal is larger than amount in cart")
                    }

                    if (customer_store_ids[i] === store_id) {
                        continue
                    } else {
                        return response.status(500).send("Amount not found in store to remove from cart")
                    }

                } else {
                    if (customer_cart[i] !== undefined) {
                        updated_customer_cart.push(customer_cart[i])
                    }
                    if (customer_quantity_array[i] !== undefined) {
                        updated_quantity_array.push(customer_quantity_array[i])
                        
                    }

                    if (customer_store_ids[i] !== undefined) {

                        updated_store_ids.push(customer_store_ids[i])
                    }
                    
                }
            }
            console.log("Updated Customer Carts: ", updated_customer_cart)
            console.log("Updated Quantity Array: ", updated_quantity_array)
            console.log("Updated Store ids: ", updated_store_ids)
            pool.query("UPDATE customer SET store_ids = $1, customer_cart = $2, quantity = $3 WHERE customer_email = $4", [updated_store_ids, updated_customer_cart, updated_quantity_array, user_email], (error, results) => {
                if (error) {
                    throw error
                }

                // rest of removal of items in other tables

                // updating items table
                pool.query('SELECT amount_supplied FROM items WHERE item_name = $1 AND store_id = $2', [item_name, store_id], (error, results) => {
                    if (error) {
                        throw error
                    }

                    var current_amount_supplied = results.rows[0]['amount_supplied']
                    console.log("Current Amount Supplied: ", current_amount_supplied)
                    current_amount_supplied += item_quantity
                    console.log("Updated Amount Supplied: ", current_amount_supplied)
                    pool.query('UPDATE items SET amount_supplied = $1 WHERE item_name = $2 AND store_id = $3', [current_amount_supplied, item_name, store_id], (error, results) => {
                        if (error) {
                            throw error
                        } else {
                            console.log("Updated Items successfully")

                            // Updating Store Table

                            pool.query('SELECT * FROM stores WHERE id = $1', [store_id], (error, results) => {
                                if (error) {
                                    throw error
                                } 
                                const row_results = results.rows[0]
                                console.log("Row Results: ", row_results)
                                var row_store_items = row_results['store_items']
                                var row_item_stock = row_results['item_stock']
                                const index_of_item_in_row_store_items = row_store_items.indexOf(item_name)
                                
                                var updated_row_item_stock = []
                                for (let j = 0; j <= row_store_items.length; j++) {
                                    if (j === index_of_item_in_row_store_items) {
                                        var current_item_stock = row_item_stock[j]
                                        current_item_stock += 1
                                        updated_row_item_stock.push(current_item_stock)

                                    } else {
                                        if (row_item_stock[j] !== undefined) {
                                            updated_row_item_stock.push(row_item_stock[j])
                                        }
                                    }
                                    
                                    
                                }

                                console.log("Updated Row Item Stock: ", updated_row_item_stock)
                                pool.query('UPDATE stores SET store_items = $1, item_stock = $2 WHERE id = $3', [row_store_items, updated_row_item_stock, store_id], (error, results) => {
                                    if (error) {
                                        throw error
                                    } else {
                                        return response.status(200).send("Item has been removed successfully")
                                    }
                                })

                            })
                        }
                    })
            
                })

            })

        }
    })

}

const checkout = (request, response) => {
    const email = request.params['email']
    var filtered_dict = {}
    var user_wallet;
    var purchases; 
    var date_array = []
    var customer_id;
    pool.query('SELECT * FROM customer WHERE customer_email = $1', [email], (error, results) => {
        if (error) {
            throw error
        } else {
            console.log(results.rows[0])
            var store_ids = results.rows[0]['store_ids']
            var customer_cart = results.rows[0]['customer_cart']
            var quantity = results.rows[0]['quantity']
            user_wallet = results.rows[0]['wallet_amount']
            purchases = results.rows[0]['total_purchases'][0]
            date_array = results.rows[0]['purchase_date']
            customer_id = results.rows[0]['id']

            for (let store_idx = 0; store_idx <= store_ids.length; store_idx ++ ) {
                if (store_ids[store_idx] === undefined || store_ids[store_idx] ===  ' ') {
                    continue
                } else {
                    console.log("Current Element: ", store_ids[store_idx])
                    const filtered_dict_keys = Object.keys(filtered_dict)
                    if (filtered_dict_keys.includes(store_ids[store_idx])) {
                        var nested_dict = filtered_dict[store_ids[store_idx]]
                        console.log("Nested Dictionary of Key: ", nested_dict)
                        const item = customer_cart[store_idx]
                        const quantity_sing = quantity[store_idx]
                        nested_dict[item] = quantity_sing
                        console.log("Updated Nested Dict: ", nested_dict)

                    } else {
                        var store_id = store_ids[store_idx]
                        var local_item = `${customer_cart[store_idx]}`
                        var quantity_sing = quantity[store_idx]
                        filtered_dict[store_id] = {[local_item]:quantity_sing}
                        console.log("New Element in Dict Created")
                    }
                }
            }
            console.log("Filtered Dict Final: ", filtered_dict)

            var filtered_dict_keys = Object.keys(filtered_dict)
            for (let dict_key_idx = 0; dict_key_idx <= filtered_dict_keys.length; dict_key_idx++) {
                const store_id = filtered_dict_keys[dict_key_idx]
                if (store_id === undefined) {
                    continue
                } else {
                    pool.query("SELECT * FROM stores WHERE id =$1", [store_id], (error, results) => {
                        if (error) {
                            throw error
                        }

                        console.log(results.rows[0])
                        var store_items = results.rows[0]['store_items']
                        var item_cost = results.rows[0]['item_cost']
                        var filtered_dict_items = filtered_dict[store_id]
                        console.log("Filtered Dict Items: ", filtered_dict_items)
                        var filtered_dict_items_keys = Object.keys(filtered_dict_items)
                        var total_cost = 0 // total cost to keep track of when comparing with cart
                        for (let item_idx = 0; item_idx <= filtered_dict_items_keys.length; item_idx++) {
                            var cur_item = filtered_dict_items_keys[item_idx]
                            if (cur_item === undefined) {
                                continue
                            } else {
                                var store_item_idx = store_items.indexOf(cur_item)
                                var price_string = item_cost[store_item_idx]
                                var customer_quantity = filtered_dict_items[cur_item]
                                console.log("Store Item: ", cur_item)
                                console.log("Customer Quantity: ", customer_quantity)
                                console.log("Price: ", price_string)
                                var price_string_without_sign = price_string.substring(1)
                                
                                var price_float = parseFloat(price_string_without_sign)
                                var total_price_float = price_float * customer_quantity
                                console.log("Price Float: ", total_price_float)


                                total_cost += total_price_float
                            }


                        }
                        console.log("Total Cart Cost: ", total_cost)
                        if (total_cost <  user_wallet) {
                            var user_wallet_leftover_amount = user_wallet-total_cost
                            const date = new Date();

                            let day = date.getDate();
                            let month = date.getMonth() + 1;
                            let year = date.getFullYear();
                            let new_date = `${day}-${month}-${year}`;
                            date_array.push(new_date)
                            purchases += 1
                            pool.query("UPDATE customer SET total_purchases = $1, purchase_date = $2, store_ids = ARRAY [' '], customer_cart = ARRAY[' '], wallet_amount = $3, quantity = ARRAY[0]", [[purchases], date_array, user_wallet_leftover_amount], (error, results) => {
                                if (error) {
                                    throw error
                                }
                                console.log("Transaction is complete")
                                console.log("Updating Orders Table")
                                pool.query('INSERT INTO orders (customer_id, items, stores, datestamp, customer_coast, wallet_amount_after_leftover) VALUES($1, $2, $3, $4, $5, $6)', [ customer_id, customer_cart, store_ids, new_date, total_cost, user_wallet_leftover_amount], (error, results) => {
                                    if (error) {
                                        throw error
                                    } else {
                                        response.status(200).send("Transaction Completed Successfully!")
                                    }
                                })
                                
                            })
                        } else {
                            response.status(500).send("You do not have enough funds in your wallet to create this transaction")
                        }
                    })
                }



            }
            

        }
    })
}

const getTransactionHistory = (request, response) => {
    var user_id;
    const user_email = request.params['email']

    pool.query('SELECT id FROM customer WHERE customer_email = $1', [user_email], (error, results) => {
        if (error) {
            throw error
        } else {
            user_id = results.rows[0]['id']
            pool.query('SELECT * FROM orders WHERE customer_id = $1', [user_id], (error, results) => {
                if (error) {
                    throw error
                } else {
                    response.status(200).json(results.rows)
                }
            })
        }
    } )
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
    addToCart,
    removeFromCart,
    checkout,
    getTransactionHistory
}