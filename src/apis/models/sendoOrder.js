const { Double } = require("mongodb");
const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const validator = require("validator");

const schema = new Schema({
 id:{
    type: Number
 },
 order_number:{
    type: String
 },
 sendo_store_id:{
    type: Number
 },
 sales_order_merges:{
   type: String
 },
 is_shop_voucher:{
   type: Boolean
 },
 is_merge:{
   type:Boolean
 },
 mobile_discount_amount:{
   type: Double
 },
 is_self_shipping:{
   type: Boolean,
 },
 bank_name:{
   type: String
 },
 bank_code:{
   type: String
 },
 installment_bank_fee:{
   type: Double
 },
 is_installment:{
   type: Boolean
 },
 payment_period:{
   type: String
 },
 installment_fee:{
   type: Double
 }
});

module.exports = mongoose.model("sendoOrder", schema);
