
import React from 'react';
import { TicketTypeConfig, TicketStatus, Priority } from '../types';

export const TICKET_TYPES: TicketTypeConfig[] = [
  {
    ticket_type: 'data_issue',
    label: 'Data / Dataset Issue',
    icon: '📊',
    description: 'Issues related to data quality, missing records, or mapping.',
    allowed_roles: ['admin', 'data_analyst', 'external'],
    visible_to: 'all',
    default_team: 'Data Engineering',
    form_schema_json: {
      fields: [
        {
          key: 'dataset_name', label: 'Dataset Name', type: 'select', required: true, options: [
            { label: 'GP Dataset', value: 'gp_dataset' },
            { label: 'Fund Master', value: 'fund_master' },
            { label: 'Portfolio Co', value: 'portfolio_co' }
          ]
        },
        {
          key: 'entity_type', label: 'Entity Type', type: 'select', required: true, options: [
            { label: 'GP', value: 'gp' },
            { label: 'Fund', value: 'fund' },
            { label: 'Company', value: 'company' },
            { label: 'SP', value: 'sp' }
          ]
        },
        { key: 'record_link', label: 'Record Link (Optional)', type: 'url' },
        {
          key: 'issue_category', label: 'Issue Type', type: 'select', required: true, options: [
            { label: 'Missing Data', value: 'missing' },
            { label: 'Incorrect Data', value: 'incorrect' },
            { label: 'Duplicate', value: 'duplicate' },
            { label: 'Outdated', value: 'outdated' }
          ]
        },
        { key: 'description', label: 'Describe the data issue', type: 'textarea', required: true },
        { key: 'attachments', label: 'Upload Evidence', type: 'file' }
      ]
    }
  },
  {
    ticket_type: 'qa_issue',
    label: 'QA Issue',
    icon: '🧪',
    description: 'Internal verification and validation failures.',
    allowed_roles: ['admin', 'qa'],
    visible_to: 'internal',
    default_team: 'QA/QC',
    form_schema_json: {
      fields: [
        {
          key: 'qa_type', label: 'QA Category', type: 'select', required: true, options: [
            { label: 'Annotation Error', value: 'annotation' },
            { label: 'Validation Failure', value: 'validation' },
            { label: 'Sampling Issue', value: 'sampling' }
          ]
        },
        { key: 'linked_task', label: 'Linked Task/Batch ID', type: 'text', required: true },
        {
          key: 'severity', label: 'Severity', type: 'select', required: true, options: [
            { label: 'Blocker', value: 'blocker' },
            { label: 'Critical', value: 'critical' },
            { label: 'Major', value: 'major' },
            { label: 'Minor', value: 'minor' }
          ]
        },
        { key: 'description', label: 'Full Observation', type: 'textarea', required: true }
      ]
    }
  },
  {
    ticket_type: 'hr_issue',
    label: 'HR Issue',
    icon: '👤',
    description: 'Leave, payroll, and employee support.',
    allowed_roles: ['admin', 'employee'],
    visible_to: 'internal',
    default_team: 'HR Ops',
    form_schema_json: {
      fields: [
        {
          key: 'hr_category', label: 'HR Category', type: 'select', required: true, options: [
            { label: 'Leave Request', value: 'leave' },
            { label: 'Payroll Discrepancy', value: 'payroll' },
            { label: 'Attendance', value: 'attendance' },
            { label: 'Personal Detail Correction', value: 'profile' }
          ]
        },
        { key: 'description', label: 'Details', type: 'textarea', required: true },
        { key: 'attachments', label: 'Upload Documents', type: 'file' }
      ]
    }
  },
  {
    ticket_type: 'admin_issue',
    label: 'Admin / Ops Issue',
    icon: '🏢',
    description: 'Travel, vendor payments, and office facilities.',
    allowed_roles: ['admin', 'employee'],
    visible_to: 'internal',
    default_team: 'Operations',
    form_schema_json: {
      fields: [
        {
          key: 'category', label: 'Category', type: 'select', required: true, options: [
            { label: 'Travel', value: 'travel' },
            { label: 'Vendor Management', value: 'vendor' },
            { label: 'Payment Query', value: 'payment' },
            { label: 'Access Control', value: 'access' }
          ]
        },
        {
          key: 'urgency', label: 'Urgency', type: 'select', required: true, options: [
            { label: 'P1 - Immediate', value: 'p1' },
            { label: 'P2 - 24 Hours', value: 'p2' },
            { label: 'P3 - Weekly', value: 'p3' }
          ]
        },
        { key: 'description', label: 'Request details', type: 'textarea', required: true }
      ]
    }
  },
  {
    ticket_type: 'asset_issue',
    label: 'Asset / Infra Issue',
    icon: '💻',
    description: 'Hardware, software, and tool requests.',
    allowed_roles: ['admin', 'employee'],
    visible_to: 'internal',
    default_team: 'IT / Infra',
    form_schema_json: {
      fields: [
        {
          key: 'asset_type', label: 'Asset Type', type: 'select', required: true, options: [
            { label: 'Laptop / PC', value: 'laptop' },
            { label: 'Monitors/Peripherals', value: 'peripheral' },
            { label: 'Software License', value: 'software' },
            { label: 'Cloud Resources', value: 'cloud' }
          ]
        },
        { key: 'asset_id', label: 'Asset ID (If applicable)', type: 'text' },
        { key: 'description', label: 'Describe the issue/need', type: 'textarea', required: true }
      ]
    }
  },
  {
    ticket_type: 'platform_issue',
    label: 'Platform / Login Issue',
    icon: '🌐',
    description: 'Access issues for AnnoNest, NestLens, NestHR.',
    allowed_roles: ['admin', 'employee', 'external'],
    visible_to: 'all',
    default_team: 'Product Support',
    form_schema_json: {
      fields: [
        {
          key: 'platform', label: 'Platform', type: 'select', required: true, options: [
            { label: 'AnnoNest', value: 'annonest' },
            { label: 'NestLens', value: 'nestlens' },
            { label: 'NestHR', value: 'nesthr' }
          ]
        },
        {
          key: 'issue_type', label: 'Problem', type: 'select', required: true, options: [
            { label: 'Login Failed', value: 'login' },
            { label: 'Signup Issue', value: 'signup' },
            { label: 'Access Denied', value: 'denied' },
            { label: 'System Bug', value: 'bug' }
          ]
        },
        { key: 'error_message', label: 'Error Message (Optional)', type: 'text' },
        { key: 'description', label: 'Additional context', type: 'textarea', required: true },
        { key: 'attachments', label: 'Screenshot', type: 'file' }
      ]
    }
  },
  {
    ticket_type: 'feature_request',
    label: 'Feature Request',
    icon: '💡',
    description: 'Suggest improvements or new tools.',
    allowed_roles: ['admin', 'employee', 'external'],
    visible_to: 'all',
    default_team: 'Product Roadmap',
    form_schema_json: {
      fields: [
        { key: 'product', label: 'Product / Service', type: 'text', required: true, placeholder: 'e.g., Data Workflow' },
        { key: 'feature_name', label: 'Short Name', type: 'text', required: true },
        { key: 'business_case', label: 'Business Use Case', type: 'textarea', required: true },
        {
          key: 'priority_ask', label: 'How important is this?', type: 'select', options: [
            { label: 'Nice to have', value: 'low' },
            { label: 'Important', value: 'medium' },
            { label: 'Urgent need', value: 'high' }
          ]
        }
      ]
    }
  },
  {
    ticket_type: 'feedback',
    label: 'General Feedback',
    icon: '💬',
    description: 'Share your thoughts or report general vibes.',
    allowed_roles: ['admin', 'employee', 'external'],
    visible_to: 'all',
    default_team: 'Growth/Product',
    form_schema_json: {
      fields: [
        { key: 'message', label: 'Your message', type: 'textarea', required: true },
        {
          key: 'rating', label: 'Rating (1-5)', type: 'select', options: [
            { label: '5 - Excellent', value: '5' },
            { label: '4 - Good', value: '4' },
            { label: '3 - Average', value: '3' },
            { label: '2 - Poor', value: '2' },
            { label: '1 - Terrible', value: '1' }
          ]
        },
        { key: 'email', label: 'Contact Email (Optional)', type: 'text' }
      ]
    }
  }
];

export const PRIORITY_COLORS = {
  [Priority.LOW]: 'bg-gray-400 text-gray-700',
  [Priority.MEDIUM]: 'bg-blue-500 text-blue-700',
  [Priority.HIGH]: 'bg-orange-400 text-orange-700',
  [Priority.CRITICAL]: 'bg-red-500 text-red-700',
};


export const STATUS_LABELS = {
  [TicketStatus.TODO]: 'TO DO',
  [TicketStatus.ACKNOWLEDGED]: 'ACKNOWLEDGED',
  [TicketStatus.IN_REVIEW]: 'IN REVIEW',
  [TicketStatus.DONE]: 'DONE',
  [TicketStatus.REJECTED]: 'REJECSTED',
};
