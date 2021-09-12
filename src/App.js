import './App.css'
import axios from 'axios'

import { io } from 'socket.io-client'

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

import {
  BROADCAST_DRAWING,
  RECEIVING_DRAWING,
  SHARE_DRAW_CONFIG,
} from './app/shared/socket-actions'

import { addUserData, logInAction } from './app/redux/slices/AppSlice'

import { setHttpRequestStatus } from './app/redux/slices/AppSlice'

const App = () => {
  const dispatch = useDispatch()

  const socket = io('http://localhost:4000', {
    reconnectionDelayMax: 10000,
    reconnectionAttempts: 5,
  })

  useEffect(() => {
    if (socket != null) {
      socket.on('broadcast res', (res) => {
        console.log('broadcast res', res)
      })

      socket.on('receiving image', (res) => {
        // dispatch(setHaveMap(true))
        // console.log(res)
        // setMapFile('receiving map', res.image)
        // setHaveMap(res)
      })

      socket.on(RECEIVING_DRAWING, (res) => {
        // draw(res.prevPos, res.currPos, res.drawConfig)
      })

      socket.on('user joined', () => {
        // dispatch(setIsHost(true))
        // dispatch(updateInRoom(true))
        // console.log(haveMap)
        // console.log(haveMapAux)
        // if (haveMap) {
        //   console.log('user joined, sharing map', mapFile)
        //   socket.emit(
        //     'broadcast image',
        //     mapFile,
        //     roomKey !== null ? roomKey : socket.id
        //   )
        // }
        // socket.emit(
        //   SHARE_DRAW_CONFIG,
        //   drawConfig,
        //   roomKey !== null ? roomKey : socket.id
        // )
        toast('User joined!', {
          icon: '🙋‍♀️',
        })
      })

      socket.on('joined', (targetId) => {
        // dispatch(addKey(targetId))
        toast.success('Joined!')
      })

      socket.on('already joined', () => {
        toast('Already joined!', {
          icon: '⚠️',
        })
      })

      socket.on(SHARE_DRAW_CONFIG, (config) => {
        // setDrawConfig(config)
        // setCanvasContextConfig(config)
      })
    }
  }, [socket])

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
    // axios.interceptors.response.use(undefined, (err) => {
    //   if (err.response.status === 404) {
    //     dispatch(setHttpRequestStatus(404))
    //   }
    // })
  })

  return (
    <div>
      <Toaster position='top-center' reverseOrder={false} />
      <Router>
        <Switch>
          <Route
            exact
            path='/'
            render={() => {
              return <Redirect to='/editor' />
            }}
          />
          <Route path='/editor'>
            <Main socket={socket} />
          </Route>
          <Route path='/colaborators'>
            <Colaborators socket={socket} />
          </Route>
        </Switch>
      </Router>
    </div>
  )
}

export default App
