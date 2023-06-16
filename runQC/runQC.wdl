
task executeCommand {
  command {
    ${command}
  }
}

task touchFile {
  command {
    touch ${file}
  }
}

task runQC {
  String pairedFile
  String unpairedFile
  Int avg_read_length
  String outDir
  String configuration
  Int numCPU

  command {
    # Set variables
    String outputDir = "${outDir}/QcReads"
    String log = "${outputDir}/QC.log"
    Int quality_cutoff = configuration.getOrDefault("q", 5)
    Int min_length = configuration.getOrDefault("min_L", 50)
    Int avg_quality = configuration.getOrDefault("avg_q", 0)
    Int num_N = configuration.getOrDefault("n", 10)
    Float low_complexity = configuration.getOrDefault("lc", 0.85)
    Int cut_3_end = configuration.getOrDefault("3end", 0)
    Int cut_5_end = configuration.getOrDefault("5end", 0)
    Int split_size = configuration.getOrDefault("split_size", 100000)
    Int ont_flag = configuration["fastq_source"].contains("nanopore") ? 1 : 0
    Int pacbio_flag = configuration["fastq_source"].contains("pacbio") ? 1 : 0
    String unpairedFile_output = (configuration["porechop"] && ont_flag) ? "${outputDir}/QC.unpaired.porechop.fastq" : "${outputDir}/QC.unpaired.trimmed.fastq"
    min_length = (min_length >= 1) ? min_length : int(min_length * avg_read_length)


    # Create output directory if it doesn't exist
    mkdir -p ${outputDir}
    call makeDir {
      input:
        outputDir = outputDir
    }

    # Check if QC is already finished
    if ((size("${outputDir}/QC.1.trimmed.fastq") > 0 || size(unpairedFile_output) > 0) && exists("${outputDir}/runQC.finished")) {
      echo "Quality Trim and Filter Finished"
      if (size("${outputDir}/QC.1.trimmed.fastq") > 0) {
        output {
          File qc1TrimmedFastq = "${outputDir}/QC.1.trimmed.fastq"
          File qc2TrimmedFastq = "${outputDir}/QC.2.trimmed.fastq"
          File unpairedTrimmedFastq = "${outputDir}/QC.unpaired.trimmed.fastq"
        }
      } else {
        output {
          File qc1TrimmedFastq = ""
          File unpairedFileOutput = unpairedFile_output
        }
      }
      return
    }

    # Remove runQC.finished file
    delete "${outputDir}/runQC.finished"

    # Build command parameters
    String parameters = ""
    parameters += " -p ${pairedFile}" if (pairedFile != "")
    parameters += " -u ${unpairedFile}" if (size(unpairedFile) > 0)
    parameters += " -q ${quality_cutoff} --min_L ${min_length} --avg_q ${avg_quality} -n ${num_N} --lc ${low_complexity} --5end ${cut_5_end} --3end ${cut_3_end}"
    parameters += " --split_size ${split_size} -d ${outputDir} -t ${numCPU}"
    parameters += " --adapter --artifactFile ${configuration.getOrDefault("adapter", "")}" if (configuration.containsKey("adapter") && is_fasta(configuration["adapter"]))
    parameters += " --polyA" if (configuration.getOrDefault("polyA", false))
    parameters += " --trim_only" if (ont_flag || pacbio_flag)
    parameters += " --ascii ${configuration.getOrDefault("qc_phred_offset", "")}" if (configuration.containsKey("qc_phred_offset"))

    String command
    if (pacbio_flag || ont_flag) {
      command = "perl ${RealBin}/scripts/illumina_fastq_QC.pl ${parameters} 1>${log} 2>&1"
    } else {
      command = "${RealBin}/bin/FaQCs ${parameters} 1>${log} 2>&1"
    }

    # Run executeCommand task
    call executeCommand {
      input:
        command = command
    }

    # Perform additional steps for ont_flag
    if (ont_flag) {
      # Run porechop if adapter trim is enabled
      if (configuration.getOrDefault("porechop", false)) {
        String porechop_env = "${RealBin}/thirdParty/Mambaforge/envs/py38"
        String porechop_env_activate = "source ${RealBin}/thirdParty/Mambaforge/bin/activate ${porechop_env} 1>/dev/null"
        String deactivate_cmd = "source deactivate 2>/dev/null || true"
        String cmd = "${porechop_env_activate}; porechop -i ${outputDir}/QC.unpaired.trimmed.fastq -o ${outputDir}/QC.unpaired.porechop.fastq -t ${numCPU} > ${log}; ${deactivate_cmd}"

        # Run porechop command
        call executeCommand {
          input:
            command = cmd
        }
      }

      # Run NanoPlot if QC.unpaired.porechop.fastq exists
      if (size("${outputDir}/QC.unpaired.porechop.fastq") > 0) {
        String nanoPlotCmd = "NanoPlot --fastq ${unpairedFile_output} --N50 --loglength -t ${numCPU} -f pdf --outdir ${outputDir} 2>/dev/null"

        # Run NanoPlot command
        call executeCommand {
          input:
            command = nanoPlotCmd
        }
      }
    }

    # Run touchFile task
    call touchFile {
      input:
        file = "${outputDir}/runQC.finished"
    }

    # Check if QC.1.trimmed.fastq exists
    if (size("${outputDir}/QC.1.trimmed.fastq") > 0) {
      output {
        File qc1TrimmedFastq = "${outputDir}/QC.1.trimmed.fastq"
        File qc2TrimmedFastq = "${outputDir}/QC.2.trimmed.fastq"
        File unpairedTrimmedFastq = "${outputDir}/QC.unpaired.trimmed.fastq"
      }
    } else if (size(unpairedFile_output) > 0) {
      output {
        File qc1TrimmedFastq = ""
        File unpairedFileOutput = unpairedFile_output
      }
    } else {
      error "failed: No reads remain after QC. Please see ${log}"
    }
  }
}
