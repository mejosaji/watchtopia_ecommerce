const db = require('../models/connection')
const bcrypt = require("bcrypt")
const otp = require('../otp/otp')
const client = require("twilio")(otp.ACCOUNT_SID, otp.AUTH_TOKEN);


module.exports = {

  doLogin: (userData) => {
    console.log(userData);
    return new Promise(async (resolve, reject) => {
      let users = await db.User.findOne({ email: userData.email });
      console.log(users);

      if (users) {
        if (users.blocked == false) {

          await bcrypt
            .compare(userData.password, users.password)
            .then((status) => {
              if (status) {
                id = users._id;
                let userName = users.name
                resolve({ id, userName, loggedInStatus: true })
              } else {
                resolve({ loggedInStatus: false })
              }
            }).catch((err) => {
              console.log(err);
            })

        } else {
          resolve({ blockedStatus: true });
        }
      } else {
        resolve({ loggedInStatus: false })
      }
    })
  },

  findAllProducts: () => {
    return new Promise(async (resolve, reject) => {
      await db.Product
        .find(({ list: true }))
        .exec()
        .then((data) => {
          console.log(data);

          resolve(data);
        });
    });
  },

  findAllCategory: () => {
    return new Promise(async (resolve, reject) => {
      await db.Category
        .find(({ list: true }))
        .exec()
        .then((data) => {
          console.log(data);

          resolve(data);
        });
    });
  },
  findProduct: (id) => {
    return new Promise(async (resolve, reject) => {
      await db.Product
        .find({ _id: id })
        .exec()
        .then((data) => {
          console.log(data);

          resolve(data);
        });
    });
  },



  otpGenerate: (phoneNumber) => {
    return new Promise((resolve, reject) => {
      db.User.findOne({ phone: phoneNumber })
        .then((user) => {
          console.log(user);
          if (user) {
            client.verify
              .v2.services(otp.SERVICE_SID)
              .verifications
              .create({ to: `+91${user.phone}`, channel: 'sms' })
              .then(() => {
                console.log('Verification initiated successfully');
                resolve();
              })
              .catch((error) => {
                console.error('Failed to initiate verification:', error);
                reject(error);
              });
          } else {
            console.error('User not found');
            reject(new Error('User not found'));
          }
        })
        .catch((error) => {
          console.error('Error occurred while finding user:', error);
          reject(error);
        });
    });
  },



  verifyOtp: (otp, phone) => {
    return new Promise((resolve, reject) => {
      console.log(phone);
      console.log(otp);
      console.log('otp -------------------------------------');
      console.log('asdfghjkljhgfdghjklhgfdgh');
      client.verify.v2.services(otp.ServiceID)
        .verificationChecks
        .create({ to: `+91${phone}`, code: otp })
        .then((response) => {
          console.log(response);
          const status = response.valid
          userModel.findOne({ phone: phone }).then((user) => {
            console.log(status, user)
            console.log('helper');
            resolve({ status, user })
          })
        }).catch((err) => {
          console.log(err)
        })
    })
  },

  createData: (details, dates) => {
    let address = details.address[0][0]
    console.log(address);
    let product = details.products[0][0]
    let orderDetails = details.details.createdAt

    console.log('orderdetails', orderDetails);
    let myDate = dates(orderDetails);


  },

  productSearch: (searchData) => {

    let keyword = searchData.search

    return new Promise(async (resolve, reject) => {
      try {
        const Products = await db.Product.find({ productName: { $regex: new RegExp(keyword, 'i') } });

        resolve(Products)


      } catch (err) {
        console.log(err);
        reject(err);

      }
    })
  },

  catProduct:(catId)=>{

    return new Promise(async(resolve, reject) => {
      await db.Category
      .find(({_id: catId}))
      .exec()
      .then((data)=>{
        console.log(data,'cccccccccccccccccccccccc');
        resolve(data)
      })
    })

  },

  Product:(pro)=>{
    let name= pro[0].categoryName
    console.log(name,'{{{{{{{{{{{{{]]]]]]');
    return new Promise(async(resolve, reject) => {
      await db.Product
      .find(({category:name}))
      .exec()
      .then((result)=>{
        console.log(result,'ssssssssssssssssss');
        resolve(result)
      })

    })
  },

  customerStatusChange:(orderId,message)=>{
    
    
    return new Promise(async(resolve, reject) => {
      
     await db.order
      .updateOne(
      { 'orders._id': orderId }, 
      { $set: { 'orders.$.messageStatus': message } } 
    )
      .then(() => {
        resolve()
      })
      .catch((error) => {
        console.log('Error updating order:', error);
      });
    })

  }





}
