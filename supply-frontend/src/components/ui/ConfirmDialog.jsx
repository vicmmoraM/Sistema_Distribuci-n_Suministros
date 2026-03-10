import React from 'react';

export default function ConfirmDialog({
  isOpen,
  title,
  message,
  confirmText = 'Confirmar',
  cancelText = 'Cancelar',
  onConfirm,
  onCancel,
}) {
  if (!isOpen) return null;

  return (
    <div className="ui-confirm-overlay" onClick={onCancel}>
      <div className="ui-confirm-modal" onClick={(e) => e.stopPropagation()}>
        <h3>{title}</h3>
        <p>{message}</p>
        <div className="ui-confirm-actions">
          <button type="button" className="ui-btn-secondary" onClick={onCancel}>{cancelText}</button>
          <button type="button" className="ui-btn-primary" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  );
}
