var express = require('express');
var router = express.Router();
const adminControllers = require('../controllers/admin-controller/adminControler')
const middleware = require("../middleware/middleware")
const multer = require('../multer/multer')

/* GET home page. */
// router.get('/', function(req, res, next) {
//   res.render('index', { title: 'Express' });
// });


// authorisation

router.get('/user', middleware.adminSession, adminControllers.getAllUsers)

router.get('/block-user/:id', middleware.adminSession, adminControllers.getBlockUsers);

router.get('/unblock-user/:id', middleware.adminSession, adminControllers.getUnblockUser)

  // router.get('/login', adminControllers.getLogin);

 router.get("/",middleware.adminSession, adminControllers.getDashboard)

router.get('/Logout',adminControllers.adminLogout)

router.post('/login', adminControllers.postAdminLogin);





//prodect

router.get('/view_product', middleware.adminSession, adminControllers.getVeiwProduct)

router.get('/unlist_product/:id', middleware.adminSession, adminControllers.unlistProduct)

router.get('/list_product/:id', middleware.adminSession, adminControllers.listProduct)

router.get("/edit_product/:id", middleware.adminSession, adminControllers.editViewProduct);

router.post( "/edit_product/:id",multer.edit_Product,adminControllers.postEditAddProduct);
 

router.get('/add_product', middleware.adminSession, adminControllers.getAddProduct)

router.post('/add_product', middleware.adminSession, multer.uploads, adminControllers.postAddProduct)

router.get('/add_category', middleware.adminSession, adminControllers.getCategory)

router.get('/unlist_category/:id', middleware.adminSession, adminControllers.unlistCategory)

router.get('/list_category/:id', middleware.adminSession, adminControllers.listCategory)

router.post('/add_category', middleware.adminSession, adminControllers.postCategory)

router.get('/edit_category/:id', middleware.adminSession, adminControllers.getEditCategory)

router.post('/edit_category/:id', middleware.adminSession, adminControllers.postEditCategory)

router.get("/orders_list", middleware.adminSession, adminControllers.getOrderList)

router.get("/order_details", middleware.adminSession, adminControllers.getOrderDetails)

router.post("/order_details", middleware.adminSession, adminControllers.postOrderDetails)





module.exports = router;
