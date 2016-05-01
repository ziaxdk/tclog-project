# Elasticsearch

´´´
$ docker run -it --rm -p 9200:9200 --name es elasticsearch
´´´


# Fluentd

´´´
$ docker build -t ziaxdk/tclogfluentd .
$ docker run -it --rm -p 8888:8888 --name fd --link es:es ziaxdk/tclogfluentd
´´´
´´´
docker run -it -p 8888:8888 -v /d/docker/fluentd:/fluentd/etc -e FLUENTD_CONF=log.conf fluent/fluentd
curl -X POST -d 'json={"action":"login","user":2}' http://192.168.99.100:8888/docker.log
´´´

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

´´´
$ docker run -it --rm --link es:elasticsearch --name kibana -p 5601:5601 kibana
´´´
