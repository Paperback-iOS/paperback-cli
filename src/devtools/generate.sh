#!/bin/bash
cd "$(dirname "$0")"

rm -rf generated

chmod +x ./generate-ts.sh
chmod +x ./generate-swift.sh

./generate-ts.sh
./generate-swift.sh