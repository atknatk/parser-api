# Docker Hub kullanıcı adı
$dockerUsername = "dockerhub_kullanici_adi"
$imageName = "extract-html-api"
$version = "1.0"

# Docker image oluşturma
Write-Host "Docker image oluşturuluyor..."
docker build -t "$dockerUsername/$imageName:$version" .

# Docker Hub'a giriş yap
Write-Host "Docker Hub'a giriş yapılıyor..."
docker login

# Docker image'i push etme
Write-Host "Docker image Docker Hub'a gönderiliyor..."
docker push "$dockerUsername/$imageName:$version"

Write-Host "Docker push işlemi tamamlandı!"
