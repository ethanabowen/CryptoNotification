class Constants {
  static CURRENCY_PAIRS = [
    'MATIC-USD',
    'ETH-USD'
  ]
  static LOOK_BACK_IN_MINUTES = 30;
  static DELTA_THRESHOLD_PERCENTAGE = 2.0;

  static AWS_REGION = process.env.REGION || 'us-east-1';
  static NOTIFICATION_TOPIC_ARN = process.env.NOTIFICATION_TOPIC_ARN || 'arn:aws:sns:us-east-1:859700905691:CrpytoNotificationTopic';
}

module.exports = Constants