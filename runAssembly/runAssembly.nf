#!/usr/bin/env nextflow
//to run: nextflow [OPT: -log /path/to/log file] run runAssembly.nf -params-file [JSON parameter file]

//TODO: detection system for memory limit
//TODO: output and transparency needs to be compared to EDGE website

params.assembler = "IDBA_UD"

params.outDir = '.'
params.threads = 8 //default?
params.projName = null


process idbaUD {
    //TODO: implement avglen safety
    publishDir "$params.outDir/idba", mode: 'copy'

    input:
    path short_paired
    path short_single
    path long_reads

    output:
    path "*"

    script:
    def runFlag = ""
    if(short_paired.name != "NO_FILE" && short_single.name != "NO_FILE2") {
        runFlag = "-r $short_single --read_level_2 $short_paired "
    }
    else if(short_paired.name != "NO_FILE") {
        runFlag = "-r $short_paired "
    }
    else if(short_single.name != "NO_FILE2") {
        runFlag = "-r $short_single "
    }
    def longReadsFile = long_reads.name != "NO_FILE3" ? "-l $long_reads" : ""
    def maxK = params.idba.maxK != null ? "--maxk $params.idba.maxK " : ""
    def minK = params.idba.minK != null ? "--mink $params.idba.minK " : ""
    def step = params.idba.step != null ? "--step $params.idba.step " : ""
    def minLen = params.minContigSize != null ? "--min_contig $params.minContigSize " : ""

    def memLimit = params.memLimit != null ? "ulimit -v $params.memLimit 2>/dev/null;" : ""
    """
    ${memLimit}idba_ud --pre_correction -o . --num_threads $params.threads\
    $runFlag\
    $longReadsFile\
    $maxK\
    $minK\
    $step\
    $minLen
    """

}
process idbaExtractLong {
    input:
    path paired
    path unpaired

    output:
    path "short_paired.fa"
    path "short_single.fa"
    path "long.fa"

    script:
    def pair_file = paired.name != "NO_FILE" ? "-p $paired " : ""
    def unpaired_file = unpaired.name != "NO_FILE2" ? "-u $unpaired " : ""
    """
    extractLongReads.pl\
    $pair_file\
    $unpaired_file\
    -d .
    """
}
process idbaPrep {
    input:
    path paired
    path unpaired

    output:
    path "pairedForAssembly.fasta", emit:idba_prep_paired
    path "unpairedForAssembly.fasta", optional:true

    script:
    def pair_process = paired.name != "NO_FILE" ? "fq2fa --filter --merge ${paired[0]} ${paired[1]} pairedForAssembly.fasta;" : "" 
    def unpair_process = unpaired.name != "NO_FILE2" ? "fq2fa --filter $unpaired unpairedForAssembly.fasta;" : "" 
    
    """
    $pair_process
    $unpair_process
    """

}

process spades {
    publishDir "$params.outDir/spades", mode: 'copy'

    input:
    path paired
    path unpaired
    path pacbio
    path nanopore

    output:
    path "*"

    script:
    def paired = paired.name != "NO_FILE" ? "--pe1-1 ${paired[0]} --pe1-2 ${paired[1]} " : ""
    def unpaired = unpaired.name != "NO_FILE2" ? "--s1 $unpaired " : ""
    def pacbio_file = pacbio.name != "NO_FILE3" ? "--pacbio $pacbio " : ""
    def nanopore_file = nanopore.name != "NO_FILE4" ? "--nanopore $nanopore " : ""
    def meta_flag = (paired != "" && params.spades.algorithm == "metagenome") ? "--meta " : ""
    def sc_flag = params.spades.algorithm == "singlecell" ? "--sc " : ""
    def rna_flag = params.spades.algorithm == "rna" ? "--rna " : ""
    def plasmid_flag = params.spades.algorithm == "plasmid" ? "--plasmid " : ""
    def bio_flag = params.spades.algorithm == "bio" ? "--bio " : ""
    def corona_flag = params.spades.algorithm == "corona" ? "--corona " : ""
    def metaviral_flag = params.spades.algorithm == "metaviral" ? "--metaviral " : ""
    def metaplasmid_flag = params.spades.algorithm == "metaplasmid" ? "--metaplasmid " : ""
    def rnaviral_flag = params.spades.algorithm == "rnaviral" ? "--rnaviral " : ""
    //def memlimit = params.memlimit != null ? "-m ${params.memlimit/1024*1024}" : ""

    """
    spades.py -o . -t $params.threads\
    $paired\
    $meta_flag\
    $sc_flag\
    $rna_flag\
    $plasmid_flag\
    $bio_flag\
    $corona_flag\
    $metaviral_flag\
    $metaplasmid_flag\
    $rnaviral_flag\
    $unpaired\
    $pacbio_file\
    $nanopore_file
    """
    //$memlimit
}

