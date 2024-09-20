# LeTour Guide
Limited group voice call software with the aim to reduce hearing difficulties during large tours on campus

# Running the Server
The server is packaged into a docker container. You will need both docker and docker-compose installed. To run, simply run this command in the project folder.

```console
$ docker-compose up --build
```

> [!NOTE]
> `--build` is important! Not invoking this option will not initialize the frontend!

Optionally, use the `-d` option to run in the background.
To stop the server that is in the background, use

```console
$ docker-compose down
```
