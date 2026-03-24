# Mimari Dokumantasyonu

## Genel Bakis

Survey App, Clean Architecture prensiplerine uygun 4 katmanli bir .NET 9 backend ve React 19 frontend'den olusan full-stack bir uygulamadir.

```
┌─────────────────────────────────────────┐
│            Frontend (React 19)          │
│         Vite + TypeScript + Ant Design  │
└──────────────────┬──────────────────────┘
                   │ HTTP (REST API)
                   │ JWT Cookie Auth
┌──────────────────▼──────────────────────┐
│           API Layer (Controllers)       │
│         ASP.NET Core Web API            │
├─────────────────────────────────────────┤
│        Application Layer (Services)     │
│       DTOs, Validators, Business Logic  │
├─────────────────────────────────────────┤
│       Infrastructure Layer (Data)       │
│     EF Core, Repositories, JWT Service  │
├─────────────────────────────────────────┤
│          Core Layer (Domain)            │
│      Entities, Enums, Interfaces        │
└──────────────────┬──────────────────────┘
                   │
            ┌──────▼──────┐
            │ PostgreSQL  │
            └─────────────┘
```

---

## Backend Katmanlari

### 1. Core Layer (`SurveyApp.Core`)

Projenin kalbi. Hicbir dis bagimliliga sahip degildir.

**Dizin Yapisi:**
```
SurveyApp.Core/
├── Entities/
│   ├── User.cs
│   ├── Survey.cs
│   ├── Question.cs
│   ├── AnswerTemplate.cs
│   ├── AnswerOption.cs
│   ├── SurveyQuestion.cs      (junction table)
│   ├── SurveyAssignment.cs    (junction table)
│   ├── SurveyResponse.cs
│   └── SurveyAnswer.cs
├── Enums/
│   └── UserRole.cs             (Admin = 0, User = 1)
└── Interfaces/
    ├── IUserRepository.cs
    ├── ISurveyRepository.cs
    ├── IQuestionRepository.cs
    ├── IAnswerTemplateRepository.cs
    └── ISurveyResponseRepository.cs
```

**Prensipler:**
- Dependency Inversion: Ust katmanlar interface'lere bagimli, concrete class'lara degil
- Entity'ler sadece veri tasir, is mantigi icermez

---

### 2. Infrastructure Layer (`SurveyApp.Infrastructure`)

Veritabani erisimi ve dis servisler.

**Dizin Yapisi:**
```
SurveyApp.Infrastructure/
├── Data/
│   ├── AppDbContext.cs          (EF Core DbContext)
│   └── DbSeeder.cs             (Seed data)
├── Repositories/
│   ├── UserRepository.cs
│   ├── SurveyRepository.cs
│   ├── QuestionRepository.cs
│   ├── AnswerTemplateRepository.cs
│   └── SurveyResponseRepository.cs
├── Services/
│   └── JwtTokenService.cs
└── Migrations/
```

**Onemli Detaylar:**
- `AppDbContext`: Fluent API ile iliskiler, composite key'ler ve cascade/restrict kurallari tanimlanir
- `JwtTokenService`: 24 saatlik token uretir (Claims: NameIdentifier, Email, Name, Role)
- `DbSeeder`: Ilk calistirmada admin/user hesabi ve ornek sablonlar olusturur

---

### 3. Application Layer (`SurveyApp.Application`)

Is mantigi ve veri donusumleri.

**Dizin Yapisi:**
```
SurveyApp.Application/
├── DTOs/
│   ├── AuthDtos.cs
│   ├── SurveyDtos.cs
│   ├── QuestionDtos.cs
│   ├── AnswerTemplateDtos.cs
│   ├── SurveyResponseDtos.cs
│   └── PagedResult.cs
├── Services/
│   ├── Interfaces/
│   │   ├── IAuthService.cs
│   │   ├── ISurveyService.cs
│   │   ├── IQuestionService.cs
│   │   ├── IAnswerTemplateService.cs
│   │   └── ISurveyResponseService.cs
│   └── Implementations/
│       ├── AuthService.cs
│       ├── SurveyService.cs
│       ├── QuestionService.cs
│       ├── AnswerTemplateService.cs
│       └── SurveyResponseService.cs
└── Validators/
    ├── LoginRequestValidator.cs
    ├── RegisterRequestValidator.cs
    ├── CreateSurveyRequestValidator.cs
    ├── CreateQuestionRequestValidator.cs
    ├── CreateAnswerTemplateRequestValidator.cs
    └── SubmitSurveyRequestValidator.cs
```

