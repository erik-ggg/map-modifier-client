import AppToolbar from './appToolbar/AppToolbar'
import PopupSaveImage from './popup-save-image/PopupSaveImage'

import './Main.css'
import { EDITOR_TOOLBAR } from '../shared/constants'
import { useDispatch, useSelector } from 'react-redux'
import { Button, Divider, Grid, makeStyles } from '@material-ui/core'
import { CompactPicker } from 'react-color'
import { useEffect, useState } from 'react'
import { updateInRoom, setIsHost, setHaveMap } from '../redux/slices/AppSlice'
import toast from 'react-hot-toast'

import {
  BROADCAST_DRAWING,
  BROADCAST_IMAGE,
  END_DRAWING,
  RECEIVING_DRAWING,
  RECEIVING_IMAGE,
  SEND_IMAGE_AND_CANVAS_TO_CLIENT,
  SHARE_DRAW_CONFIG,
  START_DRAWING,
} from '../shared/socket-actions'
import { getUserImagesFromDB, saveImageApi } from '../services/api'
import PopupLoadImage from './popup-load-image/PopupLoadImage'

let prevPos = { offsetX: 0, offsetY: 0 }
// let line = []
let color0, color1, color2, color3, color4
let colors = []
let canvas
let image
let canvasCtx

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

