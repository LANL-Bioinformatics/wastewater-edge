#!/bin/bash
echo "Install LANL EDGE webapp..."
pwd=$PWD
app_home="$(dirname "$pwd")"

#create upload/log/projects/public directories, skip this step for reinstallation
io_home=$app_home/io
if [ ! -d  $io_home ]; then
  echo "Create directories"
  mkdir ${io_home}
  dirs=(
    "upload"
    "upload/files"
    "upload/tmp" 
    "log"
    "projects"
    "public"
    "sra"
    "db"
  )

  for dir in "${dirs[@]}"
  do
    mkdir ${io_home}/${dir}
  done

  test_data_home=$app_home/workflows/Nextflow/test_data
  if [ -d  $test_data_home ]; then
    ln -s ${test_data_home} ${io_home}/public/nextflow
  fi
fi

echo "Setup LANL EDGE webapp ..."
#build client
echo "build client..."
cd $app_home/webapp/client
npm install --legacy-peer-deps
npm run build
#build server
echo "build server..."
cd $app_home/webapp/server
npm install

echo "LANL EDGE webapp successfully installed!"
echo "To start the webapp in EDGEv3's root directory:"
echo "pm2 start pm2.config.js"