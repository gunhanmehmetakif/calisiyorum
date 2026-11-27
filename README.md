<a href="https://calisiyorum.mehmetakifgunhan.com">
  <picture>
    <source media="(prefers-color-scheme: dark)" srcset="docs/readme/banner-dark.png">
    <img src="docs/readme/banner-light.png" alt="Çalışıyorum — Yüzlerce ilan okuma. Sana uyanlar seni bulsun.">
  </picture>
</a>

<p align="center">
  <a href="https://calisiyorum.mehmetakifgunhan.com"><img src="https://img.shields.io/badge/Canl%C4%B1_demo-calisiyorum-12B99A?style=for-the-badge" alt="Canlı demo"></a>
  <a href="sunum/calisiyorum-sunum.pdf"><img src="https://img.shields.io/badge/Sunum-PDF-0B1F44?style=for-the-badge" alt="Sunum PDF"></a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Gemini-2.5_Flash-4285F4?logo=googlegemini&logoColor=white" alt="Gemini 2.5 Flash">
  <img src="https://img.shields.io/badge/Node.js-22-5FA04E?logo=nodedotjs&logoColor=white" alt="Node.js 22">
  <img src="https://img.shields.io/badge/ba%C4%9F%C4%B1ml%C4%B1l%C4%B1k-0-12B99A" alt="Sıfır bağımlılık">
  <img src="https://img.shields.io/badge/Docker-Coolify-2496ED?logo=docker&logoColor=white" alt="Docker / Coolify">
  <img src="https://img.shields.io/badge/durum-demo-F2A93B" alt="Durum: demo">
</p>

<p align="center">
  <a href="#neden">Neden</a> ·
  <a href="#nasıl-çalışır">Nasıl çalışır</a> ·
  <a href="#ürün">Ürün</a> ·
  <a href="#sunum">Sunum</a> ·
  <a href="#mimari">Mimari</a> ·
  <a href="#hızlı-başlangıç">Hızlı başlangıç</a> ·
  <a href="#yol-haritası">Yol haritası</a> ·
  <a href="#ekip">Ekip</a>
</p>

<br>

<p align="center">
  <img src="docs/readme/hero.jpg" alt="Çalışıyorum: masaüstü ve mobil panel" width="100%">
</p>

## Neden

Gençler ve yeni mezunlar yüzlerce ilanı tek tek okuyup toplu başvuru yapıyor. Firmalar başvuru seli içinde uygun adayı bulamıyor. İki tarafın sorunu birbirini büyütüyor.

<table>
  <tr>
    <th width="50%">Aday</th>
    <th width="50%">İşveren</th>
  </tr>
  <tr>
    <td>Hangi ilana gerçekten uygun olduğunu bilmiyor. Eksik becerisini neyle kapatacağını bilmiyor.</td>
    <td>Çok başvuru alıyor, az uygun aday görüyor. Eleme zaman ve para kaybettiriyor.</td>
  </tr>
  <tr>
    <td><b>Çalışıyorum:</b> CV'yi okuyan, adayı tanıyan bir koç. Her ilan için uyum skoru ve gerekçe. Eksik beceriye eğitim.</td>
    <td><b>Çalışıyorum:</b> Başvuru seli yerine ön eşleşmiş, uygun adaylar.</td>
  </tr>
</table>

## Nasıl çalışır

Kayıttan kişisel panele birkaç dakikada: CV yüklenir, beceriler çıkarılır, koç **Ece** üç kısa soruyla hedefi, şehri ve iş tipini öğrenir.

<p align="center"><img src="docs/readme/onboarding.jpg" alt="CV yükle, beceriler çıkarılır, koç Ece ile tanış" width="100%"></p>

## Ürün

### Gerekçeli eşleştirme

Her ilan uyum skoruyla sıralanır ve **neden uygun olduğu** yazar: sende olan zorunlu beceriler, seviye, konum. Eksik beceri varsa onu kapatan eğitim önerilir.

<p align="center"><img src="docs/readme/matching.jpg" alt="Uyum skorlu ilanlar, ilan detayı ve eğitim önerileri" width="100%"></p>

### Her zaman yanında bir kariyer koçu

Ece panelin sağında hep açık durur. Aday doğal dille sorar, Ece profilini bilerek cevap verir ve gerekirse ilgili sayfayı kendisi açar.

<p align="center"><img src="docs/readme/assistant.jpg" alt="Koç Ece sohbeti" width="100%"></p>

