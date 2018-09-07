#!/bin/sh

trap "echo TRAPed signal" HUP INT QUIT TERM

watchman -j < ./watchmanTrigger.json && watchman watch-project .

nodemon ./app.js

echo "run 'docker stop <container>' to stop"

echo "exited $0"
