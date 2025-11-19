profiles {
  local {
    executor.name = 'local'
    process {
      errorStrategy = { (task.attempt <= 3) ? 'retry' : 'ignore' } //allow workflow to continue if some processes don't complete
    }
  }

  slurm {
    //sets executor to slurm
    executor.name = "slurm"
    //controls job names
    executor.jobName = {"$task.process"}
    executor.queueSize=10
    process {
      scratch = true
      //options to provide for all processes submitted as cluster jobs (e.g. "--account xx")
      clusterOptions = ""
      errorStrategy = { (task.attempt <= 3) ? 'retry' : 'ignore' } //allow workflow to continue if some processes don't complete
      maxRetries = 3
    }
  }
}