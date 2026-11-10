# RabbitMQ — Couturia

Exchange cible : `couture.events` (type `topic`).

Le fichier `definitions.json` documente les exchanges / files / bindings prévus.
Au Sprint 1, l’auth-service journalise seulement `utilisateur.inscrit` (publication AMQP réelle au sprint suivant).

UI management : http://localhost:15672  
Identifiants : variables `RABBITMQ_USER` / `RABBITMQ_PASSWORD` (voir `.env.example`).
