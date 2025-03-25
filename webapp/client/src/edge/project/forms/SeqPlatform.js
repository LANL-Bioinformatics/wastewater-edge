import React, { useState, useEffect } from 'react'
import { Button, ButtonGroup, Col, Row } from 'reactstrap'
import { MyTooltip } from '../../common/MyTooltip'
import { defaults } from '../../common/util'
import { components } from './defaults'

export const SeqPlatform = (props) => {
  const componentName = 'seqPlatform'
  const [form, setState] = useState({ ...components[componentName], platform: props.defaultValue })
  const [doValidation, setDoValidation] = useState(0)

  const setNewState2 = (name, value) => {
    setState({
      ...form,
      [name]: value,
    })
    setDoValidation(doValidation + 1)
  }

  useEffect(() => {
    setState({ ...components[componentName], platform: props.defaultValue })
  }, [props.reset]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    //force updating parent's inputParams
    props.setParams(form, props.name)
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Row>
        <Col md="3">
          {props.tooltip ? (
            <MyTooltip
              id={`platformTooltip-${props.name}`}
              tooltip={props.tooltip}
              text={props.text}
              place={props.tooltipPlace ? props.tooltipPlace : defaults.tooltipPlace}
              color={props.tooltipColor ? props.tooltipColor : defaults.tooltipColor}
              showTooltip={props.showTooltip ? props.showTooltip : defaults.showTooltip}
            />
          ) : (
            <>{props.text}</>
          )}{' '}
        </Col>
        <Col xs="12" md="9">
          <ButtonGroup className="mr-3" aria-label="First group" size="sm">
            <Button
              color="outline-primary"
              onClick={() => {
                setNewState2('platform', 'nanopore')
              }}
              active={form.platform === 'nanopore'}
            >
              Nanopore
            </Button>
            <Button
              color="outline-primary"
              onClick={() => {
                setNewState2('platform', 'illumina')
              }}
              active={form.platform === 'illumina'}
            >
              Illumina
            </Button>
            <Button
              color="outline-primary"
              onClick={() => {
                setNewState2('platform', 'pacbio')
              }}
              active={form.platform === 'pacbio'}
            >
              PacBio
            </Button>
          </ButtonGroup>
        </Col>
      </Row>
    </>
  )
}
