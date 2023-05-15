import { Card, Layout } from 'antd'
import css from './LayoutView.module.css'
import { RouterView } from '@liuli-util/react-router'
import { LayoutSidebar } from './LayoutSidebar'
import { ConfigProvider } from 'antd'
import zhCN from 'antd/locale/zh_CN'

export const LayoutView = () => {
  return (
    <ConfigProvider locale={zhCN}>
      <Layout className={css.layout}>
        <LayoutSidebar></LayoutSidebar>
        <Layout.Content className={css.content}>
          <Card>
            <RouterView></RouterView>
          </Card>
        </Layout.Content>
      </Layout>
    </ConfigProvider>
  )
}

export default LayoutView
