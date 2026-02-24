export interface ContentSection {
    id: string;
    title: {
        en: string;
        kh: string;
    };
    content: {
        en: string | string[];
        kh: string | string[];
    };
    image?: {
        src: string;
        alt: string;
        caption?: string;
        position?: 'top' | 'bottom' | 'left' | 'right' | 'full';
    };
    images?: Array<{
        src: string;
        alt: string;
        caption?: string;
    }>;
    subsections?: ContentSection[];
}

export interface SocialTopic {
    id: string;
    title: {
        en: string;
        kh: string;
    };
    subtitle: {
        en: string;
        kh: string;
    };
    category: {
        en: string;
        kh: string;
    };
    sections: ContentSection[];
    reference: {
        en: string;
        kh: string;
    };
}

export const socialContent: Record<string, SocialTopic> = {
    governance: {
        id: "governance",
        title: {
            en: "Governance",
            kh: "អភិបាលកិច្ច"
        },
        subtitle: {
            en: "Policies, oversight and institutional frameworks for social services.",
            kh: "គោលនយោបាយ ការត្រួតពិនិត្យ និងក្របខណ្ឌស្ថាប័នសម្រាប់សេវាកម្មសង្គម។"
        },
        category: {
            en: "Governance",
            kh: "អភិបាលកិច្ច"
        },
        reference: {
            en: "National Social Protection Policy Framework 2016-2025",
            kh: "ក្របខ័ណ្ឌគោលនយោបាយជាតិគាំពារសង្គម ឆ្នាំ២០១៦-២០២៥"
        },
        sections: [
            {
                id: "overview",
                title: {
                    en: "4.1 General Overview",
                    kh: "៤.១ ទិដ្ឋភាពទូទៅ និងបញ្ហាប្រឈម"
                },
                content: {
                    en: "Currently, social protection policies have been set forth by many ministries and institutions in accordance with their own functions and duties.\ MoSAVY has the mandate to set up policies related to both social assistance programs and social security schemes, including those for civil servants, veterans, and for people with disabilities. MoLVT focuses on social security for workers and employees that are under the provisions of the Labor Law. MoH is in charge of the HEF which provides health protection to poor and vulnerable people and promotes the health of mothers and children. MoEYS focuses on supporting school feeding programs and providing scholarships. MEF is in charge of the food security programs. CARD, in addition, acts as a coordinator for setting up social assistance policies.",
                    kh: "កន្លងមកបច្ចុប្បន្ន គោលនយោបាយអភិវឌ្ឍន៍ប្រព័ន្ធគាំពារសង្គម ត្រូវបានដាក់ចេញដោយក្រសួង-ស្ថាប័នរដ្ឋជាច្រើនទៅតាមមុខងារនិងភារកិច្ចរៀងៗខ្លួន។"
                }
            },
            {
                id: "challenges",
                title: {
                    en: "4.2 Challenges",
                    kh: "៤.២ បញ្ហាប្រឈម"
                },
                content: {
                    en: [
                        "The separate processes of setting up social protection policies in various ministries and institutions indicate the lack of a unified coordination mechanism. The arrangement has led to inconsistencies, gaps, and overlaps of each policy, which negatively impacts the effectiveness and efficiency in the use of resources, both financial and human.",
                        "In addition, the mechanism to monitor and evaluate the effectiveness of the management or operation of each program is not yet well defined, creating obstacles to the measurement of productivity and effectiveness of public expenditure and difficulties in implementing other policies that might follow."
                    ],
                    kh: [
                        "ការរៀបចំគោលនយោបាយគាំពារសង្គមដោយឡែកពីគ្នារបស់ក្រសួង-ស្ថាប័ននីមួយៗ បង្ហាញពីកង្វះខាតនូវយន្តការសម្របសម្រួលរួមមួយ។ កត្តានេះនាំឲ្យមានអសង្គតិភាព ភាពខ្វះចន្លោះ ឬភាពត្រួតស៊ីគ្នារវាងគោលនយោបាយនីមួយៗ ដែលមានផលប៉ះពាល់ជាអវិជ្ជមានដល់ប្រសិទ្ធភាពនៃការប្រើប្រាស់ធនធាន ទាំងធនធានហិរញ្ញវត្ថុ និងធនធានមនុស្ស។",
                        "មិនតែប៉ុណ្ណោះ យន្តការតាមដាន និងត្រួតពិនិត្យអំពីប្រសិទ្ធភាពនៃការគ្រប់គ្រង ឬដំណើរការកម្មវិធីជាតិនីមួយៗក៏មិនទាន់មានវត្តមាននៅឡើយ ដែលនេះជាឧបសគ្គសម្រាប់ការវាស់ស្ទង់ផលិត-ភាពនិងប្រសិទ្ធភាពនៃការវិនិយោគសាធារណៈរបស់រដ្ឋ ព្រមទាំង ផ្តល់ផលវិបាកផងដែរក្នុងការកំណត់គោលនយោបាយអភិវឌ្ឍន៍ជាបន្តបន្ទាប់។"
                    ]
                }
            },
            {
                id: "future-strategy",
                title: {
                    en: "4.3 Future Strategy and Goals",
                    kh: "៤.៣ យុទ្ធសាស្ត្រ និងគោលដៅអនាគត"
                },
                content: {
                    en: "In light of the identified challenges and shortcomings of the governance structure of the social protection system, the Royal Government aims to establish a concentrated, integrated, consistent, and effective organizational framework for the social protection system which covers the public and the private sector likewise. It will provide clear definitions of roles and responsibilities within and among policy-makers, regulators, and operators.",
                    kh: "នៅចំពោះមុខបញ្ហាប្រឈម និងចំណុចខ្វះខាតលើរចនាសម្ព័ន្ធនៃការគ្រប់គ្រងប្រព័ន្ធគាំពារសង្គមនេះ រាជរដ្ឋាភិបាលបានកំណត់នូវគោលដៅក្នុងការរៀបចំឲ្យមានប្រព័ន្ធគាំពារសង្គម ដែលមានលក្ខណៈប្រមូលផ្តុំ សង្គតិភាព និងប្រសិទ្ធភាព គ្របដណ្តប់ទាំងវិស័យសាធារណៈ និងឯកជន ដែលត្រូវមានការកំណត់ និងបែងចែកតួនាទីច្បាស់លាស់រវាង និងក្នុងកម្រិតនីមួយៗ ពោលគឺកម្រិតគោលនយោបាយ កម្រិតបញ្ញតិ្តករ និងកម្រិតប្រតិបត្តិករ។"
                },
                subsections: [
                    {
                        id: "policy-maker",
                        title: {
                            en: "4.3.1 Policy-Maker",
                            kh: "៤.៣.១ កម្រិតគោលនយោបាយ"
                        },
                        content: {
                            en: "To develop the social protection system and to ensure better harmonization of the different strategies, policies, and other social protection activities, the Royal Government will establish the \"National Social Protection Council\" (NSPC). The NSPC will be the key actor responsible for the overall coordination and steering on the development of various social protection strategies and policies.",
                            kh: "ដើម្បីលើកកម្ពស់ការអភិវឌ្ឍប្រព័ន្ធគាំពារសង្គមឲ្យកាន់តែប្រសើរឡើង ព្រមទាំង ដើម្បីឆ្លើយតបនឹងតម្រូវការបន្ស៊ីយុទ្ធសាស្រ្ត គោលនយោបាយ និងសកម្មភាពគាំពារសង្គមនានា រាជរដ្ឋាភិបាលនឹងបង្កើត \"ក្រុមប្រឹក្សាជាតិគាំពារសង្គម\" ដែលមានតួនាទីជាសេនាធិការរបស់រាជរដ្ឋាភិបាលក្នុងការសម្របសម្រួល និងតម្រង់ទិសជាយុទ្ធសាស្ត្ររួម លើការងាររៀបចំគោលនយោបាយគាំពារសង្គមដែលមានលក្ខណៈគ្រប់ជ្រុងជ្រោយ។"
                        },
                        subsections: [
                            {
                                id: "responsibilities",
                                title: {
                                    en: "Responsibilities of NSPC",
                                    kh: "មុខងារនៃក្រុមប្រឹក្សាជាតិគាំពារសង្គម"
                                },
                                content: {
                                    en: "The NSPC will have the following responsibilities: (1) coordinate the policy drafting on the social protection system among relevant ministries and institutions to submit a common policy proposal to the Royal Government for approval, (2) monitor and evaluate the progress and effectiveness of the social protection policy implementation to ensure a smooth, consistent, efficient and effective process, (3) connect and harmonize the social assistance system with the social security system, in order to ensure their consistency and to align positions on the social protection system for additional actions as well as to allow the possible transfers of members from one system to another, if necessary. The NSPC should have a Secretariat to cover its daily operations. The Secretariat will be established within a ministry or institution, based on the principles of effectiveness, managerial efficiency, and institutional coordination.",
                                    kh: "ក្រុមប្រឹក្សាជាតិគាំពារសង្គម មានមុខងារ (១) សម្របសម្រួលការរៀបចំគោលនយោបាយអភិវឌ្ឍន៍ប្រព័ន្ធគាំពារសង្គមរវាងក្រសួង-ស្ថាប័នពាក់ព័ន្ធទាំងអស់ ឲ្យមានលក្ខណៈជាគោលនយោបាយរួមដើម្បីដាក់ស្នើសុំការអនុម័តពីប្រមុខរាជរដ្ឋាភិបាល (២) ពិនិត្យ និងតាមដានលើវឌ្ឍនភាព និងប្រសិទ្ធភាពនៃការអនុវត្តគោលនយោបាយគាំពារសង្គម ដើម្បីជំរុញឲ្យការអនុវត្តប្រព្រឹត្តទៅដោយរលូន មានសង្គតិភាព ប្រសិទ្ធភាព និងសក្តិសិទ្ធិភាព និង (៣) ផ្សារភ្ជាប់ និងបន្ស៊ីប្រព័ន្ធជំនួយសង្គមជាមួយនឹងប្រព័ន្ធសន្តិសុខសង្គម ដើម្បីធានាសង្គតិភាព និងបំពេញបន្ថែមសកម្មភាពចាំបាច់ នៅក្នុងចក្ខុវិស័យរួមនៃប្រព័ន្ធគាំពារសង្គម និងផ្តល់លទ្ធភាពសម្រាប់ការផ្ទេរក្រុមគោលដៅពីប្រព័ន្ធមួយទៅប្រព័ន្ធមួយទៀតនៅពេលដែលឱកាសផ្តល់ឲ្យ។"
                                }
                            }
                        ]
                    },
                    {
                        id: "regulator",
                        title: {
                            en: "4.3.2 Regulator",
                            kh: "៤.៣.២ កម្រិតនិយ័តករ"
                        },
                        content: {
                            en: [
                                "Unlike the Social Assistance system and activities which are financed by the state budget, the success of the Social Security System depends on the trust of the participants who contribute to it. Therefore, it requires a proper monitoring mechanism to ensure that the benefits of the participants are safeguarded. The implementation of the social security schemes is complicated and associated with high risks, which might affect the stability of the financial sector, the national budget, and the country's economy as a whole. Therefore, the Royal Government will establish a social security regulator to manage and coordinate the operation and management of the various schemes. This regulatory body's main role is to monitor the financial situation, determine prudential regulation, standards of operation, additional measures, and control the schemes' compliance. It will ensure that the social security schemes are operated in a transparent, accountable, and financially sustainable manner. Furthermore, the regulator will develop mechanisms to protect customers and to arbitrate conflicts.",
                                "To enhance the efficiency and effectiveness of the system and to avoid establishing additional institutions opposing the principle of efficient budgetary spending, the Secretariat of the NSPC will function as the regulator."
                            ],
                            kh: [
                                "ខុសប្លែកពីកម្មវិធី និងសកម្មភាពនៃប្រព័ន្ធជំនួយសង្គម ដែលទទួលហិរញ្ញប្បទានពីថវិកាជាតិ ភាពជោគជ័យនៃប្រព័ន្ធសន្តិសុខសង្គម គឺអាស្រ័យលើទំនុកចិត្តរបស់អ្នកចូលរួមដែលបានបង់ភាគទាន។ ចំណុចនេះទាមទារឲ្យមានយន្តការត្រួតពិនិត្យ និងតាមដានជាទៀងទាត់ដើម្បីធានាថា ផលប្រយោជន៍របស់អ្នកចូលរួមក្នុងរបបនីមួយៗត្រូវបានរក្សា។ លើសពីនេះ ដំណើរការរបបសន្តិសុខសង្គមមានលក្ខណៈស្មុគស្មាញនិងហានិភ័យខ្ពស់ ដែលអាចជះឥទ្ធិពលដល់ស្ថិរភាពនៃវិស័យហិរញ្ញវត្ថុ និងថវិកាជាតិ ព្រមទាំង សេដ្ឋកិច្ចជាតិទាំងមូល។ ដូច្នេះ រាជរដ្ឋាភិបាលនឹងបង្កើតនិយ័តករសន្តិសុខសង្គម ដើម្បីគ្រប់គ្រងនិងត្រួតពិនិត្យដំណើរការប្រព្រឹត្តទៅរបស់ស្ថាប័នប្រតិបត្តិករសន្តិសុខសង្គម។ និយ័តករមានតួនាទីចម្បងក្នុងការតាមដានស្ថានភាពហិរញ្ញវត្ថុ កំណត់បទប្បញ្ញត្តិប្រុងប្រយ័ត្ន ស្តង់ដារប្រតិបត្តិការ និងវិធានចាំបាច់នានា ព្រមទាំង ត្រួតពិនិត្យអនុលោមភាពដើម្បីធានាថាប្រតិបត្តិការនៅក្នុងការផ្តល់សេវាសន្តិសុខសង្គមប្រព្រឹត្តទៅប្រកបដោយតម្លាភាព គណនេយ្យភាព និងចីរភាពហិរញ្ញវត្ថុ។ ទន្ទឹមនេះ ការបង្កើតយន្តការការពារសមាជិក និងផ្សះផ្សាវិវាទនៅពេលមានទំនាស់ ក៏ជាការទទួលខុសត្រូវរបស់ស្ថាប័ននិយ័តករផងដែរ។",
                                "ដើម្បីពង្រឹងប្រសិទ្ធភាពនៃការបំពេញការងារ និងដើម្បីចៀសវាងនូវការបង្កើតស្ថាប័នច្រើន និងរាយប៉ាយ ដែលនាំឲ្យមានផលប៉ះពាល់ដល់ប្រសិទ្ធភាពនៃការចំណាយថវិកាជាតិ អគ្គលេខាធិការដ្ឋាននៃក្រុមប្រឹក្សាជាតិគាំពារសង្គម នឹងបំពេញមុខងារបន្ថែមជាស្ថាប័ននិយ័តករដើម្បីតាមដាន គ្រប់គ្រង និងត្រួតពិនិត្យរាល់ប្រតិបត្តិការរបស់ប្រតិបត្តិករសន្តិសុខសង្គម។"
                            ]
                        }
                    },
                    {
                        id: "operator",
                        title: {
                            en: "4.3.3 Operator",
                            kh: "៤.៣.៣ កម្រិតប្រតិបត្តិករ"
                        },
                        content: {
                            en: "One of the main goals of the social protection reform is to re-organize the management structure of the operators to promote management efficiency and effectiveness of budget spending. To this point, the Royal Government will introduce a set of reforms.",
                            kh: "គោលដៅចម្បងមួយនៃការធ្វើកំណែទម្រង់ប្រព័ន្ធគាំពារសង្គមនេះ គឺការរៀបចំឡើងវិញនូវរចនាសម្ព័ន្ធគ្រប់គ្រងរបស់ស្ថាប័នប្រតិបត្តិករ ដើម្បីធានាបាននូវប្រសិទ្ធភាពនៃការគ្រប់គ្រង និងដើម្បីបង្កើនប្រសិទ្ធភាពចំណាយថវិកាផងដែរ។ តាមរយៈនេះ រាជរដ្ឋាភិបាលនឹងធ្វើការកែទម្រង់ស្ថាប័នប្រតិបត្តិករ។"
                        },
                        subsections: [
                            {
                                id: "social-assistance-operator",
                                title: {
                                    en: "4.3.3.1 Social Assistance Operator",
                                    kh: "៤.៣.៣.១ ប្រតិបត្តិករជំនួយសង្គម"
                                },
                                content: {
                                    en: [
                                        "The Royal Government will assess possibilities to create a social assistance fund to manage and launch the National Social Assistance Program, specifically with regard to cash transfers. The aim of the fund is to provide a mechanism to integrate all cash transfer programs into one single hub in the future.",
                                        "The social assistance fund also plays a significant role in organizing the work at the sub-national level to promote and improve the effectiveness of social assistance services provision and to coordinate the management of member registration systems to ensure comprehensiveness and concentration."
                                    ],
                                    kh: [
                                        "រាជរដ្ឋាភិបាលនឹងសិក្សាលើលទ្ធភាពក្នុងការបង្កើតមូលនិធិជំនួយសង្គម ដើម្បីគ្រប់គ្រង និងដាក់ឲ្យដំណើរការកម្មវិធីជាតិជំនួយសង្គមដែលមានលក្ខណៈជាកម្មវិធីឧបត្ថម្ភជាសាច់ប្រាក់។ ការបង្កើតមូលនិធិនេះ គឺជាការរៀបចំយន្តការសម្រាប់ការបោះជំហានទៅរកការធ្វើសមាហរណកម្មកម្មវិធីឧបត្ថម្ភសាច់ប្រាក់ទាំងអស់ឲ្យទៅជាកញ្ចប់កម្មវិធីតែមួយនៅពេលអនាគតផងដែរ។",
                                        "មូលនិធិជំនួយសង្គម ក៏ដើរតួយ៉ាងសំខាន់ផងដែរក្នុងការរៀបចំយន្តការបំពេញការងារជាមួយថ្នាក់ក្រោមជាតិ ដើម្បីជំរុញ និងបង្កើនប្រសិទ្ធភាពក្នុងការផ្តល់សេវាជំនួយសង្គមទាំងឡាយ ព្រមទាំង សម្របសម្រួលលើការរៀបចំការគ្រប់គ្រងប្រព័ន្ធចុះបញ្ជីសមាជិកឲ្យមានលក្ខណៈទូលំទូលាយ និងប្រមូលផ្តុំ។"
                                    ]
                                }
                            },
                            {
                                id: "social-security-operator",
                                title: {
                                    en: "4.3.3.2 Social Security Operator",
                                    kh: "៤.៣.៣.២ ប្រតិបត្តិករសន្តិសុខសង្គម"
                                },
                                content: {
                                    en: "The Royal Government will integrate the existing social security operators NSSFC, NFV, NSSF, and PWDF into one single institution. The new institution is a public administrative institution established by law and tasked with governing and managing all social security schemes, including pensions, health insurance, employment injuries insurance, disability insurance, and unemployment insurance.",
                                    kh: "រាជរដ្ឋាភិបាលនឹងធ្វើកំណែទម្រង់ស្ថាប័ន តាមរយៈការធ្វើសមាហរណកម្មស្ថាប័នប្រតិបត្តិករដែលមានស្រាប់ទាំងអស់ពោលគឺ ប.ជ.ស ប.ជ.អ ប.ស.ស និង ម.ជ.ព ឲ្យទៅជាស្ថាប័នតែមួយ។ ស្ថាប់នថ្មីនេះគឺជាគ្រឹះស្ថានសាធារណៈ ដែលមានមុខងារគ្រប់គ្រង និងចាត់ចែងរបបសន្តិសុខសង្គមទាំងអស់រួមមាន៖ សោធន ថែទាំសុខភាព ហានិភ័យការងារ ពិការភាព និងនិកម្មភាព។ល។"
                                },
                                subsections: [
                                    {
                                        id: "management-structure",
                                        title: {
                                            en: "Management Structure of Social Security Operator",
                                            kh: "រចនាសម្ព័ន្ធគ្រប់គ្រង"
                                        },
                                        content: {
                                            en: "",
                                            kh: "ការគ្រប់គ្រងរបស់ស្ថាប័នប្រតិបត្តិករសន្តិសុខសង្គមត្រូវអនុវត្តទៅតាមគោលការណ៍ជាមូលដ្ឋានដូចខាងក្រោម៖"
                                        },
                                        subsections: [
                                            {
                                                id: "board",
                                                title: {
                                                    en: "A. Board of Directors",
                                                    kh: "ក. ក្រុមប្រឹក្សាភិបាល"
                                                },
                                                content: {
                                                    en: "The Board of Directors of the new institution should comprise representatives of all relevant stakeholders including government institutions, employers, employees, and health service providers.",
                                                    kh: "ក្រុមប្រឹក្សាភិបាលរបស់ស្ថាប័នថ្មីនេះ គួរតែមានសមាសភាពជាអ្នកតំណាងរបស់អ្នកពាក់ព័ន្ធទាំងអស់រួមទាំងសថាប័នរដ្ឋាភិបាល និងតំណាងអ្នកចូលរួមគឺ ទីភ្នាក់ងារផ្តល់ការងារ និងសេវាសុខាពភិបាលដូចជាក្រុមហ៊ុន និងសហជីពទាំងបណ្តាដែលពាក់ព័ន្ធ។ល។"
                                                }
                                            },
                                            {
                                                id: "committees",
                                                title: {
                                                    en: "B. Specialized Committees",
                                                    kh: "ខ. គណៈកម្មាធិការជំនាញ"
                                                },
                                                content: {
                                                    en: "A number of specialized committees should be set up to promote working efficiency. A committee for health quality assurance, an investment committee, and an audit committee should, at least, be foreseen.",
                                                    kh: "គណៈកម្មាធិការជំនាញ ជាច្រើនគួរតែបង្កើតឡើង ដើម្បីជំរុញប្រសិទ្ធភាពការងារ។ យ៉ាងហោចណាស់ ក៏ត្រូវមានគណ:កម្មាធិការសម្រាប់ធានាគុណភាពសុខភាព គណកម្មាក់ិការវិនិយោគ គណកម្មាធិការសវនកម្ម។ល។"
                                                }
                                            },
                                            {
                                                id: "operational-principles",
                                                title: {
                                                    en: "C. Operational Principles",
                                                    kh: "គ. គោលការណ៍ប្រតិបត្តិ"
                                                },
                                                content: {
                                                    en: "The operation of the new institution has to be based on the principles of good governance. The operators have to adhere the following principles: (1) provide an accounting system which meets certain quality standards, (2) set up an internal audit and control system, (3) provide independent audits on financial reports, (4) ensure public dissemination of the financial reports, (5) be subject to an independent evaluation of the management effectiveness for every 5 or 10 years.",
                                                    kh: "ការប្រតិបត្តិរបស់ស្ថាប័នថ្មី ត្រូវផ្អែកជាមូលដ្ឋានលើគោលការណ៍អភិបាលកិច្ចល្អ។ ប្រតិបត្តិករត្រូវគោរពតាមគោលការណ៍ដូចខាងក្រោម៖ (១) ធ្វើការផ្តល់ប្រព័ន្ធគណនេយ្យ ដែលឆ្លើយតបនូវលក្ខណស្តង់ដារគុណភាពជាក់លាក់ (២) បង្កើតប្រព័ន្ធសវនកម្ម និងត្រួតពិនិត្យគ្រប់គ្រងផ្ទៃក្នុង (៣) ធានានិងផ្តល់របាយការណ៍ហិរញ្ញវត្ថុដែលឆ្លងកាត់ការសវនកម្មឯករាជ្យ (៤) ធ្វើការផ្សព្វផ្សាយជាសាធារណៈនូវរបាយការណ៍ហិរញ្ញវត្ថុ (៥) ស្ថិតក្រោមការវាយតម្លៃរបស់អង្គភាពឯករាជ្យលើប្រសិទ្ធភាពនៃការគ្រប់គ្រង គ្រប់ៗ ៥ឬ១០ឆ្នាំម្តង។"
                                                }
                                            },
                                            {
                                                id: "cross-subsidization",
                                                title: {
                                                    en: "D. Mechanism of Cross-Subsidization",
                                                    kh: "ឃ. យន្តការធ្វើសម្បទានឆ្លង"
                                                },
                                                content: {
                                                    en: "The Royal Government assesses possible mechanisms to allow cross-subsidization between the different schemes and programs (except for the pension scheme) in order to utilize the surplus resources of one scheme or program to another with respective shortages. This arrangement will help to avoid full reliability on the state budget whenever a scheme faces a budgetary deficit. This cross-subsidization has to take the financial sustainability and financial soundness of the relevant schemes or programs and the need to minimize \"moral hazard\" into consideration.",
                                                    kh: "រាជរដ្ឋាភិបាលនឹងសិក្សា និងវាយតម្លៃលើយន្តការដែលអាចអនុញ្ញាតឲ្យមានការធ្វើការឧបត្ថម្ភឆ្លងពីមួយកម្មវិធីមួយ ទៅកម្មវិធីមួយទៀត (លើកលែងតែកម្មវិធីសោធន) ដើម្បីឲ្យអាចប្រើប្រាស់ធនធានលើសត្រូវការពីមួយកម្មវិធី ឬ មួយប្រព័ន្ធទៅជួយកម្មវិធី និងប្រព័ន្ធទៀតដែលគ្មានធនធានគ្រប់គ្រាន់។ ការរៀបចំនេះនឹងជួយឲ្យកាត់បន្ថយការគឺថលើងវិកាជាតិ នៅពេលដែលមួយប្រព័ន្ធ ឬកម្មវិធីជួបការខ្សែះថវិកា។ ការធ្វើឧបត្ថម្ភឆ្លងនេះ ត្រូវយកចីរភាពហិរញ្ញវត្ថុ និងសុខភាពហិរញ្ញវត្ថុរបស់ប្រព័ន្ធ ឬកម្មវិធី និងតម្រូវការកាត់បន្ថយហានិភ័យនៃសីលធម៌និយមជាចំណុចពិចារណា។"
                                                }
                                            }
                                        ]
                                    }
                                ]
                            }
                        ]
                    }
                ]
            }
        ]
    },

    assistance: {
        id: "assistance",
        title: {
            en: "Social Assistance",
            kh: "ប្រព័ន្ធជំនួយសង្គម"
        },
        subtitle: {
            en: "Programs and support for vulnerable groups, benefits and services.",
            kh: "កម្មវិធី និងការគាំទ្រសម្រាប់ក្រុមងាយរងគ្រោះ អត្ថប្រយោជន៍ និងសេវាកម្ម។"
        },
        category: {
            en: "Assistance",
            kh: "ជំនួយសង្គម"
        },
        reference: {
            en: "National Social Protection Policy Framework 2016-2025",
            kh: "ក្របខ័ណ្ឌគោលនយោបាយជាតិគាំពារសង្គម ឆ្នាំ២០១៦-២០២៥"
        },
        sections: [
            {
                id: "introduction",
                title: {
                    en: "Introduction",
                    kh: "សេចក្តីផ្តើម"
                },
                content: {
                    en: [
                        "The Social Assistance is developed to ensure decent living standards for poor and vulnerable citizens while strengthening the capacity of every citizen to retain their jobs and employment in a competitive economic environment.",
                        "Social assistance programs contribute to the achievements of Cambodia's key development priorities including inclusive growth, poverty reduction, and economic diversification. The presence of social assistance facilitates economic productivity by lifting citizens with low-income and vulnerable groups to the middle-income level. That means that citizens currently belonging to the informal sector will be included in the formal sector in the future. By this step, the national financial stability and the development of the social security schemes will be supported through people's capacity to pay taxes and to contribute to the social security fund.",
                        "The social assistance programs focus on assisting the poor and vulnerable people who are divided into three groups: (1) those who live below the poverty line; (2) those who live close to the poverty line with high vulnerability to crisis; (3) infants, children, pregnant women, families with food insecurity, people with disabilities and elderly."
                    ],
                    kh: [
                        "ប្រព័ន្ធជំនួយសង្គមត្រូវបានបង្កើតឡើងក្នុងគោលបំណងលើកកម្ពស់កម្រិតជីវភាពរស់នៅរបស់​ប្រជាជនក្រីក្រនិងងាយរងគ្រោះ ទន្ទឹមនឹងការពង្រឹងសមត្ថភាពរបស់ពួកគាត់ឲ្យរក្សាបាននូវស្ថិរភាពប្រាក់ចំណូល ក្នុងស្ថានភាពសេដ្ឋកិច្ចដែលមានការប្រកួតប្រជែងខ្លាំង។",
                        "កម្មវិធីនានាក្នុងប្រព័ន្ធជំនួយសង្គម គាំទ្រដល់ការសម្រេចគោលដៅអភិវឌ្ឍន៍ជាអាទិភាពរបស់កម្ពុជា ដែលរួមមាន៖ កំណើនប្រកប​ដោយបរិយាប័ន្ន ការកាត់បន្ថយភាពក្រីក្រ និងពិពិធកម្មសេដ្ឋកិច្ច។ វត្តមានរបស់ប្រព័ន្ធជំនួយសង្គម រួមចំណែកក្នុងការជំរុញកំណើនផលិតភាពក្នុងសេដ្ឋកិច្ច តាមរយៈការផ្លាស់ប្តូរជីវភាពរបស់ប្រជាជនក្រីក្រនិងងាយរងគ្រោះ ទៅជាប្រជាជនដែលមានចំណូលសមរម្យ​ ពោលគឺការបង្វែរក្រុមប្រជាជននៃវិស័យសេដ្ឋកិច្ចក្រៅប្រព័ន្ធទៅក្នុងប្រព័ន្ធ។ កត្តានេះ ក៏ផ្តល់​ផលវិជ្ជមានផងដែរដល់ស្ថិរភាពនៃថវិកាជាតិ និងការអភិវឌ្ឍប្រព័ន្ធសន្តិសុខសង្គម តាមរយៈលទ្ធភាពនៃការបង់ពន្ធ​ជូនរដ្ឋ និងលទ្ធភាពក្នុងការបង់ភាគទានចូលក្នុងមូលនិធិសន្តិសុខសង្គม។",
                        "កម្មវិធីក្នុងប្រព័ន្ធជំនួយសង្គម ផ្តោតលើការផ្តល់ការគាំពារដល់ប្រជាជនក្រីក្រនិងងាយរងគ្រោះ ដែល ក្នុង​នោះត្រូ វបានបែងចែកជាបីក្រុមរួមមាន (១) ប្រជាជនដែលរស់នៅក្រោមបន្ទាត់នៃភាពក្រីក្រ (២) ប្រជាជនរស់នៅក្បែរបន្ទាត់នៃភាពក្រីក្រ ដែលមានការប្រឈមខ្ពស់ពេលមានវិបត្ដិ និង (៣) ប្រជាជន​ដែលងាយរងគ្រោះ ដែលរួមមាន៖ ទារកនិងកុមារ ស្ត្រីមានផ្ទៃពោះ គ្រួសារដែលខ្វះអាហារូបត្ថម្ភ ជនពិការ និងជនចាស់ជរាគ្មានទីពឹង។"
                    ]
                }
            },
            {
                id: "future-strategies",
                title: {
                    en: "Future Strategies and Goals",
                    kh: "យុទ្ធសាស្ត្រ និងគោលដៅអនាគត"
                },
                content: {
                    en: "Future strategies and goals of enhancing the development of the Social Assistance are divided into the following four areas:",
                    kh: "យុទ្ធសាស្ត្រ និងគោលដៅអនាគតក្នុងការពង្រឹងការអភិវឌ្ឍប្រព័ន្ធជំនួយសង្គម ត្រូវបានបែងចែកទៅតាមផ្នែកចំនួន ៤​ ដូចខាងក្រោម៖"
                },
                subsections: [
                    {
                        id: "emergency",
                        title: {
                            en: "1. Emergency Responses",
                            kh: "១. ការឆ្លើយតបនឹងគ្រោះអាសន្ន"
                        },
                        content: {
                            en: [
                                "Institutional capacity and human resources are the two main areas to be improved to get ready for potential crises. The Royal Government will continue improving its national food reserve capacity.",
                                "The Royal Government will explore the possibility of developing a comprehensive database management system in order to correctly identify poor and vulnerable people by linking the system to the ID poor system, which will then be transformed into a single registration system for poor and vulnerable people."
                            ],
                            kh: [
                                "ការកសាងសមត្ថភាពស្ថាប័ន និងធនធានមនុស្ស គឺជាកត្តាចម្បងដែលត្រូវពង្រឹង ដើម្បីត្រៀមខ្លួន​ក្នុងការឆ្លើយតបទៅនឹងគ្រោះមហន្តរាយនានាដែលនឹងកើតមានឡើងជាបន្តបន្ទាប់។ រាជរដ្ឋាភិបាល នឹងបន្តពង្រឹងសមត្ថភាពប្រព័ន្ធស្បៀងបម្រុងកម្រិតជាតិ។",
                                "រាជរដ្ឋាភិបាលនឹងសិក្សាអំពីលទ្ធភាពក្នុងការបង្កើតប្រព័ន្ធគ្រប់គ្រងទិន្នន័យ ដែលមានលក្ខណៈ​ទូលំទូលាយ ដើម្បីកំណត់ឲ្យបានច្បាស់នូវអត្តសញ្ញាណប្រជាជនក្រីក្រនិងងាយរងគ្រោះ តាមរយៈ​ការតភ្ជាប់ជាមួយប្រព័ន្ធគ្រប់គ្រងអត្ត​សញ្ញាណជនក្រីក្រ និងជាបន្តបន្ទាប់អភិវឌ្ឍទៅជាប្រព័ន្ធចុះបញ្ជីរួមសម្រាប់គ្រួសារក្រីក្រនិងងាយរងគ្រោះ។"
                            ]
                        }
                    },
                    {
                        id: "human-capital",
                        title: {
                            en: "2. Human Capital Development",
                            kh: "២. ការអភិវឌ្ឍមូលធនមនុស្ស"
                        },
                        content: {
                            en: "",
                            kh: ""
                        },
                        subsections: [
                            {
                                id: "pregnant-women",
                                title: {
                                    en: "2.1. Protection of Pregnant Women and Children",
                                    kh: "២.១ កម្មវិធីគាំពារស្ត្រីមានផ្ទៃពោះ និងកុមារ"
                                },
                                content: {
                                    en: [
                                        "The Royal Government will study the possibilities to implement a Cash Transfer program for children and pregnant women at the national level, based on the result of the current pilot projects. The critical element necessary in operationalizing this program is to define an operating body with a clear role and responsibility as well as capacity building.",
                                        "The program will be launched in selected priority provinces (those with a high food insecurity rate) first. Evaluation mechanisms will be established to measure the success of the program and its results will be the basis for further expanding the program to other provinces nationwide.",
                                        "In addition, to promote the protection of women and children, the Royal Government support and encourage pregnant women, especially those from poor families, to receive adequate counseling and pregnancy check-ups to protect the health of the unborn children and pregnant women likewise."
                                    ],
                                    kh: [
                                        "រាជរដ្ឋាភិបាលនឹងសិក្សារៀបចំដាក់ឲ្យដំណើរការកម្មវិធីគាំពារស្ត្រីមានផ្ទៃពោះនិងកុមារ​ ដែលផ្តោតលើការលើកកម្ពស់អាហារូបត្ថម្ភក្នុងកម្រិតថ្នាក់ជាតិ ផ្អែកលើលទ្ធផលនៃគម្រោងសាកល្បងបច្ចុប្បន្ន។ សមាសធាតុ​សំខាន់នៃការរៀបចំដាក់ឲ្យដំណើរការកម្មវិធីនេះ គឺការកំណត់ស្ថាប័នអនុវត្ត ដោយបែងចែក តួនាទី និង​ការទទួលខុសត្រូវឲ្យបានច្បាស់​លាស់ រួមទាំង ការកសាងសមត្ថភាព។",
                                        "កម្មវិធីនេះនឹងចាប់ផ្តើមដាក់ឲ្យដំណើរការនៅក្នុងខេត្តអាទិភាពមួយចំនួន (ខេត្តដែល​មានបញ្ហា​​កង្វះ​អាហារូបត្ថម្ភខ្លាំងជាងគេ) នៅដំណាក់កាលដំបូង។ យន្តការវាយតម្លៃអំពីប្រសិទ្ធភាពនៃការ​អនុវត្ត កម្មវិធីនេះនឹងត្រូវបានរៀបចំឡើង ហើយលទ្ធផលនៃការវាយតម្លៃនេះ ក៏នឹងត្រូវបានប្រើប្រាស់ជាមូលដ្ឋានសម្រាប់ការពង្រីកវិសាលភាពអនុវត្តនៅតាមបណ្តាខេត្តដទៃទៀត រហូតទូទាំងប្រទេស។",
                                        "លើសពីនេះ ដើម្បីគាំពារសុខភាពមាតា និងទារក រាជរដ្ឋាភិបាលនឹងបន្តផ្តល់ការទ្រទ្រង់ និងលើកទឹកចិត្តចំពោះស្រ្តីមានផ្ទៃពោះ ជាពិសេសស្រ្តីក្នុងគ្រួសារក្រីក្រ ដើម្បីឲ្យពួកគេអាចទទួលបានការប្រឹក្សាយោបល់ និងការពិនិត្យផ្ទៃពោះសមស្រប។"
                                    ]
                                }
                            },
                            {
                                id: "school-feeding",
                                title: {
                                    en: "2.2. School Feeding Program",
                                    kh: "២.២ កម្មវិធីផ្តល់អាហារនៅតាមសាលារៀន"
                                },
                                content: {
                                    en: "The Royal Government will prepare an action plan and strengthen its human resource capacity to take over the management and financing of the School Feeding Program by 2021. This vision is already envisaged in the \"Roadmap on School Feeding Program\". However, an evaluation and a comprehensive study on management and financing systems are necessary to assure its effectiveness prior to expanding the program. In the meantime, the Royal Government encourages the use of home-grown vegetables in the School Feeding Program to improve the quality of the nutrition of children.",
                                    kh: "រាជរដ្ឋាភិបាលនឹងរៀបចំផែនការសកម្មភាព និងពង្រឹងសមត្ថភាពធនធានមនុស្ស ដើម្បីត្រៀម​ខ្លួនក្នុងការទទួលយកនូវការគ្រប់គ្រង និងធ្វើហិរញ្ញប្បទានសម្រាប់ទ្រទ្រង់​កម្មវិធីនេះនៅឆ្នាំ២០២១ ដែលជាចក្ខុវិស័យបានកំណត់រួចហើយនៅក្នុង​ \"ផែន​ទីបង្ហាញផ្លូវស្តីពីកម្មវិធីផ្តល់អាហារតាមសាលារៀន\"។ ប៉ុន្តែមុននឹងបន្ត និងពង្រីកកម្មវិធីនេះ ចាំបាច់ត្រូវមានការវាយតម្លៃនៅលើការអនុវត្តបច្ចុប្បន្ន ព្រមទាំងការសិក្សាឲ្យបានច្បាស់លាស់នូវយន្តការគ្រប់គ្រង និងភាពទ្រទ្រង់បាននៃថវិកា ដើម្បីធានាប្រសិទ្ធភាពនៃកម្មវិធី។ ទន្ទឹមនឹងនេះ រាជរដ្ឋាភិបាលនឹងជំរុញការដាក់ឲ្យដំណើរការកម្មវិធីផ្តល់អាហារ​នៅតាមសាលារៀនដោយប្រើប្រាស់បន្លែដែលដាំនៅតាមផ្ទះ ដើម្បីបង្កើនគុណភាពអាហារូបត្ថម្ភសម្រាប់​កុមារ។"
                                }
                            },
                            {
                                id: "scholarship",
                                title: {
                                    en: "2.3. Scholarship Program in Primary and Secondary Education",
                                    kh: "២.៣ កម្មវិធីអាហារូបករណ៍សម្រាប់ថ្នាក់បឋមសិក្សា និងមធ្យមសិក្សា"
                                },
                                content: {
                                    en: "The Royal Government will enact a national scholarship policy to determine a suitable management mechanism to provide scholarships effectively at all education levels to encourage children from poor and vulnerable families to enroll in school on time and remain in school until they finished their secondary education. Comprehensive education is indispensable to prevent and avoid an intergenerational poverty trap.",
                                    kh: "រាជរដ្ឋាភិបាលនឹងរៀបចំគោលនយោបាយជាតិស្តីពីអាហារូបករណ៍ ដើម្បីកំណត់អំពីយន្តការ​សម្រាប់ការគ្រប់គ្រង និងផ្តល់អាហារូបករណ៍ឲ្យមានប្រសិទ្ធភាពខ្ពស់នៅគ្រប់កម្រិតសិក្សា ដើម្បីលើកទឹកចិត្តដល់កុមារមកពីគ្រួសារក្រីក្រនិងងាយរងគ្រោះ ឲ្យចុះឈ្មោះចូលរៀនបានទាន់ពេលវេលា ព្រមទាំង ជំរុញឲ្យ​ពួក​គេបន្តការសិក្សារហូតចប់ថ្នាក់មធ្យមសិក្សាទុតិយភូមិ ដែលជាកត្តាចាំបាច់ដើម្បីកាត់ផ្តាច់ការផ្ទេរភាពក្រីក្រពីជំនាន់មួយទៅជំនាន់មួយ។"
                                }
                            }
                        ]
                    },
                    {
                        id: "vocational",
                        title: {
                            en: "3. Vocational Training",
                            kh: "៣. ការបណ្តុះបណ្តាលវិជ្ជាជីវៈ"
                        },
                        content: {
                            en: [
                                "The Royal Government will expand the scope of the existing vocational training, with more focus on Skill Bridging Programs for school-dropped-out young people and on the Voucher Skill Training Programs for poor people from rural areas enabling them to receive certified training.",
                                "The Royal Government will continue to implement cash transfer programs to support vocational training with certificate levels 1-3 for the poor young people and women in priority sectors such as construction, mechanical maintenance, information and communication technologies (ICT), manufacturing, and electronics.",
                                "Moreover, to promote young people's participation in the labor market, the Royal Government will consider allowing those who are already active in the labor market to acquire additional skills and experiences through training.",
                                "To improve the efficiency and effectiveness of the programs, the responsible ministries have to have proper monitoring and evaluation mechanism."
                            ],
                            kh: [
                                "រាជរដ្ឋាភិបាលនឹងបង្កើន និងពង្រីកវិសាលភាពនៃការបណ្តុះបណ្តាលវិជ្ជាជីវៈឲ្យកាន់តែទូលំ​-ទូលាយ ជាពិសេស តាមរយៈការផ្តោតលើការពង្រីកកម្មវិធីស្ពានចម្លងបន្តជំនាញ  សម្រាប់យុវជនដែលស្ថិតនៅក្រៅប្រព័ន្ធអប់រំផ្លូវការ និងកម្មវិធីបណ្តុះបណ្តាលជំនាញតាមលិខិត​បញ្ជាក់ (Voucher Skills Training Program – VSTP) សម្រាប់ប្រជាជនក្រីក្រនៅតាមជនបទ ដើម្បីទទួលយកវគ្គបណ្តុះបណ្តាលដែលមានវិញ្ញាបនបត្រ។",
                                "រាជរដ្ឋាភិបាលនឹងបន្តជំរុញការអនុវត្តកម្មវិធីឧបត្ថម្ភសាច់ប្រាក់ ដើម្បីទ្រទ្រង់ការបណ្តុះបណ្តាល​វិញ្ញាបនបត្រកម្រិត ១-៣ ជូនដល់យុវជនក្រីក្រ និងស្ត្រីនៅក្នុងវិស័យអាទិភាព ដូចជា៖ វិស័យសំណង់ ជួស​ជុលគ្រឿងចក្រ ព័ត៌មានវិទ្យា កម្មន្តសាល និងអគ្គិសនី ជាដើម។",
                                "លើសពីនេះ ដើម្បីលើកកម្ពស់ការចូលរួមរបស់យុវជននៅក្នុងទីផ្សារការងារ រាជរដ្ឋាភិបាលក៏​នឹង​គិតគូរផងដែរអំពីការផ្តល់លទ្ធភាពជូនយុវជនដែលស្ថិតក្នុងកម្លាំងពលកម្មស្រាប់ ដើម្បីអាចទទួលបាន​ការបំពាក់បំប៉នក្នុងការបង្កើនជំនាញ និងបទពិសោធន៍របស់ខ្លួនថែមទៀត។",
                                "ដើម្បីពង្រឹងប្រសិទ្ធភាព និងសក្តិសិទ្ធិភាពនៃកម្មវិធីបណ្តុះបណ្តាលវិជ្ជាជីវៈទាំងឡាយ ក្រសួង-ស្ថាប័នមានសមត្ថកិច្ច ត្រូវមានយន្តការតាមដាន និងវាយតម្លៃសមស្រប។"
                            ]
                        }
                    },
                    {
                        id: "social-welfare",
                        title: {
                            en: "4. Social Welfare of Vulnerable People",
                            kh: "៤. សុខុមាលភាពរបស់ប្រជាជនងាយរងគ្រោះ"
                        },
                        content: {
                            en: "",
                            kh: ""
                        },
                        subsections: [
                            {
                                id: "disabilities-cash",
                                title: {
                                    en: "4.1. Cash transfer for people with disabilities",
                                    kh: "៤.១ កម្មវិធីឧបត្ថម្ភសាច់ប្រាក់សម្រាប់ជនពិការ"
                                },
                                content: {
                                    en: [
                                        "The Royal Government will continue to implement allowance schemes for people with disabilities as indicated in the Sub-decree on Allowance for People with Disabilities at Community Level. The scheme will focus on people with disabilities who are members of households holding an ID poor card.",
                                        "The benefits and conditions of the scheme will be determined by the availability/ fiscal space of the public budget. The design of the mechanisms to identify people with disabilities is a key task to ensure the efficiency of the program."
                                    ],
                                    kh: [
                                        "រាជរដ្ឋាភិបាលនឹងបន្តការដាក់ឲ្យដំណើរការកម្មវិធីឧបត្ថម្ភសាច់ប្រាក់សម្រាប់ជនពិការ ដែ​ល​​​បានកំណត់នៅក្នុងអនុក្រឹត្យស្តីពីរបបគោលនយោបាយចំពោះជនពិការ​ក្រីក្រនៅតាមសហគមន៍។ កម្មវិធី​នេះនឹងត្រូវដាក់ឲ្យអនុវត្តសម្រាប់ជនពិការដែលជាសមាជិកនៃគ្រួសារក្រីក្រ ដែលកាន់កាប់បណ្ណសមធម៌។",
                                        "អត្ថប្រយោជន៍ និងលក្ខខណ្ឌនៃកម្មវិធីនេះនឹងត្រូវកំណត់ដោយផ្អែកលើលទ្ធភាព​ទ្រទ្រង់នៃថវិ​​កាជាតិ។ ការរៀបចំយន្តការកំណត់អត្តសញ្ញាណរបស់ជនពិការ គឺជាកត្តាចាំបាច់​ដើម្បីធានា​បាននូវប្រសិ​ទ្ធភាពនៃការផ្តល់អត្ថប្រយោជន៍តាមរយៈកម្មវិធីនេះ។"
                                    ]
                                }
                            },
                            {
                                id: "elderly",
                                title: {
                                    en: "4.2. Elderly People Protection Program",
                                    kh: "៤.២ កម្មវិធីគាំពារជនចាស់ជរា"
                                },
                                content: {
                                    en: [
                                        "The Royal Government will assess possibilities to support elderly people who are members of poor households holding an ID Poor card. The benefits and conditions of the programs will be determined based on fiscal space.",
                                        "The program could be implemented as a family package together with the cash transfer program for pregnant women and children."
                                    ],
                                    kh: [
                                        "រាជរដ្ឋាភិបាលនឹងសិក្សាអំពីលទ្ធភាពក្នុងការដាក់ឲ្យដំណើរការកម្មវិធីគាំពារជនចាស់ជរា ដែល​ជាសមាជិកនៃគ្រួសារដែលកាន់កាប់បណ្ណសមធម៌។ អត្ថប្រយោជន៍ និងលក្ខខណ្ឌនៃកម្មវិធីនេះនឹងត្រូវកំណត់ដោយផ្អែកលើលទ្ធភាព​ទ្រទ្រង់នៃថវិកាជាតិ។",
                                        "កម្មវិធីនេះនឹងត្រូវសិក្សាដាក់ឲ្យដំណើរការជាកម្មវិធីកញ្ចប់គ្រួសារ (Family Package) រួម​ជាមួយនឹងកម្មវិធីគាំពារស្ត្រីមានផ្ទៃពោះ និងកុមារ ។"
                                    ]
                                }
                            }
                        ]
                    }
                ]
            }
        ]
    },

    security: {
        id: "security",
        title: {
            en: "Social Security",
            kh: "ប្រព័ន្ធសន្តិសុខសង្គម"
        },
        subtitle: {
            en: "Contributory and non-contributory systems: pensions, insurance.",
            kh: "ប្រព័ន្ធបង់ភាគទាន និងមិនបង់ភាគទាន៖ សោធន និងធានារ៉ាប់រង។"
        },
        category: {
            en: "Security",
            kh: "សន្តិសុខសង្គម"
        },
        reference: {
            en: "National Social Protection Policy Framework 2016-2025",
            kh: "ក្របខ័ណ្ឌគោលនយោបាយជាតិគាំពារសង្គម ឆ្នាំ២០១៦-២០២៥"
        },
        sections: [
            {
                id: "introduction",
                title: {
                    en: "Introduction",
                    kh: "សេចក្តីផ្តើម"
                },
                content: {
                    en: [
                        "While the Social Assistance is the mechanism for supporting poor and vulnerable people directly and indirectly, which is usually provided for by the state and financed by the state budget, the Social Security has developed a toolbox of different instruments and is \"obligatory\" and \"self-dependent\". It encourages citizens to seek protection in the face of the unforeseen social and economic crisis which can negatively affect their income security and increase their vulnerability to illness, maternity, employment injuries, unemployment, disability, old age, or death.",
                        "The Social Security is a contributory system which requires the participation from both employers and employees, both in the public and private sector, retirees and people working in the informal sector. However, the Royal Government will provide a full subsidy to cover the contributions of poor and vulnerable people as well as for additional targeted groups as determined by the Royal Government and to the extent the national budget allows for.",
                        "Eligibility for a full or partial subsidy will be assessed based on clear and appropriate criteria in order to avoid \"moral hazard\". Potential \"moral hazard\" may discourage people from personal savings in order to protect themselves against unexpected risks or negatively impact their productivity.",
                        "Therefore, the Royal Government will reduce its funding gradually over time has given a positive socio-economic development for the affected citizens. In consequence, social security schemes will continuously be increasingly financed by contributions and the investment return of the accumulated fund."
                    ],
                    kh: [
                        "ក្នុងខណៈដែលប្រព័ន្ធជំនួយសង្គម គឺជាយន្តការផ្តល់ការទ្រទ្រង់ឧបត្ថម្ភដោយផ្ទាល់ ឬដោយប្រយោលចំពោះប្រជាជនក្រីក្រនិងងាយរងគ្រោះ ដែលជាធម្មតាត្រូវប្រើប្រាស់ហិរញ្ញប្បទានថវិកាជាតិ និង\ ឬជំនួយអភិវឌ្ឍន៍ផ្លូវការ ប្រព័ន្ធសន្តិសុខសង្គមបង្កើតនូវយន្តការមានលក្ខណៈ \"កាតព្វកិច្ច\" និង \"ខ្លួនទីពឹងខ្លួន\" ដែលលើកទឹកចិត្តនិងជំរុញឲ្យប្រជាជនស្វែងរកការគាំពារចំពោះមុខហានិភ័យ ដែលអាចផ្តល់ផល​ប៉ះពាល់ជាអវិជ្ជមានដល់សន្តិសុខប្រាក់ចំណូលរបស់ខ្លួន ដោយសារ ការឈឺថ្កាត់ មាតុភាព គ្រោះថ្នាក់ការងារ និកម្មភាព ពិការភាព ជរាភាព និងមរណភាព ជាដើម។",
                        "ប្រព័ន្ធសន្តិសុខសង្គម គឺជាប្រព័ន្ធ​បង់​ភាគទាន ដែលទាមទារឲ្យមានការចូលរួមពីសំណាក់និយោជិត និងនិយោជក ទាំងក្នុងវិស័យសាធារណៈ និងវិស័យឯកជន និងពីនិវត្តជន ព្រមទាំង ប្រជាជននៃវិស័យសេដ្ឋកិច្ចក្រៅប្រព័ន្ធផងដែរ។ ទោះជាយ៉ាងណា រាជរដ្ឋាភិបាលនឹងរ៉ាប់រងលើការបង់ភាគទានជំនួសប្រជាជនក្រីក្រងាយ​រងគ្រោះ និង​ក្រុមប្រជាជនគោលដៅផ្សេងទៀត ដែលរាជរដ្ឋាភិបាលយល់ថាចាំបាច់ដើម្បីលើកកម្ពស់ជីវភាពជនទាំងនោះទៅ​តាមលទ្ធភាពនៃការទ្រទ្រង់បាននៃថវិកាជាតិ។",
                        "ការរ៉ាប់រងលើការ​​​​បង់ភាគទានជំនួសទាំងស្រុងឬមួយភាគ ត្រូវអនុវត្តដោយ​ផ្អែកលើលក្ខខណ្ឌសមស្រប និងច្បាស់លាស់ ដើម្បីជៀសវាងការកើតឡើងនូវ \"ហានិភ័យចិត្តសាស្រ្ត\" (Moral hazard) ដែលមិនលើកទឹកចិត្តដល់ប្រជាជនឲ្យមានការសន្សំសម្រាប់គាំពារហានិភ័យជាយថាហេតុ និង/ឬដែលអាចមានផលប៉ះពាល់ជាអវិជ្ជមានទៅលើផលិតភាពការងារ។",
                        "ដោយផ្អែកលើហេតុផលនេះ ក៏ដូចជាកត្តាសំខាន់ដទៃទៀតនៅរយៈកាលវែងទៅអនាគត និងនៅពេលលក្ខខណ្ឌសេដ្ឋកិច្ច-សង្គមសមស្រប រាជរដ្ឋាភិបាលនឹងដកខ្លួនបន្តិចម្តងៗពីការធ្វើហិរញ្ញប្បទានរបបសន្តិសុខ​សង្គមជាក់លាក់មួយចំនួន។ ដូចនេះ ប្រព័ន្ធសន្តិសុខសង្គមត្រូវពឹងផ្អែកលើប្រភពហិរញ្ញប្បទានពីការបង់ភាគទាន ព្រមទាំង ចំណូលពីការវិនិយោគ​ធនធានហិរញ្ញវត្ថុដែល​ត្រូវបានប្រមូលផ្តុំនោះ។"
                    ]
                }
            },
            {
                id: "future-strategies",
                title: {
                    en: "Future Strategies and Goals",
                    kh: "យុទ្ធសាស្ត្រ និងគោលដៅអនាគត"
                },
                content: {
                    en: "Future strategies and goals of enhancing the development of the Social Security are divided into the following five areas:",
                    kh: "យុទ្ធសាស្ត្រ និងគោលដៅអនាគតក្នុងការពង្រឹងការអភិវឌ្ឍប្រព័ន្ធសន្តិសុខសសង្គម ត្រូវបានបែងចែកទៅតាមផ្នែកចំនួន ៥​ ដូចខាងក្រោម៖"
                },
                subsections: [
                    {
                        id: "pensions",
                        title: {
                            en: "1. Pensions",
                            kh: "១. សោធន"
                        },
                        content: {
                            en: "The long term vision for the pension system in Cambodia is to provide universal coverage. The future system seeks to offer financial protection at old age to all Cambodian citizens. The respective mechanism should provide decent income to those who participate in the compulsory and voluntary pension schemes and minimize the poverty risk when people, in both formal and informal sector, reach retirement age. The Royal Government aims at creating a concentrated/integrated pension system based on three principles: affordability, efficiency, and sustainability.",
                            kh: "ចក្ខុវិស័យរយៈពេលវែងសម្រាប់ការអភិវឌ្ឍប្រព័ន្ធសោធននៅកម្ពុជា គឺការសម្រេចបាននូវប្រព័ន្ធ​​​​សោធនដែលមានការគ្របដណ្តប់ជាសកល។ ប្រព័ន្ធនេះ មានគោលបំណងផ្តល់ជូនប្រជាជនកម្ពុជាគ្រប់រូប​នូវយន្តការការពារផ្នែក​ហិរញ្ញវត្ថុ​សម្រាប់ពេលចាស់ជរា តាមរយៈការផ្តល់​ប្រាក់ចំណូលសមរម្យចំពោះប្រជាជនដែលចូលរួមក្នុងរបបសោធនកាតព្វកិច្ច និងស្ម័គ្រចិត្ត និងការកាត់​បន្ថយជាអតិបរមានូវការ​ធ្លាក់ខ្លួនទៅក្នុងភាពក្រីក្រនៅពេលចាស់ជរា ចំពោះប្រជាជននៃវិស័យសេដ្ឋកិច្ចទាំងក្នុង និង​ក្រៅ​ប្រព័ន្ធ។ រាជរដ្ឋាភិបាលកំពុងដំណើរការកំណែទម្រង់ប្រព័ន្ធ​សោធន​ឲ្យមានលក្ខណៈប្រមូលផ្តុំ ដោយ​ឈរ​លើគោលការណ៍បីគឺ៖ ភាពដែលអាចទ្រទ្រង់បាន សក្តិសិទ្ធិភាព និងចីរភាព។"
                        },
                        subsections: [
                            {
                                id: "institutional-framework",
                                title: {
                                    en: "1.1 Institutional Framework",
                                    kh: "១.១ ក្របខ័ណ្ឌស្ថាប័ន"
                                },
                                content: {
                                    en: [
                                        "1.1.1 Harmonizing public pension schemes",
                                        "In the future, the Royal Government will set guidelines to recalculate pensions for public officials to gradually reduce the gap in the pension entitlements of public officials. A non-arbitrary mechanism to ensure consistency of the benefit schedules of public pension schemes will be stipulated in the Law on Social Protection System, which requires extensive studies and enough time for preparation.",
                                        "1.1.2. Unifying the governance of existing pension schemes",
                                        "Management and operation of pension schemes of different institutions hinder professional specialization development and pose challenges to the effectiveness and efficiency of service provision at low cost. Therefore, to ensure consistency among different target groups' benefit schedules, to increase budget cost effectiveness, and to accumulate competencies to work effectively and goal-oriented, the Royal Government will integrate the existing pension schemes under one single management system while expanding coverage to all public officials, including officials of legislative, executive, judicial and other public institutions.",
                                        "1.1.3 Establishing a voluntary early retirement system for public officials",
                                        "The Royal Government will establish an early retirement system that allows public officials to retire by law in order to benefit officials who want to leave the state framework due to long service, age, family situation, health or capacity that does not match job requirements. At the same time, the early retirement system will create job opportunities for young people who have appropriate capacity for work. Establishing an early retirement system for public officials requires clear consideration of conditions, benefits or other support to assist public officials who choose this system.",
                                        "1.1.4 Implementing pension scheme for employed workers",
                                        "In addition to reforming the public pension scheme, the Royal Government will study the possibility of establishing and implementing a pension scheme for employed workers under the Labor Law. This scheme will be integrated under a common and consistent management system with the public pension scheme. The Royal Government will consult with employer and employee representatives to determine appropriate and acceptable contribution rates and benefit schedules.",
                                        "1.1.5 Implementing pension scheme for non-poor informal sector population",
                                        "To achieve the above objective of providing old-age protection mechanisms for everyone, the Royal Government will study the possibility of implementing a pension scheme for the informal sector population who are not classified as poor and vulnerable, including traders and self-employed persons. International experience generally shows that implementing pension schemes for this target group has many challenges due to the consequences of identifying individuals and their income sources, making it difficult to determine the basis for contribution payments. Implementation of this pension scheme must be done gradually, by promoting voluntary participation first before converting to a compulsory scheme later, based on certain prerequisites such as identification, awareness of pension scheme benefits, and the maturity and capacity to manage pension schemes professionally and transparently by the implementing institution. Implementing a flat-rate contribution system may be an option for this type of pension scheme.",
                                        "1.1.6 Implementing voluntary private pension scheme",
                                        "To provide long-term savings options suitable for the capacity of middle and high-income population, the Royal Government will prepare the necessary infrastructure, especially the legal framework to allow voluntary private pension schemes managed by financial institutions to operate. Voluntary private pension schemes are the third pillar of the general pension system developed by the World Bank, which serves to supplement mandatory pensions that provide only basic level savings mechanisms.",
                                        "1.1.7 Harmonizing membership",
                                        "All pension schemes will ensure portability of contribution history and benefit consistency when there is a change of membership from one target group to another. For example: transition from informal sector pension scheme to public official pension scheme or employed worker pension scheme or vice versa."
                                    ],
                                    kh: [
                                        "ក. ការធ្វើឲ្យមានសង្គតិភាពរវាងរបបសោធនសាធារណៈ",
                                        "នៅដំណាក់កាលចំពោះមុខ រាជរដ្ឋាភិបាលនឹងរៀបចំគោលការណ៍ណែនាំដើម្បីកំណត់​អំពី​​យន្តការក្នុងការគិតគូរប្រាក់សោធន​​​សម្រាប់មន្ត្រីនៃវិស័យសាធារណៈឡើងវិញ ដើម្បី​​​កាត់​បន្ថយជា​បណ្តើរៗនូវគម្លាតរវាងការទទួលបានប្រាក់សោធនរបស់មន្ត្រីសាធារណៈ។ យន្តការ​​អចិន្ត្រៃយ៍ដើម្បីកំណត់អំពីការ​ធ្វើឲ្យមានសង្គតិភាពរវាងតាវកាលិកនៃរបបសោធនសាធារណៈនេះ នឹងត្រូវ​ចែង​នៅក្នុងច្បាប់ស្តីពីប្រព័ន្ធគាំពារសង្គម ដែលច្បាប់នេះទាមទារ​ឲ្យមានការសិក្សាល្អិតល្អន់ និងពេលវេលាច្រើនសម្រាប់ការរៀបចំ។",
                                        "ខ. ការធ្វើឯកភាពវូបនីយកម្មរបបសោធនដែលមានស្រាប់",
                                        "ការគ្រប់គ្រង និងដាក់ដំណើរការរបបសោធនទាំងឡាយរបស់ស្ថាប័ន​ផ្សេងគ្នាគឺជាឧបសគ្គដល់​ការអភិវឌ្ឍវិជ្ជាជីវៈឯកទេស និងជាបញ្ហាប្រឈមចំពោះប្រសិទ្ធភាព​ និងសក្តិសិទ្ធិភាពនៃការផ្តល់សេវាក្នុងចំណាយទាប។ ដូច្នេះ ដើម្បីធ្វើឲ្យមានសង្គតិ​ភាពរវាងតាវកាលិកនៃសមាជិកគោលដៅនីមួយៗ សំដៅ​បង្កើនប្រសិទ្ធភាព​នៃ​ចំណាយ​ថវិកា និងដើម្បីប្រមូល​ផ្តុំសមត្ថភាពជំនាញឲ្យធ្វើការចំគោល​ដៅនិង​មានប្រសិទ្ធភាពខ្ពស់ រាជរដ្ឋាភិបាលនឹងធ្វើសមាហរណកម្មរបបសោធន​ដែលមានស្រាប់ឲ្យស្ថិតនៅ​ក្រោ​ម​​​​ប្រព័ន្ធគ្រប់គ្រង​តែមួយ ព្រមទាំង ពង្រីកវិសាលភាពឲ្យគ្របដណ្តប់មន្ត្រីរាជការទាំងអស់ រួមទាំងមន្ត្រីរាជការនៃ​ក្រុមនីតិបញ្ញត្តិ ​នីតិប្រតិបត្តិ តុលាការ និងមន្ត្រីនៃស្ថាប័នសាធារណៈផ្សេងទៀត។",
                                        "គ. ការរៀបចំប្រព័ន្ធចាកចេញពីការងារដោយស្ម័គ្រចិត្តសម្រាប់មន្រ្តីរាជការ",
                                        "រាជរដ្ឋាភិបាលនឹងរៀបចំប្រព័ន្ធចាកចេញពីការងារ ដែលអនុញ្ញាតឲ្យមន្រ្តីរាជការអាចចាកចេញពីការងារដោយបញ្ញត្តិច្បាប់ ដើម្បីជាប្រយោជន៍ដល់មន្រ្តីដែលចង់ចាកចេញពីក្របខ័ណ្ឌរដ្ឋ ដោយហេតុ​បានបំពេញការងារយូរ លក្ខខណ្ឌអាយុច្រើន ស្ថានភាពគ្រួសារ សុខភាព ឬសមត្ថភាពមិនសមស្របនឹងការតម្រូវនៃមុខតំណែងការងារ។ ទន្ទឹមនេះ ប្រព័ន្ធចាកចេញពីការងារនឹងបង្កើតនូវកាលានុវត្តភាពការងារដល់យុវជនដែលមានសមត្ថភាពសមស្របសម្រាប់ការងារ។ ការរៀបចំប្រព័ន្ធចាកចេញពីការងារ​សម្រាប់មន្រ្តីរាជការ ទាមទារឲ្យមានការគិតគូរច្បាស់លាស់អំពីលក្ខខណ្ឌ អត្ថប្រយោជន៍ ឬការឧបត្ថម្ភផ្សេងៗសម្រាប់ជាការគាំទ្រ ដល់មន្រ្តីរាជការដែលជ្រើសរើសប្រព័ន្ធនេះ។",
                                        "ឃ. ការដាក់ឲ្យដំណើរការរបបសោធនសម្រាប់កម្មករនិយោជិត",
                                        "ក្រៅពីការកែទម្រង់របបសោធនសាធារណៈ រាជរដ្ឋាភិបាលនឹងសិក្សាអំពីលទ្ធភាពក្នុង​ការរៀបចំ​​ដាក់ឲ្យដំណើរការរបបសោធនសម្រាប់​កម្មករនិយោជិត ដែលស្ថិតនៅក្រោមបទប្បញ្ញត្តិនៃច្បាប់ស្តីពីការងារ។ របបនេះនឹងត្រូវធ្វើសមាហរណកម្មឲ្យស្ថិតនៅក្រោមប្រព័ន្ធគ្រប់គ្រងរួម និង​មានសង្គតិភាព​ជាមួយរបបសោធនសាធារណៈ។ រាជរដ្ឋាភិបាលនឹង​ធ្វើការប្រឹក្សាយោបល់ជាមួយតំណាងនិយោជក និងតំណាងនិយោជិត ដើម្បីកំណត់អត្រាភាគទាន និងតាវកាលិកឲ្យមានលក្ខណៈសមស្រប និងអាចទទួលយកបាន។",
                                        "ង. ការដាក់ឲ្យដំណើរការរបបសោធនសម្រាប់ប្រជាជននៃវិស័យសេដ្ឋកិច្ចក្រៅប្រព័ន្ធដែលមិនក្រីក្រ",
                                        "ដើម្បីសម្រេចនូវគោលបំណងខាងលើ ពោលគឺការផ្តល់នូវយន្តការការពារ​សម្រាប់​ពេលចាស់ជរា​ជូនប្រជាជនគ្រប់រូប រាជរដ្ឋាភិបាល​​នឹងសិក្សាអំពីលទ្ធភាពក្នុងការដាក់ឲ្យដំណើរការរបបសោធន​សម្រាប់​​ប្រជាជននៃវិស័យសេដ្ឋកិច្ចក្រៅប្រព័ន្ធ ដែលមិនចាត់ចូលក្នុងក្រុមប្រជាជនក្រីក្រនិងងាយរង​គ្រោះ រួមមាន អាជីវករលក់ដូរ និងប្រជាជនដែលស្ថិតក្នុងស្វ័យកម្មភាព ជាដើម។ បទពិសោធន៍អន្តរជាតិជា​ទូទៅបង្ហាញថា ការដាក់ឲ្យដំណើរការរបបសោធនសម្រាប់ក្រុមគោលដៅនេះ មានបញ្ហាប្រឈមច្រើន​​ដោយសារផលវិបាកនៃការកំណត់អត្តសញ្ញាណ និងប្រភពចំណូលរបស់បុគ្គល​ទាំងនោះ ដែលនាំឲ្យពិបាកក្នុងការកំណត់មូលដ្ឋានសម្រាប់ការបង់ភាគទាន។ ការដាក់ឲ្យដំណើរការ​របប​សោធននេះត្រូវធ្វើឡើងដោយសន្សឹមៗ តាមរយៈការជំរុញឲ្យចូលរួមដោយ​​ស្ម័គ្រ​ចិត្តជាមុន មុននឹងបង្វែរទៅជារបបកាតព្វកិច្ចនៅពេល​ក្រោយ ដោយផ្អែកលើបុរេលក្ខខណ្ឌ​មួយចំនួនដូចជា ការកំណត់អត្តសញ្ញាណ ការយល់​​ដឹងអំពីអត្ថប្រយោជន៍នៃរបបសោធន ព្រមទាំង ភាពចាស់ទុំ និងសមត្ថភាពក្នុងការ​គ្រប់គ្រងរបបសោធនប្រកប​ដោយវិជ្ជាជីវៈ និងតម្លាភាពរបស់​ស្ថាប័ន​​ប្រតិបត្តិករផងដែរ។ ការដាក់ឲ្យអនុវត្តប្រព័ន្ធបង់ភាគទានថេរ (Flat-rate) អាចជាជម្រើសមួយសម្រាប់​របបសោធនប្រភេទនេះ។",
                                        "ច. ការដាក់ឲ្យដំណើរការរបបសោធនឯកជនស្ម័គ្រចិត្ត",
                                        "ដើម្បីផ្តល់ជម្រើសក្នុងការសន្សំរយៈពេលវែង ​ឲ្យសម​ស្របទៅតាមលទ្ធភាពរបស់ប្រជាជន​ដែល​​មានចំណូលមធ្យមនិងខ្ពស់ រាជរដ្ឋាភិបាលនឹងរៀបចំហេដ្ឋារចនាសម្ព័ន្ធចាំបាច់ ជា​ពិសេស គឺក្របខ័ណ្ឌ​គតិយុត្តិដើម្បីអនុញ្ញាតឲ្យរបបសោធនឯកជនស្ម័គ្រចិត្ត ដែលគ្រប់គ្រងដោយគ្រឹះស្ថាន​ហិរញ្ញវត្ថុអាច​ដំណើរការទៅបាន។ របបសោធនឯកជនស្ម័គ្រចិត្តគឺជាសសរស្តម្ភទី៣នៃប្រព័ន្ធសោធនទូទៅដែលត្រូវ​បាន​អភិវឌ្ឍដោយធនាគារពិភពលោក ដែល​មានមុខងារបំពេញបន្ថែមទៅ​លើសោធនកាតព្វកិច្ច​ ដែលផ្តល់ត្រឹមតែយន្តការសន្សំកម្រិតមូលដ្ឋានប៉ុណ្ណោះ។",
                                        "ឆ. ការសម្រួលសមាជិកភាព",
                                        "គម្រោងសោធនទាំងអស់ នឹងធានារយៈពេលយោងនៃអតីតភាពដែលបានបង់ភាគទាន និងសង្គតិភាពតាវកាលិក នៅពេលដែលមានការប្ដូរសមាជិកភាពពីក្រុមគោលដៅមួយទៅ​ក្រុមគោលដៅមួយ។ ឧទាហរណ៍៖ ការផ្លាស់ប្ដូរពីរបបសោធនសម្រាប់ប្រជាជននៃវិស័យសេដ្ឋកិច្ចក្រៅប្រព័ន្ធចូល​ទៅក្នុងរបបសោធនមន្ត្រីសាធារណៈ ឬការចូលទៅក្នុងរបបសោធនកម្មករនិយោជិត ឬប្ដូរទៅវិញទៅមក ។"
                                    ]
                                }
                            },
                            {
                                id: "financial-framework",
                                title: {
                                    en: "1.2 Financial Framework",
                                    kh: "១.២ ក្របខ័ណ្ឌហិរញ្ញវត្ថុ"
                                },
                                content: {
                                    en: [
                                        "Demographic changes and the trend of the continuous salary increase for public officials might lead to a sharp increase in state budget expenditure to support the public pension scheme in the medium and long term. As a result, to ensure reasonable national budget expenditure, the Royal Government will reform the financing mechanism to support the public pension scheme from a public budget based Pay-As-You-Go mechanism to a contribution-based pension system. This system will require public officials to contribute to a uniform pension fund. However, contribution requirements into such a pension scheme and other national social security funds must be developed in a way that does not affect the current salary of public officials.",
                                        "Before collecting contributions from public officials, the Royal Government will conduct a comprehensive study to define technical aspects of the contributory pension system. This study will include the criteria for public officials, whether or not they will be required to pay contribution or if they are exempted based on their working seniority, retirement age, or salary scales. The study will also review the retirement age which is a key factor for labor productivity and the financial sustainability of a pension system.",
                                        "Sub-decree no. 73, dated 29 April 2011, on Defining a Contribution Rate to Support the NSSFC, only foresees a combined contribution rate for all national social security schemes for civil servants, pensions, invalidity, work injury, maternity, death and survivor's benefits. As all public pension schemes will be integrated into a single scheme, the contribution rate of each scheme should be re-considered in order to maintain a balance between civil servants' salaries and national budget expenditure and to ensure consistency among all target groups. Therefore, the Royal Government will review the contribution rates as laid down in the sub-decree mentioned above.",
                                        "Experiences from other countries show a tendency of changing from defined benefit pension schemes (DB) to defined contribution pension schemes (DC) to avoid the serious financial burden such schemes represent for many of these countries. Demographic changes are the main reason for this shift. Benefits guaranteed by the pension scheme (DB type) bear a certain risk for the financial stability of the pension fund and ultimately for the state budget. The Royal Government will conduct a comprehensive study on types of pension schemes most suitable for Cambodia. The results of this study will be an important input for determining the type of an appropriate pension scheme for Cambodia."
                                    ],
                                    kh: [
                                        "បម្រែបម្រួលនៃកត្តាប្រជាសាស្ត្រ និងនិន្នាការនៃការកើនឡើងជាបន្តបន្ទាប់នៃប្រាក់បៀវត្សរបស់​​​មន្ត្រីសាធារណៈ បានបង្ហាញឲ្យឃើញពីសក្តានុពលនៃការកើនឡើង​​យ៉ាងគំហុកនៃ​​ចំណាយថវិកា​រដ្ឋដើម្បីទ្រទ្រង់របបសោធនសាធារណៈសម្រាប់រយៈពេលមធ្យម និងវែងខាង​​មុខ។ ដូច្នេះ ដើម្បីរក្សាបាន​នូវភាពទ្រទ្រង់បាននៃថវិការដ្ឋ រាជរដ្ឋាភិបាលនឹងធ្វើការកែទម្រង់យន្តការហិរញ្ញប្បទានសម្រាប់​ទ្រទ្រង់របបសោធនសាធារណៈ ពីប្រព័ន្ធដែល​ពឹងផ្អែកលើថវិការដ្ឋតាមយន្តការទូទាត់តាមដំណើរទៅជាប្រព័ន្ធផ្អែកលើការបង់ភាគទានវិញ។ ប្រព័ន្ធ​នេះ​នឹងតម្រូវឲ្យមន្ត្រីរាជការចូលរួមបង់ភាគទានចូលទៅក្នុងមូលនិធិរួម។ ទោះយ៉ាងណា ការតម្រូវឲ្យបង់ភាគទានចូលរបបសោធននេះត្រូវ​ធ្វើឡើងក្នុង​រូបភាពដែល​មិនប៉ះពាល់ដល់កម្រិតប្រាក់បៀវត្សបច្ចុប្បន្នរបស់មន្ត្រីសាធារណៈ។",
                                        "មុននឹងដាក់ឲ្យអនុវត្តការប្រមូលភាគទានពីមន្ត្រីសាធារណៈ រាជរដ្ឋាភិបាលនឹង​ធ្វើការសិក្សា​ឲ្យបានគ្រប់ជ្រុងជ្រោយ ដើម្បីកំណត់អំពីលក្ខខណ្ឌបច្ចេកទេសទាំងឡាយនៃប្រព័ន្ធសោធនផ្អែកលើការបង់ភាគទាន រួមទាំងអំពីលក្ខខណ្ឌនៃក្រុមមន្ត្រីសាធារណៈ ដែលត្រូវបង់ភាគទាន ឬត្រូវបានលើកលែង ដោយផ្អែកលើ អតីតភាពការងារ កម្រិតអាយុចូលនិវត្តន៍ និងកម្រិតនៃ​ប្រាក់បៀវត្ស។ ការសិក្សាក៏ចាំបាច់ត្រូវពិនិត្យឡើងវិញផងដែរអំពីកម្រិតនៃអាយុចូលនិវត្តន៍ ដែលជាកត្តាដ៏សំខាន់មួយចំពោះផលិតភាពការងារ និងចីរភាពហិរញ្ញវត្ថុនៃប្រព័ន្ធសោធន។",
                                        "អនុក្រឹត្យលេខ៧៣ អនក្រ.បក ចុះថ្ងៃទី២៩ ខែមេសា ឆ្នាំ២០១១ ស្តីពីការកំណត់អត្រាភាគទាន​សម្រាប់ទ្រទ្រង់បេឡាជាតិ​សន្តិសុខសង្គមសម្រាប់មន្ត្រីរាជការស៊ីវិល បានកំណត់​តែអត្រាភាគទាន​រួមសម្រាប់​របបសន្តិសុខសង្គមទាំងអស់រួមមាន៖ របបសោធន ការបាត់បង់​សម្បទាវិជ្ជាជីវៈ គ្រោះថ្នាក់ការងារ មាតុភាព មរណភាព និងអ្នកនៅក្នុងបន្ទុក។ ដោយសារ​តែរបបសោធនសាធារណៈទាំងអស់នឹងត្រូវធ្វើសមាហរណកម្មឲ្យទៅជារបបរួមមួយ នោះការកំណត់អត្រាភាគទានសម្រាប់របបនីមួយៗនឹងត្រូវគិតគូរឡើងវិញ ក្នុងគោលបំណងរក្សាបានតុល្យភាព​រវាង​ប្រាក់ចំណូលរបស់មន្ត្រីសាធារណៈ និងលទ្ធភាពទ្រទ្រង់របស់​ថវិកាជាតិ ព្រមទាំង រៀបចំឲ្យមានសង្គតិភាពរវាងសមាជិក​គោលដៅទាំងអស់។ ក្នុងន័យនេះ រាជរដ្ឋាភិបាលនឹងពិនិត្យឡើងវិញលើអត្រាភាគទានដែលបានចែងក្នុងអនុក្រឹត្យខាងលើ ។",
                                        "បទពិសោធន៍របស់បណ្តាប្រទេសមួយចំនួន បានបង្ហាញឲ្យឃើញពីទំនោរក្នុងការផ្លាស់ប្តូរពីរបប​​សោធន​​ប្រភេទកំណត់តាវកាលិកជាមុន (Defined BenefitP1FP1FPP) ទៅជារបបសោធនប្រភេទកំណត់ភាគទានជាមុន (Defined ContributionP2FP2FPP) ដើម្បីដោះខ្លួនចេញពីបន្ទុកហិរញ្ញវត្ថុដ៏ធ្ងន់ធ្ងរដែលប្រទេស​​ជាច្រើន​កំពុងជួបប្រទះ។ បម្រែបម្រួលនៃកត្តាប្រជាសាស្ត្រ គឺជាហេតុផលចម្បងដែលនាំឲ្យមាននិន្នាការផ្លាស់ប្តូរនេះ។ ការធានា​ជាមុននូវតាវកាលិក​របស់គម្រោងសោធនប្រភេទកំណត់តាវកាលិកជាមុនបង្ហា​ញ​​​អំពីហានិភ័យដែលអាចនឹងមានផលប៉ះពាល់ដល់ស្ថិរភាពហិរញ្ញវត្ថុនៃមូលនិធិសោធន និងចុងក្រោយធ្លាក់ជាបន្ទុកដ៏ធ្ងន់ធ្ងរមកលើថវិកា​ជាតិ។ ដូច្នេះ ដើម្បី​ជៀសវាងនូវបញ្ហាទាំងនេះ រាជរដ្ឋាភិបាលនឹងធ្វើការសិក្សា​ឲ្យបានល្អិតល្អន់អំពីប្រភេទនៃរបបសោធន ដែល​សក្តិសម​ទៅនឹងស្ថានភាពជាក់ស្តែងរបស់កម្ពុជា។ លទ្ធផលនៃការសិក្សានេះ គឺជាទុនដ៏សំខាន់ក្នុងការជ្រើសរើសយកប្រភេទនៃរបបសោធន​ណា​មួយ ដែល​សមស្របទៅតាមបរិបទកម្ពុជា ។"
                                    ]
                                }
                            },
                            {
                                id: "legal-framework",
                                title: {
                                    en: "1.3 Legal and Regulatory Framework",
                                    kh: "១.៣ ក្របខ័ណ្ឌច្បាប់ និងបទប្បញ្ញត្តិ"
                                },
                                content: {
                                    en: "To ensure effective, transparent, and accountable governance and management structure, the Royal Government will develop a legal framework for supervising the implementation of all public pension schemes. The legal framework will be part of the Law on the Social Protection System which is supposed to be adopted in the future. In addition, the Royal Government will establish a legal framework for the management and operation of voluntary pension schemes in a separate regulation from that law.",
                                    kh: "ដើម្បីធានាឲ្យបាននូវការគ្រប់គ្រង និងចាត់ចែងរបបសោធនប្រកបដោយប្រសិទ្ធភាព តម្លាភាព និង​គណនេយ្យភាព រាជរដ្ឋាភិបាលនឹងរៀបចំលិខិតបទដ្ឋានគតិយុត្តិសម្រាប់គ្រប់គ្រង និងត្រួតពិនិត្យ និង​ដាក់ឲ្យដំណើរការរបបសោធនសាធារណៈទាំងអស់ ដែលជាផ្នែកមួយនៃច្បាប់​ស្តីពីប្រព័ន្ធ​​គាំពារសង្គមដែលនឹងត្រូវរៀបចំនៅពេលខាងមុខ។ បន្ថែមលើនេះ រាជរដ្ឋាភិបាលក៏នឹងរៀបចំលិខិតបទដ្ឋាន​គតិយុត្តិ​សម្រាប់​គ្រប់គ្រង និងដាក់ឲ្យដំណើរការប្រព័ន្ធសោធនឯកជន​ស្ម័គ្រចិត្ត នៅក្នុងក្របខ័ណ្ឌដោយឡែកពីច្បាប់ស្តីពី​ប្រព័ន្ធគាំពារសង្គម។"
                                }
                            }
                        ]
                    },
                    {
                        id: "healthcare",
                        title: {
                            en: "2. Health Care",
                            kh: "២. ការថែទាំសុខភាព"
                        },
                        content: {
                            en: "In accordance with the United Nations Sustainable Development Goals, Cambodia defines its vision to reach universal health coverage like other countries in the world. The main aim of developing a universal healthcare system is to maintain social solidarity by providing every Cambodian citizen with affordable and high-quality healthcare. The Royal Government strictly abides by four principles for the policy development and the social healthcare system reform: (1) good governance, (2) effective spending, (3) accountability, (4) financial sustainability.",
                            kh: "អនុលោមតាមគោលដៅអភិវឌ្ឍន៍ប្រកបដោយចីរភាព (Sustainable Development Goals) របស៍អង្គការសហប្រជាជាតិ កម្ពុជាមានចក្ខុវិស័យក្នុងការបោះជំហានទៅរកប្រព័ន្ធ​​វែទាំសុខភាពសកល ដូចបណ្តាប្រទេស​នានាលើសកលលោក។ គោលបំណងនៃចក្ខុវិស័យនេះ គឺដើម្បីរក្សាបាននូវសាមគ្គីភា​ព​សង្គម តាមរយៈការផ្តល៍ជូនប្រជាជនកម្ពុជាគ្រប៍រូប​នូវសេវាថែទាំសុខាភិបាលប្រកបដោយ​គុណភាព និងអាចទទួលបាន។ រាជរដ្ឋាភិបាលប្រកាន៍ខ្ជាប៍គោលការណ៍បូន សម្រាប៍ការរៀបចំគោលនយោបាយអភិវឌ្ឍន៍ និងកំណែទម្រង៍ប្រព័ន្ធ​វែទាំសុខភាព​សង្គមនេះគឺ៖ (១) អភិបាលកិច្ចល្អ (២) ប្រសិទ្ធភាពខ្ពស៍នៃចំណាយ (៣) គណនេយ្យភាព និង (៤) ចីរភាពហិរញ្ញវត្ថុ។"
                        },
                        subsections: [
                            {
                                id: "healthcare-institutional",
                                title: {
                                    en: "2.1 Institutional Framework",
                                    kh: "២.១ ក្របខ័ណ្ឌស្ថាប័ន"
                                },
                                content: {
                                    en: [
                                        "The Royal Government has decided to implement a health care scheme for employed workers through Sub-decree No. 01 dated January 6, 2016 on the establishment of a social security scheme for health care for those under the Labor Law, in addition to the existing occupational risk social security scheme. This scheme will provide employed workers with general health care services including treatment, maternity leave benefits, and daily allowances for sick leave.",
                                        "The Royal Government will organize and implement a health care scheme for public officials that is consistent with the health care scheme for employed workers. The implementation of this scheme must be adequately prepared on all necessary aspects, especially the technical aspects of determining and collecting contributions, service provision, payment and legal framework. The health care system must operate on a 'Single Payer' mechanism to increase efficiency, reduce administrative costs and ensure equity in the system. In this regard, NSSF which is  an institution with expertise and experience, has potential to expand its scope of work to manage the health care scheme for public officials, based on continuous capacity strengthening to effectively take on additional responsibilities.",
                                        "This scheme will cover public officials, retirees and war veterans, as well as dependents, with the stages of expanding coverage to each target group to be based on two important aspects: national budget sustainability and the capacity of health infrastructure to sustain services.",
                                        "The Royal Government will continue to pay more attention to improving the quality of health services of public and private health facilities that can be on par with neighboring countries. For this goal, the Royal Government will implement an Accreditation System which is a mechanism to ensure the quality of both public and private health facilities. Improving health quality is very important in building public confidence in the whole health care system. This factor will encourage more participation from the population, especially providing positive results when the Royal Government implements a health care scheme for the informal sector population."
                                    ],
                                    kh: [
                                        "រាជរដ្ឋាភិបាលបានសម្រេចដាក់ឲ្យដំណើរការរបបថែទាំសុខភាពសម្រាប់កម្មករនិយោជិត តាម ​​រ​យៈការចេញអនុក្រឹត្យលេខ ០១ ចុះថ្ងៃទី០៦ ខែមករា ឆ្នាំ២០១៦ ស្តីពីការបង្កើតរបបសន្តិសុខ​សង្គម​ផ្នែកថែទាំសុខភាពសម្រាប់ជនទាំងឡាយដែលស្ថិតក្រោមបទប្បញ្ញត្តិនៃច្បាប់​ស្តីពីការងារ បន្ថែមលើ​រប​​ប​​សន្តិសុខសង្គម​ផ្នែកហានិភ័យការងារដែលមានស្រាប់។ របបនេះ នឹង​ផ្តល់ជូនកម្មករនិយោජិតនូវសេវាថែទាំសុខភាពទូទៅ ​រួមមាន ​ការ​ថែទាំ និងព្យាបាលជំងឺ ប្រាក់លំហែ​មាតុភាព ព្រមទាំង​ផ្តល់​ប្រាក់បំណាច់ប្រចាំថ្ងៃសម្រាប់ការ​ឈប់សម្រាកព្យាបាលជំងឺផងដែរ។",
                                        "រាជរដ្ឋាភិបាល​នឹងរៀបចំដាក់ឲ្យដំណើរការរបបថែទាំសុខភាពសម្រាប់មន្ត្រីសាធារណៈ ដែលមាន​សង្គតិភាពទៅនឹងរបបថែទាំសុខភាពសម្រាប់កម្មករនិយោជិត។ ការដាក់ឲ្យដំណើរ​ការរបបនេះ ត្រូវ​មាន​ការត្រៀមលក្ខណៈគ្រប់គ្រាន់លើទិដ្ឋភាពចាំបាច់ទាំងឡាយ មានជាអាទិ៍ ​ទិដ្ឋភាពបច្ចេកទេសនៃការកំណត់និងប្រមូលភាគទាន ការផ្តល់សេវា ការទូទាត់ និងក្របខ័ណ្ឌច្បាប់។ ប្រព័ន្ធថែទាំសុខភាព​ត្រូវដំណើរការតាមយន្តការ​ \"អ្នកទូទាត់​តែមួយ (Single Payer)\" ដើម្បីបង្កើនប្រសិទ្ធភាព កាត់បន្ថយ​ចំណាយរដ្ឋបាល និងធានា​សមធម៌​ក្នុងប្រព័ន្ធ។ ក្នុងបរិការណ៍នេះ ប.ស.ស ដែលជាស្ថាប័ន​មានជំនាញ និងមានបទពិសោធន៍ គឺជាស្ថាប័នមានសក្តានុពលក្នុងការពង្រីក​វិសាលភាព​ការងារដើម្បី​គ្រប់គ្រង និង​ចាត់ចែងរបបថែទាំសុខភាពសម្រាប់មន្ត្រី​សាធារណៈ​ ដោយផ្អែកលើ​មូលដ្ឋាននៃការពង្រឹងសមត្ថភាពបន្តបន្ទាប់ទៀត ដើម្បីអាចទទួល​ភារកិច្ចបន្ថែម​ប្រកប​ដោយ​ប្រសិទ្ធភាព។",
                                        "របបនេះ នឹងគ្របដណ្តប់ទាំងមន្ត្រីសាធារណៈ និវត្តជននិងអតីតយុទ្ធជន ព្រមទាំង អ្នកនៅ​ក្នុងបន្ទុកផងដែរ ដែលដំណាក់កាលនៃការពង្រីកវិសាលភាពឲ្យគ្របដណ្តប់ក្រុមគោលដៅនីមួយៗ នឹងត្រូវធ្វើឡើងដោយផ្អែកលើទិដ្ឋភាពពីរសំខាន់គឺ ភាពទ្រទ្រង់បាននៃថវិកាជាតិ និងសមត្ថភាព​ក្នុង​ការ​ទ្រទ្រង់បាននៃសេវាសុខាភិបាលរបស់មូលដ្ឋានសុខាភិបាល។",
                                        "រាជរដ្ឋាភិបាលនឹងបន្តការយកចិត្តទុកដាក់បន្ថែមទៀត លើការលើកកម្ពស់​គុណភាព​នៃសេវាសុខាភិបាលរបស់មូលដ្ឋានសុខាភិបាលរបស់​រដ្ឋ និងឯកជន ដែលអាចដើរទន្ទឹមគ្នា​ជាមួយ​នឹងបណ្តាប្រទេសជិតខាង។ គោលដៅនេះ រាជរដ្ឋាភិបាលនឹង​ដាក់​ឲ្យដំណើរការប្រព័ន្ធទទួលស្គាល់គុណភាព​ (Accreditation System) ដែលជាយន្តការដើម្បីធានាគុណភាពរបស់មូលដ្ឋានសុខាភិបាល ទាំងរបស់​រដ្ឋ និងឯកជន។ ការបង្កើនគុណភាពសុខាភិបាល មានសារៈសំខាន់ណាស់ក្នុងការកសាងជំនឿទុក​ចិត្ត​​សាធារណជនមកលើប្រព័ន្ធថែទាំសុខភាពទាំងមូល។ កត្តានេះ នឹងជំរុញឲ្យមានការចូលរួមកាន់​តែច្រើនរបស់ប្រជាជន ជាពិសេស ផ្តល់នូវផលវិជ្ជមាននៅពេលដែលរាជរដ្ឋាភិបាលដាក់ឲ្យដំណើរការរបប​ថែទាំសុខភាពសម្រាប់ប្រជាជននៃវិស័យសេដ្ឋកិច្ចក្រៅប្រព័ន្ធ។"
                                    ]
                                }
                            },
                            {
                                id: "healthcare-financial",
                                title: {
                                    en: "2.2 Financial Framework",
                                    kh: "២.២ ក្របខ័ណ្ឌហិរញ្ញវត្ថុ"
                                },
                                content: {
                                    en: [
                                        "The Royal Government will review the contribution and premium rates applied for public officials, the poor and vulnerable persons, and private sector workers to ensure consistency of contributions for all participant groups and to achieve sustainability of the health insurance scheme. On that note, the Royal Government will: (1) determine the contribution rate in accordance with the available national budget to support the poor and vulnerable persons; (2) set the national budget needed to cover the demand for health services used by participants; (3) avoid double provision of financial assistance (free health care services provided by the state such as health equity fund, voucher schemes, and user fees exemptions), etc.",
                                        "To ensure rapid expansion of the coverage, the Royal Government will collaborate with potential partners from the public and private sector in order to prepare and implement an appropriate and sustainable financing mechanism. The Royal Government will determine the types and models of hospitals that provide healthcare services, prioritizing those under the management of the MoH.",
                                        "Based on the health financing strategy, the Royal Government will fully subsidize the Equity Fund in the future. Therefore, the Royal Government will place the management of this fund under a common social security operator. At the same time, the Royal Government will study the possibility of including some additional vulnerable groups such as persons with disabilities, the elderly and children under five years old to become members of the Equity Fund progressively according to national budget sustainability. The Royal Government will also study the financial aspects and management of the user fee fund to prepare for fully funding this fund at an appropriate time. At that point, the management of this fund will also be transferred under a single payer."
                                    ],
                                    kh: [
                                        "រាជរដ្ឋាភិបាលនឹងបន្តផ្តល់ការទ្រទ្រង់ហិរញ្ញវត្ថុ ក្រោមរូបភាពជាចំណាយបង់ភាគ​ទានជំនួសឲ្យ​ប្រជាជនក្រីក្រនិងងាយរងគ្រោះ។ ចំណែក ក្រុមប្រជាជនផ្សេងទៀត ទាំងវិស័យសេដ្ឋកិច្ចក្នុង និងក្រៅ​ប្រព័ន្ធ ត្រូវមានកាតព្វកិច្ចបង់ភាគទានតាមការកំណត់មួយជាក់លាក់។ រាជរដ្ឋាភិបាលនឹងបន្តផ្តល់ហិរញ្ញប្បទានតាមការចាំបាច់ ចំពោះដំណើរការនៃ​មូលដ្ឋានសុខាភិបាលសាធារណៈដោយប្រើប្រាស់​ថវិកាជាតិ ខណៈពង្រឹងជាបណ្តើរៗនូវស្វ័យភាព ប្រសិទ្ធភាព គណនេយ្យភាព និងស្ថិរភាពហិរញ្ញវត្ថុនៃ​​មូលដ្ឋានសុខាភិបាល។ ការកំណត់អត្រាភាគទានសម្រាប់របបថែទាំសុខភាពទាំងអស់ ត្រូវមានការសិក្សាផែ្នកហានិភ័យ​​ឲ្យបានត្រឹមត្រូវ និង​​ត្រូវឈរលើគោលការណ៍ពិគ្រោះយោបល់សាធារណៈ ដើម្បីទទួលបានការគាំទ្រពី​គ្រប់មជ្ឈដ្ឋាន​ទាំង​អស់ ទាំងស្ថាប័នរាជរដ្ឋាភិបាល តំណាងនិយោជក តំណាងនិយោជិត និងតំណាង​ប្រជា​ជនទូទៅ។",
                                        "តម្រូវការនៃការ​ប្រើ​ប្រាស់សេវាសុខាភិបាលនឹងកើនឡើងជាលំដាប់ បន្ទាប់ពីរាជរដ្ឋាភិបាល​​ដាក់​​​ឲ្យដំណើរការរបបថែទាំសុខ​ភាពសង្គមសម្រាប់កម្មករនិយោជិត និងមន្ត្រីសាធារណៈ។ តម្រូវការនេះ នឹងកាន់តែកើនឡើងថែមទៀតនៅពេល​ដែលប្រព័ន្ធថែទាំសុខភាពសង្គម ត្រូវបានពង្រីកវិសាលភាព​ទៅដល់ប្រជាជននៃវិស័យសេដ្ឋកិច្ចក្រៅប្រព័ន្ធនៅពេលខាងមុខ។ ដើម្បីឆ្លើយតបទៅនឹងតម្រូវការនេះ រាជរដ្ឋាភិបាលនឹងបង្កើន​​ការ​វិនិយោគសាធារណៈទាំងទៅលើហេដ្ឋារចនាសម្ព័ន្ធ និងធនធាន​មនុស្សក្នុង​​វិស័យ​សុខា​ភិបាលទៅតាមភាពទ្រទ្រង់​បាននៃថវិកាជាតិ។",
                                        "ផ្អែកតាមយុទ្ធសាស្ត្រហិរញ្ញប្បទានសុខាភិបាល រាជរដ្ឋាភិបាលនឹងទទួលរ៉ាប់រងទាំងស្រុង​លើ​ហិរញ្ញប្បទានទ្រទ្រង់មូលនិធិសមធម៌នាពេលអនាគត។ ដូច្នេះ រាជរដ្ឋាភិបាលនឹងដាក់ឲ្យ​ការគ្រប់គ្រងមូលនិធិនេះស្ថិតនៅក្រោមការគ្រប់គ្រង និង​ចាត់ចែង​របស់ប្រតិបត្តិករសន្តិសុខសង្គម​រួម។ ជាមួយគ្នានេះ រាជរដ្ឋាភិបាលនឹងសិក្សាអំពីលទ្ធភាពក្នុងការដាក់​បញ្ចូលក្រុមប្រជាជន ដែលងាយរងគ្រោះមួយចំនួ​ន​ទៀតដូចជា ជនពិការ ជនចាស់ជរា និង​កុមារអាយុក្រោមប្រាំឆ្នាំឲ្យចូលជាសមាជិករបស់មូលនិធិ​សមធ​ម៌ ជាបន្ត​បន្ទាប់ទៅតាមលទ្ធភាពនៃការទ្រទ្រង់បាននៃថវិកាជាតិ។ រាជរដ្ឋាភិបាលក៏នឹងសិក្សាអំពីទិដ្ឋភាពហិរញ្ញប្បទាន និងការគ្រប់គ្រងមូលនិធិគន្ធបុប្ផា ដើម្បីត្រៀមខ្លួន​ក្នុងការផ្តល់ហិរញ្ញប្បទានមូលនិធិនេះទាំងស្រុងនៅពេលវេលាសមស្របណាមួយ។ នៅពេល​នោះ ការគ្រប់គ្រងមូលនិធិនេះក៏នឹងត្រូវផ្ទេរឲ្យមកនៅក្រោមការគ្រប់គ្រងរបស់អ្នកទូទាត់តែមួយ​ផងដែរ។"
                                    ]
                                }
                            },
                            {
                                id: "healthcare-legal",
                                title: {
                                    en: "2.3 Legal and Regulatory Framework",
                                    kh: "២.៣ ក្របខ័ណ្ឌច្បាប់ និងបទប្បញ្ញត្តិ"
                                },
                                content: {
                                    en: [
                                        "The development of the social health care system requires a legal and regulatory framework to manage and set operational standards in the system, especially defining the roles of parties involved in the social health care scheme, defining financial management procedures, financial sources and contribution rates, procedures for determining benefit packages and customer protection, etc. The legal framework and implementation mechanisms must also consider the necessity of moving towards universal health coverage, by promoting mandatory participation of the non-poor informal sector population, as well as to establish quality assurance mechanisms, integration of social security operators and defining appropriate regulatory roles to ensure smooth and highly efficient operations.",
                                        "At the same time, the organization and operation of NSSF will also be amended to allow NSSF to act as a joint operating institution in managing and administering health care schemes for other target groups, as currently NSSF only has the mandate to manage and administer social security schemes for employed workers under the Labor Law."
                                    ],
                                    kh: [
                                        "ការអភិវឌ្ឍប្រព័ន្ធថែទាំសុខភាពសង្គម ទាមទារនូវក្របខ័ណ្ឌច្បាប់និងបទប្បញ្ញត្តិចាំបាច់​សម្រាប់​គ្រប់គ្រង និងកំណត់ស្តង់ដារប្រតិបត្តិការនៅក្នុងប្រព័ន្ធនោះ ជាពិសេស គឺការកំណត់តួនាទីរបស់​ភាគីពាក់ព័ន្ធនឹងរបបថែទាំសុខភាពសង្គម កំណត់នីតិវិធីនៃការគ្រប់គ្រង​ហិរញ្ញវត្ថុ ប្រភពហិរញ្ញវត្ថុ​និងអត្រាភាគទាន នីតិវិធីសម្រាប់កំណត់កញ្ចប់អត្ថប្រយោជន៍ និង​កិច្ចការពារអតិថិជន ជាដើម។ ក្របខ័ណ្ឌច្បាប់ និងយន្តការអនុវត្ត ក៏ត្រូវគិតគូរ​ផងដែរ​នូវ​ភាព​ចាំបាច់នៃការបោះជំហានទៅរកការថែទាំសុខភាពសកល តាមរយៈការជំរុញការចូលរួម​ជាកាតព្វកិច្ច​របស់ប្រជាជននៃវិស័យសេដ្ឋកិច្ចក្រៅប្រព័ន្ធដែល​មិនមែនក្រីក្រ ព្រមទាំង ដើម្បីកំណត់យន្តការធា  នាគុណភាព ការធ្វើសមាហរណកម្មប្រតិបត្តិករសន្តិសុខសង្គម និងការ​កំណត់​​តួនាទីបញ្ញត្តិករសមស្រប សំដៅធានាប្រតិបត្តិការដោយរលូន និងប្រកបដោយ​ប្រសិទ្ធភាពខ្ពស់។",
                                        "ទន្ទឹមនោះ ការរៀបចំ និងការប្រព្រឹត្តទៅរបស់ ប.ស.ស ក៏នឹងត្រូវកែសម្រួល ដើម្បីអនុញ្ញាតឲ្យ ប.ស.ស ដើរតួជា​ស្ថាប័នប្រតិបត្តិកររួមក្នុងការគ្រប់គ្រងនិងចាត់ចែងរបបថែទាំ​សុខភាព​​សម្រាប់​​សមាជិក​គោលដៅផ្សេងទៀត ដោយសារបច្ចុប្បន្ន ប.ស.ស មានអាណត្តិគ្រប់គ្រងនិងចាត់ចែងតែរបបសន្តិសុខ​សង្គមសម្រាប់កម្មករនិយោជិតដែលស្ថិតនៅក្រោមបទប្បញ្ញត្តិនៃច្បាប់ស្តីពីការងារប៉ុណ្ណោះ។"
                                    ]
                                }
                            }
                        ]
                    },
                    {
                        id: "employment-injury",
                        title: {
                            en: "3. Employment Injury Scheme",
                            kh: "៣. ប្រព័ន្ធសន្តិសុខសង្គមសម្រាប់គ្រោះថ្នាក់ការងារ"
                        },
                        content: {
                            en: [
                                "As stated in the ILO Social Security Conventions, work injury scheme is an important component of the national social security scheme which has great value and creates a high sense of security for all the workers. In Cambodia, workers in the private sector have been able to access to the employment injury scheme since 2008 when the NSSF was officially launched the work injury scheme. Currently the Royal Government has been looking into the possibility to expand the coverage of workers in the informal sectors in the near future. Like other contributory schemes, the Royal Government will provide subsidies for coverage of the poor and vulnerable people in the informal sector into the work injury scheme."
                            ],
                            kh: [
                                "ដូចដែលបានចែងនៅក្នុងអនុសញ្ញាសន្តិសុខសង្គមរបស់អង្គការពលកម្មអន្តរជាតិ គ្រោះថ្នាក់ការងារជាផ្នែកសំខាន់មួយនៃប្រព័ន្ធសន្តិសុខសង្គមជាតិ ដែលមានតម្លៃខ្ពស់ និងផ្តល់នូវសុវត្ថិភាពសម្រាប់កម្មករ និងនិយោជិត​ទាំងអស់គ្នា។ នៅកម្ពុជា កម្មករវិស័យឯកជនបានទទួលគ្រោះថ្នាក់ការងារតាំងពីឆ្នាំ២០០៨មក ដែលជាពេលវេលាដែលប.ស.ស បានដាក់ឱ្យដំណើរការប្រព័ន្ធគ្រោះថ្នាក់ការងារជាផ្លូវការ។ បច្ចុប្បន្ន រាជរដ្ឋាភិបាលកំពុងស្វែងរកលទ្ធភាពដើម្បីពង្រីកការពារកម្មករវិស័យក្រៅប្រព័ន្ធនាពេលអនាគតខាងមុខ។ ដូចគ្នានឹងរបបសន្តិសុខសង្គមផ្សេងទៀត រាជរដ្ឋាភិបាលនឹងផ្តល់សំណងឱ្យ ប្រជាជនក្រីក្រ និងងាយរងគ្រោះវិស័យក្រៅប្រព័ន្ធ ទទួលបានការការពារក្នុងគ្រោះថ្នាក់ការងារ។ នៅពេលដែលប្រជាជនទាំងនេះការពារក្នុងគ្រោះថ្នាក់ការងារនោះ រាជរដ្ឋាភិបាលត្រូវធានា៖",
                                "៣.១ ការពារកម្មករនិយោជិត៖"," ប.ស.ស បានដាក់ឱ្យដំណើរការប្រព័ន្ធសន្តិសុខសង្គមសម្រាប់កម្មករនិយោជិតតាំងពីឆ្នាំ២០០៨មកម៉្លេះ ដែលអំឡុងនោះមានកម្មករ និងនិយោជិតក្នុងវិស័យឯកជនប្រមាណជាង២មុឺននាក់ដែលទទួលបានសិទ្ធិប្រយោជន៍។ ប្រព័ន្ធនេះផ្តល់ការពារប្រឆាំងនឹងគ្រោះថ្នាក់ការងារដើម្បីជួយកាត់បន្ថយការខាតបង់ផ្នែកសេដ្ឋកិច្ច និងសង្គមពីគ្រោះថ្នាក់ការងារ។ ដូច្នេះ ការពារសម្រាប់កម្មករនិយោជិត គឺការពារនិស្សិតការងារ ចុងបញ្ចប់ការងារដោយគ្រោះថ្នាក់ការងារ និងទទួលបានអត្ថប្រយោជន៍ពីការសងជាសាច់ប្រាក់ក្នុងករណីរបួសពីការងារ ពិការភាពពីការងារ ផ្ទេរទៅគ្រួសារក្នុងករណីស្លាប់ពីគ្រោះថ្នាក់ការងារ។",
                                "៣.២ ការពារមន្ត្រីរាជការ និងបុគ្គលិករដ្ឋ៖"," កម្មវិធីគ្រោះថ្នាក់ការងាររបស់រាជរដ្ឋាភិបាលត្រូវបានកំណត់ស្របតាម ក្របខ័ណ្ឌគតិយុត្តិផ្នែកសុខភាពសាធារណៈ ហើយតម្រូវឱ្យមានការរៀបរាប់ជាក់លាក់។ ក្នុងការអនុវត្តន៍ការពារសម្រាប់មន្ត្រីរាជការ និងបុគ្គលិករដ្ឋ រាជរដ្ឋាភិបាលត្រូវធានាសិទ្ធិប្រយោជន៍ស្មើគ្នានឹងកម្មករនិយោជិត រួមមានសិទ្ធិទទួលបានការថែទាំសុខភាព និងសំណងសាច់ប្រាក់ក្នុងករណីរបួសធ្ងន់ធ្ងរ ឬពិការភាពពីគ្រោះថ្នាក់ ឬផ្ទេរទៅគ្រួសារក្នុងករណីស្លាប់។"
                            ]
                        }
                    },
                    {
                        id: "unemployment",
                        title: {
                            en: "4. Unemployment",
                            kh: "៤. ភាពអត់ការងារធ្វើ"
                        },
                        content: {
                            en: [
                                "The unemployment coverage scheme plays a very important role in protecting workers and employees from poverty in case they lose their jobs. It is of even greater importance in events of economic crises and, thus, it is one of the main components for maintaining economic balance and social stability. Therefore, the Royal Government will conscientiously assess the possibilities for implementing such a scheme given an on-going economic growth.",
                                "In addition to a feasibility study, building capacity of officials who will be in charge of the scheme is crucial. Based on the characteristics of the future scheme, the MoLVT will lead to its implementation. In preparation for its implementation, the MoLVT will be in charge of conducting the feasibility study and establishing the relevant legal framework in consultation with other stakeholders from the public and private sector as well as development partners."
                            ],
                            kh: [
                                "ការពារបាត់បង់ការងារធ្វើក្នុងមួយរបបសន្តិសុខសង្គមមានតួនាទីសំខាន់ណាស់ក្នុងការការពារកម្មករ និង និយោជិតមិនឱ្យធ្លាក់ក្នុងភាពក្រីក្រនៅពេលពួកគេបាត់បង់ការងារធ្វើ ហើយនេះមានសារៈសំខាន់ជាងនេះទៅទៀតនៅក្នុងពេលមានវិបត្តិសេដ្ឋកិច្ច ដូច្នេះ ការពារបាត់បង់ការងារធ្វើជាថ្នាលជាប់ទាក់ទងផ្នែកសំខាន់មួយក្នុងការរក្សាតុល្យភាពសេដ្ឋកិច្ច និងសង្គម។ យ៉ាងណាមិញ រាជរដ្ឋាភិបាលនឹងពិនិត្យមើលលទ្ធភាពអនុវត្តរបបនេះឱ្យបានត្រឹមត្រូវ ជាពិសេសក្នុងបរិបទនៃកំណើនសេដ្ឋកិច្ចដែលកំពុងតែមាន។",
                                "បន្ថែមពីលើការសិក្សាសក្តានុពល ការបង្កើនសមត្ថភាពរបស់មន្ត្រី ដែលទទួលបន្ទុកគ្រប់គ្រងការពារបាត់បង់ការងារធ្វើគឺមានសារៈសំខាន់ណាស់។ ដោយផ្អែកលើលក្ខណៈនៃការពារនាពេលអនាគត ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ នឹងឈានមុខក្នុងការអនុវត្តរបបនេះ។ ក្នុងការត្រៀមសម្រាប់ការអនុវត្តនេះ ក្រសួងការងារ និងបណ្តុះបណ្តាលវិជ្ជាជីវៈ នឹងទទួលបន្ទុកធ្វើការសិក្សាសក្តានុពល និងបង្កើតក្របខ័ណ្ឌច្បាប់ដែលពាក់ព័ន្ធ ក្នុងការពិគ្រោះជាមួយភាគីពាក់ព័ន្ធផ្សេងទៀតពីវិស័យរដ្ឋ និងឯកជន ក៏ដូចជាដៃគូអភិវឌ្ឍន៍។"
                            ]
                        }
                    },
                    {
                        id: "disabilities",
                        title: {
                            en: "5. Disabilities",
                            kh: "៥. សន្តិសុខសង្គមសម្រាប់ជនពិការ"
                        },
                        content: {
                            en: [
                                "The number of residents with disabilities represents a substantial portion of Cambodian population. Persons with disabilities, and especially severely disabled persons, do not only suffer from permanent physical disabilities, but also from additional vulnerability because of their limited capacity to access means of self-support. Moreover, most persons with disabilities come from poor families. The Royal Government is committed to protect people with disabilities from these two dimensions of vulnerability by providing them with:",
                                "1. Cash assistance to persons with severe disabilities from the poorest and vulnerable families: The Royal Government provides a disability allowance for people with severe disabilities in the poorest and vulnerable families, in accordance to the identification procedures agreed on by the government.",
                                "2. Disability health coverage: The Royal Government fully subsidizes contributions into the social health insurance scheme to enable persons with disability from the poorest and vulnerable families to access healthcare service.",
                                "3. Social care services for persons with severe disabilities: The Royal Government and NGOs provide institutional-based care services and community-based care services.",
                                "4. Employment opportunity for persons with disabilities: The Royal Government encourages public and private employers to hire persons with disabilities and to provide training to upgrade their knowledge and skills, while setting up appropriate working stations.",
                                "5. Mainstreaming the care of persons with disabilities into its national social security programs and projects: The Royal Government ensures that the vulnerable persons with disabilities can access national social protection programs such as children and those with disabilities have the right to access to social assistance and social services that are designed for poverty reduction and enabling them to have better potential livelihoods in accordance to the Law on Social Protection for Persons with Disabilities, and the Prakas on the Establishment of Vulnerability Assessment Teams, etc.",
                                "6. Facilitating the inclusion of persons with disabilities in vocational training: The Royal Government will continue to strengthen and expand functional literacy program and vocational training, both off and on-the-job skills, to support persons with disabilities to participate in productive sectors while on the other hand, the Royal Government will continue to strengthen support for employers who offer internships to train workers with disabilities. Additionally, the Royal Government will promote the participation of both state and private institutions that provide skills to people with disabilities in line with the demands of the labor market, thus improving the quality of life of persons with disabilities."
                            ],
                            kh: [
                                "ចំនួនប្រជាជនដែលមានពិការភាពមានចំនួនគួរឱ្យកត់សម្គាល់មួយនៅក្នុងប្រទេសកម្ពុជា។ ជាពិសេស ជនពិការធ្ងន់ធ្ងរមិនត្រឹមតែទទួលរងការពិការភាពផ្លូវកាយប្រចាំស្ថាពរប៉ុណ្ណោះទេ ប៉ុន្តែពួកគេក៏ទទួលរងនូវភាពងាយរងគ្រោះបន្ថែមទៀតផងដែរ ដែលទាក់ទងនឹងសមត្ថភាពមានកម្រិតរបស់ពួកគេក្នុងការទទួលបាននូវមធ្យោបាយរស់នៅដោយខ្លួនឯង។ លើសពីនេះទៅទៀត ជនពិការភាគច្រើនមកពីគ្រួសារក្រីក្រ និងងាយរងគ្រោះ។ ដូច្នេះ រាជរដ្ឋាភិបាលប្តេជ្ញាចិត្តផ្តល់ការការពារដល់ជនពិការពីភាពងាយរងគ្រោះទាំងពីរនេះ ដោយផ្តល់ឱ្យពួកគេនូវ៖",
                                "៥.១ ការកែទម្រង់ការកំណត់អត្តសញ្ញាណ និងស្វែងរកជនពិការអ្នកមានសិទ្ធិទទួលបានការជំនួយ អំណោយផល និងសេវាកម្មសង្គម៖ រាជរដ្ឋាភិបាលនឹងពិនិត្យឡើងវិញនូវនីតិវិធីកំណត់អត្តសញ្ញាណ និងស្វែងរកជនពិការ ហើយធ្វើឱ្យប្រសើរឡើងនូវការចុះបញ្ជីអ្នកមានសិទ្ធិ ដោយផ្អែកលើមូលដ្ឋានទិន្នន័យនៃការកំណត់អត្ដសញ្ញាណគ្រួសារក្រីក្រ និងងាយរងគ្រោះ។",
                                "៥.២ ការពារសុខភាព និងសំណងសាច់ប្រាក់ដល់ជនពិការធ្ងន់ធ្ងរពីគ្រួសារក្រីក្រ និងងាយរងគ្រោះ៖ រាជរដ្ឋាភិបាលផ្តល់ការជួយសំណងសាច់ប្រាក់ដល់ជនពិការធ្ងន់ធ្ងរពីគ្រួសារក្រីក្រ និងងាយរងគ្រោះ ស្របតាមនីតិវិធីកំណត់អត្តសញ្ញាណដែលរដ្ឋាភិបាលបានឯកភាព។ រាជរដ្ឋាភិបាលក៏ផ្តល់សំណងពេញលេញភាគទានរបស់ពួកគេក្នុងរបបថែទាំសុខភាពសង្គម ដើម្បីអនុញ្ញាតឱ្យជនពិការពីគ្រួសារក្រីក្រ និងងាយរងគ្រោះអាចទទួលបានសេវាថែទាំសុខភាព។",
                                "៥.៣ ការលើកទឹកចិត្តវិស័យឯកជន និងអង្គការក្រៅរដ្ឋាភិបាលក្នុងការផ្តល់ជំនួយ និងអំណោយផលដល់ជនពិការ៖ រាជរដ្ឋាភិបាលលើកទឹកចិត្តវិស័យឯកជន និងអង្គការក្រៅរដ្ឋាភិបាលឱ្យផ្តល់ជំនួយអំណោយផលផ្សេងៗដល់ជនពិការ ដើម្បីបំពេញបន្ថែមលើការផ្តល់របស់រដ្ឋាភិបាល។",
                                "៥.៤ សេវាថែទាំសង្គម និងការងារសង្គមសម្រាប់ជនពិការធ្ងន់ធ្ងរ៖ រាជរដ្ឋាភិបាល និងអង្គការក្រៅរដ្ឋាភិបាលផ្តល់នូវសេវាថែទាំផ្អែកលើស្ថាប័ន និងសេវាថែទាំផ្អែកលើសហគមន៍សម្រាប់ជនពិការធ្ងន់ធ្ងរ។",
                                "៥.៥ ឱកាសការងារសម្រាប់ជនពិការ៖ រាជរដ្ឋាភិបាលលើកទឹកចិត្តនិយោជករាជរដ្ឋ និងឯកជនឱ្យជួលជនពិការឱ្យធ្វើការងារ និងផ្តល់ការបណ្តុះបណ្តាលដើម្បីលើកកម្ពស់ចំណេះដឹងនិងជំនាញរបស់និយោជិតជនពិការ ខណៈពេលជាមួយគ្នានេះក៏លើកកម្ពស់ការរៀបចំកន្លែងធ្វើការសមស្របសម្រាប់ជនពិការ។",
                                "៥.៦ ការធ្វើសមាហរណកម្ម ការថែទាំជនពិការក្នុងកម្មវិធី និងគម្រោងសន្តិសុខសង្គមជាតិ៖ រាជរដ្ឋាភិបាលធានាឱ្យជនពិការងាយរងគ្រោះអាចទទួលបានកម្មវិធីការពារសង្គមជាតិ ដូចជាកុមារ និងជនពិការមានសិទ្ធិទទួលបាននូវការជំនួយសង្គម និងសេវាសង្គមដែលរចនាឡើងសម្រាប់កាត់បន្ថយភាពក្រីក្រ និងអនុញ្ញាតឱ្យពួកគេមានសក្តានុពលរស់នៅប្រសើរឡើង ស្របតាមច្បាប់ស្តីពីការការពារសង្គមសម្រាប់ជនពិការ និងប្រកាសស្តីពីការបង្កើតក្រុមការងារវាយតម្លៃភាពងាយរងគ្រោះ និងច្បាប់ និងបទប្បញ្ញត្តិផ្សេងៗទៀតដែលពាក់ព័ន្ធ។ បន្ថែមលើនេះ រាជរដ្ឋាភិបាលនឹងបន្តពង្រឹងនិងពង្រីកការអក្ខរកម្ម និងកម្មវិធីបណ្តុះបណ្តាលវិជ្ជាជីវៈ ទាំងជំនាញក្រៅការងារ និងក្នុងការងារ ដើម្បីគាំទ្រជនពិការឱ្យចូលរួមក្នុងវិស័យផលិតកម្ម ខណៈពេលខាងមួយទៀត រាជរដ្ឋាភិបាលនឹងបន្តពង្រឹងការគាំទ្រដល់និយោជកដែលផ្តល់កន្លែងកម្មសិក្សាដល់និយោជិតជនពិការ។ លើសពីនេះទៅទៀត រាជរដ្ឋាភិបាលនឹងលើកទឹកចិត្តការចូលរួមពីស្ថាប័នរដ្ឋ និងឯកជនដែលផ្តល់ជំនាញដល់ជនពិការឱ្យស្របតាមតម្រូវការទីផ្សារការងារ ដូច្នេះធ្វើឱ្យប្រសើរឡើងនូវគុណភាពជីវិតរបស់ជនពិការ។"
                            ]
                        }
                    }
                ]
            }
        ]
    }
}; 
