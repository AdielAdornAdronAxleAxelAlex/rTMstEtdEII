const joi = require('joi');

module.exports = {
  createProduct: {
    body: {
      product_name:joi.string().min(1).max(100).required().label('product name'),
      company_name:joi.string().min(1).max(100).required().label('company name'),
      country:joi.string().min(1).max(100).required().label('country'),
      price:joi.number().min(1).required().label('price'),
      quantity:joi.number().min(0).optional().label('quantity'),
    },
  },

  updateProduct: {
    body: {
      product_name:joi.string().min(1).max(100).required().label('product name'),
      company_name:joi.string().min(1).max(100).required().label('company name'),
      country:joi.string().min(1).max(100).required().label('country'),
      price:joi.number().min(1).required().label('price'),
      quantity:joi.number().min(0).optional().label('quantity'),
    },
  },

  getProducts:{
    query:{
    page_number:joi.number().min(1).optional().label('pageNo'),
    page_size:joi.number().min(1).optional().label('pageSize'),
    search:joi.string().regex(/:/).optional().label('search'),
    sort:joi.string().regex(/:/).optional().label('sort'),
    //the regex /:/ makes sure that sort and search has a ':'
    },
    
  },

  buyProduct:{
    body:{
      quantity:joi.number().min(1).required().label('quantity'),
    }
  },

  restock:{
    body:{
      stock:joi.number().min(1).required().label('stock'),
    }
  },
};
