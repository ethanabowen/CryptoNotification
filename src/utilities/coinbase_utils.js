const CoinbasePro = require('coinbase-pro');
const cbProClient = new CoinbasePro.PublicClient();

/**
 * Current price of currency pair.
 * @param {String} currencyPair ex. 'MATIC-USD'
 * @returns {float} Current CoinBase price of currencyPair
 */
function getCurrentPrice(currencyPair) {
  const promise = new Promise(function (resolve, reject) {
    cbProClient.getProductTicker(currencyPair, (error, res, data) => {
      if (data) {
        resolve(data.price)
      } else {
        reject(`No Price data found for ${currencyPair}.  Ensure it's a valid pairing!`);
      }
    })
  })

  return promise;
}

/**
 * Get CoinBase system time.
 * @returns {Number} Current CoinBase epoch time in seconds
 */
async function getStartTimeInEpoch() {
  const promise = new Promise(function (resolve, reject) {
    cbProClient.getTime((error, res, data) => {
      if (error) {
        reject(error)
      }

      resolve(Math.floor(data.epoch))
    });
  });

  return promise;
}

/**
 * Get a price of a currency pair in the past.
 * @param {String} currencyPair ex. 'MATIC-USD'
 * @param {Number} lookBackInMinutes Number of minutes to look back in time
 * @returns {float} Price of given currencyPair 'lookBackInMinutes' minutes ago (minus 1 due to Coinbase API inconsistencies)
 */
async function getHistoricPrice(currencyPair, lookBackInMinutes) {
  const promise = new Promise(function (resolve, reject) {
    var nowDate = new Date(0);
    var previousDate = new Date(0);
    getStartTimeInEpoch()
      .then(startTimeInEpoch => {
        nowDate.setUTCSeconds(startTimeInEpoch);
        nowDate = nowDate.toISOString();

        previousDate.setUTCSeconds(startTimeInEpoch - lookBackInMinutes * 60)
        previousDate = previousDate.toISOString();
      }).then(() => {
        cbProClient.getProductHistoricRates(currencyPair,
          {
            'start': previousDate,
            'end': nowDate,
            'granularity': 60
          }, (error, res) => {
            if (error) {
              reject(`No Historic Prices found for ${currencyPair}.  Ensure it's a valid pairing!`);
            } else {
              var parsedResponse = JSON.parse(res.body)
              //-2 because Coinbase API is inconsistent in returning LAST minute in response, must be a timing thing
              var earliestRateArray = parsedResponse[lookBackInMinutes - 2]; 
              var earliestCloseRate = earliestRateArray[4];
              resolve(earliestCloseRate)
            }
          });
      });
  });

  return promise;
}

module.exports = {
  getCurrentPrice: getCurrentPrice,
  getHistoricPrice: getHistoricPrice
}