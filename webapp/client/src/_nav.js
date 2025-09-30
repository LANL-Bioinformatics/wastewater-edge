import React from 'react'
import CIcon from '@coreui/icons-react'
import { cilSpeedometer, cilGrid, cilCloudUpload, cilLayers } from '@coreui/icons'
import { CNavGroup, CNavItem, CNavTitle } from '@coreui/react'

const _nav = [
  {
    component: CNavItem,
    name: 'Home',
    to: '/home',
    icon: <CIcon icon={cilSpeedometer} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Public Projects',
    to: '/public/projects',
    icon: <CIcon icon={cilGrid} customClassName="nav-icon" />,
  },
  {
    component: CNavItem,
    name: 'Upload Files',
    to: '/user/uploads',
    icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
  },
  {
    component: CNavTitle,
    name: 'Workflows',
  },
  {
    component: CNavItem,
    name: 'Wastewater Workflow',
    to: '/workflow/wastewater',
    icon: <CIcon icon={cilCloudUpload} customClassName="nav-icon" />,
  },
]

export default _nav
