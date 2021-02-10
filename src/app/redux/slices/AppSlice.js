const { createSlice } = require("@reduxjs/toolkit")

let initialState = {
  buttonConnectText: "Connect",
  inRoom: false,
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
    updateInRoom: (state, action) => {
      state.inRoom = action.payload
    },
    connected: (state) => {
      state.buttonConnectText = "Disconnect"
    },
    disconnected: (state) => {
      state.buttonConnectText = "Connect"
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
  setSocket,
} = appSlice.actions
export default appSlice.reducer
