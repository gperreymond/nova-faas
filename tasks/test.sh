#!/bin/sh

rm -rf coverage
yarn test:standard
yarn test:coverage
