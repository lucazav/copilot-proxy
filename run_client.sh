#!/bin/bash
export OPENAI_API_KEY="test"
export OPENAI_API_BASE="http://localhost:3000/v1"

python3 src/client/client.py
