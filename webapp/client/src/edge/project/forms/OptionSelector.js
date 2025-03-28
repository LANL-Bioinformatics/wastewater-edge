import React, { useState, useEffect } from 'react'
import { Button, ButtonGroup, Col, Row } from 'reactstrap'
import { MyTooltip } from '../../common/MyTooltip'
import { defaults } from '../../common/util'
import { components } from './defaults'

export const OptionSelector = (props) => {
  const componentName = 'optionSelector'
  const [form, setState] = useState({ ...components[componentName], option: props.defaultValue })
  const [doValidation, setDoValidation] = useState(0)

  const setNewState2 = (name, value) => {
    setState({
      ...form,
      [name]: value,
    })
    setDoValidation(doValidation + 1)
  }

  useEffect(() => {
    setState({ ...components[componentName], option: props.defaultValue })
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
              id={`optionSelectorTooltip-${props.name}`}
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
            {props.options.map((item, index) => (
              <Button
                key={`optionSelector-${index}`}
                color="outline-primary"
                onClick={() => {
                  setNewState2('option', item.value)
                }}
                active={form.option === item.value}
              >
                {item.text}
              </Button>
            ))}
          </ButtonGroup>
        </Col>
      </Row>
    </>
  )
}
