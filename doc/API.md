# API Dokumantasyonu

Survey App RESTful API dokumantasyonu. Tum endpoint'ler `/api` prefix'i altindadir.

**Base URL:** `http://localhost:5021/api`

**Kimlik Dogrulama:** JWT Bearer token, HttpOnly cookie (`access_token`) uzerinden iletilir.

---

## Kimlik Dogrulama (Auth)

### POST /auth/login
Kullanici girisi yapar ve JWT token icerikli cookie set eder.

**Yetki:** Herkese acik

**Request Body:**
```json
{
  "email": "admin@survey.com",
  "password": "Admin123!"
}
```

**Response (200):**
```json
{
  "token": "eyJhbGciOi...",
  "user": {
    "id": 1,
    "email": "admin@survey.com",
    "fullName": "Admin User",
    "role": "Admin"
  }
}
```

**Hatalar:**
- `401` — Gecersiz email veya sifre

---

### POST /auth/register
Yeni kullanici kaydeder (varsayilan rol: User).

**Yetki:** Herkese acik

**Request Body:**
```json
{
  "email": "yeni@kullanici.com",
  "password": "Sifre123",
  "fullName": "Yeni Kullanici"
}
```

**Response (200):** Login ile ayni formatta AuthResponse doner.

**Hatalar:**
- `400` — Validasyon hatasi (email formati, sifre uzunlugu vs.)
- `400` — Email zaten kayitli

---

### POST /auth/logout
Oturumu kapatir, access_token cookie'sini siler.

**Yetki:** Herkese acik

**Response:** `200 OK`

---

### GET /auth/me
Cookie'deki token gecerliyse kullanici bilgisini doner.

**Yetki:** Giris yapmis kullanici

**Response (200):**
```json
{
  "id": 1,
  "email": "admin@survey.com",
  "fullName": "Admin User",
  "role": "Admin"
}
```

**Hatalar:**
- `401` — Token gecersiz veya suresi dolmus

---

## Cevap Sablonlari (Answer Templates)

### GET /answertemplates
Tum cevap sablonlarini listeler.

**Yetki:** Admin

**Response (200):**
```json
[
  {
    "id": 1,
    "name": "Evet/Hayir",
    "createdAt": "2024-01-01T00:00:00Z",
    "options": [
      { "id": 1, "text": "Evet", "order": 1 },
      { "id": 2, "text": "Hayir", "order": 2 }
    ]
  }
]
```

---

### GET /answertemplates/{id}
Belirtilen ID'ye sahip sablonu doner.

**Yetki:** Admin

**Hatalar:**
- `404` — Sablon bulunamadi

---

### POST /answertemplates
Yeni cevap sablonu olusturur.

**Yetki:** Admin

**Request Body:**
```json
{
  "name": "Memnuniyet Duzeyi",
  "options": [
    { "text": "Cok Memnun", "order": 1 },
    { "text": "Memnun", "order": 2 },
    { "text": "Memnun Degil", "order": 3 }
  ]
}
```

**Validasyon Kurallari:**
- `name`: Zorunlu, max 200 karakter
- `options`: 2 ile 4 arasinda secenek olmali
- Her secenegin `text` alani zorunlu, max 500 karakter

---

### PUT /answertemplates/{id}
Mevcut sablonu gunceller.

**Yetki:** Admin

**Request Body:** POST ile ayni format

---

### DELETE /answertemplates/{id}
Sablonu siler.

**Yetki:** Admin

**Hatalar:**
- `400` — Sablona bagli soru varsa silinemez (Restrict)

---

## Sorular (Questions)

### GET /questions
Tum sorulari listeler (cevap sablonu bilgisi dahil).

**Yetki:** Admin

**Response (200):**
```json
[
  {
    "id": 1,
    "text": "Hizmetten memnun musunuz?",
    "answerTemplateId": 2,
    "answerTemplateName": "Memnuniyet Duzeyi",
    "options": [
      { "id": 1, "text": "Cok Memnun", "order": 1 },
      { "id": 2, "text": "Memnun", "order": 2 }
    ],
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### GET /questions/{id}
Belirtilen soruyu doner.

**Yetki:** Admin

---

### POST /questions
Yeni soru olusturur.

**Yetki:** Admin

**Request Body:**
```json
{
  "text": "Hizmetten memnun musunuz?",
  "answerTemplateId": 2
}
```

**Validasyon Kurallari:**
- `text`: Zorunlu, max 1000 karakter
- `answerTemplateId`: 0'dan buyuk olmali

---

### PUT /questions/{id}
Soruyu gunceller.

**Yetki:** Admin

---

### DELETE /questions/{id}
Soruyu siler.

**Yetki:** Admin

---

## Anketler (Surveys)

### GET /surveys
Tum anketleri listeler (ozet bilgi).

**Yetki:** Admin

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Musteri Memnuniyeti",
    "description": "2024 Q1 anketi",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-03-31T00:00:00Z",
    "isActive": true,
    "questionCount": 5,
    "assignedUserCount": 10,
    "responseCount": 7,
    "createdAt": "2024-01-01T00:00:00Z"
  }
]
```

