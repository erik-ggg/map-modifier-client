import { useEffect, useState } from 'react'
import { useDispatch, useSelector } from 'react-redux'
import { useHistory } from 'react-router-dom'

import './colaborators.css'

import {
  Button,
  makeStyles,
  MuiThemeProvider,
  TextField,
} from '@material-ui/core'
import AppToolbar from '../appToolbar/AppToolbar.jsx'
import { COLABORATORS_TOOLBAR } from '../../shared/constants'
import MaterialTable from '@material-table/core'

import toast from 'react-hot-toast'

import AddBox from '@material-ui/icons/AddBox'
import ArrowDownward from '@material-ui/icons/ArrowDownward'
import Check from '@material-ui/icons/Check'
import ChevronLeft from '@material-ui/icons/ChevronLeft'
import ChevronRight from '@material-ui/icons/ChevronRight'
import Clear from '@material-ui/icons/Clear'
import DeleteOutline from '@material-ui/icons/DeleteOutline'
import Edit from '@material-ui/icons/Edit'
import FilterList from '@material-ui/icons/FilterList'
import FirstPage from '@material-ui/icons/FirstPage'
import LastPage from '@material-ui/icons/LastPage'
import Remove from '@material-ui/icons/Remove'
import SaveAlt from '@material-ui/icons/SaveAlt'
import Search from '@material-ui/icons/Search'
import ViewColumn from '@material-ui/icons/ViewColumn'

import { forwardRef } from 'react'

import Modal from 'react-modal'

import {
  addColaborator,
  deleteColaborator,
  getColaborators,
} from '../../services/api'
import AlertComponent from '../alert/AlertComponent'
import { updateInRoom } from '../../redux/slices/AppSlice.js'
import { createTheme } from '@mui/material'
import { GLOBAL_ADD, GLOBAL_CLOSE } from '../../shared/literals'

const tableIcons = {
  Add: forwardRef((props, ref) => <AddBox {...props} ref={ref} />),
  Check: forwardRef((props, ref) => <Check {...props} ref={ref} />),
  Clear: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Delete: forwardRef((props, ref) => <DeleteOutline {...props} ref={ref} />),
  DetailPanel: forwardRef((props, ref) => (
    <ChevronRight {...props} ref={ref} />
  )),
  Edit: forwardRef((props, ref) => <Edit {...props} ref={ref} />),
  Export: forwardRef((props, ref) => <SaveAlt {...props} ref={ref} />),
  Filter: forwardRef((props, ref) => <FilterList {...props} ref={ref} />),
  FirstPage: forwardRef((props, ref) => <FirstPage {...props} ref={ref} />),
  LastPage: forwardRef((props, ref) => <LastPage {...props} ref={ref} />),
  NextPage: forwardRef((props, ref) => <ChevronRight {...props} ref={ref} />),
  PreviousPage: forwardRef((props, ref) => (
    <ChevronLeft {...props} ref={ref} />
  )),
  ResetSearch: forwardRef((props, ref) => <Clear {...props} ref={ref} />),
  Search: forwardRef((props, ref) => <Search {...props} ref={ref} />),
  SortArrow: forwardRef((props, ref) => <ArrowDownward {...props} ref={ref} />),
  ThirdStateCheck: forwardRef((props, ref) => <Remove {...props} ref={ref} />),
  ViewColumn: forwardRef((props, ref) => <ViewColumn {...props} ref={ref} />),
}

Modal.setAppElement('#root')

const theme = createTheme({
  palette: {
    background: {
      default: '#051622',
    },
    primary: {
      main: '#4caf50',
    },
    secondary: {
      main: '#ff9100',
    },
  },
})

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  buttonsContainer: {
    display: 'flex',
    justifyContent: 'space-evenly',
  },
  emailButtons: {
    backgroundColor: '#004152',
    color: '#1ba098',
  },
  emailform: {
    marginBottom: '1rem',
  },
  addColaboratorTitle: {
    textAlign: 'center',
  },
})

