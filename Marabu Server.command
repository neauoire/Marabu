#!/bin/bash
cd `dirname "$BASH_SOURCE"`
{
  sleep 1
  open -a "Google Chrome" http://localhost:8033/
}&    
python -m SimpleHTTPServer 8033
