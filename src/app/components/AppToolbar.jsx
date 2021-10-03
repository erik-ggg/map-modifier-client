import '../../App.css'
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
} from '@material-ui/core'
import SaveIcon from '@mui/icons-material/Save'
import MenuIcon from '@material-ui/icons/Menu'
import axios from 'axios'

import toast from 'react-hot-toast'

import { GoogleLogin } from 'react-google-login'

import { useDispatch, useSelector } from 'react-redux'
import {
  connectedAction,
  disconnectedAction,
  setHaveMap,
  updateInRoom,
  addUserData,
  logInAction,
} from '../redux/slices/AppSlice'
import { useState } from 'react'

import {
  CONNECT_SUCCESSFULL,
  DISCONNECT_SUCCESSFULL,
} from '../utils/literals.js'

import { Link } from 'react-router-dom'
import {
  COLABORATORS_TOOLBAR,
  EDITOR_TOOLBAR,
  CONNECT_BUTTON_CONNECT,
  CONNECT_BUTTON_DISCONNECT,
  SESSION_STORAGE_USER,
  SESSION_STORAGE_LOGGED,
} from '../shared/constants'
import { BROADCAST_IMAGE } from '../shared/socket-actions'
import Save from '@mui/icons-material/Save'

const useStyles = makeStyles((theme) => ({
  root: {
    flexGrow: 1,
  },
  menuButton: {
    marginRight: theme.spacing(2),
  },
  title: {
    flexGrow: 1,
  },
  connectOptionsContainer: {
    display: 'flex',
  },
  connectOptionsContainerAux: {
    display: 'flex',
  },
}))

const clientId =
  '650564013529-agbmjjd0nm6cptp04aoqrmo6ijk0ae3q.apps.googleusercontent.com'

const handleLoginFailure = () => {}

const AppToolbar = ({
  type,
  onOpenPopup,
  download,
  openSaveImagePopup,
  displayLoadImagePopup,
  socket,
  setImage,
}) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const roomKey = useSelector((res) => res.state.roomKey)
  const userId = useSelector((res) => res.state.userId)
  const isConnected = useSelector((res) => res.state.isConnected)
  const isLogged = useSelector((res) => res.state.isLogged)
  const user = useSelector((res) => res.state.user)

  const [anchorEl, setAnchorEl] = useState(null)
  const [mapFile, setMapFile] = useState('')
  const [targetConnectionId, setTargetConnectionId] = useState('')
  const [haveMap, setHaveMapState] = useState(false)

  const handleConnectButton = () => {
    if (isConnected) {
      socket.emit('disconnected')
      dispatch(disconnectedAction())
      dispatch(updateInRoom(false))
      toast.success(DISCONNECT_SUCCESSFULL)
    } else {
      axios
        .post(`http://localhost:4000/api/users`, {
          name: user.name,
          email: user.email,
          socketId: socket.id,
        })
        .then(() => {
          dispatch(connectedAction())
          toast.success(CONNECT_SUCCESSFULL)
        })
    }
  }

  const join = () => {
    socket.emit('join room', targetConnectionId)
    dispatch(updateInRoom(true))
  }

  const handleLoginSuccess = (res) => {
    const user = {
      name: res.profileObj.name,
      email: res.profileObj.email,
      id: res.googleId,
    }
    sessionStorage.setItem(SESSION_STORAGE_USER, JSON.stringify(user))
    sessionStorage.setItem(SESSION_STORAGE_LOGGED, true)
    dispatch(addUserData(user))
    dispatch(logInAction())
  }

  const showKey = () => {
    navigator.clipboard.writeText(socket.id)
    toast.success(`User key: ${socket.id}, copied to clipboard`)
  }

  const emitImage = (image) => {
    if (image && isConnected) {
      socket.emit(BROADCAST_IMAGE, {
        image: image,
        room: roomKey !== null ? roomKey : socket.id,
      })
    }
  }

  /**
   * Handle download button. Combine both canvas and image to get the final image.
   */
  const hadleDownloadButton = () => {
    download()
  }

  /**
   * Handle the load map from file action. If connected to room it will share it.
   * @param {*} event the input event
   */
  const handleInputFile = (event) => {
    const img = event.target.files[0]
    setImage(URL.createObjectURL(img))
    setMapFile(URL.createObjectURL(img))
    setHaveMapState(true)
    dispatch(setHaveMap(true))

    const reader = new FileReader()
    reader.onloadend = function () {
      emitImage(reader.result)
    }
    reader.readAsDataURL(event.target.files[0])
  }

  const handleLoadMap = () => {
    displayLoadImagePopup()
    setAnchorEl(null)
  }

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleSaveButton = () => {
    openSaveImagePopup()
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleButtonColaboratorsPopup = () => {
    onOpenPopup()
  }

  return (
    <AppBar position="static">
      <Toolbar>
        <IconButton
          edge="start"
          className={classes.menuButton}
          color="inherit"
          aria-label="menu"
          aria-controls="simple-menu"
          aria-haspopup="true"
          onClick={handleMenuClick}
        >
          <MenuIcon />
        </IconButton>
        <Menu
          id="simple-menu"
          anchorEl={anchorEl}
          keepMounted
          open={Boolean(anchorEl)}
          onClose={handleMenuClose}
        >
          <MenuItem onClick={handleLoadMap}>Load map</MenuItem>
          {type === EDITOR_TOOLBAR && userId !== null && (
            <MenuItem>
              <Link to="/colaborators">Colaborators</Link>
            </MenuItem>
          )}
          {type === COLABORATORS_TOOLBAR && (
            <MenuItem>
              <Link to="/editor">Editor</Link>
            </MenuItem>
          )}
        </Menu>
        <Typography variant="h6" className={classes.title}>
          Editor
        </Typography>
        {type === EDITOR_TOOLBAR && (
          <div className={classes.connectOptionsContainer}>
            {isLogged && (
              <div className={classes.connectOptionsContainerAux}>
                <Button variant="contained" component="label">
                  Upload File
                  <input
                    type="file"
                    onChange={handleInputFile}
                    accept=".jpg, .jpeg, .png"
                    hidden
                  />
                </Button>

                {haveMap && (
                  <Button onClick={handleSaveButton} color="inherit">
                    <SaveIcon color="inherit"></SaveIcon>
                  </Button>
                )}

                {isConnected && (
                  <Button onClick={showKey} color="inherit">
                    Show Key
                  </Button>
                )}
                {isConnected && (
                  <TextField
                    id="connection-id"
                    onChange={(e) => setTargetConnectionId(e.target.value)}
                    label="Outlined"
                    variant="outlined"
                  />
                )}
                {isConnected && (
                  <Button onClick={join} color="inherit">
                    Join
                  </Button>
                )}
                <Button onClick={handleConnectButton} color="inherit">
                  {!isConnected
                    ? CONNECT_BUTTON_CONNECT
                    : CONNECT_BUTTON_DISCONNECT}
                </Button>
              </div>
            )}
            {!isLogged && (
              <GoogleLogin
                clientId={clientId}
                buttonText="Login"
                onSuccess={handleLoginSuccess}
                onFailure={handleLoginFailure}
                cookiePolicy={'single_host_origin'}
                responseType="code,token"
              />
            )}
          </div>
        )}
        {type === COLABORATORS_TOOLBAR && (
          <div>
            <Button variant="contained" onClick={handleButtonColaboratorsPopup}>
              Add Colaborator
            </Button>
          </div>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default AppToolbar
