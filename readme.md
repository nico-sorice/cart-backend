sudo docker run -it -v "$(pwd)":/var/www node:18-alpine /bin/sh

sudo docker-compose kill app && sudo docker-compose start app