import React from 'react'

const UserProfile = React.lazy(() => import('src/edge/um/user/Profile'))
const UserProjects = React.lazy(() => import('src/edge/um/user/Projects'))
const UserAllProjects = React.lazy(() => import('src/edge/um/user/AllProjects'))
const UserProjectPage = React.lazy(() => import('src/workflows/project/projectPage/User'))
const UserUploadFiles = React.lazy(() => import('src/edge/um/user/UploadFiles'))
const UserUploads = React.lazy(() => import('src/edge/um/user/Uploads'))
const UserJobQueue = React.lazy(() => import('src/edge/um/user/JobQueue'))
const AdminUsers = React.lazy(() => import('src/edge/um/admin/Users'))
const AdminUploads = React.lazy(() => import('src/edge/um/admin/Uploads'))
const AdminProjects = React.lazy(() => import('src/edge/um/admin/Projects'))
const AdminProjectPage = React.lazy(() => import('src/workflows/project/projectPage/Admin'))
const WasteWaterWorkflow = React.lazy(() => import('src//workflows/wastewater/Main'))

const privateRoutes = [
  { path: '/user/profile', exact: true, name: 'Profile', element: UserProfile },
  { path: '/user/projects', exact: true, name: 'UserProjects', element: UserProjects },
  { path: '/user/allProjects', exact: true, name: 'AllProjects', element: UserAllProjects },
  { path: '/user/project', name: 'ProjectPage', element: UserProjectPage },
  { path: '/user/uploadFiles', name: 'UploadFiles', element: UserUploadFiles },
  { path: '/user/uploads', name: 'UserUploads', element: UserUploads },
  { path: '/user/jobQueue', name: 'JobQueue', element: UserJobQueue },
  { path: '/admin/users', name: 'Users', element: AdminUsers },
  { path: '/admin/uploads', name: 'AdminUploads', element: AdminUploads },
  { path: '/admin/projects', exact: true, name: 'AdminProjects', element: AdminProjects },
  { path: '/admin/project', name: 'AdminProjectPage', element: AdminProjectPage },
  { path: '/workflow/wastewater', name: 'WasteWater', element: WasteWaterWorkflow },
]

export default privateRoutes
