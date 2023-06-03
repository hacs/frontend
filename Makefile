.DEFAULT_GOAL := help

help: ## Shows help message.
	@printf "\033[1m%s\033[36m %s\033[32m %s\033[0m \n\n" "Development environment for" "HACS" "Frontend";
	@awk 'BEGIN {FS = ":.*##";} /^[a-zA-Z_-]+:.*?##/ { printf " \033[36m make %-18s\033[0m %s\n", $$1, $$2 } /^##@/ { printf "\n\033[1m%s\033[0m\n", substr($$0, 5) } ' $(MAKEFILE_LIST);
	@echo

init: bootstrap

start: ## Start the frontend
	yarn start;

bootstrap: ## Run yarn
	git submodule update --init;
	yarn;

build: ## Build the frontend
	yarn build;

update: ## Pull main from hacs/frontend
	git pull upstream main;

update-submodule: ## Udpate submodules
	git submodule update --recursive --remote;
	script/bootstrap

tag-name: ## Create a tag name
	@date --utc '+%Y%m%d%H%M%S'
