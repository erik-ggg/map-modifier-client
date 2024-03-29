import './AppToolbar.css'

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
} from '../../redux/slices/AppSlice'
import { useState } from 'react'

import {
  APPTOOLBAR_ADD_COLABORATOR,
  APPTOOLBAR_COLABORATORS,
  APPTOOLBAR_DOWNLOAD,
  APPTOOLBAR_EDITOR,
  APPTOOLBAR_JOIN,
  APPTOOLBAR_LOAD_MAP,
  APPTOOLBAR_LOGIN,
  APPTOOLBAR_LOGOUT_BUTTON,
  APPTOOLBAR_SHOW_KEY,
  APPTOOLBAR_UPLOAD_FILE,
  CONNECT_SUCCESSFULL,
  DISCONNECT_SUCCESSFULL,
} from '../../shared/literals.js'

import { Link } from 'react-router-dom'
import {
  COLABORATORS_TOOLBAR,
  EDITOR_TOOLBAR,
  CONNECT_BUTTON_CONNECT,
  CONNECT_BUTTON_DISCONNECT,
  SESSION_STORAGE_USER,
  SESSION_STORAGE_LOGGED,
} from '../../shared/constants'
import { BROADCAST_IMAGE } from '../../shared/socket-actions'

import {
  addUser,
  addConnection,
  getUser,
  deleteConnection,
} from '../../services/api'

const useStyles = makeStyles((theme) => ({
  header: {
    backgroundColor: '#051622',
    borderColor: '#1BA098',
    color: '#1BA098',
  },
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
  loadImageState,
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
  const [targetConnectionId, setTargetConnectionId] = useState('')
  const [haveMap, setHaveMapState] = useState(false)

  const handleConnectButton = () => {
    if (isConnected) {
      deleteConnection(socket.id).then(() => {
        socket.disconnect()
        dispatch(disconnectedAction())
        dispatch(updateInRoom(false))
        toast.success(DISCONNECT_SUCCESSFULL)
      })
    } else {
      if (socket.disconnected) {
        socket.connect()
      } else {
        addConnection(user.email, socket.id).then(() => {
          dispatch(connectedAction())
          dispatch(updateInRoom(false))
          toast.success(CONNECT_SUCCESSFULL)
        })
      }
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
    }
    getUser(res.profileObj.email).then((res) => {
      if (Object.keys(res.data).length === 0) {
        addUser(user)
          .then((res) => {
            if (res.status === 200) {
              handleLoginSuccessAux(res.data.user)
            }
          })
          .catch(() => {
            toast.error('Se ha producido un error')
          })
      } else {
        handleLoginSuccessAux(res.data.user)
      }
    })
  }

  /**
   * Auxiliary method for setting the user data in the react state
   * @param {*} data user data
   */
  const handleLoginSuccessAux = (user) => {
    sessionStorage.setItem(SESSION_STORAGE_USER, JSON.stringify(user))
    sessionStorage.setItem(SESSION_STORAGE_LOGGED, true)
    dispatch(logInAction(user))
    dispatch(addUserData(user))
    toast.success(`${user.name} ${CONNECT_SUCCESSFULL}`)
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
   * Handle the load map from file action. If connected to room it will share it.
   * @param {*} event the input event
   */
  const handleInputFile = (event) => {
    const img = event.target.files[0]
    setImage(URL.createObjectURL(img))
    loadImageState()
    setHaveMapState(true)
    dispatch(setHaveMap(true))

    const reader = new FileReader()
    reader.onloadend = function () {
      emitImage(reader.result)
    }
    reader.readAsDataURL(event.target.files[0])
  }

  /**
   * Handle download button. Combine both canvas and image to get the final image.
   */
  const handleDownloadButton = () => {
    download()
  }

  const handleLoadMap = () => {
    displayLoadImagePopup()
    setHaveMapState(true) // TODO: pasar a estado redux
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

  /**
   * Deletes the session storage data and reloads the page
   */
  const handleLogoutButton = () => {
    sessionStorage.removeItem(SESSION_STORAGE_USER)
    sessionStorage.removeItem(SESSION_STORAGE_LOGGED)
    window.location.reload(false)
  }

  return (
    <AppBar className={classes.header} position="static">
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
          <MenuItem
            disabled={!isLogged || type === COLABORATORS_TOOLBAR ? true : false}
            onClick={handleLoadMap}
          >
            {APPTOOLBAR_LOAD_MAP}
          </MenuItem>
          {type === EDITOR_TOOLBAR && userId !== null && (
            <MenuItem disabled={!isLogged ? true : false}>
              <Link className="link" to="/colaborators">
                {APPTOOLBAR_COLABORATORS}
              </Link>
            </MenuItem>
          )}
          {type === COLABORATORS_TOOLBAR && (
            <MenuItem>
              <Link to="/editor" className="link">
                {APPTOOLBAR_EDITOR}
              </Link>
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
                <input
                  accept=".jpg, .jpeg, .png"
                  className={classes.input}
                  id="contained-button-file"
                  type="file"
                  hidden
                  onChange={handleInputFile}
                />
                <label
                  className={classes.connectOptionsContainer}
                  htmlFor="contained-button-file"
                >
                  <Button variant="text" component="span">
                    {APPTOOLBAR_UPLOAD_FILE}
                  </Button>
                </label>

                {haveMap && (
                  <>
                    <Button onClick={handleSaveButton} color="inherit">
                      <SaveIcon color="inherit"></SaveIcon>
                    </Button>
                    <Button onClick={handleDownloadButton} variant="text">
                      {/* <SaveIcon color="inherit"></SaveIcon> */}
                      {APPTOOLBAR_DOWNLOAD}
                    </Button>
                  </>
                )}

                {isConnected && (
                  <>
                    <Button onClick={showKey} color="inherit">
                      {APPTOOLBAR_SHOW_KEY}
                    </Button>
                    <TextField
                      className="header"
                      id="connection-id"
                      onChange={(e) => setTargetConnectionId(e.target.value)}
                      label="Paste the key here!"
                      variant="outlined"
                    />
                    <Button onClick={join} color="inherit">
                      {APPTOOLBAR_JOIN}
                    </Button>
                  </>
                )}
                <Button onClick={handleConnectButton} color="inherit">
                  {!isConnected
                    ? CONNECT_BUTTON_CONNECT
                    : CONNECT_BUTTON_DISCONNECT}
                </Button>
                <Button onClick={handleLogoutButton} color="inherit">
                  {APPTOOLBAR_LOGOUT_BUTTON}
                </Button>
              </div>
            )}
            {!isLogged && (
              <GoogleLogin
                clientId={clientId}
                buttonText={APPTOOLBAR_LOGIN}
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
            <Button
              variant="text"
              className="header"
              onClick={handleButtonColaboratorsPopup}
            >
              {APPTOOLBAR_ADD_COLABORATOR}
            </Button>
          </div>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default AppToolbar
