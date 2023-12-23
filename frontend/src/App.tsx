import { ConfigProvider, theme } from 'antd'
import { RouterProvider, createBrowserRouter } from 'react-router-dom'
import zhCN from 'antd/locale/zh_CN'
import { defaultRouter, optionalRouter } from '@/routers/index'
import { getGlobalSetting, openDevTools } from './service'
import { useEffect, useState } from 'react'
import { useSettingStore, useRootVarsStore } from './views/stores'
import Globalmethod from '@/components/globalmethod'

function pickOptionalRouters() {
  // pick some routes
  return optionalRouter
}
function App() {
  const [visible, setVisible] = useState(false)
  const [routes, setRoutes] = useState<any>(null)
  const { setSettingInfo } = useSettingStore()
  const { getRootVars } = useRootVarsStore()
  const rootVars = getRootVars()

  const handleGetGlobalSetting = async () => {
    const result = await getGlobalSetting({})
    const target = JSON.parse(result)
    if (target) {
      setSettingInfo(target)
      setRoutes(createBrowserRouter(pickOptionalRouters()))
    } else {
      setRoutes(createBrowserRouter(defaultRouter))
    }
    setVisible(true)
  }
  useEffect(() => {
    handleGetGlobalSetting()
    window.addEventListener('keydown', (e) => {
      if (e.key === 'F12') {
        openDevTools()
      }
    })
  }, [])
  /* 
 原版颜色
 {
    colorPrimary: '#3160F8',
  } */
  return visible ? (
    <ConfigProvider
      theme={{
        algorithm:
          rootVars.isTheme === 'dark'
            ? theme.darkAlgorithm
            : theme.defaultAlgorithm,
        token: rootVars.themeToken,
        components: {
          Menu: {
            darkItemSelectedBg: '#3a3a3a'
          }
        }
      }}
      locale={zhCN}
    >
      <Globalmethod>
        <RouterProvider router={routes} />
      </Globalmethod>
    </ConfigProvider>
  ) : null
}

export default App
