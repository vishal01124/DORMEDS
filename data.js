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
     deliveryOtp:'7823',otpVerified:true,pickupChecklist:[true,true,true,true],
     rating:5,review:'Fast delivery!',createdAt:'2025-03-28T10:30:00Z',updatedAt:'2025-03-28T11:15:00Z'},
    {id:'O2',uid:'U2',uName:'Priya Patel',phId:'P2',phName:'Apollo Pharmacy',dId:'D3',dName:'Manoj Tiwari',
     status:'out_for_delivery',items:[{mid:'M6',name:'Glycomet 500',qty:1,price:38},{mid:'M12',name:'Shelcal 500',qty:1,price:148}],
     subtotal:186,delFee:30,discount:20,total:196,payMethod:'COD',payStatus:'pending',
     address:'18, MG Road, Bengaluru 560001',hasRx:true,rxStatus:'verified',emergency:false,
     deliveryOtp:'4521',otpVerified:false,pickupChecklist:[true,true,true,true],
     rating:null,review:null,createdAt:'2025-04-14T08:00:00Z',updatedAt:'2025-04-14T09:30:00Z'},
    {id:'O3',uid:'U1',uName:'Rahul Sharma',phId:'P3',phName:'NetMeds Store',dId:null,dName:null,
     status:'preparing',items:[{mid:'M15',name:'Cetirizine 10mg',qty:3,price:14},{mid:'M23',name:'Betadine Solution',qty:1,price:72}],
     subtotal:114,delFee:25,discount:0,total:139,payMethod:'UPI',payStatus:'paid',
     address:'42, Sector 15, Noida 201301',hasRx:false,rxStatus:null,emergency:true,
     deliveryOtp:'2967',otpVerified:false,pickupChecklist:[false,false,false,false],
     rating:null,review:null,createdAt:'2025-04-14T09:15:00Z',updatedAt:'2025-04-14T09:20:00Z'},
    {id:'O4',uid:'U3',uName:'Amit Kumar',phId:'P1',phName:'MedPlus',dId:null,dName:null,
     status:'pending',items:[{mid:'M19',name:'Betnovate C',qty:1,price:56},{mid:'M26',name:'Soframycin Cream',qty:2,price:44}],
     subtotal:144,delFee:25,discount:15,total:154,payMethod:'COD',payStatus:'pending',
     address:'101, Lajpat Nagar, New Delhi 110024',hasRx:true,rxStatus:'pending_review',emergency:false,
     deliveryOtp:null,otpVerified:false,pickupChecklist:[false,false,false,false],
     rating:null,review:null,createdAt:'2025-04-14T09:45:00Z',updatedAt:'2025-04-14T09:45:00Z'},
    {id:'O5',uid:'U2',uName:'Priya Patel',phId:'P4',phName:'1mg Health Store',dId:'D2',dName:'Sunil Yadav',
     status:'delivered',items:[{mid:'M13',name:'Limcee 500',qty:2,price:21},{mid:'M11',name:'Supradyn Daily',qty:1,price:38}],
     subtotal:80,delFee:0,discount:10,total:70,payMethod:'UPI',payStatus:'paid',
     address:'18, MG Road, Bengaluru 560001',hasRx:false,rxStatus:null,emergency:false,
     deliveryOtp:'9134',otpVerified:true,pickupChecklist:[true,true,true,true],
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

  // ---- DORMEDS 3.0 NEW TABLES ----

  // ---- Admin Users (role-based access) ----
  admin_users: [
    { id:'SA1', username:'superadmin', name:'Vishal Sharma (Super Admin)',
      // password: Admin@1234  (stored as base64 of SHA-like string for demo)
      password_b64: 'QWRtaW5AMTIzNA==',
      role:'super_admin', active:true, email:'superadmin@dormeds.com',
      createdAt:'2024-01-01T00:00:00Z', lastLogin:null },
    { id:'ADM1', username:'admin1', name:'Kavya Reddy',
      password_b64: 'YWRtaW4xMjM=',
      role:'admin', active:true, email:'kavya@dormeds.com',
      createdAt:'2024-03-01T00:00:00Z', lastLogin:null },
    { id:'OPS1', username:'ops1', name:'Rajan Mehta',
      password_b64: 'b3BzMTIz',
      role:'ops', active:true, email:'rajan@dormeds.com',
      createdAt:'2024-06-01T00:00:00Z', lastLogin:null },
  ],

  // ---- Delivery Checklists ----
  delivery_checklists: [
    { id:'DC1', orderId:'O1', deliveryPartnerId:'D1',
      pickedConfirmed:true, sealedConfirmed:true, addressConfirmed:true,
      counsellingRequired:false, completedAt:'2025-03-28T10:45:00Z' },
    { id:'DC2', orderId:'O5', deliveryPartnerId:'D2',
      pickedConfirmed:true, sealedConfirmed:true, addressConfirmed:true,
      counsellingRequired:false, completedAt:'2025-03-20T14:15:00Z' },
  ],

  // ---- Counselling Requests (auto-created from delivery checklist) ----
  counselling_requests: [
    { id:'CR1', orderId:'O1', patientId:'U1', patientName:'Rahul Sharma',
      status:'counselling_completed', notes:'Patient counselled about dosage of Dolo 650.',
      counsellorId:'ADM-C1', counsellorName:'Dr. Prathap Rao',
      createdAt:'2025-03-28T11:00:00Z', completedAt:'2025-03-28T11:30:00Z' },
  ],

  // ---- Physical Verification Records ----
  physical_verifications: [
    { id:'PV1', orderId:'O1', status:'verified',
      verifiedBy:'Dr. Suresh Reddy', verifierRole:'pharmacy',
      notes:'Prescription verified in person.', timestamp:'2025-03-28T11:10:00Z' },
  ],

  // ---- Delivery OTPs ----
  delivery_otps: [
    { orderId:'O2', otp:'4521', verified:false, generatedAt:'2025-04-14T09:30:00Z' },
  ],

  // ---- BPT Exercise Library ----
  exercise_library: [
    // Back Pain
    { id:'EX1', name:'Cat-Cow Stretch', bodyPart:'Lower Back', painType:'Back Pain', difficulty:'Easy',
      duration:'5 min', reps:'10 reps × 3 sets', icon:'🐱',
      instructions:'Start on all fours. Arch your back upward (cat), then dip it downward (cow). Breathe deeply. Repeat slowly.' },
    { id:'EX2', name:'McKenzie Extension', bodyPart:'Lower Back', painType:'Back Pain', difficulty:'Medium',
      duration:'8 min', reps:'10 reps × 2 sets', icon:'🧘',
      instructions:'Lie face down. Place hands under shoulders. Slowly push upper body up, keeping hips on floor. Hold 2 sec.' },
    { id:'EX3', name:'Pelvic Tilt', bodyPart:'Lower Back', painType:'Back Pain', difficulty:'Easy',
      duration:'5 min', reps:'15 reps × 3 sets', icon:'🦵',
      instructions:'Lie on back, knees bent. Flatten lower back against floor by tightening abs. Hold 5 sec, release.' },
    { id:'EX4', name:'Bird Dog', bodyPart:'Core & Back', painType:'Back Pain', difficulty:'Medium',
      duration:'10 min', reps:'8 reps each side × 3 sets', icon:'🐦',
      instructions:'On all fours, extend opposite arm and leg simultaneously. Hold 3 sec. Keep back flat.' },
    // Knee Pain
    { id:'EX5', name:'Quad Set', bodyPart:'Knee', painType:'Knee Pain', difficulty:'Easy',
      duration:'5 min', reps:'15 reps × 3 sets', icon:'🦵',
      instructions:'Sit with leg straight. Tighten quad muscle, press back of knee to floor. Hold 5 sec, release.' },
    { id:'EX6', name:'Straight Leg Raise', bodyPart:'Knee', painType:'Knee Pain', difficulty:'Easy',
      duration:'8 min', reps:'12 reps × 3 sets', icon:'🏋️',
      instructions:'Lie on back. Tighten quad, lift straightened leg to 45°. Hold 2 sec, lower slowly.' },
    { id:'EX7', name:'Wall Squat (Slide)', bodyPart:'Knee & Quad', painType:'Knee Pain', difficulty:'Hard',
      duration:'10 min', reps:'10 reps × 3 sets', icon:'🧱',
      instructions:'Stand against wall. Slide down until thighs are parallel. Hold 10 sec. Do not go past 90°.' },
    { id:'EX8', name:'Step-Up Exercise', bodyPart:'Knee', painType:'Knee Pain', difficulty:'Medium',
      duration:'10 min', reps:'10 each side × 3 sets', icon:'👣',
      instructions:'Step up onto a low step with affected leg, bring other leg up, step back down. Controlled movement.' },
    // Neck Pain
    { id:'EX9', name:'Chin Tuck', bodyPart:'Neck', painType:'Neck Pain', difficulty:'Easy',
      duration:'5 min', reps:'10 reps × 3 sets', icon:'🎯',
      instructions:'Sit upright. Gently pull chin straight back (double-chin position). Hold 5 sec. Repeat. Great for posture.' },
    { id:'EX10', name:'Neck Rotation', bodyPart:'Neck', painType:'Neck Pain', difficulty:'Easy',
      duration:'5 min', reps:'10 each direction × 2 sets', icon:'🔄',
      instructions:'Sit tall. Slowly turn head to right, hold 5 sec. Return to center, then left. Do not force rotation.' },
    { id:'EX11', name:'Shoulder Rolls', bodyPart:'Neck & Shoulders', painType:'Neck Pain', difficulty:'Easy',
      duration:'3 min', reps:'10 forward, 10 backward × 2 sets', icon:'🌀',
      instructions:'Sit or stand. Roll shoulders forward in large circles, then backward. Keep movements slow and controlled.' },
    { id:'EX12', name:'Scalene Stretch', bodyPart:'Neck', painType:'Neck Pain', difficulty:'Medium',
      duration:'5 min', reps:'Hold 30 sec each side × 3 sets', icon:'🙆',
      instructions:'Tilt head to one side while keeping shoulders down. Use hand on top of head for gentle overpressure. Hold.' },
    // Shoulder Pain
    { id:'EX13', name:'Pendulum Swing', bodyPart:'Shoulder', painType:'Shoulder Pain', difficulty:'Easy',
      duration:'5 min', reps:'30 sec clockwise + 30 sec counter × 3 sets', icon:'🔔',
      instructions:'Lean forward, let affected arm hang freely. Swing arm in small circles using body momentum only.' },
    { id:'EX14', name:'Wall Slides', bodyPart:'Shoulder', painType:'Shoulder Pain', difficulty:'Medium',
      duration:'8 min', reps:'12 reps × 3 sets', icon:'🏔️',
      instructions:'Stand facing wall, place forearms on wall. Slide arms upward (like a Y shape). Keep core tight.' },
    { id:'EX15', name:'External Rotation', bodyPart:'Shoulder', painType:'Shoulder Pain', difficulty:'Medium',
      duration:'8 min', reps:'15 reps × 3 sets', icon:'💪',
      instructions:'Elbow bent at 90°, arm tucked to side. Rotate forearm outward against resistance band. Controlled.' },
    // Hip Pain
    { id:'EX16', name:'Clamshell', bodyPart:'Hip', painType:'Hip Pain', difficulty:'Easy',
      duration:'8 min', reps:'15 reps each side × 3 sets', icon:'🦀',
      instructions:'Lie on side, knees bent. Keep feet together and rotate top knee upward like a clamshell opening.' },
    { id:'EX17', name:'Glute Bridge', bodyPart:'Hip & Glutes', painType:'Hip Pain', difficulty:'Easy',
      duration:'8 min', reps:'15 reps × 3 sets', icon:'🌉',
      instructions:'Lie on back, knees bent. Push through heels to lift hips toward ceiling. Squeeze glutes at top. Hold 2 sec.' },
    { id:'EX18', name:'Hip Flexor Stretch', bodyPart:'Hip', painType:'Hip Pain', difficulty:'Medium',
      duration:'6 min', reps:'Hold 30 sec each side × 3 sets', icon:'🧎',
      instructions:'Kneel on one knee (lunge position). Push hips forward gently until you feel a stretch in front of hip.' },
    // General / Posture
    { id:'EX19', name:'Thoracic Extension', bodyPart:'Upper Back', painType:'Posture', difficulty:'Easy',
      duration:'5 min', reps:'10 reps × 2 sets', icon:'🪑',
      instructions:'Sit on chair edge. Place hands behind head. Lean back gently over chair back. Open chest upward.' },
    { id:'EX20', name:'Diaphragmatic Breathing', bodyPart:'Core', painType:'General', difficulty:'Easy',
      duration:'5 min', reps:'10 slow breaths × 3 sets', icon:'🌬️',
      instructions:'Lie down, one hand on chest, one on belly. Breathe so only belly rises. Inhale 4 sec, exhale 6 sec.' },
  ],

  // ---- Patient Exercise Plans ----
  patient_exercise_plans: [
    { id:'PEP1', patientId:'U1', patientName:'Rahul Sharma',
      title:'Lower Back Recovery Plan', exercises:['EX1','EX2','EX3','EX4'],
      frequency:'Daily — 20 min', notes:'Start with EX1, progress to EX2 after 1 week.',
      createdBy:'ADM-C1', createdByName:'Dr. Prathap Rao',
      status:'active', createdAt:'2025-04-14T10:30:00Z' },
  ],

  subscription_plans: [
    { id:'SP1', name:'Basic', price:199, period:'monthly', color:'#3B82F6',
      benefits:['Free delivery on all orders','10% off all medicines','Priority order processing','Smart refill reminders'],
      icon:'💊', popular:false, createdAt:'2025-01-01' },
    { id:'SP2', name:'Premium', price:499, period:'monthly', color:'#8B5CF6',
      benefits:['Everything in Basic','Priority lab test booking','Patient counsellor access','Exclusive health reports','15% off all services'],
      icon:'⭐', popular:true, createdAt:'2025-01-01' },
  ],

  subscriptions: [
    { id:'SUB1', userId:'U1', planId:'SP2', planName:'Premium', status:'active',
      startDate:'2025-04-01', endDate:'2025-05-01', autoRenew:true,
      bptCredits:2, bptUsed:0, payMethod:'UPI', amount:499,
      createdAt:'2025-04-01T10:00:00Z' },
    { id:'SUB2', userId:'U2', planId:'SP1', planName:'Basic', status:'active',
      startDate:'2025-04-10', endDate:'2025-05-10', autoRenew:true,
      bptCredits:0, bptUsed:0, payMethod:'UPI', amount:199,
      createdAt:'2025-04-10T08:00:00Z' },
  ],

  bpt_sessions: [
    { id:'BS1', day:'Monday', slots:['09:00','10:00','11:00','14:00','15:00','16:00'], therapist:'Dr. Meera Joshi', exp:'8 yrs', rating:4.8 },
    { id:'BS2', day:'Tuesday', slots:['09:00','10:00','11:00','14:00','15:00'], therapist:'Dr. Arjun Nair', exp:'5 yrs', rating:4.6 },
    { id:'BS3', day:'Wednesday', slots:['10:00','11:00','14:00','16:00'], therapist:'Dr. Meera Joshi', exp:'8 yrs', rating:4.8 },
    { id:'BS4', day:'Thursday', slots:['09:00','11:00','14:00','15:00','16:00'], therapist:'Dr. Arjun Nair', exp:'5 yrs', rating:4.6 },
    { id:'BS5', day:'Friday', slots:['09:00','10:00','14:00','15:00'], therapist:'Dr. Meera Joshi', exp:'8 yrs', rating:4.8 },
    { id:'BS6', day:'Saturday', slots:['09:00','10:00','11:00'], therapist:'Dr. Arjun Nair', exp:'5 yrs', rating:4.6 },
  ],

  bpt_bookings: [
    { id:'BB1', userId:'U1', day:'Monday', slot:'10:00', visitType:'home',
      therapist:'Dr. Meera Joshi', condition:'Lower back pain', price:800, status:'confirmed',
      address:'42, Sector 15, Noida, UP 201301', usedCredit:true,
      createdAt:'2025-04-12T09:00:00Z', sessionDate:'2025-04-21' },
  ],

  lab_tests: [
    { id:'LT1', name:'Complete Blood Count (CBC)', category:'Blood Test', price:350, homeCollection:true, reportTime:'24 hrs', icon:'🩸' },
    { id:'LT2', name:'HbA1c (Diabetes Test)', category:'Blood Test', price:550, homeCollection:true, reportTime:'24 hrs', icon:'🩸' },
    { id:'LT3', name:'Lipid Profile', category:'Blood Test', price:650, homeCollection:true, reportTime:'24 hrs', icon:'🩸' },
    { id:'LT4', name:'Thyroid Function Test (TFT)', category:'Hormone Test', price:750, homeCollection:true, reportTime:'48 hrs', icon:'🦋' },
    { id:'LT5', name:'Urine Routine Examination', category:'Urine Test', price:200, homeCollection:false, reportTime:'12 hrs', icon:'🧪' },
    { id:'LT6', name:'Chest X-Ray', category:'Radiology', price:400, homeCollection:false, reportTime:'2 hrs', icon:'🫁' },
    { id:'LT7', name:'Vitamin D Test', category:'Blood Test', price:1200, homeCollection:true, reportTime:'48 hrs', icon:'☀️' },
    { id:'LT8', name:'Liver Function Test (LFT)', category:'Blood Test', price:850, homeCollection:true, reportTime:'24 hrs', icon:'🫁' },
  ],

  lab_bookings: [
    { id:'LB1', userId:'U2', testId:'LT2', testName:'HbA1c (Diabetes Test)', homeCollection:true,
      slot:'08:00 AM', bookingDate:'2025-04-16', price:600, status:'confirmed',
      address:'18, MG Road, Bengaluru 560001', reportUrl:null,
      createdAt:'2025-04-14T11:00:00Z' },
  ],

  support_tickets: [
    { id:'TK1', userId:'U1', userName:'Rahul Sharma', orderId:'O3', subject:'Order delayed',
      description:'My emergency order O3 has been in preparing status for too long.',
      priority:'high', status:'open', agentId:null, agentName:null,
      messages:[
        {from:'user',text:'My order is stuck in preparing state for 2 hours. Please help!',time:'2025-04-14T11:00:00Z'},
      ],
      createdAt:'2025-04-14T11:00:00Z', updatedAt:'2025-04-14T11:00:00Z' },
    { id:'TK2', userId:'U2', userName:'Priya Patel', orderId:'O2', subject:'Wrong medicine delivered',
      description:'Received different brand than ordered.',
      priority:'medium', status:'in_progress', agentId:'ADM-S1', agentName:'Support Agent Kavya',
      messages:[
        {from:'user',text:'Wrong brand delivered. I ordered Shelcal but got a different calcium tablet.',time:'2025-04-13T16:00:00Z'},
        {from:'agent',text:'We apologize for the inconvenience. Can you share a photo of the delivered product?',time:'2025-04-13T16:30:00Z'},
      ],
      createdAt:'2025-04-13T16:00:00Z', updatedAt:'2025-04-13T16:30:00Z' },
  ],

  admin_roles: [
    { id:'ADM-O1', name:'Vishal Sharma', role:'owner', phone:'9999999999', avatar:'VS',
      permissions:['all'], createdAt:'2024-01-01' },
    { id:'ADM-S1', name:'Kavya Reddy', role:'support', phone:'9999999998', avatar:'KR',
      permissions:['tickets','orders','users'], createdAt:'2024-03-01' },
    { id:'ADM-C1', name:'Dr. Prathap Rao', role:'counsellor', phone:'9999999997', avatar:'PR',
      permissions:['patients','logs','schedule'], createdAt:'2024-03-01' },
  ],

  counselling_logs: [
    { id:'CL1', counsellorId:'ADM-C1', counsellorName:'Dr. Prathap Rao',
      patientId:'U1', patientName:'Rahul Sharma', type:'follow_up',
      notes:'Patient reports persisting lower back pain. Recommended BPT sessions 3x/week. Suggested Vitamin D test.',
      recommendations:['BPT Home Visit','Vitamin D Test','Reduce screen time'],
      nextFollowup:'2025-04-28', createdAt:'2025-04-14T10:00:00Z' },
  ],

  // ---- Drug Interactions (pairs that interact) ----
  drug_interactions: [
    { id:'DI1', drug1:'M1', drug2:'M5', drug1Name:'Dolo 650', drug2Name:'Voveran SR 100',
      severity:'moderate', message:'Combining Paracetamol with Diclofenac increases risk of GI bleeding. Use with caution.' },
    { id:'DI2', drug1:'M2', drug2:'M5', drug1Name:'Combiflam', drug2Name:'Voveran SR 100',
      severity:'major', message:'Two NSAIDs together (Ibuprofen + Diclofenac) greatly increases bleeding risk. Avoid this combination.' },
    { id:'DI3', drug1:'M6', drug2:'M7', drug1Name:'Glycomet 500', drug2Name:'Amaryl 2mg',
      severity:'moderate', message:'Combined diabetes drugs may cause hypoglycemia. Monitor blood sugar closely.' },
    { id:'DI4', drug1:'M15', drug2:'M18', drug1Name:'Cetirizine 10mg', drug2Name:'Avil 25mg',
      severity:'major', message:'Two antihistamines together cause excessive sedation and anticholinergic effects. Do not combine.' },
    { id:'DI5', drug1:'M16', drug2:'M17', drug1Name:'Allegra 120mg', drug2Name:'Montair LC',
      severity:'moderate', message:'These antiallergics overlap in mechanism. Using both may not add benefit and increases side effects.' },
    { id:'DI6', drug1:'M2', drug2:'M28', drug1Name:'Combiflam', drug2Name:'Volini Spray',
      severity:'minor', message:'Using oral and topical NSAIDs simultaneously may increase systemic NSAID absorption. Advisable to consult doctor.' },
    { id:'DI7', drug1:'M1', drug2:'M3', drug1Name:'Dolo 650', drug2Name:'Crocin Advance',
      severity:'major', message:'Both are Paracetamol — taking together causes Paracetamol overdose. Use only ONE at a time.' },
  ],

  // ---- Loyalty Ledger ----
  loyalty_ledger: [
    { id:'LL1', userId:'U1', type:'earn', amount:100, desc:'Order O1 — ₹100 spent', ts:'2025-03-28T11:15:00Z' },
    { id:'LL2', userId:'U1', type:'earn', amount:196, desc:'Order O2 — ₹196 spent', ts:'2025-04-14T09:30:00Z' },
    { id:'LL3', userId:'U1', type:'earn', amount:70,  desc:'Order O5 — ₹70 spent',  ts:'2025-03-20T15:30:00Z' },
  ],

  // ---- Health Records (patient vitals) ----
  health_records: [
    { id:'HR1', userId:'U1', type:'blood_pressure', systolic:122, diastolic:80, unit:'mmHg',
      recorded:'2025-04-14', note:'Morning reading, post-exercise', ts:'2025-04-14T07:30:00Z' },
    { id:'HR2', userId:'U1', type:'blood_sugar', value:95, unit:'mg/dL',
      recorded:'2025-04-13', note:'Fasting blood sugar', ts:'2025-04-13T07:00:00Z' },
    { id:'HR3', userId:'U1', type:'blood_pressure', systolic:118, diastolic:78, unit:'mmHg',
      recorded:'2025-04-12', note:'Evening reading', ts:'2025-04-12T19:00:00Z' },
    { id:'HR4', userId:'U1', type:'weight', value:72, unit:'kg',
      recorded:'2025-04-10', note:'', ts:'2025-04-10T08:00:00Z' },
  ],

  // ---- Notifications ----
  notifications: [
    { id:'N1', userId:'U1', type:'order', icon:'📦', title:'Order Confirmed',
      body:'Your order O1 has been confirmed and is being prepared.', read:true,
      link:'#/customer/tracking/O1', ts:'2025-03-28T10:31:00Z' },
    { id:'N2', userId:'U1', type:'order', icon:'🏍️', title:'Out for Delivery',
      body:'Your order O2 is on the way! Ravi Kumar is delivering.', read:false,
      link:'#/customer/tracking/O2', ts:'2025-04-14T09:31:00Z' },
    { id:'N3', userId:'U1', type:'subscription', icon:'💳', title:'Subscription Active',
      body:'Your Premium plan is active. Enjoy priority labs and exclusive health reports!', read:false,
      link:'#/customer/subscription', ts:'2025-04-01T10:00:00Z' },
    { id:'N4', userId:'U1', type:'health', icon:'💊', title:'Medicine Reminder',
      body:'Time to take your Becosules Z (B-Complex). Stay healthy!', read:false,
      link:'#/customer/orders', ts:'2025-04-14T08:00:00Z' },
    { id:'N5', userId:'U1', type:'offer', icon:'🎁', title:'You Earned 366 DORM Coins!',
      body:'Your purchases earned loyalty coins. Redeem ₹36 off your next order.', read:false,
      link:'#/customer/profile', ts:'2025-04-14T09:32:00Z' },
  ],

  // ---- Medicine Reminder Schedules ----
  reminder_schedules: [
    { id:'RS1', userId:'U1', medId:'M10', medName:'Becosules Z', medIcon:'💪',
      time:'08:00', frequency:'daily', daysOfWeek:['Mon','Tue','Wed','Thu','Fri','Sat','Sun'],
      enabled:true, note:'After breakfast', createdAt:'2025-04-12T10:00:00Z', lastNotified:null },
  ],

  // ---- Support Tickets ----
  support_tickets: [
    { id:'TK001', userId:'U1', userName:'Rahul Sharma', userPhone:'9876543210',
      category:'order_issue', subject:'Medicine not received yet',
      description:'I placed order O2 but it has been 2 hours and I have not received my medicines.',
      orderId:'O2', status:'pending', priority:'high', assignedTo:'Support Agent 1',
      lastMessage:'Checking with pharmacy partner now.',
      messages:[
        { sender:'user', text:'I placed order O2 but it has been 2 hours and I have not received my medicines.', ts:'2025-04-14T11:00:00Z' },
        { sender:'agent', text:'Checking with pharmacy partner now.', ts:'2025-04-14T11:12:00Z' },
      ],
      createdAt:'2025-04-14T11:00:00Z', updatedAt:'2025-04-14T11:12:00Z', unread:true },
    { id:'TK002', userId:'U1', userName:'Rahul Sharma', userPhone:'9876543210',
      category:'payment', subject:'Refund not received for cancelled order',
      description:'My order O1 was cancelled. I paid via UPI. Refund not received after 5 days.',
      orderId:'O1', status:'resolved', priority:'medium', assignedTo:'Support Agent 2',
      lastMessage:'Refund has been processed. Will reflect in 2-3 days.',
      messages:[
        { sender:'user', text:'My order O1 was cancelled. Refund not received.', ts:'2025-04-10T09:00:00Z' },
        { sender:'agent', text:'Refund has been processed. Will reflect in 2-3 days.', ts:'2025-04-10T10:30:00Z' },
      ],
      createdAt:'2025-04-10T09:00:00Z', updatedAt:'2025-04-10T10:30:00Z', unread:false },
  ],
};

