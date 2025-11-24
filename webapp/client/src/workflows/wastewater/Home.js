import { Col, Row } from 'reactstrap'

function Home() {
  return (
    <div className="animated fadeIn">
      <Row className="justify-content-center">
        <Col xs="12" sm="12" md="12">
          <div className="clearfix">
            <br></br>
            <div className="edge-text-font edge-text-size-large float-left">
              <a href="https://edgebioinformatics.org/" target="_blank" rel="noreferrer">
                EDGE bioinformatics
              </a>{' '}
              is an is an open-source bioinformatics platform with a user-friendly interface that
              allows scientists to perform a number of bioinformatics analyses using
              state-of-the-art tools and algorithms. WASTEWATER EDGE takes an updated EDGE
              Bioinformatics framework and has only the{' '}
              <a
                href="https://github.com/LANL-Bioinformatics/Standardized_Wastewater_Workflow"
                target="_blank"
                rel="noreferrer"
              >
                Standardized Wastewater Workflow
              </a>{' '}
              integrated.
            </div>
            <br></br>
            <center>
              <img
                src="/ww-workflow-overview.png"
                alt="ww workflow overview"
                width="80%"
                height="80%"
              />
            </center>
          </div>
        </Col>
      </Row>
    </div>
  )
}

export default Home
