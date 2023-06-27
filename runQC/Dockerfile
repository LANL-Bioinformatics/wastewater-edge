# syntax=docker/dockerfile:1
FROM continuumio/miniconda3:latest

ENV container docker

# dependencies for faqcs
RUN apt-get update -y \
  && apt-get install -y zlib1g \
  && apt-get install -y jellyfish 

# add conda channels
RUN conda config --add channels conda-forge \
    && conda config --add channels bioconda

# install faqcs
RUN conda install -c bioconda faqcs=2.10

# add files
# ADD runQC_subroutines/* /opt/conda/bin/runQC_subroutines/
ADD *.wdl /opt/conda/bin/

# ENV PATH="${PATH}:/opt/conda/bin/runQC_subroutines"

CMD ["/bin/bash"]

