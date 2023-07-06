const db = require('../models/connection');

const ObjectId = require("mongodb").ObjectId


module.exports ={

    addToCart:(proId,userId)=>{

      proObj={
        productId:proId,
        Quantity:1,
      };

      return new Promise(async(resolve, reject) => {

        let carts = await db.cart.findOne({user:userId})
        if(carts){
            let productExist = carts.cartItems.findIndex(
                (cartItems) => cartItems.productId == proId
            );

            if (productExist != -1) {
                db.cart
                    .updateOne(
                        { user: userId, "cartItems.productId": proId },
                        {
                            $inc: { "cartItems.$.Quantity": 1 },
                        }
                    )
                    .then(() => {
                        resolve();
                    });
            }else {
                await db.cart
                    .updateOne(
                        { user: userId },
                        {
                            $push: {
                                cartItems: proObj,
                            },
                        }
                    )
                    .then((response) => {
                        resolve(response);
                    });
            }
                
        }else {
            let cartItems = new db.cart({
                user: userId,

                cartItems: proObj,
            });
            await cartItems.save().then((data) => {

                resolve(data);
            });
        }


      });
    
      },

      viewCart: (userId) => {
        return new Promise(async (resolve, reject) => {
          try {
            const id = await db.cart.aggregate([
              {
                $match: {
                  user: new ObjectId(userId),
                },
              },
              {
                $unwind: "$cartItems",
              },
              {
                $project: {
                  item: "$cartItems.productId",
                  quantity: "$cartItems.Quantity",
                },
              },
              {
                $lookup: {
                  from: "products",
                  localField: "item",
                  foreignField: "_id",
                  as: "carted",
                },
              },
              {
                $project: {
                    item: 1,
                    quantity: 1,
                    cartItems: { $arrayElemAt: ["$carted", 0] },
                },
            },

            ]);
      
            resolve(id);
          } catch (error) {
            reject(error);
          }
        });
      },
           
      getCartItemsCount:(userId)=>{
        return new Promise(async(resolve, reject) => {           
          let count = 0
          let cart = await db.cart.findOne({user:userId});                                                        
          console.log("helllooooooooooooooooooooo");           
          console.log(cart,"1");
          if(cart){           
            count = cart.cartItems?.length

          }
          resolve(count)
        })
      },
      

      deleteCart: (data) => {
        return new Promise((resolve, reject) => {
            db.cart
                .updateOne(
                    { _id: data.cartId },
                    {
                        $pull: { cartItems: { productId: data.product } },
                    }
                )
                .then(() => {
                    resolve({ removeProduct: true });
                });
        });
    },

     totalAmountOfProductsInCart : async (userId) => {
      try {
        const result = await db.cart.aggregate([
          {
            $match: {
              user:  new ObjectId(userId)
            }
          },
          {
            $unwind: "$cartItems"
          },
          {
            $lookup: {
              from: "products",
              localField: "cartItems.productId",
              foreignField: "_id",
              as: "product"
            }
          },
          {
            $project: {
              _id: 0,
              totalAmount: {
                $multiply: ["$cartItems.Quantity", { $arrayElemAt: ["$product.price", 0] }]
              }
            }
          },
          {
            $group: {
              _id: null,
              totalAmount: { $sum: "$totalAmount" }
            }
          }
        ]);
    //console.log(result[0]?.totalAmount );
        return result[0]?.totalAmount || 0;
      } catch (error) {
        console.error("Error calculating total amount:", error);
        throw error;
  
              }
            
    },
  //   changeProductQuantity: (data) => {
  //     count = parseInt(data.count);
  //     quantity = parseInt(data.quantity);
  //     return new Promise((resolve, reject) => {
  //         if (count == -1 && quantity == 1) {
  //             db.cart
  //                 .updateOne(
  //                     { _id: data.cart },
  //                     {
  //                         $pull: { cartItems: { productId: data.product } },
  //                     }
  //                 )
  //                 .then(() => {
  //                     resolve({ removeProduct: true });
  //                 });
  //         } else {
  //             db.cart
  //                 .updateOne(
  //                     { _id: data.cart, "cartItems.productId": data.product },
  //                     {
  //                         $inc: { "cartItems.$.Quantity": count },
  //                     }
  //                 )
  //                 .then(() => {
  //                     resolve({ status: true });
  //                 });
  //         }
  //     });
  // }

  changeProductQuantity:(data)=>{
    return new Promise(async (resolve, reject) => {
      let product = 
      await db.cart
      .findOneAndUpdate(
          { user:data.userId, "cartItems.productId": data.product },
          {
              $inc: { "cartItems.$.Quantity": data.count },
          },
          { new: true }
      )
        console.log(product,">>>>>>>>>>");
          resolve(product);
    })


  }
  
    
      

}