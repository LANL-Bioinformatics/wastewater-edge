const path = require('path');
const fs = require('fs');
const Papa = require('papaparse');
const Upload = require('../edge-api/models/upload');
const config = require('../config');

const cromwellWorkflows = [];
const nextflowWorkflows = [
  'wastewater',
];
const nextflowConfigs = {
  executor_config: {
    slurm: 'slurm.config',
    local: 'local.config',
  },
  module_params: 'module_params.tmpl',
  container_config: 'container.config',
  nf_reports: 'nf_reports.tmpl',
};

const workflowList = {
  wastewater: {
    outdir: 'output/WasteWater',
    nextflow_main: 'main.nf',
    config_tmpl: 'workflow_config.tmpl',
  },
};

const linkCopyFile = async (file, dir, action, uploadOnly) => {
  try {
    // create dir
    const inputDir = dir;
    if (!fs.existsSync(inputDir)) {
      fs.mkdirSync(inputDir);
    }
    let name = path.basename(file);
    let linkedName = `${inputDir}/${name}`;
    if (file.startsWith(config.IO.UPLOADED_FILES_DIR)) {
      // link uploaded file with realname
      const upload = await Upload.findOne({ 'code': name });
      if (upload) {
        name = upload.name;
      }
      linkedName = `${inputDir}/${name}`;
      let i = 1;
      // handle duplicated uploaded files
      while (fs.existsSync(linkedName)) {
        i += 1;
        if (name.includes('.')) {
          const newName = name.replace('.', `${i}.`);
          linkedName = `${inputDir}/${newName}`;
        } else {
          linkedName = `${inputDir}/${name}${i}`;
        }
      }
      if (action === 'link') {
        fs.symlinkSync(file, linkedName, 'file');
      } else {
        fs.copyFileSync(file, linkedName);
      }
    } else if (!uploadOnly) {
      if (action === 'link') {
        fs.symlinkSync(file, linkedName, 'file');
      } else {
        fs.copyFileSync(file, linkedName);
      }
    }
    return linkedName;
  } catch (err) {
    return Promise.reject(err);
  }
};

const generateWorkflowResult = (proj) => {
  const projHome = `${config.IO.PROJECT_BASE_DIR}/${proj.code}`;
  const resultJson = `${projHome}/result.json`;

  if (!fs.existsSync(resultJson)) {
    const result = {};
    const projectConf = JSON.parse(fs.readFileSync(`${projHome}/conf.json`));
    const outdir = `${projHome}/${workflowList[projectConf.workflow.name].outdir}`;

    if (projectConf.workflow.name === 'wastewater') {
      // find imge files
      const imgDir = `${outdir}/images`;
      if (fs.existsSync(imgDir)) {
        const imgFiles = fs.readdirSync(imgDir);
        result.images = {};
        imgFiles.forEach((f) => {
          if (f.endsWith('.png') || f.endsWith('.jpg') || f.endsWith('.jpeg') || f.endsWith('.svg')) {
            const name = f.replace(/\.(png|jpg|jpeg|svg)$/, '');
            result.images[name] = `${config.SERVER.HOST_URL}/project/${proj.code}/output/WasteWater/images/${f}`;
          }
        });
      }

      // find report file
      const reportFile = `${outdir}/report/wastewater_report.html`;
      if (fs.existsSync(reportFile)) {
        result.report = `${config.SERVER.HOST_URL}/project/${proj.code}/output/WasteWater/report/wastewater_report.html`;
      }

      // read summary tsv file
      const summaryTsv = `${outdir}/summary/wastewater_summary.tsv`;
      if (fs.existsSync(summaryTsv)) {
        const tsvContent = fs.readFileSync(summaryTsv, 'utf8');
        const tsvData = Papa.parse(tsvContent, { header: true });
        if (tsvData && tsvData.data && tsvData.data.length > 0) {
          result.summary = tsvData.data;
        }
      }
    }

    fs.writeFileSync(resultJson, JSON.stringify(result));
  }
};

module.exports = {
  cromwellWorkflows,
  nextflowWorkflows,
  nextflowConfigs,
  workflowList,
  linkCopyFile,
  generateWorkflowResult,
};
