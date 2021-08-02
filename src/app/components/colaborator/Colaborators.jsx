import { useEffect, useRef, useState } from "react"
import { useDispatch, useSelector } from "react-redux"
import axios from "axios"

import "./colaborators.css"

import { Button, makeStyles, TextField } from "@material-ui/core"
import AppToolbar from "../AppToolbar"
import {
  COLABORATORS_TOOLBAR,
  SESSION_STORAGE_USER_ID,
} from "../../shared/constants"
import MaterialTable from "material-table"

import AddBox from "@material-ui/icons/AddBox"
import ArrowDownward from "@material-ui/icons/ArrowDownward"
import Check from "@material-ui/icons/Check"
import ChevronLeft from "@material-ui/icons/ChevronLeft"
import ChevronRight from "@material-ui/icons/ChevronRight"
import Clear from "@material-ui/icons/Clear"
import DeleteOutline from "@material-ui/icons/DeleteOutline"
import Edit from "@material-ui/icons/Edit"
import FilterList from "@material-ui/icons/FilterList"
import FirstPage from "@material-ui/icons/FirstPage"
import LastPage from "@material-ui/icons/LastPage"
import Remove from "@material-ui/icons/Remove"
import SaveAlt from "@material-ui/icons/SaveAlt"
import Search from "@material-ui/icons/Search"
import ViewColumn from "@material-ui/icons/ViewColumn"

import { forwardRef } from "react"

import Modal from "react-modal"

import { addColaborator, deleteColaborator } from "../../services/api"
import AlertComponent from "../alert/AlertComponent"

import { setHttpRequestStatus } from "../../redux/slices/AppSlice"

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

Modal.setAppElement("#root")

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  buttonsContainer: {
    display: "flex",
    justifyContent: "space-evenly",
  },
  emailform: {
    marginBottom: "1rem",
  },
  addColaboratorTitle: {
    textAlign: "center",
  },
})

const Colaborators = () => {
  const classes = useStyles()
  const dispatch = useDispatch()
  const httpRequestStatus = useSelector((res) => res.state.httpRequestStatus)
  const userName = useSelector((res) => res.state.userName)

  const userId = useSelector((state) => state.state.userId)
  const [colaborators, setColaborators] = useState([])
  const [isOpen, setIsOpen] = useState(false)
  const [emailTextField, setEmailTextField] = useState(null)

  const addColaboratorHandler = () => {
    addColaborator(userName, emailTextField)
      .then((res) => {
        // @todo: refactorizar
        axios
          .get(`http://localhost:4000/api/colaborators/${userName}`)
          .then((colaborators) => {
            setColaborators(colaborators.data)
          })
        // dispatch(setHttpRequestStatus(200))
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const deleteColaboratorAction = (email) => {
    deleteColaborator(userId, email)
      .then((res) => {
        // @todo: refresh list after success
        axios
          .get(`http://localhost:4000/api/colaborators/${userId}`)
          .then((colaborators) => {
            setColaborators(colaborators.data)
          })
      })
      .catch((err) => {
        console.error(err)
      })
  }

  const toggleModal = () => {
    setIsOpen(!isOpen)
  }

  useEffect(() => {
    console.log(userName)
    axios
      .get(
        `http://localhost:4000/api/colaborators/${sessionStorage.getItem(
          SESSION_STORAGE_USER_ID
        )}`
      )
      .then((colaborators) => {
        setColaborators(colaborators.data)
      })
  }, [userName])

  useEffect(() => {}, [colaborators])

  const handleOpenPopup = () => {
    setIsOpen(true)
  }

  return (
    <div>
      <AppToolbar type={COLABORATORS_TOOLBAR} onOpenPopup={handleOpenPopup} />
      {httpRequestStatus !== null && <AlertComponent />}
      <MaterialTable
        columns={[
          { title: "User email", field: "email" },
          {
            title: "Online",
            field: "id",
            render: (rowData) => (
              <img
                src={`${
                  rowData.id !== null
                    ? process.env.PUBLIC_URL + "online.png"
                    : process.env.PUBLIC_URL + "offline.png"
                }`}
                alt=""
                style={{ width: 40, borderRadius: "50%" }}
              />
            ),
          },
        ]}
        data={colaborators}
        icons={tableIcons}
        title="Colaborators"
        actions={[
          {
            icon: "delete",
            tooltip: "Delete User",
            onClick: (event, rowData) => deleteColaboratorAction(rowData.email),
          },
        ]}
      />
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
            fullWidth
            label="Email"
            variant="outlined"
            type="email"
            onChange={(e) => setEmailTextField(e.target.value)}
          />
        </form>
        <div className={classes.buttonsContainer}>
          <Button
            variant="contained"
            onClick={addColaboratorHandler}
            color="primary"
          >
            Add
          </Button>
          <Button variant="contained" onClick={toggleModal} color="primary">
            Close
          </Button>
        </div>
      </Modal>
    </div>
  )
}

export default Colaborators