// ---- Database Engine ----
class DormedsDB {
  constructor() {
    this._init();
  }

  _init() {
    const isReady = localStorage.getItem(DB_PREFIX + 'ready');
    const version = localStorage.getItem(DB_PREFIX + 'version');
    const CURRENT_VERSION = '5.0';
    if (!isReady || version !== CURRENT_VERSION) {
      // Clear old data and re-seed
      const toRemove = [];
      for (let i = 0; i < localStorage.length; i++) {
        const k = localStorage.key(i);
        if (k && k.startsWith(DB_PREFIX)) toRemove.push(k);
      }
      toRemove.forEach(k => localStorage.removeItem(k));
      Object.keys(SEED).forEach(k => {
        if (k !== 'ocrMap' && k !== 'searchHistory')
          localStorage.setItem(DB_PREFIX + k, JSON.stringify(SEED[k]));
      });
      localStorage.setItem(DB_PREFIX + 'cart', '[]');
      localStorage.setItem(DB_PREFIX + 'searchHistory', JSON.stringify(SEED.searchHistory));
      localStorage.setItem(DB_PREFIX + 'prescriptions', '[]');
      localStorage.setItem(DB_PREFIX + 'version', CURRENT_VERSION);
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
      'out_for_delivery': ['pending_physical_verification', 'delivery_failed'],
      'pending_physical_verification': ['completed', 'out_for_delivery'],
      'delivery_failed': ['out_for_delivery', 'cancelled'],
      'completed': [],
      'delivered': [],
      'cancelled': [],
    };
    return (valid[current] || []).includes(next);
  }

