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

let vendorId = 1234
app.post('/vendors', async (req, res) => {
    const id = uuidv4();
    const name = req.query.name;
    const bankAccount = req.query.bank_account;
    const email = req.query.email;
    const store_name = req.query.store_name;


    try {
        const result = await db.query(
            'INSERT INTO vendors (id, name, bank_account, email, store_name) VALUES ($1, $2, $3, $4, $5) RETURNING id',
             [id, name, bankAccount, email, store_name]
        );

        vendorId = result.rows[0].id;

        res.json(vendorId)
    } catch (error) {
        console.log(error)
    }
});



app.post('/orders', async(req, res) => {
    const order_id = uuidv4();
    const Amount = req.query.amount;
    const status = req.query.status;
    const timeStamp = req.query.timestamp;
    const vendor_id = 'fbd0cdf7-24c2-49c6-8e0e-f4af53773c74'


    
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

});


app.get('/payout', async(req,res) => {
    try {
        const vendorId = 'fbd0cdf7-24c2-49c6-8e0e-f4af53773c74';
        const status = 'pending';

        const result = await db.query(
            'SELECT vendors.id AS vendor_id,vendors.name,vendors.store_name,orders.order_id,orders.amount, orders.status FROM vendors JOIN orders ON vendors.id = orders.vendor_id WHERE vendors.id = $1;', [vendorId]
        );

        const data = result.rows
        console.log(data)
        const total_amount = data[0].amount + data[1].amount + data[2].amount;
        const platform_fee = total_amount * 0.05;
        const net_fee = platform_fee + total_amount;
        

        console.log(total_amount)
        console.log(platform_fee)
        console.log(net_fee)

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
})


app.listen(port, () => {
    console.log(`server running at port ${port}`)
});

