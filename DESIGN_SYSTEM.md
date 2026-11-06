# DESIGN_SYSTEM.md — Portfolio V5 Rebuild

> Kontrak desain & arsitektur. Baca sebelum eksekusi apapun.
> Repo referensi: https://github.com/EkiZR/Portofolio_V5
> Working dir: `/Users/macbook/Documents/AI AGENT/Antigravity/Front-End/Portofolio_V5-main`

---

## 1. TUJUAN PROYEK

Website portfolio pribadi + admin dashboard, mengadaptasi struktur & fitur dari Portofolio_V5.

**Fitur inti:**
- Public: Home, Projects, Certificates, Comments (read + submit)
- Admin: Login, Dashboard, CRUD Projects, CRUD Certificates, Manage Comments (pin/delete)
- Backend: Supabase (auth, db, storage, realtime)

**Non-goals (fase ini):** blog, multi-language, payment, light mode.

---

## 2. TECH STACK (FIXED)

| Layer | Tech |
|---|---|
| Build | Vite |
| Framework | React 18 |
| Styling | Tailwind CSS |
| Backend | Supabase |
| Animasi | Framer Motion + AOS |
| Icons | Lucide React |
| UI Kit | Material UI (selective) |
| Alert | SweetAlert2 |
| Routing | React Router v6 |

**Env vars:** `VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`. File `.env` tidak di-commit.

---

## 3. DESIGN TOKENS

Satu-satunya sumber nilai visual. Butuh nilai baru → **tambahkan di sini dulu**, jangan hardcode di komponen.

### Color
Palet dasar (sumber, jangan diubah tanpa izin):

#1E3B2F deep forest green (primary dark)
#7F8C6A sage / olive (secondary)
#C8B48A warm sand / beige (accent)
#F5F0E6 off-white cream (background)
```js
{
  bg:        '#F5F0E6',  // background utama (cream)
  surface:   '#FFFFFF',  // card / panel (putih netral di atas cream)
  surfaceAlt:'#EDE7DA',  // panel sekunder / hover state
  border:    '#D8CFBE',  // garis halus, turunan dari cream
  primary:   '#1E3B2F',  // CTA, heading, brand
  secondary: '#7F8C6A',  // aksen sekunder, badge, icon
  accent:    '#C8B48A',  // highlight, hover, underline
  text:      '#1E3B2F',  // body text (pakai primary)
  textMuted: '#5A6650',  // text sekunder (turunan primary+secondary)
  onPrimary: '#F5F0E6',  // text di atas primary
  danger:    '#B4442E',  // error (earth-tone red)
  success:   '#4F7A3A',  // success (earth-tone green)
}
```
Rules:

    Light mode default (background cream).

    Kontras minimal WCAG AA (4.5:1).

        ✅ #1E3B2F di #F5F0E6

        ⚠️ #7F8C6A di #F5F0E6 → hanya untuk text besar / aksen, bukan body

        ⚠️ #C8B48A di #F5F0E6 → hanya dekorasi / border

    Jangan pakai #7F8C6A untuk body text.

    Jangan pakai #C8B48A untuk text utama.