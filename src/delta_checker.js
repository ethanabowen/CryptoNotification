const coinbaseUtils = require('./utilities/coinbase_utils.js');
const snsUtils = require('./utilities/sns_utils.js');
const cryptoNotificationFactory = require('./factories/crypto_noficiation_factory.js')
const Constants = require('./utilities/constants.js');

/**
 * Entry function for Crypto Delta Notification process.
 * @param {JSON} event AWS metadata and information associated with Lambda invokation
 */
module.exports.handler = async (event) => {
  Constants.CURRENCY_PAIRS.forEach((currencyPair) => {
    var currentPrice, historicPrice;
    const currentPricePromise = coinbaseUtils.getCurrentPrice(currencyPair)
      .then(price => {
        currentPrice = parseFloat(price);
        console.debug(`${currencyPair} Current Price: ${currentPrice}`)
      });

    const historicPricePromise = 
      coinbaseUtils.getHistoricPrice(currencyPair, Constants.LOOK_BACK_IN_MINUTES)
      .then(price => {
        historicPrice = price;
        console.debug(`${currencyPair} Historic Price (${Constants.LOOK_BACK_IN_MINUTES} minutes back): ${historicPrice}`);
      });

    Promise.all([currentPricePromise, historicPricePromise]).then(() => {
      var priceDelta = (getCurrentPriceDelta(currentPrice, historicPrice) * 100).toFixed(2);
      if (shouldSendNotification(currentPrice, historicPrice, Constants.DELTA_THRESHOLD_PERCENTAGE)) {
        console.debug(`${currencyPair} Price Delta: ${priceDelta}%`)
        const message = cryptoNotificationFactory.buildMessage(currencyPair, priceDelta, currentPrice, historicPrice);
        const subject = cryptoNotificationFactory.buildSubject(currencyPair);

        snsUtils.sendDeltaNotification(subject, message, Constants.NOTIFICATION_TOPIC_ARN);
      } else {
        console.debug(`${currencyPair} Notification NOT Sent! Delta: ${priceDelta}%`)
      }
    })
  });
}

/**
 * Determines if a notification should be sent.
 * @param {float} currentPrice price of currency pair at the moment
 * @param {float} historicPrice price of currency pair in the past
 * @param {*} thresholdPercentage percentage of change allowed in price delta
 * @returns {Boolean} True if delta of prices is greater than threshold percentage
 */
function shouldSendNotification(currentPrice, historicPrice, thresholdPercentage) {
  var currentPriceDelta = getCurrentPriceDelta(currentPrice, historicPrice)
  return currentPriceDelta < 0 && Math.abs(currentPriceDelta) >= thresholdPercentage;
}

/**
 * Determines percent difference in prices.
 * @param {float} currentPrice price of currency pair at the moment
 * @param {float} historicPrice price of currency pair in the past
 * @returns {float} Difference in prices in percent format
 */
function getCurrentPriceDelta(currentPrice, historicPrice) {
  return currentPrice / historicPrice - 1;
}