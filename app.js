import express from 'express';
import bodyParser from 'body-parser';
import pg from 'pg';
import env from 'dotenv'
import { v4 as uuidv4 } from 'uuid';;

env.config()
const app = express();
const port = 5000;
app.use(bodyParser.urlencoded({extended: true}));


const db = new pg.Client({
    host: process.env.PG_HOST,
    user: process.env.PG_USER,
    database: process.env.PG_DATABASE,
    password: process.env.PG_PASSWORD,
    port: process.env.PG_PORT
});

db.connect();


app.post('/vendors', async (req, res) => {
    const id = uuidv4();
    const name = req.body.name;
    const bankAccount = req.body.bank_account;
    const email = req.body.email;
    const store_name = req.body.store_name;

    
    console.log(id,name,bankAccount,email,store_name)

    try {
        const result = await db.query(
            'INSERT INTO vendors (id, name, bank_account, email, store_name) VALUES ($1, $2, $3, $4, $5) RETURNING id, store_name',
             [id, name, bankAccount, email, store_name]
        );

        const vendorId = result.rows[0].id;
        const vendorStore_name = result.rows[0].store_name;

        try {
            await db.query('insert into vendor_profiles (vendor_id, store_name) values ($1, $2)', [vendorId,vendorStore_name])
            
        } catch (error) {
            console.log(error)
        }
        
        
        res.json({ vendorId, vendorStore_name });
    } catch (error) {
        console.log(error)
    }
});



app.post('/orders', async(req, res) => {
    const order_id = uuidv4();
    const Amount = req.body.amount;
    const status = req.body.status;
    const timeStamp = req.body.timestamp;
    const store_name= 'abolarin store'

    const result= await db.query('select * from vendor_profiles where store_name = $1', [store_name])

    const vendor_id = result.rows[0].vendor_id ;    

    console.log(vendor_id);   

    if (result.rows.length > 0) {
         try {
            
            const result = await db.query(
                'INSERT INTO orders (order_id, amount, status, timestamp, vendor_id) VALUES ($1, $2, $3, $4, $5) RETURNING order_id',
                [order_id,Amount,status,timeStamp, vendor_id]
            );

            const OrderId = result.rows[0].order_id;
            res.json(OrderId)

        } catch (error) {
            console.log(error)
        }
    } else {
        console.log('store_name is not equal to vendor')
    }


});


app.get('/payout', async(req,res) => {

        const store_name= 'abolarin store'

        const result = await db.query('select * from vendor_profiles where store_name = $1', [store_name])

        const vendor_id = result.rows[0].vendor_id ; 

        if (result.rows.length > 0) {
            try {
        
                const status = 'pending';
                //const result = await db.query('select * from orders')
                const result = await db.query(
                        `SELECT vendors.name, orders.amount 
                        FROM vendors 
                        JOIN orders ON vendors.id = orders.vendor_id 
                        WHERE vendors.id = $1 AND orders.status = 'completed';`,
                        [vendor_id]
                    );

                const data = result.rows
                console.log(data)
                const total_amount = data[0].amount + data[1].amount + data[2].amount;
                const platform_fee = total_amount * 0.05;
                const net_fee = platform_fee + total_amount;
            

                //console.log(total_amount)
                //console.log(platform_fee)
                //console.log(net_fee)

                res.json({
                    name: data[0]?.name,             
                        total_orders: data.length,
                        total_amount,
                        platform_fee,
                        net_fee
                    });
                } catch (error) {
                    console.log(error)
                }

        } else {
            
        }
})


app.listen(port, () => {
    console.log(`server running at port ${port}`)
});

