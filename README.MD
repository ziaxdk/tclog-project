# Elasticsearch

```
$ docker run -it --rm -p 9200:9200 --name es elasticsearch
```


# Fluentd

## Forwarder/agg same node
```
$ docker build -t ziaxdk/tclogfluentd .
$ docker run -it --rm -p 24224:24224 --name fd --link es:es ziaxdk/tclogfluentd
```
## Forwarder
```
$ docker build -t ziaxdk/tclogfluentd_f .
$ docker run -it --rm -p 24224:24224 --name fd_f --link fd:fd ziaxdk/tclogfluentd_f
```

```
docker run -it -p 8888:8888 -v /d/docker/fluentd:/fluentd/etc -e FLUENTD_CONF=log.conf fluent/fluentd
curl -X POST -d 'json={"action":"login","user":2}' http://192.168.99.100:8888/docker.log
```

# Parser

```
$ docker build -t ziaxdk/tclog-parse .
$ docker run -it --rm --name parser -v /d/docker/parse/files/:/usr/src/logs --link fd:fd ziaxdk/tclog-parse
```
```
$ sudo mkdir /d
$ sudo mount -t vboxsf d/Desktop /d
```

# Kibana

```
$ docker run -it --rm --link es:elasticsearch --name kibana -p 5601:5601 kibana
```

Or simple


```
docker run -d -p 9200:9200 --name es elasticsearch
docker run -d --link es:elasticsearch --name kibana -p 5601:5601 kibana
docker run -d -p 24224:24224 --name fd_f --link fd:fd ziaxdk/tclogfluentd_f
docker run -d -p 24224:24224 --name fd --link es:es ziaxdk/tclogfluentd
sudo mkdir /d
sudo mount -t vboxsf d/Desktop /d
docker run -it --rm --name parser -v /d/docker/parse/files/:/usr/src/logs --link fd:fd ziaxdk/tclog-parse                             # Home PC
docker run -it --rm --name parser -v /c/Users/keo/Desktop/tclog-project/parse/files/:/usr/src/logs --link fd:fd ziaxdk/tclog-parse    # Work PC
docker rm -f $(docker ps -a -q) # remove all
``
