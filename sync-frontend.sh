#!/bin/bash

LIVENTCORD_REPO="~/LiventCord"
FRONTEND_REPO="~/LiventCordFrontend"

cd $LIVENTCORD_REPO
git checkout dev

cp -r $LIVENTCORD_REPO/wwwroot/* $FRONTEND_REPO/

cd $FRONTEND_REPO
git add .
git commit -m "Updated frontend assets from LiventCord's dev branch"
git push origin main 


