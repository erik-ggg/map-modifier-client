import React, { useState } from 'react'

import { Button, Divider, Grid } from '@material-ui/core'
import { CompactPicker } from 'react-color'
import CreateSharpIcon from '@mui/icons-material/CreateSharp'
import AutoFixNormalSharpIcon from '@mui/icons-material/AutoFixNormalSharp'

import './EditorToolbar.scss'

// The restore buttons
let color0, color1, color2, color3, color4, color5
let colors = []

export const EditorToolbar = ({ canvasCtx, drawConfig, setDrawingFigure }) => {
  const [nextColor, setNextColor] = useState(0)

  const penButtonHandler = () => {
    // setIsErasing(true)
    canvasCtx.globalCompositeOperation = 'source-over'
    canvasCtx.strokeStyle = drawConfig.strokeStyle
  }

  const eraserButtonHandler = () => {
    // setIsErasing(false)
    canvasCtx.globalCompositeOperation = 'destination-out'
  }

  const restoreSavedColor = (button) => {
    canvasCtx.strokeStyle = button.style.backgroundColor
  }

  const setLineWidth = (width) => {
    canvasCtx.lineWidth = width
    drawConfig.lineWidth = width
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
      case 5:
        color5.style.backgroundColor = color.hex
        break
      default:
        break
    }
    if (nextColor + 1 > 5) setNextColor(0)
    else setNextColor(nextColor + 1)
  }

  return (
    <Grid container alignItems="center" className="drawToolbarContainer">
      <div className="shapesContainer">
        Shapes
        <button onClick={() => setDrawingFigure(1)}>Line</button>
        <button onClick={() => setDrawingFigure(2)}>Rectangle</button>
        <button onClick={() => setDrawingFigure(3)}>Circle</button>
      </div>
      <Divider orientation="vertical" flexItem />
      <div className="shapesContainer">
        Size
        <button onClick={() => setLineWidth(2)}>Line 1</button>
        <button onClick={() => setLineWidth(4)}>Line 2</button>
        <button onClick={() => setLineWidth(6)}>Line 3</button>
        <button onClick={() => setLineWidth(8)}>Line 4</button>
      </div>
      <Divider orientation="vertical" flexItem />
      <div className="colorsContainer">
        <div className="colorsOptionsContainer">
          <CompactPicker triangle="hide" onChangeComplete={saveColor} />
          <div className="colorsSavesContainer">
            <div>
              <button
                className="colorsSavesButtonClass"
                onClick={() => {
                  restoreSavedColor(color0)
                }}
                ref={(ref) => (color0 = ref)}
              ></button>
              <button
                className="colorsSavesButtonClass"
                onClick={() => {
                  restoreSavedColor(color1)
                }}
                ref={(ref) => (color1 = ref)}
              ></button>
              <button
                className="colorsSavesButtonClass"
                onClick={() => {
                  restoreSavedColor(color2)
                }}
                ref={(ref) => (color2 = ref)}
              ></button>
            </div>
            <div>
              <button
                className="colorsSavesButtonClass"
                onClick={() => {
                  restoreSavedColor(color3)
                }}
                ref={(ref) => (color3 = ref)}
              ></button>
              <button
                className="colorsSavesButtonClass"
                onClick={() => {
                  restoreSavedColor(color4)
                }}
                ref={(ref) => (color4 = ref)}
              ></button>
              <button
                className="colorsSavesButtonClass"
                onClick={() => {
                  restoreSavedColor(color5)
                }}
                ref={(ref) => (color5 = ref)}
              ></button>
            </div>
          </div>
          {/* <div className={colorsTitleClass}>Color</div> */}
        </div>
        <div className="colorsTitleClass">Colors</div>
      </div>
      <Divider orientation="vertical" flexItem />
      <div>
        <div className="penTypeButtonsContainer">
          <div>
            <Button onClick={penButtonHandler}>
              <CreateSharpIcon />
            </Button>
          </div>
          <div>
            <Button onClick={eraserButtonHandler}>
              <AutoFixNormalSharpIcon />
            </Button>
          </div>
        </div>
        <div className="penTypeTitle">Pen</div>
      </div>
    </Grid>
  )
}
