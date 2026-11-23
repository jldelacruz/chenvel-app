/** Example "To Pay" rows for the Apply Payment screen, until real data is available. */
export type ToPayItem = {
  id: string;
  fullName: string;
  number: string; // Box number (has letters) or tracking number (digits only).
  amount: number;
};

export const toPayItems: ToPayItem[] = [
  { id: '1', fullName: 'Maria Santos', number: 'BX10293', amount: 1250.0 },
  { id: '2', fullName: 'John Michael Reyes', number: '784512093361', amount: 860.5 },
  { id: '3', fullName: 'Angela Cruz', number: 'MNL4471', amount: 2340.75 },
  { id: '4', fullName: 'Daniel Garcia', number: '920017733508', amount: 415.0 },
  { id: '5', fullName: 'Patricia Lim', number: 'CEB0082', amount: 3175.25 },
  { id: '6', fullName: 'Ramon Villanueva', number: '660214598013', amount: 980.0 },
  { id: '7', fullName: 'Kristine Mendoza', number: 'DVO2215', amount: 1520.4 },
  { id: '8', fullName: 'Joseph Tan', number: '731100482275', amount: 645.9 },
  { id: '9', fullName: 'Liza Bautista', number: 'ILO7731', amount: 2210.0 },
  { id: '10', fullName: 'Mark Anthony Ramos', number: '508833120947', amount: 1095.6 },
];
