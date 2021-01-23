import rootReducer from "./reducers/rootReducer"

const { configureStore } = require("@reduxjs/toolkit")

const store = configureStore({ reducer: rootReducer })

export default store
