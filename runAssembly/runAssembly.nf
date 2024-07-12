#!/usr/bin/env nextflow
//to run: nextflow [OPT: -log /path/to/log file] run runAssembly.nf -params-file [JSON parameter file]

//TODO: detection system for memory limit
//TODO: output and transparency needs to be compared to EDGE website

process idbaUD {
    publishDir (
    path:"$params.outDir/idba",
    mode: 'copy',
    saveAs: {
        filename ->
        if(filename ==~ /log/) {
            "assembly.log"
        }
        else if(filename ==~ /scaffold(s|-level-2|).fa(sta)?/) {
            "scaffold.fa"
        }
        else{
            filename
        }
    }
    )

    input:
    path short_paired
    path short_single
    path long_reads
    val avg_len

    output:
    path "log"
    path "scaffold*.{fa,fasta}", optional:true 
    path "contig-max.fa", emit: contigs

    script:
    def avg_len = avg_len as Integer
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
    def maxK = 121
    def maxK_option = "--maxk $maxK "
    if (params.idba.maxK == null || params.idba.maxK > avg_len) {
        if(avg_len > 0 && avg_len <= 151) {
            maxK = avg_len - 1
            maxK_option = "--maxk ${avg_len - 1}"
        }
    }
    def minK = params.idba.minK != null ? "--mink $params.idba.minK " : ""
    def step = params.idba.step != null ? "--step $params.idba.step " : ""
    def minLen = params.minContigSize != null ? "--min_contig $params.minContigSize " : ""

    def memLimit = params.memLimit != null ? "ulimit -v $params.memLimit 2>/dev/null;" : ""
    """
    ${memLimit}idba_ud --pre_correction -o . --num_threads $params.threads\
    $runFlag\
    $longReadsFile\
    $maxK_option\
    $minK\
    $step\
    $minLen

    mv contig-${maxK}.fa contig-max.fa
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
process idbaPrepReads {
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

process idbaReadFastq {
    input:
    path paired
    path unpaired

    output:
    path "fastqCount.txt"

    script:
    def paired_list = paired.name != "NO_FILE" ? "-p ${paired}" : ""
    def unpaired_list = unpaired.name != "NO_FILE2" ? "-u ${unpaired}" : ""

    """
    getAvgLen.pl\
    $paired_list\
    $unpaired_list\
    -d .
    """
}

process idbaAvgLen {
    input:

    path countFastq

    output:
    stdout

    shell:
    '''
    #!/usr/bin/env perl
    my $fastq_count_file = "./!{countFastq}";
    my $total_count = 0;
    my $total_len = 0;
    open (my $fh, "<", $fastq_count_file) or die "Cannot open $fastq_count_file\n";
    while(<$fh>){
        chomp;
        my ($name,$count,$len,$avg) = split /\t/,$_;
        $total_count += $count;
        $total_len += $len;
    }
    close $fh;
    my $avg_len = ($total_count > 0)? $total_len/$total_count : 0;
    print "$avg_len";
    '''
}

process spades {
    publishDir (
    path: "$params.outDir/spades", 
    mode: 'copy',
    saveAs: {
        filename ->
        if(filename ==~ /spades.log/) {
            "assembly.log"
        }
        else if(filename ==~ /scaffold(s|-level-2|).fa(sta)?/) {
            "scaffold.fa"
        }
        else if(filename.equals("assembly_graph.fastg")) {
            "${params.projName}_contigs.fastg"
        }
        else{
            filename
        }
    }
    )

    input:
    path paired
    path unpaired
    path pacbio
    path nanopore

    output:
    path "scaffold*.{fa,fasta}", optional:true 
    path "spades.log" 
    path "{contigs,transcripts}.fasta", emit:contigs
    path "assembly_graph.fastg", optional:true
    path "assembly_graph_with_scaffolds.gfa", optional:true


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
    publishDir(
    path: "$params.outDir/megahit",
    mode: 'copy',
    pattern: "${params.projName}_contigs.fastg"
    )
    publishDir(
    path: "$params.outDir", 
    mode: 'copy',
    pattern: "{megahit/log,megahit/final.contigs.fa}",
    saveAs: {
        filename ->
        if(filename.equals("megahit/log")) {
            "megahit/assembly.log"
        }
        else if(filename ==~ /scaffold(s|-level-2|).fa(sta)?/) {
            "scaffold.fa"
        }
        else{
            filename
        }
    }
    )
    publishDir(
    path: "$params.outDir", 
    mode: 'copy',
    pattern: "megahit/scaffold*.{fa,fasta}",
    saveAs: {
        filename ->
        "scaffold.fa"
    }
    )

    input:
    path paired
    path unpaired

    output:
    path "megahit/log"
    path "megahit/scaffold*.{fa,fasta}", optional:true //I don't believe this is a normal output of megahit, but just in case
    path "megahit/final.contigs.fa", emit: contigs
    path "${params.projName}_contigs.fastg"

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

    LARGESTKMER=\$(head -n 1 megahit/final.contigs.fa | perl -ne '/^>k(\\d+)\\_/; print \$1;')

    megahit_toolkit contig2fastg \$LARGESTKMER megahit/intermediate_contigs/k\${LARGESTKMER}.contigs.fa  > ${params.projName}_contigs.fastg
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
    publishDir (
        path: "$params.outDir/unicycler", 
        mode: 'copy',
        saveAs: {
        filename ->
        if(filename ==~ /unicycler.log/) {
            "assembly.log"
        }
        else if(filename ==~ /scaffold(s|-level-2|).fa(sta)?/) {
            "scaffold.fa"
        }
        else if(filename.equals("assembly.gfa")) {
            "${params.projName}_contigs.fastg"
        }
        else{
            filename
        }
    }
    )

    input:
    path paired
    path unpaired
    path longreads //If present, expects filtered long reads.

    output:
    path "unicycler.log"
    path "scaffold*.{fa,fasta}", optional:true //I don't believe this is a normal output of unicycler, but just in case
    path "assembly.fasta", emit: contigs
    path "assembly.gfa", optional:true

    script:
    def paired = paired.name != "NO_FILE" ? "-1 ${paired[0]} -2 ${paired[1]} " : ""
    def unpaired = unpaired.name != "NO_FILE2" ? "-r $unpaired " : ""
    def filt_lr = longreads.name != "NO_FILE3" ? "-l $longreads " : ""
    def bridge = params.unicycler.bridgingMode != "normal" ? "--mode $params.unicycler.bridgingMode" : "--mode normal"

    """
    export _JAVA_OPTIONS='-Xmx20G'; export TERM='xterm';

    unicycler -t $params.threads -o .\
    $paired\
    $filt_lr\
    $bridge 2>&1 1>/dev/null
    """

}

process lrasm {
    publishDir (
        path: "$params.outDir/lrasm", 
        mode: 'copy',
        saveAs: {
        filename ->
        if(filename ==~ /log/) {
            "assembly.log"
        }
        else if(filename ==~ /scaffold(s|-level-2|).fa(sta)?/) {
            "scaffold.fa"
        }
        else if(filename.equals("Assembly/unitig.gfa")) {
            "${params.projName}_contigs.fastg"
        }
        else if(filename.equals("Assembly/assembly_graph.gfa")) {
            "${params.projName}_contigs.fastg"
        }
        else if(filename.equals("Assembly/assembly_graph.gv")) {
            "${params.projName}_contigs.gv"
        }
        else if(filename.equals("Assembly/assembly_info.txt")) {
            "assembly_info.txt"
        }
        else{
            filename
        }
    }
    )

    input:
    path unpaired

    output:
    path "contigs.log" 
    path "scaffold*.{fa,fasta}", optional:true //I don't believe this is a normal output of lrasm, but just in case
    path "contigs.fa", emit:contigs
    path "Assembly/unitig.gfa", optional:true
    path "Assembly/assembly_graph.gfa", optional:true
    path "Assembly/assembly_graph.gv", optional:true
    path "Assembly/assembly_info.txt", optional:true

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
    """
    //2>/dev/null
}

