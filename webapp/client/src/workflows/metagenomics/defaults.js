import { workflowList } from 'src/util'

export const workflowOptions = [
  { value: 'runFaQCs', label: workflowList['runFaQCs'].label },
  { value: 'assembly', label: workflowList['assembly'].label },
]

export const inputRawReads = {
  validForm: false,
  errMessage: 'input error',
  files: [],
  inputs: {
    source: {
      text: 'Input Source',
      value: 'fastq',
      options: [
        { text: 'Reads/Fastq', value: 'fastq' },
        { text: 'Contigs/Fasta', value: 'fasta' },
      ],
    },
    seqPlatform: {
      text: 'Sequencing Platform',
      value: 'Illumina',
      tooltip:
        'Illumina: high-throughput, short-read sequencing with high accuracy. Nanopore and Pacbio: long reads sequencing technologies.',
      options: [
        { text: 'Nanopore', value: 'Nanopore' },
        { text: 'Illumina', value: 'Illumina' },
        { text: 'PacBio', value: 'PacBio' },
      ],
    },
    paired: {
      text: 'Paired-End?',
      value: true,
    },
    inputFiles: {
      text: 'Fastq Files',
      value: [],
      display: [],
    },
  },
  fastqInput: {
    text: 'Fastq File',
    tooltip:
      'Either paired-end Illumina data or single-end data from various sequencing platform in FASTQ format as the input; the file can be becompressed. <br/>Acceptable file formats: .fastq, .fq, .fastq.gz, .fq.gz<br />Note: The file size limit for the URL input is 10GB',
    enableInput: true,
    placeholder: 'Select a file or enter a file http(s) url',
    dataSources: ['upload', 'public', 'project'],
    fileTypes: ['fastq', 'fq', 'fastq.gz', 'fq.gz'],
    projectTypes: ['sra2fastq'],
    projectScope: ['self+shared'],
    viewFile: false,
    isOptional: false,
    cleanupInput: true,
    maxInput: 1000,
  },
  fastaInput: {
    text: 'Contig Fasta File',
    tooltip:
      'File can be becompressed. <br/>Acceptable file formats: .fasta, .fa, .contigs, .fasta.gz, .fa.gz<br />Note: The file size limit for the URL input is 10GB',
    enableInput: true,
    placeholder: 'Select a file or enter a file http(s) url',
    dataSources: ['upload', 'public'],
    fileTypes: ['fasta', 'fa', 'contigs', 'fasta.gz', 'fa.gz'],
    projectTypes: [],
    projectScope: ['self+shared'],
    viewFile: false,
    isOptional: false,
    cleanupInput: true,
    maxInput: 1000,
  },
  // only for input with validation method
  validInputs: {
    inputFiles: { isValid: false, error: 'File input error.' },
  },
}

