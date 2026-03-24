# Veritabani Dokumantasyonu

## Genel Bilgiler

- **Veritabani:** PostgreSQL 17
- **ORM:** Entity Framework Core 9
- **Yaklasim:** Code-First (Migration)
- **Provider:** Npgsql

---

## Entity-Relationship Diyagrami

```
┌──────────┐     ┌──────────────────┐     ┌──────────┐
│   User   │────<│ SurveyAssignment │>────│  Survey   │
│          │     └──────────────────┘     │          │
│ id       │                              │ id       │
│ email    │     ┌──────────────────┐     │ title    │
│ password │────<│ SurveyResponse   │>────│ desc     │
│ fullName │     │                  │     │ start    │
│ role     │     │ id               │     │ end      │
└──────────┘     │ submittedAt      │     │ isActive │
                 └────────┬─────────┘     └────┬─────┘
                          │                    │
                 ┌────────▼─────────┐   ┌──────▼───────────┐
                 │  SurveyAnswer    │   │  SurveyQuestion   │
                 │                  │   │                   │
                 │ questionId    ───│───│── questionId      │
                 │ selectedOptId   │   │   order            │
                 └────────┬────────┘   └──────┬────────────┘
                          │                   │
                 ┌────────▼────────┐   ┌──────▼────────────┐
                 │  AnswerOption   │   │    Question        │
                 │                 │   │                    │
                 │ id              │   │ id                 │
                 │ text            │   │ text               │
                 │ order           │   │ answerTemplateId───│──┐
                 │ templateId   ───│───│                    │  │
                 └────────┬────────┘   └────────────────────┘  │
                          │                                     │
                 ┌────────▼────────────────────────────────────▼┐
                 │              AnswerTemplate                   │
                 │                                               │
                 │ id                                            │
                 │ name                                          │
                 │ createdAt                                     │
                 └───────────────────────────────────────────────┘
```

---

## Tablolar

### Users
| Kolon | Tip | Kisitlama |
|-------|-----|-----------|
| Id | int | PK, Auto Increment |
| Email | string | Unique, Not Null |
| PasswordHash | string | Not Null |
| FullName | string | Not Null |
| Role | int (enum) | Not Null (0=Admin, 1=User) |
| CreatedAt | datetime | Default: UTC Now |

---

### Surveys
| Kolon | Tip | Kisitlama |
|-------|-----|-----------|
| Id | int | PK, Auto Increment |
| Title | string | Not Null |
| Description | string | Not Null |
| StartDate | datetime | Not Null |
| EndDate | datetime | Not Null |
| IsActive | bool | Default: true |
| CreatedAt | datetime | Default: UTC Now |

---

### Questions
| Kolon | Tip | Kisitlama |
|-------|-----|-----------|
| Id | int | PK, Auto Increment |
| Text | string | Not Null |
| AnswerTemplateId | int | FK → AnswerTemplates (Restrict) |
| CreatedAt | datetime | Default: UTC Now |

---

### AnswerTemplates
| Kolon | Tip | Kisitlama |
|-------|-----|-----------|
| Id | int | PK, Auto Increment |
| Name | string | Not Null |
| CreatedAt | datetime | Default: UTC Now |

---

### AnswerOptions
| Kolon | Tip | Kisitlama |
|-------|-----|-----------|
| Id | int | PK, Auto Increment |
| AnswerTemplateId | int | FK → AnswerTemplates (Cascade) |
| Text | string | Not Null |
| Order | int | Not Null |

---

### SurveyQuestions (Junction)
| Kolon | Tip | Kisitlama |
|-------|-----|-----------|
| SurveyId | int | PK (Composite), FK → Surveys (Cascade) |
| QuestionId | int | PK (Composite), FK → Questions (Cascade) |
| Order | int | Not Null |

---

### SurveyAssignments (Junction)
| Kolon | Tip | Kisitlama |
|-------|-----|-----------|
| SurveyId | int | PK (Composite), FK → Surveys (Cascade) |
| UserId | int | PK (Composite), FK → Users (Cascade) |

---

### SurveyResponses
| Kolon | Tip | Kisitlama |
|-------|-----|-----------|
| Id | int | PK, Auto Increment |
| SurveyId | int | FK → Surveys (Cascade) |
| UserId | int | FK → Users (Cascade) |
| SubmittedAt | datetime | Default: UTC Now |

**Unique Index:** `(SurveyId, UserId)` — Bir kullanici ayni anketi bir kez doldurabilir.

---

### SurveyAnswers
| Kolon | Tip | Kisitlama |
|-------|-----|-----------|
| Id | int | PK, Auto Increment |
| SurveyResponseId | int | FK → SurveyResponses (Cascade) |
| QuestionId | int | FK → Questions (Restrict) |
| SelectedOptionId | int | FK → AnswerOptions (Restrict) |

---

## Iliskiler

| Iliski | Tip | Silme Davranisi |
|--------|-----|-----------------|
| User → SurveyAssignment | 1:N | Cascade |
| User → SurveyResponse | 1:N | Cascade |
| Survey → SurveyQuestion | 1:N | Cascade |
| Survey → SurveyAssignment | 1:N | Cascade |
| Survey → SurveyResponse | 1:N | Cascade |
| Question → SurveyQuestion | 1:N | Cascade |
| Question → AnswerTemplate | N:1 | **Restrict** |
| AnswerTemplate → AnswerOption | 1:N | Cascade |
| SurveyResponse → SurveyAnswer | 1:N | Cascade |
| SurveyAnswer → Question | N:1 | **Restrict** |
| SurveyAnswer → AnswerOption | N:1 | **Restrict** |

---

## Seed Data

Uygulama ilk calistirmada otomatik olusturulur:

**Kullanicilar:**
| Email | Sifre | Rol |
|-------|-------|-----|
| admin@survey.com | Admin123! | Admin |
| user@survey.com | User123! | User |

**Cevap Sablonlari:**
1. Evet/Hayir (2 secenek)
2. Memnuniyet Duzeyi (4 secenek)
3. Katilim Olcegi (3 secenek)

---

## Migration Yonetimi

```bash
# Yeni migration olustur
cd src/backend/src/SurveyApp.Infrastructure
dotnet ef migrations add MigrationName -s ../SurveyApp.API

# Migration uygula
dotnet ef database update -s ../SurveyApp.API
```

Not: Uygulama baslatildiginda `Program.cs`'de `db.Database.Migrate()` otomatik calisir.
