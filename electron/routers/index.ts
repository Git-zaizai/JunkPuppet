import { ipcMain, BrowserWindow } from 'electron'
import {
  addTask,
  updateTask,
  getTaskList,
  deleteTask,
  startSetting,
  getTaskConfigDetail,
  updateTaskMockData,
  getTaskDataDetail,
  deleteTaskDataDb,
  debugPlay,
  startplay,
  uploadJSONSetting
} from '../service/task'

import {
  selectDir,
  selectFile,
  maxWindow,
  unMaxWindow,
  minimizeWindow,
  closeApp
} from '../service/electron'

import {
  getGlobalSetting,
  setGlobalSetting,
  getDataDistInfo
} from '../service/system'

import { getRecentLogs } from '../service/logger'

import { openChrome } from '../service/spawn'

import { getTaskTypes } from '../service/statistics'

import { uploadScript, readScriptFles } from '../service/script'

export interface Route {
  path: string
  callBack: (event: Electron.IpcMainInvokeEvent, ...args: any[]) => Promise<any>
}

const wrapService = async (fn: (arg: any) => Promise<any> | void, arg: any) => {
  return fn(arg)
}

export const routes: Route[] = [
  {
    path: 'addTask',
    callBack: (_event, arg) => wrapService(addTask, arg)
  },
  {
    path: 'updateTask',
    callBack: (_event, arg) => wrapService(updateTask, arg)
  },
  {
    path: 'deleteTask',
    callBack: (_event, arg) => wrapService(deleteTask, arg)
  },
  {
    path: 'getTaskList',
    callBack: (_event, arg) => wrapService(getTaskList, arg)
  },
  {
    path: 'getTaskTypes',
    callBack: (_event, arg) => wrapService(getTaskTypes, arg)
  },
  {
    path: 'getTaskDataDetail',
    callBack: (_event, arg) => wrapService(getTaskDataDetail, arg)
  },
  {
    path: 'getTaskConfigDetail',
    callBack: (_event, arg) => wrapService(getTaskConfigDetail, arg)
  },
  {
    path: 'updateTaskMockData',
    callBack: (_event, arg) => wrapService(updateTaskMockData, arg)
  },
  {
    path: 'startSetting',
    callBack: (_event, arg) => wrapService(startSetting, arg)
  },
  {
    path: 'startplay',
    callBack: (_event, arg) => wrapService(startplay, arg)
  },
  {
    path: 'debugPlay',
    callBack: (_event, arg) => wrapService(debugPlay, arg)
  },
  {
    path: 'setGlobalSetting',
    callBack: (_event, arg) => wrapService(setGlobalSetting, arg)
  },
  {
    path: 'getGlobalSetting',
    callBack: (_event, arg) => wrapService(getGlobalSetting, arg)
  },
  {
    path: 'selectFile',
    callBack: (_event, arg) => wrapService(selectFile, arg)
  },
  {
    path: 'selectDir',
    callBack: (_event, arg) => wrapService(selectDir, arg)
  },
  {
    path: 'minimizeWindow',
    callBack: (_event, arg) => wrapService(minimizeWindow, arg)
  },
  {
    path: 'maxWindow',
    callBack: (_event, arg) => wrapService(maxWindow, arg)
  },
  {
    path: 'unMaxWindow',
    callBack: (_event, arg) => wrapService(unMaxWindow, arg)
  },
  {
    path: 'getDataDistInfo',
    callBack: (_event, arg) => wrapService(getDataDistInfo, arg)
  },
  {
    path: 'getRecentLogs',
    callBack: (_event, arg) => wrapService(getRecentLogs, arg)
  },
  {
    path: 'closeApp',
    callBack: (_event, arg) => wrapService(closeApp, arg)
  },
  {
    path: 'deleteTaskDataDb',
    callBack: (_event, arg) => wrapService(deleteTaskDataDb, arg)
  },
  {
    path: 'openChrome',
    callBack: (_event, arg) => wrapService(openChrome, arg)
  },
  {
    path: 'uploadJSONSetting',
    callBack: (_event, arg) => wrapService(uploadJSONSetting, arg)
  },
  {
    path: 'openDevTools', // 打开控制台  前端通过发送通信后这边打开控制台
    callBack: (_event, arg) =>
      wrapService(async () => {
        const win = BrowserWindow.getFocusedWindow()
        win && win.webContents.toggleDevTools()
      }, arg)
  },
  {
    path: 'uploadscript',
    callBack: (_event, arg) => wrapService(uploadScript, arg)
  },
  {
    path: 'scriptlist',
    callBack: (_event, arg) => wrapService(readScriptFles, arg)
  }
]

export const initRoutes = () => {
  routes.map((route) => {
    ipcMain.handle(route.path, route.callBack)
  })
}
