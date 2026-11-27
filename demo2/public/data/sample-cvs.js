// Fictional sample CVs and the matching demo profiles.
export const SAMPLE_CVS = {
  elif: {
    id: 'elif',
    name: 'Elif Kaya',
    tagline: 'Bilgisayar Mühendisliği yeni mezun',
    form: { name: 'Elif Kaya', email: 'elif.kaya@ornek.com', status: 'Yeni mezun' },
    text: `ELİF KAYA
Bilgisayar Mühendisi (Yeni mezun) · İstanbul
elif.kaya@ornek.com · github.com/elifkaya-demo

ÖZET
Web teknolojilerine ve veri analizine ilgi duyan, takım içinde çalışmayı seven yeni mezun bir bilgisayar mühendisi.

EĞİTİM
Bilgisayar Mühendisliği, Marmara Ova Üniversitesi (kurgusal) — 2022-2026, GNO 3.42

DENEYİM
Yazılım Stajyeri, Mavikod Yazılım — Yaz 2025
- React ve JavaScript ile iç raporlama ekranı geliştirdim.
- Node.js ile küçük bir REST API yazdım, SQL sorgularını optimize ettim.
- Git ile ekip içinde pull request akışında çalıştım.

PROJELER
Staj Takip Uygulaması — React, Node.js, SQL; öğrenci başvurularını listeleyen web uygulaması.
Kampüs Veri Panosu — Python ile anket verisini temizleyip görselleştirdim.

BECERİLER
JavaScript, React, Node.js, Python, SQL, Git, REST API, Veri Analizi, İletişim, Takım Çalışması, İngilizce (B2)

İLGİ ALANLARI
Web geliştirme, veri görselleştirme, açık kaynak`,
    skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'REST API', 'Veri Analizi', 'İletişim', 'Takım Çalışması', 'İngilizce'],
    profile: {
      targetRoles: ['Frontend Geliştirici', 'Full Stack Geliştirici', 'Veri Analisti'],
      skills: ['JavaScript', 'React', 'Node.js', 'Python', 'SQL', 'Git', 'REST API', 'Veri Analizi', 'İletişim', 'Takım Çalışması', 'İngilizce'],
      missingSkills: ['Docker', 'TypeScript'],
      level: 'Junior',
      cities: ['İstanbul'],
      remoteOk: true,
      jobTypes: ['İş', 'Staj'],
      interests: ['Yazılım', 'Veri'],
      summary: 'React ve Node.js ile uçtan uca proje deneyimi olan yeni mezun. Konteyner ve tip güvenliği tarafını tamamlarsa güçlü bir junior aday.',
    },
  },
  burak: {
    id: 'burak',
    name: 'Burak Demir',
    tagline: 'İşletme 4. sınıf, pazarlama stajı arıyor',
    form: { name: 'Burak Demir', email: 'burak.demir@ornek.com', status: 'Öğrenci' },
    text: `BURAK DEMİR
İşletme Bölümü 4. Sınıf Öğrencisi · İstanbul
burak.demir@ornek.com

HEDEF
Dijital pazarlama alanında 3-6 aylık staj.

EĞİTİM
İşletme, Karadeniz Anadolu Üniversitesi (kurgusal) — 2022-2026, GNO 3.1

DENEYİM
Sosyal Medya Sorumlusu (gönüllü), Üniversite Girişimcilik Kulübü — 2024-2025
- Kulübün Instagram hesabını yönettim, takipçi sayısını 6 ayda %70 artırdım.
- Canva ile etkinlik afişleri ve hikaye şablonları tasarladım.
- Haftalık içerik takvimi hazırladım, blog yazıları yazdım.

Yaz Stajı, Nova Perakende (mağaza operasyonu) — Yaz 2025
- Satış verilerini Excel ile derleyip haftalık rapor hazırladım.
- Müşteri anketlerini topladım ve özetledim.

PROJELER
Mini Pazar Araştırması — 120 kişilik anketle yerel kahve markası için tüketici tercihlerini analiz ettim.

BECERİLER
Sosyal Medya, İçerik Yazarlığı, Canva, Excel, Pazar Araştırması, İletişim, Takım Çalışması, Sunum, İngilizce (B1)

İLGİ ALANLARI
Marka iletişimi, içerik üretimi, fotoğraf`,
    skills: ['Sosyal Medya', 'İçerik Yazarlığı', 'Canva', 'Excel', 'Pazar Araştırması', 'İletişim', 'Takım Çalışması', 'Sunum', 'İngilizce'],
    profile: {
      targetRoles: ['Dijital Pazarlama Stajyeri', 'İçerik Pazarlama Stajyeri', 'Sosyal Medya Uzmanı'],
      skills: ['Sosyal Medya', 'İçerik Yazarlığı', 'Canva', 'Excel', 'Pazar Araştırması', 'İletişim', 'Takım Çalışması', 'Sunum', 'İngilizce'],
      missingSkills: ['Google Analytics', 'SEO'],
      level: 'Stajyer',
      cities: ['İstanbul'],
      remoteOk: true,
      jobTypes: ['Staj'],
      interests: ['Pazarlama'],
      summary: 'Sosyal medya ve içerik tarafında somut sonuç üretmiş işletme öğrencisi. Analitik ve SEO becerileri eklenirse pazarlama stajlarında öne çıkar.',
    },
  },
};
