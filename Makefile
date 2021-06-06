.DEFAULT_GOAL := help

help: ## Shows help message.
	@printf "\033[1m%s\033[36m %s\033[32m %s\033[0m \n\n" "Development environment for" "HACS" "Frontend";
	@awk 'BEGIN {FS = ":.*##";} /^[a-zA-Z_-]+:.*?##/ { printf " \033[36m make %-18s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST);
	@echo

init: bootstrap

start: ## Start the frontend
	yarn start;

bootstrap: ## Run yarn
	yarn;

build: ## Build the frontend
	yarn build;

update: ## Pull main from hacs/frontend
	git pull upstream main;

update-submodule: ## Udpate submodules
	rm -R homeassistant-frontend;
	git submodule update --init --recursive --remote;
	script/bootstrap