  // Admin user auth helpers
  verifyAdminPassword(username, password) {
    const users = this.get('admin_users');
    const user = users.find(u => u.username === username && u.active);
    if (!user) return null;
    // Demo: compare base64 encoded password
    const encoded = btoa(password);
    if (encoded === user.password_b64) return user;
    return null;
  }

  getAdminUser(username) {
    return this.get('admin_users').find(u => u.username === username) || null;
  }

  // Generate 4-digit delivery OTP
  generateOtp() {
    return String(Math.floor(1000 + Math.random() * 9000));
  }

  // Check subscription status for a user
  checkSubscription(userId) {
    const subs = this.get('subscriptions');
    const sub = subs.find(s => s.userId === userId && s.status === 'active');
    if (!sub) return { active: false, plan: null, daysLeft: 0, expired: false, bptCredits: 0 };
    const end = new Date(sub.endDate);
    const now = new Date();
    const daysLeft = Math.ceil((end - now) / (1000 * 60 * 60 * 24));
    const expired = daysLeft <= 0;
    if (expired) { this.update('subscriptions', sub.id, { status: 'expired' }); }
    const plan = this.getOne('subscription_plans', sub.planId);
    return { active: !expired, plan, sub, daysLeft: Math.max(0, daysLeft), expired, bptCredits: (sub.bptCredits || 0) - (sub.bptUsed || 0) };
  }

