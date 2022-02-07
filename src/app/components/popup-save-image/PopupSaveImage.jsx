import { Button, Modal, TextField } from '@material-ui/core'
import React, { useState } from 'react'
import styles from './PopupSaveImage.module.scss'

const PopupSaveImage = ({ open, close, saveImage }) => {
  const [imageTitle, setImageTitle] = useState('')

  const toggleModal = () => {
    close()
  }

  const handleSaveImage = () => {
    saveImage(imageTitle)
    close()
  }

  return (
    <Modal open={open} onClose={toggleModal} aria-labelledby="My dialog">
      <div className={styles.saveImageModal}>
        <h2 className={styles.addColaboratorTitle}>Save image</h2>
        <form className={styles.emailform} noValidate autoComplete="off">
          <TextField
            id="add-colaborator-textfield"
            fullWidth
            label="Name"
            // variant="outlined"
            variant="standard"
            type="text"
            onChange={(e) => setImageTitle(e.target.value)}
          />
        </form>
        <div className={styles.buttonsContainer}>
          <Button variant="contained" onClick={handleSaveImage}>
            Save
          </Button>
          <Button variant="contained" onClick={toggleModal}>
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default PopupSaveImage
