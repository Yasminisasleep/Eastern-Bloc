# syntax=docker/dockerfile:1.6
# ── Build stage ────────────────────────────────────────────
FROM eclipse-temurin:21-jdk AS build
WORKDIR /app

# Copy Maven wrapper and pom first for better layer caching
COPY mvnw ./
COPY .mvn ./.mvn
COPY pom.xml ./
RUN chmod +x mvnw && ./mvnw -B -q -e -ntp dependency:go-offline

# Copy sources and build
COPY src ./src
RUN ./mvnw -B -q -e -ntp clean package -DskipTests && \
    cp target/*.jar app.jar

# ── Runtime stage ───────────────────────────────────────────
FROM eclipse-temurin:21-jre
WORKDIR /app
RUN groupadd --system kulto && useradd --system --gid kulto kulto
COPY --from=build --chown=kulto:kulto /app/app.jar app.jar
USER kulto
EXPOSE 8080
ENTRYPOINT ["java", "-jar", "app.jar"]
