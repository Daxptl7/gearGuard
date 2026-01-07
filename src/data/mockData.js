// Mock data for GearGuard application

export const technicians = [
  { id: 1, name: 'Dax patel', initials: 'DP', email: 'daxpatel@gardgear.com' },
  { id: 2, name: 'Sarah Johnson', initials: 'SJ', email: 'sarah@gardgear.com' },
  { id: 3, name: 'Mike Davis', initials: 'MD', email: 'mike@gardgear.com' },
  { id: 4, name: 'Emily Wilson', initials: 'EW', email: 'emily@gardgear.com' },
  { id: 5, name: 'David Brown', initials: 'DB', email: 'david@gardgear.com' },
];

export const teams = [
  { id: 1, name: 'Electrical Team', color: '#667eea' },
  { id: 2, name: 'Mechanical Team', color: '#4facfe' },
  { id: 3, name: 'HVAC Team', color: '#f093fb' },
  { id: 4, name: 'Plumbing Team', color: '#fbbf24' },
];

export const equipmentCategories = [
  { id: 1, name: 'Pumps', icon: '🔧' },
  { id: 2, name: 'Motors', icon: '⚙️' },
  { id: 3, name: 'HVAC Units', icon: '❄️' },
  { id: 4, name: 'Generators', icon: '⚡' },
  { id: 5, name: 'Compressors', icon: '🔩' },
];

export const equipment = [
  { 
    id: 1, 
    name: 'Pump A-101', 
    category: 'Pumps', 
    categoryId: 1,
    location: 'Building A - Floor 1',
    serialNumber: 'PMP-2023-001',
    installDate: '2023-01-15',
    lastMaintenance: '2024-11-15',
  },
  { 
    id: 2, 
    name: 'Motor B-205', 
    category: 'Motors', 
    categoryId: 2,
    location: 'Building B - Floor 2',
    serialNumber: 'MTR-2023-045',
    installDate: '2023-03-20',
    lastMaintenance: '2024-10-20',
  },
  { 
    id: 3, 
    name: 'HVAC C-301', 
    category: 'HVAC Units', 
    categoryId: 3,
    location: 'Building C - Roof',
    serialNumber: 'HVAC-2022-089',
    installDate: '2022-06-10',
    lastMaintenance: '2024-12-01',
  },
  { 
    id: 4, 
    name: 'Generator D-401', 
    category: 'Generators', 
    categoryId: 4,
    location: 'Building D - Basement',
    serialNumber: 'GEN-2021-012',
    installDate: '2021-08-05',
    lastMaintenance: '2024-11-01',
  },
  { 
    id: 5, 
    name: 'Compressor E-501', 
    category: 'Compressors', 
    categoryId: 5,
    location: 'Building E - Floor 3',
    serialNumber: 'CMP-2023-078',
    installDate: '2023-09-12',
    lastMaintenance: '2024-12-10',
  },
];

// Helper function to generate a date
const getDate = (daysOffset) => {
  const date = new Date();
  date.setDate(date.getDate() + daysOffset);
  return date.toISOString().split('T')[0];
};

