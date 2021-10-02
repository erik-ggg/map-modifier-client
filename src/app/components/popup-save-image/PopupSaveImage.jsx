import { Button, Modal, TextField } from '@material-ui/core'
import React, { useState } from 'react'
import styles from './PopupSaveImage.module.css'

const PopupSaveImage = ({ open, close, saveImage }) => {
  const [imageTitle, setImageTitle] = useState('')
  const addImageHandler = () => {}

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
            variant="outlined"
            type="text"
            onChange={(e) => setImageTitle(e.target.value)}
          />
        </form>
        <div className={styles.buttonsContainer}>
          <Button color="primary" onClick={handleSaveImage}>
            Save
          </Button>
          <Button variant="contained" onClick={toggleModal} color="primary">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default PopupSaveImage
