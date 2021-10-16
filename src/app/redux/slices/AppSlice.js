const { createSlice } = require('@reduxjs/toolkit')

let initialState = {
  buttonConnectText: 'Connect',
  img: null,
  isHost: false,
  isConnected: false,
  isLogged: false,
  inRoom: false,
  haveMap: false,
  httpRequestStatus: null,
  user: null,
  roomKey: null,
  socket: null,
}

const appSlice = createSlice({
  name: 'state',
  initialState,
  reducers: {
    addKey: (state, action) => {
      state.roomKey = action.payload
    },
    addUserEmail: (state, action) => {
      state.user.email = action.payload
    },
    addUserId: (state, action) => {
      state.user.id = action.payload
    },
    addUserData: (state, action) => {
      state.user = action.payload
    },
    addUserName: (state, action) => {
      state.user.name = action.payload
    },
    setHaveMap: (state, action) => {
      state.haveMap = action.payload
    },
    updateInRoom: (state, action) => {
      state.inRoom = action.payload
    },
    connectedAction: (state, action) => {
      state.isConnected = true
      state.buttonConnectText = 'Disconnect'
    },
    disconnectedAction: (state) => {
      state.isConnected = false
      state.buttonConnectText = 'Connect'
    },
    logInAction: (state) => {
      state.isLogged = true
    },
    setImage: (state, action) => {
      state.img = action.img
    },
    setIsHost: (state, action) => {
      state.isHost = action.payload
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
  addUserData,
  connectedAction,
  disconnectedAction,
  logInAction,
  updateInRoom,
  setImage,
  setIsHost,
  setHaveMap,
  setHttpRequestStatus,
  setSocket,
} = appSlice.actions
export default appSlice.reducer