const Main = ({ socket }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const roomKey = useSelector((res) => res.state.roomKey)
  const inRoom = useSelector((res) => res.state.inRoom)
  const haveMap = useSelector((res) => res.state.haveMap)
  const user = useSelector((res) => res.state.user)
  // const isConnected = useSelector((res) => res.state.isConnected)
  // const isHost = useSelector((res) => res.state.isHost)
  // const mapFile = useSelector((res) => res.state.img)
  const [imageLoaded, setImageLoaded] = useState(false)
  const [mapFile, setMapFile] = useState(null)
  const [ctx, setCtx] = useState(null)
  const [isPainting, setIsPainting] = useState(false)
  const [nextColor, setNextColor] = useState(0)
  const [drawingFigure, setDrawingFigure] = useState(0)
  const [isErasing, setIsErasing] = useState(false)
  // const [haveMapAux, setHaveMapAux] = useState(null)
  const [drawConfig, setDrawConfig] = useState({
    lineJoin: 'round',
    lineWidth: 2,
    strokeStyle: 'black',
  })
  const [isSaveImageDialogOpen, setIsSaveImageDialogOpen] = useState(false)
  const [isLoadImageDialogOpen, setIsLoadImageDialogOpen] = useState(false)
  const [userSavedImages, setUserSavedImages] = useState([])

  useEffect(() => {
    console.log(haveMap)
  }, [haveMap])

  useEffect(() => {
    socket.on(END_DRAWING, (id) => {
      if (socket.id !== id) {
        setCanvasContextConfig(drawConfig)
      }
    })

    socket.on(START_DRAWING, (config, room) => {
      if (room !== socket.id) {
        setCanvasContextConfig(config)
      }
    })

    socket.on(SHARE_DRAW_CONFIG, (config) => {
      setDrawConfig(config)
      setCanvasContextConfig(config)
    })

    socket.on(RECEIVING_IMAGE, (res) => {
      if (res.room !== socket.id) {
        dispatch(setHaveMap(true))
        setMapFile(res.image)
        setHaveMap(res)
      }
    })

    socket.on(RECEIVING_DRAWING, (res) => {
      if (res.room !== socket.id) {
        drawDataReceived(res.prevPos, res.currPos, res.drawConfig)
      }
    })

    socket.on(SEND_IMAGE_AND_CANVAS_TO_CLIENT, (res) => {
      console.log('Receiving image and canvas', res)

      setMapFile(res.image)

      image.onload = () => {
        canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
        const imgAux = new Image()
        imgAux.onload = () => {
          canvasCtx.drawImage(imgAux, 0, 0)
        }
        imgAux.src = res.canvas
      }

      setHaveMap(true)
      dispatch(setHaveMap(true))
    })

    socket.on('user joined', (clientId) => {
      dispatch(setIsHost(true))
      dispatch(updateInRoom(true))
      if (image.src.length > 0) {
        const data = {
          // image: base64Image(),
          canvas: canvas.toDataURL(),
          clientId: clientId,
        }
        socket.emit(SEND_IMAGE_AND_CANVAS_TO_CLIENT, data)
      }
      toast('User joined!', {
        icon: '🙋‍♀️',
      })
    })
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ctx) {
      setCtx(canvas.getContext('2d'))
      canvasCtx = canvas.getContext('2d')
    }
  }, [ctx])

  const handleImageLoaded = () => {
    canvas.height = image.height
    canvas.width = image.width
  }

  const onMouseDown = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent
    setIsPainting(true)
    prevPos = { offsetX, offsetY }
    socket.emit(START_DRAWING, {
      room: roomKey !== null ? roomKey : socket.id,
      drawConfig: drawConfig,
    })
  }

  const onMouseMove = ({ nativeEvent }) => {
    if (isPainting && drawingFigure === 0) {
      const { offsetX, offsetY } = nativeEvent
      const offSetData = { offsetX, offsetY }
      draw(prevPos, offSetData)
    }
  }

  const endPaintEvent = ({ nativeEvent }) => {
    const { offsetX, offsetY } = nativeEvent

    if (isPainting) {
      setIsPainting(false)
      socket.emit(END_DRAWING, { room: roomKey !== null ? roomKey : socket.id })
    }

    if (drawingFigure === 1) {
      setDrawingFigure(0)
      canvasCtx.moveTo(prevPos.offsetX, prevPos.offsetY)
      canvasCtx.lineTo(offsetX, offsetY)
      canvasCtx.stroke()
    } else if (drawingFigure === 2) {
      canvasCtx.beginPath()
      canvasCtx.rect(
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
      canvasCtx.beginPath()
      canvasCtx.arc(prevPos.offsetX, prevPos.offsetY, r, 0, 2 * Math.PI)
      canvasCtx.stroke()
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

  const drawDataReceived = (prevPosParam, currPos, config) => {
    const context = canvas.getContext('2d')
    if (context) {
      const { offsetX: x, offsetY: y } = prevPosParam
      const { offsetX, offsetY } = currPos

      context.beginPath()
      // Move the the prevPosition of the mouse
      context.moveTo(x, y)
      // Draw a line to the current position of the mouse
      context.lineTo(offsetX, offsetY)
      context.closePath()
      // Visualize the line using the strokeStyle
      context.stroke()

      prevPos = { offsetX, offsetY }
    }
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

    canvasCtx.beginPath()
    // Move the the prevPosition of the mouse
    canvasCtx.moveTo(x, y)
    // Draw a line to the current position of the mouse
    canvasCtx.lineTo(offsetX, offsetY)
    canvasCtx.closePath()
    // Visualize the line using the strokeStyle
    canvasCtx.stroke()

    prevPos = { offsetX, offsetY }
  }

  const disconnect = () => {
    socket.emit('disconnected')
    dispatch(updateInRoom(false))
  }

  /**
   * Saves the color selected by the user in the color picker storing it inside the button css.
   * Also, changes the canvas context color
   * @param {*} color the selected color
   */
  const saveColor = (color) => {
    drawConfig.strokeStyle = color.hex
    canvasCtx.strokeStyle = color.hex

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
    canvasCtx.strokeStyle = config.strokeStyle
    canvasCtx.lineJoin = config.lineJoin
    canvasCtx.lineWidth = config.lineWidth
  }

  const restoreSavedColor = (button) => {
    canvasCtx.strokeStyle = button.style.backgroundColor
  }

  const setLineWidth = (width) => {
    canvasCtx.lineWidth = width
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

  const base64Image = () => {
    const canvasAux = document.createElement('canvas')
    canvasAux.width = canvas.width
    canvasAux.height = canvas.height
    const ctxAux = canvasAux.getContext('2d')
    ctxAux.drawImage(image, 0, 0)
    return canvasAux.toDataURL()
  }

  const saveImage = (name) => {
    const data = {
      userId: user.id,
      imageName: name,
      imageData: 'test',
      canvasData: canvas.toDataURL(),
      imageBlob: base64Image(),
    }
    saveImageApi(data)
      .then(() => {
        toast.success('Saved!')
      })
      .catch((err) => {
        toast.error('Error!')
      })
  }

  const setImage = (image) => {
    setMapFile(image)
  }

  const closePopup = () => {
    setIsSaveImageDialogOpen(false)
    setIsLoadImageDialogOpen(false)
  }

  const openSaveImagePopup = () => {
    setIsSaveImageDialogOpen(true)
  }

  const displayLoadImagePopup = () => {
    getUserImagesFromDB(user.id)
      .then((res) => {
        setUserSavedImages(res.data)
        setIsLoadImageDialogOpen(true)
      })
      .catch((err) => {
        console.log(err)
      })
  }

  const loadSelectedMap = (data) => {
    setMapFile(data.image_blob)

    image.onload = () => {
      canvasCtx.clearRect(0, 0, canvas.width, canvas.height)
      const imgAux = new Image()
      imgAux.onload = () => {
        canvasCtx.drawImage(imgAux, 0, 0)
      }
      imgAux.src = data.canvas_data
    }

    setHaveMap(true)
    dispatch(setHaveMap(true))
  }

  const loadImageState = () => {
    setImageLoaded(true)
  }

  const penButtonHandler = () => {
    setIsErasing(true)
    canvasCtx.globalCompositeOperation = 'source-over'
    canvasCtx.strokeStyle = drawConfig.strokeStyle
  }

  const eraserButtonHandler = () => {
    setIsErasing(false)
    canvasCtx.globalCompositeOperation = 'destination-out'
  }

  return (
    <div>
      {/* <Toaster position='top-center' reverseOrder={false} /> */}
      <AppToolbar
        type={EDITOR_TOOLBAR}
        disconnect={disconnect}
        download={download}
        loadImageState={loadImageState}
        openSaveImagePopup={openSaveImagePopup}
        displayLoadImagePopup={displayLoadImagePopup}
        saveImage={saveImage}
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
              <CompactPicker triangle="hide" onChangeComplete={saveColor} />
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
              <div>
                <Button onClick={penButtonHandler} color="primary">
                  Pen
                </Button>
              </div>
              <div>
                <Button onClick={eraserButtonHandler} color="primary">
                  Eraser
                </Button>
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
      <PopupSaveImage
        open={isSaveImageDialogOpen}
        close={closePopup}
        saveImage={saveImage}
      />
      <PopupLoadImage
        open={isLoadImageDialogOpen}
        close={closePopup}
        loadSelectedMap={loadSelectedMap}
        images={userSavedImages}
      />
    </div>
  )
}

export default Main
