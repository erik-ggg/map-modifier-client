import AppToolbar from './appToolbar/AppToolbar'
import PopupSaveImage from './popup-save-image/PopupSaveImage'

import './Main.css'
import { EDITOR_TOOLBAR, SESSION_STORAGE_USER } from '../shared/constants'
import { useDispatch, useSelector } from 'react-redux'
import { useEffect, useState } from 'react'
import {
  updateInRoom,
  setIsHost,
  setHaveMap,
  connectedAction,
} from '../redux/slices/AppSlice'
import toast from 'react-hot-toast'

import {
  BROADCAST_DRAWING,
  CONNECT,
  END_DRAWING,
  RECEIVING_DRAWING,
  RECEIVING_IMAGE,
  SEND_IMAGE_AND_CANVAS_TO_CLIENT,
  SHARE_DRAW_CONFIG,
  START_DRAWING,
} from '../shared/socket-actions'
import {
  addConnection,
  getUserImagesFromDB,
  saveImageApi,
} from '../services/api'
import PopupLoadImage from './popup-load-image/PopupLoadImage'
import { EditorToolbar } from './editorToolbar/EditorToolbar'
import { makeStyles } from '@material-ui/core'
import { CONNECT_SUCCESSFULL } from '../shared/literals'

let prevPos = { offsetX: 0, offsetY: 0 }
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
  colorsTitleClass: {
    textAlign: 'center',
  },
}))

const Main = ({ socket }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const roomKey = useSelector((res) => res.state.roomKey)
  const inRoom = useSelector((res) => res.state.inRoom)
  const haveMap = useSelector((res) => res.state.haveMap)
  const user = useSelector((res) => res.state.user)
  const [mapFile, setMapFile] = useState(null)
  const [ctx, setCtx] = useState(null)
  const [isPainting, setIsPainting] = useState(false)
  const [drawingFigure, setDrawingFigure] = useState(0)
  const [drawConfig, setDrawConfig] = useState({
    lineJoin: 'round',
    lineWidth: 2,
    strokeStyle: 'black',
    globalCompositeOperation: 'source-over',
  })
  const [isSaveImageDialogOpen, setIsSaveImageDialogOpen] = useState(false)
  const [isLoadImageDialogOpen, setIsLoadImageDialogOpen] = useState(false)
  const [userSavedImages, setUserSavedImages] = useState([])

  /**
   * Auxiliary function to create a new connection after click on the connect button
   * Retrieves the user email from the session storage
   */
  const connect = () => {
    if (socket !== undefined && socket.id !== null) {
      const user = JSON.parse(sessionStorage.getItem(SESSION_STORAGE_USER))
      if (user !== null) {
        addConnection(user.email, socket.id).then(() => {
          dispatch(connectedAction())
          dispatch(updateInRoom(false))
          toast.success(CONNECT_SUCCESSFULL)
        })
      }
    }
  }

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
      setMapFile(res.image)

      // Load canvas
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
      sendImageAndCanvasContextAux(clientId)
      toast('User joined!', {
        icon: '🙋‍♀️',
      })
    })

    socket.on(CONNECT, connect)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  useEffect(() => {
    if (!ctx) {
      setCtx(canvas.getContext('2d'))
      canvasCtx = canvas.getContext('2d')
    }
  }, [ctx])

  const sendImageAndCanvasContextAux = (clientId) => {
    if (image.src.length > 0) {
      const data = {
        image: base64Image(),
        canvas: canvas.toDataURL(),
        clientId: clientId,
      }
      socket.emit(SEND_IMAGE_AND_CANVAS_TO_CLIENT, data)
    }
  }

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
   * Set canvas context draw options
   * @param {*} config the config that will be used to draw
   */
  const setCanvasContextConfig = (config) => {
    canvasCtx.strokeStyle = config.strokeStyle
    canvasCtx.lineJoin = config.lineJoin
    canvasCtx.lineWidth = config.lineWidth
    canvasCtx.globalCompositeOperation = config.globalCompositeOperation
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
    // setImageLoaded(true)
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
        <EditorToolbar
          canvasCtx={canvasCtx}
          drawConfig={drawConfig}
          setDrawingFigure={setDrawingFigure}
        />
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
