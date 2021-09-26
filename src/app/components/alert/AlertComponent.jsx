import { makeStyles } from '@material-ui/styles'
import { useEffect, useState } from 'react'
import { useSelector } from 'react-redux'

const useStyles = makeStyles({
  textClass: {
    alignItems: 'center',
    display: 'flex',
    height: '2rem',
    justifyContent: 'center',
    letterSpacing: '0.3px',
  },
  errorClass: {
    backgroundColor: '#ffd2d2',
    color: '#f5334f',
    border: '1px solid #f5334f',
  },
  successClass: {
    color: '#2b7515',
    background: '#ecffd6',
    border: '1px solid #617c42',
  },
})

let httpStatus = null

const AlertComponent = () => {
  const classes = useStyles()
  const httpRequestStatus = useSelector((res) => res.state.httpRequestStatus)
  const [alertText, setAlertText] = useState(null)

  useEffect(() => {
    switch (httpRequestStatus) {
      //   case 200:
      //     console.log("entra 200")
      //     setAlertText("Colaborator added successfully!")
      //     httpStatus = 200
      //     break
      case 404:
        setAlertText('Colaborator not found')
        console.log('entra 404')
        httpStatus = 500
        break
      case 500:
        setAlertText('An error happend, please try again later...')
        httpStatus = 500
        break
      default:
        setAlertText(null)
        break
    }
  }, [httpRequestStatus])

  return (
    <div
      className={`${classes.textClass} ${
        httpStatus === 500 ? classes.errorClass : ''
      } ${httpStatus === 200 ? classes.successClass : ''}`}
    >
      {alertText}
    </div>
  )
}

export default AlertComponent
