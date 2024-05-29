const express=require('express')
const app=express()
const body=require('body-parser')
const mongoose  = require('mongoose')
const url='mongodb+srv://bloom-tools_2024:bloom_tools_2024@cluster0.dw7lvak.mongodb.net/bloom_tools'
mongoose.connect(url).then(()=>console.log()).catch((e)=>console.log('error in connection'))
var schema=new mongoose.Schema({
    username:{type:String,required:true},
    password:{type:String,required:true},
    email:{type:String,required:true},
    phone:{type:String,required:true},
    revenue:{type:Number,required:false,default:0},
    total_orders:{type:Number,required:false,default:0}
},{collection:'user-data'})
var user=mongoose.model('user',schema)

app.set('view engine','hbs')
app.use(express.static('public'))
app.use(body.json())
app.use(body.urlencoded(false))
var [username,email,phone,accountid,password]=['','','','','']
const port=8000||1501
// main landing page
app.get('/',(req,res)=>{
    if(username=='')
        res.redirect('/login')
    else
    res.redirect('/home')
})
// login page
app.get('/login',(req,res)=>
{
    if(username=='')
    res.render('login')
else
res.redirect('/home')
})


//login page
app.post('/login',(req,res)=>{
    var username_login=req.body.username_login
    var password_login=req.body.password_login
    user.findOne({username:username_login,password:password_login}).then((r)=>{
        if(r==null){
            console.log(r)
        res.redirect('/login/error')
        }
        else{
            username=r.username
            password=r.password
            email=r.email
            phone=r.phone
            res.redirect('/home')

}})
})


//login error page
app.get('/login/error',(req,res)=>{
    if(username=='')
    res.render('error/loginerror')
else
res.redirect('/login')
})
app.get('/home',(req,res)=>{
if(username=='')
res.redirect('/login')
else
res.render('home',{
    blusername:username,
    blpassword:password,
    blemail:email,
    blphone:phone
})
})
//logout
app.get('/logout',(req,res)=>{
   username=''
   email=''
   password=''
   accountid=''
    res.redirect('/login')
})
//register page
app.get('/register',(req,res)=>{
    if(username=='')
    res.render('register')
else
res.redirect('/home')
})
app.post('/register',(req,res)=>{
    var username_r=req.body.username_reg
    var password_r=req.body.password_reg
    var email_r=req.body.email_reg
    var phone_r=req.body.phone_reg
    user.findOne({username:username_r}).then((r)=>{
        if(r==null){
        user({username:username_r,password:password_r,email:email_r,phone:phone_r}).save().then(()=>console.log('new account created'))
    .catch(()=>console.log('problem occured'))
  res.redirect('/login')
}
    else
    res.redirect('/register/error')
    })
})
//error register
app.get('/register/error',(req,res)=>{
    if(username=='')
    res.render('error/registererror')
else
res.redirect('/home')
})


//contact us page
app.get('/contact',(req,res)=>{
    res.render('contact')
})

// product

app.get('/finances',(req,res)=>{
    if(username=='')
    res.redirect('/login')
else{
    user.findOne({username:username,email:email,phone:phone}).then((r)=>{

      res.render('finance/finance',{
        total_profit:r.profit,
        total_revenue:r.revenue,
        total_orders:r.total_orders,
       blusername:username,
      blemail:email
      })
    })
}
})

//ordering rite

const schema_order=new mongoose.Schema({
    seller_name:String,
    product_image:String,
    customer:String,
    quantity:Number,
    price:Number,
    product_name:String,
    mode:String,
    landmark:String,
    pincode:String,
    address:String,
    state:String,
    phone:String,
    status:{type:String,default:'Pending'}
    
},{collection:'orders'})
const orders=mongoose.model('orders',schema_order)

//orderring page

 //showing orders
 app.get('/order',(req,res)=>{
if(username=='' || username==undefined)
res.redirect('/login')
else{
    orders.find({seller_name:username,status:'Cancelled'}).then((result_cancel)=>{
     orders.find({seller_name:username,status:'Pending'}).then((result_pending)=>{
        orders.find({seller_name:username,status:'Delivered'}).then((result_delivered)=>{
            var [cancel,pending,delivered]=['No Order Is Cancelled','No Orders Placed','No Orders Has Been Delivered']
            if(result_cancel.length>0)
            cancel=''
        if(result_pending.length>0)
        pending=''
    if(result_delivered.length>0)
    delivered=''
        res.render('order/order_view',{
            bl_order_pending:result_pending,
            blusername:username,
            blemail:email,
            bl_order_cancel:result_cancel,
            bl_order_deli:result_delivered,
            bl_no_found_pending:pending,
            bl_no_found_delivered:delivered,
            bl_no_found_cancel:cancel
        })
        })
     })
    })
}
})

app.get('/order/:id',(req,res)=>{
if(username=='')
res.redirect('/login')
else{
    var orderid=req.params.id
    orders.findOne({_id:orderid}).then((result)=>{
        res.render('order/order_view_i',{
            bl_id:result._id,
            bl_seller:result.seller_name,
            bl_product_image:result.product_image,
            bl_product:result.product_name,
            total_price:result.price,
            bl_customer:result.customer,
            bl_address:result.address,
            bl_phone:result.phone,
            bl_q:result.quantity,
            bl_state:result.state,
            bl_pin:result.pincode,
            bl_landmark:result.landmark,
            bl_mode:result.mode,
            bl_status:result.status
        })
    })
}
})



