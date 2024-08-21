process contigTaxonomy {
    publishDir(
        path: "$params.outDir/AssemblyBasedAnalysis/Taxonomy",
        mode: 'copy'
    )
    input:
    path contigs

    output:
    path "${params.projName}.log"
    path "log.txt"
    path "${params.projName}.lca_ctg.tsv", emit: taxLcaResult
    path "${params.projName}.ctg.tsv", emit: taxResult

    script:
    """
    miccr.py -x asm10 -d $params.dbPath -t $params.cpus -p $params.projName -i $contigs 1>log.txt 2>&1 
    get_unclassified_fasta.pl -in $contigs -classified ${params.projName}.lca_ctg.tsv -output ${params.projName}.unclassified.fasta -log log.txt
    """
}

process addLineage {
    input:
    path taxResult

    output:
    path "*"

    script:
    """
    add_lineage.py $params.dbPath $taxResult > ${taxResult.name}.lineage
    """
}

// process plotAndTable {
//     input:
//     output:
//     script:
//     """
//     """
// }

workflow {
    contigs = channel.fromPath(params.contigFile, checkIfExists:true)
    coverageTable = channel.fromPath(params.coverageTable, checkIfExists:true)
    contigTaxonomy(contigs)
    addLineage(contigTaxonomy.out.taxResult)
    //plotAndTable(contigTaxonomy.out, coverageTable)

}