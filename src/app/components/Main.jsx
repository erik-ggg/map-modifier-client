import AppToolbar from './AppToolbar'
import { EDITOR_TOOLBAR } from '../shared/constants'
import { useDispatch, useSelector } from 'react-redux'
import { Divider, Grid, makeStyles } from '@material-ui/core'
import { TwitterPicker } from 'react-color'
import { useEffect, useState } from 'react'
import axios from 'axios'
import {
  addKey,
  connectedAction,
  disconnectedAction,
  updateInRoom,
  setIsHost,
  setHaveMap,
} from '../redux/slices/AppSlice'
import { io } from 'socket.io-client'
import toast, { Toaster } from 'react-hot-toast'
import {
  LOGIN_SUCCESSFULL,
  CONNECT_SUCCESSFULL,
  DISCONNECT_SUCCESSFULL,
} from '../utils/literals.js'

import {
  BROADCAST_DRAWING,
  RECEIVING_DRAWING,
  SHARE_DRAW_CONFIG,
} from '../shared/socket-actions'

let prevPos = { offsetX: 0, offsetY: 0 }
let line = []
let color0, color1, color2, color3, color4
let colors = []
let canvas
let image

const useStyles = makeStyles((theme) => ({
  mapContainer: {
    display: 'flex',
    position: 'relative',
  },

  canvas: {
    border: '1px solid #000000',
    left: 0,
    position: 'absolute',
    top: 0,
  },
  colorsContainer: {
    display: 'flex',
    flexDirection: 'column',
  },
  colorsOptionsContainer: {
    display: 'flex',
    flexDirection: 'row',
  },
  colorsSavesContainer: {
    textAlign: 'center',
    display: 'flex',
    padding: '2rem 9px',
  },
  colorsSavesButtonClass: {
    height: '30px',
    width: '30px',
    cursor: 'pointer',
    position: 'relative',
    outline: 'none',
    float: 'left',
    borderRadius: '4px',
    borderWidth: '0',
    margin: '0px 6px 6px 0px',
  },
  colorsTitleClass: {
    textAlign: 'center',
  },
  drawToolbarContainer: {
    display: 'flex',
    flexDirection: 'row',
    height: '7rem',
    backgroundColor: '#cfd1e3',
    border: `1px solid ${theme.palette.divider}`,
    borderRadius: theme.shape.borderRadius,
  },
  shapesContainer: {
    display: 'flex',
    flexDirection: 'column',
    marginLeft: '2rem',
    marginRight: '2rem',
  },
}))

