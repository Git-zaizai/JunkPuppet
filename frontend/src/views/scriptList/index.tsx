import { getTaskList } from '@/service'
import Filter from './components/Filter'
import List from './components/List'
import { useEffect, useRef, useState } from 'react'
import { uploadScript, scriptList } from '@/service'

function App() {
  const [list, setList] = useState<any[]>([])
  const fetchList = async (text?: string) => {
    let params: any = {
      text: text || ''
    }
    const result = await getTaskList(params)
    if (Array.isArray(result)) {
      setList(result)
    }
  }
  const reflash = async () => {
    await fetchList()
  }

  const uploadRef = useRef<HTMLDivElement>(null)
  function dragover(e: Event) {
    e.preventDefault()
  }
  function drop(e: any) {
    e.preventDefault()

    const files: any[] = Array.from(e.dataTransfer?.files) ?? []
    if (!files.length) {
      window.$message.warning('获取不到文件')
      return
    }
    const filesPath = files.map((file) => file.path)
    uploadScript(filesPath).then((res) => {
      console.log('res', res)
    })
  }

  useEffect(() => {
    fetchList()
    scriptList().then((res) => {
      console.log('scriptList', res)
    })
    if (uploadRef.current) {
      uploadRef.current.addEventListener('dragover', dragover)
      uploadRef?.current.addEventListener('drop', drop)
    }
    return () => {
      if (uploadRef.current) {
        uploadRef.current.removeEventListener('dragover', dragover)
        uploadRef.current.removeEventListener('drop', drop)
      }
    }
  }, [])

  return (
    <div
      ref={uploadRef}
      style={{ height: 'calc(100% - 42px)' }}
    >
      <div className='px-[20px] py-[20px] mt-[10px]'>
        <Filter fetchList={fetchList}></Filter>
      </div>
      <div className='px-[20px] mt-[10px]'>
        <List
          reflash={reflash}
          list={list}
        ></List>
      </div>
    </div>
  )
}

export default App
