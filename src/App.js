import "./App.css"
import {
  AppBar,
  Button,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core"
import MenuIcon from "@material-ui/icons/Menu"
import Grid from "@material-ui/core/Grid"
import Divider from "@material-ui/core/Divider"
import { TwitterPicker } from "react-color"

import { GoogleLogin } from "react-google-login"
import { io } from "socket.io-client"
import axios from "axios"

import { useDispatch, useSelector } from "react-redux"
import {
  addKey,
  addUserId,
  connected,
  disconnected,
  updateInRoom,
} from "./app/redux/slices/AppSlice"
import { useState } from "react"
import { useEffect } from "react"
import { BrowserRouter as Router, Switch, Route, Link } from "react-router-dom"
import Colaborators from "./app/components/colaborator/Colaborators"
import Main from "./app/components/Main"
import { SESSION_STORAGE_USER_KEY } from "./app/shared/constants"

import { setHttpRequestStatus } from "./app/redux/slices/AppSlice"

const App = () => {
  const dispatch = useDispatch()

  useEffect(() => {
    // axios.interceptors.request.use((req, res) => {
    //   if (req.url.includes("colaborators")) {
    //     console.log(req, res)
    //   }
    // })
    axios.interceptors.response.use(undefined, (err) => {
      if (err.response.status === 404) {
        dispatch(setHttpRequestStatus(404))
      }
    })
    if (window.performance && performance.navigation.type === 1) {
      const userId = sessionStorage.getItem(SESSION_STORAGE_USER_KEY)
      // dispatch(addUserId(userId))
    }
  })

  return (
    <Router>
      <Switch>
        <Route path="/editor">
          <Main />
        </Route>
        <Route path="/colaborators">
          <Colaborators />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
