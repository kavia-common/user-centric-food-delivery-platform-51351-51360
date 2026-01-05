#!/bin/bash
cd /home/kavia/workspace/code-generation/user-centric-food-delivery-platform-51351-51360/frontend
npm run build
EXIT_CODE=$?
if [ $EXIT_CODE -ne 0 ]; then
   exit 1
fi

