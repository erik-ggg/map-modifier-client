import {
  makeStyles,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
} from "@material-ui/core"
import Paper from "@material-ui/core/Paper"
import axios from "axios"
import { useEffect, useState } from "react"
import { useSelector } from "react-redux"

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
})

function createData(name, calories) {
  return { name, calories }
}

// const rows = [
//   createData("Frozen yoghurt", 159),
//   createData("Ice cream sandwich", 237),
//   createData("Eclair", 262),
//   createData("Cupcake", 305),
//   createData("Gingerbread", 356),
// ]

const Colaborators = () => {
  const classes = useStyles()
  const [colaborators, setColaborators] = useState([])
  const userId = useSelector((state) => state.state.userId)

  useEffect(() => {
    console.log(userId)
    if (userId !== undefined) {
      axios
        .get(`http://localhost:4000/api/colaborators/${userId}`)
        .then((colaborators) => {
          setColaborators(colaborators.data)
          console.log(colaborators.data[0])
        })
    }
  }, [userId])

  useEffect(() => {}, [colaborators])

  return (
    <div>
      <TableContainer component={Paper}>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>User</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {colaborators.map((row) => (
              <TableRow key={row.email}>
                <TableCell component="th" scope="row">
                  {row.email}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </TableContainer>
    </div>
  )
}

export default Colaborators
