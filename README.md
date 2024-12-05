# Informačná Architektúra Inventárnej Aplikácie

## Prehľad
Aplikácia na správu inventára obsahuje frontend vyvinutý v Next.js, ktorý zahŕňa aj API server, a backend postavený na PHP serveri a PostgreSQL databáze. Používateľská interakcia prebieha cez dashboard, pričom administrátori majú dodatočné možnosti správy.

---

## Hlavné Sekcie Aplikácie

### 1. **Prihlasovacia Stránka**
- **Účel:** Overenie používateľa a umožnenie prístupu k aplikácii.
- **Obsah:**
  - Prihlasovací formulár (email, heslo).
  - Odkaz na obnovenie hesla.
- **API Endpoints:**
  - `POST /api/auth/login` – Overenie používateľa.
  - `POST /api/auth/forgot-password` – Obnovenie hesla.

---

### 2. **Dashboard**
- **Účel:** Zobrazenie hlavného prehľadu inventára a akcií používateľa.
- **Obsah:**
  - Zoznam všetkých položiek inventára.
  - Tlačidlá pre základné akcie (vyhľadávanie, filtrovanie, požičanie).
  - Stav položiek (`dostupné`, `požičané`, `údržba`).
- **API Endpoints:**
  - `GET /api/items` – Načítanie všetkých položiek.
  - `GET /api/items?status=available` – Filtrovanie podľa stavu.

---

### 3. **Detail Položky**
- **Účel:** Zobraziť podrobnosti o konkrétnej položke a umožniť ďalšie akcie.
- **Obsah:**
  - Názov položky.
  - Popis položky.
  - Stav položky.
  - História požičiavania.
  - Tlačidlá na akcie (požičanie, návrat, údržba).
- **API Endpoints:**
  - `GET /api/items/:id` – Načítanie detailov položky.
  - `POST /api/borrowing-records` – Požičanie položky.
  - `PUT /api/items/:id` – Aktualizácia stavu položky.

---

### 4. **Sekcia Pre Administrátora**
- **Účel:** Poskytnúť administrátorom nástroje na správu inventára a používateľov.
- **Obsah:**
  - Formulár na pridávanie nových položiek.
  - Zoznam používateľov s možnosťou editácie.
  - Reporty o využití inventára.
- **API Endpoints:**
  - `POST /api/items` – Pridanie novej položky.
  - `GET /api/users` – Načítanie zoznamu používateľov.
  - `PUT /api/users/:id` – Aktualizácia používateľského účtu.

---

## Technická Architektúra

### Frontend
- **Framework:** React + Next.js
- **Deployment:** Vercel
- **Docker:** Áno, cez `Dockerfile` a `docker-compose.yml`

### Backend
- **API Routes:** PHP server
- **Databáza:** PostgreSQL
- **Príklady API Endpointov:**
  - `GET /api/items`
  - `POST /api/borrowing-records`

### Prostredie
- **Env Variables:**
  - `POSTGRES_URL`
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`

---

## Funkčné Požiadavky
- **Používatelia:**
  - Registrácia a prihlásenie.
  - Zobrazenie a filtrovanie inventára.
  - Požičiavanie a vracanie položiek.
- **Administrátori:**
  - Správa inventára (pridanie, aktualizácia, odstraňovanie položiek).
  - Správa používateľov.

---

## Deployment
- **Platforma:** Vercel
- **CI/CD:** Automatický deploy z GitHub repozitára.
- **Docker:** Použitý na lokálny vývoj a testovanie s PHP a PostgreSQL.

---

## Budúce Rozšírenia
- Notifikácie používateľom o termínoch vrátenia položiek.
- Pokročilé štatistiky využitia inventára.
- Integrácia s QR kódmi (voliteľné).
