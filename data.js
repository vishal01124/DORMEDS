// =====================================================================
// DORMEDS FAST MEDICINE — Complete Data Layer
// Seed Data + Synonym Map + Fuzzy Search + Database Engine
// =====================================================================

const DB_PREFIX = 'dmed_';

// ---- Medicine Synonym Map (salt ↔ brand mapping) ----
const SYNONYMS = {
  'paracetamol': ['dolo', 'crocin', 'calpol', 'p-650', 'fever medicine'],
  'ibuprofen': ['combiflam', 'brufen', 'advil', 'pain killer'],
  'cetirizine': ['cetzine', 'alerid', 'zyrtec', 'allergy medicine'],
  'azithromycin': ['azithral', 'zithromax', 'azee'],
  'amoxicillin': ['mox', 'amoxil', 'novamox'],
  'metformin': ['glycomet', 'glucophage', 'diabetes medicine', 'sugar medicine'],
  'glimepiride': ['amaryl', 'glimstar'],
  'omeprazole': ['omez', 'prilosec', 'acidity'],
  'pantoprazole': ['pan-d', 'pantocid', 'gas medicine'],
  'diclofenac': ['voveran', 'voltaren', 'body pain', 'joint pain'],
  'montelukast': ['montair', 'singulair', 'asthma'],
  'vitamin c': ['limcee', 'celin', 'immunity'],
  'calcium': ['shelcal', 'calcimax', 'bone health'],
  'vitamin d': ['d3 must', 'calcirol'],
  'multivitamin': ['supradyn', 'becosules', 'zincovit', 'health supplement'],
  'headache': ['dolo', 'saridon', 'crocin', 'disprin', 'combiflam'],
  'cold': ['sinarest', 'vicks', 'cetirizine', 'cheston cold'],
  'cough': ['benadryl', 'honitus', 'grilinctus', 'alex'],
  'fever': ['dolo', 'crocin', 'meftal', 'paracetamol'],
  'acidity': ['digene', 'eno', 'gelusil', 'pan-d'],
  'diabetes': ['glycomet', 'metformin', 'amaryl', 'janumet'],
  'bp': ['amlodipine', 'telmisartan', 'blood pressure'],
  'skin': ['betnovate', 'panderm', 'candid', 'dermi'],
  'wound': ['betadine', 'soframycin', 'neosporin'],
  'diarrhea': ['ors', 'loperamide', 'electral', 'econorm'],
  'first aid': ['betadine', 'band-aid', 'dettol', 'cotton', 'gauze'],
};