const Main = ({ socket, setSocket }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const roomKey = useSelector((res) => res.state.roomKey)
  const inRoom = useSelector((res) => res.state.inRoom)
  const haveMap = useSelector((res) => res.state.haveMap)
  const user = useSelector((res) => res.state.user)
  const isConnected = useSelector((res) => res.state.isConnected)
  const isHost = useSelector((res) => res.state.isHost)
  // const mapFile = useSelector((res) => res.state.img)

  const [mapFile, setMapFile] = useState('')
  const [ctx, setCtx] = useState(null)
  const [isPainting, setIsPainting] = useState(false)
  const [nextColor, setNextColor] = useState(0)
  const [drawingFigure, setDrawingFigure] = useState(0)
  const [drawConfig, setDrawConfig] = useState({
    lineJoin: 'round',
    lineWidth: 2,
    strokeStyle: 'black',
  })

  useEffect(() => {
    const ctxAux = canvas.getContext('2d')
    // ctxAux.strokeStyle = drawConfig.strokeStyle
    // ctxAux.lineJoin = drawConfig.lineJoin
    // ctxAux.lineWidth = drawConfig.lineWidth
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
      draw(prevPos, offSetData)
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

  const emitDrawing = (prevPos, currPos, room, drawConfig) => {
    socket.emit(BROADCAST_DRAWING, {
      prevPos: prevPos,
      currPos: currPos,
      room,
      drawConfig,
    })
  }

  const draw = (prevPosParam, currPos, config) => {
    const { offsetX: x, offsetY: y } = prevPosParam
    const { offsetX, offsetY } = currPos

    if (inRoom) {
      emitDrawing(
        prevPosParam,
        currPos,
        roomKey !== null ? roomKey : socket.id,
        drawConfig
      )
    }

    console.log('----- SHARE_DRAW_CONFIG:', ctx)
    if (config) {
      ctx.strokeStyle = config.strokeStyle
      ctx.lineWidth = config.lineWidth
    }

    ctx.beginPath()
    // Move the the prevPosition of the mouse
    ctx.moveTo(x, y)
    // Draw a line to the current position of the mouse
    ctx.lineTo(offsetX, offsetY)
    ctx.closePath()
    // Visualize the line using the strokeStyle
    ctx.stroke()

    if (config) {
      ctx.strokeStyle = drawConfig.strokeStyle
      ctx.lineWidth = drawConfig.lineWidth
    }
    console.log('----- SHARE_DRAW_CONFIG:', ctx)

    prevPos = { offsetX, offsetY }
  }

  const disconnect = () => {
    socket.close()
    dispatch(updateInRoom(false))
  }

  const connect = () => {
    if (isConnected) {
      socket.close()
      dispatch(updateInRoom(false))
    } else {
      if (socket.disconnected) {
        socket.connect()
      }

      if (user) {
        socket.emit('connected')
        // socket = io('http://localhost:4000', {
        //   reconnectionDelayMax: 10000,
        //   reconnectionAttempts: 5,
        // })

        // setSocket(socket)
        console.log(socket)

        socket.on('connected', () => {
          axios
            .post(`http://localhost:4000/api/users`, {
              name: user.name,
              email: user.email,
              socketId: socket.id,
            })
            .then((res) => {
              console.log(res)
              // setSocket(socket)
              // handleSetSocket(socket)
              dispatch(connectedAction())
              toast.success(CONNECT_SUCCESSFULL)
            })
        })

        socket.on('disconnect', () => {
          toast.success(DISCONNECT_SUCCESSFULL)
          dispatch(disconnectedAction())
        })

        socket.on('broadcast res', (res) => {
          console.log('broadcast res', res)
        })

        socket.on('receiving image', (res) => {
          dispatch(setHaveMap(true))
          setMapFile(res.image)
          // setHaveMap(res)
        })

        socket.on(RECEIVING_DRAWING, (res) => {
          console.log('----- SHARE_DRAW_CONFIG:', res.drawConfig)
          draw(res.prevPos, res.currPos, res.drawConfig)
        })

        socket.on('user joined', () => {
          dispatch(setIsHost(true))
          dispatch(updateInRoom(true))
          if (haveMap) {
            socket.emit(
              'broadcast image',
              mapFile,
              roomKey !== null ? roomKey : socket.id
            )
          }
          socket.emit(
            SHARE_DRAW_CONFIG,
            drawConfig,
            roomKey !== null ? roomKey : socket.id
          )
          toast('User joined!', {
            icon: '🙋‍♀️',
          })
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

        socket.on(SHARE_DRAW_CONFIG, (config) => {
          console.log('RECEIVE: SHARE_DRAW_CONFIG', config)
          setDrawConfig(config)
          setCanvasContextConfig(config)
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
    drawConfig.strokeStyle = color.hex
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

  /**
   * Set canvas context draw options
   * @param {*} config the config that will be used to draw
   */
  const setCanvasContextConfig = (config) => {
    ctx.strokeStyle = config.strokeStyle
    ctx.lineJoin = config.lineJoin
    ctx.lineWidth = config.lineWidth
  }

  const restoreSavedColor = (button) => {
    ctx.strokeStyle = button.style.backgroundColor
  }

  const setLineWidth = (width) => {
    ctx.lineWidth = width
    drawConfig.lineWidth = width
  }

  /**
   * Handle download button. Combine both canvas and image to get the final image.
   */
  const download = () => {
    // create new canvas ankd set properties
    const canvasAux = document.createElement('canvas')
    canvasAux.width = canvas.width
    canvasAux.height = canvas.height

    // get new canvas context and draw first the img, then the old canvas draw
    const ctxAux = canvasAux.getContext('2d')
    ctxAux.drawImage(image, 0, 0)
    ctxAux.drawImage(canvas, 0, 0)

    // create and download img
    const link = document.createElement('a')
    link.download = 'map_modified.png'
    link.href = canvasAux.toDataURL()
    link.click()
  }

  const setImage = (image) => {
    setMapFile(image)
  }

  return (
    <div>
      <Toaster position="top-center" reverseOrder={false} />
      <AppToolbar
        type={EDITOR_TOOLBAR}
        connect={connect}
        disconnect={disconnect}
        download={download}
        socket={socket}
        setImage={setImage}
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
            <button onClick={() => setLineWidth(2)}>Line 1</button>
            <button onClick={() => setLineWidth(4)}>Line 2</button>
            <button onClick={() => setLineWidth(6)}>Line 3</button>
            <button onClick={() => setLineWidth(8)}>Line 4</button>
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
