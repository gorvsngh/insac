require('dotenv').config({ path: require('path').join(__dirname, '../../.env') });
const mongoose = require('mongoose');
const config = require('../config');

async function seedSettings() {
  try {
    const connectDB = require('../config/db');
    await connectDB();

    const EventSettings = require('../models/EventSettings');
    let settings = await EventSettings.findOne();

    if (settings) {
      console.log('Event settings already exist. Updating details...');
    } else {
      settings = new EventSettings();
      console.log('Creating new event settings...');
    }

    // Set template & instructions
    settings.abstractTemplateFile = 'uploads/templates/Template_for_extended_abstract_INSAC-2026.docx';
    settings.abstractTemplateName = 'Template for extended abstract (INSAC-2026).docx';
    settings.abstractInstructions = 'All submissions should conform to the official template format. The extended abstract of contributory papers should not exceed 2 pages including figures, tables, and references in Times New Roman format.';
    settings.abstractWordLimit = 250;
    settings.fees = { student: 500, research_scholar: 750, faculty: 1000 };
    settings.paymentMethods = { upi: true, cash: true, bank_transfer: true };
    settings.paymentInstructions = 'Please complete the registration fee payment via UPI, Cash, or Bank Transfer as instructed by Dr. A.P.J. Abdul Kalam Women\'s Institute of Technology (WIT), LNMU. After payment, submit your transaction reference ID and details below for administrative verification.';
    settings.eventStartDate = '7 December 2026';
    settings.eventEndDate = '11 December 2026';
    settings.datesConfirmed = false;
    settings.datesNote = 'Proposed dates: 7–11 December 2026, subject to approval';
    settings.venue = 'Dr. A.P.J. Abdul Kalam Women\'s Institute of Technology (WIT), Darbhanga, Bihar';
    settings.venueAddress = 'Lalit Narayan Mithila University Campus, Darbhanga, Bihar, India';

    // Set about content
    settings.aboutEvent = `The joint event brings together INSAC 2026 — the Indian Nuclear Society's Annual Conference — and the National Workshop on "Advanced Computing and Nuclear Science: Emerging Technologies, Interdisciplinary Applications and Research Opportunities." Hosted by Dr. A.P.J. Abdul Kalam Women's Institute of Technology (WIT), a constituent unit of Lalit Narayan Mithila University (LNMU), Darbhanga, Bihar, in collaboration with the Indian Nuclear Society (INS), this conference provides a premier platform for researchers, academicians, scientists, and industry professionals to deliberate on critical intersections of nuclear science and advanced computing.`;

    settings.aboutINS = `The Indian Nuclear Society (INS) is a professional body dedicated to promoting the peaceful uses of nuclear energy and radiation technologies in India. INS organizes the annual INSAC conference, which brings together scientists, engineers, and researchers from across the country's nuclear establishment including BARC, NPCIL, BHAVINI, AERB, and other DAE units, along with academic institutions and industry partners. INSAC serves as a premier platform for sharing advances in nuclear science, reactor technologies, fuel cycle, radiation applications, and nuclear medicine.`;

    settings.aboutLNMU = `Lalit Narayan Mithila University (LNMU), established in 1972, is located in Darbhanga, Bihar, India. Named after the legendary Maithili scholar and philosopher, the university serves as a major center for higher education in the Mithila region. LNMU offers a wide range of undergraduate, postgraduate, and doctoral programs across multiple disciplines and is affiliated with numerous constituent and affiliated colleges throughout the region.`;

    settings.aboutWIT = `Dr. A.P.J. Abdul Kalam Women's Institute of Technology (WIT) is a constituent unit of Lalit Narayan Mithila University, Darbhanga, Bihar. Named after the former President of India and renowned scientist Dr. A.P.J. Abdul Kalam, the institute is dedicated to providing quality technical education to women. WIT offers programs in engineering and technology disciplines, fostering innovation, research, and professional development among its students and faculty.`;

    // Set committees
    settings.committees = [
      // Office Bearers
      { name: 'Vice Chancellor', designation: 'Chief Patron', group: 'office_bearers', role: 'Chief Patron', sortOrder: 1 },
      { name: 'Registrar', designation: 'Patron', group: 'office_bearers', role: 'Patron', sortOrder: 2 },
      { name: 'Director', designation: 'President', group: 'office_bearers', role: 'President', sortOrder: 3 },
      { name: 'Dr. Rashmi', designation: 'Convener', group: 'office_bearers', role: 'Convener', sortOrder: 4 },
      { name: 'Mrs. Charmis Mariwala', designation: 'Deputy Convener', group: 'office_bearers', role: 'Deputy Convener', sortOrder: 5 },

      // Advisory - Physics
      { name: 'Prof. Naushad Alam', department: 'Physics', group: 'advisory_physics', sortOrder: 1 },
      { name: 'Dr. Pooja Agarwal', department: 'Physics', group: 'advisory_physics', sortOrder: 2 },
      { name: 'Dr. Sumandeep Kaur', department: 'Physics', group: 'advisory_physics', sortOrder: 3 },

      // Advisory - Chemistry
      { name: 'Dr. Abhishek Rai', department: 'Chemistry', group: 'advisory_chemistry', sortOrder: 1 },
      { name: 'Dr. Arindra Sharma', department: 'Chemistry', group: 'advisory_chemistry', sortOrder: 2 },

      // Advisory - Zoology
      { name: 'Dr. Parul Banergee', department: 'Zoology', group: 'advisory_zoology', sortOrder: 1 },

      // Advisory - Botany
      { name: 'Dr. Aniket Kumar Singh', department: 'Botany', group: 'advisory_botany', sortOrder: 1 },

      // Advisory - WIT
      { name: 'Mr. Amit Kumar Mishra', institution: 'WIT', group: 'advisory_wit', sortOrder: 1 },
      { name: 'Mrs. Neha Kumari', institution: 'WIT', group: 'advisory_wit', sortOrder: 2 },
      { name: 'Mr. Ashif Habibi', institution: 'WIT', group: 'advisory_wit', sortOrder: 3 },
      { name: 'Dr. Zakirullah Shamim', institution: 'WIT', group: 'advisory_wit', sortOrder: 4 },
      { name: 'Dr. Avinash Chandra', institution: 'WIT', group: 'advisory_wit', sortOrder: 5 },

      // Organizing Committee
      { name: 'Deputy Registrar (WIT)', group: 'organizing', sortOrder: 1 },
      { name: 'A.O.', group: 'organizing', sortOrder: 2 },
      { name: 'Deputy Registrar 1 (LNMU)', group: 'organizing', sortOrder: 3 },
      { name: 'Deputy Registrar 2 (LNMU)', group: 'organizing', sortOrder: 4 },
      { name: 'All teaching faculty (WIT)', group: 'organizing', sortOrder: 5 },
    ];

    // Set themes
    settings.themes = [
      // Workshop themes
      { title: 'Advanced Computing Applications in Nuclear Science', category: 'workshop', sortOrder: 1, isPublished: true },
      { title: 'AI and Digital Twins for Nuclear Reactor Monitoring and Safety', category: 'workshop', sortOrder: 2, isPublished: true },
      { title: 'Advanced Computing Applications in Healthcare and Medical Sciences', category: 'workshop', sortOrder: 3, isPublished: true },
      { title: 'Nuclear Physics and Advanced Computing in Cancer Diagnosis and Treatment', category: 'workshop', sortOrder: 4, isPublished: true },
      { title: 'Advanced Computing for Molecular and Cellular Biology', category: 'workshop', sortOrder: 5, isPublished: true },
      { title: 'Hazard Prediction and Management', category: 'workshop', sortOrder: 6, isPublished: true },
      { title: 'GeoAI and High-Performance Computing for Nuclear Power Plant Siting and Environmental Risk Assessment', category: 'workshop', sortOrder: 7, isPublished: true },
      { title: 'AI, Machine Learning, Data Science, Cloud Computing, Cybersecurity, IoT, Generative AI, and Industry 5.0', category: 'workshop', sortOrder: 8, isPublished: true },

      // INSAC Conference topics
      { title: '700 MWe PHWR: Work Horse of DAE', category: 'conference', sortOrder: 1, isPublished: true },
      { title: 'Innovation & Challenges in Design and Validation of SMRs and BSR-220', category: 'conference', sortOrder: 2, isPublished: true },
      { title: 'PFBR: Gateway to Thorium Utilization', category: 'conference', sortOrder: 3, isPublished: true },
      { title: 'Accelerating Nuclear Power: Role of PSUs and Private Industries in National Nuclear Mission', category: 'conference', sortOrder: 4, isPublished: true },
      { title: 'Developing Human Resources for Nuclear Power Sector', category: 'conference', sortOrder: 5, isPublished: true },
      { title: 'Advances in Reactor Technology for Gen III+ Reactors', category: 'conference', sortOrder: 6, isPublished: true },
      { title: 'Advances in Nuclear Fuel Cycle Technologies (From Ore to Core)', category: 'conference', sortOrder: 7, isPublished: true },
      { title: 'Advances in Fuel Reprocessing and Waste Management', category: 'conference', sortOrder: 8, isPublished: true },
      { title: 'Statutory Role of AERB and SHANTI Act', category: 'conference', sortOrder: 9, isPublished: true },
      { title: 'Recent Developments in Nuclear Technology for Agriculture and Food Security', category: 'conference', sortOrder: 10, isPublished: true },
      { title: 'Applications of Radioisotopes, Lasers and Electron Beam in Industry', category: 'conference', sortOrder: 11, isPublished: true },
      { title: 'Nuclear Medicine: Current Challenges and Innovations', category: 'conference', sortOrder: 12, isPublished: true },
      { title: 'Recent Advances in Fusion and Accelerator Technology', category: 'conference', sortOrder: 13, isPublished: true },
    ];

    await settings.save();
    console.log('Event settings seeded successfully.');

    await mongoose.disconnect();
    process.exit(0);
  } catch (error) {
    console.error('Error seeding settings:', error.message);
    process.exit(1);
  }
}

seedSettings();
