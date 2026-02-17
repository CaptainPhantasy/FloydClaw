/**
 * ═══════════════════════════════════════════════════════════════════════════
 * CRON JOB FORM COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════
 * 
 * A form for creating scheduled jobs with CSS Grid-based layout.
 * 
 * @example
 * ```tsx
 * <NewJobForm
 *   onSubmit={(data) => console.log(data)}
 *   onCancel={() => setIsOpen(false)}
 *   defaultAgentId="main"
 * />
 * ```
 */

import React, { useState, useCallback } from 'react';
import styles from './CronJobForm.module.css';

/* ═══════════════════════════════════════════════════════════════════════════
 * TYPE DEFINITIONS
 * ═══════════════════════════════════════════════════════════════════════════ */

export type ScheduleType = 'every' | 'specific';
export type TimeUnit = 'minutes' | 'hours' | 'days' | 'weeks';
export type SessionType = 'isolated' | 'persistent';
export type WakeMode = 'now' | 'deferred';
export type PayloadType = 'agent_turn' | 'system_ping' | 'webhook';

export interface CronJobFormData {
  name: string;
  description: string;
  agentId: string;
  enabled: boolean;
  notifyWebhook: boolean;
  scheduleType: ScheduleType;
  every: number;
  unit: TimeUnit;
  session: SessionType;
  wakeMode: WakeMode;
  payload: PayloadType;
  agentMessage: string;
}

export interface NewJobFormProps {
  /** Form submission handler */
  onSubmit?: (data: CronJobFormData) => void | Promise<void>;
  
  /** Cancel button handler */
  onCancel?: () => void;
  
  /** Default agent ID */
  defaultAgentId?: string;
  
  /** Available agents for dropdown */
  agents?: Array<{ id: string; name: string }>;
  
  /** Initial form data for editing */
  initialData?: Partial<CronJobFormData>;
  
  /** Loading state */
  isLoading?: boolean;
  
  /** Additional CSS class names */
  className?: string;
}

const DEFAULT_FORM_DATA: CronJobFormData = {
  name: '',
  description: '',
  agentId: 'default',
  enabled: true,
  notifyWebhook: false,
  scheduleType: 'every',
  every: 30,
  unit: 'minutes',
  session: 'isolated',
  wakeMode: 'now',
  payload: 'agent_turn',
  agentMessage: '',
};

/* ═══════════════════════════════════════════════════════════════════════════
 * COMPONENT
 * ═══════════════════════════════════════════════════════════════════════════ */

