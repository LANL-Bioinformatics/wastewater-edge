task checkQCStatus {
  String outputDir
  String unpairedFileOutput

  command {
    # Check if QC is already finished
    if ((filesize("${outputDir}/QC.1.trimmed.fastq") > 0 || filesize("${unpairedFileOutput}") > 0) && exists("${outputDir}/runQC.finished")) {
      touch "${outputDir}/runQC.finished"
    }
  }

  output {
    Boolean qcFinished = exists("${outputDir}/runQC.finished")
    File qc1TrimmedFastq = qcFinished ? "${outputDir}/QC.1.trimmed.fastq" : null
    File qc2TrimmedFastq = qcFinished ? "${outputDir}/QC.2.trimmed.fastq" : null
    File unpairedTrimmedFastq = qcFinished ? "${outputDir}/QC.unpaired.trimmed.fastq" : null
    File unpairedFileOutput = qcFinished ? null : "${unpairedFileOutput}"
  }
}