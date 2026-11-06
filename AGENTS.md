
---

# 📄 `AGENTS.md` (versi rewrite)

```md
# AGENTS.md — Rules of Engagement

> Baca `DESIGN_SYSTEM.md` sebagai kontrak desain & arsitektur.
> File ini mengatur **cara kerja**, bukan **apa yang dibangun**.

---

## 1. PRINSIP DASAR

- **Plan before code.** Tidak ada kode ditulis sebelum user bilang `GO`.
- **Ask, don't assume.** Ambiguitas → tanya, jangan nebak.
- **Minimal diff.** Ubah hanya yang perlu. Jangan refactor "sekalian".
- **Reuse over recreate.** Cek komponen existing sebelum bikin baru.
- **Token over hardcode.** Semua nilai visual dari `DESIGN_SYSTEM.md`.

---

## 2. LARANGAN KERAS

Tanpa instruksi eksplisit dari user, **jangan**:
- Menulis / mengedit kode
- Install dependency baru
- Mengubah schema Supabase / RLS / bucket
- Menghapus file atau folder
- Refactor di luar scope task
- Commit / push
- Mengubah `DESIGN_SYSTEM.md` (kecuali diminta update kontrak)

---

## 3. WORKFLOW WAJIB
PLAN → VERIFY → APPROVE → BUILD → SELF-CHECK

Tidak boleh lompat fase. Tidak boleh BUILD sebelum APPROVE.

---

## 4. FORMAT RESPONS PER TASK

Setiap kali user kasih task, agent **wajib** balas dengan format ini dulu (bukan kode):
PLAN

    Tujuan: <1 baris>

    File disentuh: <list>

    Perubahan inti: <1–3 bullet>

    Risiko: <atau "-">

    Estimasi: <N file, ~N baris>

VERIFY

    □

    Design tokens dari DESIGN_SYSTEM dipakai
    □

    Komponen existing bisa direuse
    □

    Supabase call via hooks/
    □

    Responsive 375–1440px
    □

    Tidak ada dependency baru tanpa izin

NEED APPROVAL

Balas GO untuk lanjut, atau REVISE: <catatan>

Hanya setelah user balas `GO` → masuk fase **BUILD**.

---

## 5. FORMAT SELF-CHECK (SETELAH BUILD)

Wajib dilaporkan:
SELF-CHECK

    □

    Build / dev server no error
    □

    Tidak ada console.error
    □

    Token warna & spacing sesuai DESIGN_SYSTEM
    □

    File berubah: <list>
    □

    Belum selesai: <list atau "-">
    □

    Next step disarankan: <1 baris>


---

## 6. THRESHOLD ESKALASI

Wajib **PLAN + tunggu APPROVE** kalau:
- Perubahan > 2 file, atau > 50 baris
- Menyentuh schema / RLS / auth flow
- Menambah dependency
- Mengubah `DESIGN_SYSTEM.md`
- Menyentuh `tailwind.config.js` atau token

Boleh langsung eksekusi (tanpa plan) **hanya untuk**:
- Typo fix
- 1-line change yang sudah jelas
- Menjawab pertanyaan user

---

## 7. SAAT RAGU

| Situasi | Aksi |
|---|---|
| Requirement ambigu | **Tanya**, jangan asumsi |
| Konflik design token | **Tanya**, jangan pilih sendiri |
| Butuh dependency baru | **Tanya** |
| Bug critical saat build | **Stop, lapor**, jangan nekat fix |
| Ketemu kode lama yang "aneh" | **Lapor**, jangan refactor diam-diam |

---

## 8. GAYA KOMUNIKASI

- Bahasa: **Indonesia** (default), kode & komentar tetap Inggris.
- Ringkas. Bullet > paragraf.
- Sertakan path file absolut saat melapor perubahan.
- Kalau ada trade-off → sebut **1 baris** pilihan & rekomendasi.

> **Default mindset:**  
> *Kalau tidak yakin → tanya.*  
> *Kalau yakin tapi belum di-approve → tunggu.*  
> *Kalau sudah di-approve → kerjakan minimal, lalu self-check.*