const { User } = require('../../../models');

/**
 * Get a list of users
 * @returns {Promise}
 */
async function getUsers() {
  return User.find({});
}

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function getUser(id) {
  return User.findById(id);
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Hashed password
 * @returns {Promise}
 */
async function createUser(name, email, password) {
  return User.create({
    name,
    email,
    password,
  });
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {Promise}
 */
async function updateUser(id, name, email) {
  return User.updateOne(
    {
      _id: id,
    },
    {
      $set: {
        name,
        email,
      },
    }
  );
}

/**
 * Delete a user
 * @param {string} id - User ID
 * @returns {Promise}
 */
async function deleteUser(id) {
  return User.deleteOne({ _id: id });
}

/**
 * Get user by email to prevent duplicate email
 * @param {string} email - Email
 * @returns {Promise}
 */
async function getUserByEmail(email) {
  return User.findOne({ email });
}

/**
 * Update user password
 * @param {string} id - User ID
 * @param {string} password - New hashed password
 * @returns {Promise}
 */
async function changePassword(id, password) {
  return User.updateOne({ _id: id }, { $set: { password } });
}

/**
 * gets users (modified to handle queries)
 * @param {number} pageNo - current page number
 * @param {number} pageSize - size of page
 * @param {string} search - search query
 * @param {string} sort - sort query
 * @returns {Promise}
 */
async function getUsers(pageNo, pageSize, search, sort) {
  let query = null;

  //checks if the queries are null or not
  //if the query isnt null it will perform said query
  //sort and search strings will be split to their field and key
  if (search != null) {
    const [searchField, searchKey] = search.split(':');
    query = User.find({
      [searchField]: {
        $regex: searchKey,
        //the regex makes it so that the key just needs to match a substring instead of the entire string
        $options: 'i',
        //the option makes it so the search is not case sensitive
      },
    });
  } else {
    query = User.find({});
    //if there is no search query it gets all users
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
 * counts the total amount of users
 * @returns {promise}
 */
async function userCount() {
  return await User.countDocuments({});
}

/**
 * counts the total amount of users if search is being performed
 * @param {string} search- search query/string
 * @returns {promise}
 */
async function searchCount(search){
  const [searchField, searchKey] = search.split(':');
  return await User.countDocuments({
    [searchField]: {
      $regex: searchKey,
      //the regex makes it so that the key just needs to match a substring instead of the entire string
      $options: 'i',
      //the option makes it so the search is not case sensitive
    },
  });
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  getUserByEmail,
  changePassword,
  userCount,
  searchCount,
};
