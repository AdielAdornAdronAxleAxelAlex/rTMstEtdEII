const { Market } = require('../../../models');

/**
 * Get a list of products
 * @returns {Promise}
 */
async function getProducts() {
  return Market.find({});
}

/**
 * Get product detail
 * @param {string} id - product ID
 * @returns {Promise}
 */
async function getProduct(id) {
    return Market.findById(id);
}

/**
 * Create new product
 * @param {string} product_name - product name
 * @param {string} company_name - company name
 * @param {string} country - country
 * @param {number} price - price
 * @param {number} quantity - quantity
 * @returns {Promise}
 */
async function createProduct(product_name,company_name,country,price,quantity) {
  price="$"+price;
  return Market.create({
    product_name,
    company_name,
    country,
    price,
    quantity,
  });
}

/**
 * Update existing product
 * @param {string} id - product id
 * @param {string} product_name - product name
 * @param {string} company_name - company name
 * @param {string} country - country
 * @param {number} price - price
 * @param {number} quantity - quantity
 * @returns {Promise}
 */
async function updateProduct(id,product_name,company_name,country,price,quantity) {
  return Market.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        product_name,
        company_name,
        country,
        price,
        quantity,
      },
    }
  );
}

/**
 * Delete a product
 * @param {string} id - product ID
 * @returns {Promise}
 */
async function deleteProduct(id) {
  return Market.deleteOne({ _id: id });
}

/**
 * Get product by name to prevent duplicate name
 * @param {string} product_name - product name
 * @returns {Promise}
 */
async function getProductName(product_name) {
  return Market.findOne({product_name});
}

/**
 * gets products (modified to handle queries)
 * @param {number} pageNo - current page number
 * @param {number} pageSize - size of page
 * @param {string} search - search query
 * @param {string} sort - sort query
 * @returns {Promise}
 */
async function getProducts(pageNo, pageSize, search, sort) {
  let query = null;
  //checks if the queries are null or not
  //if the query isnt null it will perform said query
  //sort and search strings will be split to their field and key
  if (search != null) {
    const [searchField, searchKey] = search.split(':');
    query = Market.find({
      [searchField]: {
        $regex: searchKey,
        //the regex makes it so that the key just needs to match a substring instead of the entire string
        $options: 'i',
        //the option makes it so the search is not case sensitive
      },
    });
  } else {
    query = Market.find({});
    //if there is no search query it gets all products
  }

  if (sort != null) {
    const [sortField, sortKey] = sort.split(':');
    query.sort({ [sortField]: sortKey }).collation({locale: 'en'});
    //collation is used so the sort isnt case sensitive
  }

  if (pageNo != null && pageSize != null) {
    const sSkip = (pageNo - 1) * pageSize;
    query.skip(sSkip).limit(pageSize);
  }

  //note:the query will be performed in the order:search,sort,pagination(pageNo and pageSize)
  const returns = query;
  return returns;
}

/**
 * counts the total amount of products
 * @returns {promise}
 */
async function productCount() {
  return await Market.countDocuments({});
}

/**
 * counts the total amount of products if search is being performed
 * @param {string} search- search query/string
 * @returns {promise}
 */
async function searchCount(search){
  const [searchField, searchKey] = search.split(':');
  return await Market.countDocuments({
    [searchField]: {
      $regex: searchKey,
      //the regex makes it so that the key just needs to match a substring instead of the entire string
      $options: 'i',
      //the option makes it so the search is not case sensitive
    },
  });
}

/**
 * changes the quantity after either restock or purchase
 * @param {string} id - product id
 * @param {number} quantity - quantity after restock or purchase
 * @returns {promise}
 */
async function changeQuantity(id,quantity){
  return Market.updateOne(
    {
      _id:id,
    },
    {
      $set:{
        quantity,
      }
    },
  );
}

module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  getProductName,
  productCount,
  productCount,
  searchCount,
  changeQuantity
};
