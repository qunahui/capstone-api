const userRoutes = require("./routers/user");
const productRoutes = require("./routers/product");
const categoryRoutes =  require("./routers/category");
//const productDetailRoutes = require("./routers/productDetail");
//const productCategoryRoutes = require("./routers/productcategory");
const sendoRoutes = require("./routers/sendo");
const lazadaRoutes = require("./routers/lazada")
const lazadaCategoryRoutes =  require("./routers/lazadaCategory");
const orderRoutes = require("./routers/order");
const storageRoutes = require("./routers/storage")
const lazadaProductRoutes = require('./routers/lazadaProduct')
const sendoProductRoutes = require('./routers/sendoProduct')
const addressRoutes = require('./routers/address')
module.exports = (app) => {
  app.use("/products", productRoutes);
  //app.use("/product-categories", productCategoryRoutes);
  //app.use("/product-details", productDetailRoutes);
  app.use("/users", userRoutes);
  app.use("/api/storage", storageRoutes);
  app.use("/api/sendo", sendoRoutes);
  app.use("/address", addressRoutes)
  app.use("/lazada-categories", lazadaCategoryRoutes);
  app.use("/categories", categoryRoutes);
  app.use("/orders/", orderRoutes);
  app.use("/api/lazada", lazadaRoutes);
  app.use("/lazada/", lazadaProductRoutes);
  app.use("/sendo/", sendoProductRoutes);
};