import { useCallback, useEffect, useRef } from 'react';
import { flush, track } from '../lib/analytics';

const FIELD_TAGS = new Set(['INPUT', 'SELECT', 'TEXTAREA']);

function fieldName(el) {
  if (!el || !FIELD_TAGS.has(el.tagName)) return '';
  const raw =
    el.dataset?.track ||
    el.name ||
    el.getAttribute('aria-label') ||
    el.closest('label')?.querySelector('span')?.textContent ||
    el.getAttribute('autocomplete') ||
    el.type;
  return String(raw || '').trim().slice(0, 60);
}

function hasValue(el) {
  if (el.type === 'checkbox' || el.type === 'radio') return el.checked;
  return String(el.value || '').trim().length > 0;
}

/*
 * Form engagement for the Dashboard drop-off funnel. Spread `handlers` on the <form>;
 * input/change/blur bubble up from every field. A field counts as started on the first
 * real input (not on focus, because modals auto-focus their first field).
 */
export function useFormTracking(form, { active = true } = {}) {
  const startedFields = useRef(new Set());

  useEffect(() => {
    if (!active) return;
    startedFields.current = new Set();
    track('form_open', { form });
  }, [active, form]);

  const onInput = useCallback(
    (e) => {
      const field = fieldName(e.target);
      if (!field || startedFields.current.has(field)) return;
      startedFields.current.add(field);
      track('field_input', { form, field });
    },
    [form]
  );

  const onBlur = useCallback(
    (e) => {
      const field = fieldName(e.target);
      if (field && hasValue(e.target)) track('field_complete', { form, field });
    },
    [form]
  );

  const submitted = useCallback(() => {
    track('form_submit', { form });
    flush();
  }, [form]);

  return { handlers: { onInput, onChange: onInput, onBlur }, submitted };
}
