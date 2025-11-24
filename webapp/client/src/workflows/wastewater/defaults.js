import { workflowList } from 'src/util'

export const workflowOptions = [{ value: 'wastewater', label: workflowList['wastewater'].label }]

export const workflows = {
  wastewater: {
    validForm: false,
    errMessage: 'input error',
    paramsOn: true,
    files: [],
    rawReadsInput: {
      source: 'fastq',
      text: 'READS/FASTQ',
      note: 'Enter either paired-end Illumina data or single-end data from various sequencing platforms in FASTQ format as the input; the file must be compressed. <br/> Acceptable file name extensions: .fastq.gz, .fq.gz',
      sourceOptions: [
        { text: 'READS/FASTQ', value: 'fastq' },
        { text: 'NCBI SRA', value: 'sra' },
      ],
      seqPlatformOptions: [
        { text: 'Short Reads', value: 'Illumina' },
        { text: 'Long Reads', value: 'Long Reads' },
      ],
      seqPlatformText: 'Read Type',
      fastq: {
        enableInput: false,
        placeholder: 'Select a file',
        dataSources: ['upload', 'public'],
        fileTypes: ['fastq.gz', 'fq.gz'],
        projectTypes: [],
        projectScope: ['self+shared'],
        viewFile: false,
        isOptional: false,
        cleanupInput: false,
        maxInput: 1,
        isPaired: true,
      },
    },
  },
}
