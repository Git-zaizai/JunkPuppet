import { app } from 'electron'
import { join, resolve } from 'node:path'
import { fsCheckFile, fsreadFile, initDir } from './file'
import { hasGlobalSetting } from './tools'
import { taskListDb } from '../service/db'
import { turnOnCron } from '../service/cron'

export const initGlobalSetting = async () => {
  if (hasGlobalSetting()) {
    process.env.IS_SET = 'set'
    const result = await fsreadFile(process.env.GLOBAL_SETTING_CONFIG_PATH)
    const config = JSON.parse(result)
    Object.entries(config).map((item: any) => {
      process.env[item[0]] = item[1]
    })
  } else {
    process.env.IS_SET = 'noset'
  }
}
export const initEnv = () => {
  process.env.DIST = join(__dirname, '../dist')
  process.env.VITE_PUBLIC = app.isPackaged
    ? process.env.DIST
    : join(process.env.DIST, '../public')
  process.env.SCRIPTS_PATH = app.isPackaged
    ? resolve(process.env.DIST, '../../puppteer-plugin')
    : join(__dirname, '../puppteer-plugin/puppteer-plugin')

  process.env.GLOBAL_SETTING_CONFIG_PATH = app.isPackaged
    ? resolve(process.env.DIST, '../../GlobalConfig.json')
    : join(process.env.VITE_PUBLIC, 'GlobalConfig.json')

  process.env.DATA_SCRIPT_PATH = app.isPackaged
    ? resolve(process.env.DIST, '../../srcipts')
    : join(process.env.VITE_PUBLIC, '/srcipts')

  console.log('initEnv', process.env.DATA_SCRIPT_PATH)
}
export const initDirectory = async () => {
  if (process.env.IS_SET === 'noset') return
  await initDir(process.env.DATA_PATH_SNAPSHOT)
  await initDir(process.env.DATA_PATH_JSON)
  await initDir(process.env.DATA_PATH_DB)
  await initDir(process.env.DATA_PATH_CHROME_DATA)
  await initDir(process.env.DATA_PATH_LOG)
}
export const initFiles = async () => {
  // 初始化任务列表
  const taskListPath: string = join(process.env.DATA_PATH_DB, 'taskList.json')
  // 初始化任务详情
  const taskDataPath: string = join(process.env.DATA_PATH_DB, 'taskData.json')
  await fsCheckFile(taskListPath)
  await fsCheckFile(taskDataPath)
}
export const initCronScripts = async () => {
  const database = await taskListDb()
  const result = database.chain.get('list').filter({ auto: true }).value()
  global.cronList = new Map()
  for (const script of result) {
    turnOnCron(script)
  }
  console.log('start auto task: ' + [...global.cronList].length + ' count')
}
