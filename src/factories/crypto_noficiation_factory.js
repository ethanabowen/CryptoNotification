/**
 * Build message portion of a Price Delta Notification
 * @param {String} currencyPair ex. 'MATIC-USD'
 * @param {float} currentPriceDelta difference in current and historical price
 * @param {float} currentPrice price of currency pair at the moment
 * @param {float} historicPrice price of currency pair in the past
 * @returns {String} Message for Price Delta Notification
 */
function buildMessage(currencyPair, currentPriceDelta, currentPrice, historicPrice) {
    return `Delta Alert:  ${currentPriceDelta}%` +
        `\nCurrency Pair: ${currencyPair}` +
        `\nHistoric Price: ${historicPrice.toFixed(4)}` +
        `\nCurrent Price: ${currentPrice.toFixed(4)}`;
}

/**
 * Build subject portion of a Price Delta Notification
 * @param {String} currencyPair ex. 'MATIC-USD'
 * @returns {String} Subject for Price Delta Notification
 */
function buildSubject(currencyPair) {
    return `Crypto Delta Notification for ${currencyPair}`
}

module.exports = {
    buildMessage: buildMessage,
    buildSubject: buildSubject
}