const Colaborators = ({ socket }) => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const history = useHistory()

  const isConnected = useSelector((res) => res.state.isConnected)
  const httpRequestStatus = useSelector((res) => res.state.httpRequestStatus)
  const user = useSelector((res) => res.state.user)

  const [colaborators, setColaborators] = useState([])
  const [isColaboratorEmailValid, setIsColaboratorEmailValid] = useState(false)
  const [isOpen, setIsOpen] = useState(false)
  const [emailTextField, setEmailTextField] = useState(null)

  const addColaboratorHandler = () => {
    if (user.email !== emailTextField) {
      addColaborator(user.email, emailTextField)
        .then((res) => {
          if (res.status === 200) {
            toggleModal()
            getColaborators(user.email).then((colaborators) => {
              setColaborators(colaborators.data)
            })
          }
        })
        .catch((err) => {
          if (err.response.status === 404) {
            toast.error('No se puedo encontrar el colaborador con ese email')
          } else if (err.response.status === 400) {
            toast.error('El colaborador ya ha sido agregado')
          } else {
            toast.error('Se ha producido un error interno')
          }
        })
    }
  }

  const deleteColaboratorAction = (email) => {
    deleteColaborator(user.email, email)
      .then((res) => {
        getColaborators(user.email).then((colaborators) => {
          setColaborators(colaborators.data)
        })
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const joinColaborator = (socketId) => {
    if (socketId) {
      history.push('/editor')
      socket.emit('join room', socketId)
      dispatch(updateInRoom(true))
    }
  }

  const toggleModal = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    if (user) {
      getColaborators(user.email).then((colaborators) => {
        setColaborators(colaborators.data)
      })
    }
  }, [user])

  useEffect(() => {}, [colaborators])

  const handleOpenPopup = () => {
    setIsOpen(true)
  }

  const handleColaboratorEmailInput = (email) => {
    if (/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(email)) {
      setIsColaboratorEmailValid(true)
      setEmailTextField(email)
    } else {
      setIsColaboratorEmailValid(false)
    }
  }

  return (
    <div>
      <AppToolbar type={COLABORATORS_TOOLBAR} onOpenPopup={handleOpenPopup} />
      {httpRequestStatus !== null && <AlertComponent />}
      <div className="table">
        <MuiThemeProvider theme={theme}>
          <MaterialTable
            columns={[
              { title: 'Name', field: 'name' },
              { title: 'Email', field: 'email' },
              {
                title: 'Online',
                field: 'isOnline',
                render: (rowData) => (
                  <img
                    src={`${
                      rowData.isOnline
                        ? process.env.PUBLIC_URL + 'online.png'
                        : process.env.PUBLIC_URL + 'offline.png'
                    }`}
                    alt=""
                    style={{ width: 20, borderRadius: '50%' }}
                  />
                ),
              },
            ]}
            data={colaborators}
            icons={tableIcons}
            title="Colaborators"
            actions={[
              (rowData) => ({
                icon: 'input',
                tooltip: 'Join colaborator',
                onClick: (event, rowData) => joinColaborator(rowData.socketId),
                disabled: !rowData.isOnline || !isConnected,
              }),
              {
                icon: 'delete',
                tooltip: 'Delete User',
                onClick: (event, rowData) =>
                  deleteColaboratorAction(rowData.email),
              },
              {
                icon: 'refresh',
                tooltip: 'Refresh',
                isFreeAction: true,
                actionsColumnIndex: -1,
                toolbarButtonAlignment: 'left',
                onClick: (event) => {
                  getColaborators(user.email).then((colaborators) => {
                    setColaborators(colaborators.data)
                  })
                },
              },
            ]}
            options={{
              toolbarButtonAlignment: 'left',
              actionsColumnIndex: -1,
            }}
          />
        </MuiThemeProvider>
      </div>
      <Modal
        isOpen={isOpen}
        onRequestClose={toggleModal}
        contentLabel="My dialog"
        className="addColaboratorModal"
        shouldCloseOnOverlayClick={false}
      >
        <h2 className={classes.addColaboratorTitle}>Add Colaborator</h2>
        <form className={classes.emailform} noValidate autoComplete="off">
          <TextField
            id="add-colaborator-textfield"
            autoComplete="none"
            fullWidth
            label="Email"
            variant="standard"
            onChange={(e) => handleColaboratorEmailInput(e.target.value)}
          />
        </form>
        <div className={classes.buttonsContainer}>
          <Button
            className={classes.emailButtons}
            disabled={!isColaboratorEmailValid}
            onClick={addColaboratorHandler}
          >
            {GLOBAL_ADD}
          </Button>
          <Button
            variant="contained"
            onClick={toggleModal}
            className={classes.emailButtons}
          >
            {GLOBAL_CLOSE}
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default Colaborators
