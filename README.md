# CryptoNotification
Cryptocurrencies change fast!  Knowing when the market is shifting rapidly  can help identify when to take action to avoid any loss of profits.  Traditionally, this is solved with stop-loss order, but most crypto exchanges do not offer these order types.  If they do, they probably have a cost associated with them.

The CryptoNotification service is a simple solution to that problem and at low costs!

---
## Deployment

Once deployed via serverless, this application will send an SMS when the price of any given currency pair (ex. USD-EUR, BTC-USD, MATIC-USD) changes over a pre-defined percentage and time.

Note: Phone numbers that wish to receive these notifications have to be manually assigned to the Amazon SNS Topic.  A future enhancement would include terraform to subscribe any numbers to the Amazon SNS Topic in a more programmatic way.

---
## Configuration 

Configuration variables are in constants.js.

**LOOK_BACK_IN_MINUTES** - Number of minutes to look back for the history price of a currency pair.

**DELTA_THRESHOLD_PERCENTAGE** - Percentage delta between the current and historic price of a currency pair that is allowed before notifiying via an Amazon SNS Topic.

**Amazon SNS Topic** - Please update your serverless to use your own Amazon SNS Topic.  A future update will remove the usage of explicit ARNs in the serverless file.