# Kulto : Sprint Planning

## Timeline

| Sprint | Dates | Objectif | Jalon |
|--------|-------|----------|-------|
| S0 | 19 fev au 26 fev | Setup DevOps + conception | M1 |
| S1 | 26 fev au 12 mars | CRUD evenements + Kafka | |
| S2 | 12 mars au 27 mars | Profils, matching, notifications | M2 (MVP) |
| S3 | 27 mars au 15 avril | Tests, stabilisation, CI/CD | |
| S4 | 15 avril au 24 avril | Release 1.0 + demo | Soutenance |

---

## Sprint 0 : Setup DevOps et Conception (19 fev au 26 fev)

| Tache |
|-------|
| Creation du repo GitHub + structure du projet |
| Init du projet Spring Boot (Maven, Java 21) |
| Init du projet React (Vite + React 18) |
| Ecriture du docker-compose (backend, frontend, PostgreSQL, Kafka, Zookeeper) |
| Mise en place GitHub Actions (CI : build + tests) |
| Configuration GitHub Projects (Kanban) + creation des premieres issues |
| POC Kafka : un producer et un consumer basiques |
| Redaction du document de conception + user stories |
| Creation des diagrammes d'architecture |

Livrable : repo structure, CI fonctionnelle, docker-compose qui lance toute la stack, document de conception.

---

## Sprint 1 : CRUD Evenements et Ingestion Kafka (26 fev au 12 mars)

20 story points.

### User Stories

| US | Titre | Points |
|----|-------|--------|
| 03 | Creation d'un evenement (admin) | 3 |
| 04 | Liste des evenements avec filtrage | 5 |
| 05 | Detail d'un evenement | 2 |
| 06 | Modification / suppression d'un evenement | 2 |
| 08 | Ingestion d'evenements via Kafka | 8 |

### Taches techniques

| Tache |
|-------|
| Modele de donnees (entites JPA : Event, Category, Tag) |
| Jeu de donnees initial (seed) |
| Configuration Spring Data JPA + PostgreSQL |
| Configuration Spring Kafka (producer + consumer) |
| Pages frontend : liste des evenements + detail |
| Configuration JaCoCo dans le build Maven |
| Tests unitaires sur les endpoints CRUD |
| Setup springdoc-openapi (Swagger UI) |

Livrable : API CRUD evenements fonctionnelle, consumer Kafka sur events.ingestion, pages frontend liste et detail.

---

## Sprint 2 : Profils, Matching et Notifications (12 mars au 27 mars)

29 story points.

### User Stories

| US | Titre | Points |
|----|-------|--------|
| 01 | Inscription utilisateur | 3 |
| 02 | Connexion / authentification JWT | 3 |
| 07 | Preferences culturelles | 5 |
| 09 | Matching entre utilisateurs | 8 |
| 10 | Notifications de match (quota journalier) | 5 |
| 11 | Accepter / refuser un match | 5 |

### Taches techniques

| Tache |
|-------|
| Entites : User, Preference, Match, Notification |
| Spring Security + JWT |
| Moteur de matching (algorithme par tags partages) |
| Topic user.preferences.updated (producer + consumer) |
| Topic match.notifications (producer + consumer) |
| Frontend : inscription, connexion, preferences |
| Frontend : notifications, detail du match, accepter/refuser |
| Tests d'integration Kafka (Testcontainers) |
| Revue de code croisee |

Livrable : MVP fonctionnel, les 3 topics Kafka operationnels.

---

## Sprint 3 : Tests et Stabilisation (27 mars au 15 avril)

| Tache |
|-------|
| Atteindre 70% de couverture (JaCoCo) |
| Tests unitaires sur tous les services metier |
| Tests d'integration API (MockMvc) |
| Tests d'integration Kafka (Testcontainers) |
| Pipeline CI/CD complete (build Docker + push GHCR) |
| Environnement staging (docker-compose.prod.yml) |
| Validation des entrees, gestion d'erreurs, CORS |
| Documentation API (Swagger/OpenAPI) |
| Audit de securite |

Livrable : couverture 70%, pipeline CI/CD complete, Swagger UI, environnement staging.

---

## Sprint 4 : Release (15 avril au 24 avril)

| Tache |
|-------|
| Code freeze le 20 avril |
| Tag de la release v1.0.0 |
| Verification du docker-compose up de bout en bout |
| Scenario de demo (parcours utilisateur complet) |
| Jeu de donnees de demo |
| Preparation des slides |
| Repetition |
| Derniers correctifs |
| Finalisation de la documentation |

Livrable : release v1.0.0 tagguee, images Docker sur GHCR, demo fonctionnelle, slides.

---

## Organisation

| Ceremonie | Frequence | Duree | Format |
|-----------|-----------|-------|--------|
| Daily standup | Quotidien | 10 min | Async sur Discord |
| Sprint planning | Debut de sprint | 30 min | En presentiel |
| Sprint review | Fin de sprint | 30 min | En presentiel + demo |
| Retrospective | Fin de sprint | 15 min | En presentiel |