
const db = require('../models/connection');




module.exports = {


  getUsers:async()=>{
try{
     const users= await db.User.find().exec()
     return(users)
}
catch(err){

  console.log(err);

}
      
  },


//     return new Promise(async(resolve, reject) => {
//       try{
//         await db.User
//         .find()
//         .exec()
//         .then((result)=>{
//         console.log(result);
//         resolve(result)
//         })
//       }
//       catch(e){
// console.log(e);
//       }
     
//     })
//   },


  addCategory: (data) => {
    let response = {};

    return new Promise(async (resolve, reject) => {
      let category = data.categoryname;
      existingCategory = await db.Category.findOne({
        categoryName:{'$regex':`${category}`,'$options':'i'}  ,
      });
      if (existingCategory) {
        console.log("category exists");
        response = { categoryStatus: true };
        resolve(response);
      } else {
        console.log("category not exist");
        const categoryData = new db.Category({
          categoryName: data.categoryname,
        });
        console.log(categoryData);
        await categoryData.save().then((data) => {
          console.log(data);
          resolve(data);
        });
      }
    });
  },

//   addNewcategory: (body) => {
//     return new Promise(async(resolve, reject) => {
//         await categoryModel.findOne({
//             name:{'$regex':`${body.category}`,'$options':'i'}
//           }).then((categoryExist) => {
//             console.log(categoryExist);
//             console.log("categoryExist");
//             if (categoryExist) {
//                 resolve({status:false})
//             } else {
//                 new categoryModel({
//                     name: body.category
//                 }).save().then((newCategory) => {
//                     console.log(newCategory);
//                     console.log("newcategory");
//                     resolve({status:true ,data:newCategory})
                    
//                 }).catch((error) => {
//                     console.log(error);
//                     reject(error)
//                 })
//             }
//         })
//     })
// }

  viewAddCategory: () => {
    return new Promise(async (resolve, reject) => {
      await db.Category
        .find()
        .exec()
        .then((response) => {
          resolve(response);
        });
    });
  },

  unlist_category: (categoryId) => {
    return new Promise(async (resolve, reject) => {
      await db.Category.updateOne({ _id: categoryId },{
        $set:{
          list:false
        
      }}).then((response) => {
        console.log(response);
        resolve(response)
      })
    })
  },

  list_category:(categoryId)=>{

    return new Promise(async(resolve, reject) => {
      await db.Category.updateOne({_id:categoryId},{$set:{
        list:true
      }}).then((responce)=>{
        console.log(responce);
        resolve(responce)
      })
    })
  },

  edit_category:(categoryId)=>{
    return new Promise(async(resolve, reject) => {
      await db.Category.findOne({ _id: categoryId}).then((response)=>{
       resolve(response);
      })
    })
  },

  postEditCategory:async(categoryid,categoryname)=>{
    let data =await db.Category.updateOne({_id:categoryid},{
      $set:{
        categoryName:categoryname.editcategoryname
      }
    })
    return data

  },


  postAddProduct:(productData,image)=>{
    return new Promise(async(resolve, reject) => {
   let products=   await db.Product({
    productName:productData.name,
        description:productData.discription,
        price:productData.price,
        quantity:productData.quantity,
        image:image,
        category:productData.category



      })
      await products.save().then((response)=>{
        resolve(response)
      })

    })
  },

  findAllCategory: () => {
    return new Promise(async (resolve, reject) => {
      await db.Category
        .find()
        .exec()
        .then((data) => {
          console.log(data);

          resolve(data);
        });
    });
  },
  findAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      await db.Product
        .find()
        .exec()
        .then((data) => {
          console.log(data);

          resolve(data);
        });
    });
  },

  postEditProduct: (productId, editedData, images) => {
    return new Promise(async (resolve, reject) => {
      await db.Product
        .updateOne(
          { _id: productId },
          {
            $set: {
              productName: editedData.name,
              description: editedData.description,
              quantity: editedData.quantity,
              price: editedData.price,
              category: editedData.category,
              image: images,
            },
          }
        )
        .then((response) => {
          resolve(response);
        }).catch((err) => {
          reject(err)
        })
    });
  },

  unlist_product: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.Product.updateOne({ _id:productId },{$set:{
        list:false
      }}).then((response) => {
        console.log(response);
        resolve(response)
      })
    })
  },
  list_product:(productId)=>{

    return new Promise(async(resolve, reject) => {
      await db.Product.updateOne({_id:productId},{$set:{
        list:true
      }}).then((responce)=>{
        console.log(responce);
        resolve(responce)
      })
    })

  },

  editProduct: (productId) => {
    return new Promise(async (resolve, reject) => {
      await db.Product
        .findOne({ _id: productId })
        .exec()
        .then((response) => {
          resolve(response);
          console.log(response);
        });
    });
  },

  blockUser: async(UserID)=>{
    console.log(UserID);
    try{
       return await db.User.updateOne({_id:UserID},{$set:{blocked:true}})
    }
  
  catch(err){
    return err
  
  }
},

