task makeOutputDir {
  String outDir

  command {
    mkdir -p ${outDir}/QcReads
  }

  output {
    String outputDir = "${outDir}/QcReads"
  }
}