// ---- Complete Seed Data ----
const SEED = {
  users: [
    { id:'U1', name:'Rahul Sharma', phone:'9876543210', email:'rahul@gmail.com', role:'customer', avatar:'RS',
      addresses:[
        {id:'A1',type:'Home',icon:'🏠',address:'42, Sector 15, Noida, UP 201301',default:true},
        {id:'A2',type:'Office',icon:'🏢',address:'5th Floor, Tower B, Cyber City, Gurgaon 122002',default:false}
      ],
      settings:{darkMode:true,notifications:true}, saved:['M5','M12'], createdAt:'2025-01-15T10:30:00Z'
    },
    { id:'U2', name:'Priya Patel', phone:'9876543211', email:'priya@gmail.com', role:'customer', avatar:'PP',
      addresses:[{id:'A3',type:'Home',icon:'🏠',address:'18, MG Road, Bengaluru, Karnataka 560001',default:true}],
      settings:{darkMode:true,notifications:true}, saved:['M3','M8'], createdAt:'2025-02-20T14:00:00Z'
    },
    { id:'U3', name:'Amit Kumar', phone:'9876543212', email:'amit@gmail.com', role:'customer', avatar:'AK',
      addresses:[{id:'A4',type:'Home',icon:'🏠',address:'101, Lajpat Nagar, New Delhi 110024',default:true}],
      settings:{darkMode:false,notifications:true}, saved:[], createdAt:'2025-03-05T09:15:00Z'
    },
  ],

  pharmacies: [
    { id:'P1', name:'MedPlus', owner:'Dr. Suresh Reddy', phone:'9876500001', license:'DL-2024-MH-001234',
      loc:{lat:19.076,lng:72.877,address:'Shop 5, Andheri West, Mumbai 400058'}, status:'approved',
      rating:4.5, orders:1284, commission:12, open:'08:00', close:'22:00', active:true, createdAt:'2024-06-15' },
    { id:'P2', name:'Apollo Pharmacy', owner:'Dr. Kavitha Nair', phone:'9876500002', license:'DL-2024-KA-005678',
      loc:{lat:12.971,lng:77.594,address:'23, Koramangala, Bengaluru 560034'}, status:'approved',
      rating:4.7, orders:2156, commission:10, open:'07:00', close:'23:00', active:true, createdAt:'2024-03-10' },
    { id:'P3', name:'NetMeds Store', owner:'Rajesh Gupta', phone:'9876500003', license:'DL-2024-DL-009876',
      loc:{lat:28.613,lng:77.209,address:'15, Connaught Place, New Delhi 110001'}, status:'approved',
      rating:4.3, orders:876, commission:15, open:'09:00', close:'21:00', active:true, createdAt:'2024-08-20' },
    { id:'P4', name:'1mg Health Store', owner:'Dr. Anita Sharma', phone:'9876500004', license:'DL-2024-MH-003456',
      loc:{lat:19.082,lng:72.881,address:'78, Bandra, Mumbai 400050'}, status:'approved',
      rating:4.6, orders:1567, commission:11, open:'08:00', close:'22:30', active:true, createdAt:'2024-05-01' },
    { id:'P5', name:'PharmEasy Mart', owner:'Vikram Singh', phone:'9876500005', license:'DL-2024-UP-007890',
      loc:{lat:28.535,lng:77.391,address:'33, Sector 18, Noida 201301'}, status:'pending',
      rating:0, orders:0, commission:12, open:'09:00', close:'21:00', active:false, createdAt:'2025-03-28' },
  ],

  medicines: [
    // Pain Relief
    {id:'M1',name:'Dolo 650',gen:'Paracetamol 650mg',cat:'Pain Relief',mfr:'Micro Labs',mrp:35,price:28,off:20,stock:150,rat:4.5,rev:2340,phId:'P1',rx:false,icon:'💊',desc:'Fever and mild to moderate pain relief.',dose:'1 tablet every 4-6 hours',side:'Nausea, allergic reactions (rare)',salt:'paracetamol'},
    {id:'M2',name:'Combiflam',gen:'Ibuprofen + Paracetamol',cat:'Pain Relief',mfr:'Sanofi India',mrp:42,price:36,off:14,stock:120,rat:4.4,rev:1876,phId:'P1',rx:false,icon:'💊',desc:'Pain reliever for headache, toothache, joint pain.',dose:'1 tablet 2-3 times daily',side:'Stomach upset, dizziness',salt:'ibuprofen'},
    {id:'M3',name:'Crocin Advance',gen:'Paracetamol 500mg',cat:'Pain Relief',mfr:'GSK',mrp:30,price:25,off:17,stock:200,rat:4.6,rev:3210,phId:'P2',rx:false,icon:'💊',desc:'Fast relief from pain and fever.',dose:'1-2 tablets every 4-6 hours',side:'Rare allergic reactions',salt:'paracetamol'},
    {id:'M4',name:'Saridon',gen:'Propyphenazone + Paracetamol + Caffeine',cat:'Pain Relief',mfr:'Bayer',mrp:28,price:24,off:14,stock:80,rat:4.2,rev:1543,phId:'P3',rx:false,icon:'💊',desc:'Effective headache relief.',dose:'1 tablet when needed',side:'Drowsiness, stomach upset',salt:'paracetamol'},
    {id:'M5',name:'Voveran SR 100',gen:'Diclofenac 100mg',cat:'Pain Relief',mfr:'Novartis',mrp:75,price:62,off:17,stock:60,rat:4.3,rev:987,phId:'P1',rx:true,icon:'💊',desc:'For severe pain and inflammation.',dose:'1 tablet twice daily',side:'GI issues, dizziness',salt:'diclofenac'},
    {id:'M28',name:'Volini Spray',gen:'Diclofenac Spray',cat:'Pain Relief',mfr:'Sun Pharma',mrp:220,price:185,off:16,stock:55,rat:4.4,rev:3456,phId:'P2',rx:false,icon:'🧴',desc:'Topical pain relief spray for muscles and joints.',dose:'Spray on affected area',side:'Skin irritation',salt:'diclofenac'},

    // Diabetes
    {id:'M6',name:'Glycomet 500',gen:'Metformin 500mg',cat:'Diabetes',mfr:'USV',mrp:45,price:38,off:16,stock:100,rat:4.5,rev:4521,phId:'P2',rx:true,icon:'🩸',desc:'First-line treatment for Type 2 Diabetes.',dose:'1 tablet twice daily with meals',side:'Nausea, diarrhea',salt:'metformin'},
    {id:'M7',name:'Amaryl 2mg',gen:'Glimepiride 2mg',cat:'Diabetes',mfr:'Sanofi',mrp:120,price:99,off:18,stock:45,rat:4.4,rev:2103,phId:'P2',rx:true,icon:'🩸',desc:'Controls blood sugar in Type 2 Diabetes.',dose:'1 tablet once daily',side:'Hypoglycemia, weight gain',salt:'glimepiride'},
    {id:'M8',name:'Janumet 50/500',gen:'Sitagliptin + Metformin',cat:'Diabetes',mfr:'MSD',mrp:650,price:545,off:16,stock:30,rat:4.7,rev:1876,phId:'P4',rx:true,icon:'🩸',desc:'Dual-action diabetes medication.',dose:'1 tablet twice daily',side:'Upper respiratory infection',salt:'metformin'},
    {id:'M9',name:'Lantus SoloStar',gen:'Insulin Glargine',cat:'Diabetes',mfr:'Sanofi',mrp:1450,price:1290,off:11,stock:20,rat:4.6,rev:987,phId:'P1',rx:true,icon:'💉',desc:'Long-acting insulin pen.',dose:'As prescribed by doctor',side:'Hypoglycemia',salt:'insulin'},

    // Vitamins
    {id:'M10',name:'Becosules Z',gen:'B-Complex + Zinc',cat:'Vitamins',mfr:'Pfizer',mrp:35,price:29,off:17,stock:200,rat:4.5,rev:5634,phId:'P1',rx:false,icon:'💪',desc:'Multivitamin for daily nutrition.',dose:'1 capsule daily after meals',side:'None significant',salt:'multivitamin'},
    {id:'M11',name:'Supradyn Daily',gen:'Multivitamin + Minerals',cat:'Vitamins',mfr:'Bayer',mrp:45,price:38,off:16,stock:150,rat:4.6,rev:3421,phId:'P3',rx:false,icon:'💪',desc:'Complete daily multivitamin.',dose:'1 tablet daily',side:'Mild GI discomfort',salt:'multivitamin'},
    {id:'M12',name:'Shelcal 500',gen:'Calcium + Vitamin D3',cat:'Vitamins',mfr:'Torrent',mrp:175,price:148,off:15,stock:80,rat:4.4,rev:2987,phId:'P2',rx:false,icon:'🦴',desc:'Calcium supplement for bone health.',dose:'1 tablet twice daily',side:'Constipation',salt:'calcium'},
    {id:'M13',name:'Limcee 500',gen:'Vitamin C 500mg',cat:'Vitamins',mfr:'Abbott',mrp:25,price:21,off:16,stock:300,rat:4.3,rev:4523,phId:'P4',rx:false,icon:'🍊',desc:'Vitamin C for immunity boost.',dose:'1-2 tablets daily',side:'None',salt:'vitamin c'},
    {id:'M14',name:'Zincovit',gen:'Zinc + Multivitamins',cat:'Vitamins',mfr:'Apex Labs',mrp:110,price:92,off:16,stock:90,rat:4.4,rev:1890,phId:'P1',rx:false,icon:'💪',desc:'Comprehensive vitamin and mineral supplement.',dose:'1 tablet daily',side:'Metallic taste',salt:'multivitamin'},

    // Allergy
    {id:'M15',name:'Cetirizine 10mg',gen:'Cetirizine HCl',cat:'Allergy',mfr:'Cipla',mrp:18,price:14,off:22,stock:250,rat:4.4,rev:6754,phId:'P1',rx:false,icon:'🤧',desc:'Antihistamine for allergy relief.',dose:'1 tablet daily',side:'Drowsiness, dry mouth',salt:'cetirizine'},
    {id:'M16',name:'Allegra 120mg',gen:'Fexofenadine 120mg',cat:'Allergy',mfr:'Sanofi',mrp:180,price:152,off:16,stock:60,rat:4.5,rev:2341,phId:'P2',rx:false,icon:'🤧',desc:'Non-drowsy allergy relief.',dose:'1 tablet daily',side:'Headache, nausea (rare)',salt:'fexofenadine'},
    {id:'M17',name:'Montair LC',gen:'Montelukast + Levocetirizine',cat:'Allergy',mfr:'Cipla',mrp:195,price:165,off:15,stock:50,rat:4.6,rev:3456,phId:'P3',rx:true,icon:'🤧',desc:'For allergic rhinitis and asthma.',dose:'1 tablet at night',side:'Drowsiness, headache',salt:'montelukast'},
    {id:'M18',name:'Avil 25mg',gen:'Pheniramine Maleate',cat:'Allergy',mfr:'Sanofi',mrp:12,price:10,off:17,stock:180,rat:4.1,rev:1234,phId:'P4',rx:false,icon:'🤧',desc:'Fast allergy and cold symptom relief.',dose:'1 tablet 2-3 times daily',side:'Drowsiness',salt:'pheniramine'},

    // Skin Care
    {id:'M19',name:'Betnovate C',gen:'Betamethasone + Clioquinol',cat:'Skin Care',mfr:'GSK',mrp:68,price:56,off:18,stock:70,rat:4.3,rev:3214,phId:'P1',rx:true,icon:'🧴',desc:'For skin infections and inflammation.',dose:'Apply thin layer twice daily',side:'Skin thinning with prolonged use',salt:'betamethasone'},
    {id:'M20',name:'Panderm Plus',gen:'Clobetasol + Ofloxacin + Ornidazole',cat:'Skin Care',mfr:'Macleods',mrp:125,price:105,off:16,stock:45,rat:4.4,rev:1987,phId:'P2',rx:true,icon:'🧴',desc:'Triple action cream for fungal infections.',dose:'Apply twice daily',side:'Burning sensation',salt:'clobetasol'},
    {id:'M21',name:'Himalaya Neem Face Wash',gen:'Neem Extract',cat:'Skin Care',mfr:'Himalaya',mrp:175,price:149,off:15,stock:100,rat:4.5,rev:8765,phId:'P3',rx:false,icon:'🧴',desc:'Natural face wash for acne-prone skin.',dose:'Use twice daily',side:'None',salt:'neem'},
    {id:'M22',name:'Lacto Calamine',gen:'Calamine + Kaolin',cat:'Skin Care',mfr:'Piramal',mrp:135,price:115,off:15,stock:80,rat:4.6,rev:5432,phId:'P4',rx:false,icon:'🧴',desc:'Oil control and skin soothing lotion.',dose:'Apply as needed',side:'None',salt:'calamine'},

    // First Aid
    {id:'M23',name:'Betadine Solution',gen:'Povidone-Iodine 5%',cat:'First Aid',mfr:'Win Medicare',mrp:85,price:72,off:15,stock:120,rat:4.6,rev:4532,phId:'P1',rx:false,icon:'🩹',desc:'Antiseptic solution for wound care.',dose:'Apply directly on wound',side:'Skin irritation (rare)',salt:'povidone-iodine'},
    {id:'M24',name:'Dettol Antiseptic',gen:'Chloroxylenol 4.8%',cat:'First Aid',mfr:'Reckitt',mrp:95,price:82,off:14,stock:150,rat:4.5,rev:7654,phId:'P2',rx:false,icon:'🧪',desc:'Multi-use antiseptic liquid.',dose:'Dilute and apply',side:'None',salt:'chloroxylenol'},
    {id:'M25',name:'Band-Aid Flexible',gen:'Adhesive Bandage',cat:'First Aid',mfr:'J&J',mrp:45,price:39,off:13,stock:200,rat:4.4,rev:3421,phId:'P3',rx:false,icon:'🩹',desc:'Flexible fabric bandages for minor cuts.',dose:'Apply on clean wound',side:'None',salt:'bandage'},
    {id:'M26',name:'Soframycin Cream',gen:'Framycetin Sulphate',cat:'First Aid',mfr:'Sanofi',mrp:52,price:44,off:15,stock:90,rat:4.3,rev:2134,phId:'P1',rx:false,icon:'🩹',desc:'Antibiotic cream for skin infections.',dose:'Apply 2-3 times daily',side:'Mild burning',salt:'framycetin'},
    {id:'M27',name:'ORS (Electral)',gen:'Oral Rehydration Salts',cat:'First Aid',mfr:'FDC',mrp:22,price:18,off:18,stock:300,rat:4.5,rev:5678,phId:'P4',rx:false,icon:'🥤',desc:'Electrolyte replenisher for dehydration.',dose:'1 sachet in 1L water',side:'None',salt:'ors'},
    {id:'M29',name:'Digene Gel',gen:'Simethicone + Al Hydroxide',cat:'First Aid',mfr:'Abbott',mrp:75,price:64,off:15,stock:85,rat:4.2,rev:1987,phId:'P1',rx:false,icon:'🫧',desc:'Antacid gel for acidity and gas.',dose:'10ml after meals',side:'Constipation (rare)',salt:'antacid'},
    {id:'M30',name:'Glucon-D',gen:'Glucose + Vitamin C',cat:'Vitamins',mfr:'Zydus',mrp:95,price:82,off:14,stock:110,rat:4.3,rev:2345,phId:'P3',rx:false,icon:'⚡',desc:'Instant energy drink powder.',dose:'2 tbsp in water',side:'None',salt:'glucose'},
  ],

  deliveryPartners: [
    {id:'D1',name:'Ravi Kumar',phone:'9876600001',vehicle:'Bike',plate:'DL 01 AB 1234',loc:{lat:19.076,lng:72.877},status:'available',earnings:45680,deliveries:342,rating:4.7,avatar:'🏍️',createdAt:'2024-09-01'},
    {id:'D2',name:'Sunil Yadav',phone:'9876600002',vehicle:'Scooter',plate:'MH 02 CD 5678',loc:{lat:19.082,lng:72.881},status:'on_delivery',earnings:38920,deliveries:287,rating:4.5,avatar:'🛵',createdAt:'2024-10-15'},
    {id:'D3',name:'Manoj Tiwari',phone:'9876600003',vehicle:'Bike',plate:'KA 03 EF 9012',loc:{lat:12.971,lng:77.594},status:'available',earnings:52340,deliveries:412,rating:4.8,avatar:'🏍️',createdAt:'2024-07-20'},
    {id:'D4',name:'Ajay Verma',phone:'9876600004',vehicle:'Scooter',plate:'DL 04 GH 3456',loc:{lat:28.613,lng:77.209},status:'offline',earnings:28760,deliveries:198,rating:4.3,avatar:'🛵',createdAt:'2024-11-05'},
    {id:'D5',name:'Prakash Singh',phone:'9876600005',vehicle:'Bike',plate:'UP 05 IJ 7890',loc:{lat:28.535,lng:77.391},status:'available',earnings:61200,deliveries:489,rating:4.9,avatar:'🏍️',createdAt:'2024-06-01'},
  ],

  orders: [
    {id:'O1',uid:'U1',uName:'Rahul Sharma',phId:'P1',phName:'MedPlus',dId:'D1',dName:'Ravi Kumar',
     status:'delivered',items:[{mid:'M1',name:'Dolo 650',qty:2,price:28},{mid:'M10',name:'Becosules Z',qty:1,price:29}],
     subtotal:85,delFee:25,discount:10,total:100,payMethod:'UPI',payStatus:'paid',
     address:'42, Sector 15, Noida, UP 201301',hasRx:false,rxStatus:null,emergency:false,
     rating:5,review:'Fast delivery!',createdAt:'2025-03-28T10:30:00Z',updatedAt:'2025-03-28T11:15:00Z'},
    {id:'O2',uid:'U2',uName:'Priya Patel',phId:'P2',phName:'Apollo Pharmacy',dId:'D3',dName:'Manoj Tiwari',
     status:'out_for_delivery',items:[{mid:'M6',name:'Glycomet 500',qty:1,price:38},{mid:'M12',name:'Shelcal 500',qty:1,price:148}],
     subtotal:186,delFee:30,discount:20,total:196,payMethod:'COD',payStatus:'pending',
     address:'18, MG Road, Bengaluru 560001',hasRx:true,rxStatus:'verified',emergency:false,
     rating:null,review:null,createdAt:'2025-04-14T08:00:00Z',updatedAt:'2025-04-14T09:30:00Z'},
    {id:'O3',uid:'U1',uName:'Rahul Sharma',phId:'P3',phName:'NetMeds Store',dId:null,dName:null,
     status:'preparing',items:[{mid:'M15',name:'Cetirizine 10mg',qty:3,price:14},{mid:'M23',name:'Betadine Solution',qty:1,price:72}],
     subtotal:114,delFee:25,discount:0,total:139,payMethod:'UPI',payStatus:'paid',
     address:'42, Sector 15, Noida 201301',hasRx:false,rxStatus:null,emergency:true,
     rating:null,review:null,createdAt:'2025-04-14T09:15:00Z',updatedAt:'2025-04-14T09:20:00Z'},
    {id:'O4',uid:'U3',uName:'Amit Kumar',phId:'P1',phName:'MedPlus',dId:null,dName:null,
     status:'pending',items:[{mid:'M19',name:'Betnovate C',qty:1,price:56},{mid:'M26',name:'Soframycin Cream',qty:2,price:44}],
     subtotal:144,delFee:25,discount:15,total:154,payMethod:'COD',payStatus:'pending',
     address:'101, Lajpat Nagar, New Delhi 110024',hasRx:true,rxStatus:'pending',emergency:false,
     rating:null,review:null,createdAt:'2025-04-14T09:45:00Z',updatedAt:'2025-04-14T09:45:00Z'},
    {id:'O5',uid:'U2',uName:'Priya Patel',phId:'P4',phName:'1mg Health Store',dId:'D2',dName:'Sunil Yadav',
     status:'delivered',items:[{mid:'M13',name:'Limcee 500',qty:2,price:21},{mid:'M11',name:'Supradyn Daily',qty:1,price:38}],
     subtotal:80,delFee:0,discount:10,total:70,payMethod:'UPI',payStatus:'paid',
     address:'18, MG Road, Bengaluru 560001',hasRx:false,rxStatus:null,emergency:false,
     rating:4,review:'Good service.',createdAt:'2025-03-20T14:00:00Z',updatedAt:'2025-03-20T15:30:00Z'},
  ],

  coupons: [
    {id:'C1',code:'FIRST50',desc:'50% off on your first order',type:'pct',val:50,maxOff:200,minOrd:100,limit:1,used:456,active:true,exp:'2025-06-30'},
    {id:'C2',code:'HEALTH20',desc:'Flat 20% off on all medicines',type:'pct',val:20,maxOff:150,minOrd:200,limit:3,used:1234,active:true,exp:'2025-05-31'},
    {id:'C3',code:'FREEDEL',desc:'Free delivery on orders above ₹300',type:'flat',val:30,maxOff:30,minOrd:300,limit:5,used:2345,active:true,exp:'2025-12-31'},
    {id:'C4',code:'SUMMER25',desc:'Summer sale - 25% off',type:'pct',val:25,maxOff:300,minOrd:500,limit:2,used:876,active:false,exp:'2025-04-30'},
  ],

  categories: [
    {id:'C01',name:'Pain Relief',icon:'💊',color:'#EF4444'},
    {id:'C02',name:'Diabetes',icon:'🩸',color:'#3B82F6'},
    {id:'C03',name:'Vitamins',icon:'💪',color:'#F59E0B'},
    {id:'C04',name:'Allergy',icon:'🤧',color:'#8B5CF6'},
    {id:'C05',name:'Skin Care',icon:'🧴',color:'#EC4899'},
    {id:'C06',name:'First Aid',icon:'🩹',color:'#22C55E'},
  ],

  analytics: {
    totalOrders:5883,totalRevenue:2456780,totalUsers:12450,totalPharmacies:4,totalDel:5,
    monthly:[320,410,380,520,610,580,720,680,750,810,890,960],
    monthRev:[134e3,172e3,159e3,218e3,256e3,243e3,302e3,285e3,315e3,340e3,374e3,403e3],
    topMeds:['Dolo 650','Crocin Advance','Cetirizine 10mg','Becosules Z','Limcee 500'],
    byStatus:{pending:12,preparing:8,ready:5,picked:3,out_for_delivery:7,delivered:5843,cancelled:5}
  },

  // OCR simulation — maps prescription text → medicine IDs
  ocrMap: {
    'dolo': {exact:'M1', fuzzy:['M3','M4'], alt:['M2']},
    'crocin': {exact:'M3', fuzzy:['M1'], alt:['M4']},
    'combiflam': {exact:'M2', fuzzy:['M1','M5'], alt:['M28']},
    'paracetamol': {exact:'M1', fuzzy:['M3','M4'], alt:['M2']},
    'glycomet': {exact:'M6', fuzzy:['M8'], alt:['M7']},
    'metformin': {exact:'M6', fuzzy:['M8'], alt:['M7']},
    'cetirizine': {exact:'M15', fuzzy:['M16','M18'], alt:['M17']},
    'allegra': {exact:'M16', fuzzy:['M15'], alt:['M17']},
    'montair': {exact:'M17', fuzzy:['M15','M16'], alt:['M18']},
    'becosules': {exact:'M10', fuzzy:['M14','M11'], alt:['M13']},
    'supradyn': {exact:'M11', fuzzy:['M10','M14'], alt:['M13']},
    'shelcal': {exact:'M12', fuzzy:[], alt:['M13']},
    'limcee': {exact:'M13', fuzzy:[], alt:['M10','M11']},
    'betadine': {exact:'M23', fuzzy:['M24'], alt:['M26']},
    'voveran': {exact:'M5', fuzzy:['M2','M28'], alt:['M1']},
    'betnovate': {exact:'M19', fuzzy:['M20'], alt:['M22']},
    'panderm': {exact:'M20', fuzzy:['M19'], alt:['M22']},
    'soframycin': {exact:'M26', fuzzy:['M23'], alt:['M24']},
    'electral': {exact:'M27', fuzzy:[], alt:[]},
    'ors': {exact:'M27', fuzzy:[], alt:[]},
    'digene': {exact:'M29', fuzzy:[], alt:[]},
    'volini': {exact:'M28', fuzzy:['M5'], alt:['M2']},
    'saridon': {exact:'M4', fuzzy:['M1','M3'], alt:['M2']},
    'amaryl': {exact:'M7', fuzzy:['M6'], alt:['M8']},
    'janumet': {exact:'M8', fuzzy:['M6'], alt:['M7']},
    'insulin': {exact:'M9', fuzzy:[], alt:['M6','M7']},
    'zincovit': {exact:'M14', fuzzy:['M10','M11'], alt:['M13']},
    'avil': {exact:'M18', fuzzy:['M15'], alt:['M16']},
    'band-aid': {exact:'M25', fuzzy:[], alt:['M23','M24']},
    'dettol': {exact:'M24', fuzzy:['M23'], alt:['M25']},
    'neem': {exact:'M21', fuzzy:[], alt:['M22']},
    'calamine': {exact:'M22', fuzzy:[], alt:['M21']},
    'glucon-d': {exact:'M30', fuzzy:['M13'], alt:['M27']},
  },

  searchHistory: ['Dolo 650', 'Vitamin C', 'Diabetes medicine', 'Crocin'],
};

