# Use official OpenJDK 17 base image
FROM openjdk:17-jdk-slim

# Set working directory
WORKDIR /app

# Copy Maven wrapper and project files
COPY . .

# Build the app (skip tests for faster builds)
RUN ./mvnw clean package -DskipTests

# Expose port 8080
EXPOSE 8080

# Run the app
CMD ["java", "-jar", "target/mini_chat-0.0.1-SNAPSHOT.jar"]
