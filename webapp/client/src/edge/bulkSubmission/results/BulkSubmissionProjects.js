import ProjectTable from '../../um/common/ProjectTable'

function BulkSubmissionProjects(props) {
  return (
    <>
      <ProjectTable tableType={props.tableType} bulkSubmissionCode={props.code} {...props} />
    </>
  )
}

export default BulkSubmissionProjects