  // Feature access gating
  isFeatureAllowed(userId, feature) {
    const { active, plan } = this.checkSubscription(userId);
    // BPT is free for ALL users — no subscription required
    if (feature === 'bpt') return true;
    if (!active) return false;
    const premiumFeatures = ['lab_priority', 'counsellor', 'health_reports'];
    if (premiumFeatures.includes(feature)) return plan?.id === 'SP2';
    // Basic features available to all subscribers
    return true;
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

  // Check drug interactions for a list of medicine IDs
  checkInteractions(medIds) {
    const interactions = this.get('drug_interactions');
    const found = [];
    for (let i = 0; i < medIds.length; i++) {
      for (let j = i + 1; j < medIds.length; j++) {
        const a = medIds[i], b = medIds[j];
        const ix = interactions.find(d =>
          (d.drug1 === a && d.drug2 === b) || (d.drug1 === b && d.drug2 === a)
        );
        if (ix) found.push(ix);
      }
    }
    return found;
  }

  // Get loyalty coin balance for a user
  getLoyaltyBalance(userId) {
    const ledger = this.get('loyalty_ledger').filter(l => l.userId === userId);
    return ledger.reduce((s, l) => l.type === 'earn' ? s + l.amount : s - l.amount, 0);
  }

  // Award loyalty coins for an order
  awardLoyaltyCoins(userId, amount, desc) {
    const coins = Math.floor(amount); // 1 coin per ₹1
    if (coins <= 0) return 0;
    this.add('loyalty_ledger', {
      id: 'LL' + Date.now(), userId, type: 'earn', amount: coins, desc, ts: new Date().toISOString()
    });
    return coins;
  }

  // Redeem loyalty coins (100 coins = ₹10 off)
  redeemCoins(userId, coins) {
    const balance = this.getLoyaltyBalance(userId);
    if (balance < coins) return false;
    this.add('loyalty_ledger', {
      id: 'LL' + Date.now(), userId, type: 'redeem', amount: coins,
      desc: `Redeemed ${coins} coins for ₹${Math.floor(coins/10)} discount`, ts: new Date().toISOString()
    });
    return true;
  }

  // Add a notification for a user
  addNotification(userId, { type, icon, title, body, link }) {
    this.add('notifications', {
      id: 'N' + Date.now(), userId, type, icon, title, body,
      read: false, link: link || '#/', ts: new Date().toISOString()
    });
  }

  // Count unread notifications for a user
  unreadCount(userId) {
    return this.get('notifications').filter(n => n.userId === userId && !n.read).length;
  }

  // Mark all notifications as read
  markAllRead(userId) {
    const notifs = this.get('notifications');
    notifs.forEach(n => { if (n.userId === userId) n.read = true; });
    this.set('notifications', notifs);
  }

  // Check overdue medicine reminders
  checkReminders(userId) {
    const reminders = this.get('reminder_schedules').filter(r => r.userId === userId && r.enabled);
    const now = new Date();
    const currentTime = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;
    const today = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'][now.getDay()];
    const overdue = [];
    reminders.forEach(r => {
      if (!r.daysOfWeek.includes(today)) return;
      if (r.time <= currentTime) {
        const lastKey = `dmed_rem_${r.id}_${now.toDateString()}`;
        if (!localStorage.getItem(lastKey)) {
          localStorage.setItem(lastKey, '1');
          overdue.push(r);
        }
      }
    });
    return overdue;
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

