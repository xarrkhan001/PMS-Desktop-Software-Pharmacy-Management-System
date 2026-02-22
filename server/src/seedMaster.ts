import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

const masterMedicines = [
    // --- GSK ---
    { name: "Panadol", genericName: "Paracetamol", manufacturer: "GSK", category: "Tablet", unitType: "Tablet" },
    { name: "Panadol Extra", genericName: "Paracetamol + Caffeine", manufacturer: "GSK", category: "Tablet", unitType: "Tablet" },
    { name: "Panadol CF", genericName: "Paracetamol + Pseudoephedrine", manufacturer: "GSK", category: "Tablet", unitType: "Tablet" },
    { name: "Panadol Syrup", genericName: "Paracetamol", manufacturer: "GSK", category: "Syrup", unitType: "Syrup" },
    { name: "Augmentin 375mg", genericName: "Co-Amoxiclav", manufacturer: "GSK", category: "Tablet", unitType: "Tablet" },
    { name: "Augmentin 625mg", genericName: "Co-Amoxiclav", manufacturer: "GSK", category: "Tablet", unitType: "Tablet" },
    { name: "Augmentin 1g", genericName: "Co-Amoxiclav", manufacturer: "GSK", category: "Tablet", unitType: "Tablet" },
    { name: "Augmentin DS Suspension", genericName: "Co-Amoxiclav", manufacturer: "GSK", category: "Syrup", unitType: "Syrup" },
    { name: "Amoxil 250mg", genericName: "Amoxicillin", manufacturer: "GSK", category: "Tablet", unitType: "Capsule" },
    { name: "Amoxil 500mg", genericName: "Amoxicillin", manufacturer: "GSK", category: "Tablet", unitType: "Capsule" },
    { name: "Ampiclox", genericName: "Ampicilline + Cloxacilline", manufacturer: "GSK", category: "Tablet", unitType: "Capsule" },
    { name: "Betnovate Cream", genericName: "Betamethasone", manufacturer: "GSK", category: "Cream", unitType: "Tablet" },
    { name: "Betnovate-N", genericName: "Betamethasone + Neomycin", manufacturer: "GSK", category: "Cream", unitType: "Tablet" },
    { name: "Betnovate-G", genericName: "Betamethasone + Gentamicin", manufacturer: "GSK", category: "Cream", unitType: "Tablet" },
    { name: "Dermovate Cream", genericName: "Clobetasol Propionate", manufacturer: "GSK", category: "Cream", unitType: "Tablet" },
    { name: "CaC-1000 Plus", genericName: "Calcium + Vitamin D3", manufacturer: "GSK", category: "Tablet", unitType: "Sachet" },
    { name: "Ventolin Syrup", genericName: "Salbutamol", manufacturer: "GSK", category: "Syrup", unitType: "Syrup" },
    { name: "Ventolin Inhaler", genericName: "Salbutamol", manufacturer: "GSK", category: "Injection", unitType: "Injection" },
    { name: "Zinacef Injection", genericName: "Cefuroxime", manufacturer: "GSK", category: "Injection", unitType: "Injection" },
    { name: "Velosef 250mg", genericName: "Cephradine", manufacturer: "GSK", category: "Tablet", unitType: "Capsule" },
    { name: "Velosef 500mg", genericName: "Cephradine", manufacturer: "GSK", category: "Tablet", unitType: "Capsule" },
    { name: "Velosef Suspension", genericName: "Cephradine", manufacturer: "GSK", category: "Syrup", unitType: "Syrup" },

    // --- Getz Pharma ---
    { name: "Risek 20mg", genericName: "Omeprazole", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Capsule" },
    { name: "Risek 40mg", genericName: "Omeprazole", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Capsule" },
    { name: "Risek Insta Sachet", genericName: "Omeprazole + Sodium Bicarbonate", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Sachet" },
    { name: "Nexum 20mg", genericName: "Esomeprazole", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Capsule" },
    { name: "Nexum 40mg", genericName: "Esomeprazole", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Capsule" },
    { name: "Fexet 60mg", genericName: "Fexofenadine", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Fexet 120mg", genericName: "Fexofenadine", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Fexet 180mg", genericName: "Fexofenadine", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Lipiget 10mg", genericName: "Atorvastatin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Lipiget 20mg", genericName: "Atorvastatin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Montiget 4mg Chewable", genericName: "Montelukast", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Montiget 5mg", genericName: "Montelukast", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Sachet" },
    { name: "Montiget 10mg", genericName: "Montelukast", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Zetro 250mg", genericName: "Azithromycin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Capsule" },
    { name: "Zetro 500mg", genericName: "Azithromycin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Zetro Suspension", genericName: "Azithromycin", manufacturer: "Getz Pharma", category: "Syrup", unitType: "Syrup" },
    { name: "Getryl 1mg", genericName: "Glimepiride", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Getryl 2mg", genericName: "Glimepiride", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Getryl 3mg", genericName: "Glimepiride", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Getryl 4mg", genericName: "Glimepiride", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Gabica 75mg", genericName: "Pregabalin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Capsule" },
    { name: "Gabica 100mg", genericName: "Pregabalin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Capsule" },
    { name: "Tamsolin 0.4mg", genericName: "Tamsulosin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Capsule" },
    { name: "Nervon-G", genericName: "Mecobalamin + Gabapentin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },

    // --- Abbott ---
    { name: "Brufen 200mg", genericName: "Ibuprofen", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Brufen 400mg", genericName: "Ibuprofen", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Brufen 600mg", genericName: "Ibuprofen", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Brufen Syrup", genericName: "Ibuprofen", manufacturer: "Abbott", category: "Syrup", unitType: "Syrup" },
    { name: "Arinac", genericName: "Ibuprofen + Pseudoephedrine", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Arinac Forte", genericName: "Ibuprofen + Pseudoephedrine", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Entamizole", genericName: "Metronidazole + Diloxanide", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Entamizole DS", genericName: "Metronidazole + Diloxanide", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Entamizole Suspension", genericName: "Metronidazole + Diloxanide", manufacturer: "Abbott", category: "Syrup", unitType: "Syrup" },
    { name: "Klaricid 250mg", genericName: "Clarithromycin", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Klaricid 500mg", genericName: "Clarithromycin", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Klaricid XL", genericName: "Clarithromycin", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Klaricid Suspension", genericName: "Clarithromycin", manufacturer: "Abbott", category: "Syrup", unitType: "Syrup" },
    { name: "Serc 8mg", genericName: "Betahistine", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Serc 16mg", genericName: "Betahistine", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Duphalac Syrup", genericName: "Lactulose", manufacturer: "Abbott", category: "Syrup", unitType: "Syrup" },
    { name: "Hidrasec Sachet", genericName: "Racecadotril", manufacturer: "Abbott", category: "Tablet", unitType: "Sachet" },
    { name: "Thyronorm 25mcg", genericName: "Levothyroxine", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Thyronorm 50mcg", genericName: "Levothyroxine", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Thyronorm 100mcg", genericName: "Levothyroxine", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Epival 250mg", genericName: "Divalproex Sodium", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Epival 500mg", genericName: "Divalproex Sodium", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Epival Syrup", genericName: "Divalproex Sodium", manufacturer: "Abbott", category: "Syrup", unitType: "Syrup" },

    // --- Sanofi ---
    { name: "Flagyl 200mg", genericName: "Metronidazole", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "Flagyl 400mg", genericName: "Metronidazole", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "Flagyl Suspension", genericName: "Metronidazole", manufacturer: "Sanofi", category: "Syrup", unitType: "Syrup" },
    { name: "No-Spa 40mg", genericName: "Drotaverine", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "No-Spa Forte 80mg", genericName: "Drotaverine", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "Avil", genericName: "Pheniramine Maleate", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "Avil Syrup", genericName: "Pheniramine Maleate", manufacturer: "Sanofi", category: "Syrup", unitType: "Syrup" },
    { name: "Lasix 40mg", genericName: "Furosemide", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "Plavix 75mg", genericName: "Clopidogrel", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "Telfast 120mg", genericName: "Fexofenadine", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "Telfast 180mg", genericName: "Fexofenadine", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "Amaryl 1mg", genericName: "Glimepiride", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "Amaryl 2mg", genericName: "Glimepiride", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "Lantus SoloStar", genericName: "Insulin Glargine", manufacturer: "Sanofi", category: "Injection", unitType: "Injection" },
    { name: "Clexane 40mg", genericName: "Enoxaparin", manufacturer: "Sanofi", category: "Injection", unitType: "Injection" },
    { name: "Clexane 60mg", genericName: "Enoxaparin", manufacturer: "Sanofi", category: "Injection", unitType: "Injection" },

    // --- Sami ---
    { name: "Nuberol Forte", genericName: "Paracetamol + Orphenadrine", manufacturer: "Sami", category: "Tablet", unitType: "Tablet" },
    { name: "Nuberol", genericName: "Paracetamol + Orphenadrine", manufacturer: "Sami", category: "Tablet", unitType: "Tablet" },
    { name: "Feroz-F", genericName: "Iron + Folic Acid", manufacturer: "Sami", category: "Tablet", unitType: "Capsule" },
    { name: "Bon One 0.25mcg", genericName: "Alfacalcidol", manufacturer: "Sami", category: "Tablet", unitType: "Tablet" },
    { name: "Bon One 1mcg", genericName: "Alfacalcidol", manufacturer: "Sami", category: "Tablet", unitType: "Tablet" },
    { name: "D-Rise 200,000 IU", genericName: "Vitamin D3", manufacturer: "Sami", category: "Injection", unitType: "Vial" },
    { name: "Rabeloc 20mg", genericName: "Rabeprazole", manufacturer: "Sami", category: "Tablet", unitType: "Tablet" },
    { name: "Linobid", genericName: "Linezolid", manufacturer: "Sami", category: "Tablet", unitType: "Tablet" },

    // --- Hilton Pharam ---
    { name: "Softin", genericName: "Loratadine", manufacturer: "Hilton", category: "Tablet", unitType: "Tablet" },
    { name: "Softin Syrup", genericName: "Loratadine", manufacturer: "Hilton", category: "Syrup", unitType: "Syrup" },
    { name: "Skilax Drops", genericName: "Sodium Picosulfate", manufacturer: "Hilton", category: "Syrup", unitType: "Syrup" },
    { name: "Sinarine", genericName: "Cinnarizine", manufacturer: "Hilton", category: "Tablet", unitType: "Tablet" },
    { name: "Venofer Injection", genericName: "Iron Sucrose", manufacturer: "Hilton", category: "Injection", unitType: "Vial" },

    // --- Searle ---
    { name: "Gravinate", genericName: "Dimenhydrinate", manufacturer: "Searle", category: "Tablet", unitType: "Tablet" },
    { name: "Gravinate Liquid", genericName: "Dimenhydrinate", manufacturer: "Searle", category: "Syrup", unitType: "Syrup" },
    { name: "Hydrylline Syrup", genericName: "Aminophylline + Diphenhydramine", manufacturer: "Searle", category: "Syrup", unitType: "Syrup" },
    { name: "Hydrylline DM", genericName: "Dextromethorphan + Diphenhydramine", manufacturer: "Searle", category: "Syrup", unitType: "Syrup" },
    { name: "Loprin 75mg", genericName: "Aspirin", manufacturer: "Highnoon", category: "Tablet", unitType: "Tablet" },
    { name: "Peditral Sachet", genericName: "ORS", manufacturer: "Searle", category: "Tablet", unitType: "Sachet" },
    { name: "Extor 160/10mg", genericName: "Amlodipine + Valsartan", manufacturer: "Searle", category: "Tablet", unitType: "Tablet" },
    { name: "Extor 80/5mg", genericName: "Amlodipine + Valsartan", manufacturer: "Searle", category: "Tablet", unitType: "Tablet" },

    // --- Martin Dow ---
    { name: "Ponstan", genericName: "Mefenamic Acid", manufacturer: "Martin Dow", category: "Tablet", unitType: "Tablet" },
    { name: "Ponstan Forte", genericName: "Mefenamic Acid", manufacturer: "Martin Dow", category: "Tablet", unitType: "Tablet" },
    { name: "Wintogeno Cream", genericName: "Wintergreen Oil + Menthol", manufacturer: "Martin Dow", category: "Cream", unitType: "Tablet" },
    { name: "Esocal 20mg", genericName: "Esomeprazole", manufacturer: "Martin Dow", category: "Tablet", unitType: "Capsule" },
    { name: "Esocal 40mg", genericName: "Esomeprazole", manufacturer: "Martin Dow", category: "Tablet", unitType: "Capsule" },

    // --- Pfizer ---
    { name: "Norvasc 5mg", genericName: "Amlodipine", manufacturer: "Pfizer", category: "Tablet", unitType: "Tablet" },
    { name: "Norvasc 10mg", genericName: "Amlodipine", manufacturer: "Pfizer", category: "Tablet", unitType: "Tablet" },
    { name: "Ponstan Syrup", genericName: "Mefenamic Acid", manufacturer: "Pfizer", category: "Syrup", unitType: "Syrup" },
    { name: "Xalatan Eye Drops", genericName: "Latanoprost", manufacturer: "Pfizer", category: "Syrup", unitType: "Syrup" },
    { name: "Dostinex 0.5mg", genericName: "Cabergoline", manufacturer: "Pfizer", category: "Tablet", unitType: "Tablet" },

    // --- Bosch ---
    { name: "Acefyl Syrup", genericName: "Acefylline Piperazine", manufacturer: "Bosch", category: "Syrup", unitType: "Syrup" },
    { name: "Avicap", genericName: "Vitamin A", manufacturer: "Bosch", category: "Tablet", unitType: "Capsule" },
    { name: "Xaltec Eye Drops", genericName: "Latanoprost", manufacturer: "Bosch", category: "Drops", unitType: "Drops" },

    // --- Highnoon ---
    { name: "Kestine 10mg", genericName: "Ebastine", manufacturer: "Highnoon", category: "Tablet", unitType: "Tablet" },
    { name: "Kestine Syrup", genericName: "Ebastine", manufacturer: "Highnoon", category: "Syrup", unitType: "Syrup" },
    { name: "Ulsanic Tablet", genericName: "Sucralfate", manufacturer: "Highnoon", category: "Tablet", unitType: "Tablet" },
    { name: "Ulsanic Suspension", genericName: "Sucralfate", manufacturer: "Highnoon", category: "Syrup", unitType: "Syrup" },
    { name: "Combivair Inhaler", genericName: "Salmeterol + Fluticasone", manufacturer: "Highnoon", category: "Inhaler", unitType: "Inhaler" },

    // --- Specialized Injections & Vaccines ---
    { name: "Venofer Injection", genericName: "Iron Sucrose", manufacturer: "Vifor", category: "Injection", unitType: "Injection" },
    { name: "Ferinject Injection", genericName: "Ferric Carboxymaltose", manufacturer: "Vifor", category: "Injection", unitType: "Injection" },
    { name: "Rocephin 1g", genericName: "Ceftriaxone", manufacturer: "Roche", category: "Injection", unitType: "Injection" },
    { name: "Rocephin 500mg", genericName: "Ceftriaxone", manufacturer: "Roche", category: "Injection", unitType: "Injection" },
    { name: "Gardasil Vaccine", genericName: "HPV Vaccine", manufacturer: "MSD", category: "Injection", unitType: "Injection" },
    { name: "Engerix-B", genericName: "Hepatitis B Vaccine", manufacturer: "GSK", category: "Injection", unitType: "Injection" },
    { name: "Taxotere 80mg", genericName: "Docetaxel", manufacturer: "Sanofi", category: "Injection", unitType: "Injection" },

    // --- Detailed Insulins & Diabetes Care ---
    { name: "Humulin 70/30", genericName: "Insulin", manufacturer: "Lilly", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Humulin R", genericName: "Insulin", manufacturer: "Lilly", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Humulin N", genericName: "Insulin", manufacturer: "Lilly", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Mixtard 30 FlexPen", genericName: "Insulin", manufacturer: "Novo Nordisk", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Insulatard HM", genericName: "Insulin", manufacturer: "Novo Nordisk", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Actrapid Penfill", genericName: "Insulin", manufacturer: "Novo Nordisk", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Lantus SoloStar", genericName: "Insulin Glargine", manufacturer: "Sanofi", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Levemir FlexPen", genericName: "Insulin Detemir", manufacturer: "Novo Nordisk", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Novomix 30 FlexPen", genericName: "Insulin", manufacturer: "Novo Nordisk", category: "Insulin", unitType: "Insulin Pen" },
    { name: "NovoRapid FlexPen", genericName: "Insulin Aspart", manufacturer: "Novo Nordisk", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Apidra SoloStar", genericName: "Insulin Glulisine", manufacturer: "Sanofi", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Victoza Pen", genericName: "Liraglutide", manufacturer: "Novo Nordisk", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Ozempic 1mg", genericName: "Semaglutide", manufacturer: "Novo Nordisk", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Trulicity 1.5mg", genericName: "Dulaglutide", manufacturer: "Lilly", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Soliqua Pen", genericName: "Insulin + Lixisenatide", manufacturer: "Sanofi", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Xultophy Pen", genericName: "Insulin + Liraglutide", manufacturer: "Novo Nordisk", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Tresiba FlexTouch", genericName: "Insulin Degludec", manufacturer: "Novo Nordisk", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Toujeo SoloStar", genericName: "Insulin Glargine", manufacturer: "Sanofi", category: "Insulin", unitType: "Insulin Pen" },
    { name: "Ryodels 500mg", genericName: "Metformin", manufacturer: "Getz", category: "Tablet", unitType: "Tablet" },
    { name: "Getformin 500mg", genericName: "Metformin", manufacturer: "Getz", category: "Tablet", unitType: "Tablet" },
    { name: "Metodine 500mg", genericName: "Metformin", manufacturer: "Sami", category: "Tablet", unitType: "Tablet" },

    // --- More Syrups & Liquids ---
    { name: "Hydrylline Flux", genericName: "Aminophylline + Diphenhydramine", manufacturer: "Searle", category: "Syrup", unitType: "Syrup" },
    { name: "Pulmonol-S", genericName: "Guaifenesin", manufacturer: "Ccl", category: "Syrup", unitType: "Syrup" },
    { name: "Tixylix Syrup", genericName: "Promethazine + Pholcodine", manufacturer: "Sanofi", category: "Syrup", unitType: "Syrup" },
    { name: "Cofcol Syrup", genericName: "Herbal Extract", manufacturer: "Hilton", category: "Syrup", unitType: "Syrup" },
    { name: "Iberet-Folic 500", genericName: "Iron + Vitamins", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Iberet Syrup", genericName: "Iron + Vitamins", manufacturer: "Abbott", category: "Syrup", unitType: "Syrup" },
    { name: "Incremental Syrup", genericName: "Multivitamins", manufacturer: "Sami", category: "Syrup", unitType: "Syrup" },
    { name: "Citro-Soda Sachet", genericName: "Sodium Citrate", manufacturer: "Abbott", category: "Sachet", unitType: "Sachet" },
    { name: "Surbex Syrup", genericName: "B-Complex", manufacturer: "Abbott", category: "Syrup", unitType: "Syrup" },

    // --- Eye & Ear Drops ---
    { name: "Tobrin Eye Drops", genericName: "Tobramycin", manufacturer: "Hilton", category: "Drops", unitType: "Drops" },
    { name: "Tobrin-D Eye Drops", genericName: "Tobramycin + Dexa", manufacturer: "Hilton", category: "Drops", unitType: "Drops" },
    { name: "Betnesol-N Eye/Ear", genericName: "Betamethasone + Neomycin", manufacturer: "GSK", category: "Drops", unitType: "Drops" },
    { name: "Polyfax Eye Ointment", genericName: "Polymyxin + Bacitracin", manufacturer: "GSK", category: "Cream", unitType: "Tube" },
    { name: "Chloramphenicol Eye Drops", genericName: "Chloramphenicol", manufacturer: "Opthal", category: "Drops", unitType: "Drops" },

    // --- Creams, Lotions & Gels ---
    { name: "Sunscreen Lotion", genericName: "SPF 60", manufacturer: "Stiefel", category: "Lotion", unitType: "Lotion" },
    { name: "Calamine Lotion", genericName: "Zinc Oxide", manufacturer: "GSK", category: "Lotion", unitType: "Lotion" },
    { name: "Loprox Cream", genericName: "Ciclopirox", manufacturer: "Sanofi", category: "Cream", unitType: "Tube" },
    { name: "Fusac Cream", genericName: "Fusidic Acid", manufacturer: "Platinum", category: "Cream", unitType: "Tube" },
    { name: "Hydrozole-D", genericName: "Clotrimazole + Hydrocortisone", manufacturer: "Sami", category: "Cream", unitType: "Tube" },
    { name: "Klariderm Lotion", genericName: "Clarithromycin", manufacturer: "Sami", category: "Lotion", unitType: "Lotion" },
    { name: "Acne-Free Gel", genericName: "Adapalene", manufacturer: "Galderma", category: "Cream", unitType: "Tube" },

    // --- More Common Medicines ---
    { name: "Disprin CV 75mg", genericName: "Aspirin", manufacturer: "Reckitt", category: "Tablet", unitType: "Tablet" },
    { name: "Ecoprin 75mg", genericName: "Aspirin", manufacturer: "Atco", category: "Tablet", unitType: "Tablet" },
    { name: "Ascard 75mg", genericName: "Aspirin", manufacturer: "Searle", category: "Tablet", unitType: "Tablet" },
    { name: "Loprin 150mg", genericName: "Aspirin", manufacturer: "Highnoon", category: "Tablet", unitType: "Tablet" },
    { name: "Tenormin 50mg", genericName: "Atenolol", manufacturer: "AstraZeneca", category: "Tablet", unitType: "Tablet" },
    { name: "Inderal 10mg", genericName: "Propranolol", manufacturer: "AstraZeneca", category: "Tablet", unitType: "Tablet" },
    { name: "Inderal 40mg", genericName: "Propranolol", manufacturer: "AstraZeneca", category: "Tablet", unitType: "Tablet" },
    { name: "Concor 2.5mg", genericName: "Bisoprolol", manufacturer: "Merck", category: "Tablet", unitType: "Tablet" },
    { name: "Concor 5mg", genericName: "Bisoprolol", manufacturer: "Merck", category: "Tablet", unitType: "Tablet" },
    { name: "Zestril 5mg", genericName: "Lisinopril", manufacturer: "AstraZeneca", category: "Tablet", unitType: "Tablet" },
    { name: "Zestril 10mg", genericName: "Lisinopril", manufacturer: "AstraZeneca", category: "Tablet", unitType: "Tablet" },
    { name: "Capoten 25mg", genericName: "Captopril", manufacturer: "BMS", category: "Tablet", unitType: "Tablet" },
    { name: "Hyzaar", genericName: "Losartan + HCTZ", manufacturer: "MSD", category: "Tablet", unitType: "Tablet" },
    { name: "Cozaar 50mg", genericName: "Losartan", manufacturer: "MSD", category: "Tablet", unitType: "Tablet" },
    { name: "Avapro 150mg", genericName: "Irbesartan", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "Exforge 5/80mg", genericName: "Amlodipine + Valsartan", manufacturer: "Novartis", category: "Tablet", unitType: "Tablet" },
    { name: "Exforge 10/160mg", genericName: "Amlodipine + Valsartan", manufacturer: "Novartis", category: "Tablet", unitType: "Tablet" },
    { name: "Adalat 20mg", genericName: "Nifedipine", manufacturer: "Bayer", category: "Tablet", unitType: "Tablet" },
    { name: "Adalat LA 30mg", genericName: "Nifedipine", manufacturer: "Bayer", category: "Tablet", unitType: "Tablet" },
    { name: "Gravinate Injection", genericName: "Dimenhydrinate", manufacturer: "Searle", category: "Injection", unitType: "Injection" },
    { name: "Buscapan Tablet", genericName: "Hyoscine", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "Buscapan Injection", genericName: "Hyoscine", manufacturer: "Sanofi", category: "Injection", unitType: "Injection" },
    { name: "Spasmo-Proxyvon", genericName: "Dicyclomine", manufacturer: "Wockhardt", category: "Tablet", unitType: "Capsule" },
    { name: "Imodium 2mg", genericName: "Loperamide", manufacturer: "Janssen", category: "Tablet", unitType: "Capsule" },
    { name: "Lomotil", genericName: "Diphenoxylate", manufacturer: "Searle", category: "Tablet", unitType: "Tablet" },
    { name: "Colofac 135mg", genericName: "Mebeverine", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Colofac retard", genericName: "Mebeverine", manufacturer: "Abbott", category: "Tablet", unitType: "Capsule" },
    { name: "Mebeverine Syrup", genericName: "Mebeverine", manufacturer: "Hilton", category: "Syrup", unitType: "Syrup" },
    { name: "Tums Tablet", genericName: "Calcium Carbonate", manufacturer: "GSK", category: "Tablet", unitType: "Tablet" },
    { name: "Rolaids", genericName: "Calcium + Magnesium", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "Maalox Plus", genericName: "Aluminum + Magnesium + Simethicone", manufacturer: "Sanofi", category: "Syrup", unitType: "Syrup" },
    { name: "Digene Tablet", genericName: "Antacid", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Digene Syrup", genericName: "Antacid", manufacturer: "Abbott", category: "Syrup", unitType: "Syrup" },
    { name: "Mucaine Liquid", genericName: "Antacid + Oxetacaine", manufacturer: "Pfizer", category: "Syrup", unitType: "Syrup" },
    { name: "Simeco Suspension", genericName: "Antacid + Simethicone", manufacturer: "Searle", category: "Syrup", unitType: "Syrup" },
    { name: "Gaviscon Double Action", genericName: "Sodium Alginate", manufacturer: "Reckitt", category: "Syrup", unitType: "Syrup" },
    { name: "Lactulose Enema", genericName: "Lactulose", manufacturer: "Abbott", category: "Syrup", unitType: "Syrup" },
    { name: "Xylomet Drops", genericName: "Xylometazoline", manufacturer: "Sami", category: "Drops", unitType: "Drops" },
    { name: "Otrivin Drops", genericName: "Xylometazoline", manufacturer: "GSK", category: "Drops", unitType: "Drops" },
    { name: "Otrivin Spray", genericName: "Xylometazoline", manufacturer: "GSK", category: "Spray", unitType: "Spray" },
    { name: "Beconase Spray", genericName: "Beclomethasone", manufacturer: "GSK", category: "Spray", unitType: "Spray" },
    { name: "Flixonase Spray", genericName: "Fluticasone", manufacturer: "GSK", category: "Spray", unitType: "Spray" },
    { name: "Avamys Spray", genericName: "Fluticasone Furoate", manufacturer: "GSK", category: "Spray", unitType: "Spray" },
    { name: "Nasocort Spray", genericName: "Triamcinolone", manufacturer: "Sanofi", category: "Spray", unitType: "Spray" },
    { name: "Clenil-A", genericName: "Beclomethasone Respules", manufacturer: "Chiesi", category: "Inhaler", unitType: "Inhaler" },

    // --- Gastro (PPIs & Antacids) ---
    { name: "Esome 20mg", genericName: "Esomeprazole", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Capsule" },
    { name: "Esome 40mg", genericName: "Esomeprazole", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Capsule" },
    { name: "Caplow 20mg", genericName: "Omeprazole", manufacturer: "Hilton", category: "Tablet", unitType: "Capsule" },
    { name: "Caplow 40mg", genericName: "Omeprazole", manufacturer: "Hilton", category: "Tablet", unitType: "Capsule" },
    { name: "Gaviscon Suspension", genericName: "Sodium Alginate", manufacturer: "Reckitt", category: "Syrup", unitType: "Syrup" },
    { name: "Mucaine", genericName: "Antacid + Oxetacaine", manufacturer: "Pfizer", category: "Syrup", unitType: "Syrup" },
    { name: "Zovanta 20mg", genericName: "Pantoprazole", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Zovanta 40mg", genericName: "Pantoprazole", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Somogel", genericName: "Lignocaine + Cetylpyridinium", manufacturer: "Abbott", category: "Cream", unitType: "Tube" },
    { name: "Bonjela", genericName: "Choline Salicylate", manufacturer: "Reckitt", category: "Cream", unitType: "Tube" },

    // --- Antibiotics (More brands) ---
    { name: "Cefspan 400mg", genericName: "Cefixime", manufacturer: "Sami", category: "Tablet", unitType: "Capsule" },
    { name: "Cefspan Suspension", genericName: "Cefixime", manufacturer: "Sami", category: "Syrup", unitType: "Syrup" },
    { name: "Novidat 250mg", genericName: "Ciprofloxacin", manufacturer: "Sami", category: "Tablet", unitType: "Tablet" },
    { name: "Novidat 500mg", genericName: "Ciprofloxacin", manufacturer: "Sami", category: "Tablet", unitType: "Tablet" },
    { name: "Velosef 250mg Capsule", genericName: "Cephradine", manufacturer: "GSK", category: "Tablet", unitType: "Capsule" },
    { name: "Velosef 500mg Capsule", genericName: "Cephradine", manufacturer: "GSK", category: "Tablet", unitType: "Capsule" },
    { name: "Leflox 250mg", genericName: "Levofloxacin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Leflox 500mg", genericName: "Levofloxacin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Klaricid 250mg Tablet", genericName: "Clarithromycin", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Klaricid 500mg Tablet", genericName: "Clarithromycin", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Factive 320mg", genericName: "Gemifloxacin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Avelox 400mg", genericName: "Moxifloxacin", manufacturer: "Bayer", category: "Tablet", unitType: "Tablet" },

    // --- Neuro & CNS ---
    { name: "Lexotanil 3mg", genericName: "Bromazepam", manufacturer: "Roche", category: "Tablet", unitType: "Tablet" },
    { name: "Xanax 0.25mg", genericName: "Alprazolam", manufacturer: "Pfizer", category: "Tablet", unitType: "Tablet" },
    { name: "Xanax 0.5mg", genericName: "Alprazolam", manufacturer: "Pfizer", category: "Tablet", unitType: "Tablet" },
    { name: "Inderal 10mg", genericName: "Propranolol", manufacturer: "AstraZeneca", category: "Tablet", unitType: "Tablet" },
    { name: "Inderal 40mg", genericName: "Propranolol", manufacturer: "AstraZeneca", category: "Tablet", unitType: "Tablet" },
    { name: "Serc 8mg", genericName: "Betahistine", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Serc 16mg", genericName: "Betahistine", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Serc 24mg", genericName: "Betahistine", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Deanxit", genericName: "Flupentixol + Melitracen", manufacturer: "Lundbeck", category: "Tablet", unitType: "Tablet" },
    { name: "Motival", genericName: "Fluphenazine + Nortriptyline", manufacturer: "GSK", category: "Tablet", unitType: "Tablet" },

    // --- Cardio (BP & Cholesterol) ---
    { name: "Lipiget 10mg", genericName: "Atorvastatin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Lipiget 20mg", genericName: "Atorvastatin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Lipiget 40mg", genericName: "Atorvastatin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Rovista 5mg", genericName: "Rosuvastatin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Rovista 10mg", genericName: "Rosuvastatin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Rovista 20mg", genericName: "Rosuvastatin", manufacturer: "Getz Pharma", category: "Tablet", unitType: "Tablet" },
    { name: "Tenormin 50mg", genericName: "Atenolol", manufacturer: "GSK", category: "Tablet", unitType: "Tablet" },
    { name: "Tenormin 100mg", genericName: "Atenolol", manufacturer: "GSK", category: "Tablet", unitType: "Tablet" },
    { name: "Concor 2.5mg", genericName: "Bisoprolol", manufacturer: "Merck", category: "Tablet", unitType: "Tablet" },
    { name: "Concor 5mg", genericName: "Bisoprolol", manufacturer: "Merck", category: "Tablet", unitType: "Tablet" },
    { name: "Exforge 5/80mg", genericName: "Amlodipine + Valsartan", manufacturer: "Novartis", category: "Tablet", unitType: "Tablet" },
    { name: "Exforge 5/160mg", genericName: "Amlodipine + Valsartan", manufacturer: "Novartis", category: "Tablet", unitType: "Tablet" },
    { name: "Exforge 10/160mg", genericName: "Amlodipine + Valsartan", manufacturer: "Novartis", category: "Tablet", unitType: "Tablet" },

    // --- Pain & NSAIDs ---
    { name: "Dicloran 50mg", genericName: "Diclofenac Sodium", manufacturer: "Sami", category: "Tablet", unitType: "Tablet" },
    { name: "Dicloran SR 100mg", genericName: "Diclofenac Sodium", manufacturer: "Sami", category: "Tablet", unitType: "Tablet" },
    { name: "Voren 50mg", genericName: "Diclofenac Sodium", manufacturer: "Hilton", category: "Tablet", unitType: "Tablet" },
    { name: "Voren Retard", genericName: "Diclofenac Sodium", manufacturer: "Hilton", category: "Tablet", unitType: "Tablet" },
    { name: "Feldene 20mg", genericName: "Piroxicam", manufacturer: "Pfizer", category: "Tablet", unitType: "Capsule" },
    { name: "Feldene Flash", genericName: "Piroxicam", manufacturer: "Pfizer", category: "Tablet", unitType: "Tablet" },
    { name: "Xobix 7.5mg", genericName: "Meloxicam", manufacturer: "Hilton", category: "Tablet", unitType: "Tablet" },
    { name: "Xobix 15mg", genericName: "Meloxicam", manufacturer: "Hilton", category: "Tablet", unitType: "Tablet" },
    { name: "Synflex 275mg", genericName: "Naproxen Sodium", manufacturer: "Martin Dow", category: "Tablet", unitType: "Tablet" },
    { name: "Synflex 550mg", genericName: "Naproxen Sodium", manufacturer: "Martin Dow", category: "Tablet", unitType: "Tablet" },

    // --- Cough & Cold (Syrups) ---
    { name: "Hydrylline Syrup", genericName: "Aminophylline + Diphenhydramine", manufacturer: "Searle", category: "Syrup", unitType: "Syrup" },
    { name: "Hydrylline DM", genericName: "Dextromethorphan + Diphenhydramine", manufacturer: "Searle", category: "Syrup", unitType: "Syrup" },
    { name: "Acefyl Syrup", genericName: "Acefylline + Diphenhydramine", manufacturer: "Searle", category: "Syrup", unitType: "Syrup" },
    { name: "Pulmonol", genericName: "Guaifenesin + Menthol", manufacturer: "CCL", category: "Syrup", unitType: "Syrup" },
    { name: "Cofcol", genericName: "Herbal", manufacturer: "Hilton", category: "Syrup", unitType: "Syrup" },
    { name: "Sancos Syrup", genericName: "Pholcodine", manufacturer: "Novartis", category: "Syrup", unitType: "Syrup" },

    // --- Vitamins & Supplements ---
    { name: "Surbex-Z", genericName: "Vitamins + Zinc", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Surbex-T", genericName: "Vitamins", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "Sangobion", genericName: "Iron + Vitamins", manufacturer: "Merck", category: "Tablet", unitType: "Capsule" },
    { name: "Iberet-Folic-500", genericName: "Iron + Folic Acid + Vit C", manufacturer: "Abbott", category: "Tablet", unitType: "Tablet" },
    { name: "CaC-1000 Plus", genericName: "Calcium + Vit D3", manufacturer: "GSK", category: "Tablet", unitType: "Sachet" },
    { name: "D-Rise 200,000 IU", genericName: "Vitamin D3", manufacturer: "Sami", category: "Injection", unitType: "Vial" },

    // --- Dermatology ---
    { name: "Polytar Liquid", genericName: "Tar", manufacturer: "Stiefel", category: "Lotion", unitType: "Lotion" },
    { name: "Scalpel Lotion", genericName: "Ketoconazole", manufacturer: "Sami", category: "Lotion", unitType: "Lotion" },
    { name: "Fucidin Cream", genericName: "Fusidic Acid", manufacturer: "LEO Pharma", category: "Cream", unitType: "Tube" },
    { name: "Fucicort Cream", genericName: "Fusidic Acid + Betamethasone", manufacturer: "LEO Pharma", category: "Cream", unitType: "Tube" },
    { name: "Quadriderm Cream", genericName: "Multiple", manufacturer: "MSD", category: "Cream", unitType: "Tube" },
    { name: "M-Zole Cream", genericName: "Miconazole", manufacturer: "Hilton", category: "Cream", unitType: "Tube" },

    // --- Eye & Ear ---
    { name: "Tobrin Eye Drops", genericName: "Tobramycin", manufacturer: "Hilton", category: "Drops", unitType: "Drops" },
    { name: "Tobrin-D Eye Drops", genericName: "Tobramycin + Dexa", manufacturer: "Hilton", category: "Drops", unitType: "Drops" },
    { name: "Betnesol Eye/Ear Drops", genericName: "Betamethasone", manufacturer: "GSK", category: "Drops", unitType: "Drops" },
    { name: "Chloramphenicol Eye Drops", genericName: "Chloramphenicol", manufacturer: "Searle", category: "Drops", unitType: "Drops" },
    { name: "Polyfax Eye Ointment", genericName: "Bacitracin + Polymyxin", manufacturer: "GSK", category: "Cream", unitType: "Tube" },

    // --- Specialized / Diverse ---
    { name: "Gravinate 50mg", genericName: "Dimenhydrinate", manufacturer: "Searle", category: "Tablet", unitType: "Tablet" },
    { name: "Gravinate Liquid", genericName: "Dimenhydrinate", manufacturer: "Searle", category: "Syrup", unitType: "Syrup" },
    { name: "Buscapan 10mg", genericName: "Hyoscine Butylbromide", manufacturer: "Sanofi", category: "Tablet", unitType: "Tablet" },
    { name: "Buscapan Injection", genericName: "Hyoscine Butylbromide", manufacturer: "Sanofi", category: "Injection", unitType: "Injection" },
    { name: "Spasfon", genericName: "Phloroglucinol", manufacturer: "Pharmevo", category: "Tablet", unitType: "Tablet" },
    { name: "Spasfon Injection", genericName: "Phloroglucinol", manufacturer: "Pharmevo", category: "Injection", unitType: "Injection" },
    { name: "ORS Sachet", genericName: "Electrolytes", manufacturer: "Searle", category: "Sachet", unitType: "Sachet" },
    { name: "Citro-Soda", genericName: "Urine Alkalinizer", manufacturer: "Abbott", category: "Sachet", unitType: "Sachet" },

    // --- Platinum Pharmaceuticals ---
    { name: "Plafix 75mg", genericName: "Clopidogrel", manufacturer: "Platinum", category: "Tablet", unitType: "Tablet" },
    { name: "Fusac Cream", genericName: "Fusidic Acid", manufacturer: "Platinum", category: "Cream", unitType: "Tube" },
    { name: "Cefigard 400mg", genericName: "Cefixime", manufacturer: "Platinum", category: "Tablet", unitType: "Capsule" },
    { name: "Platinum-Z", genericName: "Multivitamins", manufacturer: "Platinum", category: "Tablet", unitType: "Tablet" },

    // --- Barrett Hodgson ---
    { name: "Zestril 5mg", genericName: "Lisinopril", manufacturer: "Barrett Hodgson", category: "Tablet", unitType: "Tablet" },
    { name: "Zestril 10mg", genericName: "Lisinopril", manufacturer: "Barrett Hodgson", category: "Tablet", unitType: "Tablet" },
    { name: "Zestril 20mg", genericName: "Lisinopril", manufacturer: "Barrett Hodgson", category: "Tablet", unitType: "Tablet" },
    { name: "Anafortan Tablet", genericName: "Camylofin + Paracetamol", manufacturer: "Barrett Hodgson", category: "Tablet", unitType: "Tablet" },
    { name: "Anafortan Syrup", genericName: "Camylofin + Paracetamol", manufacturer: "Barrett Hodgson", category: "Syrup", unitType: "Syrup" },
    { name: "Ventoline Expectorant", genericName: "Salbutamol + Guaifenesin", manufacturer: "Barrett Hodgson", category: "Syrup", unitType: "Syrup" },

    // --- Atco Laboratories ---
    { name: "Ecoprin 75mg", genericName: "Aspirin", manufacturer: "Atco", category: "Tablet", unitType: "Tablet" },
    { name: "Atco-Z", genericName: "Vitamins + Zinc", manufacturer: "Atco", category: "Tablet", unitType: "Tablet" },
    { name: "Atcor 10mg", genericName: "Atorvastatin", manufacturer: "Atco", category: "Tablet", unitType: "Tablet" },
    { name: "Atcor 20mg", genericName: "Atorvastatin", manufacturer: "Atco", category: "Tablet", unitType: "Tablet" },
    { name: "B-Zone Tablet", genericName: "Betamethasone", manufacturer: "Atco", category: "Tablet", unitType: "Tablet" },
    { name: "B-Zone Drops", genericName: "Betamethasone", manufacturer: "Atco", category: "Drops", unitType: "Drops" },

    // --- ICI Pakistan ---
    { name: "Tenormin 25mg", genericName: "Atenolol", manufacturer: "ICI", category: "Tablet", unitType: "Tablet" },
    { name: "Tenormin 50mg Tablet", genericName: "Atenolol", manufacturer: "ICI", category: "Tablet", unitType: "Tablet" },
    { name: "Tenoretic 50", genericName: "Atenolol + Chlorthalidone", manufacturer: "ICI", category: "Tablet", unitType: "Tablet" },
    { name: "Zestoretic", genericName: "Lisinopril + HCTZ", manufacturer: "ICI", category: "Tablet", unitType: "Tablet" },
    { name: "Inderal 10mg Tablet", genericName: "Propranolol", manufacturer: "ICI", category: "Tablet", unitType: "Tablet" }
];

async function main() {
    console.log("Start seeding master medicines...");
    for (const med of masterMedicines) {
        await prisma.masterMedicine.upsert({
            where: { name: med.name },
            update: med,
            create: med,
        });
    }
    console.log("Seeding finished.");
}

main()
    .catch((e) => {
        console.error(e);
        process.exit(1);
    })
    .finally(async () => {
        await prisma.$disconnect();
    });
