#!/usr/bin/env nextflow
//to run: nextflow [OPT: -log /path/to/log file] run runFaQCs.nf -params-file [JSON parameter file]

//defaults overriden by any configuration files
//input and output parameters
params.outDir = ""
params.inputFastq = ""
params.pairedFile = false

//trimming parameters
params.trimMode=""
params.trimQual = null
params.trim5end = null
params.trim3end = null
params.trimAdapter = false //also FaQCs default
params.trimRate = null
params.trimPolyA = false //also FAQCs default
params.artifactFile = ""

//filtering parameters
params.minLen = null
params.avgQual = null
params.numN = null
params.filtLC = null
params.filtPhiX = false //also FAQCs default

//quality encoding parameters
params.ascii = null
params.outAscii = null

//output parameters
params.outPrefix = ""
params.outStats = ""

//misc. parameters
params.numCPU = 0
params.splitSize = 0
params.qcOnly = false
params.kmerCalc = false
params.kmerNum = 0
params.splitSubset = 0
params.discard = false
params.substitute = false
params.trimOnly = false
params.replaceGN = 0
params.trim5off = false
params.debug = false
params.version = false

process RUNFAQCS {

    script:
    //defs - conditionally creating command options
    def outDir = params.outDir != "" ? "-d $params.outDir" : ""
    def files = params.pairedFile != false ? "-1 ${params.inputFastq[0]} -2 ${params.inputFastq[1]}" : "-u ${params.inputFastq[0]}"
    def inputFastq = params.inputFastq != "" ? "--mode $params.inputFastq" : ""
    

    //nextflow comparisons are supposedly null-safe
    def trimMode = params.trimMode != "" ? "--mode $params.trimMode" : ""
    def trimQual = params.trimQual != null ? "--q $params.trimQual" : "" 
    def trim5end = params.trim5end != null ? "--5end $params.trim5end" : "" 
    def trim3end = params.trim3end != null ? "--3end $params.trim3end" : "" 
    def trimAdapter = params.trimAdapter != false ? "--adapter $params.trimAdapter" : "" 
    def trimRate = params.trimRate != null ? "--rate $params.trimRate" : "" 
    def artifactFile = params.artifactFile != "" ? "--artifactFile $params.artifactFile" : ""

    def minLen = params.minLen != null ? "--min_L $params.minLen" : ""
    def avgQual = params.avgQual != null ? "--avg_q $params.avgQual" : ""
    def numN = params.numN != null ? "-n $params.numN" : ""
    def filtLC = params.filtLC != null ? "--lc $params.filtLC" : ""
    def filtPhiX = params.filtPhiX != false ? "--phiX $params.filtPhiX" : ""

    def ascii = params.ascii != null ? "--ascii $params.ascii" : ""
    def outAscii = params.outAscii != null ? "--out_ascii $params.outAscii" : ""

    def outPrefix = params.outPrefix != "" ? "--prefix $params.outPrefix" : ""
    def outStats = params.outStats != "" ? "--stats $params.outStats" : ""

    def numCPU = params.numCPU != null ? "-t $params.numCPU" : ""
    def splitSize = params.splitSize != null ? "--split_size $params.splitSize" : ""
    def qcOnly = params.qcOnly != false ? "--qc_only $params.qcOnly" : ""
    def kmerCalc = params.kmerCalc != false ? "--kmer_rarefaction $params.kmerCalc" : ""
    def kmerNum = params.kmerNum != null ? "--m $params.kmerNum" : ""
    def splitSubset = params.splitSubset != null ? "--subset $params.splitSubset" : ""
    def discard = params.discard != false ? "--discard $params.discard" : ""
    def substitute = params.substitute != false ? "--substitute $params.substitute" : ""
    def trimOnly = params.trimOnly != false ? "--trim_only $params.trimOnly" : ""
    def replaceGN = params.replaceGN != null ? "--replace_to_N_q $params.replaceGN" : ""
    def trim5off = params.trim5off != false ? "--5trim_off $params.trim5off" : ""
    def debug = params.debug != false ? "--debug $params.debug" : ""
    def version = params.version != "" ? "--version $params.version" : "" //check if substition needed


    """
    FaQCs $trimMode \
    $trimQual \
    $trim5end \
    $trim3end \
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
    ~{if pairedFile then "-1 "+ inputFastq[0]+ " -2 "+inputFastq[1] else "-u "+inputFastq[0] } \
    ~{"-d " + outDir}
    """

}


workflow {

}