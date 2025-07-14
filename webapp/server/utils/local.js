const fs = require('fs');
const moment = require('moment');
const Job = require('../edge-api/models/job');
const { timeFormat } = require('./common');
const config = require('../config');


const generateRunStats = async (project) => {
  const job = await Job.findOne({ project: project.code });
  const ms = moment(job.updated, 'YYYY-MM-DD HH:mm:ss').diff(moment(job.created, 'YYYY-MM-DD HH:mm:ss'));
  const d = moment.duration(ms);
  const stats = [];
  stats.push(
    {
      Workflow: job.type,
      Status: job.status,
      'Running Time': timeFormat(d),
      Start: moment(job.created).format('YYYY-MM-DD HH:mm:ss'),
      End: moment(job.updated).format('YYYY-MM-DD HH:mm:ss'),
    }
  );
  fs.writeFileSync(`${config.IO.PROJECT_BASE_DIR}/${project.code}/run_stats.json`, JSON.stringify({ 'stats': stats }));
};

module.exports = {
  generateRunStats,
};
