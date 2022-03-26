import axios from 'axios'

const apiUri = 'https://13.36.239.108:4000/api/'
const deleteColaboratorUri = apiUri + 'colaborators'
const addColaboratorUri = apiUri + 'colaborators'
const imagesUri = apiUri + 'images'

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
  return axios.delete(deleteColaboratorUri, {
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
  return axios.post(addColaboratorUri, data, {
    headers: { 'Content-Type': 'application/json' },
  })
}

/**
 * Gets all the logged user colaborators
 * @param {*} email the logged user email
 * @returns the promise with all the colaborators
 */
export const getColaborators = (email) => {
  return axios.get(`${addColaboratorUri}/${email}`)
}

export const saveImageApi = (data) => {
  return axios.post(imagesUri, JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  })
}

export const getUserImagesFromDB = (userId) => {
  return axios.get(`${imagesUri}/${userId}`)
}
