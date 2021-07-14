import axios from "axios"

const apiUri = "http://localhost:4000/api/"
const deleteColaboratorUri = apiUri + "colaborators/delete"
const addColaboratorUri = apiUri + "colaborators/add"

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
    headers: { "Content-Type": "application/json" },
  })
}

/**
 * Sends the petition to add the colaborator of the given user
 * @param {*} userId the logged google user id
 * @param {*} colaboratorEmail the colaborator email
 */
export const addColaborator = (userId, colaboratorEmail) => {
  const data = JSON.stringify({
    userId: userId,
    email: colaboratorEmail,
  })
  return axios.post(addColaboratorUri, data, {
    headers: { "Content-Type": "application/json" },
  })
}
