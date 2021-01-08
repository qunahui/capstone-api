const userRoutes = require("./routers/user");
const productRoutes = require("./routers/product");
//const productDetailRoutes = require("./routers/productDetail");
//const productCategoryRoutes = require("./routers/productcategory");
const sendoRoutes = require("./routers/sendo");
const lazadaRoutes = require("./routers/lazada")
const lazadaCategoryRoutes =  require("./routers/lazadaCategory");
const orderRoutes = require("./routers/order");
const storageRoutes = require("./routers/storage")
module.exports = (app) => {
  app.use("/products", productRoutes);
  //app.use("/product-categories", productCategoryRoutes);
  //app.use("/product-details", productDetailRoutes);
  app.use("/users", userRoutes);
  app.use("/api/storage", storageRoutes);
  app.use("/api/sendo", sendoRoutes);
  
  app.use("/lazada-category", lazadaCategoryRoutes);
  app.use("/orders/", orderRoutes);
  app.use("/api/lazada", lazadaRoutes);
};