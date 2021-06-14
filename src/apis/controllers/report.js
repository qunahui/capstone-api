const auth = require("../../middlewares/auth");
const Error = require("../utils/error");
const request = require('request');
const rp = require('request-promise');
const {Order} = require("../models/order")

module.exports.getSalesReport = async (req, res) => {
    try {
        const store_id = req.query.store_id 
        const storageId = req.user.currentStorage.storageId
        const period = req.query.period
        const dateFrom = req.query.dateFrom
        const dateTo = req.query.dateTo
        let date1 =0, date2 =0, date3 =0, date4 = 0
        let completeOrders1 = 0, revenue1 = 0, avgRevenue1 = 0, salesProductNumber1 = 0, totalOrders1 = 0 //so don hoan thanh, doanh thu, doanh thu trung binh tren 1 don, so san pham ban duoc
        let completeOrders2 = 0, revenue2 = 0, avgRevenue2 = 0, salesProductNumber2 = 0, totalOrders2 = 0
        if(period == "last7days"){
            date1 = new Date().setHours(0,0,0,0) - 1000*60*60*24*7
            date2 = new Date().setHours(23,59,59,999) - 1000*60*60*24

            date3 = new Date().setHours(0,0,0,0) - 1000*60*60*24*15
            date4 = new Date().setHours(23,59,59,999) - 1000*60*60*24*8
        }else if(period == "last30days"){
            date1 = new Date().setHours(0,0,0,0) - 1000*60*60*24*30
            date2 = new Date().setHours(23,59,59,999) - 1000*60*60*24

            date3 = new Date().setHours(0,0,0,0) - 1000*60*60*24*60
            date4 = new Date().setHours(23,59,59,999) - 1000*60*60*24*31
        }else if(period ==  "week"){
            date1 = parseFloat(dateFrom) 
            date2 = parseFloat(dateTo) 

            date3 = dateFrom - 1000*60*60*24*7
            date4 = dateTo - 1000*60*60*24
        }else if(period ==  "month"){
            
            date1 = parseFloat(dateFrom)
            date2 = parseFloat(dateTo)
            
            date4 = dateFrom- 1000*60*60*24
            date3 = new Date(date4).setDate(1)
        }
        
        const list1 = await Order.find(
            {
                createdAt: {$gte: date1, $lte: date2},
                store_id: store_id,
                storageId: storageId
            },{ 
                _id: 0,
                totalAmount: 1, 
                totalQuantity: 1,
                orderStatus:1,
                createdAt:1
            }
        )
        if(list1.length != 0){
            list1.forEach(order => {
                if(order.orderStatus == "Đã hoàn tất"){
                    completeOrders1++
                    salesProductNumber1+=order.totalQuantity
                    revenue1+=order.totalAmount
                }
            });
        }
        const list2 = await Order.aggregate([{
            $match:{
                createdAt: {"$gte": date3, "$lte": date4},
                store_id: store_id,
                storageId: storageId
            }},{ 
            $project:{ 
                _id: 0,
                totalAmount: 1, 
                totalQuantity: 1,
                orderStatus:1,
                createdAt:1
            }}
        ])
        if(list2.length != 0){
            list2.forEach(order => {
                if(order.orderStatus == "Đã hoàn tất"){
                    completeOrders2++
                    salesProductNumber2+=order.totalQuantity
                    revenue2+=order.totalAmount
                }
            });
        }
        totalOrders1 = list1.length
        totalOrders2 = list2.length
        avgRevenue1 = completeOrders1 == 0 ? 0 : revenue1/completeOrders1
        avgRevenue2 = completeOrders2 == 0 ? 0 : revenue2/completeOrders2

        res.send({
            totalOrders:{
                value: totalOrders1,
                percent: totalOrders1 == totalOrders2 ? 0 : totalOrders2 == 0 ? 100 : Math.abs((totalOrders1/totalOrders2)-1)*100,
                status: (totalOrders1-totalOrders2) >0 ? "Greater" : (totalOrders1-totalOrders2) == 0 ? "Equal" : "Less",
            },
            completeOrders:{
                value: completeOrders1,
                percent: completeOrders1 == completeOrders2 ? 0 : completeOrders2 == 0 ? 100 : Math.abs((completeOrders1/completeOrders2)-1)*100,
                status: (completeOrders1-completeOrders2) >0 ? "Greater" : (completeOrders1-completeOrders2) == 0 ? "Equal" : "Less"
            },
            revenue:{
                value: revenue1,
                percent: revenue1 == revenue2 ? 0 : revenue2 == 0 ? 100 : Math.abs((revenue1/revenue2)-1)*100,
                status: (revenue1-revenue2) >0 ? "Greater" : (revenue1-revenue2) == 0 ? "Equal" : "Less"
            },
            avgRevenue:{
                value: avgRevenue1,
                percent: avgRevenue1 == avgRevenue2 ? 0 : avgRevenue2 == 0 ? 100 : Math.abs((avgRevenue1/avgRevenue2)-1)*100,
                status: (avgRevenue1-avgRevenue2) >0 ? "Greater" : (avgRevenue1-avgRevenue2) == 0 ? "Equal" : "Less"
            },
            salesProductNumber:{
                value: salesProductNumber1,
                percent: salesProductNumber1 == salesProductNumber2 ? 0 : salesProductNumber2 == 0 ? 100 : Math.abs((salesProductNumber1/salesProductNumber2)-1)*100,
                status: (salesProductNumber1-salesProductNumber2) >0 ? "Greater" : (salesProductNumber1-salesProductNumber2) == 0 ? "Equal" : "Less"
            },
            listOrder: list1
        })
    }catch(e){
        console.log(e.message)
    }
};
