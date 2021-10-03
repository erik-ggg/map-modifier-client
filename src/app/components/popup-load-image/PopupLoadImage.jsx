import React, { useState, useEffect } from 'react'
import { Button, Modal, TextField } from '@material-ui/core'
import styles from './PopupLoadImage.module.css'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { bgcolor } from '@mui/system'

const data = []

const PopupLoadImage = ({ open, close, loadSelectedMap, images }) => {
  const toggleModal = () => {
    close()
  }

  const handleClick = (image) => {
    loadSelectedMap(image.canvas_data)
    close()
  }

  return (
    <Modal open={open} onClose={toggleModal} aria-labelledby="My dialog">
      <div className={styles.loadImageModal}>
        <h2 className={styles.addColaboratorTitle}>Load image</h2>
        <List sx={{ bgcolor: 'background.paper' }}>
          {images.map((image) => (
            <ListItem
              onClick={() => handleClick(image)}
              disablePadding
              key={image.image_name}
            >
              <ListItemButton>
                <ListItemText primary={image.image_name} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
        <div className={styles.buttonsContainer}>
          <Button variant="contained" onClick={toggleModal} color="primary">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default PopupLoadImage
