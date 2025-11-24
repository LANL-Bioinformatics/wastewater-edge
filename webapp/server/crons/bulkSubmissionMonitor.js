const fs = require('fs')
const path = require('path')
const ejs = require('ejs')
const randomize = require('randomatic')
const BulkSubmission = require('../edge-api/models/bulkSubmission')
const Project = require('../edge-api/models/project')
const common = require('../utils/common')
const logger = require('../utils/logger')
const {
  validateBulkSubmissionInput,
  workflowList,
} = require('../workflow/util')
const config = require('../config')

const bulkSubmissionMonitor = async () => {
  try {
    logger.debug('bulkSubmission monitor')
    // only process one request at each time
    const bulkSubmissions = await BulkSubmission.find({
      status: 'in queue',
    }).sort({ updated: 1 })
    const bulkSubmission = bulkSubmissions[0]
    if (!bulkSubmission) {
      logger.debug('No bulkSubmission request to process')
      return
    }
    // parse conf.json
    const bulkSubmissionHome = path.join(
      config.IO.BULKSUBMISSION_BASE_DIR,
      bulkSubmission.code,
    )
    const confFile = `${bulkSubmissionHome}/conf.json`
    const rawdata = fs.readFileSync(confFile)
    const conf = JSON.parse(rawdata)
    const log = path.join(
      config.IO.BULKSUBMISSION_BASE_DIR,
      bulkSubmission.code,
      'log.txt',
    )

    logger.info(`Processing bulkSubmission request: ${bulkSubmission.code}`)
    // set bulkSubmissionect status to 'processing'
    bulkSubmission.status = 'processing'
    bulkSubmission.updated = Date.now()
    await bulkSubmission.save()
    common.write2log(log, 'Validate input bulk excel file')
    logger.info('Validate input bulk excel file')
    // process request
    const bulkExcel = `${bulkSubmissionHome}/${conf.bulkfile.name}`
    const { validInput, errMsg, submissions } =
      await validateBulkSubmissionInput(bulkExcel, conf.bulkSubmission.type)

    if (validInput) {
      // submit projects
      const projects = []
      submissions.forEach(async submission => {
        let code = randomize('Aa0', 16)
        let projHome = path.join(config.IO.PROJECT_BASE_DIR, code)
        while (fs.existsSync(projHome)) {
          code = randomize('Aa0', 16)
          projHome = path.join(config.IO.PROJECT_BASE_DIR, code)
        }
        projects.push(code)
        // create project home
        fs.mkdirSync(projHome)
        // create conf.json
        const template = String(
          fs.readFileSync(
            `${config.IO.PROJECT_CONF_TEMPLATE_DIR}/${workflowList[bulkSubmission.type].project_conf_tmpl}`,
          ),
        )
        // render project conf template and write to conf.json
        const inputs = ejs.render(template, submission)
        await fs.promises.writeFile(`${projHome}/conf.json`, inputs)

        // save projec to db
        const newProject = new Project({
          name: submission.proj_name,
          desc: submission.proj_desc,
          type: conf.bulkSubmission.type,
          owner: bulkSubmission.owner,
          code,
        })
        await newProject.save()
      })
      // update bulksubmission
      bulkSubmission.status = 'complete'
      bulkSubmission.projects = projects
      bulkSubmission.updated = Date.now()
      await bulkSubmission.save()
    } else {
      logger.error('Validation failed.')
      logger.error(errMsg)
      common.write2log(log, 'Validation failed.')
      common.write2log(log, errMsg)
      // set bulkSubmissionect status to 'failed'
      bulkSubmission.status = 'failed'
      bulkSubmission.updated = Date.now()
      await bulkSubmission.save()
    }
  } catch (err) {
    logger.error(err)
  }
}

const bulkSubmissionRerunMonitor = async () => {
  logger.debug('bulkSubmission rerun monitor')
  try {
    // rerun failed bulkSubmissions
    const bulks = await BulkSubmission.find({ status: 'rerun' }).sort({
      updated: 1,
    })
    let i
    for (i = 0; i < bulks.length; i += 1) {
      const bulk = bulks[i]
      const { code } = bulk
      logger.info(`rerun bulkSubmission: ${code}`)
      // update bulkSubmission status to 'in queue'
      bulk.status = 'in queue'
      bulk.updated = Date.now()
      bulk.save()
    }
  } catch (err) {
    logger.error(`bulkSubmissionRerunMonitor failed:${err} `)
  }
}

module.exports = {
  bulkSubmissionMonitor,
  bulkSubmissionRerunMonitor,
}
