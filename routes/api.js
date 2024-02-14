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

async function getStockPrice(stock, like, ip, callback) {
  try {
    const response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
    const price = response.data.latestPrice;
    const stockData = {
      stock: stock,
      price: price,
      likes: like ? 1 : 0
    };
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
          const stock = req.query.stock;
          const like = req.query.like;
          const ip = anonymize(req.ip);
        getStockPrice(stock, like, ip, (err, data) => {
          if (err) {
            res.json({error: 'Stock not found'});
          } else {
            res.json({data: {stock: stock, price: data.price, likes: data.likes}});
          }
        });
      });
  }
};