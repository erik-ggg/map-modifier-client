import './App.css'

import socketIOCient from 'socket.io-client'

import toast, { Toaster } from 'react-hot-toast'

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

import { addUserData, logInAction, addKey } from './app/redux/slices/AppSlice'

// let socket

const socket = socketIOCient('http://13.36.239.108:4000')

const App = () => {
  const dispatch = useDispatch()

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
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

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
