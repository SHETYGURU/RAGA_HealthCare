import jsPDF from 'jspdf';
import type { Patient } from '../types';

export const generatePatientPDF = async (patient: Patient, previewOnly: boolean = false): Promise<string | void> => {
  const doc = new jsPDF();
  
  // Custom styling matching the image
  const brandColor = '#0284c7'; // cyan-blue
  const headerGray = '#334155';
  
  // Header background
  doc.setFillColor(brandColor);
  doc.rect(0, 0, 210, 40, 'F');
  
  // Header Text
  doc.setTextColor('#ffffff');
  doc.setFontSize(24);
  doc.setFont("helvetica", "bold");
  doc.text('Patient Information Form', 15, 25);
  
  // Load Logo (logo.jpg)
  try {
    const res = await fetch('/assets/logo.jpg');
    const blob = await res.blob();
    const reader = new FileReader();
    await new Promise((resolve, reject) => {
      reader.onloadend = () => {
        const dataUrl = reader.result as string;
        const format = dataUrl.includes('image/jpeg') ? 'JPEG' : 'PNG';
        doc.addImage(dataUrl, format, 175, 10, 20, 20);
        resolve(null);
      };
      reader.onerror = reject;
      reader.readAsDataURL(blob);
    });
  } catch (err) {
    console.error('Could not load logo to PDF', err);
    doc.setFontSize(14);
    doc.text('RAGA HealthCare', 170, 25);
  }
  
  // reset colors
  doc.setTextColor('#0f172a');
  
  // Helper to draw a labeled field
  const drawField = (label: string, value: string, x: number, y: number, width: number) => {
    doc.setFontSize(9);
    doc.setFont("helvetica", "normal");
    doc.setTextColor(headerGray);
    doc.text(label, x, y);
    
    // Background pill
    doc.setFillColor('#f1f5f9');
    doc.roundedRect(x + doc.getTextWidth(label) + 2, y - 4, width, 6, 2, 2, 'F');
    
    doc.setTextColor('#000000');
    doc.setFontSize(10);
    // truncate value if too long, or let it overlap for now
    doc.text(value || '', x + doc.getTextWidth(label) + 4, y);
  };
  
  let y = 60;
  
  // Section: INFORMATION
  doc.setTextColor(brandColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('INFORMATION', 15, y);
  y += 10;
  
  drawField('Patient Name', patient.name, 15, y, 70);
  drawField('Date of Birth', patient.dob, 120, y, 40);
  y += 12;
  
  drawField('Age', String(patient.age), 15, y, 20);
  drawField('Sex', patient.sex, 60, y, 30);
  drawField('Email', patient.email, 120, y, 60);
  y += 12;
  
  drawField('Address', patient.address, 15, y, 150);
  y += 12;
  
  drawField('Cell Phone', patient.phone, 15, y, 50);
  drawField('Work Phone', patient.workPhone || 'N/A', 120, y, 50);
  y += 16;
  
  doc.setFontSize(9);
  doc.setTextColor(headerGray);
  doc.text('Please indicate the person that we are authorized to share your treatment information with', 15, y);
  y += 4;
  doc.setFillColor('#f1f5f9');
  doc.roundedRect(15, y, 180, 6, 2, 2, 'F');
  doc.setTextColor('#000000');
  doc.setFontSize(10);
  doc.text(patient.emergencyContact1Name || 'None', 17, y + 4);
  y += 20;

  // Section: MARITAL STATUS
  doc.setTextColor(brandColor);
  doc.setFontSize(12);
  doc.setFont("helvetica", "bold");
  doc.text('MARITAL STATUS', 15, y);
  y += 10;
  
  // checkboxes representation
  const statuses = ['Divorced', 'Single', 'Married', 'Significant other', 'Widowed', 'Other'];
  doc.setFontSize(9);
  doc.setTextColor(headerGray);
  
  const mStatus = patient.maritalStatus || 'Single';
  
  let mx = 15;
  let my = y;
  statuses.forEach((s, i) => {
    // Checkbox box
    doc.setFillColor(s === mStatus ? brandColor : '#f1f5f9');
    doc.rect(mx, my - 3, 3, 3, 'F');
    doc.setTextColor(headerGray);
    doc.text(s, mx + 5, my);
    
    mx += 40;
    if (i === 2) {
      mx = 15;
      my += 8;
    }
  });
  
  drawField('Specify', patient.maritalStatusSpecify || '', 130, y+8, 40);
  y += 24;
  
  // Emergency contacts & provider
  drawField('Emergency Contact', patient.emergencyContact1Name, 15, y, 60);
  drawField('Phone', patient.emergencyContact1Phone, 120, y, 40);
  y += 12;
  
  drawField('Emergency Contact', patient.emergencyContact2Name || 'N/A', 15, y, 60);
  drawField('Phone', patient.emergencyContact2Phone || 'N/A', 120, y, 40);
  y += 12;
  
  drawField('Primary Care Physician', patient.primaryCarePhysician, 15, y, 60);
  drawField('Phone', patient.primaryCarePhysicianPhone || 'N/A', 120, y, 40);
  y += 16;
  
  doc.setFontSize(9);
  doc.setTextColor(headerGray);
  doc.text('Reason for Appointment', 15, y);
  y += 4;
  doc.setFillColor('#f1f5f9');
  doc.roundedRect(15, y, 180, 6, 2, 2, 'F');
  doc.setTextColor('#000000');
  doc.setFontSize(10);
  doc.text(patient.reasonForAppointment || patient.condition, 17, y + 4);
  
  if (previewOnly) {
    const blob = doc.output('blob');
    return URL.createObjectURL(blob);
  }
  
  // Save PDF
  doc.save(`${patient.name.replace(/\s+/g, '_')}_Information_Form.pdf`);
};