> **Aday:** Bana en uygun staj hangisi, eksiğim ne?<br>
> **Ece:** Profilinize göre en uygun staj ilanı Mavikod Yazılım'dan Yazılım Geliştirme Stajyeri pozisyonu. Eksik yetkinlikleriniz arasında Docker ve TypeScript bulunuyor. Bunları tamamlayarak daha da güçlenebilirsiniz.
>
> <sub>Canlı demodan, Gemini 2.5 Flash cevabı.</sub>

### Telefonda da aynı deneyim

<p align="center">
  <img src="docs/ekran/11-mobil-giris.jpg" alt="Mobil giriş" width="260">
  &nbsp;&nbsp;&nbsp;
  <img src="docs/ekran/12-mobil-panel.jpg" alt="Mobil panel" width="260">
</p>

<details>
<summary><b>Bütün ekranlar</b></summary>
<br>

| | |
|---|---|
| ![Giriş](docs/ekran/01-giris.jpg) | ![CV yükle](docs/ekran/02-cv-yukle.jpg) |
| ![CV okundu](docs/ekran/03-cv-okundu.jpg) | ![Koç Ece](docs/ekran/04-koc-ece.jpg) |
| ![Panel](docs/ekran/05-panel.jpg) | ![Asistan](docs/ekran/06-asistan.jpg) |
| ![İlanlar](docs/ekran/07-ilanlar.jpg) | ![İlan detayı](docs/ekran/08-ilan-detay.jpg) |
| ![Eğitimler](docs/ekran/09-egitimler.jpg) | ![Başvurular](docs/ekran/10-basvurular.jpg) |

</details>

## Neyi farklı yapıyoruz

| | İlan siteleri | Profesyonel ağlar | Genç platformları | AI CV araçları | **Çalışıyorum** |
|---|:-:|:-:|:-:|:-:|:-:|
| Kişiye özel eşleştirme | Kısmi | Kısmi | Kısmi | — | ✅ |
| Sohbet eden AI koç | — | — | — | Kısmi | ✅ |
| Uyum skoru ve gerekçe | — | Kısmi | Kısmi | Kısmi | ✅ |
| Eksik beceriye eğitim | Kısmi | Kısmi | Kısmi | — | ✅ |
| İşverene ön eşleşmiş aday | Kısmi | Kısmi | Kısmi | — | ✅ |
| Türkçe ve yerel piyasa | ✅ | Kısmi | ✅ | Kısmi | ✅ |

<sub>Kategori bazlı, genel ürün özellikleri karşılaştırmasıdır.</sub>

**Gelir modeli:** ücretli eğitimler (partnerlerle gelir paylaşımı) · firma ilan paketleri ve ön eşleşmiş aday erişimi · sponsorlu burs ve eğitim programları.

## Sunum

Yatırımcı, jüri, İK, sponsor ve üniversiteler için 14 slaytlık Türkçe sunum.

<p align="center"><a href="sunum/calisiyorum-sunum.pdf"><img src="docs/readme/sunum.jpg" alt="Çalışıyorum sunumu" width="100%"></a></p>

