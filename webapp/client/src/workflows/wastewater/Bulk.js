import BulkSubmission from 'src/edge/BulkSubmission/forms/BulkSubmission'
import { workflowOptions } from './defaults'

function Bulk(props) {
  return (
    <BulkSubmission
      workflowOptions={workflowOptions}
      tag={'Waste Water | Bulk Submission'}
      {...props}
    />
  )
}

export default Bulk
