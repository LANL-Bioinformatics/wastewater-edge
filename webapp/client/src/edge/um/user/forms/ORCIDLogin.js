import React, { useState } from 'react'
import { Button } from 'reactstrap'

import { useDispatch, useSelector } from 'react-redux'

import { popupWindow } from '../../../common/util'
import { LoaderDialog, ConfirmDialogNoHeader, MessageDialog } from '../../../common/Dialogs'
import { login } from 'src/redux/reducers/edge/userSlice'
import { cleanMessage } from 'src/redux/reducers/messageSlice'
import config from 'src/config'

const ORCIDLogin = (props) => {
  const dispatch = useDispatch()
  const errors = useSelector((state) => state.message.errors)
  const messages = useSelector((state) => state.message.messages)
  const page = useSelector((state) => state.page)

  const [userData, setUserData] = useState({})
  const [openConfirm, setOpenConfirm] = useState(false)

  const closeConfirm = () => {
    setOpenConfirm(false)
  }
  const handleYes = () => {
    setOpenConfirm(false)
    dispatch(login(userData))
  }

  const getORCID = () => {
    //ORICD config
    const url = config.ORCID.AUTH_URI
    //console.log(url)
    //open ORCiD login page
    popupWindow(url, 'ORCiD', window, 600, 700)
    // Add a message listener to handle popup messages
    window.addEventListener('message', HandleMessages)
  }
  const HandleMessages = (message) => {
    // Remove message listener after message was received
    window.removeEventListener('message', HandleMessages)

    // Do stuff
    //console.log("got mes", message)
    const data = message.data
    const user = {
      firstName: data.given_name,
      lastName: data.family_name,
      email: data.sub + '@orcid.org',
      oauth: 'orcid',
    }

    setUserData(user)
    setOpenConfirm(true)
  }

  const closeMsgModal = () => {
    dispatch(cleanMessage())
  }

  return (
    <>
      <LoaderDialog loading={page.submitting_form} text="Verifying email..." />
      <ConfirmDialogNoHeader
        html={true}
        isOpen={openConfirm}
        action={'Continue to ' + config.APP.NAME + '?'}
        message={
          'Hi ' + userData.firstName + ',<br/><br/> Welcome to ' + config.APP.NAME + '!<br/>'
        }
        handleClickClose={closeConfirm}
        handleClickYes={handleYes}
      />
      <MessageDialog
        isOpen={messages.sociallogin ? true : false}
        message={messages.sociallogin}
        handleClickClose={closeMsgModal}
      />
      <MessageDialog
        isOpen={errors.sociallogin ? true : false}
        message={errors.sociallogin}
        handleClickClose={closeMsgModal}
        className="modal-danger"
      />
      <p className="text-muted">Use your ORCID account for faster login or registration</p>

      <Button color="success" className="px-4 text-white" block onClick={(e) => getORCID()}>
        Login with ORCiD
      </Button>
    </>
  )
}

export default ORCIDLogin
