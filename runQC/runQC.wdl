# RunQC workflow
# Declare WDL version 1.0 if working in Terra
version 1.0


workflow runQC{
  input{
    String outDir
    Array[File] inputFastq
    Boolean pairedFile

    String? trimMode
    Int? trimQual
    Int? trim5end
    Int? trim3end
    Boolean? trimAdapter
    Float? trimRate
    Boolean? trimPolyA
    File? artifactFile

    Int? minLen
    Int? avgQual
    Int? numN
    Float? filtLC
    Boolean? filtPhiX

    Int? ascii
    Int? outAscii

    String? outPrefix
    File? outStats

    Int? numCPU
    Int? splitSize
    Boolean? qcOnly
    Boolean? kmerCalc
    Int? kmerNum
    Int? splitSubset
    Boolean? discard
    Boolean? substitute
    Boolean? trimOnly
    Int? replaceGN
    Boolean? trim5off
    Boolean? debug
  }

  call faqcs{
    input:
    outDir = outDir,
    inputFastq = inputFastq,
    pairedFile = pairedFile,

    trimMode = trimMode,
    trimQual = trimQual,
    trim5end = trim5end,
    trim3end = trim3end,
    trimAdapter = trimAdapter,
    trimRate = trimRate,
    trimPolyA = trimPolyA,
    artifactFile = artifactFile,

    minLen = minLen,
    avgQual = avgQual,
    numN = numN,
    filtLC = filtLC,
    filtPhiX = filtPhiX,

    ascii = ascii,
    outAscii = outAscii,

    outPrefix = outPrefix,
    outStats = outStats,

    numCPU = numCPU,
    splitSize = splitSize,
    qcOnly = qcOnly,
    kmerCalc = kmerCalc,
    kmerNum = kmerNum,
    splitSubset = splitSubset,
    discard = discard,
    substitute = substitute,
    trimOnly = trimOnly,
    replaceGN = replaceGN,
    trim5off = trim5off,
    debug = debug
  }
}




task faqcs {
  input{
    String outDir
    Array[File] inputFastq
    Boolean? pairedFile

    String? trimMode
    Int? trimQual
    Int? trim5end
    Int? trim3end
    Boolean? trimAdapter
    Float? trimRate
    Boolean? trimPolyA
    File? artifactFile

    Int? minLen
    Int? avgQual
    Int? numN
    Float? filtLC
    Boolean? filtPhiX

    Int? ascii
    Int? outAscii

    String? outPrefix
    File? outStats

    Int? numCPU
    Int? splitSize
    Boolean? qcOnly
    Boolean? kmerCalc
    Int? kmerNum
    Int? splitSubset
    Boolean? discard
    Boolean? substitute
    Boolean? trimOnly
    Int? replaceGN
    Boolean? trim5off
    Boolean? debug
  }
    # FaQCs [options] [-u unpaired.fastq] -p reads1.fastq reads2.fastq -d out_directory
  command <<<
    FaQCs ~{"--mode" + trimMode} \ 
    ~{"-q" + trimQual} \
    ~{"--5end" + trim5end} \
    ~{"--3end" + trim3end} \
    ~{true="--adapter True" false="" trimAdapter} \
    ~{"--rate" + trimRate} \
    ~{true="--polyA True" false="" trimPolyA} \
    ~{"--artifactFile" + artifactFile} \
    ~{"--min_L" + minLen} \
    ~{"--avg_q" + avgQual} \
    ~{"-n" + numN} \
    ~{"--lc" + filtLC} \
    ~{true="--phiX True" false="" filtPhiX} \
    ~{"--ascii" + ascii} \
    ~{"--out_ascii" + outAscii} \
    ~{"--prefix" + outPrefix} \
    ~{"--stats" + outStats} \
    ~{"-t" + numCPU} \
    ~{"--split_size" + splitSize} \
    ~{true="--qc_only True" false="" qcOnly} \
    ~{true="--kmer_rarefaction True" false="" kmerCalc} \
    ~{"-m" + kmerNum} \
    ~{"--subset" + splitSubset} \
    ~{true="--discard True" false="" discard} \
    ~{true="--substitute True" false="" substitute} \
    ~{true="--trim_only True" false="" trimOnly} \
    ~{"--replace_to_N_q" + replaceGN} \
    ~{true="--5trim_off True" false="" trim5off} \
    ~{true="--debug True" false="" debug} \
    ~{true="-p" false="-u" pairedFile} \
    ~{sep=' ' inputFastq} \
    ~{"-d " + outDir}
  >>>

  output {
    Array[File] outputFiles = glob("${outDir}/*")
    File trimmedFastq = "${outDir}/*.trimmed.fastq"
    File stats = "${outDir}/*.stats.txt"
    File outPDF = "${outDir}/*.pdf"
  }

  runtime {
        docker: "kaijli/runqc:1.1"
        continueOnReturnCode: true
    }
}
