const Error = require('../utils/error');
const { SupplierRefundOrder, PurchaseOrder } = require('../models/order');
const Inventory = require('../models/inventory');
const Variant = require('../models/variant');

const step = [
  {
    name: 'Đặt hàng và duyệt',
    isCreated: false,
  },
  {
    name: 'Xuất kho',
    isCreated: false,
  },
  {
    name: 'Hoàn thành',
    isCreated: false,
  },
  {
    name: 'Đã hủy',
    isCreated: false,
  },
];

const checkComplete = async (_id) => {
  try {
    const supplierRefundOrder = await SupplierRefundOrder.findOne({ _id });
    const { paymentStatus, outstockStatus } = supplierRefundOrder;
    if (paymentStatus === 'Đã thanh toán' && outstockStatus === true) {
      supplierRefundOrder.step[2] = {
        name: supplierRefundOrder.step[2].name,
        isCreated: true,
        createdAt: new Date(),
      };
      supplierRefundOrder.orderStatus = 'Hoàn thành';

      await supplierRefundOrder.save();
    }
  } catch (e) {
    console.log(e.message);
  }
};

module.exports.checkComplete = checkComplete;

module.exports.createReceipt = async (req, res) => {
  try {
    const { lineItems } = req.body;

    const supplierRefundOrder = await SupplierRefundOrder.findOne({
      _id: req.params._id,
    });

    if (!supplierRefundOrder.outstockStatus) {
      await Promise.all(
        lineItems.map(async (item) => {
          const variantId = item._id;
          const mongoVariant = await Variant.findOne({ _id: variantId });

          mongoVariant.inventories.onHand -= item.quantity;
          mongoVariant.inventories.trading -= item.quantity;

          await mongoVariant.save();

          const inventory = new Inventory({
            variantId,
            actionName: 'Hoàn trả cho nhà cung cấp',
            change: {
              amount: item.quantity,
              type: 'Giảm',
            },
            instock: mongoVariant.inventories.onHand,
            reference: supplierRefundOrder.code,
            price: item.price,
          });

          await inventory.save();

        })
        );
        const matchedPurchaseOrder = await PurchaseOrder.findOne({
          _id: supplierRefundOrder.reference.id,
        });
        matchedPurchaseOrder.step[3] = {
          name: matchedPurchaseOrder.step[3].name,
          isCreated: true,
          createdAt: new Date(),
        };

        matchedPurchaseOrder.orderStatus = 'Đã hoàn trả';

        await matchedPurchaseOrder.save();

      supplierRefundOrder.step[1] = {
        name: supplierRefundOrder.step[1].name,
        isCreated: true,
        createdAt: new Date(),
      };

      supplierRefundOrder.outstockStatus = true;
      supplierRefundOrder.orderStatus = 'Xuất kho';

      await supplierRefundOrder.save();
      await checkComplete(req.params._id);

      return res.status(200).send(supplierRefundOrder);
    } else {
      return res
        .status(400)
        .send(Error({ message: 'Đơn đã được xử lý trước đó !' }));
    }
  } catch (e) {
    console.log('create receipt error: ', e.message);
    return res
      .status(500)
      .send(Error({ message: 'Create refund order went wrong!' }));
  }
};

module.exports.createSupplierRefundOrder = async (req, res) => {
  try {
    step[0].isCreated = true;
    step[0].createdAt = Date.now();
    const supplierRefundOrder = new SupplierRefundOrder({ ...req.body, step });

    const { lineItems } = req.body;

    await Promise.all(
      lineItems.map(async (variant) => {
        const matchedVariant = await Variant.findOne({ _id: variant._id });
        matchedVariant.inventories.trading += variant.quantity;
        matchedVariant.save();
      })
    );

    await supplierRefundOrder.save();
    res.send(supplierRefundOrder);
  } catch (e) {
    res.status(500).send(Error('Create refund order went wrong!'));
  }
};

module.exports.getAllSupplierRefundOrder = async (req, res) => {
  try {
    const { orderStatus, dateFrom, dateTo, ...rest } = req.query;
    let searchFilter = {};
    // create regex to find anything contain string
    Object.keys(rest).some((i) => {
      if (req.query[i]) {
        searchFilter[i] = new RegExp(req.query[i]?.trim(), 'i');
      }
    });
    // create matched order search
    if (orderStatus !== 'Tất cả') {
      searchFilter.orderStatus = orderStatus;
    }

    console.log("Final filter: ", {
      storageId: req.user.currentStorage.storageId,
      ...searchFilter,
      createdAt: {
        $gte: dateFrom,
        $lt: dateTo,
      },
    })

    const supplierRefundOrders = await SupplierRefundOrder.find({
      storageId: req.user.currentStorage.storageId,
      ...searchFilter,
      createdAt: {
        $gte: dateFrom,
        $lt: dateTo,
      },
    });

    res.send(supplierRefundOrders);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.getSupplierRefundOrderById = async function (req, res) {
  try {
    const supplierRefundOrderId = req.params._id;
    const supplierRefundOrder = await SupplierRefundOrder.findOne({
      _id: supplierRefundOrderId,
    });
    if (!supplierRefundOrder) {
      return res.sendStatus(404);
    }
    res.status(200).send(supplierRefundOrder);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.updateRefundPayment = async (req, res) => {
  try {
    const supplierRefundOrder = await SupplierRefundOrder.findOne({
      _id: req.params._id,
      userId: req.user._id,
    });

    if (supplierRefundOrder.paidPrice !== supplierRefundOrder.totalPrice) {
      supplierRefundOrder.paidPrice += req.body.paidPrice;
      supplierRefundOrder.paidHistory.push({
        title: `Xác nhận thanh toán ${req.body.formattedPaidPrice}`,
        date: Date.now(),
      });
      if (supplierRefundOrder.paidPrice === supplierRefundOrder.totalPrice) {
        supplierRefundOrder.paymentStatus = 'Đã thanh toán';
      } else if (
        supplierRefundOrder.paidPrice >= 0 &&
        supplierRefundOrder.paidPrice < supplierRefundOrder.totalPrice
      ) {
        supplierRefundOrder.paymentStatus = 'Thanh toán một phần';
      }

      await supplierRefundOrder.save();
      await checkComplete(req.params._id);

      res.status(200).send(supplierRefundOrder);
    } else {
      return res
        .status(400)
        .send(Error({ message: 'Đơn đã được xử lý trước đó !' }));
    }
  } catch (e) {
    console.log(e.message);
    res
      .status(400)
      .send(Error({ message: 'update refund payment went wrong !!!' }));
  }
};

module.exports.cancelSupplierRefundOrder = async (req, res) => {
  try {
    const { _id } = req.params;

    const supplierRefundOrder = await SupplierRefundOrder.findOne({ _id });

    if (supplierRefundOrder.orderStatus !== 'Đã hủy') {
      supplierRefundOrder.orderStatus = 'Đã hủy';

      supplierRefundOrder.step[3] = {
        name: supplierRefundOrder.step[3].name,
        isCreated: true,
        createdAt: new Date(),
      };

      await supplierRefundOrder.save();

      res.status(200).send(supplierRefundOrder);
    } else {
      res
        .status(400)
        .send(Error({ message: 'Đơn này đã được xử lý trước đó !' }));
    }
  } catch (e) {
    res.status(400).send(Error({ message: 'Hủy đơn hàng thất bại!' }));
  }
};
