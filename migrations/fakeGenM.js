//you can ignore this file it is used for generating random products to test functions
//if you do want to try it it is executed using 'npm run fakeGenM' in the terminal
//keep in mind it does take some time to execute depending on how many its generating
//the amount of products that are generated can be changed by changing the value 'i<int' in the for loop in line 11
const faker=require('faker');
const marketRepository = require('../src/api/components/marketplace/market-repository');
const { hashPassword } = require('../src/utils/password');
const logger = require('../src/core/logger')('api');


async function fakeGenM(){
  try{
    for (let i=0;i<60;i++){
      let product_name=((faker.random.word())+' '+(faker.commerce.product()));
      //i know that there is a chance faker would produce 2 products with the same name so i use
      //a random to drastically reduce those chances although still possible its very unlikely
      let company_name=faker.company.companyName();
      let country=faker.address.country();
      let price=faker.datatype.number({min:1,max:200});
      let quantity=(faker.datatype.number({min:1,max:1000}));
      await marketRepository.createProduct(product_name,company_name,country,price,quantity)
    }
  }
  catch (e) {
    logger.error(e);
  } finally {
    process.exit(0);
  }
}
fakeGenM();



