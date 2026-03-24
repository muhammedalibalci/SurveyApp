# Kurulum ve Calistirma Kilavuzu

## On Kosullar

| Arac | Minimum Versiyon | Aciklama |
|------|-----------------|----------|
| .NET SDK | 9.0 | Backend icin |
| Node.js | 18+ | Frontend icin |
| PostgreSQL | 17 | Veritabani |
| Docker & Docker Compose | - | Opsiyonel (tek komutla kurulum) |

---

## Yontem 1: Docker Compose (Onerilen)

Tek komutla tum sistemi ayaga kaldirir.

```bash
cd SurveyApp
docker-compose up --build
```

**Servisler:**
| Servis | URL | Aciklama |
|--------|-----|----------|
| Frontend | http://localhost:3000 | React uygulamasi (nginx) |
| Backend API | http://localhost:5021 | .NET Web API |
| PostgreSQL | localhost:5432 | Veritabani |
| Swagger UI | http://localhost:5021/swagger | API dokumantasyonu |

**Durdurmak icin:**
```bash
docker-compose down

# Veritabani verilerini de silmek icin:
docker-compose down -v
```

---

## Yontem 2: Manuel Kurulum

### 1. PostgreSQL Kurulumu

**macOS:**
```bash
brew install postgresql@17
brew services start postgresql@17
createdb SurveyAppDb
```

**Ubuntu/Debian:**
```bash
sudo apt install postgresql-17
sudo systemctl start postgresql
sudo -u postgres createdb SurveyAppDb
```

**Windows:**
PostgreSQL resmi sitesinden installer indirip kurun, pgAdmin ile `SurveyAppDb` veritabani olusturun.

### 2. Backend Kurulumu

```bash
cd src/backend/src/SurveyApp.API

# Bagimliliklari yukle ve calistir
dotnet restore
dotnet run
```

API `http://localhost:5021` uzerinde calisir.

**Konfigürasyon (`appsettings.json`):**
```json
{
  "ConnectionStrings": {
    "DefaultConnection": "Host=localhost;Port=5432;Database=SurveyAppDb;Username=postgres;Password=postgres"
  },
  "Jwt": {
    "Key": "SurveyAppSecretKey2024VeryLongKeyForSecurity!@#$%",
    "Issuer": "SurveyApp",
    "Audience": "SurveyAppUsers"
  }
}
```

### 3. Frontend Kurulumu

```bash
cd src/frontend/survey-app

# Bagimliliklari yukle
npm install

# Gelistirme sunucusunu baslat
npm run dev
```

Frontend `http://localhost:5173` uzerinde calisir.

**Ortam Degiskenleri (`.env`):**
```
VITE_API_URL=http://localhost:5021/api
```

---

## Hazir Kullanicilar

Uygulama ilk calistiginda otomatik olusturulur:

| Rol | Email | Sifre |
|-----|-------|-------|
| Admin | admin@survey.com | Admin123! |
| User | user@survey.com | User123! |

---

## Testleri Calistirma

### Backend Testleri
```bash
cd tests/backend/SurveyApp.Tests
dotnet test
```

### Frontend Testleri
```bash
cd tests/frontend/SurveyApp.Tests
npx vitest run
```

### Tum Testler
```bash
# Root dizinden
cd tests/backend/SurveyApp.Tests && dotnet test && cd ../../frontend/SurveyApp.Tests && npx vitest run
```

---

## Proje Dizin Yapisi

```
SurveyApp/
├── doc/                              Dokumantasyon
│   ├── API.md
│   ├── ARCHITECTURE.md
│   ├── DATABASE.md
│   ├── TESTING.md
│   └── SETUP.md
├── src/
│   ├── backend/                      .NET Backend
│   │   ├── SurveyApp.sln
│   │   └── src/
│   │       ├── SurveyApp.Core/       Domain katmani
│   │       ├── SurveyApp.Application/ Is mantigi katmani
│   │       ├── SurveyApp.Infrastructure/ Veri erisim katmani
│   │       └── SurveyApp.API/        API katmani
│   └── frontend/                     React Frontend
│       └── survey-app/
│           └── src/
├── tests/
│   ├── backend/                      .NET Unit Testleri
│   │   └── SurveyApp.Tests/
│   └── frontend/                     React Unit Testleri
│       └── SurveyApp.Tests/
├── docker-compose.yml
└── PROJE_DOKUMANI.md
```

---

## Sorun Giderme

### PostgreSQL baglanti hatasi
```
Npgsql.NpgsqlException: Failed to connect
```
- PostgreSQL servisinin calistigini kontrol edin: `brew services list` veya `systemctl status postgresql`
- `SurveyAppDb` veritabaninin mevcut oldugunu kontrol edin: `psql -l`
- Connection string'deki kullanici adi ve sifreyi kontrol edin

### Port cakismasi
- Backend (5021) veya Frontend (5173/3000) portlari kullanimdaysa, calistirma komutu hata verir
- `lsof -i :5021` ile portu kullanan sureci bulun

### Migration hatasi
```bash
cd src/backend/src/SurveyApp.Infrastructure
dotnet ef database update -s ../SurveyApp.API
```

### Frontend API baglanti hatasi
- Backend'in calistigini kontrol edin
- CORS konfigurasyonunda frontend URL'inin bulundugundan emin olun
- `.env` dosyasindaki `VITE_API_URL` degerini kontrol edin
