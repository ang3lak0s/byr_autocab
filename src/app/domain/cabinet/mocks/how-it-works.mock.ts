export interface WorkflowStep {
  stepNumber: string;
  title: string;
  subtitle: string;
  description: string;
  badge: string;
  icon: string;
  technicalDetails: string[];
  outputSample: string;
}

export const HOW_IT_WORKS_STEPS: WorkflowStep[] = [
  {
    stepNumber: '01',
    title: 'Select Drivers & Physical Clearances',
    subtitle: 'Driver Size, Cutouts & Magnet Depths',
    description: 'Pick your speaker configuration (1x12, 2x12, 4x12, 1x15). BYR AutoCab automatically verifies circular cutout diameters, bolt circle diameters (BCD), and magnetic depth clearances so your drivers fit without collisions.',
    badge: 'Step 1: Driver Specs',
    icon: 'speaker',
    technicalDetails: [
      'Standard 10", 12", and 15" driver cutout templates (e.g. 11.1" / 282mm for 12")',
      '4-hole or 8-hole #10-32 T-nut bolt circle layouts (11.7" BCD)',
      'Front-loaded vs. Rear-loaded baffle clearances',
      'Minimum edge-margin validation (prevents baffle structural cracking)',
    ],
    outputSample: '1 × 12" Driver (11.1" Cutout) | 6.5" Magnet Clearance OK',
  },
  {
    stepNumber: '02',
    title: 'Choose Enclosure Style & Volume',
    subtitle: 'Closed-Back, Open-Back, or Bass Porting',
    description: 'Set overall exterior dimensions or let the engine calculate dimensions based on target acoustic volume in Litres and Cubic Feet, with adjustments for wood thickness and cleat displacement.',
    badge: 'Step 2: Acoustic Volume',
    icon: 'volume',
    technicalDetails: [
      'Closed-Back sealed acoustic pressure chamber for punchy low-mid attack',
      'Open-Back (Oval / 2-Panel) for airy 360-degree sound distribution',
      'Convertible 3-piece removable center back panel for stage flexibility',
      'Ported bass reflex duct sizing (diameter & tube depth) for bass cabs',
    ],
    outputSample: 'Gross Volume: 42.5 L (1.50 cu ft) | Style: Convertible 3-Piece',
  },
  {
    stepNumber: '03',
    title: 'Adapt Plan to Your Workshop Tools',
    subtitle: 'Cleated Battens, Box Joints, or Rabbets',
    description: 'Don\'t force the builder to adapt to the software. Select your joinery method based on your available tools—from a simple cordless drill and circular saw to a full router table setup.',
    badge: 'Step 3: Joinery & Tools',
    icon: 'tools',
    technicalDetails: [
      'Cleated butt joints: easy assembly with hand tools and corner battens',
      'Finger/box joints: classic boutique vintage tone wood resonance',
      'Rabbeted corners: high mechanical strength for touring road cabs',
      '18mm 13-ply Baltic birch or 3/4" solid clear pine material rules',
    ],
    outputSample: 'Joint: Cleated Butt | Tools: Circular Saw + Drill + Clamps',
  },
  {
    stepNumber: '04',
    title: 'Instant Cut Lists & Hardware BOM',
    subtitle: 'Shop Traveler, Tolex Yardage & T-Nuts',
    description: 'Generate clean panel cut sheets (top, bottom, sides, baffle, back slats, cleats) plus a complete bill of materials for tolex, grill cloth, metal corners, handles, and jack cups.',
    badge: 'Step 4: Shop Output',
    icon: 'clipboard',
    technicalDetails: [
      'Exact dimensions for Top, Bottom, Sides, Baffle, Back Panels & Cleats',
      'Tolex yardage estimation (accounting for 2" corner wrap margins)',
      'Grill cloth dimensions with stretch frame allowance',
      'Complete hardware list: 8 corners, strap handle, jack dish, T-nuts',
    ],
    outputSample: '5 Panels + 4 Cleats | 1.5 Yds Tolex | 8 Metal Corners | 4 T-Nuts',
  },
];
