const fs = require('fs')
const xlsx = require('node-xlsx').default
const Upload = require('../edge-api/models/upload')
const config = require('../config')
const workflowConfig = require('../config')

const cromwellWorkflows = []
const nextflowWorkflows = ['sra2fastq', 'wastewater']
const nextflowConfigs = {
  profiles: 'common/profiles.nf',
  nf_reports: 'common/nf_reports.tmpl',
}

const workflowList = {
  sra2fastq: {
    outdir: 'output/sra2fastq',
    nextflow_main: 'sra2fastq/nextflow/main.nf -profile local',
    config_tmpl: 'sra2fastq/workflow_config.tmpl',
  },
  wastewater: {
    outdir: 'output/WasteWater',
    nextflow_main: 'wastewater/nextflow/main.nf -profile local',
    config_tmpl: 'wastewater/workflow_config.tmpl',
    project_conf_tmpl: 'wastewater-conf.tmpl',
  },
}

// eslint-disable-next-line no-unused-vars
const generateNextflowWorkflowParams = (projectConf, projHome) => {
  const params = {}
  if (projectConf.workflow.name === 'sra2fastq') {
    // download sra data to shared directory
    params.sraOutdir = config.IO.SRA_BASE_DIR
  }
  return params
}

const generateWorkflowResult = proj => {
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`
  const resultJson = `${projHome}/result.json`

  if (!fs.existsSync(resultJson)) {
    const result = {}
    const projectConf = JSON.parse(fs.readFileSync(`${projHome}/conf.json`))
    const outdir = `${projHome}/${workflowList[projectConf.workflow.name].outdir}`

    if (projectConf.workflow.name === 'sra2fastq') {
      // use relative path
      const { accessions } = projectConf.workflow.input
      accessions.forEach(accession => {
        // link sra downloads to project output
        fs.symlinkSync(`../../../../sra/${accession}`, `${outdir}/${accession}`)
      })
    }
    fs.writeFileSync(resultJson, JSON.stringify(result))
  }
}

const checkFlagFile = proj => {
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`
  // create output directory
  const outDir = `${projHome}/${workflowList[proj.type].outdir}`
  if (proj.type === 'assayDesign') {
    const outJson = `${outDir}/jbrowse/jbrowse_url.json`
    if (!fs.existsSync(outJson)) {
      return false
    }
  }
  return true
}

