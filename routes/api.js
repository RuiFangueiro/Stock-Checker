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

async function seedStockData() {
  const stocks = ['GOOG', 'MSFT', 'AAPL', 'AMZN', 'META'];

  try {
    for (const stock of stocks) {
      // Make request to external API to get stock data
      const response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
      const { data } = response;

      // Create document for the stock and save it to MongoDB
      const newStock = new Stock({
        symbol: stock,
        price: data.latestPrice,
        likes: 0,
        ips: []
      });
      await newStock.save();
      console.log(`Stock data for ${stock} saved to MongoDB`);
    }
    console.log('Stock data seeding completed');
  } catch (error) {
    console.error('Error seeding stock data:', error);
  }
}

seedStockData();

async function getStockPrice(stocks, like, ip, callback) {
  try {
    const stockData = await Promise.all(stocks.map(async (stock) => {
      let likes = 0;
      const existingStock = await Stock.findOne({ symbol: stock });
      if (existingStock) {
        likes = existingStock.likes;
        if (like && existingStock.ips.indexOf(ip) === -1) {
          existingStock.ips.push(ip);
          existingStock.likes += 1;
          await existingStock.save();
        }
      } else if (like) {
        const newStock = new Stock({
          symbol: stock,
          ips: [ip],
          likes: 1
        });
        await newStock.save();
        likes = 1;
      } 

      try {
        const response = await axios.get(`https://stock-price-checker-proxy.freecodecamp.rocks/v1/stock/${stock}/quote`);
        console.log('Response for', stock, ':', response.data);
        const price = response.data.latestPrice;
        console.log('Stock:', stock, 'Price:', price, 'Likes:', likes);
        return {"stockData": {"stock": stock, "price": price, "likes": likes}};
      } catch (error) {
        return {"error" : "invalid symbol", "likes" : likes};
      }
    }));

    if (stockData.length === 2) {
      const rel_likes = stockData[0].stockData.likes - stockData[1].stockData.likes;
      stockData[0].stockData.rel_likes = rel_likes;
      stockData[1].stockData.rel_likes = -rel_likes;
      delete stockData[0].stockData.likes;
      delete stockData[1].stockData.likes;
    }

    const sortedStockData = stockData.sort((a, b) => a.stockData.stock.localeCompare(b.stockData.stock));

    const innerStockData = sortedStockData.map(data => data.stockData);

    const response = { stockData: innerStockData };
    
    callback(null, response);
  } catch (error) {
    callback(error, null);
  }
}

getStockPrice(['GOOG'], false, '127.0.0.1', (err, data) => {
  if (err) {
    console.error('Error fetching stock data:', err);
  } else {
    console.log('Stock data:', data);
  }
});


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
              res.json({"StockData" : {"error" : "invalid symbol", "likes" : 0}});
            } else {
              res.json(stocks.length === 1 ? data.stockData[0] : data);
          }
        });
      });
  }
};