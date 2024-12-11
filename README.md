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

# Use Cases

### prihlásenie
- **Actors:** Používateľ, Administrátor
- **Description:** Užívateľ sa prihlási do aplikácie údajmi, ktoré mu administrátor vygenroval - môže sa prihlásiť ako _**Používateľ (požičateľ)**_ alebo _**administrátor**_.
- **Preconditions:** Používateľ má vygenerovaý účet.
- **Postconditions:** Používateľ je prihlásený a môže používať aplikáciu.
- **Main Flow:**
  - Používateľ otvorí aplikáciu a zvolí možnosť prihlásenia.
  - Používateľ zadá svoje prihlasovacie údaje.
  - Aplikácia overí údaje a prihlási používateľa.

---

### rezervácia položiek z inventára
- **Actors:** Používateľ (požičateľ)
- **Description:** Používateľ si môže prezerať inventár a rezervovať si položky v rezervačnom systéme.
- **Preconditions:** Používateľ je prihlásený, položka je `available` v čase rezervácie.
- **Postconditions:** Položky sú označené ako `reserved` - v dátume ktorý používateľ zadal, je vytvorená `Reservation`.
- **Main Flow:**
  - Používateľ sa prihlási a zvolí si možnosť rezervácie.
  - Používateľ vyhľadáva položky v inventáry a pridáva do "aktuálnej" rezervácie.
  - Používateľ zadá dátum a čas kedy a do kedy chce položky požičať.
  - Používateľ skontroluje či má všetky položky čo potrebuje, a následne potvrdí rezerváciu.
  - Aplikácia označí položky ako `reserved` a vytvorí `Reservation`.

> [!CAUTION]
>  - Kontrola rezervácie:
>   - Používateľ môže zmeniť dátum a čas požičiavania kedykoľvek pred začiatkom požičiavania, ale treba kontrolovať či budú položky dostupné v danom "zmenenom" čase.
>   - Všeobecne kontrola či je položka `available` v čase ktorý používateľ zadal.


### požičanie položiek s rezerváciou
- **Actors:** Používateľ _(požičateľ)_
- **Description:** Používateľ si môže požičať položky s rezerváciou, ktorú si vytvoril v čase ktorý zadal.
- **Preconditions:** Používateľ je prihlásený, položka je `available`, `Reservation` je vytvorená.
- **Postconditions:** Položky sú označené ako `lent`, rezervácia je archivovaná, je vytvorené `Loan`.

### požičanie položky na mieste (fast loan)
- **Actors:** Používateľ _(požičateľ)_
- **Description:** Používateľ si môže požičať položku na mieste, bez rezervácie ak je položka dostupná, použivateľ zadá aj dátum do kedy si položky požičiava, lebo môže byť vytvorená `Reservation`.
- **Preconditions:** Používateľ je prihlásený, položka je `available`.
- **Postconditions:** Položky sú označené ako `lent`, je vytvorené `Loan` .

---

### vrátenie požičanej položky
- **Actors:** Používateľ _(požičateľ)_
- **Description:** Používateľ vráti požičané položky (očakávanie že sa vráti aj fyzicky).
- **Preconditions:** Používateľ je prihlásený, položka je `lent`.
- **Postconditions:** Položky sú označené ako `available`, je vytvorené `Return`.

> [!NOTE]
> Ak používateľ položky nevráti včas, administrátor to bude vidieť v dashboarde a v tejto fáze bude na ňom ako sa zachvá. (iplementovať notifikácie v budúcnosti)

### zrušenie rezervácie
- **Actors:** Používateľ _(požičateľ)_
- **Description:** Používateľ zruší rezerváciu položiek pred požičaním.
- **Preconditions:** Používateľ je prihlásený, položka je `reserved`, je vytvorená `Reservation`.
- **Postconditions:** Položky sú označené ako `available`, `Reservation` je zrušená.
---

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

#### **navigačné menu**
- **Účel:** Umožniť používateľom navigovať medzi hlavnými časťami aplikácie.
- **Obsah:**
  - Reservations
  - Loans
  - Fast Loans
  - Home
- nachádza sa vždy na dolnej časti aplikácie (mobil)

---

### 1. **Prihlasovacia Stránka Login**
- **Účel:** Overenie používateľa a umožnenie prístupu k aplikácii.
- **Obsah: **
  - Prihlasovací formulár (email, heslo).
  - Odkaz na administrátora pri zabudnutom hesle.
- **API Endpoints:**
  - doplniť pri implementácii backendu

---

### 2. **Dashboard**
- **Účel:** Zobrazenie hlavného prehľadu kategórií.
- **Obsah:**
  - Zoznam Kategórií. .
- **API Endpoints:**
  - doplniť pri implementácii backendu

---

### 3. **Detail Kategórie**
- **Účel:** Zobraziť položky z konkrétnej kategórie a umožniť ďalšie akcie.
- **Obsah:**
  - Názov položky.
  - Stav položky. - forma odtieňa farby položky
  - detaily položky. - forma tlačidla
- **API Endpoints:**
  - doplniť pri implementácii backendu

---

### 4. **Reservations**
- **Účel:** **Vytvárať**, pri vytvorení => not submitted, **Dokončiť**, pri dokončení z not submitted => submitted, **Zobraziť** rezervácie _**submitted** - už vytvorená rezervácia/**not submitted** - ešte nevytvorená, používateľ ju napĺňa_.
- **Obsah:**
  - Zoznam rezervácií.
  - Formulár na vytvorenie novej rezervácie.
- **API Endpoints:**
    - doplniť pri implementácii backendu

---

### 5. **Loans**
- **Účel:** Zobraziť aktuálne požičané položky a históriu požičaných a možnosť `copy to reservation` - do rezervácie sa pridajú položky ktoré už si raz používateľ požičal, možnosť vrátenia položiek.
- **Obsah:**
  - Zoznam požičaných položiek.
  - Zoznam historických požičaní.
  - Možnosť vrátenia položiek.
- **API Endpoints:**
  - doplniť pri implementácii backendu

---

### 6. **Fast Loans**
- **Účel:** Umožniť používateľom požičať si položky na mieste bez rezervácie.
- **Obsah:**
  - Zoznam položiek.
  - Formulár na požičanie položiek.
- **API Endpoints:**
  - doplniť pri implementácii backendu

---

### 7. **Sekcia Pre Administrátora**
- **Účel:** Poskytnúť administrátorom nástroje na správu inventára a používateľov.
- **Obsah:**
  - Formulár na pridávanie nových položiek.
  - Zoznam položiek s možnosťou editácie.
  - Zoznam používateľov s možnosťou editácie.
- **API Endpoints:**
  - doplniť pri implementácii backendu

---

## Technická Architektúra

### Frontend
- **Framework:** React + Next.js
- **Deployment:** Vercel
- **Docker:** Áno, cez `Dockerfile` a `docker-compose.yml`

### Backend
- **API Routes:** PHP server
- **Databáza:** PostgreSQL

### Prostredie
- **Env Variables:**
  - `POSTGRES_URL`
  - `POSTGRES_USER`
  - `POSTGRES_PASSWORD`
---
## Budúce Rozšírenia
- Notifikácie používateľom o termínoch vrátenia položiek.
- Pokročilé štatistiky využitia inventára.
- Grafické zobrazenie inventára (regálov).
- Integrácia s QR kódmi (voliteľné).
