import React from 'react';
import {
  Document,
  Page,
  Text,
  View,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';
import type { StructuredResume } from '@/types/profile';

const styles = StyleSheet.create({
  page: { padding: 40, fontFamily: 'Helvetica', fontSize: 10, color: '#1a1a1a' },
  name: { fontSize: 20, fontWeight: 'bold', marginBottom: 4 },
  contact: { fontSize: 9, color: '#555', marginBottom: 12 },
  sectionTitle: { fontSize: 12, fontWeight: 'bold', borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 6, marginTop: 12, paddingBottom: 2 },
  entryHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 2 },
  entryTitle: { fontWeight: 'bold', fontSize: 10 },
  entryOrg: { fontSize: 9, color: '#444' },
  entryDate: { fontSize: 9, color: '#666' },
  bullet: { marginLeft: 12, marginBottom: 2 },
  summary: { marginBottom: 8, lineHeight: 1.4 },
  skillsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 4 },
  skillChip: { backgroundColor: '#f0f0f0', padding: '2 6', borderRadius: 4, fontSize: 9 },
});

function formatDate(date: string | null): string {
  if (!date) return '';
  try {
    return new Date(date).toLocaleDateString('en-US', { month: 'short', year: 'numeric' });
  } catch { return date; }
}

function ResumePDF({ resume }: { resume: StructuredResume }) {
  const { personal, summary, experience, education, skills, projects } = resume;

  return React.createElement(
    Document,
    null,
    React.createElement(
      Page,
      { size: 'A4', style: styles.page },
      // Header
      React.createElement(Text, { style: styles.name }, personal.full_name),
      React.createElement(
        Text,
        { style: styles.contact },
        [personal.email, personal.phone, personal.location, personal.linkedin_url]
          .filter(Boolean)
          .join(' · '),
      ),
      // Summary
      summary && React.createElement(
        View,
        null,
        React.createElement(Text, { style: styles.sectionTitle }, 'Summary'),
        React.createElement(Text, { style: styles.summary }, summary),
      ),
      // Experience
      experience?.length > 0 && React.createElement(
        View,
        null,
        React.createElement(Text, { style: styles.sectionTitle }, 'Experience'),
        ...experience.map((exp, i) =>
          React.createElement(
            View,
            { key: i, style: { marginBottom: 8 } },
            React.createElement(
              View,
              { style: styles.entryHeader },
              React.createElement(Text, { style: styles.entryTitle }, exp.title),
              React.createElement(
                Text,
                { style: styles.entryDate },
                `${formatDate(exp.start_date)} – ${exp.is_current ? 'Present' : formatDate(exp.end_date)}`,
              ),
            ),
            React.createElement(Text, { style: styles.entryOrg }, exp.organization),
            ...(exp.bullets ?? []).map((b, j) =>
              React.createElement(Text, { key: j, style: styles.bullet }, `• ${b}`),
            ),
          ),
        ),
      ),
      // Education
      education?.length > 0 && React.createElement(
        View,
        null,
        React.createElement(Text, { style: styles.sectionTitle }, 'Education'),
        ...education.map((edu, i) =>
          React.createElement(
            View,
            { key: i, style: { marginBottom: 6 } },
            React.createElement(
              View,
              { style: styles.entryHeader },
              React.createElement(Text, { style: styles.entryTitle }, edu.title),
              React.createElement(Text, { style: styles.entryDate }, formatDate(edu.end_date)),
            ),
            React.createElement(Text, { style: styles.entryOrg }, edu.organization),
          ),
        ),
      ),
      // Projects
      projects?.length > 0 && React.createElement(
        View,
        null,
        React.createElement(Text, { style: styles.sectionTitle }, 'Projects'),
        ...projects.map((proj, i) =>
          React.createElement(
            View,
            { key: i, style: { marginBottom: 6 } },
            React.createElement(Text, { style: styles.entryTitle }, proj.title),
            ...(proj.bullets ?? []).map((b, j) =>
              React.createElement(Text, { key: j, style: styles.bullet }, `• ${b}`),
            ),
          ),
        ),
      ),
      // Skills
      skills?.length > 0 && React.createElement(
        View,
        null,
        React.createElement(Text, { style: styles.sectionTitle }, 'Skills'),
        React.createElement(
          View,
          { style: styles.skillsRow },
          ...skills.map((s, i) =>
            React.createElement(Text, { key: i, style: styles.skillChip }, s.name),
          ),
        ),
      ),
    ),
  );
}

/** Generate a PDF Blob from a StructuredResume. */
export async function generateResumePDF(resume: StructuredResume): Promise<Blob> {
  const element = React.createElement(ResumePDF, { resume });
  const blob = await pdf(element).toBlob();
  return blob;
}

/** Trigger a browser download of the resume PDF. */
export async function downloadResumePDF(resume: StructuredResume, filename = 'resume.pdf'): Promise<void> {
  const blob = await generateResumePDF(resume);
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}
