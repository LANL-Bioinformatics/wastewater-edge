# syntax=docker/dockerfile:1
FROM continuumio/miniconda3:24.5.0-0 AS build

ENV container=docker

# add conda channels
RUN conda config --add channels conda-forge \
    && conda config --add channels bioconda

RUN conda init bash \
    && . ~/.bashrc \
    && conda create --name contigsTaxonomyAssignment \
    && conda activate contigsTaxonomyAssignment 

RUN conda install -n contigsTaxonomyAssignment python=3.9
RUN conda install -n contigsTaxonomyAssignment r-base=4.3.1
RUN conda install -n contigsTaxonomyAssignment -c bioconda minimap2=2.22
RUN conda install -n contigsTaxonomyAssignment -c bioconda pandas=2.2.2
RUN conda install -c conda-forge conda-pack

RUN git clone --depth 1 https://github.com/poeli/miccr.git

#add scripts from this project to bin
ADD bin/* /opt/conda/envs/contigsTaxonomyAssignment/bin

#pack environment for runtime image
RUN conda-pack -n contigsTaxonomyAssignment -o /tmp/env.tar && \
    mkdir /venv && cd /venv && tar xf /tmp/env.tar && \
    rm /tmp/env.tar

RUN /venv/bin/conda-unpack

FROM debian:latest AS runtime

COPY --from=build /venv /venv
COPY --from=build /miccr /miccr

#add environment, pangia base and vis-scripts to PATH
ENV PATH=/venv/bin:/miccr:/miccr/utils:$PATH

SHELL ["/bin/bash", "-c"]
CMD /bin/bash