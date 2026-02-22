#!/usr/bin/env bash
# Run God Mode API locally
cd "$(dirname "$0")"
export PYTHONPATH=.
uvicorn app.main:app --reload --host 0.0.0.0 --port 8200
