FROM ubuntu:20.04

# select janus version
ENV JANUS_VERSION=v1.2.4

# config files directory on host
ENV CONFIG_HOST config
# config files directory in container
ENV CONFIG_CONTAINER /usr/local/etc/janus

ENV TZ=America/Chicago
ENV DEBIAN_FRONTEND nointeractive

WORKDIR /root

# install dependancies
RUN apt-get update
RUN apt-get install -y git
RUN apt-get install -y libmicrohttpd-dev
RUN apt-get install -y libjansson-dev
RUN apt-get install -y libssl-dev
RUN apt-get install -y libsofia-sip-ua-dev
RUN apt-get install -y libglib2.0-dev
RUN apt-get install -y libopus-dev
RUN apt-get install -y libogg-dev
RUN apt-get install -y libcurl4-openssl-dev
RUN apt-get install -y liblua5.3-dev
RUN apt-get install -y libconfig-dev
RUN apt-get install -y libsrtp2-dev
RUN apt-get install -y pkg-config
RUN apt-get install -y libtool
RUN apt-get install -y automake
RUN apt-get install -y make
RUN apt-get install -y cmake
RUN apt-get install -y python3
RUN apt-get install -y meson
RUN apt-get clean
# manually make and build libnice
RUN git clone https://gitlab.freedesktop.org/libnice/libnice
WORKDIR /root/libnice
RUN meson --prefix=/usr --libdir=lib build && ninja -C build && ninja -C build install
# manually make libwebsockets
WORKDIR /root
RUN git clone https://libwebsockets.org/repo/libwebsockets
WORKDIR /root/libwebsockets
RUN git checkout v4.3-stable
RUN mkdir build
WORKDIR /root/libwebsockets/build
RUN cmake -DLWS_MAX_SMP=1 -DLWS_WITHOUT_EXTENSIONS=0 -DCMAKE_INSTALL_PREFIX:PATH=/usr -DCMAKE_C_FLAGS="-fpic" ..
RUN make && make install

## build janus repo
WORKDIR /opt
RUN git clone https://github.com/meetecho/janus-gateway.git
WORKDIR /opt/janus-gateway
RUN git checkout $JANUS_VERSION
RUN ./autogen.sh && ./configure --disable-all-plugins --enable-plugin-audiobridge --enable-websockets
RUN make && make install && make configs

# copy config files
COPY $CONFIG_HOST/* $CONFIG_CONTAINER

# expose necessary ports
EXPOSE 7088 8088 8188

#CMD ["sleep", "infinity"]
CMD ["janus", "-F", "/usr/local/etc/janus"]
