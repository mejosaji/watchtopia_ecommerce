const db = require('../models/connection');

const ObjectId = require("mongodb").ObjectId

const Razorpay = require('razorpay');

const crypto = require('crypto');


//razorpay instance
var instance = new Razorpay({
    key_id: "rzp_test_qJ7nQBOCs3XFfx",
    key_secret: "A7E8SOw8cqSoZg5pdhZ15BQB"

})


module.exports ={

    placeOrder: (orderData, total,users) => {
        console.log(process.env.key_id,'.................mmmmmmmmm');
        console.log(orderData);
        console.log(users,'userssssssssss')
        console.log("helo");
        return new Promise(async (resolve, reject) => {

            let productdetails = await db.cart.aggregate([
                {
                    $match: {
                        user:new ObjectId(users)
                    }
                },
                 {
                    $unwind: '$cartItems'
                },


                {
                    $project: {
                        item: '$cartItems.productId',
                        quantity: '$cartItems.Quantity',

                    }
                },

                {
                    $lookup: {
                        from: 'products',
                        localField: "item",
                        foreignField: "_id",
                        as: 'productdetails'
                    }
                },
                {

                    $unwind: '$productdetails'
                },
                {
                    $project: {
                        image: '$productdetails.image',
                        category: '$productdetails.category',
                        _id: "$productdetails._id",
                        quantity: 1,
                        productsName: "$productdetails.productName",
                        productsPrice: "$productdetails.price",

                    }
                }
            ])

            console.log(productdetails,'pppppp')
console.log(orderData.addresses,"oooorder");
            let Address = await db.address.aggregate([
                { $match: { userid:new ObjectId(users) } },

                { $unwind: "$Address" },

                { $match: { "Address._id":new ObjectId (orderData.addresses) } },

                { $unwind: "$Address" },

                {
                    $project: {
                        item: "$Address",
                    },
                },
            ]);
console.log(Address,'kooooooo')

console.log(Address[0],'kooojjjjjjjjoooo')
           
            
            let orderaddress = Address[0]

            let status = orderData['payment-method'] === 'COD' ? 'Paid' : 'Pending';
            let orderStatus = orderData['payment-method'] === 'COD' ? 'Success' : 'Pending'

            let orderdata = {

                name: orderaddress.fname,
                paymentStatus: status ,
                paymentmode: orderData['payment-method'],
                productDetails: productdetails,
                orderStatus: orderStatus,
                messageStatus:null,
                shippingAddress: orderaddress,
                totalPrice: total
            }


            let order = await db.order.findOne({ userid: users })

            console.log(order,'ooooooooooooooordddddddeeer');
            if (order) {
                console.log("cvvfgfgbbb");
                await db.order.updateOne(
                    { userid: users },
                    {
                      $push: {
                        orders: [orderdata] // Pass an array of objects directly
                      }
                    }
                  );
                  
                }else {
                let newOrder = db.order({
                    userid: users,
                    orders: orderdata
                })

                await newOrder.save().then((orders) => {
                    resolve(orders)
                })
            }
            await db.cart.deleteMany({ user: users }).then(() => {
                resolve()
            })

        })
    },
    
    orderPage: (userId) => {
        return new Promise(async (resolve, reject) => {

            await db.order.aggregate([{
                $match:
                    { userid: new ObjectId(userId) }
            },
            {
                $unwind: '$orders'
            },
            {
                $sort: { 'orders.createdAt': -1 }
            }
            ]).then((response) => {
                resolve(response)
               
            })
        })

    },
    viewOrderDetails: (orderId) => {
        return new Promise(async (resolve, reject) => {

            let productid = await db.order.findOne({ "orders._id": orderId }, { 'orders.$': 1 });
console.log(productid,"222222222222222222222");

            let details = productid?.orders[0]
            let order = productid?.orders[0]?.productDetails

            const productDetails = productid?.orders?.map(object => object.productDetails);
            const address = productid.orders?.map(object => object?.shippingAddress);
            const products = productDetails?.map(object => object)

            resolve({ products, address, details, })



        })



    },

    generateRazorpay: (userId, total) => {


        return new Promise(async (resolve, reject) => {
          let orders = await db.order.find({ userid: userId });
    
          let order = orders[0].orders.slice().reverse();
    
          let orderId = order[0]._id;
    
          total = total * 100;
    
          var options = {
            amount: Number(total),
            currency: "INR",
            receipt: "" + orderId,
          };
          instance.orders.create(options, function (err, order) {
            if (err) {
    
            } else {
    
              resolve(order);
    
            }
          });
        });
      },

      verifyPayment: (details) => {
        return new Promise((resolve, reject) => {
            try {
                const crypto = require('crypto')
                let hmac = crypto.createHmac('sha256', "A7E8SOw8cqSoZg5pdhZ15BQB")
                hmac.update(details['payment[razorpay_order_id]'] + "|" + details['payment[razorpay_payment_id]'])
                hmac = hmac.digest('hex')
                if (hmac == details['payment[razorpay_signature]']) {
                    console.log('resolveee');
                    resolve()
                } else {
                    reject("not match")
                }
            } catch (err) {
            }
        })
    },


    //change payment status


    changePaymentStatus: (userId, orderId) => {

        return new Promise(async (resolve, reject) => {
            try {
              
                console.log(userId,orderId,"oooooooooooooo+");
                let orders = await db.order.findOne({ userid: userId   });

                // let ourorders = await db.order.findOne({ 'orders._id': orderId }, { 'orders.$': 1 })

                console.log(orders,"////");
                console.log(orderId);
                const result = await db.order.updateOne(

                    { 'orders._id':orderId  },
                    {
                      $set: {
                        'orders.$.orderStatus': 'Success',
                        'orders.$.paymentStatus': 'paid'
                      },
                    }
                  )
                await db.cart.deleteMany({ user: userId });
                resolve();

            } catch (err) {

            }
        });
    },

   createData: (details, Dates) => {
    try {
        console.log(details, 'tttttttttttttttttttttt');
        let address = details?.address[0]?.item;
        let product = details.products[0];
        console.log(details.products[0], "xcfghgfds");

        let orderDetails = details?.details;

        let myDate = Dates(orderDetails.createdAt);
        var data = {
            // Customize enables you to provide your own templates
            // Please review the documentation for instructions and examples
            customize: {
                //  "template": fs.readFileSync('template.html', 'base64') // Must be base64 encoded html
            },
            images: {
                // The logo on top of your invoice
                // logo: "https://freelogocreator.com/user_design/logos/2023/02/28/120325-medium.png",
                // The invoice background
                // background: "https://public.easyinvoice.cloud/img/watermark-draft.jpg",
            },
            // Your own data
            sender: {
                company: "WATCHTOPIA",
                address: "Kerala",
                zip: "4567 CD",
                city: "KOTTAYAM",
                country: "India",
            },
            // Your recipient
            client: {
                company: address.fname,
                address: address.street,
                zip: address.pincode,
                city: address.city,
                country: "India",
            },
            information: {
                number: address.mobile,
                date: myDate,
                "due-date": myDate,
            },
            products: [], // Initialize an empty array for products

            // The message you would like to display on the bottom of your invoice
            "bottom-notice": "Thank you for your order from A 2 Z Ecommerce",
            // Settings to customize your invoice
            settings: {
                currency: "INR", // See documentation 'Locales and Currency' for more info. Leave empty for no currency.
                // "locale": "nl-NL", // Defaults to en-US, used for number formatting (See documentation 'Locales and Currency')
                // "tax-notation": "gst", // Defaults to 'vat'
                // "margin-top": 25, // Defaults to '25'
                // "margin-right": 25, // Defaults to '25'
                // "margin-left": 25, // Defaults to '25'
                // "margin-bottom": 25, // Defaults to '25'
                // "format": "A4", // Defaults to A4, options: A3, A4, A5, Legal, Letter, Tabloid
                // "height": "1000px", // allowed units: mm, cm, in, px
                // "width": "500px", // allowed units: mm, cm, in, px
                // "orientation": "landscape", // portrait or landscape, defaults to portrait
            },
            // Translate your invoice to your preferred language
            translate: {
                // "invoice": "FACTUUR",  // Default to 'INVOICE'
                // "number": "Nummer", // Defaults to 'Number'
                // "date": "Datum", // Default to 'Date'
                // "due-date": "Verloopdatum", // Defaults to 'Due Date'
                // "subtotal": "Subtotaal", // Defaults to 'Subtotal'
                // "products": "Producten", // Defaults to 'Products'
                // "quantity": "Aantal", // Default to 'Quantity'
                // "price": "Prijs", // Defaults to 'Price'
                // "product-total": "Totaal", // Defaults to 'Total'
                // "total": "Totaal" // Defaults to 'Total'
            },
        };

        // Loop through each product and add the details to the "products" array in the "data" object
        product.forEach((product) => {
            data.products.push({
                description:product.productsName,
                quantity: product.quantity,
                "tax-rate": 0,
                price: product.productsPrice,
            });
        });

        console.log(data, 'ddddddddddddddddddd');
        return data;
    } catch (err) {
        // Handle any errors that occur
    }
}

}
    




