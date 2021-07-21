const userRoutes = require("./routers/user");
const employeeRoutes = require("./routers/employee");
const productRoutes = require("./routers/product");
const variantRoutes = require("./routers/variant");
const categoryRoutes =  require("./routers/category");
const sendoRoutes = require("./routers/sendo");
const lazadaRoutes = require("./routers/lazada")
const orderRoutes = require("./routers/order");
const storageRoutes = require("./routers/storage")
const lazadaProductRoutes = require('./routers/lazadaProduct')
const sendoProductRoutes = require('./routers/sendoProduct')
const addressRoutes = require('./routers/address')
const purchaseOrderRoutes = require('./routers/purchaseOrder')
const refundOrderRoutes = require('./routers/refundOrder')
const supplieRefundOrderRoutes = require('./routers/supplierRefundOrder')
const syncRoutes = require('./routers/sync')
const supplierRoutes = require('./routers/supplier')
const customerRoutes = require('./routers/customer')
const inventoryRoutes = require('./routers/inventory')
const lazadaAttributeRoutes = require('./routers/lazadaAttribute')
const brandRoutes = require('./routers/brand')
const reportRoutes = require('./routers/report')
const sendoCategoryRoutes = require('./routers/sendoCategory')

module.exports = (app) => {
  app.use("/products", productRoutes);
  app.use("/variants", variantRoutes)
  app.use("/users", userRoutes);
  app.use("/employees", employeeRoutes);
  app.use("/api/storage", storageRoutes);
  app.use("/api/sendo", sendoRoutes);
  app.use("/api/lazada", lazadaRoutes);
  app.use("/address", addressRoutes)
  app.use("/categories", categoryRoutes);
  app.use("/orders/", orderRoutes);
  app.use("/lazada/products", lazadaProductRoutes);
  app.use("/sendo/products", sendoProductRoutes);
  app.use("/sendo/categories", sendoCategoryRoutes);
  app.use("/sync", syncRoutes);
  app.use("/purchase-orders", purchaseOrderRoutes);
  app.use("/refund-orders", refundOrderRoutes);
  app.use("/supplier-refund-orders", supplieRefundOrderRoutes);
  app.use("/suppliers", supplierRoutes);
  app.use("/customers", customerRoutes);
  app.use("/inventory", inventoryRoutes);
  app.use("/lazada/attributes", lazadaAttributeRoutes);
  app.use("/brands", brandRoutes);
  app.use("/reports", reportRoutes);
};

// cron.schedule('*/10 * * * * *', () => {
//   console.log('running a task every 10 second');
// });