export const NewJobForm: React.FC<NewJobFormProps> = ({
  onSubmit,
  onCancel,
  defaultAgentId = 'default',
  agents = [],
  initialData,
  isLoading = false,
  className = '',
}) => {
  // Form state
  const [formData, setFormData] = useState<CronJobFormData>({
    ...DEFAULT_FORM_DATA,
    ...initialData,
    agentId: initialData?.agentId || defaultAgentId,
  });

  const [errors, setErrors] = useState<Partial<Record<keyof CronJobFormData, string>>>({});

  /* ═══════════════════════════════════════════════════════════════════════
   * HANDLERS
   * ═══════════════════════════════════════════════════════════════════════ */

  const handleInputChange = useCallback(
    (field: keyof CronJobFormData) => (
      e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
    ) => {
      const value = e.target.type === 'checkbox' 
        ? (e.target as HTMLInputElement).checked 
        : e.target.value;
      
      setFormData((prev) => ({ ...prev, [field]: value }));
      
      // Clear error when field is modified
      if (errors[field]) {
        setErrors((prev) => ({ ...prev, [field]: undefined }));
      }
    },
    [errors]
  );

  const validateForm = useCallback((): boolean => {
    const newErrors: Partial<Record<keyof CronJobFormData, string>> = {};

    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }

    if (formData.every < 1 || formData.every > 9999) {
      newErrors.every = 'Must be between 1 and 9999';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData]);

  const handleSubmit = useCallback(
    async (e: React.FormEvent) => {
      e.preventDefault();

      if (!validateForm()) {
        return;
      }

      try {
        await onSubmit?.(formData);
      } catch (error) {
        console.error('Form submission error:', error);
      }
    },
    [formData, onSubmit, validateForm]
  );

  /* ═══════════════════════════════════════════════════════════════════════
   * RENDER
   * ═══════════════════════════════════════════════════════════════════════ */

  const containerClasses = [styles.cronFormContainer, className].filter(Boolean).join(' ');

  return (
    <div className={containerClasses}>
      {/* Header Section */}
      <div className={styles.cronFormHeader}>
        <h2 className={styles.cronFormTitle}>New Job</h2>
        <p className={styles.cronFormDescription}>
          Create a scheduled wakeup or agent run.
        </p>
      </div>

      {/* The Strict Grid Layout */}
      <form className={styles.cronFormGrid} onSubmit={handleSubmit}>
        {/* ═══════════════════════════════════════════════════════════════════
         * ROW 1: Name & Description
         * ═══════════════════════════════════════════════════════════════════ */}
        <div className={styles.cronInputGroup}>
          <label className={styles.cronLabel} htmlFor="cron-name">
            Name
          </label>
          <input
            id="cron-name"
            type="text"
            className={`${styles.cronInput} ${errors.name ? styles.cronInputError : ''}`}
            value={formData.name}
            onChange={handleInputChange('name')}
            placeholder="Job name"
            disabled={isLoading}
          />
          {errors.name && <span className={styles.cronErrorText}>{errors.name}</span>}
        </div>

        <div className={styles.cronInputGroup}>
          <label className={styles.cronLabel} htmlFor="cron-description">
            Description
          </label>
          <input
            id="cron-description"
            type="text"
            className={styles.cronInput}
            value={formData.description}
            onChange={handleInputChange('description')}
            placeholder="Optional description"
            disabled={isLoading}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
         * ROW 2: Agent ID & Enabled
         * ═══════════════════════════════════════════════════════════════════ */}
        <div className={styles.cronInputGroup}>
          <label className={styles.cronLabel} htmlFor="cron-agent-id">
            Agent ID
          </label>
          {agents.length > 0 ? (
            <select
              id="cron-agent-id"
              className={styles.cronSelect}
              value={formData.agentId}
              onChange={handleInputChange('agentId')}
              disabled={isLoading}
            >
              {agents.map((agent) => (
                <option key={agent.id} value={agent.id}>
                  {agent.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              id="cron-agent-id"
              type="text"
              className={`${styles.cronInput} ${styles.cronInputCyan}`}
              value={formData.agentId}
              onChange={handleInputChange('agentId')}
              disabled={isLoading}
              readOnly
            />
          )}
        </div>

        <div className={styles.cronCheckboxGroup}>
          <label className={styles.cronLabel} htmlFor="cron-enabled">
            Enabled
          </label>
          <input
            id="cron-enabled"
            type="checkbox"
            className={styles.cronCheckbox}
            checked={formData.enabled}
            onChange={handleInputChange('enabled')}
            disabled={isLoading}
          />
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
         * ROW 3: Notify webhook & Schedule type
         * ═══════════════════════════════════════════════════════════════════ */}
        <div className={styles.cronCheckboxGroup}>
          <label className={styles.cronLabel} htmlFor="cron-notify">
            Notify webhook
          </label>
          <input
            id="cron-notify"
            type="checkbox"
            className={styles.cronCheckbox}
            checked={formData.notifyWebhook}
            onChange={handleInputChange('notifyWebhook')}
            disabled={isLoading}
          />
        </div>

        <div className={styles.cronInputGroup}>
          <label className={styles.cronLabel} htmlFor="cron-schedule">
            Schedule
          </label>
          <select
            id="cron-schedule"
            className={styles.cronSelect}
            value={formData.scheduleType}
            onChange={handleInputChange('scheduleType')}
            disabled={isLoading}
          >
            <option value="every">Every</option>
            <option value="specific">Specific Time</option>
          </select>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
         * ROW 4: Every & Unit
         * ═══════════════════════════════════════════════════════════════════ */}
        <div className={styles.cronInputGroup}>
          <label className={styles.cronLabel} htmlFor="cron-every">
            Every
          </label>
          <input
            id="cron-every"
            type="number"
            className={`${styles.cronInput} ${errors.every ? styles.cronInputError : ''}`}
            value={formData.every}
            onChange={handleInputChange('every')}
            min={1}
            max={9999}
            disabled={isLoading}
          />
          {errors.every && <span className={styles.cronErrorText}>{errors.every}</span>}
        </div>

        <div className={styles.cronInputGroup}>
          <label className={styles.cronLabel} htmlFor="cron-unit">
            Unit
          </label>
          <select
            id="cron-unit"
            className={styles.cronSelect}
            value={formData.unit}
            onChange={handleInputChange('unit')}
            disabled={isLoading}
          >
            <option value="minutes">Minutes</option>
            <option value="hours">Hours</option>
            <option value="days">Days</option>
            <option value="weeks">Weeks</option>
          </select>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
         * ROW 5: Session & Wake mode
         * ═══════════════════════════════════════════════════════════════════ */}
        <div className={styles.cronInputGroup}>
          <label className={styles.cronLabel} htmlFor="cron-session">
            Session
          </label>
          <select
            id="cron-session"
            className={styles.cronSelect}
            value={formData.session}
            onChange={handleInputChange('session')}
            disabled={isLoading}
          >
            <option value="isolated">Isolated</option>
            <option value="persistent">Persistent</option>
          </select>
        </div>

        <div className={styles.cronInputGroup}>
          <label className={styles.cronLabel} htmlFor="cron-wake">
            Wake mode
          </label>
          <select
            id="cron-wake"
            className={styles.cronSelect}
            value={formData.wakeMode}
            onChange={handleInputChange('wakeMode')}
            disabled={isLoading}
          >
            <option value="now">Now</option>
            <option value="deferred">Deferred</option>
          </select>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
         * ROW 6: Payload & Empty placeholder
         * ═══════════════════════════════════════════════════════════════════ */}
        <div className={styles.cronInputGroup}>
          <label className={styles.cronLabel} htmlFor="cron-payload">
            Payload
          </label>
          <select
            id="cron-payload"
            className={styles.cronSelect}
            value={formData.payload}
            onChange={handleInputChange('payload')}
            disabled={isLoading}
          >
            <option value="agent_turn">Agent turn</option>
            <option value="system_ping">System ping</option>
            <option value="webhook">Webhook</option>
          </select>
        </div>

        {/* Empty div to keep Payload on the left and force next row down */}
        <div aria-hidden="true" />

        {/* ═══════════════════════════════════════════════════════════════════
         * ROW 7: Agent message (Full Width)
         * ═══════════════════════════════════════════════════════════════════ */}
        <div className={`${styles.cronInputGroup} ${styles.colSpanFull}`}>
          <label className={styles.cronLabel} htmlFor="cron-message">
            Agent message
          </label>
          <textarea
            id="cron-message"
            className={`${styles.cronInput} ${styles.cronTextarea}`}
            rows={3}
            value={formData.agentMessage}
            onChange={handleInputChange('agentMessage')}
            placeholder="Optional message to send to the agent"
            disabled={isLoading}
          />
          <span className={styles.cronHelperText}>
            This message will be sent when the job triggers
          </span>
        </div>

        {/* ═══════════════════════════════════════════════════════════════════
         * ACTIONS
         * ═══════════════════════════════════════════════════════════════════ */}
        <div className={styles.cronFormActions}>
          {onCancel && (
            <button
              type="button"
              className={`${styles.cronButton} ${styles.cronButtonSecondary}`}
              onClick={onCancel}
              disabled={isLoading}
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className={`${styles.cronButton} ${styles.cronButtonPrimary}`}
            disabled={isLoading}
          >
            {isLoading ? 'Creating...' : 'Create Job'}
          </button>
        </div>
      </form>
    </div>
  );
};

/* ═══════════════════════════════════════════════════════════════════════════
 * DISPLAY NAME
 * ═══════════════════════════════════════════════════════════════════════════ */

NewJobForm.displayName = 'NewJobForm';

/* ═══════════════════════════════════════════════════════════════════════════
 * DEFAULT EXPORT
 * ═══════════════════════════════════════════════════════════════════════════ */

export default NewJobForm;
