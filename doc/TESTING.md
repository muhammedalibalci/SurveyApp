# Test Dokumantasyonu

## Genel Bakis

Proje hem backend hem frontend icin kapsamli unit testlere sahiptir.

| Katman | Framework | Test Sayisi | Konum |
|--------|-----------|-------------|-------|
| Backend | xUnit + Moq + FluentAssertions | 84 | `tests/backend/SurveyApp.Tests/` |
| Frontend | Vitest + React Testing Library | 44 | `tests/frontend/SurveyApp.Tests/` |
| **Toplam** | | **128** | |

---

## Backend Testleri

### Teknoloji Stack
- **xUnit** — Test framework
- **Moq** — Repository mocking
- **FluentAssertions** — Okunabilir assertion'lar
- **.NET 9**

### Dizin Yapisi
```
tests/backend/SurveyApp.Tests/
├── SurveyApp.Tests.csproj
├── Services/
│   ├── AuthServiceTests.cs              (6 test)
│   ├── SurveyServiceTests.cs            (12 test)
│   ├── AnswerTemplateServiceTests.cs    (10 test)
│   ├── QuestionServiceTests.cs          (7 test)
│   └── SurveyResponseServiceTests.cs   (8 test)
└── Validators/
    ├── LoginRequestValidatorTests.cs              (4 test)
    ├── RegisterRequestValidatorTests.cs           (7 test)
    ├── CreateSurveyRequestValidatorTests.cs       (7 test)
    ├── CreateAnswerTemplateRequestValidatorTests.cs (8 test)
    ├── CreateQuestionRequestValidatorTests.cs     (5 test)
    └── SubmitSurveyRequestValidatorTests.cs       (5 test)
```

### Calistirma
```bash
cd tests/backend/SurveyApp.Tests
dotnet test
```

### Test Kategorileri

#### Service Testleri
Repository'ler Moq ile mock'lanarak is mantigi test edilir.

**AuthService:**
- Basarili giris — dogru token ve kullanici bilgisi donmesi
- Gecersiz email — UnauthorizedAccessException
- Yanlis sifre — UnauthorizedAccessException
- Basarili kayit — User rolu ile olusturma
- Mevcut email — InvalidOperationException
- Sifre hashleme — BCrypt ile hash kontrolu

**SurveyService:**
- Tum anketleri listeleme ve mapping
- Sayfalanmis sorgu
- ID ile anket getirme (mevcut/mevcut degil)
- Anket olusturma ve guncelleme
- Kullaniciya ozel anket listesi
- Cevaplama kontrolu (aktif, atanmis, tarih araligi, suresi dolmus, baslamami)

**SurveyResponseService:**
- Basarili anket gonderimi
- Daha once cevaplanmis anket kontrolu
- Anket bulunamadi senaryosu
- Aktif olmayan anket kontrolu
- Suresi dolmus anket kontrolu
- Atanmamis kullanici kontrolu
- Rapor olusturma (tamamlayan/bekleyen ayrimi)

#### Validator Testleri
FluentValidation'in `TestValidate` metodu ile validasyon kurallari test edilir.

- Bos alan kontrolleri
- Uzunluk limitleri (max karakter)
- Email format kontrolu
- Sifre minimum uzunluk
- Tarih karsilastirmalari (bitis > baslangic)
- Secenek sayisi sinirlamalari (2-4)
- Numerik alan kontrolleri (> 0)

---

## Frontend Testleri

### Teknoloji Stack
- **Vitest** — Test framework (Vite ile entegre)
- **React Testing Library** — Component test
- **@testing-library/user-event** — Kullanici etkilesim simulasyonu
- **jsdom** — Browser ortami simulasyonu

### Dizin Yapisi
```
tests/frontend/SurveyApp.Tests/
├── vitest.config.ts
├── setup.ts
├── services/
│   ├── authService.test.ts              (6 test)
│   ├── surveyService.test.ts            (10 test)
│   ├── questionService.test.ts          (5 test)
│   └── answerTemplateService.test.ts    (5 test)
├── context/
│   └── AuthContext.test.tsx             (6 test)
├── components/
│   └── ProtectedRoute.test.tsx          (5 test)
└── pages/
    └── Login.test.tsx                   (6 test)
```

### Calistirma
```bash
cd tests/frontend/SurveyApp.Tests
npx vitest run
```

### Test Kategorileri

#### Service Testleri
Axios (`api`) mock'lanarak her servisin dogru endpoint'e dogru parametrelerle istek attigi dogrulanir.

**authService:** login, register, logout, me — dogru HTTP metodu ve URL
**surveyService:** getAll, getById, create, update, delete, getReport, getMySurveys, getSurveyForAnswering, submit, getUsers
**questionService:** getAll, getById, create, update, delete
**answerTemplateService:** getAll, getById, create, update, delete

#### AuthContext Testleri
- Ilk yuklemede loading durumu ve me() cagirisi
- Basarili oturum kontrolu — authenticated state
- Basarisiz oturum — unauthenticated state
- Login action — kullanici bilgisi guncelleme
- Logout action — state temizleme
- Logout hatasi — yine de state temizleme
- Provider disinda kullanim — hata firlatma

#### ProtectedRoute Testleri
- Loading durumunda spinner gosterme
- Yetkili erisimde children render etme
- Rol eslesmesinde children render etme
- Yetkisiz erisimde /login'e yonlendirme
- Rol uyumsuzlugunda /login'e yonlendirme

#### Login Sayfasi Testleri
- Form alanlari ve buton render kontrolu
- Uygulama basligi gosterme
- Demo kimlik bilgileri gosterme
- Admin girisi — /admin/templates'e yonlendirme
- User girisi — /user/surveys'e yonlendirme
- Basarisiz giris senaryosu

---

## Test Yazim Prensipleri

1. **Arrange-Act-Assert** kalibina uyulur
2. Her test tek bir davranisi test eder
3. Mock'lar `beforeEach`'te temizlenir
4. Test isimleri davranisi acikca belirtir
5. Hata senaryolari mutlaka kapsanir
6. Boundary value'lar test edilir (min/max uzunluk, sinir degerleri)
