# DURUM (2026-11-27)

## Güncel
- Logo seçildi (`marka/logo-ana.png`). Kurumsal açık tonlar.
- `demo/` (GPT): tek akışlı demo, localhost:5173. Gemini anahtarı `demo/.env`de; refine sohbeti Gemini ile sunucu üzerinden doğrulandı.
- `demo2/` (Claude): ürün tarzı demo hazır (giriş + onboarding + panel + hep açık koç), localhost:5174. Asistan sohbeti Gemini ile sunucu üzerinden doğrulandı; panel akışı tarayıcıda elle denenmedi. Port demo/.env yerine 5174 sabit.
- `sunum/` (GPT): 14 slayt HTML + `calisiyorum-sunum.pdf`.
- `sunum-claude/` (Claude): Slides artifact, 14 slayt: https://claude.ai/artifact/UroHcKLwd3qU6gvhc7gnGt (özel; PDF/PPTX indirme Slides menüsünden).

## Sıradaki
1. Kullanıcı Gemini anahtarını `demo/.env`'e koyup iki demoyu dener; biri seçilir/birleştirilir.
2. İki sunumdan biri seçilir; ekip ve iletişim bilgileri eklenir.
3. Sunum verileri resmî kaynaklardan teyit (BULGULAR'da çoğu "doğrulanmadı").

## Açık sorunlar
- gemini-2.5-flash en erken 1.12.2026'da kapanabilir; fallback gemini-3.5-flash-lite.
- `sunum/` içinde GPT'nin bıraktığı test dosyaları var (.chrome-test*, check-*.png) — silmek için onay bekleniyor.
- demo/ başlık harf aralığı çok sıkı (küçük düzeltme).
