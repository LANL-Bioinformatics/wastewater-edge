const fs = require('fs')
const BulkSubmission = require('../models/bulkSubmission')
const config = require('../../config')

const getBulkSubmission = async (code, type, user) => {
  try {
    // Use $eq to prevent query selector injections
    const bulkSubmission = await BulkSubmission.findOne({
      status: { $ne: 'delete' },
      code: { $eq: code },
    })
    if (bulkSubmission === null) {
      return null
    }
    if (type === 'admin') {
      return bulkSubmission
    }
    if (
      type === 'user' &&
      (bulkSubmission.owner === user.email ||
        bulkSubmission.sharedTo.includes(user.email) ||
        bulkSubmission.public)
    ) {
      return bulkSubmission
    }
    if (type === 'public' && bulkSubmission.public) {
      return bulkSubmission
    }
    return null
  } catch (err) {
    return Promise.reject(err)
  }
}

const updateBulkSubmission = async (query, req) => {
  try {
    const bulk = await BulkSubmission.findOne(query)
    if (!bulk) {
      return null
    }
    if (req.body.name) {
      bulk.name = req.body.name
    }
    if (req.body.desc) {
      bulk.desc = req.body.desc
    }
    if (req.body.status) {
      bulk.status = req.body.status
    }
    if (req.body.filename) {
      bulk.filename = req.body.filename
    }
    if (req.body.projects) {
      bulk.projects = req.body.projects
    }
    if ('public' in req.body) {
      bulk.public = req.body.public
    }
    if (req.body.sharedTo) {
      bulk.sharedTo = req.body.sharedTo
    }
    if (req.body.jobPriority) {
      bulk.jobPriority = req.body.jobPriority
    }

    bulk.updated = Date.now()
    const bulkSubmission = await bulk.save()
    return bulkSubmission
  } catch (err) {
    return Promise.reject(err)
  }
}

// Return conf.json as JSON object
const getBulkSubmissionConf = async (code, type, req) => {
  try {
    const bulk = await getBulkSubmission(code, type, req.user)
    let confJson = {}
    if (bulk) {
      const bulkHome = `${config.IO.PROJECT_BASE_DIR}/${code}`
      confJson = JSON.parse(fs.readFileSync(`${bulkHome}/conf.json`))
    }
    return confJson
  } catch (err) {
    return Promise.reject(err)
  }
}

module.exports = {
  getBulkSubmission,
  updateBulkSubmission,
  getBulkSubmissionConf,
}
