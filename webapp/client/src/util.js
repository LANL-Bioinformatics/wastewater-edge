export const workflowList = {
  sra2fastq: {
    label: 'Download SRA Data',
    category: 'data',
    info: 'This tool retrieves sequence project in FASTQ files from NCBI- SRA / EBI - ENA / DDBJ database. Input accession number supports studies(SRP*/ ERP * /DRP*), experiments (SRX*/ERX * /DRX*), samples(SRS * /ERS*/DRS *), runs(SRR * /ERR*/DRR *), or submissions (SRA * /ERA*/DRA *).',
  },
  // Add more workflows here
  wastewater: {
    label: 'WasteWater',
    category: 'wastewater',
    info: 'Processes short-read and long-read ONT sequencing data to characterize the background microbiome of wastewater. This Nextflow pipeline will provide holistic recovery and classification of all microbial sequences (bacteria, viruses, archaea, fungi), using read-based and MAG-based classification techniques. <a href="https://github.com/LANL-Bioinformatics/Standardized_Wastewater_Workflow" target="_blank" >Learn more</a>',
  },
}

// match colors in scss/edgescss
export const colors = {
  primary: '#5856d6',
  secondary: '#6b7785',
  success: '#1b9e3e',
  danger: '#e55353',
  warning: '#f9b115',
  info: '#39f',
  light: '#ebedef',
  gray: '#ced2d8',
  dark: '#212631',
  app: '#6a9e5d',
}