export const workflows = {
  runFaQCs: {
    validForm: false,
    errMessage: 'input error',
    paramsOn: true,
    files: [],
    fastqInput: {
      text: 'READS/FASTQ',
      tooltip:
        'ReadsQC requires either paired-end Illumina data or single-end data from various sequencing platform in FASTQ format as the input; the file can be becompressed. <br/>Acceptable file formats: .fastq, .fq, .fastq.gz, .fq.gz<br />Note: The file size limit for the URL input is 10GB',
      enableInput: true,
      placeholder: 'Select a file or enter a file http(s) url',
      dataSources: ['upload', 'public', 'project'],
      fileTypes: ['fastq', 'fq', 'fastq.gz', 'fq.gz'],
      projectTypes: ['sra2fastq'],
      projectScope: ['self+shared'],
      viewFile: false,
      isOptional: false,
      cleanupInput: true,
      maxInput: 1000,
    },
    inputs: {
      trimQual: {
        text: 'Trim Quality Level',
        value: 20,
        rangeInput: {
          tooltip: 'Targets # as quality level (default 20) for trimming',
          defaultValue: 20,
          min: 0,
          max: 40,
          step: 1,
        },
      },
      trim5end: {
        text: "Cut #bp from 5'-end",
        value: 0,
        rangeInput: {
          tooltip: 'Cut # bp from 5 end before quality trimming/filtering',
          defaultValue: 0,
          min: 0,
          max: 100,
          step: 1,
        },
      },
      trim3end: {
        text: "Cut #bp from 3'-end",
        value: 0,
        rangeInput: {
          tooltip: 'Cut # bp from 3 end before quality trimming/filtering',
          defaultValue: 0,
          min: 0,
          max: 100,
          step: 1,
        },
      },
      trimAdapter: {
        text: 'Trim Adapter',
        value: false,
        switcher: {
          tooltip: 'Trim reads with illumina adapter/primers (default: No)',
          trueText: 'Yes',
          falseText: 'No',
          defaultValue: false,
        },
      },
      trimRate: {
        text: 'Trim Adapter mismatch ratio',
        value: 0.2,
        rangeInput: {
          tooltip: "Mismatch ratio of adapters' length(default : 0.2, allow 20% mismatches) ",
          defaultValue: 0.2,
          min: 0.0,
          max: 1.0,
          step: 0.01,
        },
      },
      trimPolyA: {
        text: 'Trim polyA',
        value: false,
        switcher: {
          tooltip: 'Trim poly A ( > 15 )',
          trueText: 'Yes',
          falseText: 'No',
          defaultValue: false,
        },
      },
      artifactFile: {
        text: 'Adapter/Primer FASTA',
        value: null,
        display: null,
        fileInput: {
          tooltip:
            'Additional artifact (adapters/primers/contaminations) reference file in fasta format',
          enableInput: true,
          placeholder: '(Optional) Select a file or enter a file http(s) url',
          dataSources: ['upload', 'public'],
          fileTypes: ['fasta', 'fa', 'fna', 'contigs'],
          viewFile: false,
          isOptional: true,
          cleanupInput: true,
        },
      },
      minLen: {
        text: 'Minimum Read Length',
        value: 50,
        integerInput: {
          tooltip:
            'Trimmed read should have to be at least this minimum length (default:50, range: 0 - 1000)',
          defaultValue: 50,
          min: 0,
          max: 1000,
        },
      },
      avgQual: {
        text: 'Average Quality Cutoff',
        value: 0,
        rangeInput: {
          tooltip: 'Average quality cutoff (default:0, no filtering)',
          defaultValue: 0,
          min: 0,
          max: 40,
          step: 1,
        },
      },
      numN: {
        text: '"N" Base Cutoff',
        value: 2,
        rangeInput: {
          tooltip:
            'Trimmed read has greater than or equal to this number of continuous base "N" will be discarded. (default: 2, "NN")',
          defaultValue: 2,
          min: 1,
          max: 10,
          step: 1,
        },
      },
      filtLC: {
        text: 'Low Complexity Filter',
        value: 0.85,
        rangeInput: {
          tooltip:
            'Low complexity filter ratio, Maximum fraction of mono-/di-nucleotide sequence  (default: 0.85)',
          defaultValue: 0.85,
          min: 0.0,
          max: 1.0,
          step: 0.01,
        },
      },
      filtPhiX: {
        text: 'Filter phiX',
        value: false,
        switcher: {
          tooltip: 'Filter phiX reads',
          trueText: 'Yes',
          falseText: 'No',
          defaultValue: false,
        },
      },
    },
    // only for input with validation method
    validInputs: {
      artifactFile: { isValid: true, error: 'Adapter/Primer FASTA error. Invalid url' },
      minLen: { isValid: true, error: 'Minimum Read Length error. Range: 0 - 1000' },
    },
  },
  assembly: {
    validForm: false,
    errMessage: 'input error',
    paramsOn: true,
    files: [],
    fastqInput: {
      text: 'READS/FASTQ',
      tooltip:
        'Assembly requires either paired-end Illumina data or single-end data from various sequencing platform in FASTQ format as the input; the file can be becompressed. <br/>Acceptable file formats: .fastq, .fq, .fastq.gz, .fq.gz<br />Note: The file size limit for the URL input is 10GB',
      enableInput: true,
      placeholder: 'Select a file or enter a file http(s) url',
      dataSources: ['upload', 'public', 'project'],
      fileTypes: ['fastq', 'fq', 'fastq.gz', 'fq.gz'],
      projectTypes: ['sra2fastq'],
      projectScope: ['self+shared'],
      viewFile: false,
      isOptional: false,
      cleanupInput: true,
      maxInput: 1000,
    },
    inputs: {
      assembler: {
        text: 'Assembler',
        value: 'IDBA_UD',
        tooltip:
          'IDBA_UD performs well on isolates as well as metagenomes but it may not work well on very large genomes; SPAdes performs well on isolates as well as single cell data but it may not work on larger genomes, and it takes more computational resource. PacBio CLR and Oxford Nanopore reads are used for gap closure and repeat resolution.; MEGAHIT is an ultra-fast single-node solution for large and complex metagenomics assembly via succinct de Bruijn graph which achieves low memory assembly.; Unicycler is an assembly pipeline for bacterial genomes. It can assemble Illumina-only read sets where it functions as a SPAdes-optimise. For the best possible assemblies, give it both Illumina reads and long reads, and it will conduct a hybrid assembly.; LRASM is designed for long noise reads such as reads from Nanopore and it assemble fastq/fasta formatted reads using miniasm/wtdbg2/flye and use racon to perform consensus.',
        options: [
          { text: 'IDBA_UD', value: 'IDBA_UD' },
          { text: 'SPAdes', value: 'SPAdes' },
          { text: 'MEGAHIT', value: 'MEGAHIT' },
          { text: 'UniCycler', value: 'UniCycler' },
          { text: 'LRASM', value: 'LRASM' },
        ],
        notes: {
          IDBA_UD:
            '<a href="https://github.com/loneknightpy/idba" target="_blank" rel="noopener noreferrer">IDBA_UD</a> performs well on isolates as well as metagenomes but it may not work well on very large genomes.',
          SPAdes:
            '<a href="https://github.com/ablab/spades" target="_blank" rel="noopener noreferrer">SPAdes</a> performs well on isolates as well as single cell data but \
          it may not work on larger genomes, and it takes more computational resource.PacBio CLR and Oxford Nanopore reads are used for gap closure and repeat resolution.',
          MEGAHIT:
            '<a href="https://github.com/voutcn/megahit" target="_blank" rel="noopener noreferrer">MEGAHIT</a> is an ultra-fast single-node solution for large and complex metagenomics assembly via succinct de Bruijn graph which achieves low memory assembly.',
          UniCycler:
            '<a href="https://github.com/rrwick/Unicycler" target="_blank" rel="noopener noreferrer">Unicycler</a> is an assembly pipeline for bacterial genomes. \
          It can assemble Illumina-only read sets where it functions as a SPAdes-optimise. \
          For the best possible assemblies, give it both Illumina reads and long reads, and it will conduct a hybrid assembly. ',
          LRASM:
            '<a href="https://gitlab.com/chienchi/long_read_assembly" target="_blank" rel="noopener noreferrer">LRASM</a> is designed for long noise reads such as reads \
          from Nanopore and it assemble fastq/fasta formatted reads using minimap2/miniasm and use racon to perform consensus.',
        },
      },
      minContigSize: {
        text: 'Minimum Contig Length',
        value: 50,
        integerInput: {
          tooltip:
            'Trimmed read should have to be at least this minimum length (default:50, range: 0 - 1000)',
          defaultValue: 200,
          min: 0,
          max: 1000,
        },
      },
      aligner: {
        text: 'Validation Aligner',
        value: 'bwa',
        tooltip:
          'After assembly, the reads will use the aligner mapped to assembled contigs for validation.',
        options: [
          { text: 'Bowtie 2', value: 'bowtie2' },
          { text: 'BWA mem', value: 'bwa' },
          { text: 'Minimap2', value: 'minimap2' },
        ],
      },
    },
    assemblerInputs: {
      IDBA_UD: {
        idba_minK: {
          text: 'Minimum Kmer Length',
          value: 31,
          rangeInput: {
            defaultValue: 31,
            min: 1,
            max: 99,
            step: 1,
          },
        },
        idba_maxK: {
          text: 'Maximum Kmer Length',
          value: 121,
          rangeInput: {
            defaultValue: 121,
            min: 1,
            max: 151,
            step: 1,
          },
        },
        idba_step: {
          text: 'Step Size',
          value: 20,
          rangeInput: {
            defaultValue: 20,
            min: 1,
            max: 50,
            step: 1,
          },
        },
      },
      SPAdes: {
        spades_algorithm: {
          text: 'Algorithm',
          value: 'default',
          tooltip:
            '<table border="1"><tbody>' +
            '<tr><th>Algorithm</th><th>Targeting applications</th></tr>' +
            '<tr><td>Default</td><td>General genome assembly</td></tr>' +
            '<tr><td>Single-cell</td><td>MDA (single-cell) data</td></tr>' +
            '<tr><td>Metagenome</td><td>Complex metagenome assembly</td></tr>' +
            '<tr><td>Plasmids</td><td>plasmidSPAdes pipeline for plasmid detection</td></tr>' +
            '<tr><td>RNAseq</td><td>Transcriptome assembly</td></tr>' +
            '<tr><td>Biosynthetic</td><td>non-ribosomal and polyketide gene clusters assembly</td></tr>' +
            '<tr><td>Corona</td><td>coronavirus assembly</td></tr>' +
            '<tr><td>Metaviral</td><td>extracting extrachromosomal elements from metagenomic assemblies</td></tr>' +
            '<tr><td>Metaplasmid</td><td>plasmid detection in metagenomic datasets</td></tr>' +
            '<tr><td>RNA viral</td><td>virus assembly module from RNA-Seq data</td></tr>' +
            '</tbody></table>',
          options: [
            { value: 'default', label: 'Default' },
            { value: 'singlecell', label: 'Single-cell (MDA)' },
            { value: 'metagenome', label: 'Metagenome (metaSPAdes)' },
            { value: 'plasmid', label: 'Plasmids (plasmidSPAdes)' },
            { value: 'rna', label: 'RNASeq (rnaSPAdes)' },
            { value: 'biosyntheticSPAdes', label: 'Biosynthetic(biosyntheticSPAdes)' },
            { value: 'coronaSPAdes', label: 'Corona(coronaSPAdes)' },
            { value: 'metaviralSPAdes', label: 'Metaviral(metaviralSPAdes)' },
            { value: 'metaplasmidSPAdes', label: 'Metaplasmid(metaplasmidSPAdes)' },
            { value: 'rnaviralSPAdes', label: 'RNA viral(rnaviralSPAdes)' },
          ],
        },
        spades_pacbio: {
          text: 'Pacbio Subreads Fasta/q',
          value: null,
          display: null,
          fileInput: {
            enableInput: true,
            placeholder: '(Optional) Select a file or enter a file http(s) url',
            dataSources: ['upload', 'public'],
            fileTypes: ['fasta', 'fa', 'fna', 'contigs', 'fq', 'fastq'],
            viewFile: false,
            isOptional: true,
            cleanupInput: true,
          },
        },
        spades_nanopore: {
          text: 'Nanopore Reads Fasta/q',
          value: null,
          display: null,
          fileInput: {
            enableInput: true,
            placeholder: '(Optional) Select a file or enter a file http(s) url',
            dataSources: ['upload', 'public'],
            fileTypes: ['fasta', 'fa', 'fna', 'contigs', 'fq', 'fastq'],
            viewFile: false,
            isOptional: true,
            cleanupInput: true,
          },
        },
      },
      MEGAHIT: {
        megahit_preset: {
          text: 'Preset',
          value: 'meta',
          tooltip:
            '<table border="1"><tbody>' +
            '<tr><th>Presets</th><th>Targeting applications</th></tr>' +
            '<tr><td>meta</td><td>General metagenome assembly, such as guts</td></tr>' +
            '<tr><td>meta-sensitive</td><td>More sensitive metagenome assembly, but slower</td></tr>' +
            '<tr><td>meta-large</td><td>Large and complex metagenome assembly, such as soil</td></tr>' +
            '</tbody></table>',
          options: [
            { value: 'meta', label: 'meta' },
            { value: 'meta-sensitive', label: 'meta-sensitive' },
            { value: 'meta-large', label: 'meta-large' },
          ],
        },
      },
      UniCycler: {
        Unicycler_bridgingMode: {
          text: 'Bridging Mode',
          value: 'normal',
          tooltip:
            'Normal = moderate contig size and misassembly rate; Conservative = smaller contigs, lowest misassembly rate; Bold = longest contigs, higher misassembly rate.',
          options: [
            { text: 'Normal', value: 'normal' },
            { text: 'Conservative', value: 'conservative' },
            { text: 'Bold', value: 'bold' },
          ],
        },
        Unicycler_longreads: {
          text: 'Long Reads Fasta/q',
          value: null,
          display: null,
          fileInput: {
            enableInput: true,
            placeholder: '(Optional) Select a file or enter a file http(s) url',
            dataSources: ['upload', 'public'],
            fileTypes: ['fasta', 'fa', 'fna', 'contigs', 'fq', 'fastq'],
            viewFile: false,
            isOptional: true,
            cleanupInput: true,
          },
        },
        Unicycler_minLongReads: {
          text: 'Minimum Long Reads Cutoff (bp)',
          value: 2000,
          integerInput: {
            tooltip: 'Default:2000, range: 1 - 10000',
            defaultValue: 2000,
            min: 1,
            max: 10000,
          },
        },
      },
      LRASM: {
        Lrasm_algorithm: {
          text: 'Algorithm',
          value: 'flye',
          tooltip:
            '<a href="https://www.ncbi.nlm.nih.gov/pubmed/27153593" target="_blank" rel="noopener noreferrer"><span style="color:yellow;">miniasm</span></a> ' +
            'is a fast OLC-based de novo assembler for noisy long reads. It takes all-vs-all read self-mappings ' +
            '(<a href="https://github.com/lh3/minimap2" target="_blank" rel="noopener noreferrer"><span style="color:yellow;">minimap2</span></a>) as input and outputs an assembly graph ' +
            'in the GFA format. <a href="https://github.com/ruanjue/wtdbg2" target="_blank" rel="noopener noreferrer"><span style="color:yellow;">wtdbg2</span></a> uses fuzzy Bruijn graph approach to ' +
            'do long noisy reads assembly. It is able to assemble large/deep/complex genome at a speed tens of times faster than OLC-based assembler ' +
            'with comparable base accuracy.',
          options: [
            { text: 'minasm', value: 'minasm' },
            { text: 'wtdbg2', value: 'wtdbg2' },
            { text: 'flye', value: 'flye' },
            { text: 'metaFlye', value: 'metaFlye' },
          ],
        },
        Lrasm_ec: {
          text: 'Error Correction',
          value: false,
          switcher: {
            tooltip:
              'Reads Error-correction by racon using all-vs-all pairwise overlaps between reads including dual overlaps. This step is computationally intensive in terms of memory and time usage.',
            trueText: 'Yes',
            falseText: 'No',
            defaultValue: false,
          },
        },
        Lrasm_preset: {
          text: 'Preset',
          value: 'nanopore',
          options: [
            { text: 'Nanopore', value: 'nanopore' },
            { text: 'Nanopore HQ', value: 'nanopore-hq' },
            { text: 'Pacbio', value: 'pacbio' },
            { text: 'Pacbio HiFi', value: 'pacbio-hifi' },
          ],
        },
        Lrasm_numConsensus: {
          text: 'Num of Iteration of Consensus',
          value: 3,
          rangeInput: {
            defaultValue: 3,
            min: 1,
            max: 5,
            step: 1,
          },
        },
      },
    },
    // only for input with validation method
    validInputs: {
      IDBA_UD: {
        minContigSize: { isValid: true, error: 'Minimum Read Length error. Range: 0 - 1000' },
      },
      SPAdes: {
        minContigSize: { isValid: true, error: 'Minimum Read Length error. Range: 0 - 1000' },
        spades_pacbio: { isValid: true, error: 'Pacbio Subreads Fasta/q error. Invalid url' },
        spades_nanopore: { isValid: true, error: 'Nanopore Reads Fasta/q error. Invalid url' },
      },
      MEGAHIT: {
        minContigSize: { isValid: true, error: 'Minimum Read Length error. Range: 0 - 1000' },
      },
      UniCycler: {
        minContigSize: { isValid: true, error: 'Minimum Read Length error. Range: 0 - 1000' },
        Unicycler_longreads: { isValid: true, error: 'Long Reads Fasta/q error. Invalid url' },
        Unicycler_minLongReads: {
          isValid: true,
          error: 'Minimum Long Reads Cutoff (bp) error. Range: 1 - 10000',
        },
      },
      LRASM: {
        minContigSize: { isValid: true, error: 'Minimum Read Length error. Range: 0 - 1000' },
      },
    },
  },
}
