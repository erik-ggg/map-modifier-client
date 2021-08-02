import "../../App.css"
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

import { GoogleLogin } from "react-google-login"
import { io } from "socket.io-client"
import axios from "axios"

import { useDispatch, useSelector } from "react-redux"
import {
  addKey,
  addUserEmail,
  addUserId,
  addUserName,
  connectedAction,
  disconnectedAction,
  setImage,
  setHaveMap,
  updateInRoom,
  addUserData,
  logInAction,
} from "../redux/slices/AppSlice"
import { useState } from "react"
import { useEffect } from "react"
import { Link } from "react-router-dom"
import Colaborators from "./colaborator/Colaborators"
import {
  COLABORATORS_TOOLBAR,
  EDITOR_TOOLBAR,
  SESSION_STORAGE_USER_KEY,
  SESSION_STORAGE_USER_ID,
  CONNECT_BUTTON_CONNECT,
  CONNECT_BUTTON_DISCONNECT,
} from "../shared/constants"
import Main from "./Main"

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
    display: "flex",
  },
  connectOptionsContainerAux: {
    display: "flex",
  },
}))

const clientId =
  "650564013529-agbmjjd0nm6cptp04aoqrmo6ijk0ae3q.apps.googleusercontent.com"

const handleLoginFailure = () => {}

// let socket = null

const AppToolbar = ({
  type,
  onOpenPopup,
  connect,
  disconnect,
  download,
  socket,
}) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const key = useSelector((res) => res.state.userKey)
  const inRoom = useSelector((res) => res.state.inRoom)
  const buttonConnectText = useSelector((res) => res.state.buttonConnectText)
  const userId = useSelector((res) => res.state.userId)
  const user = useSelector((res) => res.state.user)
  const isConnected = useSelector((res) => res.state.isConnected)
  const isLogged = useSelector((res) => res.state.isLogged)

  const [anchorEl, setAnchorEl] = useState(null)
  // const [connected, setConnected] = useState(false)
  const [logged, setLogged] = useState(false)
  const [mapFile, setMapFile] = useState("")
  const [targetConnectionId, setTargetConnectionId] = useState("")
  const [haveMap, setHaveMapState] = useState(false)
  const [userMail, setUserMail] = useState(null)

  const handleConnectButton = () => {
    if (isConnected) {
      // setConnected(false)
      disconnect()
    } else {
      // setConnected(true)
      connect()
    }
  }

  const join = () => {
    socket.emit("join room", { id: socket.id, targetId: targetConnectionId })
    dispatch(updateInRoom(true))
  }

  const handleLoginSuccess = (res) => {
    // setLogged(true)
    const user = {
      name: res.profileObj.name,
      email: res.profileObj.email,
      id: res.googleId,
    }
    dispatch(addUserData(user))
    dispatch(logInAction())
    // setUserMail(res.profileObj.email)
    sessionStorage.setItem(SESSION_STORAGE_USER_KEY, res.googleId)
    sessionStorage.setItem(SESSION_STORAGE_USER_ID, res.profileObj.name)
    connect()
  }

  const showKey = () => {
    alert(`User key: ${key}, copied to clipboard`)
    const el = document.createElement("textarea")
    el.value = key
    document.body.appendChild(el)
    el.select()
    document.execCommand("copy")
    document.body.removeChild(el)
  }

  const emitImage = (image) => {
    if (image) {
      socket.emit("broadcast image", image)
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
    setMapFile(URL.createObjectURL(img))
    setHaveMapState(true)
    dispatch(setHaveMap(true))

    if (inRoom) {
      const reader = new FileReader()
      reader.onloadend = function () {
        emitImage(reader.result)
      }
      reader.readAsDataURL(event.target.files[0])
    }
  }

  const handleLoadMap = () => {
    setAnchorEl(null)
  }

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
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
        {/* {type === EDITOR_TOOLBAR && (
          <div className={classes.connectOptionsContainer}>
            {userId !== null && (
              <div className={classes.connectOptionsContainerAux}>
                {isLogged && (
                  <input
                    type="file"
                    id="file-selector"
                    accept=".jpg, .jpeg, .png"
                    onChange={handleInputFile}
                  ></input>
                )}
                {isLogged && (
                  <Button onClick={hadleDownloadButton} color="inherit">
                    Download
                  </Button>
                )}
                {buttonConnectText === "Disconnect" && (
                  <Button onClick={showKey} color="inherit">
                    Show Key
                  </Button>
                )}
                {buttonConnectText === "Disconnect" && (
                  <TextField
                    id="connection-id"
                    onChange={(e) => setTargetConnectionId(e.target.value)}
                    label="Outlined"
                    variant="outlined"
                  />
                )}
                {buttonConnectText === "Disconnect" && (
                  <Button onClick={join} color="inherit">
                    Join
                  </Button>
                )}
                {logged && (
                  <Button onClick={handleConnectButton} color="inherit">
                    {buttonConnectText}
                  </Button>
                )}
              </div>
            )}
            {!logged && (
              <GoogleLogin
                clientId={clientId}
                buttonText="Login"
                onSuccess={handleLoginSuccess}
                onFailure={handleLoginFailure}
                cookiePolicy={"single_host_origin"}
                responseType="code,token"
              />
            )}
          </div>
        )} */}
        {type === EDITOR_TOOLBAR && (
          <div className={classes.connectOptionsContainer}>
            {isLogged && (
              <div className={classes.connectOptionsContainerAux}>
                <Button
                  variant="contained"
                  onClick={handleInputFile}
                  component="label"
                >
                  Upload File
                  <input type="file" accept=".jpg, .jpeg, .png" hidden />
                </Button>
                <Button onClick={hadleDownloadButton} color="inherit">
                  Download
                </Button>
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
                cookiePolicy={"single_host_origin"}
                responseType="code,token"
              />
            )}
          </div>
        )}
        {type === COLABORATORS_TOOLBAR && (
          <div>
            <Button onClick={handleButtonColaboratorsPopup}>
              Add Colaborator
            </Button>
          </div>
        )}
      </Toolbar>
    </AppBar>
  )
}

export default AppToolbar
