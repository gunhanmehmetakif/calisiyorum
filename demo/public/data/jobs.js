const rows = [
  ['Frontend Geliştirme Stajyeri','Mavikod Yazılım','İstanbul','Staj','Hibrit','yazılım','öğrenci',['JavaScript','HTML','CSS'],['React','Git'],'12.000–16.000 TL'],
  ['Junior Frontend Geliştirici','Mavikod Yazılım','İstanbul','Tam zamanlı','Hibrit','yazılım','yeni mezun',['JavaScript','React','Git'],['TypeScript','UI/UX'],'32.000–42.000 TL'],
  ['Yazılım Geliştirme Stajyeri','Atlas Enerji','Ankara','Staj','Yerinde','yazılım','öğrenci',['Python','Git','SQL'],['Docker','API'],'11.000–15.000 TL'],
  ['Backend Geliştirici','Pusula Analitik','Uzaktan','Tam zamanlı','Uzaktan','yazılım','junior',['Python','SQL','API'],['Docker','Bulut'],'38.000–50.000 TL'],
  ['Veri Analizi Stajyeri','Pusula Analitik','İstanbul','Staj','Hibrit','veri/analitik','öğrenci',['Python','Excel','SQL'],['Power BI','İstatistik'],'13.000–17.000 TL'],
  ['Junior Veri Analisti','Kuzey Finans','Ankara','Tam zamanlı','Hibrit','veri/analitik','yeni mezun',['SQL','Excel','Power BI'],['Python','İstatistik'],'34.000–44.000 TL'],
  ['İş Zekâsı Uzmanı','Eksen Teknoloji','İzmir','Tam zamanlı','Yerinde','veri/analitik','junior',['SQL','Power BI','Veri görselleştirme'],['Python','Excel'],'37.000–48.000 TL'],
  ['Dijital Pazarlama Stajyeri','Nova Perakende','İstanbul','Staj','Hibrit','pazarlama/dijital','öğrenci',['Sosyal medya','İçerik üretimi','Excel'],['SEO','Google Ads'],'12.000–16.000 TL'],
  ['İçerik ve Sosyal Medya Stajyeri','Ege Gıda','İzmir','Staj','Yerinde','pazarlama/dijital','öğrenci',['Sosyal medya','İçerik üretimi','Canva'],['SEO','Analitik'],'11.000–14.000 TL'],
  ['Performans Pazarlama Uzmanı','Nova Perakende','İstanbul','Tam zamanlı','Hibrit','pazarlama/dijital','junior',['Google Ads','SEO','Analitik'],['Meta Ads','Excel'],'36.000–47.000 TL'],
  ['Marka İletişimi Uzmanı','Ahenk İletişim','Uzaktan','Tam zamanlı','Uzaktan','pazarlama/dijital','yeni mezun',['İçerik üretimi','Sosyal medya','Canva'],['SEO','Analitik'],'31.000–40.000 TL'],
  ['İnsan Kaynakları Stajyeri','Atlas Enerji','Ankara','Staj','Yerinde','insan kaynakları','öğrenci',['Excel','İletişim','İşe alım'],['Bordro','Raporlama'],'11.000–14.000 TL'],
  ['İK Uzman Yardımcısı','Yakamoz Sağlık','İstanbul','Tam zamanlı','Hibrit','insan kaynakları','yeni mezun',['İşe alım','Excel','İletişim'],['Bordro','İş hukuku'],'30.000–39.000 TL'],
  ['Finans Stajyeri','Kuzey Finans','İstanbul','Staj','Hibrit','finans/muhasebe','öğrenci',['Excel','Finansal analiz','Muhasebe'],['Power BI','Raporlama'],'13.000–17.000 TL'],
  ['Muhasebe Uzman Yardımcısı','Ege Gıda','İzmir','Tam zamanlı','Yerinde','finans/muhasebe','yeni mezun',['Muhasebe','Excel','Raporlama'],['ERP','Finansal analiz'],'31.000–40.000 TL'],
  ['UI/UX Tasarım Stajyeri','Selin Tasarım Stüdyosu','İstanbul','Staj','Hibrit','UI/UX tasarım','öğrenci',['Figma','UI/UX','Prototipleme'],['Kullanıcı araştırması','HTML'],'12.000–16.000 TL'],
  ['Ürün Tasarımcısı','Selin Tasarım Stüdyosu','Uzaktan','Tam zamanlı','Uzaktan','UI/UX tasarım','junior',['Figma','UI/UX','Kullanıcı araştırması'],['Prototipleme','CSS'],'36.000–49.000 TL'],
  ['Satış ve İş Geliştirme Stajyeri','Rota Ticaret','İstanbul','Staj','Yerinde','satış','öğrenci',['İletişim','Excel','Satış'],['CRM','Sunum'],'11.000–15.000 TL'],
  ['Kurumsal Satış Temsilcisi','Rota Ticaret','Ankara','Tam zamanlı','Hibrit','satış','junior',['Satış','CRM','İletişim'],['Excel','Sunum'],'32.000–45.000 TL'],
  ['Makine Mühendisliği Stajyeri','Bursa Mekanik','Bursa','Staj','Yerinde','üretim/makine','öğrenci',['AutoCAD','Üretim','Teknik çizim'],['SolidWorks','Kalite'],'12.000–15.000 TL'],
  ['Üretim Planlama Mühendisi','Bursa Mekanik','Bursa','Tam zamanlı','Yerinde','üretim/makine','yeni mezun',['Üretim','Excel','Kalite'],['ERP','SolidWorks'],'34.000–45.000 TL'],
  ['Kalite Kontrol Uzmanı','Körfez Otomasyon','Kocaeli','Tam zamanlı','Yerinde','üretim/makine','junior',['Kalite','Teknik çizim','Üretim'],['AutoCAD','Raporlama'],'35.000–46.000 TL'],
  ['Lojistik Operasyon Stajyeri','Anadolu Lojistik','Kocaeli','Staj','Yerinde','lojistik','öğrenci',['Excel','Lojistik','İletişim'],['ERP','Raporlama'],'11.000–14.000 TL'],
  ['Tedarik Zinciri Analisti','Anadolu Lojistik','İstanbul','Tam zamanlı','Hibrit','lojistik','yeni mezun',['Lojistik','Excel','Raporlama'],['SQL','ERP'],'33.000–43.000 TL'],
  ['Dış Ticaret Uzman Yardımcısı','Marmara Dış Ticaret','İzmir','Tam zamanlı','Yerinde','lojistik','yeni mezun',['Lojistik','Excel','İletişim'],['ERP','Finansal analiz'],'30.000–39.000 TL'],
  ['Uzaktan Müşteri Başarı Asistanı','Kıvılcım Dijital','Uzaktan','Yarı zamanlı','Uzaktan','satış','öğrenci',['İletişim','CRM','Sunum'],['Excel','Satış'],'16.000–22.000 TL']
];

export const jobs = rows.map(([title,company,city,type,workMode,field,level,requiredSkills,niceSkills,salaryRange], index) => ({
  id: `job-${index + 1}`, title, company, companyColor: ['#DCECF8','#E8E4FC','#FDE9DA','#E5F4ED','#F7E8EF','#E3F1F3'][index % 6],
  city, type, workMode, field, level, requiredSkills, niceSkills, salaryRange,
  description: `${company}, ${field} alanında gelişmek isteyen bir ekip arkadaşı arıyor. Bu rolde gerçek projelerde sorumluluk alacak, deneyimli ekiple birlikte çalışacaksın.`,
  postedDaysAgo: index % 8 + 1
}));
export const skillVocab = [...new Set(jobs.flatMap(job => [...job.requiredSkills, ...job.niceSkills]))];
