const express = require("express");
const bodyParser = require("body-parser");
const mongoose=require("mongoose");
const _ =require("lodash");

const app = express();


app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb+srv://admin-sonali:Test123@cluster0-9tefi.mongodb.net/todolistDB",{useNewUrlParser:true});

//mongoose schema
const itemsSchema ={
  name:String
}

//mongoose model
const Item=mongoose.model(
  "Item",itemsSchema
);

//MONGOOSE DOCUMENTS

const item1= new Item({
  name:"welcome to your to do list"
});

const item2= new Item({
name: "hit the + button to add new item"
});

const item3= new Item({
  name:"<-- hit this to delete an item"
});

const defaultItems =[item1,item2,item3];
const listSchema={
    name:String,
    items:[itemsSchema]
};

const List =mongoose.model("List",listSchema);


app.get("/", function(req, res) {

  //mongoose find
  Item.find({},function(err,results){
   if(results.length===0){
     Item.insertMany(defaultItems,function(err){
       if (err){
         console.log(err);
       }else{
         console.log("successfully inserted");
       }
     });
     res.redirect("/");
   }else{
     res.render("list", {listTitle:"Today",newlistItems: results});
    }
});
});


app.post("/", function(req , res) {

  const itemsName= req.body.newItem;
  const listName=req.body.list;

  const item = new Item({
    name: itemsName
  });
  if(listName==="Today"){
    item.save();
    res.redirect("/");
  }else{
    List.findOne({name:listName},function(err,foundlist){
      foundlist.items.push(item);
      foundlist.save();
      res.redirect("/" + listName);
    });
  }


});

app.post("/delete",function(req,res){
  const checkedItem = req.body.checkbox;
  const listName=req.body.listName;

  if(listName==="Today"){
    Item.findByIdAndRemove(checkedItem,function(err){
      if(err){
        console.log(err);
      }else{
        console.log("deleted");
        res.redirect("/");
      }
    });
  }else{
    List.findOneAndUpdate({name:listName},{$pull:{items:{_id:checkedItem}}},function(err,foundList){
      if(!err){
        res.redirect("/" + listName);
      }
    });
  }

});

app.get("/delete",function(res,req){
  res.render("list");
})

app.get("/:todolist",function(req,res){
  const todolist=_.capitalize(req.params.todolist);

  List.findOne({name:todolist},function(err,foundlist){
    if(!err){
      if(!foundlist){
        //create anew listTitle
        const list=new List({
          name:todolist,
          items:defaultItems
        });

        list.save();
        res.redirect("/" + todolist)

      }else{
        res.render("list", {listTitle: foundlist.name,newlistItems: foundlist.items});

    }
  }
});
});
app.get("/about", function(req , res) {
  res.render("about");
});

let port = process.env.PORT;
if (port == null || port == "") {
  port = 3000;
}

app.listen(port, function(req , res) {
  console.log("server started successfully");
});
