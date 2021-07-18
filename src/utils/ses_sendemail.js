var AWS = require('aws-sdk');
// Set the region 
AWS.config.update({region: 'ap-southeast-1'});

// Create sendEmail params 
const sendMail = async (data) => {
    var params = {
        Source: 'quanhui812@gmail.com', /* required */
        Destination: { /* required */
            ToAddresses: [
                data.email,
            /* more items */
            ]
        },
        Message: { /* required */
            Body: { /* required */
            // Html: {
            //     Charset: "UTF-8",
            //     Data: "Đặt lại mật khẩu"
            // },
            Text: {
                Charset: "UTF-8",
                Data: `Đường dẫn đặt lại mật khẩu: ${process.env.FRONTEND_URL}/change-password?token=${data.token}`
            }
            },
            Subject: {
                Charset: 'UTF-8',
                Data: 'Đặt lại mật khẩu'
            }
            },
    };
    
    // Create the promise and SES service object
    var sendPromise = new AWS.SES({apiVersion: '2010-12-01'}).sendEmail(params).promise();
    
    // Handle promise's fulfilled/rejected states
    sendPromise.then(
      function(data) {
        console.log(data.MessageId);
      }).catch(
        function(err) {
        console.error(err, err.stack);
      });
}

module.exports = sendMail