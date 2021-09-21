#!/bin/bash
cd "$(dirname "$0")"

rm -rf generated/typescript
mkdir -p generated/typescript

echo "Generating TS Files"
protoc ./protobuf/*.proto \
--proto_path=./protobuf \
--plugin=protoc-gen-ts=../../node_modules/.bin/protoc-gen-ts \
--plugin=protoc-gen-grpc=../../node_modules/.bin/grpc_tools_node_protoc_plugin \
--js_out=import_style=commonjs,binary:./generated/typescript \
--ts_out=./generated/typescript \
--grpc_out=import_style=commonjs,binary:./generated/typescript