
task RunPorechop {
  input {
    String inputFastq
    String outputFastq
    Int numCPU
  }

  command {
    String porechopEnv = "${RealBin}/thirdParty/Mambaforge/envs/py38"
    String porechopEnvActivate = "source ${RealBin}/thirdParty/Mambaforge/bin/activate ${porechopEnv} 1>/dev/null"
    String deactivateCmd = "source deactivate 2>/dev/null || true"
    String command = "${porechopEnvActivate}; porechop -i ${inputFastq} -o ${outputFastq} -t ${numCPU} > ${log}; ${deactivateCmd}"
    
    command { command }
  }

  output {
    File trimmedFastq = "${outputFastq}"
  }
}