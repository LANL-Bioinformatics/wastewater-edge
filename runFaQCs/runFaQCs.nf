#!/usr/bin/env nextflow
//to run: nextflow [OPT: -log /path/to/log file] run runFaQCs.nf -params-file [JSON parameter file]

//defaults overriden by any configuration files
//default values for parameters are required to avoid warning

//input and output parameters
params.outDir = null
params.inputFastq = null
params.pairedFile = null

//trimming parameters
params.trimMode= null
params.trimQual = null
params.trim5end = null
params.trim3end = null
params.trimAdapter = null
params.trimRate = null
params.trimPolyA = null
params.artifactFile = null

//filtering parameters
params.minLen = null
params.avgQual = null
params.numN = null
params.filtLC = null
params.filtPhiX = null

//quality encoding parameters
params.ascii = null
params.outAscii = null

//output parameters
params.outPrefix = "QC" //FaQCs default
params.outStats = "${params.outPrefix}.stats.txt" //FAQcs default

//misc. parameters
params.numCPU = null
params.splitSize = null
params.qcOnly = null
params.kmerCalc = null
params.kmerNum = null
params.splitSubset = null
params.discard = null
params.substitute = null
params.trimOnly = null
params.replaceGN = null
params.trim5off = null
params.debugFlag = null
params.version = null

process runFaQCs {
    debug
    publishDir ".", mode: 'copy'


    input:
    path "reads"

    output:
    path "$params.outDir/${params.outPrefix}.1.trimmed.fastq", emit: read1_trimmed, optional:true
    path "$params.outDir/${params.outPrefix}.2.trimmed.fastq", emit: read2_trimmed, optional: true
    path "$params.outDir/${params.outPrefix}.unpaired.trimmed.fastq", emit: unpaired_trimmed, optional: true
    path "$params.outDir/${params.outPrefix}_qc_report.pdf", emit: qc_report, optional: true
    path "$params.outDir/$params.outStats", emit: stats_report, optional: true


    script:
    //defs - conditionally creating command options
    def outDir = params.outDir != null ? "-d ./$params.outDir " : ""
    def files = (params.pairedFile != null && params.pairedFile) ? "-1 reads1 -2 reads2 " : "-u reads "
    

    //nextflow comparisons are supposedly null-safe
    def trimMode = params.trimMode != null ? "--mode $params.trimMode " : ""
    def trimQual = params.trimQual != null ? "--q $params.trimQual " : "" 
    def trim5end = params.trim5end != null ? "--5end $params.trim5end " : "" 
    def trim3end = params.trim3end != null ? "--3end $params.trim3end " : "" 
    def trimAdapter = params.trimAdapter != null ? "--adapter $params.trimAdapter " : "" 
    def trimRate = params.trimRate != null ? "--rate $params.trimRate " : "" 
    def trimPolyA = params.trimPolyA != null ? "--polyA $params.trimPolyA " : ""
    def artifactFile = params.artifactFile != null ? "--artifactFile $params.artifactFile " : ""

    def minLen = params.minLen != null ? "--min_L $params.minLen " : ""
    def avgQual = params.avgQual != null ? "--avg_q $params.avgQual " : ""
    def numN = params.numN != null ? "-n $params.numN " : ""
    def filtLC = params.filtLC != null ? "--lc $params.filtLC " : ""
    def filtPhiX = params.filtPhiX != null ? "--phiX $params.filtPhiX " : ""

    def ascii = params.ascii != null ? "--ascii $params.ascii " : ""
    def outAscii = params.outAscii != null ? "--out_ascii $params.outAscii " : ""

    def outPrefix = params.outPrefix != "QC" ? "--prefix $params.outPrefix " : ""
    def outStats = params.outStats != "${params.outPrefix}.stats.txt" ? "--stats $params.outStats " : ""

    def numCPU = params.numCPU != null ? "-t $params.numCPU " : ""
    def splitSize = params.splitSize != null ? "--split_size $params.splitSize " : ""
    def qcOnly = params.qcOnly != null ? "--qc_only $params.qcOnly " : ""
    def kmerCalc = params.kmerCalc != null ? "--kmer_rarefaction $params.kmerCalc " : ""
    def kmerNum = params.kmerNum != null ? "--m $params.kmerNum " : ""
    def splitSubset = params.splitSubset != null ? "--subset $params.splitSubset " : ""
    def discard = params.discard != null ? "--discard $params.discard " : ""
    def substitute = params.substitute != null ? "--substitute $params.substitute " : ""
    def trimOnly = params.trimOnly != null ? "--trim_only $params.trimOnly " : ""
    def replaceGN = params.replaceGN != null ? "--replace_to_N_q $params.replaceGN " : ""
    def trim5off = params.trim5off != null ? "--5trim_off $params.trim5off " : ""
    def debugFlag = params.debugFlag != null ? "--debug $params.debugFlag " : ""
    def version = params.version != null ? "--version $params.version " : "" //check if substition needed


    """
    mkdir $params.outDir

    FaQCs $trimMode\
$trimQual\
$trim5end\
$trim3end\
$trimAdapter\
$trimRate\
$trimPolyA\
$artifactFile\
$minLen\
$avgQual\
$numN\
$filtLC\
$filtPhiX\
$ascii\
$outAscii\
$outPrefix\
$outStats\
$numCPU\
$splitSize\
$qcOnly\
$kmerCalc\
$kmerNum\
$splitSubset\
$discard\
$substitute\
$trimOnly\
$replaceGN\
$trim5off\
$debugFlag\
$version\
$files\
$outDir
    """

}


workflow {
    runFaQCs(channel.of(params.inputFastq))
    println("Created files:")
    runFaQCs.out.read1_trimmed.view()
    runFaQCs.out.read2_trimmed.view()
    runFaQCs.out.unpaired_trimmed.view()
    runFaQCs.out.qc_report.view()
    runFaQCs.out.stats_report.view()
}