**Servis Sorumlulukları:**
- `AuthService`: Login (BCrypt verify), Register (email uniqueness, password hashing)
- `SurveyService`: CRUD + kullaniciya ozel anket listeleme + cevaplama validasyonu
- `SurveyResponseService`: Gonderim kontrolleri (daha once cevaplanmis mi, aktif mi, atanmis mi) + raporlama
- `AnswerTemplateService`: Secenek sayisi kontrolu (2-4)

---

### 4. API Layer (`SurveyApp.API`)

HTTP endpoint'leri ve middleware.

**Dizin Yapisi:**
```
SurveyApp.API/
├── Controllers/
│   ├── AuthController.cs
│   ├── SurveysController.cs
│   ├── QuestionsController.cs
│   ├── AnswerTemplatesController.cs
│   └── UsersController.cs
├── Middleware/
│   └── ExceptionHandlingMiddleware.cs
└── Program.cs
```

**Program.cs Yapilandirma Sirasi:**
1. Serilog logger kurulumu
2. DbContext (PostgreSQL + Npgsql)
3. Repository ve Service DI kayitlari
4. JWT Authentication (HttpOnly cookie)
5. CORS politikasi
6. FluentValidation otomatik kayit
7. Swagger/OpenAPI konfigurasyonu
8. Auto-migration ve seeding

---

## Frontend Mimarisi

```
src/
├── main.tsx                    Uygulama giris noktasi
├── App.tsx                     Routing konfigurasyonu
├── types/index.ts              TypeScript tip tanimlari
├── context/AuthContext.tsx      Auth state yonetimi (useReducer)
├── components/ProtectedRoute.tsx  Rol bazli rota korumasi
├── services/
│   ├── api.ts                  Axios instance + interceptor
│   ├── authService.ts          Auth API cagrilari
│   ├── surveyService.ts        Survey API cagrilari
│   ├── questionService.ts      Question API cagrilari
│   └── answerTemplateService.ts Template API cagrilari
├── layouts/
│   ├── AdminLayout.tsx         Admin sidebar + header
│   └── UserLayout.tsx          User header
└── pages/
    ├── Login.tsx
    ├── admin/
    │   ├── AnswerTemplates.tsx
    │   ├── Questions.tsx
    │   ├── Surveys.tsx
    │   └── Reports.tsx
    └── user/
        ├── MySurveys.tsx
        └── AnswerSurvey.tsx
```

**State Yonetimi:**
- `AuthContext` + `useReducer`: LOGIN, LOGOUT, SET_LOADING action'lari
- Sayfa yuklendiginde `/auth/me` ile oturum kontrolu
- Component bazli state: `useState` ile lokal durum yonetimi

**Routing:**
- `/login` — Public
- `/admin/*` — ProtectedRoute (Admin)
- `/user/*` — ProtectedRoute (User)
- `*` — `/login`'e yonlendirme

---

## Dependency Injection

Tum bagimliliklar `Program.cs`'de Scoped olarak kaydedilir:

```
IUserRepository          → UserRepository
ISurveyRepository        → SurveyRepository
IQuestionRepository      → QuestionRepository
IAnswerTemplateRepository → AnswerTemplateRepository
ISurveyResponseRepository → SurveyResponseRepository
IAuthService             → AuthService
ISurveyService           → SurveyService
IQuestionService         → QuestionService
IAnswerTemplateService   → AnswerTemplateService
ISurveyResponseService   → SurveyResponseService
JwtTokenService          → Singleton
Func<User, string>       → Scoped (token generator delegate)
```

---

## Guvenlik

- **Sifre Hashleme:** BCrypt ile adaptive hashing
- **JWT:** 24 saatlik token, HttpOnly cookie ile iletim
- **CORS:** Sadece izin verilen origin'ler (localhost:5173, localhost:3000)
- **Yetkilendirme:** `[Authorize(Roles = "Admin|User")]` attribute'leri
- **DTO Pattern:** Entity'ler dogrudan disari acilmaz
- **Global Exception Handling:** Hassas hata detaylari gizlenir

---

## Loglama

Serilog ile yapilandirilmis:
- **Console:** Kisa format, renkli cikti
- **File:** `logs/surveyapp-{date}.log`, gunluk dosya rotasyonu
- **HTTP Logging:** Her istek/yanit otomatik loglanir
- **Log Seviyeleri:** EF Core ve Microsoft loglari Warning'e filtrelenmis
