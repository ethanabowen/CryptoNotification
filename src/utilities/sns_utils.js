
const Constants = require('./constants');

const AWS = require('aws-sdk');
AWS.config.update({ region: Constants.AWS_REGION });
const SNS = new AWS.SNS();

/**
 * Send publish notification to Amazon SNS Topic.
 * @param {String} currencyPair ex. 'MATIC-USD'
 * @param {String} subject title of message, might not be seen on all devices
 * @param {String} message text blob of general information to share
 * @param {String} topicArn Destination Topic ARN of message
 */
module.exports.sendDeltaNotification = function (currencyPair, subject, message, topicArn) {
  var publishNotificationPromise = SNS.publish({
    Subject: subject,
    Message: message,
    TopicArn: topicArn
  }).promise();

  publishNotificationPromise.then(
    function (data) {
      console.log(`${currencyPair} Notification sent! Message Id: ${data.MessageId}`);
    }).catch(
      function (err) {
        console.error(err, err.stack);
      });
}