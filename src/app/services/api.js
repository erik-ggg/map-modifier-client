import axios from 'axios'

const colaboratorsURI = process.env.REACT_APP_API_URL + 'colaborators'
const imagesUri = process.env.REACT_APP_API_URL + 'images'
const usersURI = process.env.REACT_APP_API_URL + 'users'

export const getUser = (email) => {
  return axios.get(`${usersURI}/${email}`)
}

/**
 * Adds the new user to the database
 * @param {*} name the user name
 * @param {*} email the user email
 * @returns
 */
export const addUser = (user) => {
  return axios.post(usersURI, JSON.stringify(user), {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Post the user connection in the server.
 * @param {*} name the user name
 * @param {*} email the user email
 * @param {*} socketId the socketid room key
 * @returns 500 or 201 if success
 */
export const connectUserToSocketIO = (name, email, socketId) => {
  return axios.post(usersURI, { name: name, email: email, socketId, socketId })
}

/**
 * Sends the petition to delete the colaborator of the given user
 * @param {*} userId the logged google user id
 * @param {*} colaboratorEmail the colaborator email
 */
export const deleteColaborator = (userId, colaboratorEmail) => {
  const data = JSON.stringify({
    userId: userId,
    email: colaboratorEmail,
  })
  return axios.delete(colaboratorsURI, {
    data: data,
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Sends the petition to add the colaborator of the given user
 * @param {*} email the user email
 * @param {*} colaboratorEmail the colaborator email
 */
export const addColaborator = (email, colaboratorEmail) => {
  const data = JSON.stringify({
    source: email,
    target: colaboratorEmail,
  })
  return axios.post(colaboratorsURI, data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Gets all the logged user colaborators
 * @param {*} email the logged user email
 * @returns the promise with all the colaborators
 */
export const getColaborators = (email) => {
  return axios.get(`${colaboratorsURI}/${email}`)
}

export const saveImageApi = (data) => {
  return axios.post(imagesUri, JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const getUserImagesFromDB = (userId) => {
  return axios.get(`${imagesUri}/${userId}`)
}
