sub runQC 
{
    my $pairedFile=shift;
    my $unpairedFile=shift;
    my $avg_read_length=shift;
    my $time=time();
    my $outputDir="$outDir/QcReads";
    my $log = "$outputDir/QC.log";
    #my @unpairedFile= @$unpairedFile;
    #my @pairedFile= @$pairedFile;
    my $quality_cutoff = ($configuration->{"q"})? $configuration->{"q"} : 5;
    my $min_length = ($configuration->{"min_L"})? $configuration->{"min_L"} : 50;
    my $avg_quality = ($configuration->{"avg_q"})? $configuration->{"avg_q"}:0;
    my $num_N = ($configuration->{"n"})? $configuration->{"n"} : 10;
    my $low_complexity = $configuration->{"lc"} || 0.85;
    my $cut_3_end = ($configuration->{"3end"})? $configuration->{"3end"}: 0;
    my $cut_5_end = ($configuration->{"5end"})? $configuration->{"5end"}: 0;
    my $split_size = $configuration->{"split_size"} || 100000;
    my $ont_flag = ($configuration->{"fastq_source"} =~ /nanopore/)? 1 : 0; 
    my $pacbio_flag = ($configuration->{"fastq_source"} =~ /pacbio/)? 1 : 0;
    my $unpairedFile_output = ($configuration->{"porechop"}  && $ont_flag )? "$outputDir/QC.unpaired.porechop.fastq":"$outputDir/QC.unpaired.trimmed.fastq";
    $min_length = ($min_length >=1)? $min_length : int($min_length * $avg_read_length);
    &make_dir($outputDir);
    if ($noColorLog)
    {
        &lprint ("[Quality Trim and Filter]\n");
    }
    else
    {
        &lprint (colored ("[Quality Trim and Filter]\n",'yellow'));
    }
    if ( -s "$outputDir/QC.1.trimmed.fastq" && -e "$outputDir/runQC.finished" )
    {
          &lprint ("Quality Trim and Filter Finished\n");
          return ("$outputDir/QC.1.trimmed.fastq $outputDir/QC.2.trimmed.fastq","$outputDir/QC.unpaired.trimmed.fastq");
    }
    elsif ( -s "$unpairedFile_output" && -e "$outputDir/runQC.finished" )
    {
          &lprint ("Quality Trim and Filter Finished\n");
          return("", "$unpairedFile_output");
    }
    unlink "$outputDir/runQC.finished";
    my $parameters;
    $parameters .= " -p $pairedFile " if ($pairedFile);
    $parameters .= " -u $unpairedFile " if ( -s $unpairedFile);
    $parameters .= " -q $quality_cutoff --min_L $min_length --avg_q $avg_quality -n $num_N --lc $low_complexity --5end $cut_5_end --3end $cut_3_end";
    $parameters .= " --split_size $split_size -d $outputDir -t $numCPU";
    $parameters .= " --adapter --artifactFile ". $configuration->{"adapter"} if (-e $configuration->{"adapter"} && is_fasta($configuration->{"adapter"}));
    $parameters .= " --polyA " if ($configuration->{"polyA"});
    $parameters .= " --trim_only " if $ont_flag or $pacbio_flag;
    $parameters .= " --ascii $configuration->{qc_phred_offset} " if ($configuration->{qc_phred_offset});
     #$parameters .= " -phiX "  if ($configuration->{"phiX"});
    my $command = "$RealBin/bin/FaQCs $parameters 1>$log 2>\&1";
    if ($pacbio_flag or $ont_flag){
        $command = "perl $RealBin/scripts/illumina_fastq_QC.pl $parameters 1>$log 2>\&1";
    }
    &lprint ("  Running \n  $command \n");
    &executeCommand($command);
    
    if ($ont_flag){
	# if adapte trim run Porechop
        my $cmd;
        if ($configuration->{"porechop"}){
            my $porechop_env= "$RealBin/thirdParty/Mambaforge/envs/py38";
            my $porechop_env_activate = "source $RealBin/thirdParty/Mambaforge/bin/activate $porechop_env 1>/dev/null"; 
            my $deactivate_cmd = "source deactivate 2>/dev/null || true";
            $cmd = "$porechop_env_activate; porechop -i $outputDir/QC.unpaired.trimmed.fastq -o $outputDir/QC.unpaired.porechop.fastq -t $numCPU > $log; $deactivate_cmd ";
            &lprint ("  Running \n  $cmd \n");
            &executeCommand($cmd);
        }
	if ( -s "$outputDir/QC.unpaired.porechop.fastq"){
            $cmd = "NanoPlot --fastq $unpairedFile_output --N50 --loglength -t $numCPU -f pdf --outdir $outputDir 2>/dev/null";
	    &lprint ("  Running \n  $cmd \n");
            &executeCommand($cmd);
	}
    }
    
    &printRunTime($time);
    &touchFile("$outputDir/runQC.finished");
    if ( -s "$outputDir/QC.1.trimmed.fastq")
    {
          return ("$outputDir/QC.1.trimmed.fastq $outputDir/QC.2.trimmed.fastq","$outputDir/QC.unpaired.trimmed.fastq");
    }
    elsif ( -s "$unpairedFile_output"){
        return("", "$unpairedFile_output");
    }else{
        die "failed: No reads remain after QC. Please see $log\n"; 
    }
}