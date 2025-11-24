const BulkSubmission = require('../models/bulkSubmission')
const Project = require('../models/project')
const {
  getBulkSubmission,
  getBulkSubmissionConf,
  updateBulkSubmission,
} = require('../utils/bulkSubmission')
const logger = require('../../utils/logger')
const config = require('../../config')

const sysError = config.APP.API_ERROR

// Get bulkSubmission
const getOne = async (req, res) => {
  try {
    logger.debug(`/api/admin/bulkSubmissions get: ${req.params.code}`)
    // find the bulkSubmission by code
    const bulkSubmission = await getBulkSubmission(
      req.params.code,
      'admin',
      req.user,
    )

    if (!bulkSubmission) {
      logger.error(
        `bulkSubmission ${req.params.code} not found or access denied.`,
      )
      return res.status(400).json({
        error: {
          bulkSubmission: `bulkSubmission ${req.params.code} not found or access denied`,
        },
        message: 'Action failed',
        success: false,
      })
    }
    return res.send({
      bulkSubmission,
      message: 'Action successful',
      success: true,
    })
  } catch (err) {
    logger.error(`Admin get bulkSubmission failed: ${err}`)

    return res.status(500).json({
      message: sysError,
      success: false,
    })
  }
}

// Update bulkSubmission
const updateOne = async (req, res) => {
  try {
    logger.debug(`/api/admin/bulkSubmissions update: ${req.params.code}`)
    const query = { code: { $eq: req.params.code }, status: { $ne: 'delete' } }
    const bulkSubmission = await updateBulkSubmission(query, req)

    if (!bulkSubmission) {
      logger.error(
        `bulkSubmission ${req.params.code} not found or access denied.`,
      )
      return res.status(400).json({
        error: {
          bulkSubmission: `bulkSubmission ${req.params.code} not found or access denied`,
        },
        message: 'Action failed',
        success: false,
      })
    }
    return res.send({
      bulkSubmission,
      message: 'Action successful',
      success: true,
    })
  } catch (err) {
    logger.error(`Admin update bulkSubmission failed: ${err}`)

    return res.status(500).json({
      message: sysError,
      success: false,
    })
  }
}

// Get bulkSubmission configuration file
const getConf = async (req, res) => {
  try {
    logger.debug(`/api/admin/bulkSubmissions/${req.params.code}/conf`)
    const conf = await getBulkSubmissionConf(req.params.code, 'admin', req)

    return res.json({
      conf,
      message: 'Action successful',
      success: true,
    })
  } catch (err) {
    logger.error(
      `/api/admin/bulkSubmissions/${req.params.code}/conf failed: ${err}`,
    )
    return res.status(500).json({
      message: sysError,
      success: false,
    })
  }
}

// Find all bulkSubmissions
const getAll = async (req, res) => {
  try {
    logger.debug('/api/admin/bulkSubmissions')
    const bulkSubmissions = await BulkSubmission.find({
      status: { $ne: 'delete' },
    }).sort([['updated', -1]])

    return res.send({
      bulkSubmissions,
      message: 'Action successful',
      success: true,
    })
  } catch (err) {
    logger.error(`Admin get all bulkSubmissions failed: ${err}`)
    return res.status(500).json({
      message: sysError,
      success: false,
    })
  }
}

// Get projects in bulkSubmission
const getProjects = async (req, res) => {
  try {
    logger.debug(`/api/admin/bulkSubmissions/${req.params.code}/projects`)
    const bulkSubmission = await getBulkSubmission(
      req.params.code,
      'admin',
      req.user,
    )

    if (!bulkSubmission) {
      logger.error(
        `bulkSubmission ${req.params.code} not found or access denied.`,
      )
      return res.status(400).json({
        error: {
          projects: `bulkSubmission ${req.params.code} not found or access denied`,
        },
        message: 'Action failed',
        success: false,
      })
    }

    // return projects
    let projects = []
    if (bulkSubmission.projects && bulkSubmission.projects.length > 0) {
      projects = await Project.find({
        code: { $in: bulkSubmission.projects },
      }).sort([['updated', -1]])
    }

    return res.json({
      projects,
      message: 'Action successful',
      success: true,
    })
  } catch (err) {
    logger.error(
      `/api/admin/bulkSubmissions/${req.params.code}/projects failed: ${err}`,
    )
    return res.status(500).json({
      message: sysError,
      success: false,
    })
  }
}

module.exports = {
  getOne,
  updateOne,
  getConf,
  getAll,
  getProjects,
}