process megahit {
    publishDir "$params.outDir", mode: 'copy'

    input:
    path paired
    path unpaired

    output:
    path "*"

    script:
    def paired = paired.name != "NO_FILE" ? "-1 ${paired[0]} -2 ${paired[1]} " : ""
    def unpaired = unpaired.name != "NO_FILE2" ? "-r $unpaired " : ""
    def megahit_preset = params.megahit.preset != null ? "--presets $params.megahit.preset " : ""

    """
    megahit -o ./megahit -t $params.threads\
    $megahit_preset\
    $paired\
    $unpaired\
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
    seqtk seq -A -L\
    $params.unicycler.minLongReads\
    $longreads > long_reads.fasta
    """
}
process unicycler {
    publishDir "$params.outDir/unicycler", mode: 'copy'

    input:
    path paired
    path unpaired
    path longreads //If present, expects filtered long reads.

    output:
    path "*"

    script:
    def paired = paired.name != "NO_FILE" ? "-1 ${paired[0]} -2 ${paired[1]} " : ""
    def unpaired = unpaired.name != "NO_FILE2" ? "-r $unpaired " : ""
    def filt_lr = longreads.name != "NO_FILE3" ? "-l $longreads " : ""
    def bridge = params.unicycler.bridgingMode != "normal" ? "--mode $params.unicycler.bridgingMode" : "--mode normal"

    //test to see if unicycler can be run from the environment
    //and if we need to export some java options
    """
    unicycler -t $params.threads -o .\
    $paired\
    $filt_lr\
    $bridge 2>&1 1>/dev/null
    """

}

process lrasm {
    publishDir "$params.outDir/lrasm", mode: 'copy'

    input:
    path unpaired

    output:
    path "*"

    script:
    def consensus = params.lrasm.numConsensus != null ? "-n $params.lrasm.numConsensus ": ""
    def preset = params.lrasm.preset != null ? "-x $params.lrasm.preset " : ""
    def errorCorrection = params.lrasm.ec != null ? "-e " : ""
    def algorithm = params.lrasm.algorithm != null ? "-a $params.lrasm.algorithm " : ""
    def minLenOpt = ""
    if (params.lrasm.algorithm == "miniasm") {
        minLenOpt = "--ao \'-s $params.lrasm.minLength\' "
    }
    else if (params.lrasm.algorithm == "wtdbg2") {
        minLenOpt = "--wo \'-L $params.lrasm.minLength\' "
    }
    def flyeOpt = params.lrasm.algorithm == "metaflye" ? "--fo '--meta' ": ""

    """
    lrasm -o . -t $params.threads\
    $preset\
    $consensus\
    $errorCorrection\
    $algorithm\
    $minLenOpt\
    $flyeOpt\
    $unpaired\
    2>/dev/null
    """
    
}

workflow {
    "mkdir nf_assets".execute().text
    "touch nf_assets/NO_FILE".execute().text
    "touch nf_assets/NO_FILE2".execute().text
    "touch nf_assets/NO_FILE3".execute().text
    "touch nf_assets/NO_FILE4".execute().text

    paired_ch = channel.fromPath(params.pairedFiles, relative:true, checkIfExists:true).collect()
    unpaired_ch = channel.fromPath(params.unpairedFile, relative:true, checkIfExists:true)
    spades_pb = file(params.spades.pacbio, checkIfExists:true)
    spades_np = file(params.spades.nanopore, checkIfExists:true)
    unicycler_lr = file(params.unicycler.longreads, checkIfExists:true)

    if (params.assembler.equalsIgnoreCase("IDBA_UD")) {
        (c1,c2) = idbaPrep(paired_ch, unpaired_ch)
        (sp,su,l) = idbaExtractLong(c1,c2.ifEmpty({file("nf_assets/NO_FILE")}))
        idbaUD(sp.filter{ it.size()>0 }.ifEmpty({file("nf_assets/NO_FILE")}),
            su.filter{ it.size()>0 }.ifEmpty({file("nf_assets/NO_FILE2")}),
            l.filter{ it.size()>0 }.ifEmpty({file("nf_assets/NO_FILE3")}))

    }
    else if (params.assembler.equalsIgnoreCase("SPAdes")) {
        spades(paired_ch, unpaired_ch, spades_pb, spades_np)
    }
    else if (params.assembler.equalsIgnoreCase("MEGAHIT")) {
        megahit(paired_ch, unpaired_ch)
    }
    else if (params.assembler.equalsIgnoreCase("UniCycler")) {
        if (params.unicycler.longreads != "nf_assets/NO_FILE3") {
            println("Filter long reads with $params.unicycler.minLongReads (bp) cutoff")
            unicycler(paired_ch,
                unpaired_ch,
                unicyclerPrep(unicycler_lr).filter{it.size()>0}.ifEmpty({file("nf_assets/NO_FILE3")}))
        }
        else {
            unicycler(paired_ch, unpaired_ch, unicycler_lr)
        }
    }
    else if (params.assembler.equalsIgnoreCase("LRASM")) {
        lrasm(unpaired_ch)
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