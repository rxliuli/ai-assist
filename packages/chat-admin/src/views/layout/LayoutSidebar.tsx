import { Layout, Menu, theme } from 'antd'
import { menus } from '../../constants/router'
import { useLocation } from '@liuli-util/react-router'
import { useNavigate } from 'react-router-dom'

export const LayoutSidebar = () => {
  const {
    token: { colorBgContainer },
  } = theme.useToken()
  const activePath = useLocation().pathname
  const navigate = useNavigate()
  return (
    <Layout.Sider style={{ background: colorBgContainer }}>
      <Menu
        mode="inline"
        defaultSelectedKeys={[activePath]}
        defaultOpenKeys={[activePath]}
        style={{ height: '100%' }}
        onSelect={(ev) => navigate(ev.keyPath[0])}
        items={menus.map((it) => ({
          key: it.path,
          label: it.meta.title,
        }))}
      />
    </Layout.Sider>
  )
}
