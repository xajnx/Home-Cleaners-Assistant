# Base image with Python
FROM python:3.11-slim

# Set working directory
WORKDIR /app

# Install system packages required by WeasyPrint and OpenCV
RUN apt-get update && apt-get install -y \
    build-essential \
    libpango-1.0-0 \
    libpangocairo-1.0-0 \
    libcairo2 \
    libjpeg-dev \
    libffi-dev \
    libxml2 \
    libxslt1.1 \
    libssl-dev \
    libpq-dev \
    libgl1 \
    && apt-get clean \
    && rm -rf /var/lib/apt/lists/*

# Copy dependency list and install
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Copy all source code
COPY . .

# Create the uploads folder if it doesn't exist
RUN mkdir -p uploads

# Expose port
EXPOSE 8000

# Run the app with Uvicorn
CMD ["uvicorn", "main:app", "--host", "0.0.0.0", "--port", "8000"]