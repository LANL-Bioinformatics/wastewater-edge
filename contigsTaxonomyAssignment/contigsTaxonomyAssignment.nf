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
    miccr.py -x asm10 -d $params.dbPath -t $params.numCPU -p $params.projName -i $params.contigFile 1>log.txt 2>&1" 
    """
}

workflow {
    contigs = channel.fromPath(params.contigFile, relative:true, checkIfExists:true)
    coverageTable = channel.fromPath(params.coverageTable, relative:true, checkIfExists:true)
    contigTaxonomy(contigs, coverageTable)

}