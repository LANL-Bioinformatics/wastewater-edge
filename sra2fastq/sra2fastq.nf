#!/usr/bin/env nextflow
//to run: nextflow run sra2fastq.nf -params-file [JSON file with parameters]


//these defaults are overriden by any config files or command-line options
params.clean = ""
params.platform_restrict = ""
params.filesize_restrict = ""
params.runs_restrict = ""
params.outdir = ""
params.accessions = "" 

accessions_ch = Channel.of(params.accessions)

process SRA2FASTQ {
    maxForks 1 //remove parallelization. multiple accessions now work.
    publishDir "$params.outdir"
    errorStrategy "finish" //complete any processes that didn't fail

    input: 

    val accessions //single accession string

    output:
    path "*/*.fastq.gz", emit: fastq_files
    path "*/*_metadata.txt", emit: metadata_files
    path "*/sra2fastq_temp/*", emit: temp_files, optional: true
    //TODO: allow for discovery of hidden "finished" file [used in reducing duplicate downloads]
    //path "*/.finished", emit: finished_files

    script: 
    //conditionally create command-line options based on non-empty parameters, for use in the command below
    def clean = params.clean != "" ? "--clean True" : "" 
    def platform_restrict = params.platform_restrict != "" ? "--platform_restrict $params.platform_restrict" : ""
    def filesize_restrict = params.filesize_restrict != "" ? "--filesize_restrict $params.filesize_restrict" : ""
    def runs_restrict = params.runs_restrict != "" ? "--runs_restrict $params.runs_restrict" : ""

    //invoke sra2fastq.py with those options
    """
    sra2fastq.py $accessions \
    $clean \
    $platform_restrict \
    $filesize_restrict \
    $runs_restrict
    """
}


workflow {
    fastq_ch = SRA2FASTQ(accessions_ch.flatten())
    }