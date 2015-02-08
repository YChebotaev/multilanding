export PATH := ./node_modules/.bin/:$(PATH)

all: build/ad-targeting.js build/ad-targeting.min.js

build:
	mkdir -p build

build/ad-targeting.js: build
	@browserify src/ad-targeting.js -o $@

build/ad-targeting.min.js: build/ad-targeting.js
	@uglifyjs $^ --source-map build/ad-targeting.min.js.map -o $@

.PHONY: all build/ad-targeting.min.js build/ad-targeting.js