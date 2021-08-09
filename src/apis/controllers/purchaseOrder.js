const Error = require('../utils/error');
const { PurchaseOrder } = require('../models/order');
const Inventory = require('../models/inventory');
const Variant = require('../models/variant');
const rp = require('request-promise');

const step = [
  {
    name: 'Đặt hàng và duyệt',
    isCreated: false,
  },
  {
    name: 'Nhập kho',
    isCreated: false,
  },
  {
    name: 'Hoàn thành',
    isCreated: false,
  },
  {
    name: 'Đã hoàn trả',
    isCreated: false,
  },
  {
    name: 'Đã hủy',
    isCreated: false,
  },
];

const checkComplete = async (_id) => {
  try {
    const purchaseOrder = await PurchaseOrder.findOne({ _id });
    const { paymentStatus, instockStatus } = purchaseOrder;
    if (paymentStatus === 'Đã thanh toán' && instockStatus === true) {
      purchaseOrder.step[2] = {
        name: purchaseOrder.step[2].name,
        isCreated: true,
        createdAt: new Date(),
      };
      purchaseOrder.orderStatus = 'Hoàn thành';

      await purchaseOrder.save();
    }
  } catch (e) {
    console.log(e.message);
  }
};

module.exports.checkComplete = checkComplete;

module.exports.createReceipt = async (req, res) => {
  try {
    const { lineItems, init } = req.body;

    const purchaseOrder = await PurchaseOrder.findOne({ _id: req.params._id });

    await Promise.all(
      lineItems.map(async (item) => {
        const variantId = item._id;
        const mongoVariant = await Variant.findOne({ _id: variantId });

        if (!init) {
          mongoVariant.inventories.onHand += item.quantity;
          mongoVariant.inventories.incoming -= item.quantity;
        }

        await rp({
          method: 'POST',
          url: `${process.env.API_URL}/variants/push-api`,
          json: true,
          body: {
            variant: mongoVariant
          },
          headers: {
            Authorization: 'Bearer ' + req.mongoToken,
          },
        });

        await mongoVariant.save();

        const inventory = new Inventory({
          variantId,
          actionName: 'Nhập hàng vào kho',
          change: {
            amount: item.quantity,
            type: 'Tăng',
          },
          instock: mongoVariant.inventories.onHand,
          reference: purchaseOrder.code,
          price: item.price,
        });

        await inventory.save();
      })
    );

    purchaseOrder.step[1] = {
      name: purchaseOrder.step[1].name,
      isCreated: true,
      createdAt: new Date(),
    };

    purchaseOrder.instockStatus = true;
    purchaseOrder.orderStatus = 'Nhập kho';

    await purchaseOrder.save();
    await checkComplete(req.params._id);

    return res.status(200).send(purchaseOrder);
  } catch (e) {
    console.log('create receipt error: ', e.message);
    return res
      .status(500)
      .send(Error({ message: 'Create purchase order went wrong!' }));
  }
};

module.exports.createInitialPurchaseOrder = async (req, res) => {
  try {
    step[0].isCreated = true;
    step[0].createdAt = Date.now();
    step[1].isCreated = true;
    step[1].createdAt = Date.now();
    step[2].isCreated = true;
    step[2].createdAt = Date.now();

    const purchaseOrder = new PurchaseOrder({
      ...req.body,
      orderStatus: 'Hoàn thành',
      storageId: req.user.currentStorage.storageId,
      userId: req.user._id,
      step,
    });

    await purchaseOrder.save();

    await rp({
      method: 'POST',
      url:
        `${process.env.API_URL}/purchase-orders/receipt/` + purchaseOrder._id,
      json: true,
      body: {
        ...req.body,
      },
      headers: {
        Authorization: 'Bearer ' + req.mongoToken,
      },
    });

    res.status(200).send(purchaseOrder);
  } catch (e) {
    console.log(e);
    res.status(500).send(Error('Create purchase order went wrong!'));
  }
};

module.exports.createPurchaseOrder = async (req, res) => {
  try {
    step[0].isCreated = true;
    step[0].createdAt = Date.now();
    const { lineItems } = req.body;

    await Promise.all(
      lineItems.map(async (variant) => {
        const matchedVariant = await Variant.findOne({ _id: variant._id });
        matchedVariant.inventories.incoming += variant.quantity;
        matchedVariant.save();
      })
    );

    const purchaseOrder = new PurchaseOrder({
      ...req.body,
      storageId: req.user.currentStorage.storageId,
      orderStatus: 'Đặt hàng và duyệt',
      step,
      userId: req.user._id,
    });
    await purchaseOrder.save();
    res.send(purchaseOrder);
  } catch (e) {
    console.log(e.message);
    res
      .status(500)
      .send(Error({ message: 'Create purchase order went wrong!' }));
  }
};

module.exports.getAllPurchaseOrder = async (req, res) => {
  try {
    const { orderStatus, dateFrom, dateTo, ...rest } = req.query;
    let searchFilter = {};
    
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

    const purchaseOrders = await PurchaseOrder.find({
      storageId: req.user.currentStorage.storageId,
      ...searchFilter,
      createdAt: {
        $gte: dateFrom,
        $lt: dateTo,
      },
    });

    res.send(purchaseOrders);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.getPurchaseOrderById = async function (req, res) {
  try {
    const purchaseOrderId = req.params._id;
    const purchaseOrder = await PurchaseOrder.find({ _id: purchaseOrderId });
    res.send(purchaseOrder);
  } catch (e) {
    res.status(500).send(Error(e));
  }
};

module.exports.updatePurchasePayment = async (req, res) => {
  try {
    const purchaseOrder = await PurchaseOrder.findOne({
      _id: req.params._id,
      userId: req.user._id,
    });

    purchaseOrder.paidPrice += req.body.paidPrice;
    purchaseOrder.paidHistory.push({
      title: `Xác nhận thanh toán ${req.body.formattedPaidPrice}`,
      date: Date.now(),
    });
    if (purchaseOrder.paidPrice === purchaseOrder.totalPrice) {
      purchaseOrder.paymentStatus = 'Đã thanh toán';
    } else if (
      purchaseOrder.paidPrice >= 0 &&
      purchaseOrder.paidPrice < purchaseOrder.totalPrice
    ) {
      purchaseOrder.paymentStatus = 'Thanh toán một phần';
    }

    await purchaseOrder.save();
    await checkComplete(req.params._id);

    res.status(200).send(purchaseOrder);
  } catch (e) {
    console.log(e.message);
    res
      .status(400)
      .send(Error({ message: 'update purchase payment went wrong !!!' }));
  }
};

module.exports.cancelPurchaseOrder = async (req, res) => {
  try {
    const { _id } = req.params;

    const purchaseOrder = await PurchaseOrder.findOne({ _id });

    purchaseOrder.orderStatus = 'Đã hủy';

    purchaseOrder.step[4] = {
      name: purchaseOrder.step[4].name,
      isCreated: true,
      createdAt: new Date(),
    };
    // hủy các số lượng hàng đang về thuộc đơn nhập này nếu chưa nhập kho
    if (!purchaseOrder.step[1].isCreated) {
      await Promise.all(
        purchaseOrder?.lineItems?.map(async (item) => {
          const variantId = item._id;
          const mongoVariant = await Variant.findOne({ _id: variantId });
          mongoVariant.inventories.incoming -= item.quantity;
          await mongoVariant.save();
        })
      );
    }
    //
    await purchaseOrder.save();

    res.status(200).send(purchaseOrder);
  } catch (e) {
    res.status(400).send(Error({ message: 'Hủy đơn hàng thất bại!' }));
  }
};
