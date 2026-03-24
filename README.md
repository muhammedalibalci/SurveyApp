# Survey App

Kullanicilarin anket olusturmasina, yonetmesine ve cevaplamasina olanak taniyan full-stack web uygulamasi.

**Admin** tum anket surecini yonetir; **User** kendisine atanan anketleri doldurur.

---

## Teknoloji Stack

| Katman | Teknoloji |
|--------|-----------|
| Backend | .NET 9, ASP.NET Core Web API, Entity Framework Core 9 |
| Frontend | React 19, TypeScript, Ant Design 6, Vite |
| Veritabani | PostgreSQL 17 |
| Kimlik Dogrulama | JWT (HttpOnly Cookie), BCrypt |
| Loglama | Serilog (Console + File) |
| Validasyon | FluentValidation |
| API Dokumantasyonu | Swagger / OpenAPI |
| Containerization | Docker, Docker Compose |
| Test | xUnit, Moq, FluentAssertions, Vitest, React Testing Library |

---

## Hizli Baslangic

### Docker Compose (Onerilen)

```bash
cd src
docker-compose up --build
```

| Servis | URL |
|--------|-----|
| Frontend | http://localhost:3000 |
| Backend API | http://localhost:5021 |
| Swagger UI | http://localhost:5021/swagger |
| PostgreSQL | localhost:5432 |

### Manuel Kurulum

```bash
# Backend
cd src/backend/src/SurveyApp.API
dotnet restore && dotnet run

# Frontend
cd src/frontend/survey-app
npm install && npm run dev
```

### Hazir Kullanicilar

| Rol | Email | Sifre |
|-----|-------|-------|
| Admin | admin@survey.com | Admin123! |
| User | user@survey.com | User123! |

---

## Proje Yapisi

```
SurveyApp/
├── src/
│   ├── backend/
│   │   └── src/
│   │       ├── SurveyApp.Core/            Domain (Entity, Enum, Interface)
│   │       ├── SurveyApp.Application/     Is mantigi (Service, DTO, Validator)
│   │       ├── SurveyApp.Infrastructure/  Veri erisimi (EF Core, Repository, JWT)
│   │       └── SurveyApp.API/             Controller, Middleware
│   ├── frontend/
│   │   └── survey-app/                    React + TypeScript + Ant Design
│   └── docker-compose.yml
├── tests/
│   ├── backend/SurveyApp.Tests/           84 unit test (xUnit + Moq)
│   └── frontend/SurveyApp.Tests/          44 unit test (Vitest + RTL)
└── doc/
    ├── API.md                             Endpoint dokumantasyonu
    ├── ARCHITECTURE.md                    Mimari detaylar
    ├── DATABASE.md                        ER diyagrami ve tablo yapilari
    ├── TESTING.md                         Test stratejisi ve kapsam
    └── SETUP.md                           Kurulum ve sorun giderme
```

---

## Mimari

Backend, **Clean Architecture** prensiplerine uygun 4 katmanli yapidadir:

```
API → Application → Infrastructure → Core
```

- **Core**: Entity ve interface tanimlari. Hicbir dis bagimlilik yok.
- **Application**: Servisler, DTO'lar, FluentValidation kurallari.
- **Infrastructure**: EF Core DbContext, repository implementasyonlari, JWT servisi.
- **API**: Controller'lar, global exception middleware, DI konfigurasyonu.

Frontend **React 19 + TypeScript** ile yazilmis olup Ant Design component kutuphanesini kullanir. State yonetimi Context API + useReducer ile saglanir.

---

## Ozellikler

### Admin
- Cevap sablonu yonetimi (2-4 secenekli)
- Soru yonetimi (sablona bagli)
- Anket CRUD (soru secimi, kullanici atama, tarih araligi)
- Detayli raporlama (pie chart, bar chart, soru bazli analiz, katilimci listesi)

### User
- Atanmis anketleri goruntulemе
- Anket doldurma (radio button, ilerleme gostergesi)
- Tamamlanma durumu takibi

### Guvenlik
- JWT token HttpOnly cookie ile iletilir
- BCrypt ile sifre hashleme
- Rol bazli yetkilendirme (`[Authorize(Roles = "Admin|User")]`)
- DTO pattern ile entity gizleme
- Global exception handling

---

## Testler

```bash
# Backend (84 test)
cd tests/backend/SurveyApp.Tests && dotnet test

# Frontend (44 test)
cd tests/frontend/SurveyApp.Tests && npx vitest run
```

**Toplam 128 test** — servis katmani, validasyon kurallari, component render, routing ve auth context kapsami.

---

## API Ozeti

| Metot | Endpoint | Yetki | Aciklama |
|-------|----------|-------|----------|
| POST | /api/auth/login | Public | Giris |
| POST | /api/auth/register | Public | Kayit |
| GET | /api/answertemplates | Admin | Sablonlari listele |
| POST | /api/answertemplates | Admin | Sablon olustur |
| GET | /api/questions | Admin | Sorulari listele |
| POST | /api/questions | Admin | Soru olustur |
| GET | /api/surveys | Admin | Anketleri listele |
| POST | /api/surveys | Admin | Anket olustur |
| GET | /api/surveys/{id}/report | Admin | Rapor goruntule |
| GET | /api/surveys/my | User | Atanmis anketlerim |
| POST | /api/surveys/submit | User | Anket gonder |
| GET | /api/users | Admin | Kullanicilari listele |

Tam endpoint listesi icin: [doc/API.md](doc/API.md)

---

## Dokumantasyon

| Dokuman | Icerik |
|---------|--------|
| [API.md](doc/API.md) | Tum endpoint'ler, request/response ornekleri |
| [ARCHITECTURE.md](doc/ARCHITECTURE.md) | Katman yapisi, DI, guvenlik, loglama |
| [DATABASE.md](doc/DATABASE.md) | ER diyagrami, tablolar, iliskiler, seed data |
| [TESTING.md](doc/TESTING.md) | Test kategorileri, calistirma komutlari |
| [SETUP.md](doc/SETUP.md) | Kurulum yontemleri, sorun giderme |
