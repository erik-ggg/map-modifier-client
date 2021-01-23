import { combineReducers } from "@reduxjs/toolkit"
import appSliceReducer from "../slices/AppSlice"

const rootReducer = combineReducers({ state: appSliceReducer })

export default rootReducer
