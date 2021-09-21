#!/bin/bash
cd "$(dirname "$0")"

rm -rf generated/typescript
mkdir -p generated/typescript

echo "Generating TS Files"
./../../node_modules/.bin/grpc_tools_node_protoc \
--js_out=import_style=commonjs,binary:./generated/typescript \
--grpc_out=grpc_js:./generated/typescript \
--plugin=protoc-gen-ts=../../node_modules/.bin/protoc-gen-ts \
--ts_out=grpc_js:./generated/typescript \
-I ./protobuf \
protobuf/*.proto