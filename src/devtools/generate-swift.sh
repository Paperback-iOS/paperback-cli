#!/bin/bash
cd "$(dirname "$0")"

rm -rf generated/swift
mkdir -p generated/swift

echo "Generating Swift Files"
protoc ./protobuf/*.proto \
--proto_path=./protobuf \
--plugin=./plugins/protoc-gen-swift \
--plugin=./plugins/protoc-gen-grpc-swift \
--swift_opt=Visibility=Public \
--swift_out=./generated/swift \
--grpc-swift_opt=Visibility=Public \
--grpc-swift_out=./generated/swift \