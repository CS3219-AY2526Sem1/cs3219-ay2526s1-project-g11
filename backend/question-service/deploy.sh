#!/bin/bash
set -e

gcloud run deploy question-service \
  --source=. \
  --region=asia-southeast1 \
  --set-secrets=POSTGRES_URL=POSTGRES_URL:latest,QUESTION_SERVICE_API_KEY=QUESTION_SERVICE_API_KEY:latest \
  --add-cloudsql-instances=peerprep-472817:asia-southeast1:question-postgres \
  --service-account=github-cd@peerprep-472817.iam.gserviceaccount.com