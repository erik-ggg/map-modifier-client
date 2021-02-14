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
  addUserId,
  connected,
  disconnected,
  updateInRoom,
} from "../redux/slices/AppSlice"
import { useState } from "react"
import { useEffect } from "react"
import { Link } from "react-router-dom"
import Colaborators from "./colaborator/Colaborators"
import {
  COLABORATORS_TOOLBAR,
  EDITOR_TOOLBAR,
  SESSION_STORAGE_USER_KEY,
} from "../shared/constants"

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
  canvas: {
    border: "1px solid #000000",
    left: 0,
    position: "absolute",
    top: 0,
  },
  drawToolbarContainer: {
    display: "flex",
    flexDirection: "row",
    height: "7rem",
    backgroundColor: "#cfd1e3",
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  shapesContainer: {
    display: "flex",
    flexDirection: "column",
    marginLeft: "2rem",
    marginRight: "2rem",
  },
  colorsOptionsContainer: {
    display: "flex",
    flexDirection: "row",
  },
  colorsTitleClass: {
    textAlign: "center",
  },
  colorsSavesContainer: {
    textAlign: "center",
    display: "flex",
    paddingTop: "2rem",
    paddingBottom: "2rem",
  },
  colorsSavesButtonClass: {
    height: "30px",
    width: "30px",
    cursor: "pointer",
    position: "relative",
    outline: "none",
    float: "left",
    borderRadius: "4px",
    borderWidth: "0",
    margin: "0px 6px 6px 0px",
  },
  connectOptionsContainer: {
    display: "flex",
  },
  // colorsContainer: {
  //   display: "flex",
  //   flexDirection: "column",
  // },
}))

const clientId =
  "650564013529-agbmjjd0nm6cptp04aoqrmo6ijk0ae3q.apps.googleusercontent.com"

const handleLoginFailure = () => {}

let socket = null

const AppToolbar = ({ type, onOpenPopup, connect, download }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const key = useSelector((res) => res.state.userKey)
  const inRoom = useSelector((res) => res.state.inRoom)
  const buttonConnectText = useSelector((res) => res.state.buttonConnectText)
  const userId = useSelector((res) => res.state.userId)
  // const socket = useSelector((res) => res.state.socket)

  const [anchorEl, setAnchorEl] = useState(null)
  const [mapFile, setMapFile] = useState("")
  const [targetConnectionId, setTargetConnectionId] = useState("")
  const [haveMap, setHaveMap] = useState(false)
  const [userMail, setUserMail] = useState(null)

  // ***** Canvas handlers *****

  const handleConnectButton = () => {
    connect()
  }

  const join = () => {
    socket.emit("join room", { id: socket.id, targetId: targetConnectionId })
    dispatch(updateInRoom(true))
  }

  const handleLoginSuccess = (res) => {
    setUserMail(res.profileObj.email)
    dispatch(addUserId(res.googleId))
    sessionStorage.setItem(SESSION_STORAGE_USER_KEY, res.googleId)
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
    socket.emit("broadcast image", image)
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
    setHaveMap(true)
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
        {type === EDITOR_TOOLBAR && (
          <div className={classes.connectOptionsContainer}>
            {userId !== null && (
              <div>
                <input
                  type="file"
                  id="file-selector"
                  accept=".jpg, .jpeg, .png"
                  onChange={handleInputFile}
                ></input>
                <Button onClick={hadleDownloadButton} color="inherit">
                  Download
                </Button>
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
                <Button onClick={handleConnectButton} color="inherit">
                  {buttonConnectText}
                </Button>
              </div>
            )}
            <GoogleLogin
              clientId={clientId}
              buttonText="Login"
              onSuccess={handleLoginSuccess}
              onFailure={handleLoginFailure}
              cookiePolicy={"single_host_origin"}
              responseType="code,token"
            />
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
