FROM python:3.11-slim

WORKDIR /app

# copy project
COPY . .

# go to rag processor
WORKDIR /app/services/pathway-processor

# install dependencies
RUN pip install --no-cache-dir -r requirements.txt

# Render provides PORT automatically
ENV PORT=10000

EXPOSE 10000

CMD ["python", "main.py"]