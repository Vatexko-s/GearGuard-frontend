import { SideNavItem } from './data/models'
import { Cog8ToothIcon, HomeIcon, QuestionMarkCircleIcon } from '@heroicons/react/24/solid'

export const SIDENAV_ITEMS: SideNavItem[] = [
  {
    title: 'Home',
    path: '/',
    icon: <HomeIcon />,
  },
  {
    title: 'Settings',
    path: '/settings',
    icon: <Cog8ToothIcon />,
    submenu: true,
    subMenuItems: [{ title: 'Account', path: '/settings/account' }],
  },
  {
    title: 'Help',
    path: '/help',
    icon: <QuestionMarkCircleIcon />,
  },
]
