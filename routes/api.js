'use strict';

import helmet from 'helmet';

const express = require('express');
const helmet = require('helmet');

const app = express();

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
    
};
