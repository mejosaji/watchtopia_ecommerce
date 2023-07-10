const bcrypt = require('bcrypt')
const db = require('../../models/connection')
const adminHelper = require('../../helpers/admin_helpers')
const userHelper = require('../../helpers/user_helpers')
const cartHelper = require('../../helpers/cart_helpers')
const checkoutHelper = require('../../helpers/checkout_helpers')
const orderHelper = require("../../helpers/orderHelper")
const { response } = require('express')

module.exports = {
  login: (req, res) => {
    const clientipAdd = req.clientIP
    console.log('IP Address',clientipAdd, "req.ip",req.ip);
    res.render('users/login')
  },

  postLogin: async (req, res) => {

    await userHelper.doLogin(req.body).then((responce) => {

      console.log(responce);
      let loggedInStatus = responce.loggedInStatus
      let blockedStatus = responce.blockedStatus
      if (loggedInStatus == true) {
        req.session.user = responce
        req.session.userLoggedIn = true
        userSession = req.session.userLoggedIn
        res.redirect('/')

      } else {
        blockedStatus;
        res.render("users/login", { loggedInStatus, blockedStatus })
      }
    }).catch(() => {

    })

  },




  //     postlogin:async (req,res,next)=>{
  //         let loginData=req.body
  //         console.log(loginData);
  //   let users= await db.User.findOne({email:loginData.email})
  //   console.log(users);
  //    if(users){
  //     await bcrypt.compare(loginData.password,users.password).then((status)=>{
  //       if(status){

  //         res.redirect('/')
  //       }else{
  //         res.redirect('/login')
  //       }
  //     })
  //    }else{
  // console.log('email is incorrect');
  //    }

  //     },
  home: async (req, res) => {
    if (req.session.userLoggedIn) {
      let users = req.session.user.userName
      let count = await cartHelper.getCartItemsCount(req.session.user.id);

      let category =adminHelper.findAllCategory()
      res.render('users/homePg', { users, count,category })
    } else {
      res.render('users/homePg')
    }

  },
  signUp: (req, res) => {
    res.render('users/signup')
  },
  postSignup: async (req, res, next) => {
    console.log(req.body);
    let data = req.body

    let hashedPassword = await bcrypt.hash(data.password, 10)
    console.log(hashedPassword);
    let users = new db.User({
      name: data.username,
      email: data.email,
      phone: data.phone,
      password: hashedPassword

    })
    console.log(users);

    await users.save().then((response) => {
      res.redirect('/login')
    })


  },

  listProduct: async (req, res) => {
    
    let users = req.session.user.userName
    let count = await cartHelper.getCartItemsCount(req.session.user.id);
    userHelper.findAllCategory().then((Cat_response) => {



      userHelper.findAllProducts().then((response) => {

        console.log(count);

        console.log(Cat_response, "Category response is printed");
        console.log(response, "responce is printed...................");



        res.render('users/shop', { response, Cat_response, count, users })
      })
    })
  },

  otplogin: function (req, res) {
    res.render('users/otp', { layout: false })

  },
  otpvalidation: function (req, res) {
    console.log(req.body);
    const phonenumber = req.body.Number
    req.session.phone = phonenumber
    userHelper.otpGenerate(phonenumber).then((response) => {
      res.render('users/otp')
    }).catch((err) => {
      console.log(err)
      res.redirect('/signup')
    })
  },

  logout: (req, res) => {
    try {
      req.session.userLoggedIn = false;
      res.redirect("/login");
    } catch (error) {
      req.status(500);
    }
  },
  getOtpverify: (req, res) => {
    res.render('users/otp-number')
  },
  Otpverify: (req, res) => {
    console.log("fregillllllllllllllllllllllllll")
    const otp = req.body.otp
    const phone = req.session.phone

    userHelper.verifyOtp(otp, phone).then((response) => {
      console.log(response, "response from otp login")
      if (response.status) {
        console.log(response.status, 'ldskfldkfldksf')
        req.session.user = response.user
        res.redirect('/')
      } else {
        let Err = "invalid otp"
        res.render('users/otp-number', { layout: false, Err })
      }
    }).catch((Err) => {
      console.log(Err)
      res.redirect('/signup')
    })

  },


  getCart: (req, res) => {
    console.log(req.params.id);
    console.log(req.session.user);
    cartHelper.addToCart(req.params.id, req.session.user.id).then((data) => {
      res.redirect('/shop')
    })
    //  res.render('users/cart')
  },

  getViewCart: async (req, res) => {

    let userId = req.session.user;
    let users = req.session.user.userName
    let count = await cartHelper.getCartItemsCount(req.session.user.id);
    let total = await cartHelper.totalAmountOfProductsInCart(req.session.user.id)
    let cartItems = await cartHelper.viewCart(req.session.user.id)
    console.log(cartItems, "mmmmmmmmmmmeeeeeejjjjjjooooooo");
    console.log(userId, "this is user id/////////////////////////////////");

    console.log(cartItems);
    res.render('users/cart', { cartItems, count, users, total, userId })


  },
  getDeleteCart: async (req, res) => {
    try {
      await cartHelper.deleteCart(req.body).then((response) => {
        res.json(response);
      });
    } catch (error) {
      res.status(500)
    }
  },

  postchangeProductQuantity: async (req, res) => {

    try {


      console.log(req.body);


      await cartHelper.changeProductQuantity(req.body).then(async (response) => {
        res.json(response)
      })

    } catch (error) {

    }

  },

  // postchangeProductQuantity: async (req, res) => {
  //   try {
  //     await cartHelper.changeProductQuantity(req.body).then(async (response) => {
  //       response.total = await cartHelper.totalCheckOutAmount(req.body.user);

  //       res.json(response);
  //     });
  //   } catch (error) {
  //     res.status(500)
  //   }
  // },

  getAddress: (req, res) => {
    let userId = req.session.user;
    let users = req.session.user.userName
    res.render('users/addAddress', { userId, users })
  },

  postAddresspage: async (req, res) => {

    try {
      await checkoutHelper.postNewAddress(req.session.user.id, req.body).then(() => {
        res.redirect('/add_address')
      })
    } catch (error) {
      res.status(500)
    }

  },

  displayAddresses: async (req, res) => {
    try {
      const userid = req.session.user.id;


      const userId = req.session.user;


      const users = req.session.user.userName


      const cartItems = await cartHelper.viewCart(req.session.user.id)


      let total = await cartHelper.totalAmountOfProductsInCart(req.session.user.id)


      let count = await cartHelper.getCartItemsCount(req.session.user.id);


      const addressData = await db.address.findOne({ userid: userid });

      const ad_data = addressData === null ? [] : addressData.Address
      console.log(addressData,
        'tdtdftdrdrftgyhugytfred4ws');

      res.render('users/checkoutPage', { addresses: ad_data, users, userId, cartItems, total, count });

    } catch (error) {
      res.status(500).send('Error fetching addresses');
    }
  },



  postCheckout: async (req, res) => {

    try {

      total = await cartHelper.totalAmountOfProductsInCart(req.session.user.id)
      console.log(req.session.user.id, 'pppppppppppppp');
      console.log("hiiiiiiiiiiii");


      console.log(req.body, 'lllllllllll')
      let order = await orderHelper.placeOrder(req.body, total, req.session.user.id).then(async (response) => {
        if (req.body['payment-method'] == 'COD') {
          res.json({ codstatus: true })

        } else {
          orderHelper.generateRazorpay(req.session.user.id, total).then((order) => {
            res.json(order);
          });

        }

      })


    } catch (error) {
      res.status(500)
    }


  },

  postVerifyPayment: (req, res) => {
    console.log("rtytrewqq");
    console.log(req.body);
    orderHelper.verifyPayment(req.body).then(() => {

      orderHelper.changePaymentStatus(req.session.user.id, req.body['order[receipt]']).then(() => {
        res.json({ status: true })

      }).catch((err) => {
        res.json({ status: false, err })
      })

    })


  },

  orderSuccess: (req, res) => {
    let users = req.session.user.userName
    res.render('users/order-success', { users })
  },

  getOrderPage: async (req, res) => {

    try {
      let users = req.session.user.userName
      const userSession = req.session.userLoggedIn
      const userId = req.session.user.id
      const count = await cartHelper.getCartItemsCount(req.session.user.id);


      const getDate = (date) => {
        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();
        let hours = date.getHours();
        let minutes = date.getMinutes();
        let seconds = date.getSeconds();
        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
          } ${date.getHours(hours)}:${date.getMinutes(minutes)}:${date.getSeconds(seconds)}`;
      };
      await orderHelper.orderPage(req.session.user.id).then((response) => {

        res.render('users/orderlist', { response, userSession, userId, count, users, getDate })
      })
    } catch (error) {
      res.status(500)
    }


  },

  orderDetail: async (req, res) => {

    try {
      let orderId = req.query.order
      
      getDate = (date) => {

        let orderDate = new Date(date);
        let day = orderDate.getDate();
        let month = orderDate.getMonth() + 1;
        let year = orderDate.getFullYear();

        return `${isNaN(day) ? "00" : day}-${isNaN(month) ? "00" : month}-${isNaN(year) ? "0000" : year
          }`;
      };

      await orderHelper.viewOrderDetails(orderId).then(async (response) => {
        let products = response.products[0]
        let address = response.address[0]
        console.log(address);
        console.log('dfghnmdfghjaggress');
        const count = await cartHelper.getCartItemsCount(req.session.user.id);
        const userSession = req.session.userLoggedIn
        const userId = req.session.user.id
        let orderDetails = response.details
        console.log(response,"seeeeeeeeeeeeeeeeeeeeeeeeeeee");

        let data = await orderHelper.createData(response, getDate)
         console.log(data,'yuuuuuuuuuuuuuuuuuuuuuuuuu');

        console.log(orderDetails, "6");
        // let data = userHelper.createData(response, getDate)
        console.log("1");
        console.log(req?.session?.user?.userName, "[[[[[[[[[[[[[[");
        let users = req.session.user.userName
        // res.render("users/orderDetails", { products, address, orderDetails, userSession, userId, count, getDate, users })
        res.render("users/orderDetails", { products, address, orderDetails, data, userSession, userId, count, getDate, users })
      })
      console.log("44");

    } catch (error) {
      res.status(500)
    }



  },

  singleProduct: (req, res) => {
    const id = req.query.id
    userHelper.findProduct(id).then((data) => {
      console.log(data, ":::::::");
      res.render('users/singleProduct', { data })
    })

  },
  getSearch: async (req, res) => {
    console.log(req.body, 'boby....................');
    console.log('getSEarch................................');
    const userSession = req.session.userLoggedIn
    const userId = req.session.user.id
    const count = await cartHelper.getCartItemsCount(req.session.user.id);
    let category= await adminHelper.findAllCategory()
    console.log('gggggggggggggggggg',category,"gggggggggggggggggggggggggg");

    let Cat_response = await adminHelper.viewAddCategory()

    userHelper.productSearch(req.body).then((response) => {
      console.log(response,'----------------------------------------');
      res.render('users/shop-new', {  userSession, userId, response, Cat_response, count, category })
      console.log(response);

    })
  },

  catFilter: async(req,res)=>{
    let count = await cartHelper.getCartItemsCount(req.session.user.id);
    const userSession = req.session.userLoggedIn
    const userId = req.session.user.id
    let Cat_response = await adminHelper.viewAddCategory()
    console.log(req.query.id,'iiiiiiiiiiiiiiiiiiiiiiiiii');
    try{
      let category= await userHelper.catProduct(req.query.id)
      console.log(category,'ttttttttttttttttttt');
      let catPro= await userHelper.Product(category)
      console.log(catPro,'catPro');

      res.render('users/shop-new2',{catPro,count,userHelper,userId,Cat_response})

    }catch(error){


    }



  },

  canOrder:(req,res)=>{

    orderId=req.params.id
    console.log(req.params.id,'pppppppppppppp');
    var message = "Canceled"
    userHelper.customerStatusChange(orderId,message)

    res.redirect('/order_details?order='+orderId)
  },

  returnOrder:(req,res)=>{

    orderId=req.params.id
    console.log(req.params.id,'pppppppppppppp');
    var message = "Returned"
    userHelper.customerStatusChange(orderId,message)

    res.redirect('/order_details?order='+orderId)

  }





}







