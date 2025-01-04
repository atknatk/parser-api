#!/bin/bash

# Docker Hub kullanıcı adınızı belirtin
DOCKER_USERNAME="atknatk"
IMAGE_NAME="extract-html-api"
VERSION="1.0"

# Docker image oluşturma
echo "Docker image oluşturuluyor..."
docker build -t $DOCKER_USERNAME/$IMAGE_NAME:$VERSION .

# Docker Hub'a giriş yap
echo "Docker Hub'a giriş yapılıyor..."
docker login

# Docker image'i push etme
echo "Docker image Docker Hub'a gönderiliyor..."
docker push $DOCKER_USERNAME/$IMAGE_NAME:$VERSION

echo "Docker push işlemi tamamlandı!"
