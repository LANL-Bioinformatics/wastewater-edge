const fs = require('fs');
const { exec } = require('child_process');
const Project = require('../edge-api/models/project');
const Job = require('../edge-api/models/job');
const common = require('../utils/common');
const logger = require('../utils/logger');
const { localWorkflows, workflowList } = require('../utils/workflow');

const config = require('../config');

const localWorkflowMonitor = async () => {
  logger.debug('Local workflow monitor');
  try {
    // only process one job at each time based on job updated time
    const jobs = await Job.find({ 'queue': 'local', 'status': { $in: ['Submitted', 'Running'] } }).sort({ updated: 1 });
    // submit request only when the current local running jobs less than the max allowed jobs
    if (jobs.length >= config.LOCAL.NUM_JOBS_MAX) {
      return;
    }
    // only process one request at each time
    const projs = await Project.find({ 'type': { $in: localWorkflows }, 'status': 'in queue' }).sort({ updated: 1 });
    const proj = projs[0];
    if (!proj) {
      logger.debug('No local request to process');
      return;
    }
    logger.info(`Processing local request: ${proj.code}`);
    // process request
    const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`;
    const projectConf = JSON.parse(fs.readFileSync(`${projHome}/conf.json`));
    // create output directory
    const outDir = `${projHome}/${workflowList[projectConf.workflow.name].outdir}`;
    fs.mkdirSync(outDir, { recursive: true });
    // in case nextflow needs permission to write to the output directory
    fs.chmodSync(outDir, '777');
    const newJob = new Job({
      id: proj.code,
      project: proj.code,
      type: proj.type,
      queue: 'local',
      status: 'Running'
    });
    newJob.save();
    // set project status to 'running'
    proj.status = 'running';
    proj.updated = Date.now();
    proj.save();
    common.write2log(`${projHome}/log.txt`, 'Running...');
    if (proj.type === 'assayDesign') {
      logger.info('Run bioAI...');
      // create bioaiConf.json
      const conf = `${projHome}/bioaiConf.json`;
      fs.writeFileSync(conf, JSON.stringify({ pipeline: 'bioai', params: { ...projectConf.workflow.input, ...projectConf.genomes } }));
      const outJson = `${outDir}/bioai_out.json`;
      const log = `${projHome}/log.txt`;
      const cmd = `${config.WORKFLOW.BIOAI_EXEC} -i ${conf} -o ${outDir} >> ${log} 2>&1`;

      common.write2log(`${config.IO.PROJECT_BASE_DIR}/${proj.code}/log.txt`, cmd);
      logger.info(cmd);
      // run local
      exec(cmd, (error, stdout, stderr) => {
        let status = 'complete';
        let jobStatus = 'Complete';
        if (error) {
          status = 'failed';
          common.write2log(`${config.IO.PROJECT_BASE_DIR}/${proj.code}/log.txt`, error.message);
          logger.error(error.message);
        }
        if (stderr) {
          status = 'failed';
          jobStatus = 'Failed';
          logger.error(stderr);
        }
        if (!fs.existsSync(outJson)) {
          status = 'failed';
          jobStatus = 'Failed';
          logger.error('Failed.');
        }
        newJob.status = jobStatus;
        newJob.updated = Date.now();
        newJob.save();
        proj.status = status;
        proj.updated = Date.now();
        proj.save();
      });
    }
  } catch (err) {
    logger.error(`localMonitor failed:${err}`);
  }
};

module.exports = {
  localWorkflowMonitor,
};
