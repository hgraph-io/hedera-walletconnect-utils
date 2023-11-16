#! /bin/sh

rm -Rf demo/dist

mkdir -p demo/dist/wallet
mkdir -p demo/dist/dApp

ln -s ../src/index.html demo/dist/index.html
ln -s ../../src/wallet/index.html demo/dist/wallet/index.html
ln -s ../../src/dApp/index.html demo/dist/dApp/index.html

node demo/build/build_watch.mjs
