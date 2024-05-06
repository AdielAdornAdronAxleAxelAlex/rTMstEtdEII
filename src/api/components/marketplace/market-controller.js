const marketService = require('./market-service');
const { errorResponder, errorTypes } = require('../../../core/errors');
/**
 * Handle get list of product request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getProducts(request, response, next) {
  try {
    //extracts the queries
    const pageNo = request.query.page_number;
    const pageSize = request.query.page_size;
    const search = request.query.search;
    const sort = request.query.sort;
    
    //checks if the search and sort fields are valid if not an error will be thrown
    if(search!=null){
      const searchField=search.split(':')[0];
      if (searchField!='product_name'&&
          searchField!='company_name'&&
          searchField!='country'&&
          searchField!='price'&&
          searchField!='quantity'){
        throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY,'invalid search field')
      }
    }

    //also checks if sortkey is valid or not (asc or desc)
    if(sort!=null){
      const [sortField,sortKey]=sort.split(':');
      if (sortField!='product_name'&&
          sortField!='company_name'&&
          sortField!='country'&&
          sortField!='price'&&
          sortField!='quantity'){
        throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY,'invalid sort field')
      }
      if(sortKey!='asc'&&sortKey!='desc'){
        throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY,'invalid sort key')
      }
    }
    
    let tempRes=null;
    //checks if pagination is possible
    if (pageSize!=null&&pageNo!=null){
      //extracts information needed for pagination
      const pageCount=Math.ceil((await marketService.productCount(search))/pageSize);
      const marketData=await marketService.getProducts(pageNo,pageSize,search,sort);
      const prev=await marketService.hasPrev(pageNo);
      const next=await marketService.hasNext(pageNo,pageCount);
      const marketCounter=await marketService.currPage(pageNo,pageCount,pageSize,search)

      //processes the result
      tempRes={
        page_number:pageNo,
        page_size:pageSize,
        count:marketCounter,
        total_pages:pageCount,
        has_previous_page:prev,
        has_next_page:next,
        data:marketData,
      };
    }else{
      tempRes=await marketService.getProducts(pageNo,pageSize,search,sort);
    }
    const result=tempRes;
    return response.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle get product detail request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function getProduct(request, response, next) {
  try {
    const result = await marketService.getProduct(request.params.id);
    if (!result){
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY, 'Unknown product');
    }

    return response.status(200).json(result);
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle create product
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function createProduct(request, response, next) {
  try {
    const productName=request.body.product_name;
    const companyName=request.body.company_name;
    const country=request.body.country;
    const price=request.body.price;
    const quantity=request.body.quantity;

    // name must be unique
    const isTaken = await marketService.isNameTaken(productName);
    if (isTaken) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'product name is already registered'
      );
    }

    const success = await marketService.createProduct(productName,companyName,country,price,quantity)
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to create product'
      );
    }

    return response.status(200).json({productName,companyName,country,price,quantity});
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle update product request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function updateProduct(request, response, next) {
  try {
    const id=request.params.id;
    const productName=request.body.product_name;
    const companyName=request.body.company_name;
    const country=request.body.country;
    const price=request.body.price;
    const quantity=request.body.quantity;

    // Email must be unique
    const isTaken = await marketService.isNameTaken(productName);
    if (isTaken) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'product name is taken'
      );
    }

    const success = await marketService.updateProduct(id,productName,companyName,country,price,quantity);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to update product'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handle delete product request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function deleteProduct(request, response, next) {
  try {
    const id = request.params.id;

    const success = await marketService.deleteProduct(id);
    if (!success) {
      throw errorResponder(
        errorTypes.UNPROCESSABLE_ENTITY,
        'Failed to delete product'
      );
    }

    return response.status(200).json({ id });
  } catch (error) {
    return next(error);
  }
}

/**
 * Handles product payment when someone buys it
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function buyProduct(request,response,next){
  try{
    const id=request.params.id;
    const quantity=request.body.quantity;
    const payment=request.body.payment;
    const finder=await marketService.getProduct(id);

    //if no products are found
    if(!finder){
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY,'unknown product');
    }

    const totalPrice=(finder.price.replace('$',""))*quantity;

    //if the products quantity is 0 an error wil be thrown saying its out of stock
    if(finder.quantity==0){
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY,'out of stock');
    }

    //if the user wants to buy more products than the stock an error will be thrown
    //telling them to buy less
    if(finder.quantity<quantity){
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY,
        'not enough stock available try buying less current stock is '+finder.quantity);
    }

    //checks if there is enough payment for purchase if not an error will be thrown
    if(payment<totalPrice){
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY,
        'insufficient payment at least '+totalPrice+' is required'
      )
    }

    //calculates what the quantity would be after purchase
    const afterChange=finder.quantity-quantity

    const isDone=await marketService.changeQuantity(id,afterChange);

    //unlikely for an error to occur after checking the previous conditions but just in case
    if(!isDone){
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY,'failed to buy product');
    }

    //generates a receipt for the purchase
    return response.status(200).json({
      product_name:finder.product_name,
      company_name:finder.company_name,
      price:finder.price,
      quantity_bought:quantity,
      total_price:'$'+totalPrice,
      payment:'$'+payment,
      change:'$'+(payment-totalPrice)
    })
  }catch(error){
    return next (error);
  }
}

/**
 * Handles product restock
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function restock(request,response,next){
  try{
    const id=request.params.id;
    const stock=request.body.stock;
    const finder=await marketService.getProduct(id);

    //if no products are found
    if(!finder){
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY,'unknown product');
    }

    //calculates how much quantity would be after restock
    const afterRestock=finder.quantity+stock;

    const isDone=marketService.changeQuantity(id,afterRestock);
    
    //unlikely for an error to occur after checking the previous conditions but just in case   
    if(!isDone){
      throw errorResponder(errorTypes.UNPROCESSABLE_ENTITY,'failed restocking')
    }

    return response.status(200).json({
      product_name:finder.product_name,
      quantity_before:finder.quantity,
      quantity_after:afterRestock
    });
  }catch(error){
    return next (error);
  }
}






module.exports = {
  getProducts,
  getProduct,
  createProduct,
  updateProduct,
  deleteProduct,
  buyProduct,
  restock,
};