const getWorkflowCommand = proj => {
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`
  const projectConf = JSON.parse(fs.readFileSync(`${projHome}/conf.json`))
  const outDir = `${projHome}/${workflowList[projectConf.workflow.name].outdir}`
  let command = ''
  if (proj.type === 'assayDesign') {
    // create bioaiConf.json
    const conf = `${projHome}/bioaiConf.json`
    fs.writeFileSync(
      conf,
      JSON.stringify({
        pipeline: 'bioai',
        params: { ...projectConf.workflow.input, ...projectConf.genomes },
      }),
    )
    command += ` && ${workflowConfig.WORKFLOW.BIOAI_EXEC} -i ${conf} -o ${outDir}`
  }
  return command
}

const isValidSampleId = id => {
  if (!id || id.trim() === '') {
    return false
  }
  const regexp = /^[a-zA-Z0-9\-_.]{3,30}$/
  return regexp.test(id.trim())
}

const validateBulkSubmissionInput = async (bulkExcel, type) => {
  // Parse a file
  const workSheetsFromFile = xlsx.parse(bulkExcel)
  const rows = workSheetsFromFile[0].data.filter(row =>
    // Check if all cells in the row are empty (null, undefined, or empty string after trim)
    row.some(
      cell => cell !== null && cell !== undefined && String(cell).trim() !== '',
    ),
  )
  // Remove header
  rows.shift()
  // validate inputs
  let validInput = true
  let errMsg = ''
  let currRow = 1
  const submissions = []
  if (rows.length === 0) {
    validInput = false
    errMsg += 'ERROR: No submission found in the bulk excel file.\n'
  }

  if (type === 'wastewater') {
    // eslint-disable-next-line no-restricted-syntax
    for await (const cols of rows) {
      const submission = {}
      currRow += 1
      if (cols.length < 4) {
        validInput = false
        errMsg += `ERROR: Row ${currRow}: Invalid input.\n`
        return
      }
      // validate Sample Id
      if (!isValidSampleId(cols[0])) {
        validInput = false
        errMsg += `ERROR: Row ${currRow}: Invalid Sample Id\n`
      } else {
        submission.proj_name = cols[0]
        submission.proj_desc = cols[1]
      }
      // get workflow type, default is metaG
      if (cols[2] && cols[2] === 'metaT') {
        submission.pipeline = 'metaT'
      } else {
        submission.pipeline = 'metaG'
      }

      let r1 = ''
      let r1Display = ''
      let r2 = ''
      let r2Display = ''
      // validate the Illumina R1 or Long Reads
      if (!(cols[3] && cols[3].trim())) {
        validInput = false
        errMsg += `ERROR: Row ${currRow}: Illumina R1 or Long Reads required.\n`
      } else {
        const fq = cols[3].trim()
        // it's uploaded file
        // eslint-disable-next-line no-await-in-loop
        const file = await Upload.findOne({
          name: { $eq: fq },
          status: { $ne: 'delete' },
        })
        if (!file) {
          validInput = false
          errMsg += `ERROR: Row ${currRow}: Illumina R1 or Long Reads: ${fq} not found.\n`
        } else {
          r1 = `${config.IO.UPLOADED_FILES_DIR}/${file.code}`
          r1Display = `uploads/${file.owner}/${fq}`
        }
      }
      // validate the Illumina R2
      if (!(cols[4] && cols[4].trim())) {
        submission.readType = 'long'
        submission.readTypeDisplay = 'Long Reads'
        submission.seqPlatform = 'Long Reads'
        submission.seqPlatformDisplay = 'Long Reads'
      } else {
        submission.readType = 'short'
        submission.readTypeDisplay = 'Short Reads'
        submission.seqPlatform = 'Illumina'
        submission.seqPlatformDisplay = 'Illumina'

        const fq = cols[4].trim()
        // it's uploaded file
        // eslint-disable-next-line no-await-in-loop
        const file = await Upload.findOne({
          name: { $eq: fq },
          status: { $ne: 'delete' },
        })
        if (!file) {
          validInput = false
          errMsg += `ERROR: Row ${currRow}: Illumina R2: ${fq} not found.\n`
        } else {
          r2 = `${config.IO.UPLOADED_FILES_DIR}/${file.code}`
          r2Display = `uploads/${file.owner}/${fq}`
        }
      }

      if (validInput) {
        if (submission.readType === 'long') {
          submission.inputFiles = [r1]
          submission.inputFilesDisplay = [r1Display]
          submission.paired = false
          submission.files = [r1]
        } else {
          submission.inputFiles = [{ R1: r1, R2: r2 }]
          submission.inputFilesDisplay = [{ R1: r1Display, R2: r2Display }]
          submission.paired = true
          submission.files = [r1, r2]
          // check if R1 and R2 are the same
          if (r1 === r2) {
            validInput = false
            errMsg += `ERROR: Row ${currRow}: Illumina R1 and R2 cannot be the same file.\n`
          }
        }
      }
      submissions.push(submission)
    }
  }

  // eslint-disable-next-line consistent-return
  return { validInput, errMsg, submissions }
}

module.exports = {
  cromwellWorkflows,
  nextflowWorkflows,
  nextflowConfigs,
  workflowList,
  generateNextflowWorkflowParams,
  generateWorkflowResult,
  checkFlagFile,
  getWorkflowCommand,
  validateBulkSubmissionInput,
}
