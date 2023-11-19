#! /bin/sh

npx http-server -p 8080 dist/examples/typescript \
	& npx http-server -p 8081 dist/examples/typescript \
	& wait
