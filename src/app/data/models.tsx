import { JSX } from 'react'

export type SideNavItem = {
  title: string
  path: string
  icon?: JSX.Element
  submenu?: boolean
  subMenuItems?: SideNavItem[]
}

export type ICategory = {
  name: string
  image: string
}
