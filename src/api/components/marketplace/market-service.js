const marketRepository = require('./market-repository');
/**
 * Get product detail
 * @param {string} id - product ID
 * @returns {Object}
 */
async function getProduct(id) {
  try{
    const result = await marketRepository.getProduct(id);

  // product not found
  if (!result) {
    return null;
  }

  return {
    product_name:result.product_name,
    company_name:result.company_name,
    country:result.country,
    price:result.price,
    quantity:result.quantity,
  };
  }
  catch(err){
    return null;
  }

}

/**
 * Create new product
 * @param {string} productName - product name
 * @param {string} companyName - company name
 * @param {string} country - country
 * @param {number} price - price
 * @param {number} quantity - quantity
 * @returns {boolean}
 */
async function createProduct(productName,companyName,country,price,quantity) {

  try {
    await marketRepository.createProduct(productName,companyName,country,price,quantity);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing product
 * @param {string} id - product id
 * @param {string} productName - product name
 * @param {string} companyName - company name
 * @param {string} country - country
 * @param {number} price - price
 * @param {number} quantity - quantity
 * @returns {boolean}
 */
async function updateProduct(id,productName,companyName,country,price,quantity) {
  try{
    const result = await marketRepository.getProduct(id);
  }catch(err){
    return null;
  }

  try {
    await marketRepository.updateProduct(id,productName,companyName,country,price,quantity);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete product
 * @param {string} id - product id
 * @returns {boolean}
 */
async function deleteProduct(id) {
  try{
    const result = await marketRepository.getProduct(id);
    
    // product not found
    if (!result) {
      return null;
    }
  }catch(err){
    return null;
  }

  try {
    await marketRepository.deleteProduct(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the name is registered
 * @param {string} productName - product name
 * @returns {boolean}
 */
async function isNameTaken(productName) {
  const result = await marketRepository.getProductName(productName);

  if (result) {
    return true;
  }

  return false;
}

/**
 * Get list of products
 * @param {number} pageNo - current page number
 * @param {number} pageSize - size of page
 * @param {string} search - search query
 * @param {string} sort - sort query
 * @returns {Array}
 */

async function getProducts(pageNo, pageSize, search, sort) {
  const res = await marketRepository.getProducts(pageNo, pageSize, search, sort);
  const results = [];
  for (let i = 0; i < res.length; i += 1) {
    const product = res[i];
    results.push({
      id: product.id,
      product_name: product.product_name,
      company_name: product.company_name,
      country: product.country,
      price:product.price,
      quantity:product.quantity,
    });
  }
  return results;
}

/**
 * determines if theres a next page
 * @param {number} pageSize - size of page
 * @param {number} pageNo - current page number
 * @returns {boolean}
 */
async function hasNext(pageNo, pageCount) {
  if (pageNo < pageCount) {
    return true;
  } else {
    return false;
  }
}

/**
 * determines if theres a previous page
 * @param {number} pageNo - current page number
 * @returns {boolean}
 */
async function hasPrev(pageNo) {
  if (pageNo == 1) {
    return false;
  } else {
    return true;
  }
}

/**
 * counts number of products
 * @param {string} - search query
 * @returns {number}
 */
async function productCount(search) {
  //if search is being performed it will use searchCount instead of productCount
  if (search!=null){
    return await marketRepository.searchCount(search);
  }
  return await marketRepository.productCount();
}

/**
 * counts how many data is in the current page
 * @param {number} pageNo - current page number
 * @param {number} pageCount - number of pages
 * @param {number} pageSize - size of page
 * @param {string} search - search string/query
 * @returns {number}
 */
async function currPage(pageNo, pageCount, pageSize, search) {
  if (search != null) {
    if (pageNo != pageCount) {
      return pageSize;
    } else {
      return (
        (await marketRepository.searchCount(search)) - pageSize * (pageCount - 1)
      );
    }
  } else {
    if (pageNo != pageCount) {
      return pageSize;
    } else {
      return (await marketRepository.productCount()) - pageSize * (pageCount - 1);
    }
  }
}

/**
 * changes the quantity after either purchase or restock
 * @param {string} id - product id
 * @param {number} quantity - quantity after purchase or restock
 * @returns {boolean} 
 */
async function changeQuantity(id,quantity){
  try{
    marketRepository.changeQuantity(id,quantity);
    return true;
  }catch(err){
    return null;
  }
}


module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  isNameTaken,
  hasNext,
  hasPrev,
  productCount,
  currPage,
  changeQuantity
};
