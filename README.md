# Informačná Architektúra Inventárnej Aplikácie

## Prehľad
Aplikácia na správu inventára obsahuje frontend vyvinutý v Next.js, a backend postavený na PHP serveri a PostgreSQL databáze. Používateľská interakcia prebieha cez dashboard, pričom administrátori majú dodatočné možnosti správy.

## Problém, ktorý rieši

### Problém
Uzavreté kluby a spolky často potrebujú spravovať svoj inventár, ktorý je zdieľaný medzi členmi a stáva sa že nevie sa u koho sa nachádzajú rôzne položky a je veľmi náročné zisťovať kde sú.

### Riešenie
Táto aplikácia umožňuje používateľom prezerať inventár, požičiavať si položky a vracať ich včas. Administrátori majú prístup k nástrojom na správu inventára a používateľov a prehľad o položkách a ľuďoch u ktorých sú požičané.

---

## Personas
### Používateľ (požičateľ)
- **Popis:** Používateľ z prostredia uzavretého klubu ľudí, ktorý si chce požičať položky zo skladu. Môže prezerať inventár, rezervovať si položky, požičať si položky a vrátiť ich.
- **Ciele:** Požičať si položky na určitý čas, vrátiť položky včas.
- **Zodpovednosti:** Dodržiavať pravidlá požičiavania, vrátiť položky včas.

### Administrátor
- **Popis:** Dobrovolník z prostredia uzavretého klubu ľudí, ktorý je zodpovedný za správu inventára a používateľov. Môže pridávať, aktualizovať a odstraňovať položky, ako aj spravovať používateľov.
- **Ciele:** Udržiavať inventár aktuálny, zabezpečiť, aby používatelia mali prístup k položkám.
- **Zodpovednosti:** Pridávať nové položky, aktualizovať stav položiek, spravovať používateľov.
- **Vedieť:** Kto si požičal položku, kedy a na koľko času.

--- 

## Use Cases
### rezervácia položiek z inventára
- **Actors:** Používateľ (požičateľ)
- **Description:** Používateľ si môže prezerať inventár a rezervovať si položky v rezervačnom systéme.
- **Preconditions:** Používateľ je prihlásený, položka je dostupná.
- **Postconditions:** Položky sú označené ako požičané, je vytvorená "_rezervácia_".
- **Main Flow:**
  - Používateľ sa prihlási a zvolí si možnosť rezervácie.
  - Používateľ vyhľadáva položky v inventáry a pridáva do "aktuálnej" rezervácie.
  - Používateľ zadá dátum a čas kedy a do kedy chce položky požičať.
  - Používateľ skontroluje či má všetky položky čo potrebuje, a následne potvrdí rezerváciu.
  - Aplikácia označí položky ako požičané a vytvorí rezerváciu.
- Kontrola rezervácie: 
  - Používateľ môže zrušiť rezerváciu kedykoľvek pred začiatkom požičiavania.
  - Používateľ môže zmeniť dátum a čas požičiavania kedykoľvek pred začiatkom požičiavania, ale treba kontrolovať či budú položky dostupné v danom "zmenenom" čase.

### požičanie položiek s rezerváciou
- **Actors:** Používateľ (požičateľ)
- **Description:** Používateľ si môže požičať položky s rezerváciou, ktorú si vytvoril v čase ktorý zadal.
- **Preconditions:** Používateľ je prihlásený, položka je dostupná, rezervácia je vytvorená.
- **Postconditions:** Položky sú označené ako požičané, rezervácia je označená ako "požičaná", je vytvorené "požičanie".

### požičanie položky na mieste
- **Actors:** Používateľ (požičateľ)
- **Description:** Používateľ si môže požičať položku na mieste, bez rezervácie ak je položka dostupná.
- **Preconditions:** Používateľ je prihlásený, položka je dostupná.
- **Postconditions:** Položky sú označené ako požičané, je vytvorené "požičanie" .

---

### vrátenie požičanej položky
- **Actors:** Používateľ (požičateľ)

### správa používateľov
- **Actors:** Administrátor
- **Description:** Administrátor môže pridávať, aktualizovať a odstraňovať používateľov.
- **Preconditions:** Administrátor je prihlásený.
- **Scenarios:**
  - **Vytvorenie**, **Zmena**, **Zmazanie** prístupu pre používateľa
  - **Zobrazenie** zoznamu používateľov
  - Generátor hesiel pre nových používateľov. 
- **main flow -** _aktualizácia_**:**
  - Administrátor sa prihlási a zobrazí dashboard.
  - Administrátor vyhľadá používateľa a aktualizuje jeho údaje.
  - Aplikácia uloží zmeny.
- **main flow -** _zmazanie_**:**
  - Administrátor sa prihlási a zobrazí dashboard.
  - Administrátor vyhľadá používateľa a odstráni ho.
  - Aplikácia odstráni používateľa z databázy.
- **main flow -** _zobrazenie_**:**
  - Administrátor sa prihlási a zobrazí dashboard.
  - Administrátor zobrazí zoznam používateľov.
  - Aplikácia zobrazí zoznam používateľov.
- **main flow -** _vytvorenie_**:**
  - Administrátor sa prihlási a zobrazí dashboard.
  - Administrátor vytvorí nového používateľa.
  - Aplikácia vygeneruje heslo používateľovi.
  - Aplikácia uloží nového používateľa do databázy.
   
### správa inventára
- **Actors:** Administrátor
- **Description:** Administrátor môže pridávať, aktualizovať a odstraňovať položky z inventára.
- **Preconditions:** Administrátor je prihlásený.
- **Scenarios:**
  - **Pridanie**, **Aktualizácia**, **Odstránenie** položky
  - **Zobrazenie** zoznamu položiek
- **main flow -** _pridanie_**:**
  - Administrátor sa prihlási a zobrazí dashboard.
  - Administrátor pridá novú položku.
  - Aplikácia uloží novú položku do databázy.
- **main flow -** _aktualizácia_**:**
  - Administrátor sa prihlási a zobrazí dashboard.
  - Administrátor vyhľadá položku a aktualizuje jej údaje.
  - Aplikácia uloží zmeny.
- **main flow -** _odstránenie_**:**
  - Administrátor sa prihlási a zobrazí dashboard.
  - Administrátor vyhľadá položku a odstráni ju.
  - Aplikácia odstráni položku z databázy.
- **main flow -** _zobrazenie_**:**
  - Administrátor sa prihlási a zobrazí dashboard.
  - Administrátor zobrazí zoznam položiek a ich stav.
  - Aplikácia zobrazí zoznam položiek.






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
