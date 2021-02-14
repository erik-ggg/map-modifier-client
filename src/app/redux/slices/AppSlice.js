const { createSlice } = require("@reduxjs/toolkit")

let initialState = {
  buttonConnectText: "Connect",
  inRoom: false,
  haveMap: null,
  httpRequestStatus: null,
  userKey: undefined,
  userId: undefined,
  socket: null,
}

const appSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    addKey: (state, action) => {
      state.userKey = action.payload
    },
    addUserId: (state, action) => {
      state.userId = action.payload
    },
    setHaveMap: (state, action) => {
      state.haveMap = action.payload
    },
    updateInRoom: (state, action) => {
      state.inRoom = action.payload
    },
    connected: (state) => {
      state.buttonConnectText = "Disconnect"
    },
    disconnected: (state) => {
      state.buttonConnectText = "Connect"
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
  addUserId,
  connected,
  disconnected,
  updateInRoom,
  setHaveMap,
  setHttpRequestStatus,
  setSocket,
} = appSlice.actions
export default appSlice.reducer