app.post('/order/delivered/:id',(req,res)=>{
    if(username=='' || username==undefined)
    res.redirect('/login')
else{
    var orderstatus=''
    var orderprice=0
    var totalorders=0
    var totalprice=0
    orders.findOne({_id:req.params.id}).then((result)=>{
       orderstatus=result.status
       orderprice=result.price
    //    console.log(orderstatus)
    if(orderstatus=='Pending'){
        console.log(orderstatus)
        orders.findOneAndUpdate({_id:req.params.id},{status:'Delivered'}).then(()=>{
          user.findOne({username:username}).then((results)=>{
          totalorders=(results.total_orders)+1
          totalprice=(results.revenue)+orderprice
 user.findOneAndUpdate({username:username},{revenue:totalprice,total_orders:totalorders})
        .then(()=>{
            res.redirect('/order')
        }).catch(()=>{})
             
        })})
        .catch(()=> {})
        }})
}
})
app.post('/order/cancel/:id',(req,res)=>{
    if(username=='' || username==undefined)
    res.redirect('/login')
else{
    orders.findOneAndUpdate({_id:req.params.id},{status:'Cancelled'}).then(()=>{
    res.redirect('/order')
    }).catch(()=>{res.send('errro in updating')})
}
})


//products page
const multer=require('multer')
var filename=''
const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, 'public/uploads/')
    },
    filename: function (req, file, cb) {
        filename=Date.now()+file.originalname
      cb(null,filename)
    }
  })


  const upload = multer({ storage: storage })
var product_company=''



//new product schema
const schemas=new mongoose.Schema({
    username:{type:String},
    product_name:{type:String},
    price:{type:Number,required:true},
    image:{type:String,required:true},
    details:{type:String,require:true},
 
},{collection:'products'})
const products=mongoose.model('products',schemas)




app.get('/product',(req,res)=>{
  if(username=='' || username==undefined)
    res.redirect('/login')
else{
    products.find({username:username}).then((data)=>{
var empty_no_product=''
if(data.length>0)
    empty_no_product=''
else
    empty_no_product='No Listed Product'

console.log(empty_no_product)
        res.render('product/product',{
        blusername:username,
        blemail:email,
        product_data:data,
        empty_product:empty_no_product
        })
        }).catch(()=>res.render('error_page'))
})

app.post('/product/delete',(req,res)=>{
    var product_id=req.body.product_id_dle
    products.deleteOne({_id:product_id}).then(()=>{
        res.redirect('/product')
    })
    .catch(()=>console.log('errror occured'))
})
app.get('/product/add/new',(req,res)=>{
    if(username=='' || username==undefined)
    res.redirect('/login')
else{
    res.render('new_product')
}
})
app.post('/product/add/new',upload.single('product_new_img'),(req,res)=>{
    var new_name=req.body.product_new_name
    var new_price=req.body.product_new_price
    var new_profit=req.body.product_new_profit
    var new_detail=req.body.product_new_detail
    var new_img=req.body.product_new_img
    console.log(new_img)
   products({username:username,product_name:new_name,price:new_price,profit:new_profit,
    image:`uploads/${filename}`,details:new_detail})
   .save().then(()=>res.redirect('/product'))

   filename=''
    
})
app.get('/product/:id',(req,res)=>{
    var idaddress=`${req.params.id}`
    products.findOne({_id:idaddress}).then((result)=>{
        if(result==null)
        res.send('error page not found')
    else{
        product_company=result.username
        res.render('product/product_view',{
            bl_id:idaddress,
            bl_name:result.product_name,
            bl_price:result.price,
            bl_detail:result.details,
            bl_img:result.image,
            bl_cp:result.username
        })}
    })
    })


app.get('/product/order/:id',(req,res)=>{
products.findOne({_id:req.params.id}).then((result)=>{

    res.render('product/product_order',{
        bl_product_name:result.product_name,
        bl_id:result._id,
        bl_price:result.price,
        bl_image:result.image
    })

})
})

app.post("/order/confirm/place/:productid",(req,res)=>{
 products.findOne({_id:req.params.productid}).then((result)=>{
    orders({
        seller_name:result.username,
        product_image:result.image,
        customer:req.body.cus_name,
        quantity:req.body.cus_qty,
        price:req.body.cus_qty*result.price,
        product_name:result.product_name,
        mode:req.body.cus_mode,
        pincode:req.body.cus_pin,
        address:req.body.cus_address,
        state:req.body.cus_state,
        phone:req.body.cus_phone,
        landmark:req.body.cus_landmark
       }).save().then(()=>{
        res.render('order/order_placed',{
       bl_order_name:req.body.cus_name,
       bl_order_address:req.body.cus_address,
       bl_order_total:req.body.cus_qty*result.price,
       bl_image:result.image
        })
       })

 })
})

//contact us page


const schema_contact=new mongoose.Schema({
    username:{type:String,required:true},
    email:{type:String,required:true},
    message:{type:String,required:true}
},
{collection:'user_contact'})
const user_contact=mongoose.model('user_contact',schema_contact)
app.post('/contact',(req,res)=>{
    var usernamecontact=req.body.username_contact
    var emailcontact=req.body.email_contact
    var messagecontact=req.body.msg_contact
   user_contact({username:usernamecontact,
                 email:emailcontact,
                 message:messagecontact}).save().then(()=>res.render('contact/success'))
                 .catch(()=>res.render('contact/failure'))
})




app.get('/*',(req,res)=>{
    res.send('erro no page found')
})
app.listen(port)
