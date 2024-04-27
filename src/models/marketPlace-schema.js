const marketSchema = {
  product_name: String,
  company_name:String,
  //company that owns the product
  country:String,
  //country of origin
  price:String, 
  //its not number because it will concatenated with $
  //note:this api assumes that the products price is converted into $ (usd)
  quantity:Number,
  //products in stock
};

module.exports = marketSchema;
