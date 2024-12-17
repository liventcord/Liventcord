#!/bin/bash

LIVENTCORD_REPO="/home/arch/LiventCord"
FRONTEND_REPO="/home/arch/LiventCordFrontend"

cd $LIVENTCORD_REPO
git checkout dev

cp -r $LIVENTCORD_REPO/wwwroot/* $FRONTEND_REPO/

cd $FRONTEND_REPO
git add .
git commit -m "Updated frontend assets from LiventCord's dev branch"
git push origin main 


