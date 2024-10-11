# LeTour Guide
Limited group voice call software with the aim to reduce hearing difficulties during large tours on campus

# Running the Server
The server is packaged into a docker container. You will need both docker and docker compose installed. To run, simply run this command in the project folder. On macOS, you will need to use `docker-compose` instead of `docker compose`.

```console
$ docker compose up --build
```

> [!NOTE]
> `--build` is important!

Optionally, use the `-d` option to run in the background.
To stop the server that is in the background, use

```console
$ docker compose down
```

# Access
## Front-end Server
The default address of the frontend server is http://localhost:3000.

## Janus Demo Server
The default address of the demo server is http://0.0.0.0:8080. The only demo that works is the Audio Bridge demo as the Janus container is configured to build only the Audio Bridge plugin. On the landing page, go to the top nav bar, click on 'Demos', then click 'Audio Bridge'. To start the demo, press the 'Start' button right under the nav bar.

> [!NOTE]
> Modern web browsers may block access to the microphone on unsecured connections. To fix this on Chrome, access chrome://flags/#unsafely-treat-insecure-origin-as-secure, enable the feature, and add `http://0.0.0.0:8080` to the text box.

# Useful Links
- [Janus Javascript API (janus.js)](https://janus.conf.meetecho.com/docs/JS.html)
- [Audio Bridge Demo](https://janus.conf.meetecho.com/demos/audiobridge.html)
- [Audio Bridge Documentation](https://janus.conf.meetecho.com/docs/audiobridge)
