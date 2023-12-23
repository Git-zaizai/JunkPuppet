import React from 'react'
import { App } from 'antd'

const WinMethod = () => {
  const { message, notification, modal } = App.useApp()
  window.$message = message as MessageApi
  window.$notification = notification as NotificationApi
  window.$modal = modal as unknown as ModalApi
  return <></>
}

const Globalmethod: React.FC<any> = (props) => {
  return (
    <App className='h-full'>
      <WinMethod />
      {props.children}
    </App>
  )
}

export default Globalmethod
