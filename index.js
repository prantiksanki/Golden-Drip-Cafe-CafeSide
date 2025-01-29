const express = require("express") ; 
const path = require("path");
const mongoose = require("mongoose");
const app = express() ; 
const menu = require('./model/menu');
const PORT = 80 ;
const path = require("path");

// const storage = multer.diskStorage({
//     destination: (req, file, cb) => {
//       cb(null, "./Static/uploads");
//     },
//     filename: (req, file, cb) => {
//       cb(null, Date.now() + "-" + file.originalname); 
//     },
//   });

//   app.use(express.static(path.resolve("./Static/"))) ;    

  
//   const upload = multer({ storage });

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

mongoose.connect("mongodb://localhost:27017/Golden_Drip_Cafe")
app.set('view engine', 'ejs');
app.set("views" , path.resolve("./views")) ; 




app.get('/' , async function(req, res)
{
    const menuItems = await menu.find({});
    // console.log(menuItems);
    res.render("home", { menuItems })  ;
})


app.get("/add-menu" , (req, res) =>
{
    res.render("addMenu")  ;
})  

  
app.post("/add-menu", async (req, res) => {
  const items = req.body;
  // const file = req.file; 
  // if (!file) {
  //   return res.status(400).send("No file uploaded.");
  // }
 
  console.log(items)

  try {
    const newMenuItem = await menu.create({
      name: items.name,
      description: items.description,
      category: items.category,
      price: parseFloat(items.price), 
      quantity: parseFloat(items.quantity), 
      image: items.image,
    });

    res.status(201).redirect("/")
  } catch (error) {
    console.error(error);
    res.status(500).send("Error saving menu item.");
  }
});


  app.post("/removeMenu", async (req, res) => {
    const { itemId } = req.body;
  
    try {
      await menu.findByIdAndDelete(itemId);
      console.log(`Item ${itemId} deleted`);
      res.status(200).json({ message: "Item successfully deleted" });
    } catch (error) {
      console.error("Error deleting item:", error);
      res.status(500).json({ message: "Failed to delete item" });
    }
  });
  


  
app.listen(PORT, () => console.log(`Server started at ${PORT}`));