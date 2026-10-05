import BulkSubmission from 'src/edge/bulkSubmission/forms/BulkSubmission'
import { bulkWorkflowOptions } from './defaults'

function Bulk(props) {
  return (
    <BulkSubmission
      workflowOptions={bulkWorkflowOptions}
      tag={'Waste Water | Bulk Submission'}
      {...props}
      projectNameText={'Name'}
      projectNamePattern={'^[a-zA-Z0-9\-_.]{3,30}$'}
      projectNameErrMessage={
        'Required, at 3 but less than 30 characters. <br/>Only alphabets, numbers, dashs, dots and underscore are allowed in the name.'
      }
    />
  )
}

export default Bulk
