import React, { useState, useEffect } from 'react'
import { Button, Form } from 'reactstrap'
import { useNavigate } from 'react-router-dom'
import { ToastContainer } from 'react-toastify'
import 'react-toastify/dist/ReactToastify.css'

import { workflowList } from 'src/util'
import { postData, getData, notify, apis, isValidFileInput } from 'src/edge/common/util'
import { LoaderDialog, MessageDialog } from 'src/edge/common/Dialogs'
import MySelect from 'src/edge/common/MySelect'
import { Project } from 'src/edge/project/forms/Project'
import { InputRawReads } from 'src/edge/project/forms/InputRawReads'
import { HtmlText } from 'src/edge/common/HtmlText'
import { workflowOptions, workflows } from './defaults'

const Main = (props) => {
  const navigate = useNavigate()
  const [submitting, setSubmitting] = useState(false)
  const [requestSubmit, setRequestSubmit] = useState(false)
  const [projectParams, setProjectParams] = useState()
  const [rawDataParams, setRawDataParams] = useState()
  const [selectedWorkflows, setSelectedWorkflows] = useState({})
  const [doValidation, setDoValidation] = useState(0)
  const [workflow, setWorkflow] = useState(workflowOptions[0].value)
  const [openDialog, setOpenDialog] = useState(false)
  const [disabled, setDisabled] = useState(false)
  const [sysMsg, setSysMsg] = useState()
  const [allExpand, setAllExpand] = useState(0)
  const [allClosed, setAllClosed] = useState(0)
  //disable the expand | close
  const disableExpandClose = true

  //callback function for child component
  const setProject = (params) => {
    //console.log('main project:', params)
    setProjectParams(params)
    setDoValidation(doValidation + 1)
  }
  //callback function for child component
  const setRawData = (params) => {
    //console.log('rawData:', params)
    setRawDataParams(params)
    setDoValidation(doValidation + 1)
  }
  const setWorkflowParams = (params, workflowName) => {
    //console.log(workflowName, params)
    setSelectedWorkflows({ ...selectedWorkflows, [workflowName]: params })
    setDoValidation(doValidation + 1)
  }

  //submit button clicked
  const onSubmit = () => {
    setSubmitting(true)
    let formData = {}
    formData.category = workflowList[workflow].category
    // set project info
    formData.project = {
      name: projectParams.projectName,
      desc: projectParams.projectDesc,
      type: workflow,
    }
    if (rawDataParams.inputs.source.value === 'sra') {
      formData.rawReads = {
        source: rawDataParams.inputs.source.value,
        accessions: rawDataParams.inputs.inputFiles.value,
      }
      rawDataParams.files = []
    } else if (rawDataParams.inputs.source.value === 'fasta') {
      formData.rawReads = {
        source: rawDataParams.inputs.source.value,
        inputFasta: rawDataParams.inputs.inputFiles.value[0],
      }
    } else {
      formData.rawReads = {
        source: rawDataParams.inputs.source.value,
        seqPlatform: rawDataParams.inputs.seqPlatform.value,
        paired: rawDataParams.inputs.paired.value,
        inputFiles: rawDataParams.inputs.inputFiles.value,
      }
    }

    // set workflow inputs
    let myWorkflow = {
      name: workflow,
      input: {
        read_type: rawDataParams.inputs.seqPlatform.value === 'Illumina' ? 'short' : 'long',
      },
    }
    // set workflow input display
    let inputDisplay = { 'Raw Reads': {} }
    //inputDisplay[workflowList[workflow].label] = {}
    if (rawDataParams.inputs.source.value === 'sra') {
      inputDisplay['Raw Reads'][rawDataParams.inputs['source'].text] =
        rawDataParams.inputs['source'].display
      inputDisplay['Raw Reads']['SRA Accession(s)'] = rawDataParams.inputs['inputFiles'].display
    } else if (rawDataParams.inputs.source.value === 'fasta') {
      inputDisplay['Raw Reads'][rawDataParams.inputs['source'].text] =
        rawDataParams.inputs['source'].display
      inputDisplay['Raw Reads']['Contig/Fasta File'] = rawDataParams.inputs['inputFiles'].display[0]
    } else {
      Object.keys(rawDataParams.inputs).forEach((key) => {
        if (rawDataParams.inputs[key].display) {
          inputDisplay['Raw Reads'][rawDataParams.inputs[key].text] =
            rawDataParams.inputs[key].display
        } else {
          inputDisplay['Raw Reads'][rawDataParams.inputs[key].text] =
            rawDataParams.inputs[key].value
        }
      })
    }

    // set form data
    formData.workflow = myWorkflow
    formData.inputDisplay = inputDisplay

    // files used for caculating total input size on server side
    formData.files = [...rawDataParams.files]

    // submit to server via api
    postData(apis.userProjects, formData)
      .then((data) => {
        setSubmitting(false)
        notify('success', 'Your workflow request was submitted successfully!', 2000)
        setTimeout(() => navigate('/user/projects'), 2000)
      })
      .catch((error) => {
        setSubmitting(false)
        alert(error)
      })
  }

  const closeMsgModal = () => {
    setOpenDialog(false)
  }

  useEffect(() => {
    setRequestSubmit(true)

    if (projectParams && !projectParams.validForm) {
      setRequestSubmit(false)
    }
    if (rawDataParams && !rawDataParams.validForm) {
      setRequestSubmit(false)
    }
  }, [doValidation]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    let url = apis.userInfo
    getData(url)
      .then((data) => {
        if (data.info.allowNewRuns) {
          setDisabled(false)
        } else {
          setSysMsg(data.info.message)
          setDisabled(true)
          setOpenDialog(true)
        }
      })
      .catch((err) => {
        alert(err)
      })
  }, [props])

  return (
    <div
      className="animated fadeIn"
      style={disabled ? { pointerEvents: 'none', opacity: '0.4' } : {}}
    >
      <MessageDialog
        className="modal-lg modal-danger"
        title="System Message"
        isOpen={openDialog}
        html={true}
        message={'<div><b>' + sysMsg + '</b></div>'}
        handleClickClose={closeMsgModal}
      />
      <ToastContainer />
      <LoaderDialog loading={submitting === true} text="Submitting..." />
      <Form
        onSubmit={(e) => {
          e.preventDefault()
        }}
      >
        <div className="clearfix">
          <h4 className="pt-3">WasteWater Workflow</h4>
          <span className="pt-3 text-muted edge-text-size-small">
            <HtmlText text={workflowList[workflow].info} />
            <br></br>
          </span>
          <hr />
          <Project setParams={setProject} />
          <br></br>
          {!disableExpandClose && (
            <>
              <div className="float-end edge-text-size-small">
                <Button
                  style={{ fontSize: 12, paddingBottom: '5px' }}
                  size="sm"
                  className="btn-pill"
                  color="ghost-primary"
                  onClick={() => setAllExpand(allExpand + 1)}
                >
                  expand
                </Button>
                &nbsp; | &nbsp;
                <Button
                  style={{ fontSize: 12, paddingBottom: '5px' }}
                  size="sm"
                  className="btn-pill"
                  color="ghost-primary"
                  onClick={() => setAllClosed(allClosed + 1)}
                >
                  close
                </Button>
                &nbsp; all sections &nbsp;
              </div>
              <br></br>
              <br></br>
            </>
          )}
          {workflow === 'wastewater' && (
            <>
              <InputRawReads
                note={workflows[workflow]['rawReadsInput'].note}
                setParams={setRawData}
                isValidFileInput={isValidFileInput}
                source={workflows[workflow]['rawReadsInput'].source}
                sourceDisplay={workflows[workflow]['rawReadsInput'].text}
                sourceOptionsOn={false}
                sourceOptions={workflows[workflow]['rawReadsInput'].sourceOptions}
                seqPlatformOptions={workflows[workflow]['rawReadsInput'].seqPlatformOptions}
                seqPlatformText={workflows[workflow]['rawReadsInput'].seqPlatformText}
                seqPlatformTooltip={workflows[workflow]['rawReadsInput'].seqPlatformTooltip}
                disableSwitcher={true}
                text={workflows[workflow]['rawReadsInput'].text}
                tooltip={workflows[workflow]['rawReadsInput'].tooltip}
                title={'Input Raw Reads'}
                fastqSettings={
                  workflows[workflow]['rawReadsInput'].fastq
                    ? workflows[workflow]['rawReadsInput'].fastq
                    : {}
                }
                isValid={rawDataParams ? rawDataParams.validForm : false}
                errMessage={rawDataParams ? rawDataParams.errMessage : null}
                allExpand={allExpand}
                allClosed={allClosed}
              />
            </>
          )}
        </div>
        <div className="edge-center">
          <Button
            color="primary"
            onClick={(e) => onSubmit()}
            disabled={!workflow || !requestSubmit}
          >
            Submit
          </Button>{' '}
        </div>
        <br></br>
        <br></br>
      </Form>
    </div>
  )
}

export default Main
