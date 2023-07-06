const db = require('../models/connection')
module.exports ={

    adminSession: (req, res, next) => {
        // console.log(req.session.admin);
    
        if (req.session.adminloggedIn) {
          next();
        } else {
          res.render("admin/loginNew", {
            layout: "adminLayout",
            adminStatus: false,
          });
        }
      },

      userSession: (req, res, next) => {
        if (req.session.userLoggedIn) {
          next();
        } else {
          res.render("users/login");
        }
      },
      isUserBlock: (async (req, res, next) => {
        let userId = req.session.user.id
        let user = await db.User.findOne({ _id: userId })
        if (!user.blocked) {
        
          next()
    
        } else {
         
    
          res.redirect('/logout')
        }
    
      }),
}