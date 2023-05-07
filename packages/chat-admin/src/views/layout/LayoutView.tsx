import { Card, Layout } from 'antd'
import css from './LayoutView.module.css'
import { RouterView } from '@liuli-util/react-router'
import { LayoutSidebar } from './LayoutSidebar'

export const LayoutView = () => {
  return (
    <Layout className={css.layout}>
      <LayoutSidebar></LayoutSidebar>
      <Layout.Content className={css.content}>
        <Card>
          <RouterView></RouterView>
        </Card>
      </Layout.Content>
    </Layout>
  )
}

export default LayoutView
