const fs = require('fs')
const logger = require('../../../utils/logger')
const config = require('../../../config')
const workflowConfig = require('../../config')

const sysError = config.APP.API_ERROR
// Get reference list
const getReflist = async (req, res) => {
  try {
    logger.debug('/api/workflow/data/reflist')
    const rawdata = fs.readFileSync(workflowConfig.data.REF_LIST)
    const reflist = Object.keys(JSON.parse(rawdata)).sort()

    return res.json({
      reflist,
      message: 'Action successful',
      success: true,
    })
  } catch (err) {
    logger.error(`/api/workflow/data/reflist failed: ${err}`)
    return res.status(500).json({
      message: sysError,
      success: false,
    })
  }
}

module.exports = {
  getReflist,
}
