# docker/ai_module.Dockerfile.dev
FROM python:alpine@sha256:18159b2be11db91f84b8f8f655cd860f805dbd9e49a583ddaac8ab39bf4fe1a7

WORKDIR /app

# Copy requirements first for better caching
COPY ai_module/requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt

# Install development tools
RUN pip install --no-cache-dir pytest pytest-cov black flake8

# The rest of the application will be mounted as a volume