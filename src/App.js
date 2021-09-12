import './App.css'
import axios from 'axios'

import socketIOCient from 'socket.io-client'

import toast, { Toaster } from 'react-hot-toast'

import { useDispatch, useSelector } from 'react-redux'
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

import {
  BROADCAST_DRAWING,
  RECEIVING_DRAWING,
  SHARE_DRAW_CONFIG,
} from './app/shared/socket-actions'

import {
  addUserData,
  logInAction,
  addKey,
  connectedAction,
  disconnectedAction,
  updateInRoom,
  setIsHost,
  setHaveMap,
} from './app/redux/slices/AppSlice'

import { setHttpRequestStatus } from './app/redux/slices/AppSlice'

// let socket

const socket = socketIOCient('http://localhost:4000')

const App = () => {
  const dispatch = useDispatch()

  const user = useSelector((res) => res.state.user)

  useEffect(() => {
    if (sessionStorage.getItem(SESSION_STORAGE_LOGGED)) {
      dispatch(
        addUserData(JSON.parse(sessionStorage.getItem(SESSION_STORAGE_USER)))
      )
      dispatch(logInAction())
    }
    socket.on('broadcast res', (res) => {
      console.log('broadcast res', res)
    })

    socket.on('joined', (targetId) => {
      dispatch(addKey(targetId))
      toast.success('Joined!')
    })

    socket.on('already joined', () => {
      toast('Already joined!', {
        icon: '⚠️',
      })
    })
  }, [])

  useEffect(() => {
    // axios.interceptors.request.use((req, res) => {
    //   if (req.url.includes("colaborators")) {
    //     console.log(req, res)
    //   }
    // })
    // axios.interceptors.response.use(undefined, (err) => {
    //   if (err.response.status === 404) {
    //     dispatch(setHttpRequestStatus(404))
    //   }
    // })
  })

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
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
    </div>
  )
}

export default App
