import os
import subprocess
import time
from termcolor import colored

def runQC(pairedFile, unpairedFile, avg_read_length):
    time_stamp = str(int(time.time()))
    outputDir = os.path.join(outDir, "QcReads")
    log = os.path.join(outputDir, "QC.log")

    quality_cutoff = configuration.get("q", 5)
    min_length = configuration.get("min_L", 50)
    avg_quality = configuration.get("avg_q", 0)
    num_N = configuration.get("n", 10)
    low_complexity = configuration.get("lc", 0.85)
    cut_3_end = configuration.get("3end", 0)
    cut_5_end = configuration.get("5end", 0)
    split_size = configuration.get("split_size", 100000)
    ont_flag = "fastq_source" in configuration and "nanopore" in configuration["fastq_source"]
    pacbio_flag = "fastq_source" in configuration and "pacbio" in configuration["fastq_source"]
    unpairedFile_output = os.path.join(outputDir, "QC.unpaired.porechop.fastq") if configuration.get("porechop") and ont_flag else os.path.join(outputDir, "QC.unpaired.trimmed.fastq")
    min_length = min_length if min_length >= 1 else int(min_length * avg_read_length)
    make_dir(outputDir)

    if noColorLog:
        print("[Quality Trim and Filter]")
    else:
        print(colored("[Quality Trim and Filter]", "yellow"))

    if os.path.isfile(os.path.join(outputDir, "QC.1.trimmed.fastq")) and os.path.exists(os.path.join(outputDir, "runQC.finished")):
        print("Quality Trim and Filter Finished")
        return (os.path.join(outputDir, "QC.1.trimmed.fastq"), os.path.join(outputDir, "QC.2.trimmed.fastq")), os.path.join(outputDir, "QC.unpaired.trimmed.fastq")
    elif os.path.isfile(unpairedFile_output) and os.path.exists(os.path.join(outputDir, "runQC.finished")):
        print("Quality Trim and Filter Finished")
        return "", unpairedFile_output

    os.remove(os.path.join(outputDir, "runQC.finished"))

    parameters = ""
    parameters += f" -p {pairedFile} " if pairedFile else ""
    parameters += f" -u {unpairedFile} " if os.path.getsize(unpairedFile) else ""
    parameters += f" -q {quality_cutoff} --min_L {min_length} --avg_q {avg_quality} -n {num_N} --lc {low_complexity} --5end {cut_5_end} --3end {cut_3_end}"
    parameters += f" --split_size {split_size} -d {outputDir} -t {numCPU}"
    if os.path.exists(configuration.get("adapter", "")) and is_fasta(configuration["adapter"]):
        parameters += f" --adapter --artifactFile {configuration['adapter']}"
    parameters += " --polyA " if configuration.get("polyA") else ""
    parameters += " --trim_only " if ont_flag or pacbio_flag else ""
    parameters += f" --ascii {configuration['qc_phred_offset']} " if "qc_phred_offset" in configuration else ""

    command = f"{RealBin}/bin/FaQCs {parameters} > {log} 2>&1" if pacbio_flag or ont_flag else f"perl {RealBin}/scripts/illumina_fastq_QC.pl {parameters} > {log} 2>&1"
    print(f"Running\n{command}")
    executeCommand(command)

    if ont_flag and configuration.get("porechop"):
        porechop_env = f"{RealBin}/thirdParty/Mambaforge/envs/py38"
        porechop_env_activate = f"source {RealBin}/thirdParty/Mambaforge/bin/activate {porechop_env} 1>/dev/null"
        deactivate_cmd = "source deactivate 2>/dev/null || true"
        cmd = f"{porechop_env_activate}; porechop -i {outputDir}/QC.unpaired.trimmed.fastq -o {outputDir}/QC.unpaired.porechop.fastq -t {numCPU} > {log}; {deactivate_cmd}"
        print(f"Running\n{cmd}")
        executeCommand(cmd)

    if os.path.getsize(os.path.join(outputDir, "QC.unpaired.porechop.fastq")) and ont_flag:
        cmd = f"NanoPlot --fastq {unpairedFile_output} --N50 --loglength -t {numCPU} -f pdf --outdir {outputDir} 2>/dev/null"
        print(f"Running\n{cmd}")
        executeCommand(cmd)

    printRunTime(time_stamp)
    touchFile(os.path.join(outputDir, "runQC.finished"))

    if os.path.getsize(os.path.join(outputDir, "QC.1.trimmed.fastq")):
        return (os.path.join(outputDir, "QC.1.trimmed.fastq"), os.path.join(outputDir, "QC.2.trimmed.fastq")), os.path.join(outputDir, "QC.unpaired.trimmed.fastq")
    elif os.path.getsize(unpairedFile_output):
        return "", unpairedFile_output
    else:
        raise Exception(f"failed: No reads remain after QC. Please see {log}")
