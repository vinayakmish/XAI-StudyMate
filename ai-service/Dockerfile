FROM python:3.12-slim

ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1

WORKDIR /app

COPY ai-service/requirements.txt /app/ai-service/requirements.txt
RUN pip install --no-cache-dir -r /app/ai-service/requirements.txt

COPY ai-service/app /app/ai-service/app
COPY Indian_Student_Placement_Dataset_2025.csv /app/Indian_Student_Placement_Dataset_2025.csv

WORKDIR /app/ai-service

CMD ["sh", "-c", "uvicorn app.main:app --host 0.0.0.0 --port ${PORT:-10000}"]
