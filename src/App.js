import './App.css'
import axios from 'axios'

import { io } from 'socket.io-client'

import { useDispatch } from 'react-redux'
import { useEffect } from 'react'
import {
  BrowserRouter as Router,
  Switch,
  Route,
  Redirect,
} from 'react-router-dom'
import Colaborators from './app/components/colaborator/Colaborators'
import Main from './app/components/Main'
import {
  SESSION_STORAGE_LOGGED,
  SESSION_STORAGE_USER,
} from './app/shared/constants'
import { addUserData, logInAction } from './app/redux/slices/AppSlice'

import { setHttpRequestStatus } from './app/redux/slices/AppSlice'

const App = () => {
  const dispatch = useDispatch()

  const socket = io('http://localhost:4000', {
    reconnectionDelayMax: 10000,
    reconnectionAttempts: 5,
  })

  useEffect(() => {
    // axios.interceptors.request.use((req, res) => {
    //   if (req.url.includes("colaborators")) {
    //     console.log(req, res)
    //   }
    // })
    if (sessionStorage.getItem(SESSION_STORAGE_LOGGED)) {
      dispatch(
        addUserData(JSON.parse(sessionStorage.getItem(SESSION_STORAGE_USER)))
      )
      dispatch(logInAction())
    }
    axios.interceptors.response.use(undefined, (err) => {
      if (err.response.status === 404) {
        dispatch(setHttpRequestStatus(404))
      }
    })
  })

  return (
    <Router>
      <Switch>
        <Route
          exact
          path="/"
          render={() => {
            return <Redirect to="/editor" />
          }}
        />
        <Route path="/editor">
          <Main socket={socket} />
        </Route>
        <Route path="/colaborators">
          <Colaborators socket={socket} />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