---

### GET /surveys/paged?Page=1&PageSize=10&Search=memnuniyet
Sayfalanmis anket listesi.

**Yetki:** Admin

**Query Parametreleri:**
- `Page` (default: 1)
- `PageSize` (default: 10, max: 50)
- `Search` (opsiyonel, basliga gore arama)

**Response (200):**
```json
{
  "items": [...],
  "totalCount": 25,
  "page": 1,
  "pageSize": 10,
  "totalPages": 3,
  "hasPrevious": false,
  "hasNext": true
}
```

---

### GET /surveys/{id}
Anket detayini doner (sorular ve atanmis kullanicilar dahil).

**Yetki:** Admin

---

### POST /surveys
Yeni anket olusturur.

**Yetki:** Admin

**Request Body:**
```json
{
  "title": "Musteri Memnuniyeti Anketi",
  "description": "2024 Q1 degerlendirmesi",
  "startDate": "2024-01-01T00:00:00Z",
  "endDate": "2024-03-31T00:00:00Z",
  "isActive": true,
  "questions": [
    { "questionId": 1, "order": 1 },
    { "questionId": 3, "order": 2 }
  ],
  "assignedUserIds": [2, 3, 5]
}
```

**Validasyon Kurallari:**
- `title`: Zorunlu, max 300 karakter
- `description`: Max 2000 karakter
- `endDate`: `startDate`'ten sonra olmali
- `questions`: En az 1 soru secilmeli
- Her sorunun `questionId` degeri 0'dan buyuk olmali

---

### PUT /surveys/{id}
Anketi gunceller.

**Yetki:** Admin

---

### DELETE /surveys/{id}
Anketi siler (cascade: sorular, atamalar, cevaplar da silinir).

**Yetki:** Admin

---

### GET /surveys/{id}/report
Anket raporunu doner.

**Yetki:** Admin

**Response (200):**
```json
{
  "surveyId": 1,
  "surveyTitle": "Musteri Memnuniyeti",
  "totalAssigned": 10,
  "totalCompleted": 7,
  "completedResponses": [
    {
      "responseId": 1,
      "user": { "id": 2, "email": "user@test.com", "fullName": "Test User", "role": "User" },
      "submittedAt": "2024-02-15T14:30:00Z",
      "answers": [
        {
          "questionId": 1,
          "questionText": "Hizmetten memnun musunuz?",
          "selectedOptionText": "Cok Memnun",
          "selectedOptionId": 1
        }
      ]
    }
  ],
  "pendingUsers": [
    { "id": 5, "email": "bekleyen@test.com", "fullName": "Bekleyen User", "role": "User" }
  ]
}
```

---

### GET /surveys/my
Giris yapmis kullaniciya atanmis aktif anketleri listeler.

**Yetki:** User

**Response (200):**
```json
[
  {
    "id": 1,
    "title": "Musteri Memnuniyeti",
    "description": "Anketi doldurun",
    "startDate": "2024-01-01T00:00:00Z",
    "endDate": "2024-03-31T00:00:00Z",
    "questionCount": 5,
    "isCompleted": false
  }
]
```

---

### GET /surveys/{id}/answer
Anketi cevaplama icin getirir (sorular ve secenekler dahil).

**Yetki:** User

**Kontroller:**
- Anket aktif olmali
- Tarih araliginda olmali
- Kullanici ankete atanmis olmali

---

### POST /surveys/submit
Anket cevaplarini gonderir.

**Yetki:** User

**Request Body:**
```json
{
  "surveyId": 1,
  "answers": [
    { "questionId": 1, "selectedOptionId": 3 },
    { "questionId": 2, "selectedOptionId": 7 }
  ]
}
```

**Kontroller:**
- Kullanici daha once bu anketi doldurmamis olmali
- Anket aktif ve tarih araliginda olmali
- Kullanici ankete atanmis olmali

**Hatalar:**
- `400` — Anket bulunamadi
- `400` — Anket aktif degil veya tarih disinda
- `400` — Daha once doldurulmus
- `401` — Kullanici ankete atanmamis

---

## Kullanicilar (Users)

### GET /users
Tum kullanicilari listeler.

**Yetki:** Admin

**Response (200):**
```json
[
  {
    "id": 1,
    "email": "admin@survey.com",
    "fullName": "Admin User",
    "role": "Admin"
  }
]
```

---

## Hata Formati

Tum hatalar asagidaki formatta doner:

```json
{
  "status": 400,
  "message": "Hata aciklamasi"
}
```

**HTTP Durum Kodlari:**
| Kod | Anlam |
|-----|-------|
| 200 | Basarili |
| 400 | Gecersiz istek / Validasyon hatasi |
| 401 | Yetkisiz erisim |
| 404 | Kayit bulunamadi |
| 500 | Sunucu hatasi |

---

## Swagger

Development modunda Swagger UI aktiftir:

**URL:** `http://localhost:5021/swagger`

JWT token ile test icin Swagger UI'daki "Authorize" butonunu kullanabilirsiniz.