export const maintenanceRequests = [
  {
    id: 1,
    equipmentId: 1,
    equipmentName: 'Pump A-101',
    description: 'Routine inspection and oil change',
    status: 'new',
    priority: 'medium',
    technicianId: null,
    teamId: 1,
    scheduledDate: getDate(5),
    createdDate: getDate(-2),
    isPreventive: true,
    notes: 'Check for leaks and unusual sounds',
  },
  {
    id: 2,
    equipmentId: 2,
    equipmentName: 'Motor B-205',
    description: 'Bearing replacement needed',
    status: 'in-progress',
    priority: 'high',
    technicianId: 1,
    teamId: 2,
    scheduledDate: getDate(0),
    createdDate: getDate(-5),
    isPreventive: false,
    notes: 'Unusual noise detected during operation',
  },
  {
    id: 3,
    equipmentId: 3,
    equipmentName: 'HVAC C-301',
    description: 'Filter replacement and cleaning',
    status: 'in-progress',
    priority: 'medium',
    technicianId: 2,
    teamId: 3,
    scheduledDate: getDate(-1),
    createdDate: getDate(-7),
    isPreventive: true,
    notes: 'Quarterly maintenance schedule',
  },
  {
    id: 4,
    equipmentId: 4,
    equipmentName: 'Generator D-401',
    description: 'Load testing and fuel system check',
    status: 'repaired',
    priority: 'high',
    technicianId: 3,
    teamId: 1,
    scheduledDate: getDate(-10),
    createdDate: getDate(-15),
    completedDate: getDate(-3),
    isPreventive: true,
    notes: 'Annual certification required',
  },
  {
    id: 5,
    equipmentId: 5,
    equipmentName: 'Compressor E-501',
    description: 'Pressure valve calibration',
    status: 'new',
    priority: 'low',
    technicianId: null,
    teamId: 2,
    scheduledDate: getDate(10),
    createdDate: getDate(-1),
    isPreventive: true,
    notes: 'Semi-annual preventive maintenance',
  },
  {
    id: 6,
    equipmentId: 1,
    equipmentName: 'Pump A-101',
    description: 'Emergency repair - seal leak',
    status: 'scrap',
    priority: 'critical',
    technicianId: 4,
    teamId: 1,
    scheduledDate: getDate(-20),
    createdDate: getDate(-25),
    completedDate: getDate(-18),
    isPreventive: false,
    notes: 'Equipment marked for replacement - beyond economical repair',
    scrapReason: 'Excessive wear, replacement more cost-effective',
  },
  {
    id: 7,
    equipmentId: 3,
    equipmentName: 'HVAC C-301',
    description: 'Refrigerant level check',
    status: 'new',
    priority: 'medium',
    technicianId: null,
    teamId: 3,
    scheduledDate: getDate(15),
    createdDate: getDate(0),
    isPreventive: true,
    notes: 'Monthly preventive check',
  },
  {
    id: 8,
    equipmentId: 2,
    equipmentName: 'Motor B-205',
    description: 'Overheating issue',
    status: 'in-progress',
    priority: 'critical',
    technicianId: 5,
    teamId: 2,
    scheduledDate: getDate(-2),
    createdDate: getDate(-3),
    isPreventive: false,
    notes: 'URGENT: Motor running 20°C above normal',
  },
];

// Helper function to count open requests per equipment
export const getOpenRequestsCount = (equipmentId) => {
  return maintenanceRequests.filter(
    req => req.equipmentId === equipmentId && 
    (req.status === 'new' || req.status === 'in-progress')
  ).length;
};

// Helper function to check if equipment should be scrapped
export const shouldScrapEquipment = (equipmentId) => {
  const scrapRequests = maintenanceRequests.filter(
    req => req.equipmentId === equipmentId && req.status === 'scrap'
  );
  return scrapRequests.length > 0;
};

// Get requests by status for Kanban board
export const getRequestsByStatus = (status) => {
  return maintenanceRequests.filter(req => req.status === status);
};

// Get requests for calendar (preventive maintenance)
export const getPreventiveRequests = () => {
  return maintenanceRequests.filter(req => req.isPreventive);
};

// Get analytics data
export const getRequestsByTeam = () => {
  return teams.map(team => ({
    team: team.name,
    count: maintenanceRequests.filter(req => req.teamId === team.id).length,
    color: team.color,
  }));
};

export const getRequestsByCategory = () => {
  const categoryCounts = {};
  
  maintenanceRequests.forEach(req => {
    const equip = equipment.find(e => e.id === req.equipmentId);
    if (equip) {
      const category = equip.category;
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  });
  
  return Object.entries(categoryCounts).map(([name, value]) => ({
    name,
    value,
  }));
};

export const getStatusCounts = () => {
  return {
    new: maintenanceRequests.filter(req => req.status === 'new').length,
    inProgress: maintenanceRequests.filter(req => req.status === 'in-progress').length,
    repaired: maintenanceRequests.filter(req => req.status === 'repaired').length,
    scrap: maintenanceRequests.filter(req => req.status === 'scrap').length,
    total: maintenanceRequests.length,
  };
};
