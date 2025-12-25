NEA_ENV ?= .env
DOCKER_COMPOSE ?= docker compose --env-file $(NEA_ENV) --profile production

NEA_ENV_DEV ?= .env.dev
DOCKER_COMPOSE_DEV ?= docker compose --env-file $(NEA_ENV_DEV) --profile development

.PHONY: up rebuild down logs ps nea-api

up:
	$(DOCKER_COMPOSE) up -d

up-dev:
	$(DOCKER_COMPOSE_DEV) up -d

stop:
	$(DOCKER_COMPOSE) stop

stop-dev:
	$(DOCKER_COMPOSE_DEV) stop

restart:
	$(DOCKER_COMPOSE) restart

restart-dev:
	$(DOCKER_COMPOSE_DEV) restart

rebuild:
	$(DOCKER_COMPOSE) up -d --build

rebuild-dev:
	$(DOCKER_COMPOSE_DEV) up -d --build

down:
	$(DOCKER_COMPOSE) down

down-dev:
	$(DOCKER_COMPOSE_DEV) down

down-v:
	$(DOCKER_COMPOSE) down -v

down-v-dev:
	$(DOCKER_COMPOSE_DEV) down -v

down-r:
	$(DOCKER_COMPOSE) down --remove-orphans

destroy:
	docker system prune -a --volumes

logs:
	$(DOCKER_COMPOSE) logs -f

logs-dev:
	$(DOCKER_COMPOSE_DEV) logs -f

ps:
	$(DOCKER_COMPOSE) ps

ps-dev:
	$(DOCKER_COMPOSE_DEV) ps

image-prune:
	docker image prune -f

volume-prune:
	docker volume prune -f

pull:
	$(DOCKER_COMPOSE) pull
