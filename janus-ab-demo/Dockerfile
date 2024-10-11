FROM ubuntu:20.04

ENV TZ=America/Chicago

# install dependancies
RUN apt-get update
RUN apt-get install -y python3
RUN apt-get clean

# copy config files
COPY html /html
WORKDIR /html

# expose necessary ports
EXPOSE 8080

#CMD ["sleep", "infinity"]
CMD ["python3", "-m", "http.server", "8080"]
