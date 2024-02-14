const chaiHttp = require('chai-http');
const chai = require('chai');
const assert = chai.assert;
const server = require('../server');

chai.use(chaiHttp);

suite('Functional Tests', function() {
  const stocks = ['GOOG', 'MSFT', 'AAPL', 'AMZN', 'FB''];

  stocks.forEach(stock => {
    test(`Viewing one stock: ${stock}`, function(done) {
      chai.request(server)
        .get(`/api/stock-prices?stock=${stock}`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
        done();
        });
    });

    test(`Viewing one stock and liking it: ${stock}`, function(done) {
      chai.request(server)
        .get(`/api/stock-prices?stock=${stock}&like=true`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
        done();
        });
    });

    test(`Viewing the same stock and liking it again: ${stock}`, function(done) {
      chai.request(server)
        .get(`/api/stock-prices?stock=${stock}&like=true`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
        done();
        });
    });

    test(`Viewing two stocks: ${stock} and MSFT`, function(done) {
      chai.request(server)
        .get(`/api/stock-prices?stock1=${stock}&stock2=MSFT`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
        done();
        }); 
    });

    test(`Viewing two stocks and liking them: ${stock} and MSFT`, function(done) {
      chai.request(server)
        .get(`/api/stock-prices?stock1=${stock}&stock2=MSFT&like=true`)
        .end(function(err, res) {
          assert.equal(res.status, 200);
        done();
        });
    });
  });
});
         