unBlockUser:(UserID)=>{
  console.log(UserID);
  return new Promise
  (async(resolve, reject) => {
    await db.User.updateOne({_id:UserID},{$set:{blocked:false}})
    .then((data)=>{
      console.log("data updated");
      resolve();
    });
    
  });
},

orderPage: () => {
  return new Promise(async (resolve, reject) => {

    await db.order.aggregate([
      {
        $unwind: '$orders'
      },
      {
        $sort: { 'orders: createdAt': -1 }
      }

    ]).then((response) => {
      console.log(response[0]?.orders?.shippingAddress?.item,"90000");
      console.log(response[0],"yy");

      resolve(response)

    })
  })

},


orderDetails: (orderId) => {
  console.log(orderId,"33333333333333333333333333333");
  return new Promise(async (resolve, reject) => {

    let order = await db.order.findOne({ 'orders._id': orderId },{ 'orders.$': 1 })
    console.log(order.orders[0].shippingAddress.item , '----------------------------------------------------------------');
    resolve(order)
  })

},
changeOrderStatus: (orderId, data) => {

 

  return new Promise(async (resolve, reject) => {
    let orders = await db.order.findOne({ 'orders._id': orderId }, { 'orders.$': 1 })

    let users = await db.order.updateOne(
      { 'orders._id': orderId },
      {
        $set: {
          'orders.$.orderStatus': data.status,

        }
      }
    ).then((response)=>{
      
      

      resolve(response)
    })
    
  })

},

getViewProduct: () => {

  return new Promise(async (resolve, reject) => {
    await db.Product.find().exec().then((response) => {

      resolve(response)

    })
  })
},

getCodCount: () => {
  return new Promise(async (resolve, reject) => {
    let response = await db.order.aggregate([
      {
        $unwind: "$orders"
      },
      {
        $match: {
          "orders.paymentmode": "COD"
        }
      },
    ])
    resolve(response)
  })
},

getOnlineCount: () => {
  return new Promise(async (resolve, reject) => {
    let response = await db.order.aggregate([
      {
        $unwind: "$orders"
      },
      {
        $match: {
          "orders.paymentmode": "online"
        }
      },
    ])
    resolve(response)
  })
},

totalUserCount: () => {

  return new Promise(async (resolve, reject) => {
    let response = await db.User.find().exec()

    resolve(response)

  })
},

getOrderByDate: () => {
  return new Promise(async (resolve, reject) => {
    // const startDate = new Date('2022-01-01');
    await db.order.find().then((response) => {
      console.log(response,'response///////////////////////.');
      resolve(response)


    })
  });
},

getAllOrders: () => {
  return new Promise(async (resolve, reject) => {
    let order = await db.order.aggregate([
      { $unwind: '$orders' },

    ]).then((response) => {
      resolve(response)
    })

  })
},


}