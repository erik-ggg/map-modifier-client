const { createSlice } = require("@reduxjs/toolkit")

let initialState = {
  buttonConnectText: "Connect",
  inRoom: false,
  userKey: undefined,
}

const appSlice = createSlice({
  name: "state",
  initialState,
  reducers: {
    addKey: (state, action) => {
      state.userKey = action.payload
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
  },
})

export const {
  addKey,
  connected,
  disconnected,
  updateInRoom,
} = appSlice.actions
export default appSlice.reducer
