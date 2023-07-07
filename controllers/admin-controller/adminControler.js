const { response } = require('express');
const adminHelper = require('../../helpers/admin_helpers')

// module.exports={
//     postLogin:(req,res,next)=>{
//         let data = req.body
//         userHelper.postLogin(data).then((status)=>{
//             console.log(status);
//             if(status){

//             }else{
//                 res.redirect('/login')
//             }
//         })
//     },
//     login: function(req,res) {

//         res.render('admin/admin-login',{layout:"admin-layout"})
//     }
// }
let adminStatus,viewCategory;

const adminCredential = {
    name: "myAdmin",
    email: "admin@gmail.com",
    password: "admin123",
  };

module.exports={

getLogin:(req, res) => {
    res.render('admin/adminLogin',{layout:'adminLayout'});
  },

  getAllUsers: (req,res)=>{
    adminStatus = req.session.adminloggedIn;
    
    const users = adminHelper.getUsers().then((users)=>{

      res.render('admin/allUsers',{layout:'adminLayout',users,adminStatus
    })
  })
  },
  adminLogout: (req, res) => {
    try {
      if (req.session.adminloggedIn) {
        req.session.user=null
        req.session.adminloggedIn = false
        res.redirect('/admin/login')
      }
      
    } catch (error) {
      res.status(500);
    }
  },

  postAdminLogin:(req, res) => {
    if (
      req.body.email == adminCredential.email &&
      req.body.password == adminCredential.password
    ) {
      (req.session.admin = adminCredential), (req.session.adminloggedIn = true);
      adminloginErr = false;
      adminStatus = req.session.adminloggedIn;

      res.render("admin/adminHome",{layout:"adminLayout", adminloginErr,
      adminStatus});
    } else {
      adminloginErr = true;

      res.render("admin/loginNew", {
        layout: "adminLayout",
        adminloginErr,
        adminStatus,
      });
    }
  },
  getHome:(req,res)=>{

    let admins=req.session.admin.name
    res.render('admin/adminHome',{layout:'adminLayout',admins})

  },

  getDashboard: async (req, res) => {

    let  adminStatus = req.session.adminloggedIn;
    let admi=req.session.admin.name

    let totalProducts, days = []
    let ordersPerDay = {};
    let paymentCount = [];
    let ordersPerMonth ={}

    let Products = await adminHelper.getViewProduct()

    console.log(Products,"products''''''''''''''''''''''''");



    totalProducts = Products.length

    let orderByCod = await adminHelper.getCodCount()
    console.log(orderByCod,"orderByCod.......................");

    let codCount = orderByCod.length
    let orderByOnline = await adminHelper.getOnlineCount()
    let totalUser = await adminHelper.totalUserCount()

    console.log(orderByOnline,'orderByOnline........................');
console.log(totalUser,'totalUser.............................');
    let totalUserCount = totalUser.length
console.log(totalUserCount,'totalUserCount.....................');


    let onlineCount = orderByOnline.length;


    paymentCount.push(onlineCount)
    paymentCount.push(codCount)

    await adminHelper.getOrderByDate().then((response) => {
      const result = response.map(item => item.orders).flat();
      result.forEach((order) => {
        const ans = {
          createdAt: order.createdAt,
        };
        days.push(ans);
      });



      days.forEach((order) => {
        const day = order.createdAt.toLocaleDateString('en-US', { weekday: 'long' });
        ordersPerDay[day] = (ordersPerDay[day] || 0) + 1;
      const month = order.createdAt.toLocaleDateString('en-US', { month: 'long' });
    ordersPerMonth[month] = (ordersPerMonth[month] || 0) + 1;
  });
    })
     console.log(ordersPerMonth,'days..........................');
console.log( ordersPerDay,' ordersPerDay..................');
    await adminHelper.getAllOrders().then((response) => {
      var length = response.length
    
      let total = 0;

      for (let i = 0; i < length; i++) {
        total += response[i]?.orders?.totalPrice;
      }

      res.render("admin/adminHome", { layout: 'adminLayout', admi, adminStatus, length, total, ordersPerMonth,totalProducts, ordersPerDay, paymentCount, totalUserCount });

    })

  

},
getCategory:async(req, res)=>{
  let admins=req.session.admin.name
  adminStatus = req.session.adminloggedIn;
  viewCategory= await adminHelper.viewAddCategory().then((viewCategory)=>{

  res.render('admin/addCategory',{layout:'adminLayout',admins,adminStatus,
  viewCategory,
})
})

},
  postCategory: (req, res) => {        
    let admins=req.session.admin.name
    adminStatus = req.session.adminloggedIn;
    // adminHelper.addCategory(req.body).then((data) => {
      adminHelper.addCategory(req.body).then((response)=>{


      let categoryStatus = response.categoryStatus;
      if (categoryStatus == false) {
        res.redirect("/admin/add_category");
      }else {
        adminHelper.viewAddCategory().then((response) => {
          viewCategory = response;
          console.log(viewCategory);
          res.render("admin/addCategory", {
            layout: 'adminLayout',
             admins,
             adminStatus,
            viewCategory,
            categoryStatus,
          });
        });
      }
    });
  },

  unlistCategory:(req,res)=>{

    console.log(req.params.id);
    let admins=req.session.admin.name
  adminHelper.unlist_category(req.params.id).then((response)=>{
    res.redirect('/admin/add_category',{admins})
    
  
  })
  

  },

  listCategory:(req,res)=>{
    console.log(req.params.id);
    let admins=req.session.admin.name
    adminHelper.list_category(req.params.id).then((response)=>{
     res.redirect('/admin/add_category',)
    })
  },

  getEditCategory:async(req, res) => {
    console.log(req.params.id);
    adminStatus = req.session.adminloggedIn;
    let admins=req.session.admin.name
    viewCategory= await adminHelper.viewAddCategory()
    adminHelper.edit_category(req.params.id).then((editedData)=>{
     console.log(editedData);
    

      res.render('admin/editCategory',{layout:'adminLayout',admins,adminStatus,
      viewCategory,editedData
    })

  })
},

postEditCategory:async(req,res)=>{

  console.log(req.params.id);
  let response= await adminHelper.postEditCategory(req.params.id,req.body)

  res.redirect('/admin/add_category')

},
  
  getAddProduct:(req, res) => {
    let admins=req.session.admin.name
    adminStatus = req.session.adminloggedIn;
    adminHelper.findAllCategory().then((response) => {
      console.log(response);
    res.render('admin/addProduct',{layout:'adminLayout',response,admins,adminStatus});
    })
  },

  postAddProduct:(req,res)=>{
    console.log(req.file);
    console.log(req.body);
    const image = req.files.map(files => (files.filename))
    adminHelper.postAddProduct(req.body,image).then((response)=>{
      res.redirect("/admin/view_product")
    })
  },

  getVeiwProduct:(req,res)=>{
    adminStatus = req.session.adminloggedIn;
    adminHelper.findAllProducts().then((response) => {
    
    
    res.render('admin/viewProducts',{layout:'adminLayout',response,adminStatus})
  });
  },
  editViewProduct: (req, res) => {
    adminHelper.viewAddCategory().then((response) => {
      let procategory = response;
      adminHelper.editProduct(req.params.id).then((response) => {
        editproduct = response;
        res.render("admin/editProduct", {
          layout: "adminLayout",
          adminStatus,
          editproduct,
          procategory,
        });
      });
    });
  },

  postEditAddProduct: (req, res) => {
    
      console.log(req.body,req.files);
      const images = []
      if (!req.files.image1) {
        let image1 = req.body.image1
        req.files.image1 = [{
          fieldname: 'image1',
          originalname: req.body.image1,
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: 'public/uploads',
          filename: req.body.image1,
          path: ` public\\uploads\\${image1}`,
        }]
      }
      if (!req.files.image2) {
        let image2 = req.body.image2
        req.files.image2 = [{
          fieldname: 'image2',
          originalname: req.body.image2,
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: 'public/uploads',
          filename: req.body.image2,
          path: `public\\uploads\\${image2}`,
        }]
      }
      if (!req.files.image3) {
        let image3 = req.body.image3
        req.files.image3 = [{
          fieldname: 'image3',
          originalname: req.body.image3,
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: 'public/uploads',
          filename: req.body.image3,
          path: `public\\uploads\\${image3}`,
        }]
      }
      if (!req.files.image4) {
  
        let image4 = req.body.image4
        req.files.image4 = [{
          fieldname: 'image4',
          originalname: req.body.image4,
          encoding: '7bit',
          mimetype: 'image/jpeg',
          destination: 'public/uploads',
          filename: req.body.image4,
          path: `public\\uploads\\${image4}`,
        }]
  
      }
  
      if (req.files) {
        Object.keys(req?.files).forEach((key) => {
          if (Array.isArray(req?.files[key])) {
            req?.files[key]?.forEach((file) => {
              console.log(file,">>>>>>>>>");
              images.push(file.filename);
            });
          } else {
            images.push(req?.files[key]?.filename);
          }
        });
      }
  
     
    

   

    adminHelper
      .postEditProduct(req.params.id,req.body, images)
      .then((response) => {
        res.redirect("/admin/view_product");
      })
      .catch((err) => {
        res.status(500).send('Internal server error');
      });
  },

  unlistProduct:(req,res)=>{

    console.log(req.params.id);

  adminHelper.unlist_product(req.params.id).then((response)=>{

    res.redirect('/admin/view_product')
    
  
  })
  

  },

  listProduct:(req,res)=>{

    console.log(req.params.id);
    adminHelper.list_product(req.params.id).then((responce)=>{
      res.redirect('/admin/view_product')
    })

  },


  getBlockUsers:(req,res)=>{
  adminHelper.blockUser(req.params.id).then((response)=>{
    res.redirect('/admin/user')
  })

  },
  getUnblockUser:(req,res)=>{
    adminHelper.unBlockUser(req.params.id).then((responce)=>{
      res.redirect('/admin/user')
    })
  },

  getOrderList: (req, res) => {


    adminHelper.orderPage().then((response) => {

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
      adminStatus = req.session.adminloggedIn

      res.render('admin/order-list', { layout: 'adminLayout', adminStatus, response, getDate })
    })
  },

  getOrderDetails: (req, res) => {
    adminHelper.orderDetails(req.query.orderid).then((order) => {
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
      console.log(order,'yyyyyyyyyyyyyyyyyy');
      let products = order.orders[0].productDetails
      let total = order.orders[0].totalPrice
console.log(order,"ooooooooooooooorrrrrrrdddddddeeeeeeerrrrrrr");
      console.log(products,'====================================');
      console.log(total,'=============================...........');
      
      adminStatus = req.session.adminloggedIn
      res.render('admin/order-details', { layout: 'adminLayout', adminStatus, order, products, total, getDate })
    })

  },

  postOrderDetails: (req, res) => {
    adminHelper.changeOrderStatus(req.query.orderId, req.body).then((response) => {
      res.redirect('/admin/orders_list')
    })

  },

  
  

}