const auth = require("../../middlewares/auth");
const Error = require("../utils/error");
const request = require('request');
const rp = require('request-promise');

module.exports.getSendoSalesReport = async (req, res) => {
    try {
        const period = req.query.period
        const dateRange = req.query.dateRange != undefined ? req.query.dateRange.split("|") : ["",""]
        let completeOrders1 = 0, revenue1 = 0, avgRevenue1 = 0, salesProductNumber1 = 0, totalOrders1 = 0 //so don hoan thanh, doanh thu, doanh thu trung binh tren 1 don, so san pham ban duoc
        let completeOrders2 = 0, revenue2 = 0, avgRevenue2 = 0, salesProductNumber2 = 0, totalOrders2 = 0
        if(period == "last7days"){
            date1 = new Date((new Date()).valueOf() - 1000*60*60*24*7).toISOString().split("T")[0]
            date2 = new Date((new Date()).valueOf() - 1000*60*60*24).toISOString().split("T")[0]

            date3 = new Date((new Date()).valueOf() - 1000*60*60*24*15).toISOString().split("T")[0]
            date4 = new Date((new Date()).valueOf() - 1000*60*60*24*8).toISOString().split("T")[0]
        }else if(period == "last30days"){
            date1 = new Date((new Date()).valueOf() - 1000*60*60*24*30).toISOString().split("T")[0]
            date2 = new Date((new Date()).valueOf() - 1000*60*60*24).toISOString().split("T")[0]

            date3 = new Date((new Date()).valueOf() - 1000*60*60*24*60).toISOString().split("T")[0]
            date4 = new Date((new Date()).valueOf() - 1000*60*60*24*31).toISOString().split("T")[0]
        }else if(period ==  "week"){
        
            date1 = dateRange[0] 
            date2 = dateRange[1] 

            date3 = new Date((new Date(date1)).valueOf()- 1000*60*60*24*7).toISOString().split("T")[0]
            date4 = new Date((new Date(date1)).valueOf()- 1000*60*60*24).toISOString().split("T")[0]
        }else if(period ==  "month"){
            
            date1 = dateRange[0]
            date2 = dateRange[1]
            
            date4 = new Date((new Date(date1)).valueOf()- 1000*60*60*24).toISOString().split("T")[0]
            date3 = date4.split("-")
            date3.pop()
            date3 = date3.concat(["01"]).join("-")
        }
        const searchOrders1 = await rp({
            method: 'POST',
            url: `http://localhost:5000/api/sendo/orders`,
            body: {
                order_date_from: date1,
                order_date_to: date2
            },
            json: true,
            headers:{ 
                "Authorization": 'Bearer ' + req.mongoToken,
                "Platform-Token": req.accessToken
            }
        })

        const searchOrders2 = await rp({
            method: 'POST',
            url: `http://localhost:5000/api/sendo/orders`,
            body: {
                order_date_from: date3,
                order_date_to: date4
            },
            json: true,
            headers:{ 
                "Authorization": 'Bearer ' + req.mongoToken,
                "Platform-Token": req.accessToken
            }
        })
        
        if(searchOrders1.result.toatal_records != 0)
        {
            searchOrders1.result.data.forEach(order => {
                if(order.sales_order.order_status == 8){
                    completeOrders1++
                    revenue1+=order.sales_order.total_amount
                    order.sku_details.forEach(product => {
                        salesProductNumber1+=product.quantity
                    });
                }
            });
        }
        if(searchOrders2.result.toatal_records != 0)
        {
            searchOrders2.result.data.forEach(order => {
                if(order.sales_order.order_status == 8){
                    completeOrders++
                    revenue+=order.sales_order.total_amount
                    order.sku_details.forEach(product => {
                        salesProductNumber+=product.quantity
                    });
                }
            });
        }

        totalOrders1 = searchOrders1.result.total_records
        totalOrders2 = searchOrders2.result.total_records
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
        })
        
        

    }catch(e){
        console.log(e.message)
    }
};

