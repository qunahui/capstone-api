const userRoutes = require("./routers/user");
const productRoutes = require("./routers/product");
//const productDetailRoutes = require("./routers/productDetail");
//const productCategoryRoutes = require("./routers/productcategory");
const sendoRoutes = require("./routers/sendo");
//const addressRoutes = require("./routers/address");
const lazadaCategoryRoutes =  require("./routers/lazadaCategory");

module.exports = (app) => {
  app.use("/products", productRoutes);
  //app.use("/product-categories", productCategoryRoutes);
  //app.use("/product-details", productDetailRoutes);
  app.use("/users", userRoutes);
  app.use("/api/sendo", sendoRoutes);
  //app.use("/address", addressRoutes);
  app.use("/api/lazada-category", lazadaCategoryRoutes);
};