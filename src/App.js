import "./App.css"
import axios from "axios"

import { useDispatch } from "react-redux"
import { useEffect } from "react"
import { BrowserRouter as Router, Switch, Route } from "react-router-dom"
import Colaborators from "./app/components/colaborator/Colaborators"
import Main from "./app/components/Main"
import { SESSION_STORAGE_USER_KEY } from "./app/shared/constants"

import { setHttpRequestStatus } from "./app/redux/slices/AppSlice"

const App = () => {
  const dispatch = useDispatch()

  // const [socket, setSocket] = useState(null)

  // const handleSetSocket = (socket) => {
  //   setSocket(socket)
  // }

  useEffect(() => {
    // axios.interceptors.request.use((req, res) => {
    //   if (req.url.includes("colaborators")) {
    //     console.log(req, res)
    //   }
    // })
    axios.interceptors.response.use(undefined, (err) => {
      if (err.response.status === 404) {
        dispatch(setHttpRequestStatus(404))
      }
    })
    if (window.performance && performance.navigation.type === 1) {
      const userId = sessionStorage.getItem(SESSION_STORAGE_USER_KEY)
      // dispatch(addUserId(userId))
    }
  })

  return (
    <Router>
      <Switch>
        <Route path="/editor">
          <Main />
        </Route>
        <Route path="/colaborators">
          <Colaborators />
        </Route>
      </Switch>
    </Router>
  )
}

export default App
