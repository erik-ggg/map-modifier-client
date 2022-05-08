import React from 'react'
import { Button, Modal } from '@material-ui/core'
import styles from './PopupLoadImage.module.scss'
import List from '@mui/material/List'
import ListItem from '@mui/material/ListItem'
import ListItemButton from '@mui/material/ListItemButton'
import ListItemText from '@mui/material/ListItemText'
import { Divider } from '@mui/material'

const PopupLoadImage = ({ open, close, loadSelectedMap, images }) => {
  const toggleModal = () => {
    close()
  }

  const handleClick = (image) => {
    loadSelectedMap(image)
    close()
  }

  return (
    <Modal open={open} onClose={toggleModal} aria-labelledby="My dialog">
      <div className={styles.loadImageModal}>
        <h2 className={styles.addColaboratorTitle}>Load image</h2>
        <List sx={{ bgcolor: 'background.paper' }}>
          {images.map((image, item, arr) => (
            <div>
              <ListItem
                onClick={() => handleClick(image)}
                disablePadding
                key={image.image_name}
              >
                <ListItemButton>
                  <ListItemText primary={image.image_name} />
                </ListItemButton>
              </ListItem>
              {arr.length - 1 !== item && <Divider />}
            </div>
          ))}
        </List>
        <div className={styles.buttonsContainer}>
          <Button variant="contained" onClick={toggleModal} color="inherit">
            Close
          </Button>
        </div>
      </div>
    </Modal>
  )
}

export default PopupLoadImage
