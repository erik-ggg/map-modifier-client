import { act } from "react-dom/cjs/react-dom-test-utils.production.min"

const { createSlice } = require("@reduxjs/toolkit")

let initialState = {
  buttonConnectText: "Connect",
  img: null,
  inRoom: false,
  haveMap: null,
  httpRequestStatus: null,
  userEmail: null,
  userKey: undefined,
  userId: undefined,
  userName: null,
  socket: null,
}

const appSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    addKey: (state, action) => {
      state.userKey = action.payload
    },
    addUserEmail: (state, action) => {
      state.userEmail = action.payload
    },
    addUserId: (state, action) => {
      state.userId = action.payload
    },
    addUserName: (state, action) => {
      state.userName = action.payload
    },
    setHaveMap: (state, action) => {
      state.haveMap = action.payload
    },
    updateInRoom: (state, action) => {
      state.inRoom = action.payload
    },
    connected: (state, action) => {
      state.buttonConnectText = "Disconnect"
    },
    disconnected: (state) => {
      state.buttonConnectText = "Connect"
    },
    setImage: (state, action) => {
      state.img = action.img
    },
    setHttpRequestStatus: (state, action) => {
      state.httpRequestStatus = action.payload
    },
    setSocket: (state, action) => {
      state.socket = action.payload
    },
  },
})

export const {
  addKey,
  addUserEmail,
  addUserId,
  addUserName,
  connected,
  disconnected,
  updateInRoom,
  setImage,
  setHaveMap,
  setHttpRequestStatus,
  setSocket,
} = appSlice.actions
export default appSlice.reducer