// ---- Database Engine ----
class DormedsDB {
  constructor() {
    this._init();
  }

  _init() {
    if (!localStorage.getItem(DB_PREFIX + 'ready')) {
      Object.keys(SEED).forEach(k => {
        if (k !== 'ocrMap' && k !== 'searchHistory')
          localStorage.setItem(DB_PREFIX + k, JSON.stringify(SEED[k]));
      });
      localStorage.setItem(DB_PREFIX + 'cart', '[]');
      localStorage.setItem(DB_PREFIX + 'searchHistory', JSON.stringify(SEED.searchHistory));
      localStorage.setItem(DB_PREFIX + 'prescriptions', '[]');
      localStorage.setItem(DB_PREFIX + 'ready', '1');
    }
  }

  get(col) { try { return JSON.parse(localStorage.getItem(DB_PREFIX + col) || '[]'); } catch { return []; } }
  set(col, data) { localStorage.setItem(DB_PREFIX + col, JSON.stringify(data)); }
  getOne(col, id) { return this.get(col).find(x => x.id === id) || null; }

  add(col, item) { const a = this.get(col); a.push(item); this.set(col, a); return item; }
  update(col, id, upd) {
    const a = this.get(col); const i = a.findIndex(x => x.id === id);
    if (i === -1) return null;
    a[i] = { ...a[i], ...upd }; this.set(col, a); return a[i];
  }
  remove(col, id) { this.set(col, this.get(col).filter(x => x.id !== id)); }
  genId(pfx) { return pfx + Date.now().toString(36).toUpperCase(); }
  getObj(col) { try { return JSON.parse(localStorage.getItem(DB_PREFIX + col) || '{}'); } catch { return {}; } }
  setObj(col, data) { localStorage.setItem(DB_PREFIX + col, JSON.stringify(data)); }

