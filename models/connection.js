const mongoose = require('mongoose');

mongoose.connect('mongodb://0.0.0.0:27017/WATCH', {
  useNewUrlParser: true,
  useUnifiedTopology: true
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'connection error:'));
db.once('open', function () {
  console.log('Connected to the database!');
});






const userSchema = new mongoose.Schema({



  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true,
    unique: true
  },
  password: {
    type: String,
    required: true
  },
  phone: {
    type: Number,
    required: true
  },
  blocked:{
    type:Boolean,
    default: false

  }
});




const categorySchema = new mongoose.Schema({


  categoryName: {
    type: String,
    required: true
  },
  
  list:{
    type:Boolean,
    default:true
  }


})


const productSchema = new mongoose.Schema({
  productName: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: true
  },
  price: {
    type: Number,
    required: true
  },
  quantity: {
    type: Number,
    required: true
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  category: {
    type: String,
    required: true
  },
  list:{
    type:Boolean,
    default:true
  },
  image: [{
    type: String,
    required: true
}]


});




const cartSchema = new mongoose.Schema({

  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
  },

  cartItems: [
    {
      productId: { 
        type: mongoose.Schema.Types.ObjectId, 
        ref: "Product" },
      Quantity: {
         type: Number,
         default: 1 },

    },
  ],

});


const addressSchema = new mongoose.Schema({


  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  Address: [
    {
      fname: { type: String },
      lname: { type: String },
      street: { type: String },
      apartment: { type: String },
      city: { type: String },
      state: { type: String },
      pincode: { type: Number },
      mobile: { type: Number },
      email: { type: String }
    }
  ]


})



const orderSchema = new mongoose.Schema({

  userid: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user'
  },
  orders: [{


    name: String,
    productDetails: Array,
    paymentMethod: String,
    paymentStatus: String,
    totalPrice: Number,
    totalQuantity: Number,
    shippingAddress: Object,
    paymentmode: String,
    status: {
      type: Boolean,
      default: true
    },
    createdAt: {
      type: Date,
      default: new Date()
    },
    orderStatus: {
      type: String,
    },
    messageStatus:{
      type: String,
    }
  }
  ]
})








module.exports = {
  User: mongoose.model('User', userSchema),
  Category: mongoose.model('category', categorySchema),
   Product : mongoose.model('Product', productSchema),
   cart: mongoose.model("cart", cartSchema),
    address : mongoose.model("Address", addressSchema),
    order: mongoose.model('order', orderSchema)

}