# DARBAK — Content Schema

هذا المستند يحدد البنية المعتمدة لملفات البيانات (JSON). أي ملف لا يتبع هذا العقد قد لا يظهر بشكل صحيح في الواجهة.

---

## 1. Disease Schema (`data/diseases/{slug}.json`)

```json
{
  "slug": "string (unique, lowercase, kebab-case)",
  "title": "string (اسم المرض بالعربية)",
  "titleEn": "string (optional)",
  "tagline": "string (جملة قصيرة تظهر تحت الاسم)",
  "icon": "string (اسم الأيقونة في SVG sprite)",
  "color": "string (optional, hex color for card accent)",
  "lastReview": "YYYY-MM-DD",
  "reviewer": "object | null (مثال: { name: 'د. أحمد', specialty: 'باطنة' })",
  "sources": [
    {
      "name": "string (اسم المصدر، مثلاً: WHO)",
      "url": "string (رابط)"
    }
  ],
  "sections": [
    {
      "id": "string (unique within file, e.g., 'definition')",
      "title": "string (عنوان القسم)",
      "content": "string (نص تمهيدي للقسم - optional)",
      "items": [
        "string (عنصر في قائمة - optional)"
      ],
      "type": "list | text | warning | info" 
    }
  ]
}
