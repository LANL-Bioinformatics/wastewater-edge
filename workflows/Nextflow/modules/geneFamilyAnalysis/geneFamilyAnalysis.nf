#!/usr/bin/env nextflow

//searches for antibiotic resistomes using RGI. 
process antibioticResistanceReads {
    label 'gfa'
    label 'medium'
    
    containerOptions "--bind=${settings["rgiDB"]}:/venv/bin/RGI "

    publishDir(
        path: "${settings["geneFamilyOutDir"]}",
        mode: 'copy'
    )

    input:
    val settings
    path reads

    output:
    path "${settings["projName"]}_reads_based_AR_genes_rgi*"

    script:
    def inputArg = reads.size() > 1  ? "-1 ${reads[0]} -2 ${reads[1]}" : "-1 $reads"

    """
    rgi load --card_json /venv/bin/RGI/card.json --local
    rgi card_annotation -i /venv/bin/RGI/card.json > card_annotation.log 2>&1
    rgi load -i /venv/bin/RGI/card.json --card_annotation card_database_v4.0.1.fasta --local

    rgi bwt $inputArg \
    -n ${task.cpus} \
    -o ${settings["projName"]}_reads_based_AR_genes_rgi \
    --clean \
    --local
    """

}

process antibioticResistanceContigs {
    label 'gfa'
    label 'medium'

    containerOptions "--bind=${settings["rgiDB"]}:/venv/bin/RGI "

    publishDir(
        path: "${settings["geneFamilyOutDir"]}",
        mode: 'copy'
    )

    input:
    val settings
    path faa

    output:
    path "${settings["projName"]}_ORF_based_AR_genes_rgi.json", emit: json
    script:
    """
    rgi load --card_json /venv/bin/RGI/card.json --local
    rgi main -i $faa \
    -t protein -o ${settings["projName"]}_ORF_based_AR_genes_rgi \
    -n ${task.cpus} \
    --clean \
    --local
    """

}

process processRGIcontigResults {
    label 'gfa'
    label 'small'

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
    -p ${settings["projName"]}_ORF_based_AR_genes_rgi

    gff_to_faa.py $faa ${settings["projName"]}_ORF_based_AR_genes_rgi.gff > ${settings["projName"]}_ORF_based_AR_genes_rgi.faa
    """
}

process virulenceFactorReads {
    label 'vf'
    label 'medium'

    input:
    val settings
    path paired

    output:
    script:
    """
    cp \$(readlink ${paired[0]}) ./copy_all_1.fastq
    cp \$(readlink ${paired[1]}) ./copy_all_2.fastq
    gzip copy_*.fastq
    metaVF.py -p /media/volume/refdata-save-4/nextflow/MetaVF_toolkit -pjn ${settings["projName"]} -id \$PWD -m PE -c ${task.cpus}

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
    //use PE reads first. If not available, use SE reads.
    //if paired channel (should be 1 item, list of files) is empty, use unpaired channel. If both empty, no reads provided. 
    reads = paired.concat(unpaired).first()

    antibioticResistanceReads(settings, reads)
    antibioticResistanceContigs(settings, faa)
    processRGIcontigResults(settings, antibioticResistanceContigs.out.json, gff, faa)

    virulenceFactorReads(settings, paired)
    
}