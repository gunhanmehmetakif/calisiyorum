# PRD — Çalışıyorum

## Ürün
İş arayanlar CV yükler, AI koçla yazışır; profil analizine göre uygun iş/staj ilanları sıralanır,
eksik beceriler için (ücretli) eğitim önerilir. Firmalar ön eşleşmiş, uygun adayları görür.
Gelir: ücretli eğitimler, ilan açma ücreti, sponsorlar.

## Karar kaydı
- 2026-11-27: Platform adı "Çalışıyorum"; logo "01 / Özgün Ç" (turkuaz Ç + lacivert yazı).
- 2026-11-27: Görsel yön kurumsal, açık/beyaz tonlar (koyu/neon değil).
- 2026-11-27: Teslimat = tarayıcıda test edilen demo sayfası + animasyonlu HTML sunum + PDF çıktısı.
- 2026-11-27: Koç yazışmalı (sesli değil). Model Gemini 2.5 Flash (kullanıcının anahtarı), yerel Node proxy.
- 2026-11-27: Demo akışı: kayıt → CV → koçla 2-3 soru → koç sağa kayar, 2-3 ilan + eğitim önerisi. Veriler örnek.
- 2026-11-27: Sunum Türkçe, Türkiye odaklı; kitle yatırımcı/jüri, İK, sponsor, okul.
- 2026-11-27: Kayıttaki koç soruları hazır senaryo (yerel); eşleşme/panel ekranındaki sohbet Gemini ile. Anahtar `demo/.env`'de, iki demo da oradan okur.
- 2026-11-27: Kod private GitHub reposunda (gunhanmehmetakif/calisiyorum). Yayın: calisiyorum.mehmetakifgunhan.com → demo2 (Claude demosu), Coolify'da Dockerfile ile.
- 2026-11-27: Ekip: Mehmet Akif Günhan + Nuriyenaz Dönmez (github.com/ndonmez0922-gif); README "Ekip" bölümünde.
