CXX := clang++

ifeq ($(shell command -v g++ 2> /dev/null),)
	CXX := g++
endif

ifeq ($(shell command -v clang++ 2> /dev/null),)
	CXX := clang++
endif

ifeq ($(CXX),)
$(error No C++ compiler found)
endif

LASTDIR := $(shell pwd)
DIR := $(shell dirname $(realpath $(lastword $(MAKEFILE_LIST))))
TESTS_DIR := $(DIR)/tests

.PHONY: all clean

all: run-tests

$(TESTS_DIR)/catch2.o: $(TESTS_DIR)/catch2.cpp
	$(CXX) -c $< -o $@

$(TESTS_DIR)/main.o: $(TESTS_DIR)/main.cpp
	$(CXX) -c $< -o $@

$(TESTS_DIR)/main: $(TESTS_DIR)/catch2.o $(TESTS_DIR)/main.o
	$(CXX) $^ -o $@

run-tests: $(TESTS_DIR)/main
	$(TESTS_DIR)/main

ifeq ($(shell command -v emcc 2> /dev/null),)
wasm: $(DIR)/scp.h $(DIR)/scp_wasm.c
	echo "emcc not found"
else
wasm: $(DIR)/scp.h $(DIR)/scp_wasm.c
	emcc --no-entry -O3 -s EXPORT_ES6=1 -s MODULARIZE=1 -s WASM=1 -s EXPORTED_RUNTIME_METHODS='["cwrap","getValue","setValue","AsciiToString","stringToAscii"]' -s EXPORTED_FUNCTIONS='["_malloc","_free"]' -o $(DIR)/js/scp.mod.js $(DIR)/scp_wasm.c
endif

clean:
	rm -f $(TESTS_DIR)/catch2.o
	rm -f $(TESTS_DIR)/main.o
	rm -f $(TESTS_DIR)/main
	rm -f $(DIR)/js/scp.mod.js
	rm -f $(DIR)/js/scp.mod.wasm
