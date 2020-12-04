const userRoutes = require("./routers/user");
const productRoutes = require("./routers/product");
// const productDetailRoutes = require("./routers/productDetail");
const productCategoryRoutes = require("./routers/productcategory");
const sendoRoutes = require("./routers/sendo");

module.exports = (app) => {
  app.use("/products", productRoutes);
  app.use("/product-categories", productCategoryRoutes);
  // app.use("/product-details", productDetailRoutes);
  app.use("/users", userRoutes);
  app.use("/api/sendo", sendoRoutes);
};
