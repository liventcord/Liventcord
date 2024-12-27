#!/bin/bash

GIT_URL="https://github.com/liventcord/LiventCordFrontEnd"
DIR="wwwroot"

if [ ! -d "$DIR" ]; then
    echo "The directory '$DIR' does not exist. Cloning it..."
    git clone "$GIT_URL" "$DIR" --depth 1
fi

dotnet run
