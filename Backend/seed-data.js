import mongoose from 'mongoose';
import Project from './scr/Features/project/project.model.js';
import dotenv from 'dotenv';

dotenv.config();

const seedProjects = async () => {
  await mongoose.connect(process.env.MONGO_URI);
  await Project.deleteMany({});

  const projects = [
    {
      name: 'Riverbend Data Centre',
      description: 'Mission-critical data centre project with power, cooling, and network integration.',
      company: 'EPC Solutions',
      location: 'Mumbai, India',
      status: 'In Progress',
      startDate: '2026-01-15',
      endDate: '2026-12-15',
      schedule: [
        { id: 'T-001', title: 'Switchgear Installation', description: 'Install switchgear units A and B in electrical room', status: 'In Progress', priority: 'High', dueDate: '2026-07-25', assignedTeam: 'Electrical Team', dependencies: ['Foundation Complete', 'Switchgear Delivery'], progress: 65, category: 'Equipment Installation', documents: ['switchgear_manual.pdf', 'installation_guide.pdf'], vendor: 'Voltage Systems Inc.', equipment: ['Switchgear Unit A', 'Switchgear Unit B'], aiInsight: 'Installation is progressing well. Ensure torque specifications are followed.', recoverySuggestion: null },
        { id: 'T-002', title: 'Cooling Tower Commissioning', description: 'Complete testing and commissioning of cooling tower 1', status: 'Delayed', priority: 'Critical', dueDate: '2026-07-20', assignedTeam: 'Mechanical Team', dependencies: ['Cooling Tower Installation', 'Water Supply Connection'], progress: 40, category: 'Commissioning', documents: ['cooling_specs.pdf', 'test_procedure.pdf'], vendor: 'CoolFlow Engineering', equipment: ['Cooling Tower 1'], aiInsight: 'Pressure imbalance detected. Recalibration required before proceeding.', recoverySuggestion: 'Recalibrate cooling loop valves and re-run pressure test. Estimated 2 days to resolve.' },
        { id: 'T-003', title: 'UPS System Testing', description: 'Perform load transfer testing on UPS modules', status: 'At Risk', priority: 'High', dueDate: '2026-07-28', assignedTeam: 'Power Systems Team', dependencies: ['UPS Installation', 'Battery Bank Installation'], progress: 50, category: 'Testing', documents: ['ups_specs.pdf', 'test_procedure.pdf'], vendor: 'Voltage Systems Inc.', equipment: ['UPS Module 1', 'UPS Module 2'], aiInsight: 'Firmware mismatch detected. Update required before load testing.', recoverySuggestion: 'Update UPS firmware to version 3.2.1. Schedule maintenance window.' }
      ],
      vendors: [
        { id: 'V-001', name: 'Voltage Systems Inc.', equipment: ['Switchgear Unit A', 'UPS Module 1'], contact: 'contact@voltagesystems.com', status: 'Active', deliveryStatus: 'On Track', expectedDelivery: '2026-07-20', reliabilityScore: 92, completedOrders: 8, issues: 0 },
        { id: 'V-002', name: 'CoolFlow Engineering', equipment: ['Cooling Tower 1'], contact: 'info@coolflow.com', status: 'Active', deliveryStatus: 'Delayed', expectedDelivery: '2026-07-25', reliabilityScore: 78, completedOrders: 5, issues: 2 }
      ],
      equipment: [
        { id: 'EQ-001', name: 'Switchgear Unit A', type: 'Electrical', model: 'SG-2000', vendor: 'Voltage Systems Inc.', quantity: 2, status: 'Installed', installationStatus: 'Installed', testingStatus: 'Passed', specifications: '2000A, 480V, 3-Phase', documents: ['specifications.pdf', 'test_report_A.pdf'], maintenanceHistory: 'Last serviced: Jun 2026' },
        { id: 'EQ-002', name: 'Cooling Tower 1', type: 'Mechanical', model: 'CT-1500', vendor: 'CoolFlow Engineering', quantity: 3, status: 'In Progress', installationStatus: 'In Progress', testingStatus: 'Failed', specifications: '1500 TR, Evaporative Cooling', documents: ['cooling_specs.pdf'], maintenanceHistory: 'Installation in progress' },
        { id: 'EQ-004', name: 'UPS Module 1', type: 'Power', model: 'UPS-500', vendor: 'Voltage Systems Inc.', quantity: 4, status: 'Commissioned', installationStatus: 'Commissioned', testingStatus: 'Passed', specifications: '500kVA, 480V', documents: ['ups_specs.pdf', 'commissioning_report.pdf'], maintenanceHistory: 'Commissioned: Jul 2026' }
      ],
      commissioning: {
        readinessScore: 86,
        readyForHandover: true,
        overallCompletion: 82,
        remainingCriticalTests: 3,
        systems: [
          { id: 'power', name: 'Power Systems', total: 24, passed: 20, failed: 2, pending: 2, status: 'In Progress' },
          { id: 'cooling', name: 'Cooling Systems', total: 18, passed: 14, failed: 3, pending: 1, status: 'In Progress' },
          { id: 'network', name: 'Network & IT', total: 30, passed: 28, failed: 0, pending: 2, status: 'In Progress' }
        ],
        ncrData: [
          { id: 'NCR-001', issue: 'UPS Load Transfer Time Exceeds Specification', severity: 'Critical', engineer: 'Jane Smith', status: 'In Progress', date: '2026-07-09' },
          { id: 'NCR-002', issue: 'Cooling Tower Pressure Mismatch', severity: 'High', engineer: 'Mike Johnson', status: 'Open', date: '2026-07-09' }
        ],
        timeline: [
          { phase: 'Power Testing', status: 'completed', date: '2026-07-05' },
          { phase: 'Cooling Testing', status: 'in-progress', date: '2026-07-09' },
          { phase: 'Integrated System Testing', status: 'pending', date: '2026-07-12' }
        ],
        aiRecommendations: [
          { title: 'Cooling System Test Failed', description: 'Pressure imbalance detected. Recalibrate the cooling loop before performing Integrated System Testing.', priority: 'Critical' }
        ]
      },
      reports: [
        { id: 1, title: 'Project Summary Report', description: 'Overall project health, progress, milestones, and pending work', type: 'summary', status: 'Open', date: '2026-07-10', category: 'Project Overview', icon: 'ti-dashboard' },
        { id: 2, title: 'Risk Analysis Report', description: 'Identified risks, severity levels, and mitigation suggestions', type: 'risk', status: 'Open', date: '2026-07-09', category: 'AI Intelligence', icon: 'ti-alert-triangle' }
      ]
    },
    {
      name: 'Sunrise Data Centre',
      description: 'New edge data centre with hybrid backup systems and renewable cooling.',
      company: 'Northwind EPC',
      location: 'Bengaluru, India',
      status: 'Planning',
      startDate: '2026-03-01',
      endDate: '2027-02-01',
      schedule: [
        { id: 'S-001', title: 'Foundation Pour', description: 'Complete concrete foundation for module 1', status: 'Upcoming', priority: 'High', dueDate: '2026-08-15', assignedTeam: 'Civil Team', dependencies: ['Site Survey'], progress: 10, category: 'Civil', documents: ['site_plan.pdf'], vendor: 'BuildCore', equipment: ['Foundation Formwork'], aiInsight: 'Weather window is narrow. Advance procurement needed.', recoverySuggestion: null }
      ],
      vendors: [
        { id: 'V-101', name: 'BuildCore', equipment: ['Foundation Formwork'], contact: 'ops@buildcore.com', status: 'Active', deliveryStatus: 'On Track', expectedDelivery: '2026-08-02', reliabilityScore: 90, completedOrders: 9, issues: 1 }
      ],
      equipment: [
        { id: 'EQ-101', name: 'Backup Battery Bank', type: 'Power', model: 'BB-400', vendor: 'BuildCore', quantity: 2, status: 'Not Installed', installationStatus: 'Not Installed', testingStatus: 'Pending', specifications: '400kWh, modular', documents: ['battery_specs.pdf'], maintenanceHistory: 'Awaiting delivery' }
      ],
      commissioning: {
        readinessScore: 61,
        readyForHandover: false,
        overallCompletion: 34,
        remainingCriticalTests: 8,
        systems: [
          { id: 'backup', name: 'Backup Systems', total: 10, passed: 3, failed: 1, pending: 6, status: 'In Progress' }
        ],
        ncrData: [],
        timeline: [
          { phase: 'Site Preparation', status: 'completed', date: '2026-06-01' },
          { phase: 'Structural Work', status: 'pending', date: '2026-08-10' }
        ],
        aiRecommendations: []
      },
      reports: [
        { id: 3, title: 'Planning Report', description: 'Initial planning and procurement status', type: 'summary', status: 'Open', date: '2026-06-12', category: 'Project Overview', icon: 'ti-dashboard' }
      ]
    },
    {
      name: 'Delta EPC Project',
      description: 'Industrial automation and utility plant expansion project.',
      company: 'Delta Infrastructure',
      location: 'Abu Dhabi, UAE',
      status: 'Completed',
      startDate: '2025-04-01',
      endDate: '2026-06-01',
      schedule: [
        { id: 'D-001', title: 'Automation Integration', description: 'Complete PLC and SCADA integration', status: 'Completed', priority: 'High', dueDate: '2026-05-18', assignedTeam: 'Controls Team', dependencies: ['Panel Delivery'], progress: 100, category: 'Automation', documents: ['scada_specs.pdf'], vendor: 'Axiom Controls', equipment: ['PLC Rack'], aiInsight: 'Integration completed with no further issues.', recoverySuggestion: null }
      ],
      vendors: [
        { id: 'V-201', name: 'Axiom Controls', equipment: ['PLC Rack'], contact: 'sales@axiomcontrols.com', status: 'Completed', deliveryStatus: 'Delivered', expectedDelivery: '2026-05-10', reliabilityScore: 96, completedOrders: 14, issues: 0 }
      ],
      equipment: [
        { id: 'EQ-201', name: 'PLC Rack', type: 'Automation', model: 'PLX-900', vendor: 'Axiom Controls', quantity: 1, status: 'Commissioned', installationStatus: 'Commissioned', testingStatus: 'Passed', specifications: 'Industrial PLC', documents: ['plc_specs.pdf'], maintenanceHistory: 'Commissioned: May 2026' }
      ],
      commissioning: {
        readinessScore: 95,
        readyForHandover: true,
        overallCompletion: 100,
        remainingCriticalTests: 0,
        systems: [
          { id: 'automation', name: 'Automation Systems', total: 12, passed: 12, failed: 0, pending: 0, status: 'Completed' }
        ],
        ncrData: [],
        timeline: [
          { phase: 'Commissioning', status: 'completed', date: '2026-05-30' }
        ],
        aiRecommendations: []
      },
      reports: [
        { id: 4, title: 'Final Commissioning Report', description: 'All systems commissioned successfully', type: 'commissioning', status: 'Resolved', date: '2026-06-01', category: 'Commissioning', icon: 'ti-clipboard-check' }
      ]
    }
  ];

  await Project.insertMany(projects);
  console.log('Seeded projects:', projects.length);
  await mongoose.disconnect();
};

seedProjects().catch((error) => {
  console.error(error);
  process.exit(1);
});
