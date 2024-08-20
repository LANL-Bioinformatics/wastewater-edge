process contigTaxonomy {
    publishDir(
        path: "$params.outDir/AssemblyBasedAnalysis/Taxonomy",
        mode: 'copy'
    )
    input:
    path contigs

    output:
    path "*"

    script:
    """
    miccr.py -x asm10 -d $params.dbPath -t $params.cpus -p $params.projName -i $contigs 1>log.txt 2>&1 
    get_unclassified_fasta.pl -in $contigs -classified ${params.projName}.lca_ctg.tsv -output ${params.projName}.unclassified.fasta -log log.txt
    add_lineage.py $params.dbPath ${params.projName}.ctg.tsv > ${params.projName}.ctg.tsv.lineage
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
    //plotAndTable(contigTaxonomy.out, coverageTable)

}