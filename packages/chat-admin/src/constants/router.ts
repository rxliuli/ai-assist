import { RouteConfig, createHashHistory } from '@liuli-util/react-router'

interface MenuConfig extends RouteConfig {
  meta: {
    title: string
  }
  children?: MenuConfig[]
}

export const menus: MenuConfig[] = [
  {
    path: '/',
    component: () => import('../views/home/HomeView'),
    meta: {
      title: '首页',
    },
  },
  {
    path: '/user',
    component: () => import('../views/user/UserView'),
    meta: {
      title: '用户管理',
    },
  },
]

export const routes: RouteConfig[] = [
  {
    path: '/',
    component: () => import('../views/layout/LayoutView'),
    children: menus,
  },
  {
    path: '/signin',
    component: () => import('../views/auth/SignInView'),
  },
]

export const router = createHashHistory()
