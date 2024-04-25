const usersRepository = require('./users-repository');
const { hashPassword, passwordMatched } = require('../../../utils/password');

/**
 * Get user detail
 * @param {string} id - User ID
 * @returns {Object}
 */
async function getUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  return {
    id: user.id,
    name: user.name,
    email: user.email,
  };
}

/**
 * Create new user
 * @param {string} name - Name
 * @param {string} email - Email
 * @param {string} password - Password
 * @returns {boolean}
 */
async function createUser(name, email, password) {
  // Hash password
  const hashedPassword = await hashPassword(password);

  try {
    await usersRepository.createUser(name, email, hashedPassword);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Update existing user
 * @param {string} id - User ID
 * @param {string} name - Name
 * @param {string} email - Email
 * @returns {boolean}
 */
async function updateUser(id, name, email) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.updateUser(id, name, email);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Delete user
 * @param {string} id - User ID
 * @returns {boolean}
 */
async function deleteUser(id) {
  const user = await usersRepository.getUser(id);

  // User not found
  if (!user) {
    return null;
  }

  try {
    await usersRepository.deleteUser(id);
  } catch (err) {
    return null;
  }

  return true;
}

/**
 * Check whether the email is registered
 * @param {string} email - Email
 * @returns {boolean}
 */
async function emailIsRegistered(email) {
  const user = await usersRepository.getUserByEmail(email);

  if (user) {
    return true;
  }

  return false;
}

/**
 * Check whether the password is correct
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function checkPassword(userId, password) {
  const user = await usersRepository.getUser(userId);
  return passwordMatched(password, user.password);
}

/**
 * Change user password
 * @param {string} userId - User ID
 * @param {string} password - Password
 * @returns {boolean}
 */
async function changePassword(userId, password) {
  const user = await usersRepository.getUser(userId);

  // Check if user not found
  if (!user) {
    return null;
  }

  const hashedPassword = await hashPassword(password);

  const changeSuccess = await usersRepository.changePassword(
    userId,
    hashedPassword
  );

  if (!changeSuccess) {
    return null;
  }

  return true;
}

/**
 * Get list of users
 * @param {number} pageNo - current page number
 * @param {number} pageSize - size of page
 * @param {string} search - search query/string
 * @param {string} sort - sort query/string
 * @returns {Promise}
 */
async function getUsers(pageNo, pageSize, search, sort) {
  const users = await usersRepository.getUsers(pageNo, pageSize, search, sort);
  const results = [];
  for (let i = 0; i < users.length; i += 1) {
    const user = users[i];
    results.push({
      id: user.id,
      name: user.name,
      email: user.email,
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
 * counts number of users
 * @param {string} - search query/string
 * @returns {number}
 */
async function userCount(search) {
  //if search is being performed it will use searchCount instead of userCount
  if (search!=null){
    return await usersRepository.searchCount(search);
  }
  return await usersRepository.userCount();
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
        (await usersRepository.searchCount(search)) - pageSize * (pageCount - 1)
      );
    }
  } else {
    if (pageNo != pageCount) {
      return pageSize;
    } else {
      return (await usersRepository.userCount()) - pageSize * (pageCount - 1);
    }
  }
}

module.exports = {
  getUsers,
  getUser,
  createUser,
  updateUser,
  deleteUser,
  emailIsRegistered,
  checkPassword,
  changePassword,
  hasNext,
  hasPrev,
  userCount,
  currPage,
};
