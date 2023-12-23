/// <reference types="vite/client" />
// Used in Renderer process, expose in `preload.ts`

type MessageApi = typeof import('antd')['message']
type NotificationApi = typeof import('antd')['notification']
type ModalApi = typeof import('antd')['Modal']

interface Window {
  SSAPI: any
  onLog: any
  $message: MessageApi
  $notification: NotificationApi
  $modal: ModalApi
}
