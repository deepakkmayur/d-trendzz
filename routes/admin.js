const express = require("express");
const router = express.Router();            
const objectId = require('mongodb').ObjectId
const adminHelpers = require("../helpers/admin-helpers");
const userHelpers = require("../helpers/user-helpers");

const upload = require("../middleware/multer");





router.get("/", function (req, res) {
  if (req.session.isadminLogged) {
    res.render("admin/admindashboard", { layout: "admin-main-layout" });
  } else res.redirect("/admin/login");                
});



router.get("/login", (req, res) => {
  if (req.session.isadminLogged) {
    res.redirect("/admin");
  } else
    res.render("admin/adminlogin", {
      adminLogin: true,
      errorMessage: req.flash("key"),
      layout: "admin-main-layout",
    });
});

router.post("/adminlogin", (req, res) => {
  adminHelpers.doLogin(req.body).then((data) => {
    if (data) {
      req.session.isadminLogged = true;
      res.redirect("/admin");
    } else {
      req.flash("key", "invalid email or password");
      res.redirect("/admin/login");
    }
  });
});

router.get("/admin_logout", (req, res) => {
  // console.log("login page is here---------");
  if (req.session.isadminLogged) {
    req.session.destroy((err) => {
      if (err) throw err;
      res.redirect("/admin");
    });
  } else {
    res.redirect("/admin");
  }
});





router.get("/add_product", (req, res) => {
  ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
 adminHelpers.findCategory().then((category)=>{   
 
   if (req.session.isadminLogged) {
     res.render("admin/addproducts", { layout: "admin-main-layout", errorMessage:req.flash('error'),category });
   } else {
     res.redirect("/admin/login");
   }
 })     

});

router.post("/add_product", upload.array("image", 3), (req, res) => {

  const img_id = [];    

  // console.log(req.files);

  req.files.forEach((element) => {              
    img_id.push(element.filename);
  });

  //image will be saved as 'img_id' in database
  req.body.img_id = img_id;
  req.body.category = objectId(req.body.category)

  adminHelpers.doAddproduct(req.body).then((data) => {                                          
    if (data) {
      // console.log(data);

      res.redirect("/admin/admin_product");
    } else {
      res.redirect("/admin/add_product");
    }
  });
});


router.get("/admin_product", (req, res) => {   

 
  if (req.session.isadminLogged) {
    adminHelpers.showProduct().then((products) => {
      // console.log("prod-------------",products[7].lookup_category[0].category_name)
      // res.send('success 2')
      res.render("admin/adminproducts", {
        layout: "admin-main-layout",
         products,
      });
    });
  } else {
    res.redirect("/admin/login");
  }
});

router.get("/edit_product/:id", (req, res) => {
  // console.log(req.params);
  if (req.session.isadminLogged) {
    adminHelpers.doEditpage(req.params).then((foundData) => {
      //  console.log(foundData);
      res.render("admin/adminEditproduct", {
        layout: "admin-main-layout",
        editProduct: foundData,
      });
    });
  } else {
    res.redirect("/admin/login");
  }
});




router.post("/edit_product/:id",upload.array("image", 3),(req, res) => {
  // console.log("--------files",req.files);
  const img = [];
  // console.log("---------------file name",req.files[0].filename);
  req.files.forEach((element)=>{       
    img.push(element.filename)
  })
  req.body.img_id = img
  adminHelpers
    .doEditproduct(req.body, req.params)
    .then((data) => {
      if(data){
        res.redirect('/admin/admin_product')
         
      }else{
        console.log('error');
      }
   
    })
    .catch((err) => {
      res.redirect("/admin/error");
    });
});





router.get("/delete_product/:id", (req, res) => {
  adminHelpers
    .doDeleteproduct(req.params)
    .then((data) => {
      if (data) {
        res.redirect("/admin/admin_product");
      }
    })
    .catch((err) => {
      res.redirect("/admin/error");
    });
});


router.get('/user_management',(req,res)=>{
adminHelpers.userManagement().then((userdetails)=>{
  if(userdetails){
    res.render('admin/adminUsermanagement',{ layout: "admin-main-layout",userdetails })

  }else{
    res.redirect('/admin')
  }
})
})






router.get('/block_user/:id',(req,res)=>{  
      
  adminHelpers.blockUser(req.params).then((data)=>{   
    if(data){
      res.redirect('/admin/user_management')

    }else{

      res.redirect('/admin/user_management')
    }
  }) 
})


router.get('/unblock_user/:id',(req,res)=>{
  // console.log(req.params);
  adminHelpers.unblockUser(req.params).then((data)=>{
    if(data){
      res.redirect('/admin/user_management')
    }else{
      res.redirect('/admin/user_management')
    }
  })  
})


router.get("/admin_viewOrder",async(req,res)=>{   
 if (req.session.isadminLogged) {
    let orderedProducts=await adminHelpers.bringOrderDetails(req.query.id)
      console.log(orderedProducts[0].orderDetails.products,"---------------------------------------------------");
    res.render('admin/admin-viewOrder',{ layout: "admin-main-layout",orderedProducts })
  }
})


router.get('/change_status',async (req,res)=>{
  let statusUpdate=await adminHelpers.adminUpdateStatus(req.query.id,req.query.status)
   if(statusUpdate){    
   let userId=req.query.userId
     res.redirect("back")    
   }
})

router.get('/view_userProduct',(req,res)=>{
  console.log(req.query,"----------------------id----------------");

  userHelpers.viewEachproduct(req.params.id).then((productDetails) => {
    console.log(productDetails,"--------productDetails----------------------------------"); 
  })

})


router.get("/error", (req, res) => {
  res.render("admin/adminerrorpage", { layout: "admin-main-layout" });
});

module.exports = router;