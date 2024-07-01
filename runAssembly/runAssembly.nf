#!/usr/bin/env nextflow
//to run: nextflow [OPT: -log /path/to/log file] run runAssembly.nf -params-file [JSON parameter file]

//TODO: rethink inputs and outputs given nextflow's work directory aspects, esp. output directories
params.assembler = "IDBA_UD"

params.outDir = '.'
params.threads = null //default?
params.projName = null
params.pairedFiles = "NO_FILE"
params.unpairedFile = "NO_FILE"
params.pacbioFasta = "NO_FILE"


// process idbaUD {
//     //TODO
// }

process idbaExtractLong {
    //TODO
    input:
    path paired
    path unpaired

    output:
    path "*"

    script:
    """
    extractLongReads.pl
    -p paired
    -u unpaired
    -d . 
    """
}

process idbaPrep {

    input:
    path "paired"
    path "unpaired"

    output:
    path "pairedForAssembly.fasta", emit:idba_prep_paired
    path "unpairedForAssembly.fasta", optional:true

    script:
    def pair_process = params.pairedFiles != "NO_FILE" ? "fq2fa --filter --merge paired1 paired2 pairedForAssembly.fasta;" : "" 
    def unpair_process = params.unpairedFile != "NO_FILE" ? "fq2fa --filter unpaired unpairedForAssembly.fasta;" : "" 
    
    """
    $pair_process
    $unpair_process
    """

}

process spades {
    input:
    path paired
    path unpaired
    path pacbio
    path nanopore

    output:
    path "$params.assembler/*"

    script:
    def paired = params.pairedFiles != "NO_FILE" ? "--pe1-1 paired1 --pe2-2 paired2 " : ""
    def unpaired = params.unpairedFile != "NO_FILE" ? "--s1 unpaired " : ""
    def pacbio_file = params.spades.pacbio != "NO_FILE" ? "--pacbio pacbio " : ""
    def nanopore_file = params.spades.nanopore != "NO_FILE" ? "--nanopore nanopore " : ""
    def meta_flag = (params.pairedFiles != "NO_FILE" && params.spades.algorithm == "metagenome") ? "--meta " : ""
    def sc_flag = params.spades == "singlecell" ? "--sc " : ""
    def rna_flag = params.spades == "rna" ? "--rna " : ""
    def plasmid_flag = params.spades == "plasmid" ? "--plasmid " : ""
    def bio_flag = params.spades == "bio" ? "--bio " : ""
    def corona_flag = params.spades == "corona" ? "--corona " : ""
    def metaviral_flag = params.spades == "metaviral" ? "--metaviral " : ""
    def metaplasmid_flag = params.spades == "metaplasmid" ? "--metaplasmid " : ""
    def rnaviral_flag = params.spades == "rnaviral" ? "--rnaviral " : ""
    def memlimit = params.memlimit != null ? "-m ${params.memlimit/1024*1024}" : ""

    """
    spades.py -o $params.outDir -t $params.threads 
    $paired
    $meta_flag
    $sc_flag
    $rna_flag
    $plasmid_flag
    $bio_flag
    $corona_flag
    $metaviral_flag
    $metaplasmid_flag
    $rnaviral_flag
    $unpaired
    $pacbio_file
    $nanopore_file
    $memlimit
    """
}


process megahit {
    input:
    path paired
    path unpaired

    output:
    path "$params.assembler/*"

    script:
    def paired = params.pairedFiles != "NO_FILE" ? "-1 paired1 -2 paired2 " : ""
    def unpaired = params.unpairedFile != "NO_FILE" ? "-r unpaired " : ""
    def megahit_preset = params.megahit.preset != null ? "--presets $params.megahit.preset " : ""

    """
    megahit -o $params.outDir -t $params.threads
    $megahit_preset
    $paired
    $unpaired
    2>&1
    """

}

