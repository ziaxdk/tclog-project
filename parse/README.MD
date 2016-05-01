# Build

```
$ docker build -t ziaxdk/tclog-parse .
```

# RUN

```
$ docker run -it --rm --name parser ziaxdk/tclog-parse

$ docker run -it --rm --name parser -v /d/docker/parse/files/:/usr/src/logs --link fd:fd ziaxdk/tclog-parse
```


```
$ sudo mkdir /d
$ sudo mount -t vboxsf d/Desktop /d
```
