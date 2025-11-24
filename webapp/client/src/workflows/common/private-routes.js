import React from 'react'
import config from 'src/config'
const SRAWorkflow = React.lazy(() => import('src/workflows/sra/Main'))
const WasteWaterWorkflow = React.lazy(() => import('src//workflows/wastewater/Main'))
const WastewaterBulkSubmission = React.lazy(() => import('src/workflows/wastewater/Bulk'))

const workflowPrivateRoutes = [
  config.APP.SRADATA_IS_ENABLED && { path: '/user/sradata', name: 'Data', element: SRAWorkflow },
  // Add more workflow private routes here
  { path: '/workflow/wastewater', name: 'WasteWater', element: WasteWaterWorkflow },
  {
    path: '/user/wastewater/bulk',
    name: 'WasteWater Bulk Submission',
    element: WastewaterBulkSubmission,
  },
]

export default workflowPrivateRoutes
