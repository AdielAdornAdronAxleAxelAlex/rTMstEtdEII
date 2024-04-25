//you can ignore this file it is used for generating random users to test functions
//if you do want to try it it is executed using 'npm run fakeGen' in the terminal
//keep in mind it does take some time to execute depending on how many  its generating
//the amount of users that are generated can be changed by changing the value 'i<int' in the for loop in line 11
const faker=require('faker');
const usersRepository = require('../src/api/components/users/users-repository');
const { hashPassword, passwordMatched } = require('../src/utils/password');

async function fakeGen(){
  try{
    for (let i=0;i<40;i++){
      let name=faker.name.firstName()
      let email=faker.internet.email()
      let hashedPassword=await hashPassword('123456')
      await usersRepository.createUser(name, email, hashedPassword)
    }
  }
  catch (e) {
    logger.error(e);
  } finally {
    process.exit(0);
  }
}
fakeGen();


