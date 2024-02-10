'use strict';

const helmet = require('helmet');

module.exports = function (app) {
  app.use(helmet({
    contentSecurityPolicy: {
      directives: {
        defaultSrc: ["'self'"],
        scriptSrc: ["'self'"],
        styleSrc: ["'self'"]
      }
    }
  }));

module.exports = function (app) {

  app.route('/api/stock-prices')
    .get(function (req, res){
      
    });
}
    
};
