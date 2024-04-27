const express = require('express');

const authenticationMiddleware = require('../../middlewares/authentication-middleware');
const celebrate = require('../../../core/celebrate-wrappers');
const marketController=require('./market-controller')
const marketValidator=require('./market-validator')
//authenthication is kept here so that only people who are authorized are able to tamper with the database


const route = express.Router();

module.exports = (app) => {
  app.use('/marketplace', route);

  // Get list of products
  route.get('/', authenticationMiddleware,celebrate(marketValidator.getProducts),marketController.getProducts);

  // Create product
  route.post(
    '/',
    authenticationMiddleware,
    celebrate(marketValidator.createProduct),
    marketController.createProduct
  );

  // Get product detail
  route.get('/:id', authenticationMiddleware, marketController.getProduct);

  // Update product
  route.put(
    '/:id',
    authenticationMiddleware,
    celebrate(marketValidator.updateProduct),
    marketController.updateProduct,
  );

  // Delete product
  route.delete('/:id', authenticationMiddleware, marketController.deleteProduct);

  //buy a product
  route.patch('/buy/:id',
  authenticationMiddleware,
  celebrate(marketValidator.buyProduct),
  marketController.buyProduct);

  // restock a product
  route.patch('/restock/:id',
  authenticationMiddleware,
  celebrate(marketValidator.restock),
  marketController.restock)
};
