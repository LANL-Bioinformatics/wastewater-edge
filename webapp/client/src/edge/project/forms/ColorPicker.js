import { useState, useEffect } from 'react'
import { Col, Row } from 'reactstrap'
import { MuiColorInput } from 'mui-color-input'
import { MyTooltip } from '../../common/MyTooltip'
import { defaults } from '../../common/util'
import { components } from './defaults'

export const ColorPicker = (props) => {
  const componentName = 'ColorPicker'
  const [form, setState] = useState({ ...components[componentName] })
  const [doValidation, setDoValidation] = useState(0)

  const handleChange = (color) => {
    form.color = color
    setDoValidation(doValidation + 1)
  }

  useEffect(() => {
    form.color = props.color ? props.color : '#000000'
  }, [props.color]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    props.setParams(form, props.name)
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <>
      <Row>
        <Col md="3">
          {props.tooltip ? (
            <MyTooltip
              id={`colorPickerTooltip-${props.name}`}
              tooltip={props.tooltip}
              text={props.text}
              place={props.tooltipPlace ? props.tooltipPlace : defaults.tooltipPlace}
              color={props.tooltipColor ? props.tooltipColor : defaults.tooltipColor}
              showTooltip={props.showTooltip ? props.showTooltip : defaults.showTooltip}
              clickable={props.tooltipClickable ? props.tooltipClickable : false}
            />
          ) : (
            <>{props.text}</>
          )}
          <br></br>
        </Col>
        <Col xs="12" md="9">
          <MuiColorInput
            value={form.color ? form.color : props.color}
            fallbackValue={props.color ? props.color : '#000000'}
            onChange={handleChange}
            format={props.format ? props.format : 'hex'}
            size={props.size ? props.size : 'small'}
            variant={props.variant ? props.variant : 'outlined'}
            isAlphaHidden={props.isAlphaHidden ? props.isAlphaHidden : true}
            fullWidth={props.fullWidth ? props.fullWidth : true}
            sx={{
              '& .MuiOutlinedInput-root': {
                '& fieldset': {
                  borderColor: '#dad9d9', // Default border color
                  borderWidth: '1px',
                },
                '&:hover fieldset': {
                  borderWidth: '1px',
                  borderColor: '#dad9d9', // Border color on hover
                },
                '&.Mui-focused fieldset': {
                  borderWidth: '1px',
                  borderColor: '#aaaee4ff', // Border color when focused
                  boxShadow: '0 0 0 0.25rem #d5d8f8', // Focused shading
                },
              },
            }}
          />
        </Col>
      </Row>
    </>
  )
}
