#!/usr/bin/env nextflow

//searches for antibiotic resistomes using RGI. Will preferentially use paired-end reads if available, and SE reads otherwise.
process antibioticResistanceReads {
    label 'gfa'
    label 'medium'

    input:
    val settings
    path reads

    output:

    script:
    def inputArg = reads.size() > 1  ? "-1 ${reads[0]} -2 ${reads[1]}" : "-1 $reads"

    """
    rgi load --card_json ${settings["rgiDB"]}/card.json --local
    rgi card_annotation -i ${settings["rgiDB"]}/card.json > card_annotation.log 2>&1
    rgi load -i ${settings["rgiDB"]}/card.json --card_annotation card_database_v4.0.1.fasta --local

    rgi bwt $inputArg \
    -n ${task.cpus} \
    -o ${settings["projName"]}_AR_genes_rgi_reads \
    --clean \
    --local
    """

}

process antibioticResistanceContigs {
    input:
    val settings
    path faa

    output:
    path "${settings["projName"]}_AR_genes_rgi.json", emit: json
    script:
    """
    rgi load --card_json ${settings["rgiDB"]}/card.json --local
    rgi main -i $faa \
    -t protein -o ${settings["projName"]}_AR_genes_rgi \
    -n ${task.cpus} \
    --clean \
    --local
    """

}

process processRGIcontigResults {
    input:
    val settings
    path json
    path gff
    path faa
    output:
    script:
    """
    ProcessARRGIJson.py -i  $json \
    -g $gff \
    -p ${settings["projName"]}_AR_genes_rgi

    gff_to_faa.py $faa ${settings["projName"]}_AR_genes_rgi.gff > ${settings["projName"]}_AR_genes_rgi.faa
    """
}


workflow GENEFAMILYANALYSIS {
    take:
    settings
    paired
    unpaired
    faa
    gff

    main:
    //filter out unused inputs
    paired = paired.flatten().filter{name -> !name.contains("NO_FILE")}.collect()
    unpaired = unpaired.filter{name -> !name.contains("NO_FILE")}
    faa = faa.filter{name -> !name.contains("NO_FILE")}
    gff = gff.filter{name -> !name.contains("NO_FILE")}
    //if paired channel (should be 1 item, list of files) is empty, use unpaired channel. If both empty, no reads provided. 
    reads = paired.concat(unpaired).first()

    antibioticResistanceReads(settings, reads)
    antibioticResistanceContigs(settings, faa)
    processRGIcontigResults(settings, antibioticResistanceContigs.out.json, gff, faa)
    
}