  // Fuzzy search with synonym support
  search(query) {
    if (!query || query.length < 2) return [];
    const q = query.toLowerCase().trim();
    const meds = this.get('medicines');
    const results = [];
    const seen = new Set();

    // 1. Exact name / generic match
    meds.forEach(m => {
      if (m.name.toLowerCase().includes(q) || m.gen.toLowerCase().includes(q)) {
        if (!seen.has(m.id)) { results.push({...m, matchType:'exact'}); seen.add(m.id); }
      }
    });

    // 2. Description match
    meds.forEach(m => {
      if (m.desc.toLowerCase().includes(q)) {
        if (!seen.has(m.id)) { results.push({...m, matchType:'description'}); seen.add(m.id); }
      }
    });

    // 3. Category match
    meds.forEach(m => {
      if (m.cat.toLowerCase().includes(q)) {
        if (!seen.has(m.id)) { results.push({...m, matchType:'category'}); seen.add(m.id); }
      }
    });

    // 4. Synonym / symptom match — match synonym key AND synonym values to medicine names
    Object.entries(SYNONYMS).forEach(([key, vals]) => {
      const keyMatch = key.includes(q) || q.includes(key);
      const valMatch = vals.some(v => v.includes(q) || q.includes(v));
      if (keyMatch || valMatch) {
        // Collect all brand names from the synonym values
        const brandNames = vals.map(v => v.toLowerCase());
        meds.forEach(m => {
          const mName = m.name.toLowerCase();
          const mSalt = (m.salt || '').toLowerCase();
          const matchesBrand = brandNames.some(b => mName.includes(b) || b.includes(mName.split(' ')[0]));
          const matchesSalt = mSalt === key || mSalt.includes(key) || key.includes(mSalt);
          if (matchesBrand || matchesSalt) {
            if (!seen.has(m.id)) { results.push({...m, matchType:'synonym'}); seen.add(m.id); }
          }
        });
      }
    });

    // 5. Manufacturer match
    meds.forEach(m => {
      if (m.mfr.toLowerCase().includes(q)) {
        if (!seen.has(m.id)) { results.push({...m, matchType:'manufacturer'}); seen.add(m.id); }
      }
    });

    // 6. Typo tolerance (Levenshtein-lite)
    if (results.length < 3) {
      meds.forEach(m => {
        if (!seen.has(m.id) && this._fuzzyMatch(q, m.name.toLowerCase())) {
          results.push({...m, matchType:'fuzzy'}); seen.add(m.id);
        }
      });
    }

    // Sort: exact first, then available + price
    return results.sort((a, b) => {
      const rank = {exact:0, description:1, category:2, synonym:3, manufacturer:4, fuzzy:5};
      const ra = rank[a.matchType] ?? 9, rb = rank[b.matchType] ?? 9;
      if (ra !== rb) return ra - rb;
      if (a.stock > 0 && b.stock <= 0) return -1;
      if (b.stock > 0 && a.stock <= 0) return 1;
      return a.price - b.price;
    });
  }

