# syntax=docker/dockerfile:1
FROM ubuntu:latest

ENV container docker
ADD runQC_subroutines/* usr/bin/runQC_subroutines/
ADD *.wdl /usr/bin

# ignore suggested or recommended package downloads
RUN echo 'APT::Install-Suggests "0";' >> /etc/apt/apt.conf.d/00-docker
RUN echo 'APT::Install-Recommends "0";' >> /etc/apt/apt.conf.d/00-docker

RUN DEBIAN_FRONTEND=noninteractive \
  apt-get update \
  && apt-get install -y zlib1g \
  && apt-get install -y r-base-core \
  && rm -rf /var/lib/apt/lists/*

ENV PATH="${PATH}:/usr/bin/runQC_subroutines"

CMD ["/bin/bash"]

