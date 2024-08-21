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
    publishDir(
        path: "$params.outDir/AssemblyBasedAnalysis/Taxonomy",
        mode: 'copy'
    )
    
    input:
    path taxResult

    output:
    path "*.lineage", emit: lineage

    script:
    def dbFolder = params.dbPath.take(params.dbPath.lastIndexOf("/")) //get folder path containing DB
    """
    add_lineage.py $dbFolder $taxResult > ${taxResult.name}.lineage
    """
}

process plotAndTable {
    publishDir(
        path: "$params.outDir/AssemblyBasedAnalysis/Taxonomy",
	mode: 'copy'
    )
    input:
    path lineage
    path covTable
    path lcaResult
    
    output:
    //TODO: check which files EDGE normally publishes
    path "*"
    
    script:
    """
    classification_plot.R $lineage $covTable
    tab2Json_for_dataTable.pl -project_dir $params.outDir -mode contig -limit $params.rowLimit $lcaResult > ${params.projName}.ctg_class.LCA.json
    """
}

workflow {
    contigs = channel.fromPath(params.contigFile, checkIfExists:true)
    coverageTable = channel.fromPath(params.coverageTable, checkIfExists:true)
    contigTaxonomy(contigs)
    addLineage(contigTaxonomy.out.taxResult)
    plotAndTable(addLineage.out.lineage, coverageTable, contigTaxonomy.out.taxLcaResult)
}