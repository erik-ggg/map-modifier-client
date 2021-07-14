import AppToolbar from "./AppToolbar"
import { EDITOR_TOOLBAR } from "../shared/constants"
import { useDispatch, useSelector } from "react-redux"
import { Divider, Grid, makeStyles } from "@material-ui/core"
import { TwitterPicker } from "react-color"
import { useEffect, useState } from "react"
import axios from "axios"
import {
  addKey,
  connected,
  disconnected,
  updateInRoom,
  setHaveMap,
} from "../redux/slices/AppSlice"
import { io } from "socket.io-client"
import toast, { Toaster } from "react-hot-toast"
import {
  LOGIN_SUCCESSFULL,
  CONNECT_SUCCESSFULL,
  DISCONNECT_SUCCESSFULL,
} from "../utils/literals.js"

let prevPos = { offsetX: 0, offsetY: 0 }
let line = []
let userStrokeStyle = "#EE92C2"
let color0, color1, color2, color3, color4
let colors = []
let canvas
let image
let socket = null

const useStyles = makeStyles((theme) => ({
  mapContainer: {
    display: "flex",
    position: "relative",
  },

  canvas: {
    border: "1px solid #000000",
    left: 0,
    position: "absolute",
    top: 0,
  },
  colorsContainer: {
    display: "flex",
    flexDirection: "column",
  },
  colorsOptionsContainer: {
    display: "flex",
    flexDirection: "row",
  },
  colorsSavesContainer: {
    textAlign: "center",
    display: "flex",
    padding: "2rem 9px",
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
  colorsTitleClass: {
    textAlign: "center",
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
}))

const Main = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const inRoom = useSelector((res) => res.state.inRoom)
  const haveMap = useSelector((res) => res.state.haveMap)
  const buttonConnectText = useSelector((res) => res.state.buttonConnectText)
  const [userId, setUserId] = useState(null)
  const userEmail = useSelector((res) => res.state.userEmail)
  const userName = useSelector((res) => res.state.userName)
  // const mapFile = useSelector((res) => res.state.img)

  const [mapFile, setMapFile] = useState("")
  const [ctx, setCtx] = useState(null)
  const [isPainting, setIsPainting] = useState(false)
  const [nextColor, setNextColor] = useState(0)
  const [drawingFigure, setDrawingFigure] = useState(0)

  useEffect(() => {
    const ctxAux = canvas.getContext("2d")
    ctxAux.strokeStyle = "red"
    ctxAux.lineJoin = "round"
    ctxAux.lineWidth = 5
    setCtx(ctxAux)
  }, [ctx])

  // const connect = () => {
  //   if (buttonConnectText === "Disconnect") {
  //     socket.close()
  //     dispatch(updateInRoom(false))
  //   } else {
  //     socket = io("http://localhost:4000", {
  //       reconnectionDelayMax: 10000,
  //       reconnectionAttempts: 5,
  //     })
  //     // dispatch(setSocket(socket))
  //     dispatch(updateInRoom(true))

  //     socket.on("connected", () => {
  //       dispatch(addKey(socket.id))
  //       dispatch(connected())
  //       socket.emit("join room", { id: socket.id, targetId: socket.id })
  //       axios
  //         .post(`http://localhost:4000/api/users`, {
  //           userId: userId,
  //           socketId: socket.id,
  //           email: userMail,
  //         })
  //         .then((res) => {
  //           console.log(res)
  //         })
  //     })

  //     socket.on("disconnect", () => {
  //       console.log(socket.connected)
  //       dispatch(disconnected())
  //     })

  //     socket.on("broadcast res", (res) => {
  //       console.log("broadcast res", res)
  //     })

  //     socket.on("receiving image", (res) => {
  //       console.log("receiving image", res)
  //       // setMapFile(`data:image/jpg;base64,${res}`)
  //       setMapFile(res)
  //     })

  //     socket.on("receiving drawing", (res) => {
  //       // draw(res.prevPos, res.currPos)
  //     })

  //     socket.on("user joined", () => {})
  //   }
  // }

  const test = () => {
    console.log("test")
  }

  const handleImageLoaded = () => {
    canvas.height = image.height
    canvas.width = image.width
  }

  const onMouseDown = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent
    setIsPainting(true)
    prevPos = { offsetX, offsetY }
  }

  const onMouseMove = ({ nativeEvent }) => {
    if (isPainting && drawingFigure === 0) {
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

  const endPaintEvent = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent

    if (isPainting) {
      setIsPainting(false)
    }

    if (drawingFigure === 1) {
      setDrawingFigure(0)
      ctx.moveTo(prevPos.offsetX, prevPos.offsetY)
      ctx.lineTo(offsetX, offsetY)
      ctx.stroke()
    } else if (drawingFigure === 2) {
      ctx.beginPath()
      ctx.rect(
        prevPos.offsetX,
        prevPos.offsetY,
        offsetX - prevPos.offsetX,
        offsetY - prevPos.offsetY
      )
      ctx.stroke()
    } else if (drawingFigure === 3) {
      setDrawingFigure(0)
      const r = Math.sqrt(
        Math.pow(offsetX - prevPos.offsetX, 2) +
          Math.pow(offsetY - prevPos.offsetY, 2)
      )
      ctx.beginPath()
      ctx.arc(prevPos.offsetX, prevPos.offsetY, r, 0, 2 * Math.PI)
      ctx.stroke()
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

  //   const showKey = () => {
  //     alert(`User key: ${key}, copied to clipboard`)
  //     const el = document.createElement("textarea")
  //     el.value = key
  //     document.body.appendChild(el)
  //     el.select()
  //     document.execCommand("copy")
  //     document.body.removeChild(el)
  //   }

  const connect = () => {
    if (buttonConnectText === "Disconnect") {
      socket.close()
      dispatch(updateInRoom(false))
    } else {
      if (userName && userEmail) {
        socket = io("http://localhost:4000", {
          reconnectionDelayMax: 10000,
          reconnectionAttempts: 5,
        })
        dispatch(updateInRoom(true))

        socket.on("connected", () => {
          dispatch(addKey(socket.id))
          dispatch(connected())
          socket.emit("join room", { id: socket.id, targetId: socket.id })
          axios
            .post(`http://localhost:4000/api/users`, {
              userId: userName,
              socketId: socket.id,
              email: userEmail,
            })
            .then((res) => {
              toast.success(CONNECT_SUCCESSFULL)
              console.log(res)
            })
        })

        socket.on("disconnect", () => {
          toast.success(DISCONNECT_SUCCESSFULL)
          dispatch(disconnected())
        })

        socket.on("broadcast res", (res) => {
          console.log("broadcast res", res)
        })

        socket.on("receiving image", (res) => {
          setMapFile(res)
          // setHaveMap(res)
        })

        socket.on("receiving drawing", (res) => {
          draw(res.prevPos, res.currPos)
        })

        socket.on("user joined", () => {
          console.log("user joined!")
        })
      } else {
        //@todo: throw error
      }
    }
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

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <AppToolbar
        type={EDITOR_TOOLBAR}
        connect={connect}
        download={download}
        socket={socket}
      />
      {haveMap && (
        <Grid
          container
          alignItems="center"
          className={classes.drawToolbarContainer}
        >
          <div className={classes.shapesContainer}>
            Shapes
            <button onClick={() => setDrawingFigure(1)}>Line</button>
            <button onClick={() => setDrawingFigure(2)}>Rectangle</button>
            <button onClick={() => setDrawingFigure(3)}>Circle</button>
          </div>
          <Divider orientation="vertical" flexItem />
          <div className={classes.shapesContainer}>
            Size
            <button onClick={() => (ctx.lineWidth = 2)}>Line 1</button>
            <button onClick={() => (ctx.lineWidth = 4)}>Line 2</button>
            <button onClick={() => (ctx.lineWidth = 6)}>Line 3</button>
            <button onClick={() => (ctx.lineWidth = 8)}>Line 4</button>
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
              {/* <div className={classes.colorsTitleClass}>Color</div> */}
            </div>
            {/* <div className={classes.colorsTitleClass}>Color</div> */}
          </div>
        </Grid>
      )}
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

export default Main
