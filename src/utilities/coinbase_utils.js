const CoinbasePro = require('coinbase-pro');
const cbProClient = new CoinbasePro.PublicClient();

function getCurrentPrice(currencyPair) {
  const promise = new Promise(function (resolve, reject) {
    cbProClient.getProductTicker(currencyPair, (error, res, data) => {
      resolve(data.price)
    })
  })

  return promise;
}

/**
 * Get current CoinBase epoch time in seconds
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
            var parsedResponse = JSON.parse(res.body)
            var earliestRateArray = parsedResponse[lookBackInMinutes - 1];
            var earliestCloseRate = earliestRateArray[4];
            resolve(earliestCloseRate)
          });
      });
  });

  return promise;
}

module.export = {
  getCurrentPrice: getCurrentPrice,
  getHistoricPrice: getHistoricPrice
}