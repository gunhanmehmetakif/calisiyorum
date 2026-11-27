# Çalışıyorum — ürün demosu (demo2)

Sıfır bağımlılıklı Node uygulaması: kayıt, CV yükleme, AI koç "Ece" ile tanışma, uyum skorlu ilanlar, eğitim önerileri ve sağda her zaman açık kişisel asistan.

## Çalıştırma
```
node demo2/server.js
```
Ardından http://localhost:5174 açın.

## Gemini (isteğe bağlı)
`.env.example` dosyasını `demo2/.env` olarak kopyalayıp `GEMINI_API_KEY` girin (yoksa `demo/.env` okunur). Anahtar yalnız sunucuda kalır. Anahtar yoksa ya da istek hata verirse uygulama yerel senaryoyla (Demo modu) aynı akışı sürdürür.

## Notlar
- Tüm veri kurgusaldır; ödeme alınmaz.
- Kullanıcı durumu tarayıcıda (localStorage) tutulur; "Demoyu sıfırla" bağlantısı temizler.
- "Demo hesapla gir" Elif örneğiyle doğrudan panele götürür.
