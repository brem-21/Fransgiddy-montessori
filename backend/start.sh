#!/usr/bin/env bash
set -a
source "$(dirname "$0")/backend-env.env"
set +a
mvn spring-boot:run -DskipTests
