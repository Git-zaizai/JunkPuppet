import path from 'node:path'
import { existsSync, statSync, readdirSync } from 'node:fs'
import { initDir } from '../utils/file'

export function uploadScript(params: any) {
  return Promise.resolve(1)
}

export async function readScriptFles() {
  console.log('readScriptFles', process.env.DATA_SCRIPT_PATH)

  const file = readdirSync(process.env.DATA_SCRIPT_PATH)
  const script = []
  for (const iterator of file) {
    const result = await import(iterator)
    script.push(result)
  }
  console.log(script)

  return Promise.resolve(script)
}
