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

import { useDispatch, useSelector } from "react-redux"
import {
  addKey,
  connected,
  disconnected,
  updateInRoom,
} from "./app/redux/slices/AppSlice"
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
  // colorsContainer: {
  //   display: "flex",
  //   flexDirection: "column",
  // },
}))

const clientId =
  "650564013529-agbmjjd0nm6cptp04aoqrmo6ijk0ae3q.apps.googleusercontent.com"

const handleLoginFailure = () => {}
let socket
let prevPos = { offsetX: 0, offsetY: 0 }
let line = []
let userStrokeStyle = "#EE92C2"
let canvas
let image
let color0, color1, color2, color3, color4
let colors = []

const App = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const key = useSelector((res) => res.state.userKey)
  const inRoom = useSelector((res) => res.state.inRoom)
  const buttonConnectText = useSelector((res) => res.state.buttonConnectText)

  const [anchorEl, setAnchorEl] = useState(null)
  const [ctx, setCtx] = useState(null)
  const [isPainting, setIsPainting] = useState(false)
  const [mapFile, setMapFile] = useState("")
  const [targetConnectionId, setTargetConnectionId] = useState("")
  const [haveMap, setHaveMap] = useState(false)
  const [nextColor, setNextColor] = useState(0)

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

  /**
   * Handle download button. Combine both canvas and image to get the final image.
   */
  const download = () => {
    // save canvas draw
    const canvasDraw = canvas.toDataURL()
    const imgDraw = new Image()
    imgDraw.src = canvasDraw

    // combine both canvas
    ctx.drawImage(image, 0, 0)
    ctx.globalAlpha = 0.5
    ctx.drawImage(imgDraw, 0, 0)
    const compositedImg = canvas.toDataURL()

    // download
    const link = document.createElement("a")
    link.download = "map_modified.png"
    link.href = compositedImg
    link.click()
  }

  const join = () => {
    socket.emit("join room", { id: socket.id, targetId: targetConnectionId })
    dispatch(updateInRoom(true))
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

  /**
   * Handle the load map from file action. If connected to room it will share it.
   * @param {*} event the input event
   */
  const handleInputFile = (event) => {
    const img = event.target.files[0]
    setMapFile(URL.createObjectURL(img))
    setHaveMap(true)

    if (inRoom) {
      const reader = new FileReader()
      reader.onloadend = function () {
        emitImage(reader.result)
      }
      reader.readAsDataURL(event.target.files[0])
    }
  }

  const handleImageLoaded = () => {
    canvas.height = image.height
    canvas.width = image.width
  }

  const emitImage = (image) => {
    socket.emit("broadcast image", image)
  }

  /**
   * Saves the color selected by the user in the color picker storing it inside the button css.
   * Also, changes the canvas context color
   * @param {*} color the selected color
   */
  const saveColor = (color) => {
    ctx.strokeStyle = color.hex
    colors[nextColor] = color.hex
    switch (nextColor) {
      case 0:
        color0.style.backgroundColor = color.hex
        break
      case 1:
        color1.style.backgroundColor = color.hex
        break
      case 2:
        color2.style.backgroundColor = color.hex
        break
      case 3:
        color3.style.backgroundColor = color.hex
        break
      case 4:
        color4.style.backgroundColor = color.hex
        break

      default:
        break
    }
    if (nextColor + 1 > 4) setNextColor(0)
    else setNextColor(nextColor + 1)
  }

  const restoreSavedColor = (button) => {
    ctx.strokeStyle = button.style.backgroundColor
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
          <Button onClick={download} color="inherit">
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
      </AppBar>
      <Grid
        container
        alignItems="center"
        className={classes.drawToolbarContainer}
      >
        <div className={classes.shapesContainer}>
          Shapes
          <button>Rectangle</button>
          <button>Circle</button>
        </div>
        <Divider orientation="vertical" flexItem />
        <div className={classes.shapesContainer}>
          Size
          <button>Line 1</button>
          <button>Line 2</button>
          <button>Line 3</button>
          <button>Line 4</button>
        </div>
        <Divider orientation="vertical" flexItem />
        <div className={classes.colorsContainer}>
          <div className={classes.colorsOptionsContainer}>
            <TwitterPicker triangle="hide" onChangeComplete={saveColor} />
            <div className={classes.colorsSavesContainer}>
              <button
                className={classes.colorsSavesButtonClass}
                onClick={() => {
                  restoreSavedColor(color0)
                }}
                ref={(ref) => (color0 = ref)}
              ></button>
              <button
                className={classes.colorsSavesButtonClass}
                onClick={() => {
                  restoreSavedColor(color1)
                }}
                ref={(ref) => (color1 = ref)}
              ></button>
              <button
                className={classes.colorsSavesButtonClass}
                onClick={() => {
                  restoreSavedColor(color2)
                }}
                ref={(ref) => (color2 = ref)}
              ></button>
              <button
                className={classes.colorsSavesButtonClass}
                onClick={() => {
                  restoreSavedColor(color3)
                }}
                ref={(ref) => (color3 = ref)}
              ></button>
              <button
                className={classes.colorsSavesButtonClass}
                onClick={() => {
                  restoreSavedColor(color4)
                }}
                ref={(ref) => (color4 = ref)}
              ></button>
            </div>
          </div>
          <div className={classes.colorsTitleClass}>Color</div>
        </div>
      </Grid>
      {/* <div className={classes.drawToolbarContainer}>

      </div> */}
      <div className={classes.mapContainer} id="map-container">
        <img
          ref={(ref) => (image = ref)}
          hidden={!haveMap}
          src={mapFile}
          alt="map"
          onLoad={handleImageLoaded}
          id="mapImage"
        />
        <canvas
          id="mapCanvas"
          hidden={!haveMap}
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
