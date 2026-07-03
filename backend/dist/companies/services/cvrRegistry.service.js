"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cvrRegistryService = void 0;
const CVR_SIMULATOR_REGISTRY = [
    {
        cvrNumber: '54643118',
        name: 'Lego System A/S',
        legalName: 'LEGO SYSTEM A/S',
        companyType: 'A/S (Public Limited)',
        industry: 'Toys & Gaming Manufacturing',
        businessCategory: 'Consumer Goods',
        website: 'https://www.lego.com',
        primaryEmail: 'info@lego.com',
        primaryPhone: '+45 79 50 20 00',
        addressLine1: 'Åastvej 1',
        city: 'Billund',
        postalCode: '7190',
        country: 'Denmark',
        employeeCount: 24000,
        annualRevenue: 9500000000,
        foundedYear: 1932,
        vatNumber: 'DK54643118',
        status: 'Active'
    },
    {
        cvrNumber: '22756214',
        name: 'A.P. Møller - Mærsk A/S',
        legalName: 'A.P. MØLLER - MÆRSK A/S',
        companyType: 'A/S (Public Limited)',
        industry: 'International Freight & Logistics',
        businessCategory: 'Transportation',
        website: 'https://www.maersk.com',
        primaryEmail: 'contact@maersk.com',
        primaryPhone: '+45 33 63 33 63',
        addressLine1: 'Esplanaden 50',
        city: 'Copenhagen K',
        postalCode: '1098',
        country: 'Denmark',
        employeeCount: 110000,
        annualRevenue: 51000000000,
        foundedYear: 1904,
        vatNumber: 'DK22756214',
        status: 'Active'
    },
    {
        cvrNumber: '24256790',
        name: 'Novo Nordisk A/S',
        legalName: 'NOVO NORDISK A/S',
        companyType: 'A/S (Public Limited)',
        industry: 'Pharmaceuticals & Biotechnology',
        businessCategory: 'Healthcare',
        website: 'https://www.novonordisk.com',
        primaryEmail: 'info@novonordisk.com',
        primaryPhone: '+45 44 44 88 88',
        addressLine1: 'Novo Allé 1',
        city: 'Bagsværd',
        postalCode: '2880',
        country: 'Denmark',
        employeeCount: 64000,
        annualRevenue: 33000000000,
        foundedYear: 1923,
        vatNumber: 'DK24256790',
        status: 'Active'
    },
    {
        cvrNumber: '10403782',
        name: 'Vestas Wind Systems A/S',
        legalName: 'VESTAS WIND SYSTEMS A/S',
        companyType: 'A/S (Public Limited)',
        industry: 'Renewable Energy & Wind Turbines',
        businessCategory: 'Energy & Utilities',
        website: 'https://www.vestas.com',
        primaryEmail: 'vestas@vestas.com',
        primaryPhone: '+45 97 30 00 00',
        addressLine1: 'Hedeager 42',
        city: 'Aarhus N',
        postalCode: '8200',
        country: 'Denmark',
        employeeCount: 29000,
        annualRevenue: 15300000000,
        foundedYear: 1945,
        vatNumber: 'DK10403782',
        status: 'Active'
    },
    {
        cvrNumber: '61126228',
        name: 'Danske Bank A/S',
        legalName: 'DANSKE BANK A/S',
        companyType: 'A/S (Public Limited)',
        industry: 'Banking & Financial Services',
        businessCategory: 'Finance',
        website: 'https://danskebank.com',
        primaryEmail: 'contact@danskebank.dk',
        primaryPhone: '+45 33 44 00 00',
        addressLine1: 'Bernstorffsgade 40',
        city: 'Copenhagen V',
        postalCode: '1577',
        country: 'Denmark',
        employeeCount: 21000,
        annualRevenue: 7800000000,
        foundedYear: 1871,
        vatNumber: 'DK61126228',
        status: 'Active'
    },
    {
        cvrNumber: '25508343',
        name: 'Pandora A/S',
        legalName: 'PANDORA A/S',
        companyType: 'A/S (Public Limited)',
        industry: 'Luxury Goods & Jewelry',
        businessCategory: 'Retail',
        website: 'https://pandoragroup.com',
        primaryEmail: 'info@pandora.net',
        primaryPhone: '+45 36 72 00 44',
        addressLine1: 'Havneholmen 17-19',
        city: 'Copenhagen V',
        postalCode: '1561',
        country: 'Denmark',
        employeeCount: 32000,
        annualRevenue: 3800000000,
        foundedYear: 1982,
        vatNumber: 'DK25508343',
        status: 'Active'
    }
];
exports.cvrRegistryService = {
    searchCVR: async (query) => {
        if (!query || query.trim().length === 0) {
            return CVR_SIMULATOR_REGISTRY;
        }
        const q = query.trim().toLowerCase();
        const results = CVR_SIMULATOR_REGISTRY.filter(item => item.cvrNumber.toLowerCase().includes(q) ||
            item.name.toLowerCase().includes(q) ||
            item.legalName.toLowerCase().includes(q) ||
            item.industry.toLowerCase().includes(q) ||
            item.city.toLowerCase().includes(q));
        // If no exact match found in simulator, generate a dynamic registered company fallback
        if (results.length === 0 && (q.length >= 3 || /^\d+$/.test(q))) {
            const generatedCVR = /^\d{8}$/.test(q) ? q : String(Math.floor(10000000 + Math.random() * 90000000));
            const cleanName = query.replace(/[^\w\s]/gi, '').trim();
            const capitalized = cleanName.charAt(0).toUpperCase() + cleanName.slice(1);
            return [
                {
                    cvrNumber: generatedCVR,
                    name: `${capitalized} Enterprise A/S`,
                    legalName: `${capitalized.toUpperCase()} ENTERPRISE A/S`,
                    companyType: 'A/S (Public Limited)',
                    industry: 'Enterprise Software & Technology Services',
                    businessCategory: 'Information Technology',
                    website: `https://www.${cleanName.toLowerCase().replace(/\s+/g, '')}.dk`,
                    primaryEmail: `contact@${cleanName.toLowerCase().replace(/\s+/g, '')}.dk`,
                    primaryPhone: '+45 70 ' + Math.floor(10 + Math.random() * 89) + ' ' + Math.floor(10 + Math.random() * 89) + ' 00',
                    addressLine1: 'Vesterbrogade 149',
                    city: 'Copenhagen',
                    postalCode: '1620',
                    country: 'Denmark',
                    employeeCount: 150,
                    annualRevenue: 12500000,
                    foundedYear: 2018,
                    vatNumber: `DK${generatedCVR}`,
                    status: 'Active'
                }
            ];
        }
        return results;
    }
};
