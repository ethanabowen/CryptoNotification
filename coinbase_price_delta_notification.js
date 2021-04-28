const http = require('http');

const hostname = '127.0.0.1';
const port = 3000;

/*var Client = require('coinbase').Client;
var client = new Client({'apiKey': 'FAKE_KEY',
                         'apiSecret': 'FAKE_SECRET_KEY',
                         'strictSSL': false});
client.getSpotPrice(
  {
    'currencyPair': 'MATIC-USD',
    'date': '2021-04-23T01:02:51Z'
  }, 
  function(err, price) {
  console.log(price.data.amount);
});*/

const CoinbasePro = require('coinbase-pro');
const cbProClient = new CoinbasePro.PublicClient();

const MATIC_USD_CURRENCY_PAIR = 'MATIC-USD';
const LOOK_BACK_IN_MINUTES = 30;
const DELTA_THRESHOLD_PERCENTAGE = 5;

const server = http.createServer((req, res) => {

});

server.listen(port, hostname, () => {
  var currentPrice, historicPrice;
  const currentPricePromise = getCurrentPrice(MATIC_USD_CURRENCY_PAIR)
    .then(price => {
      currentPrice = price;
      console.log(`Current Price: ${currentPrice}`)
    });

  const historicPricePromise = getHistoricPrice(MATIC_USD_CURRENCY_PAIR, LOOK_BACK_IN_MINUTES)
    .then(price => {
      historicPrice = price;
      console.log(`Historic Price (${LOOK_BACK_IN_MINUTES} minutes back): ${historicPrice}`);
    });

  Promise.all([currentPricePromise, historicPricePromise]).then(() => {
    console.debug("\n\n\n\n\n")

    var priceDelta = (getPriceDelta(currentPrice, historicPrice) * 100).toFixed(2)
    if (shouldSendNotification(currentPrice, historicPrice, DELTA_THRESHOLD_PERCENTAGE)) {
      console.log("Notification Sent!")
      console.log(`${MATIC_USD_CURRENCY_PAIR} delta >= ${DELTA_THRESHOLD_PERCENTAGE}%!\n\nDelta: ${priceDelta}%\nCurrent Price: ${currentPrice}\nHistoric Price: ${historicPrice}`)
    } else {
      console.log(`Notification NOT Sent!\n\nDelta: ${priceDelta}%`)
    }
  })
});

/**
 * True if delta of prices is greater than threshold percentage
 */
function shouldSendNotification(currentPrice, historicPrice, thresholdPercentage) {
  var priceDelta = getPriceDelta(currentPrice, historicPrice)

  console.debug("PriceDelta", priceDelta)
  console.debug("ThresholdPercentage", thresholdPercentage / 100)

  return priceDelta >= thresholdPercentage / 100;
}

function getPriceDelta(currentPrice, historicPrice) {
  return Math.abs(1 - (currentPrice / historicPrice)).toFixed(3);
}

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