<p align="center">
  <a href="sunum/calisiyorum-sunum.pdf"><b>PDF'i aç</b></a> ·
  Animasyonlu sürüm: <code>sunum/index.html</code> (← → ile gezin, <code>#5</code> ile slayta git)
</p>

<details>
<summary><b>Bütün slaytlar</b></summary>
<br>

| | |
|---|---|
| ![1](docs/ekran/sunum/slayt-01.jpg) | ![2](docs/ekran/sunum/slayt-02.jpg) |
| ![3](docs/ekran/sunum/slayt-03.jpg) | ![4](docs/ekran/sunum/slayt-04.jpg) |
| ![5](docs/ekran/sunum/slayt-05.jpg) | ![6](docs/ekran/sunum/slayt-06.jpg) |
| ![7](docs/ekran/sunum/slayt-07.jpg) | ![8](docs/ekran/sunum/slayt-08.jpg) |
| ![9](docs/ekran/sunum/slayt-09.jpg) | ![10](docs/ekran/sunum/slayt-10.jpg) |
| ![11](docs/ekran/sunum/slayt-11.jpg) | ![12](docs/ekran/sunum/slayt-12.jpg) |
| ![13](docs/ekran/sunum/slayt-13.jpg) | ![14](docs/ekran/sunum/slayt-14.jpg) |

<sub>Pazar ve istatistik verilerinin kaynakları <code>docs/BULGULAR.md</code> içinde; bir kısmı henüz resmî kaynaktan doğrulanmadı.</sub>

</details>

## Mimari

```mermaid
flowchart LR
    U["Tarayıcı<br/>HTML · CSS · ES modülleri"] -->|/api/coach| S["Node sunucusu<br/>(sıfır bağımlılık)"]
    S -->|API anahtarı yalnız burada| G1["Gemini 2.5 Flash"]
    S -.->|hata olursa| G2["Gemini 3.5 Flash Lite"]
    U -.->|AI yanıt vermezse| D["Yerel senaryo<br/>(Demo modu)"]
    U --- L[("localStorage<br/>profil · başvurular")]
```

- **Anahtar tarayıcıya gitmez.** Tarayıcı yalnız kendi sunucusuyla konuşur, Gemini çağrısını sunucu yapar.
- **Kesintiye dayanıklı.** Ana model hata verirse yedek model denenir. O da yoksa arayüz aynı akışı yerel senaryoyla sürdürür.
- **Paket yok.** Sunucu Node'un yerleşik modülleriyle çalışır. `npm install` gerekmez, imaj küçük kalır.
- **Sağlık kontrolü:** `GET /api/status` → `{"ai":true,"model":"Gemini 2.5 Flash"}`

<details>
<summary><b>Klasör yapısı</b></summary>

```
calisiyorum/
├── demo2/            Yayındaki ürün (kayıt → CV → koç → panel)
│   ├── server.js     Node sunucusu + Gemini proxy
│   ├── Dockerfile
│   └── public/       Arayüz (hash router, ES modülleri)
├── demo/             İlk prototip (tek akış)
├── sunum/            14 slayt HTML sunum + PDF
├── sunum-claude/     Sunumun alternatif tasarımı
├── marka/            Logo ve işaret (SVG)
└── docs/             PRD, durum, kaynaklar, README görselleri
```

</details>

## Hızlı başlangıç

Node 22 veya üstü yeterli.

```bash
git clone https://github.com/gunhanmehmetakif/calisiyorum.git
cd calisiyorum
cp demo2/.env.example demo2/.env    # GEMINI_API_KEY girin (isteğe bağlı)
node demo2/server.js                # http://localhost:5174
```

Anahtar girilmezse demo yerel senaryoyla çalışır.

| Değişken | Varsayılan | Açıklama |
|---|---|---|
| `GEMINI_API_KEY` | — | Google AI Studio anahtarı. Yalnız `.env` dosyasında veya sunucu ortamında tutulur. |
| `GEMINI_MODEL` | `gemini-2.5-flash` | Ana model |
| `GEMINI_FALLBACK_MODEL` | `gemini-3.5-flash-lite` | Yedek model |
| `DEMO2_PORT` | `5174` | Port (Docker imajında `3000`) |

<details>
<summary><b>Yayın (Coolify)</b></summary>
<br>

| Ayar | Değer |
|---|---|
| Kaynak | Bu repo, `main` dalı (GitHub App, push ile otomatik yayın) |
| Base directory | `/demo2` |
| Build pack | Dockerfile |
| Port | `3000` |
| Sağlık kontrolü | `/api/status` |
| Ortam değişkenleri | `GEMINI_API_KEY`, `GEMINI_MODEL`, `GEMINI_FALLBACK_MODEL` |
| Domain | https://calisiyorum.mehmetakifgunhan.com |

</details>

## Yol haritası

| Ne zaman | Adım | Kapsam |
|---|---|---|
| **Bugün** | ✅ Çalışan demo | CV okuma, AI koç, gerekçeli eşleştirme, eğitim önerisi |
| 2027 Ç1 | Pilot | 2 üniversite, 20 firma |
| 2027 Ç2 | Gelir altyapısı | Firma paneli, ödeme, eğitim partnerleri |
| 2027 Ç4 | Yeni kanallar | Sponsor programları, mobil uygulama |
| 2028 | Ölçeklenme | Daha geniş aday ve işveren ağı |

## Ekip

<table>
  <tr>
    <td align="center" width="180">
      <a href="https://github.com/gunhanmehmetakif"><img src="https://github.com/gunhanmehmetakif.png?size=200" width="100" alt=""><br><b>Mehmet Akif Günhan</b></a><br>
      <sub>@gunhanmehmetakif</sub>
    </td>
    <td align="center" width="180">
      <a href="https://github.com/ndonmez0922-gif"><img src="https://github.com/ndonmez0922-gif.png?size=200" width="100" alt=""><br><b>Nuriyenaz Dönmez</b></a><br>
      <sub>@ndonmez0922-gif</sub>
    </td>
  </tr>
</table>

---

<p align="center">
  <img src="marka/isaret.svg" width="28" alt=""><br>
  <sub>© 2026 Çalışıyorum · Demo amaçlıdır; ilanlar, firmalar, eğitimler ve kişiler kurgusaldır.Şuan da bu konu geliştirme aşamasındadır.</sub>
</p>
