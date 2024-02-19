const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  const stocks = ['GOOG', 'MSFT', 'AAPL', 'AMZN', 'FB'];

  stocks.forEach(stock => {
    test(`Viewing one stock: ${stock}`, function(done) {
      chai.request(server)
        .get(`/api/stock-prices?stock=${stock}`)
        .end(function(err, res) {
          if (err) {
            console.error(err);
            done(err);
          } else {
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData');
            assert.equal(res.body.stockData.stock, stock);
            assert.isNumber(res.body.stockData.price);
            assert.isNumber(res.body.stockData.likes);
            done();
          }
        });
    });

    test(`Viewing one stock and liking it: ${stock}`, function(done) {
      chai.request(server)
        .get(`/api/stock-prices?stock=${stock}&like=true`)
        .end(function(err, res) {
          if (err) {
            console.error(err);
            done(err);
          } else {  
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData');
            assert.equal(res.body.stockData.stock, stock);
            assert.isNumber(res.body.stockData.price);
            assert.isNumber(res.body.stockData.likes);
            done();
          }
        });
    });

    test(`Viewing the same stock and liking it again: ${stock}`, function(done) {
      chai.request(server)
        .get(`/api/stock-prices?stock=${stock}&like=true`)
        .end(function(err, res) {
          if (err) {
            console.error(err);
            done(err);
          } else {
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData');
            assert.equal(res.body.stockData.stock, stock);
            assert.isNumber(res.body.stockData.price);
            assert.isNumber(res.body.stockData.likes);
            done();
          }
        });
    });

    test(`Viewing two stocks: ${stock} and MSFT`, function(done) {
      chai.request(server)
        .get(`/api/stock-prices?stock1=${stock}&stock2=MSFT`)
        .end(function(err, res) {
          if (err) {
            console.error(err);
            done(err);
          } else {  
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData');
            assert.isArray(res.body.stockData);
            assert.equal(res.body.stockData[0].stock, stock);
            assert.equal(res.body.stockData[1].stock, 'MSFT');
            assert.isNumber(res.body.stockData[0].price);
            assert.isNumber(res.body.stockData[1].price);
            assert.isNumber(res.body.stockData[0].rel_likes);
            assert.isNumber(res.body.stockData[1].rel_likes);
            done();
          }
        }); 
    });

    test(`Viewing two stocks and liking them: ${stock} and MSFT`, function(done) {
      chai.request(server)
        .get(`/api/stock-prices?stock1=${stock}&stock2=MSFT&like=true`)
        .end(function(err, res) {
          if (err) {
            console.error(err);
            done(err);
          } else {  
            assert.equal(res.status, 200);
            assert.property(res.body, 'stockData');
            assert.isArray(res.body.stockData);
            assert.equal(res.body.stockData[0].stock, stock);
            assert.equal(res.body.stockData[1].stock, 'MSFT');
            assert.isNumber(res.body.stockData[0].price);
            assert.isNumber(res.body.stockData[1].price);
            assert.isNumber(res.body.stockData[0].rel_likes);
            assert.isNumber(res.body.stockData[1].rel_likes);
            done();
          }
        });
    });
  });
});
         