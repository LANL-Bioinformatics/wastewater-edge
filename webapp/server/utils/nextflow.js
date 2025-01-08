/* eslint-disable no-unreachable */
const fs = require('fs');
const ejs = require('ejs');
const Job = require('../edge-api/models/job');
const { workflowList, generateWorkflowResult } = require('./workflow');
const { write2log, postData, getData } = require('./common');
const logger = require('./logger');
const config = require('../config');

const generateInputs = async (projHome, projectConf, proj) => {
  // projectConf: project conf.js
  // workflowList in utils/workflow
  const workflowSettings = workflowList[projectConf.workflow.name];
  const template = String(fs.readFileSync(`${config.NEXTFLOW.TEMPLATE_DIR}/${projectConf.category}/${workflowSettings.config_tmpl}`));
  const params = { ...projectConf.workflow.input, outdir: `${projHome}/${workflowSettings.outdir}`, project: proj.name };
  // render input template and write to nextflow_params.json
  const inputs = ejs.render(template, params);
  await fs.promises.writeFile(`${projHome}/nextflow.config`, inputs);
  return true;
};

// submit workflow to nextflow through api
const submitWorkflow = (proj, projectConf, inputsize) => {
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`;
  const workflowName = `${projectConf.workflow.name}`;
  postData(`${config.NEXTFLOW.API_BASE_URL}/submit`, { 'projectDir': projHome, 'workflowName': workflowName }).then(response => {
    logger.debug(response);
    const { jobId } = response;
    if (!jobId) {
      logger.error(`Failed to submit workflow to Nextflow: ${response.error}`);
      proj.status = 'failed';
      proj.updated = Date.now();
      proj.save();
    } else {
      const newJob = new Job({
        id: jobId,
        project: proj.code,
        type: proj.type,
        inputsize,
        queue: 'nextflow',
        status: 'Submitted'
      });
      newJob.save().catch(err => { logger.error('falied to save to nextflow job: ', err); });
      proj.status = 'submitted';
      proj.updated = Date.now();
      proj.save();
    }
  }).catch(error => {
    proj.status = 'failed';
    proj.updated = Date.now();
    proj.save();
    let message = error;
    if (error.data) {
      message = error.data.message;
    }
    write2log(`${config.IO.PROJECT_BASE_DIR}/${proj.code}/log.txt`, message);
    logger.error(`Failed to submit workflow to Nextflow: ${message}`);
  });
};

const abortJob = (job) => {
  // abort job through api
  logger.debug(`POST: ${config.NEXTFLOW.API_BASE_URL}/${job.id}/abort`);
  getData(`${config.NEXTFLOW.API_BASE_URL}/${job.id}/abort`).then(response => {
    logger.debug(response);
    // update job status
    job.status = 'Aborted';
    job.updated = Date.now();
    job.save();
    write2log(`${config.IO.PROJECT_BASE_DIR}/${job.project}/log.txt`, 'Nextflow job aborted.');
  }).catch(error => {
    let message = error;
    if (error.message) {
      message = error.message;
    }
    write2log(`${config.IO.PROJECT_BASE_DIR}/${job.project}/log.txt`, message);
    logger.error(message);
  });
};

const getJobMetadata = (job) => {
  // get job metadata through api
  logger.info(job);
  // get job metadata through api
  logger.debug(`GET: ${config.NEXTFLOW.API_BASE_URL}/${job.id}/metadata`);
  getData(`${config.NEXTFLOW.API_BASE_URL}/${job.id}/metadata`).then(metadata => {
    // logger.debug(JSON.stringify(metadata));
    logger.debug(`${config.IO.PROJECT_BASE_DIR}/${job.project}/run_stats.json`);
    fs.writeFileSync(`${config.IO.PROJECT_BASE_DIR}/${job.project}/run_stats.json`, JSON.stringify(metadata));
  }).catch(error => {
    logger.error(`Failed to get metadata from Nextflow API: ${error}`);
  });
};

const generateRunStats = (job) => {
  getJobMetadata(job);
};

const updateJobStatus = (job, proj) => {
  // get job status through api
  logger.debug(`GET: ${config.NEXTFLOW.API_BASE_URL}/${job.id}/status`);
  getData(`${config.NEXTFLOW.API_BASE_URL}/${job.id}/status`).then(response => {
    logger.debug(JSON.stringify(response));
    // update project status
    if (job.status !== response.status) {
      let status = null;
      if (response.status === 'Running') {
        status = 'running';
      } else if (response.status === 'Succeeded') {
        // generate result.json
        logger.info('generate workflow result.json');
        try {
          generateWorkflowResult(proj);
        } catch (e) {
          job.status = response.status;
          job.updated = Date.now();
          job.save();
          // result not as expected
          proj.status = 'failed';
          proj.updated = Date.now();
          proj.save();
          throw e;
        }
        status = 'complete';
      } else if (response.status === 'Failed') {
        status = 'failed';
      } else if (response.status === 'Aborted') {
        status = 'in queue';
      }
      proj.status = status;
      proj.updated = Date.now();
      proj.save();
      write2log(`${config.IO.PROJECT_BASE_DIR}/${job.project}/log.txt`, `NEXTFLOW job status: ${response.status}`);
    }
    // update job even its status unchanged. We need set new updated time for this job.
    if (response.status === 'Aborted') {
      // delete job
      Job.deleteOne({ project: proj.code }, (err) => {
        if (err) {
          logger.error(`Failed to delete job from DB ${proj.code}:${err}`);
        }
      });
    } else {
      job.status = response.status;
      job.updated = Date.now();
      job.save();
      getJobMetadata(job);
    }
  }).catch(error => {
    let message = error;
    if (error.message) {
      message = error.message;
    }
    write2log(`${config.IO.PROJECT_BASE_DIR}/${job.project}/log.txt`, message);
    logger.error(message);
  });
};

module.exports = {
  generateInputs,
  submitWorkflow,
  generateRunStats,
  abortJob,
  getJobMetadata,
  updateJobStatus,
};
