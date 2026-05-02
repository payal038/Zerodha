const { model } = require("mongoose");
const { OrdersSchema } = require("../schemas/OrderSchema");

const OrdersModel = model("order", OrdersSchema);
module.exports = { OrdersModel, OrderModel: OrdersModel };
