var express = require('express');
var router = express.Router();
const userController=require('../controllers/user-controller/userController');
const middleware = require('../middleware/middleware');
const adminControler = require('../controllers/admin-controller/adminControler');

/* GET users listing. */
router.get('/login', userController.login)

router.post('/login', userController.postLogin)


router.get('/', userController.home)


router.get('/signup', userController.signUp)

router.post('/signup',userController.postSignup)

router.get('/shop',middleware.userSession,middleware.isUserBlock, userController.listProduct)

router.get('/cart/:id' ,middleware.userSession,middleware.isUserBlock, userController.getCart)

router.get('/view_cart',middleware.userSession, userController.getViewCart)

router.delete("/delete_cart_item", middleware.userSession, userController.getDeleteCart);

router.put("/change_product_quantity", middleware.userSession, userController.postchangeProductQuantity);

router.post('/add_address', middleware.userSession, userController.postAddresspage)

router.get('/checkout_pg', middleware.userSession, userController.displayAddresses);

router.post('/checkout_pg',middleware.userSession,userController.postCheckout)

router.post('/verify_payment', middleware.userSession, userController.postVerifyPayment)

router.get('/order_success',middleware.userSession,userController.orderSuccess)

router.get('/order', middleware.userSession, userController.getOrderPage)

router.get('/order_details', middleware.userSession, userController.orderDetail)

router.get('/single_product', middleware.userSession, userController.singleProduct);

router.post('/search', middleware.userSession, userController.getSearch)

router.get('/category-filter',middleware.userSession,userController.catFilter)

router.get('/cancel_order/:id',userController.canOrder)

router.get('/return_order/:id',userController.returnOrder)






router.get('/add_address',middleware.userSession,userController.getAddress)
//otp
router.get('/otpphone',userController.otplogin)

router.post('/otpphone',userController.otpvalidation)
router.get('/otp-verify',userController.getOtpverify)
router.post('/otp-verify',userController.Otpverify)

router.get('/logout',userController.logout);
module.exports = router;
