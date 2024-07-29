# syntax=docker/dockerfile:1
FROM continuumio/miniconda3:24.5.0-0 AS build

ENV container=docker

# add conda channels
RUN conda config --add channels conda-forge \
    && conda config --add channels bioconda

RUN conda init bash \
    && . ~/.bashrc \
    && conda create --name readsTaxonomyAssignment \
    && conda activate readsTaxonomyAssignment 

RUN conda install -n readsTaxonomyAssignment -c bioconda metaphlan=4.1.1
RUN conda install -n readsTaxonomyAssignment python=3.11
#the required version of diamond is 2.0.5, but this runs into conda installation problems
#we will install it here to handle any dependencies, then later replace diamond with the appropriate release
RUN conda install -n readsTaxonomyAssignment -c bioconda diamond 
RUN conda install -n readsTaxonomyAssignment -c bioconda perl-json
RUN conda install -n readsTaxonomyAssignment -c bioconda perl-html-template
RUN conda install -n readsTaxonomyAssignment -c bioconda perl-xml-simple
RUN conda install -n readsTaxonomyAssignment -c bioconda perl-excel-writer-xlsx
RUN conda install -n readsTaxonomyAssignment -c bioconda kraken2
RUN conda install -n readsTaxonomyAssignment -c bioconda krona
RUN conda install -n readsTaxonomyAssignment -c bioconda perl-yaml
RUN conda install -n readsTaxonomyAssignment -c bioconda centrifuge
RUN conda install -n readsTaxonomyAssignment -c bioconda gottcha2
RUN conda install -n readsTaxonomyAssignment -c bioconda minimap2=2.17
RUN conda install -n readsTaxonomyAssignment -c bioconda pybedtools
RUN conda install -n readsTaxonomyAssignment -c conda-forge parallel
#conda does not have the most recent version of gottcha (1.0b instead of 1.0c), 
#but we encounter errors when compiling splitrim.d in gottcha's latest source code release. 
#we will install gottcha here and later replace the non-splitrim scripts with the latest source code.
RUN conda install -n readsTaxonomyAssignment -c bioconda gottcha
RUN conda install -c conda-forge conda-pack


#correct diamond version
RUN wget https://github.com/bbuchfink/diamond/releases/download/v2.0.5/diamond-linux64.tar.gz \
    && tar -xvzf diamond-linux64.tar.gz \
    && rm /opt/conda/envs/readsTaxonomyAssignment/bin/diamond \
    && mv diamond /opt/conda/envs/readsTaxonomyAssignment/bin

#correct gottcha version
RUN wget https://github.com/LANL-Bioinformatics/GOTTCHA/archive/refs/tags/1.0c.tar.gz \
    && tar -xvzf 1.0c.tar.gz \
    && chmod 755 GOTTCHA-1.0c/src/*.pl \
    && mv -f -v GOTTCHA-1.0c/src/*.pl /opt/conda/envs/readsTaxonomyAssignment/bin

#add scripts from this project to bin
ADD bin/* /opt/conda/envs/readsTaxonomyAssignment/bin

#download latest PanGIA 
#ISSUE: differs from version in EDGE's third-party software, in ways that break scripts
#we can get EDGE's version from its third-party tarball, but it's a wastefully large download.
RUN wget https://ref-db.edgebioinformatics.org/EDGE/dev/edge_dev_thirdParty_softwares.tgz \
    && tar -xvzf edge_dev_thirdParty_softwares.tgz \
    && tar -xvzf thirdParty/pangia-1.0.0.tar.gz -C . \
    && mv pangia /opt/conda/envs/readsTaxonomyAssignment/opt

#pack environment for runtime image
RUN conda-pack -n readsTaxonomyAssignment -o /tmp/env.tar && \
    mkdir /venv && cd /venv && tar xf /tmp/env.tar && \
    rm /tmp/env.tar

RUN /venv/bin/conda-unpack

FROM debian:latest AS runtime

COPY --from=build /venv /venv

#add environment, pangia base and vis-scripts to PATH
ENV PATH=/venv/bin:/venv/opt/pangia:/venv/opt/pangia/pangia-vis/scripts:$PATH
#run krona scripts
RUN /venv/opt/krona/updateTaxonomy.sh
RUN /venv/opt/krona/updateAccessions.sh 
#very long step. attempting w/greater resources, then may consider shifting to workflow.


SHELL ["/bin/bash", "-c"]
CMD /bin/bash