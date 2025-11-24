import { Badge } from 'reactstrap'
import BulkSubmissionTable from '../common/BulkSubmissionTable'

const BulkSubmissions = (props) => {
  return (
    <div className="animated fadeIn">
      <div className="clearfix">
        <Badge color="danger" pill>
          Admin tool
        </Badge>
      </div>
      <br></br>
      <BulkSubmissionTable tableType="admin" title={'Manage BulkSubmissions'} {...props} />
      <br></br>
    </div>
  )
}

export default BulkSubmissions
