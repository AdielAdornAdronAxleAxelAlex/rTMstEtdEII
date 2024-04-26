const { errorResponder, errorTypes } = require('../../../core/errors');
const authenticationServices = require('./authentication-service');

let target=[];
//an array that will store objects containing information about the emails eligibility to login
//why use an object? so when a user enters the wrong password 5 times it will only lock out one email
//instead of every single email if they enter a non existent or wrong email said email will still be locked out
//to mislead potential attackers into thinking the email is valid even though it isnt

/**
 * Handle login request
 * @param {object} request - Express request object
 * @param {object} response - Express response object
 * @param {object} next - Express route middlewares
 * @returns {object} Response object or pass an error to the next route
 */
async function login(request, response, next) {
  const { email, password } = request.body;
  const tIndex=target.findIndex(target=>target.targetEmail==email);
  //if target doesnt have any object with a matching email tIndex ill be -1

  try {

    //checks if the email is locked out
    if(tIndex!=-1){
      if(target[tIndex].isLocked){
        throw errorResponder(
          errorTypes.FORBIDDEN,'Too many failed login attempts'
        );
      }
    }

    // Check login credentials
    const loginSuccess = await authenticationServices.checkLoginCredentials(
      email,
      password
    );

    if (!loginSuccess) {
      //if login is failed and there is no matching email in target a new target will be created
      if(tIndex==-1){
        createTarget(email,1,false);
      //note:wrong counter is already 1 because this condition is triggered when they have a wrong credential
      //meaning they already attempted to login once
      }
      //if there is a matching email wrongCounter will be increased by 1
      else{
        target[tIndex].wrongCounter++;
      }
      
      //if the user gets the 5th attempt wrong the email will be immediately locked out
      if (tIndex!=-1){
        if((target[tIndex].wrongCounter)==5){
          target[tIndex].isLocked=true;
          setTimeout(function(){
            timerFunc(target,tIndex)
          },1800000);
          //setTimeout uses miliseconds and 1 second is 1000 therefore 30 minutes is 30*60*1000=1800000
        throw errorResponder(
          errorTypes.FORBIDDEN,'Too many failed login attempts'
        )
        }
      }

      throw errorResponder(
        errorTypes.INVALID_CREDENTIALS,
        'Wrong email or password'
      );
    }else{
      //if the user logs in correctly it would reset the counter to 0 
      if(tIndex!=-1){
        target[tIndex].wrongCounter=0;
      }   
    }

    return response.status(200).json(loginSuccess);
  } catch (error) {
    return next(error);
  }
}

/**
 * used by setTimeout when there is too many failed login attempts (it will be executed when the timer ends)
 * @param {array} timerTarget - the target array
 * @param {number} timerIndex - the index for the array
 * @returns {void} - doesnt return anything
 */
async function timerFunc(timerTarget,timerIndex){
  timerTarget[timerIndex].wrongCounter=0;
  timerTarget[timerIndex].isLocked=false;
  console.log(timerTarget[timerIndex].targetEmail+" is no longer locked out");
}

/**
 * used to create a new object for target
 * @param {string} targetEmail - targets email
 * @param {string} targetCounter - how many failed logins for the email
 * @param {boolean} isLocked - wheter or not the email is locked out
 * @returns {void} - doesnt return anything
 */
async function createTarget(targetEmail,wrongCounter,isLocked){
  const newTarget={
    targetEmail,
    wrongCounter,
    isLocked
  };
  target.push(newTarget);
}

module.exports = {
  login,
};
