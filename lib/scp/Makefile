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

clean:
	rm -f $(TESTS_DIR)/catch2.o
	rm -f $(TESTS_DIR)/main.o
	rm -f $(TESTS_DIR)/main