  _fuzzyMatch(q, target) {
    if (q.length < 3) return false;
    let matches = 0;
    for (let i = 0; i < q.length; i++) {
      if (target.includes(q[i])) matches++;
    }
    return matches / q.length > 0.7;
  }

  // OCR: extract medicine names from text
  ocrProcess(text) {
    const words = text.toLowerCase().replace(/[^a-z0-9\s-]/g, '').split(/\s+/).filter(w => w.length > 2);
    const results = [];
    const seen = new Set();

    words.forEach(word => {
      // Check OCR map
      Object.entries(SEED.ocrMap).forEach(([key, val]) => {
        if (word.includes(key) || key.includes(word)) {
          if (!seen.has(val.exact)) {
            const med = this.getOne('medicines', val.exact);
            if (med) {
              results.push({
                extracted: word,
                match: med,
                type: 'exact',
                fuzzy: val.fuzzy.map(id => this.getOne('medicines', id)).filter(Boolean),
                alternatives: val.alt.map(id => this.getOne('medicines', id)).filter(Boolean),
              });
              seen.add(val.exact);
            }
          }
        }
      });
    });

    return results;
  }

  // Get autocomplete suggestions
  autocomplete(q) {
    if (!q || q.length < 1) return [];
    const lower = q.toLowerCase();
    const meds = this.get('medicines');
    const suggestions = [];
    const seen = new Set();

    // Medicines
    meds.forEach(m => {
      if ((m.name.toLowerCase().startsWith(lower) || m.gen.toLowerCase().includes(lower)) && !seen.has(m.name)) {
        suggestions.push({ text: m.name, sub: m.gen, icon: m.icon, type: 'medicine', id: m.id });
        seen.add(m.name);
      }
    });

    // Categories
    SEED.categories.forEach(c => {
      if (c.name.toLowerCase().includes(lower) && !seen.has(c.name)) {
        suggestions.push({ text: c.name, sub: 'Category', icon: c.icon, type: 'category' });
        seen.add(c.name);
      }
    });

    // Symptoms/Synonyms
    Object.keys(SYNONYMS).forEach(key => {
      if (key.includes(lower) && !seen.has(key)) {
        suggestions.push({ text: key.charAt(0).toUpperCase() + key.slice(1), sub: 'Symptom / Salt', icon: '🔍', type: 'symptom' });
        seen.add(key);
      }
    });

    return suggestions.slice(0, 8);
  }