process unicyclerPrep {
    input:
    path longreads


    output:
    path "long_reads.fasta"

    script:

    """
    seqtk seq -A -L
    $params.unicycler.minLongReads
    longreads > long_reads.fasta
    """
}

process unicycler {
    input:
    path paired
    path unpaired
    path longreads //must check for NO_FILE. If present, expects filtered long reads.

    output:
    path "$params.outDir/$params.assembler/*"

    script:
    def paired = params.pairedFiles != "NO_FILE" ? "-1 paired1 -2 paired2 " : ""
    def unpaired = params.unpairedFile != "NO_FILE" ? "-r unpaired " : ""
    def filt_lr = params.unicycler.longreads != "NO_FILE" ? "-l longreads " : ""
    def bridge = params.unicycler.bridgingMode != "normal" ? "--mode $params.unicycler.bridgingMode" : "--mode normal"

    //test to see if unicycler can be run from the environment
    //and if we need to export some java options
    """
    unicycler -t $params.threads -o $params.outDir
    $paired
    $filt_lr
    $bridge 2>&1 1>/dev/null
    """

}

process lrasm {

    input:
    path unpaired

    output:

    script:
    def consensus = params.lrasm.numConsensus != null ? "-n $params.lrasm.numConsensus ": ""
    def preset = params.lrasm.preset != null ? "-x $params.lrasm.preset " : ""
    def errorCorrection = params.lrasm.ec != null ? "-e " : ""
    def algorithm = params.lrasm.algorithm != null ? "-a $params.lrasm.algorithm " : ""
    if (params.lrasm.algorithm == "miniasm") {
        def minLenOpt = "--ao \'-s $params.lrasm.minLength\' "
    }
    else if (params.lrasm.algorithm == "wtdbg2") {
        def minLenOpt = "--wo \'-L $params.lrasm.minLength\' "
    }
    else {
        def minLenOpt = ""
    }
    def flyeOpt = params.lrasm.algorithm == "metaflye" ? "--fo '--meta' ": ""

    """
    lrasm -o $params.OutDir -t $params.threads
    $preset
    $consensus
    $errorCorrection
    $algorithm
    $minLenOpt
    $flyeOpt
    $unpaired
    2>/dev/null
    """
    
}

workflow {
    "touch NO_FILE".execute().text

    paired_ch = channel.fromPath(params.pairedFiles, relative:true, checkIfExists:true).collect()
    unpaired_ch = channel.fromPath(params.unpairedFile, relative:true, checkIfExists:true)
    spades_pb = file(params.spades.pacbio, checkIfExists:true)
    spades_np = file(params.spades.nanopore, checkIfExists:true)
    unicycler_lr = file(params.unicycler.longreads, checkIfExists:true)

    if (params.assembler == "IDBA_UD") {
        //idbaUD(idbaExtractLong(idbaPrep(paired_ch, unpaired_ch)))
        idbaExtractLong(idbaPrep(paired_ch, unpaired_ch))//even though the files to pipe exist, passed channel seems empty


        

    }
    else if (params.assembler == "SPAdes") {
        spades(paired_ch, unpaired_ch, spades_pb, spades_np)
    }
    else if (params.assembler == "MEGAHIT") {
        megahit(paired_ch, unpaired_ch, unicycler_lr)
    }
    else if (params.assembler == "UniCycler") {
        if (params.unicycler.longreads != "NO_FILE") {
            println("Filter long reads with $params.unicycler.minLongReads (bp) cutoff")
            unicycler(paired_ch, unpaired_ch, unicyclerPrep(unicycler_lr))
        }
        else {
            unicycler(paired_ch, unpaired_ch, unicycler_lr)
        }
    }
    else if (params.assembler == "LRASM") {
        //lrasm(unpaired_ch) //issues installing LRASM
    }
    else {
        error "Invalid assembler: $params.assembler"
    }

    //TODO: add in rest of runAssembly

    //scaffold cleanup
    //contigs
    //assembly graph
    //rename by project name 
    //cleanup

}