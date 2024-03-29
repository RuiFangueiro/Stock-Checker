const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  const stocks = ['GOOG', 'MSFT', 'AAPL', 'AMZN', 'META'];

  stocks.forEach(stock => {
    test(`Viewing one stock: ${stock}`, function(done) {
      this.timeout(20000);
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
      this.timeout(20000);
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
      this.timeout(20000);
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
      this.timeout(20000);
      chai.request(server)
        .get(`/api/stock-prices?stock=${stock}&stock=MSFT`)
        .end(function(err, res) {
          if (err) {
            console.error(err);
            done(err);
          } else {  
            assert.equal(res.status, 200);
            assert.isArray(res.body.stockData);
            res.body.stockData.forEach(data => {
              assert.property(data, 'price');
              assert.property(data, 'rel_likes');
            if (data.price !== undefined) {
              assert.isNumber(data.price);
            }
            if (data.rel_likes !== undefined) {
              assert.isNumber(data.rel_likes);
            }
          });
            done();
          }
        }); 
    });

    test(`Viewing two stocks and liking them: ${stock} and MSFT`, function(done) {
      this.timeout(20000);
      chai.request(server)
        .get(`/api/stock-prices?stock=${stock}&stock=MSFT&like=true`)
        .end(function(err, res) {
          if (err) {
            console.error(err);
            done(err);
          } else {  
            assert.equal(res.status, 200);
            assert.isArray(res.body.stockData);
            res.body.stockData.forEach(data => {
              assert.property(data, 'price');
              assert.property(data, 'rel_likes');
            if (data.price !== undefined) {
              assert.isNumber(data.price);
            }
            if (data.rel_likes !== undefined) {
              assert.isNumber(data.rel_likes);
            }
          });
            done();
          }
        });
    });
  });
});
         