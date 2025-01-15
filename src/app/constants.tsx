import { SideNavItem } from './data/models'
import { Icon } from '@iconify/react'

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: 'Home',
    path: '/dashboard',
    icon: <Icon icon='lucide:home' width='24' height='24' />,
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: <Icon icon='lucide:cog' width='24' height='24' />,
    submenu: true,
    subMenuItems: [{ title: 'Account', path: '/settings/account' }],
  },
  {
    title: 'Help',
    path: '/help',
    icon: <Icon icon='lucide:circle-help' width='24' height='24' />,
  },
]
