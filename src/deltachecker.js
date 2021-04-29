const coinbaseUtils = require('./utilities/coinbase_utils.js');
const snsUtils = require('./utilities/sns_utils.js');
const Constants = require('./utilities/constants.js');

module.exports.handler = async (event) => {
  var currentPrice, historicPrice;
  const currentPricePromise = coinbaseUtils.getCurrentPrice(Constants.MATIC_USD_CURRENCY_PAIR)
    .then(price => {
      currentPrice = price;
      console.log(`Current Price: ${currentPrice}`)
    });

  const historicPricePromise = 
    coinbaseUtils.getHistoricPrice(Constants.MATIC_USD_CURRENCY_PAIR, Constants.LOOK_BACK_IN_MINUTES)
    .then(price => {
      historicPrice = price;
      console.log(`Historic Price (${Constants.LOOK_BACK_IN_MINUTES} minutes back): ${historicPrice}`);
    });

  Promise.all([currentPricePromise, historicPricePromise]).then(() => {
    console.debug("\n\n\n\n\n")

    var currentPriceDelta = (getCurrentPriceDelta(currentPrice, historicPrice) * 100).toFixed(2)
    if (shouldSendNotification(currentPrice, historicPrice, Constants.DELTA_THRESHOLD_PERCENTAGE)) {
      console.log("Notification Sent!")
      snsUtils.sendNotification(Constants.MATIC_USD_CURRENCY_PAIR, Constants.DELTA_THRESHOLD_PERCENTAGE, currentPriceDelta, currentPrice, historicPrice)
      console.log(`${Constants.MATIC_USD_CURRENCY_PAIR} delta >= ${Constants.DELTA_THRESHOLD_PERCENTAGE}%!\n\nDelta: ${currentPriceDelta}%\nCurrent Price: ${currentPrice}\nHistoric Price: ${historicPrice}`)
    } else {
      console.log(`Notification NOT Sent!\n\nDelta: ${currentPriceDelta}%`)
    }
  })
}

/**
 * True if delta of prices is greater than threshold percentage
 */
function shouldSendNotification(currentPrice, historicPrice, thresholdPercentage) {
  var currentPriceDelta = getCurrentPriceDelta(currentPrice, historicPrice)

  console.debug("PriceDelta", currentPriceDelta)
  console.debug("ThresholdPercentage", thresholdPercentage / 100)

  return currentPriceDelta >= thresholdPercentage / 100;
}

function getCurrentPriceDelta(currentPrice, historicPrice) {
  return Math.abs(1 - (currentPrice / historicPrice)).toFixed(3);
}