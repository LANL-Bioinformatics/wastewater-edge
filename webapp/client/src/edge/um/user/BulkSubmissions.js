import BulkSubmissionTable from '../common/BulkSubmissionTable'

const BulkSubmissions = (props) => {
  return (
    <div className="animated fadeIn">
      <BulkSubmissionTable tableType="user" title={'My BulkSubmissions'} {...props} />
      <br></br>
    </div>
  )
}

export default BulkSubmissions
