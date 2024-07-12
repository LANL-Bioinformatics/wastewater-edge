FROM continuumio/miniconda3:23.5.2-0

ENV container=docker

# add conda channels
RUN conda config --add channels conda-forge \
    && conda config --add channels bioconda

# install dependencies
RUN conda install conda-libmamba-solver
RUN conda config --set solver libmamba
RUN conda install -c conda-forge python=3.9
RUN conda install -c bioconda samtools=1.17
RUN conda install -c bioconda racon=1.5
RUN conda install -c bioconda seqtk=1.3
RUN conda install -c bioconda spades=3.15.5
RUN conda install -c bioconda minimap2=2.26
RUN conda install -c bioconda megahit=1.2.9
RUN conda install -c bioconda idba=1.1.3
RUN conda install -c bioconda unicycler=0.5.0
RUN wget https://github.com/ruanjue/wtdbg2/releases/download/v2.5/wtdbg-2.5_x64_linux.tgz
RUN tar -xvzf wtdbg-2.5_x64_linux.tgz
RUN cp wtdbg-2.5_x64_linux/* /opt/conda/bin
RUN conda install -c bioconda flye=2.9.2
RUN git clone --depth 1 https://gitlab.com/chienchi/long_read_assembly.git
ENV PATH="/long_read_assembly:$PATH"

ADD bin/extractLongReads.pl /opt/conda/bin
ADD bin/getAvgLen.pl /opt/conda/bin
ADD bin/renameFilterFasta.pl /opt/conda/bin

CMD ["/bin/bash"]