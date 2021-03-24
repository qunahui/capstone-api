const userRoutes = require("./routers/user");
const productRoutes = require("./routers/product");
const variantRoutes = require("./routers/variant");
const categoryRoutes =  require("./routers/category");
const sendoRoutes = require("./routers/sendo");
const lazadaRoutes = require("./routers/lazada")
const lazadaOrderRoutes = require("./routers/lazadaOrder");
const orderRoutes = require("./routers/order");
const storageRoutes = require("./routers/storage")
const lazadaProductRoutes = require('./routers/lazadaProduct')
const sendoProductRoutes = require('./routers/sendoProduct')
const addressRoutes = require('./routers/address')
const purchaseOrderRoutes = require('./routers/purchaseOrder')
const syncRoutes = require('./routers/sync')
const supplierRoutes = require('./routers/supplier')
const customerRoutes = require('./routers/customer')
const inventoryRoutes = require('./routers/inventory')

module.exports = (app) => {
  app.use("/products", productRoutes);
  app.use("/variants", variantRoutes)
  app.use("/users", userRoutes);
  app.use("/api/storage", storageRoutes);
  app.use("/api/sendo", sendoRoutes);
  app.use("/address", addressRoutes)
  app.use("/categories", categoryRoutes);
  app.use("/lazada-orders/", lazadaOrderRoutes);
  app.use("/orders/", orderRoutes);
  app.use("/api/lazada", lazadaRoutes);
  app.use("/lazada/", lazadaProductRoutes);
  app.use("/sendo/", sendoProductRoutes);
  app.use("/sync", syncRoutes);
  app.use("/purchase-orders", purchaseOrderRoutes);
  app.use("/supplier", supplierRoutes);
  app.use("/customer", customerRoutes);
  app.use("/inventory", inventoryRoutes);
};