process rename {
    publishDir(
        path: "$params.outDir/final_files",
        mode: 'copy'
    )
    input:
    path contigs

    output:
    path "*"

    script:
    """
    CONTIG_NUMBER=\$(grep -c '>' ${contigs})
    
    renameFilterFasta.pl \
    -u $contigs\
    -d .\
    -filt $params.minContigSize\
    -maxseq \$CONTIG_NUMBER\
    -ann $params.contigSizeForAnnotation\
    -n $params.projName
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
        avg_len_ch = idbaAvgLen(idbaReadFastq(paired_ch, unpaired_ch))
        (c1,c2) = idbaPrepReads(paired_ch, unpaired_ch)
        (sp,su,l) = idbaExtractLong(c1,c2.ifEmpty({file("nf_assets/NO_FILE")}))
        idbaUD(sp.filter{ it.size()>0 }.ifEmpty({file("nf_assets/NO_FILE")}),
            su.filter{ it.size()>0 }.ifEmpty({file("nf_assets/NO_FILE2")}),
            l.filter{ it.size()>0 }.ifEmpty({file("nf_assets/NO_FILE3")}),
            avg_len_ch)
        rename(idbaUD.out.contigs)

    }
    else if (params.assembler.equalsIgnoreCase("SPAdes")) {
        spades(paired_ch, unpaired_ch, spades_pb, spades_np)
        rename(spades.out.contigs)
    }
    else if (params.assembler.equalsIgnoreCase("MEGAHIT")) {
        megahit(paired_ch, unpaired_ch)
        rename(megahit.out.contigs)
    }
    else if (params.assembler.equalsIgnoreCase("UniCycler")) {
        if (params.unicycler.longreads != "nf_assets/NO_FILE3") {
            println("Filter long reads with $params.unicycler.minLongReads (bp) cutoff")
            unicycler(paired_ch,
                unpaired_ch,
                unicyclerPrep(unicycler_lr).filter{it.size()>0}.ifEmpty({file("nf_assets/NO_FILE3")}))
            rename(unicycler.out.contigs)
        }
        else {
            unicycler(paired_ch, unpaired_ch, unicycler_lr)
            rename(unicycler.out.contigs)
        }
    }
    else if (params.assembler.equalsIgnoreCase("LRASM")) {
        lrasm(unpaired_ch)
        rename(lrasm.out.contigs)
    }
    else {
        error "Invalid assembler: $params.assembler"
    }

    //TODO: add safety in case of assembly failure/incomplete assembly

}