  // Order state machine — validates transitions
  canTransition(current, next) {
    const valid = {
      'pending': ['accepted', 'cancelled'],
      'accepted': ['preparing', 'cancelled'],
      'preparing': ['packed', 'cancelled'],
      'packed': ['out_for_delivery'],
      'out_for_delivery': ['delivered'],
      'delivered': [],
      'cancelled': [],
    };
    return (valid[current] || []).includes(next);
  }

  // Stock validation before checkout
  validateStock(cartItems) {
    const meds = this.get('medicines');
    const errors = [];
    cartItems.forEach(ci => {
      const m = meds.find(x => x.id === ci.mid);
      if (!m) errors.push({ mid: ci.mid, name: ci.name, issue: 'not_found' });
      else if (m.stock < ci.qty) errors.push({ mid: ci.mid, name: ci.name, issue: 'insufficient', available: m.stock });
    });
    return errors;
  }

  // Lock stock for an order
  lockStock(items) {
    items.forEach(ci => {
      const meds = this.get('medicines');
      const i = meds.findIndex(m => m.id === ci.mid);
      if (i !== -1) { meds[i].stock -= ci.qty; this.set('medicines', meds); }
    });
  }

  // Assign nearest available pharmacy with stock
  findPharmacy(cartItems) {
    const pharmacies = this.get('pharmacies').filter(p => p.status === 'approved' && p.active);
    // In production, sort by distance. For demo, just return first available.
    return pharmacies[0] || null;
  }

  // Assign nearest available delivery partner
  findDeliveryPartner() {
    const partners = this.get('deliveryPartners').filter(d => d.status === 'available');
    return partners[0] || null;
  }

  reset() {
    Object.keys(localStorage).forEach(k => { if (k.startsWith(DB_PREFIX)) localStorage.removeItem(k); });
    this._init();
  }

  // Force clear ALL dormeds data including old versions
  static forceClean() {
    const toRemove = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && (key.startsWith('dmed_') || key.startsWith('dormeds_'))) toRemove.push(key);
    }
    toRemove.forEach(k => localStorage.removeItem(k));
  }
}
