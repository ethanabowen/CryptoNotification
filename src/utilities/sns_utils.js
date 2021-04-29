const AWS = require('aws-sdk');
const SNS = new AWS.SNS();

module.exports.sendDeltaNotification = function(currencyPair, deltaThreshold, currentPriceDelta, currentPrice, historicPrice) {
  const message = `${currencyPair} delta >= ${deltaThreshold}%!\n\nDelta: ${currentPriceDelta}%\nCurrent Price: ${currentPrice}\nHistoric Price: ${historicPrice}`;
  
  var params = {
    Message: message,
    Subject: `Crypto Delta Notification for ${currencyPair}`
    //TopicArn: "arn:aws:sns:us-west-2:123456789012:test-topic1"
  };
  SNS.publish(params, context.done);
}