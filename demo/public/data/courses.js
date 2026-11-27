const rows = [
  ['React ile Arayüz Geliştirme','Çalışıyorum Akademi',['React','JavaScript'],24,1290,'Gelecek Yazılımcılar Burs Programı'],
  ['TypeScript Temelleri','Pusula Eğitim',['TypeScript'],16,890],
  ['Git ve Takım Çalışması','Çalışıyorum Akademi',['Git'],8,349],
  ['SQL ile Veri Sorgulama','Çalışıyorum Akademi',['SQL'],20,990,'Veri Yolu Burs Programı'],
  ['Power BI ile Veri Hikâyesi','Kuzey Öğrenme',['Power BI','Veri görselleştirme'],18,1190],
  ['Python ile Veri Analizi','Pusula Eğitim',['Python','İstatistik'],30,1790],
  ['Dijital Pazarlamada SEO','Çalışıyorum Akademi',['SEO'],14,790,'Dijital Gelecek Burs Programı'],
  ['Google Ads Uygulamaları','Ahenk Eğitim',['Google Ads'],18,1390],
  ['Meta Reklam Yönetimi','Ahenk Eğitim',['Meta Ads','Analitik'],16,1290],
  ['İşe Alım ve Mülakat','Çalışıyorum Akademi',['İşe alım'],12,690],
  ['Bordro ve İş Hukuku','Yakamoz Eğitim',['Bordro','İş hukuku'],22,1490],
  ['Finansal Analiz Atölyesi','Kuzey Öğrenme',['Finansal analiz','Raporlama'],20,1390],
  ['Figma ile Ürün Tasarımı','Selin Tasarım Okulu',['Figma','Prototipleme'],28,1690,'Tasarımda İlk Adım Burs Programı'],
  ['Kullanıcı Araştırması','Selin Tasarım Okulu',['Kullanıcı araştırması','UI/UX'],18,1190],
  ['CRM ve Satış Süreçleri','Rota Eğitim',['CRM','Satış'],14,890],
  ['Üretimde Dijital Araçlar','Bursa Teknik Eğitim',['SolidWorks','ERP','Kalite'],36,2490]
];
export const courses = rows.map(([title,provider,skills,hours,priceTL,sponsored], index) => ({ id: `course-${index + 1}`, title, provider, skills, hours, priceTL, sponsored, rating: Number((4.7 + index % 3 * 0.1).toFixed(1)) }));
