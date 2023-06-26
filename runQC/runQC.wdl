task RunQC {
  input {
    File pairedFile
    File unpairedFile
    Float avg_read_length
    Int numCPU
    Map[String, String] configuration
  }

  String outputDir = "${outDir}/QcReads"
  String log = "${outputDir}/QC.log"
  Int quality_cutoff = default(configuration["q"], 5)
  Int min_length = default(configuration["min_L"], 50)
  Int avg_quality = default(configuration["avg_q"], 0)
  Int num_N = default(configuration["n"], 10)
  Float low_complexity = default(configuration["lc"], 0.85)
  Int cut_3_end = default(configuration["3end"], 0)
  Int cut_5_end = default(configuration["5end"], 0)
  Int split_size = default(configuration["split_size"], 100000)
  Int ont_flag = configuration["fastq_source"].contains("nanopore") ? 1 : 0
  Int pacbio_flag = configuration["fastq_source"].contains("pacbio") ? 1 : 0
  String unpairedFile_output = (configuration["porechop"] && ont_flag) ? "${outputDir}/QC.unpaired.porechop.fastq" : "${outputDir}/QC.unpaired.trimmed.fastq"
  min_length = (min_length >= 1) ? min_length : int(min_length * avg_read_length)
  String parameters = ""
  parameters += " -p ${pairedFile}" if (pairedFile != null)
  parameters += " -u ${unpairedFile}" if (unpairedFile != null)
  parameters += " -q ${quality_cutoff} --min_L ${min_length} --avg_q ${avg_quality} -n ${num_N} --lc ${low_complexity} --5end ${cut_5_end} --3end ${cut_3_end}"
  parameters += " --split_size ${split_size} -d ${outputDir} -t ${numCPU}"
  parameters += " --adapter --artifactFile ${configuration["adapter"]}" if (configuration["adapter"] != null && is_fasta(configuration["adapter"]))
  parameters += " --polyA" if (configuration["polyA"])
  parameters += " --trim_only" if (ont_flag || pacbio_flag)
  parameters += " --ascii ${configuration["qc_phred_offset"]}" if (configuration["qc_phred_offset"])

  String command = "${RealBin}/bin/FaQCs ${parameters} > ${log} 2>&1"
  if (pacbio_flag || ont_flag) {
      command = "perl ${RealBin}/scripts/illumina_fastq_QC.pl ${parameters} > ${log} 2>&1"
  }

  command {
    ${command}
  }

  output {
    Array[File] trimmedPairedFiles
    Array[File] trimmedUnpairedFiles
  }
}

task RunPorechop {
  input {
    String inputFastq
    String outputFastq
    Int numCPU
  }

  command {
    String porechopEnv = "your_porechop_environment" // Replace with your porechop environment variable
    // Your command here
  }

  output {
    File trimmedFastq = "${outputFastq}"
  }
}

workflow QCWorkflow {
  input {
    File pairedFile
    File unpairedFile
    Float avg_read_length
    Int numCPU
    Map[String, String] configuration
  }

  call RunQC {
    input:
      pairedFile = pairedFile,
      unpairedFile = unpairedFile,
      avg_read_length = avg_read_length,
      numCPU = numCPU,
      configuration = configuration
    output:
      trimmedPairedFiles = RunQC.trimmedPairedFiles,
      trimmedUnpairedFiles = RunQC.trimmedUnpairedFiles
  }

  scatter (pairedFileIdx in range(length(trimmedPairedFiles))) {
    call RunPorechop {
      input:
        inputFastq = trimmedUnpairedFiles[pairedFileIdx],
        outputFastq = "${outputDir}/QC.unpaired.porechop_${pairedFileIdx}.fastq",
        numCPU = numCPU
    }
  }
}
