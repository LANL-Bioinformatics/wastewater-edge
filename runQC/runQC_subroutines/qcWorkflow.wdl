import "RunQC.wdl" as RunQC
import "RunPorechop" as RunPorechop

workflow QCWorkflow {
  input {
    File pairedFile
    File unpairedFile
    Float avg_read_length
    Int numCPU
    Map[String, String] configuration
  }
  
  call RunQC.RunQC {
    input:
      pairedFile = pairedFile,
      unpairedFile = unpairedFile,
      avg_read_length = avg_read_length,
      numCPU = numCPU,
      configuration = configuration
  }
  
  scatter (pairedFileIdx in range(length(RunQC.qcOutput.trimmedPairedFiles))) {
    call RunPorechop.RunPorechop {
      input:
        inputFastq = RunQC.qcOutput.trimmedUnpairedFiles[pairedFileIdx],
        outputFastq = "${outputDir}/QC.unpaired.porechop_${pairedFileIdx}.fastq",
        numCPU = numCPU
    }
  }
  
  output {
    Array[File] trimmedPairedFiles = RunQC.qcOutput.trimmedPairedFiles
    Array[File] trimmedUnpairedFiles = RunQC.qcOutput.trimmedUnpairedFiles
  }
}
