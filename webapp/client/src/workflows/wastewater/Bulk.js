import BulkSubmission from 'src/edge/bulkSubmission/forms/BulkSubmission'
import { bulkWorkflowOptions } from './defaults'

function Bulk(props) {
  return (
    <BulkSubmission
      workflowOptions={bulkWorkflowOptions}
      tag={'Waste Water | Bulk Submission'}
      {...props}
    />
  )
}

export default Bulk
