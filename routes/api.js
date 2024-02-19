'use strict';

const mongoose = require('mongoose');
const axios = require('axios');
const crypto = require('crypto');

const stockSchema = new mongoose.Schema({
  symbol: { type: String, required: true },
  likes: { type: Number, default: 0 },
  ips: { type: [String], default: [] }
});

const Stock = mongoose.model('Stock', stockSchema);

function anonymize(ip) {
  const hash = crypto.createHash('sha256');
  hash.update(ip);
  return hash.digest('hex').substring(0, 7);
}

async function getStockPrice(stocks, like, ip, callback) {
  try {
    const stockData = await Promise.all(stocks.map(async (stock) => {
      const response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
      const price = response.data.latestPrice;
      let likes = like ? 1 : 0;
      if (like) {
        const existingStock = await Stock.findOne({ symbol: stock });
        if (existingStock) {
          const existingIpIndex = existingStock.ips.indexOf(ip);
          if (existingIpIndex === -1) {
            existingStock.ips.push(ip);
            existingStock.likes += 1;
            await existingStock.save();
          }
        } else {
          const newStock = new Stock({
            symbol: stock,
            ips: [ip],
            likes: 1
          });
          await newStock.save();
        }
      }
      return {stock, price, likes};
    }));
    callback(null, stockData);
  } catch (error) {
    callback(error, null);
  }
}

module.exports = {
  Stock: Stock,
  setupRoutes: function(app) {
    app.route('/api/stock-prices')
       .get(function (req, res) {
          let stocks = req.query.stock;
          if (!Array.isArray(stocks)) {
            stocks = [stocks];
          }
          const like = req.query.like;
          const ip = anonymize(req.ip);
          getStockPrice(stocks, like, ip, (err, data) => {
            if (err) {
              res.json({error: 'Stock not found'});
            } else {
              res.json({stockData: data});
          }
        });
      });
  }
};