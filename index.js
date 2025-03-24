const express = require("express") ; 
const path = require("path");
const mongoose = require("mongoose");
const app = express() ; 
const menu = require('./model/menu');
const PORT = 80 ;
const http = require('http');
const server = http.createServer(app);
const io = socketIo(server);

// const path = require("path");

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
app.use(express.json()); // Parses JSON data
app.use(express.urlencoded({ extended: true })); // Parses form data (x-www-form-urlencoded)


mongoose.connect("mongodb://localhost:27017/Golden_Drip_Cafe", {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log("MongoDB connected successfully!");
}).catch(err => {
  console.error("MongoDB connection error:", err);
});


const db = mongoose.connection;


app.set('view engine', 'ejs');
app.set("views" , path.resolve("./views")) ; 





db.once('open', () => {
  console.log('Connected to MongoDB');

  // Watch MongoDB changes
db.collection('yourCollectionName').watch().on('change', (change) => {
    console.log('Data changed:', change);
    io.emit('dbChange', change);
  });
});

io.on('connection', (socket) => {
  console.log('New client connected');
  
  socket.on('disconnect', () => {
    console.log('Client disconnected');
  });
});




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
  // const items = req.body;
  // const file = req.file; 
  // if (!file) {
  //   return res.status(400).send("No file uploaded.");
  // }
  console.log(items);
 
  try {
    if (!items.name || !items.description || !items.category || !items.price || !items.quantity || !items.image) {
      return res.status(400).send("All fields are required.");
    }
  
    const price = parseFloat(items.price);
    const quantity = parseFloat(items.quantity);
  
    if (isNaN(price) || isNaN(quantity) || price < 0 || quantity < 0) {
      return res.status(400).send("Price and quantity must be valid positive numbers.");
    }
  
    const newMenuItem = await menu.create({
      name: items.name,
      description: items.description,
      category: items.category,
      price,
      quantity,
      image: items.image,
    });
  
    res.status(201).redirect("/");
  } 
  catch (error) 
  {
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
  


  
server.listen(PORT, () => console.log(`Server started at ${PORT}`));