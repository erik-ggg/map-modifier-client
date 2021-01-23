import logo from "./logo.svg"
import "./App.css"
import { BrowserRouter, Redirect, Route } from "react-router-dom"
import Main from "./app/components/Main"
import { Router } from "@material-ui/icons"
import {
  AppBar,
  Button,
  IconButton,
  makeStyles,
  Menu,
  MenuItem,
  Switch,
  TextField,
  Toolbar,
  Typography,
} from "@material-ui/core"
import MenuIcon from "@material-ui/icons/Menu"

import { GoogleLogin, GoogleLogout } from "react-google-login"
import { io } from "socket.io-client"

import { useDispatch, useSelector } from "react-redux"
import {
  addKey,
  connected,
  disconnected,
  updateInRoom,
} from "./app/redux/slices/AppSlice"
import { selectUserKey } from "./app/redux/selectors/selectors"
import { useState } from "react"
import { useEffect } from "react"

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
  mapContainer: {
    position: "relative",
  },
}))

const clientId =
  "650564013529-agbmjjd0nm6cptp04aoqrmo6ijk0ae3q.apps.googleusercontent.com"

const handleLoginFailure = () => {}
let socket
let prevPos = { offsetX: 0, offsetY: 0 }
let line = []
let userStrokeStyle = "#EE92C2"
let canvas

const App = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const key = useSelector((res) => res.state.userKey)
  const inRoom = useSelector((res) => res.state.inRoom)
  const buttonConnectText = useSelector((res) => res.state.buttonConnectText)

  const [anchorEl, setAnchorEl] = useState(null)
  const [ctx, setCtx] = useState(null)
  const [example, setExample] = useState("")
  const [isPainting, setIsPainting] = useState(false)
  const [mapFile, setMapFile] = useState("")
  const [targetConnectionId, setTargetConnectionId] = useState("")

  // ***** Canvas handlers *****

  useEffect(() => {
    const ctxAux = canvas.getContext("2d")
    ctxAux.strokeStyle = "red"
    ctxAux.lineJoin = "round"
    ctxAux.lineWidth = 5
    setCtx(ctxAux)
  }, [ctx])

  const onMouseDown = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent
    setIsPainting(true)
    prevPos = { offsetX, offsetY }
  }

  const onMouseMove = ({ nativeEvent }) => {
    if (isPainting) {
      const { offsetX, offsetY } = nativeEvent
      const offSetData = { offsetX, offsetY }
      // Set the start and stop position of the paint event.
      // const positionData = {
      //   start: { ...prevPos },
      //   stop: { ...offSetData },
      // }
      // Add the position to the line array
      // line = line.concat(positionData)
      draw(prevPos, offSetData, userStrokeStyle)
    }
  }

  const endPaintEvent = () => {
    if (isPainting) {
      setIsPainting(false)
    }
  }

  const emitDrawing = (prevPos, currPos) => {
    socket.emit("broadcast drawing", { prevPos: prevPos, currPos: currPos })
  }

  const draw = (prevPosParam, currPos) => {
    const { offsetX: x, offsetY: y } = prevPosParam
    const { offsetX, offsetY } = currPos
    if (inRoom) {
      emitDrawing(prevPosParam, currPos)
    }

    console.log(prevPosParam, currPos)
    // ctx.save()
    ctx.beginPath()
    // Move the the prevPosition of the mouse
    ctx.moveTo(x, y)
    // Draw a line to the current position of the mouse
    ctx.lineTo(offsetX, offsetY)
    ctx.closePath()
    // Visualize the line using the strokeStyle
    ctx.stroke()
    // ctx.restore()
    prevPos = { offsetX, offsetY }
  }

  const handleLoginSuccess = () => {
    // dispatch(addKey(generateRandomKey()))
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

  const connect = () => {
    if (buttonConnectText === "Disconnect") {
      socket.close()
      dispatch(updateInRoom(false))
    } else {
      socket = io("http://localhost:4000", {
        reconnectionDelayMax: 10000,
        reconnectionAttempts: 5,
      })
      dispatch(updateInRoom(true))

      socket.on("connected", () => {
        console.log(socket.connected)
        dispatch(addKey(socket.id))
        dispatch(connected())
        socket.emit("join room", { id: socket.id, targetId: socket.id })
      })

      socket.on("disconnect", () => {
        console.log(socket.connected)
        dispatch(disconnected())
      })

      socket.on("broadcast res", (res) => {
        console.log("broadcast res", res)
        setExample(res)
      })

      socket.on("receiving image", (res) => {
        console.log("receiving image", res)
        // setMapFile(`data:image/jpg;base64,${res}`)
        setMapFile(res)
      })

      socket.on("receiving drawing", (res) => {
        draw(res.prevPos, res.currPos)
      })

      socket.on("user joined", () => {})
    }
  }

  const join = () => {
    socket.emit("join room", { id: socket.id, targetId: targetConnectionId })
    dispatch(updateInRoom(true))
  }

  const emitExample = (data) => {
    setExample(data)
    socket.emit("broadcast req", data)
  }

  const handleMenuClick = (event) => {
    setAnchorEl(event.currentTarget)
  }

  const handleMenuClose = () => {
    setAnchorEl(null)
  }

  const handleLoadMap = () => {
    setAnchorEl(null)
  }

  const handleInputFile = (event) => {
    const img = event.target.files[0]
    setMapFile(URL.createObjectURL(img))

    if (inRoom) {
      const reader = new FileReader()
      reader.onloadend = function () {
        emitImage(reader.result)
      }
      reader.readAsDataURL(event.target.files[0])
    }
  }

  const handleImageLoaded = () => {
    const imgHtmlEl = document.getElementById("mapImage")
    const mapCanvas = document.getElementById("mapCanvas")
    mapCanvas.height = imgHtmlEl.height
    mapCanvas.width = imgHtmlEl.width
  }

  const emitImage = (image) => {
    socket.emit("broadcast image", image)
  }

  return (
    <div className={classes.root}>
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
          </Menu>
          <Typography variant="h6" className={classes.title}>
            Editor
          </Typography>
          <input
            type="file"
            id="file-selector"
            accept=".jpg, .jpeg, .png"
            onChange={handleInputFile}
          ></input>
          <Button onClick={showKey} color="inherit">
            Show Key
          </Button>
          <TextField
            id="connection-id"
            onChange={(e) => setTargetConnectionId(e.target.value)}
            label="Outlined"
            variant="outlined"
          />
          <Button onClick={join} color="inherit">
            Join
          </Button>
          <Button onClick={connect} color="inherit">
            {buttonConnectText}
          </Button>
          <GoogleLogin
            clientId={clientId}
            buttonText="Login"
            onSuccess={handleLoginSuccess}
            onFailure={handleLoginFailure}
            cookiePolicy={"single_host_origin"}
            responseType="code,token"
          />
        </Toolbar>
        <TextField
          label="Outlined"
          variant="outlined"
          onChange={(e) => emitExample(e.target.value)}
          value={example}
        />
      </AppBar>
      <div className={classes.mapContainer} id="map-container">
        <img src={mapFile} alt="map" onLoad={handleImageLoaded} id="mapImage" />
        <canvas
          id="mapCanvas"
          width="200"
          height="100"
          className={classes.canvas}
          ref={(ref) => (canvas = ref)}
          onMouseDown={onMouseDown}
          onMouseLeave={endPaintEvent}
          onMouseUp={endPaintEvent}
          onMouseMove={onMouseMove}
        ></canvas>
      </div>
    </div>
  )
}

export default App
