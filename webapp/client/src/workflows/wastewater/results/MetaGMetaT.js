import { useState, useEffect } from 'react'
import { Card, CardBody, Collapse, TabContent, TabPane, Nav, NavItem, NavLink } from 'reactstrap'
import { Header } from 'src/edge/project/results/CardHeader'
import config from 'src/config'

export const MetaGMetaT = (props) => {
  const [collapseCard, setCollapseCard] = useState(true)
  const url = config.APP.BASE_URI + '/projects/' + props.project.code + '/'
  const title = props.title || 'WasteWater Result'
  const tabs = {
    Summary: 'summary',
    'Krona Plot': 'plot',
  }
  const [activeTab, setActiveTab] = useState(0)

  //handle tab toggle
  const toggleTab = (tab) => {
    setActiveTab(tab)
  }

  useEffect(() => {
    if (props.allExpand > 0) {
      setCollapseCard(false)
    }
  }, [props.allExpand])

  useEffect(() => {
    if (props.allClosed > 0) {
      setCollapseCard(true)
    }
  }, [props.allClosed])

  return (
    <Card className="workflow-result-card">
      <Header
        toggle={true}
        toggleParms={() => {
          setCollapseCard(!collapseCard)
        }}
        title={title}
        collapseParms={collapseCard}
        aiSummary={{
          sectionKey: 'wastewater',
          title,
          project: props.project,
          userType: props.userType,
        }}
      />
      <Collapse isOpen={!collapseCard}>
        <CardBody>
          <>
            <Nav tabs>
              {Object.keys(tabs).map((item, index) => (
                <NavItem key={item + index}>
                  <NavLink
                    style={{ cursor: 'pointer' }}
                    active={activeTab === index}
                    onClick={() => {
                      toggleTab(index)
                    }}
                  >
                    {item}
                  </NavLink>
                </NavItem>
              ))}
            </Nav>
            <TabContent activeTab={activeTab}>
              {Object.keys(tabs).map((item, index) => (
                <TabPane key={index} tabId={index}>
                  <br></br>
                  {item === 'Summary' ? (
                    <>
                      {props.result.summary ? (
                        <>
                          <a
                            className="edge-link edge-text-size-small"
                            href={url + props.result.summary}
                            target="_blank"
                            rel="noreferrer"
                          >
                            [fullscreen]
                          </a>
                          <br></br>
                          <br></br>
                          <iframe
                            key={'summary' + props.project.code}
                            className="edge-iframe"
                            src={url + props.result.summary}
                            alt="Summary"
                          />
                        </>
                      ) : (
                        <span className="red-text">
                          No summary data available
                          <br></br>
                        </span>
                      )}
                    </>
                  ) : item === 'Krona Plot' ? (
                    <>
                      {props.result.plot ? (
                        <>
                          <a
                            className="edge-link edge-text-size-small"
                            href={url + props.result.plot}
                            target="_blank"
                            rel="noreferrer"
                          >
                            [fullscreen]
                          </a>
                          <br></br>
                          <br></br>
                          <iframe
                            key={'plot' + props.project.code}
                            className="edge-iframe"
                            src={url + props.result.plot}
                            alt="Krona Plot"
                          />
                        </>
                      ) : (
                        <span className="red-text">
                          No plot available
                          <br></br>
                        </span>
                      )}
                    </>
                  ) : (
                    <></>
                  )}
                </TabPane>
              ))}
            </TabContent>
          </>
        </CardBody>
      </Collapse>
    </Card>
  )
}

export default MetaGMetaT
