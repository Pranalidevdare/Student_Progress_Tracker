#!/usr/bin/env bash
set -euo pipefail

cd "$(dirname "$0")"
./mvnw spring-boot:run -Dspring-boot.run.arguments="--app.seed-demo-data=true" -Dspring-boot.run.jvmArguments="-Dspring.main.web-application-type=none" || {
  echo "Seed failed. Check MongoDB Atlas configuration and credentials." >&2
  exit 1
}
