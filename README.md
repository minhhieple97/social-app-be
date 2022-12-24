# Setup local

- To run service: docker-compose -f {file-name} up -d
- To stop service: docker-compose -f {file-name} down

- Setup mongodb

* Run docker volume create --name=mongodb_data before up container
* To access mongodb container try: docker exec -it mongo /bin/sh

- Setup redis

* To access redis container try: docker exec -it redis /bin/sh => redis-cli

* To rebuild image: docker-compose up -d --force-recreate
