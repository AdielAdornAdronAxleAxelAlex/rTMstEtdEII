//used to create default product could be executed using npm 'run createDefaultProduct' in the terminal
const logger = require('../src/core/logger')('api');
const { Market } = require('../src/models');
const { hashPassword } = require('../src/utils/password');

const product_name='car';
const company_name='carmaker';
const country='countrycar';
const price='$1000';
const quantity=20;

logger.info('Creating default product');

(async () => {
  try {
    const productCount = await Market.countDocuments({
      product_name
    });

    if (productCount > 0) {
      throw new Error(`product ${product_name}} already exists`);
    }
    await Market.create({
      product_name,
      company_name,
      country,
      price,
      quantity,
    });
    logger.info('product successfully created')
  } catch (e) {
    logger.error(e);
  } finally {
    process.exit(0);
  }
})();