no-command:
	@echo Usage: make [scenario]

# Stop, rebuild and run again
rebuild: stop remove build run

# Build image
build:
	docker build -t reverse-proxy-image .

# Run container
run:
	docker run -d \
		--name reverse-proxy \
		-p 80:80 \
		-p 443:443 \
		--mount type=bind,source="${CURDIR}/includes",target=/etc/nginx/includes \
		--mount type=bind,source="${CURDIR}/sites",target=/etc/nginx/sites \
		--mount type=bind,source="${CURDIR}/cert",target=/etc/ssl \
		reverse-proxy-image

# Stop container
stop:
	docker stop reverse-proxy

# Start container
start:
	docker start reverse-proxy

# Remove container
remove:
	docker rm reverse-proxy


check-config:
	docker exec -ti reverse-proxy nginx -t

# Reload Nginx configuration
reload:
	docker exec -ti reverse-proxy nginx -s reload

bash:
	docker exec -ti reverse-proxy bash

test:
	curl --connect-timeout 1 -I http://hello.localhost
