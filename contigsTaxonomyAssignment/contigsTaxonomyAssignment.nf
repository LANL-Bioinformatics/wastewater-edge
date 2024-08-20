process contigTaxonomy {
    publishDir(
        path: "$params.outDir/AssemblyBasedAnalysis/Taxonomy",
        mode: 'copy'
    )
    input:
    path contigs
    path coverage

    output:
    path "*"

    script:
    """
    miccr.py -x asm10 -d $params.dbPath -t $params.cpus -p $params.projName -i $contigs 1>log.txt 2>&1 
    """
}

workflow {
    contigs = channel.fromPath(params.contigFile, checkIfExists:true)
    coverageTable = channel.fromPath(params.coverageTable, checkIfExists:true)
    contigTaxonomy(contigs, coverageTable)

}