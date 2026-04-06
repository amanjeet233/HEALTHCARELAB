import React, { useState } from 'react';
import { BookingResponse } from '../types/booking';
import { useDownloadBooking } from '../hooks/useDownloadBooking';
import '../styles/components/BookingActions.css';

interface BookingActionsProps {
  booking: BookingResponse;
  reportResults?: Record<string, any>;
  compact?: boolean; // Show as button group instead of expanded menu
  showEmail?: boolean; // Show email options
  onActionComplete?: () => void;
}

const BookingActions: React.FC<BookingActionsProps> = ({
  booking,
  reportResults,
  compact = false,
  showEmail = true,
  onActionComplete
}) => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const {
    isDownloading,
    isSending,
    downloadReceipt,
    downloadReport,
    downloadBoth,
    emailReceipt,
    emailReport
  } = useDownloadBooking();

  const handleDownloadReceipt = async () => {
    await downloadReceipt(booking);
    onActionComplete?.();
    setIsMenuOpen(false);
  };

  const handleDownloadReport = async () => {
    await downloadReport(booking, reportResults);
    onActionComplete?.();
    setIsMenuOpen(false);
  };

  const handleDownloadBoth = async () => {
    await downloadBoth(booking, reportResults);
    onActionComplete?.();
    setIsMenuOpen(false);
  };

  const handleEmailReceipt = async () => {
    await emailReceipt(booking);
    onActionComplete?.();
    setIsMenuOpen(false);
  };

  const handleEmailReport = async () => {
    await emailReport(booking, reportResults);
    onActionComplete?.();
    setIsMenuOpen(false);
  };

  if (compact) {
    // ✅ COMPACT VIEW: Inline buttons
    return (
      <div className="booking-actions-compact">
        <button
          className="action-btn receipt-btn"
          onClick={handleDownloadReceipt}
          disabled={isDownloading || isSending}
          title="Download booking receipt"
        >
          {isDownloading ? '⏳' : '📄'} Receipt
        </button>

        {booking.status === 'COMPLETED' && (
          <button
            className="action-btn report-btn"
            onClick={handleDownloadReport}
            disabled={isDownloading || isSending}
            title="Download lab report"
          >
            {isDownloading ? '⏳' : '📊'} Report
          </button>
        )}

        {showEmail && (
          <button
            className="action-btn email-btn"
            onClick={handleEmailReceipt}
            disabled={isSending || isDownloading}
            title="Send receipt via email"
          >
            {isSending ? '⏳' : '✉️'} Email
          </button>
        )}

        <button
          className="action-btn menu-btn"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          title="More options"
        >
          ⋮ More
        </button>

        {/* ✅ DROPDOWN MENU */}
        {isMenuOpen && (
          <div className="dropdown-menu">
            <button onClick={handleDownloadReceipt} disabled={isDownloading}>
              📄 Download Receipt
            </button>
            {booking.status === 'COMPLETED' && (
              <button onClick={handleDownloadReport} disabled={isDownloading}>
                📊 Download Report
              </button>
            )}
            {booking.status === 'COMPLETED' && (
              <button onClick={handleDownloadBoth} disabled={isDownloading}>
                📦 Download Both
              </button>
            )}
            {showEmail && (
              <>
                <div className="menu-divider"></div>
                <button onClick={handleEmailReceipt} disabled={isSending}>
                  ✉️ Email Receipt
                </button>
                {booking.status === 'COMPLETED' && (
                  <button onClick={handleEmailReport} disabled={isSending}>
                    📧 Email Report
                  </button>
                )}
              </>
            )}
          </div>
        )}
      </div>
    );
  }

  // ✅ EXPANDED VIEW: Card layout
  return (
    <div className="booking-actions-expanded">
      <div className="actions-section">
        <h3>📥 Download Documents</h3>
        <div className="actions-grid">
          <button
            className="action-card receipt-card"
            onClick={handleDownloadReceipt}
            disabled={isDownloading}
          >
            <div className="icon">📄</div>
            <div className="label">Booking Receipt</div>
            <div className="description">Download your booking confirmation</div>
            {isDownloading && <div className="loading">Loading...</div>}
          </button>

          {booking.status === 'COMPLETED' && (
            <button
              className="action-card report-card"
              onClick={handleDownloadReport}
              disabled={isDownloading}
            >
              <div className="icon">📊</div>
              <div className="label">Lab Report</div>
              <div className="description">Download your test results</div>
              {isDownloading && <div className="loading">Loading...</div>}
            </button>
          )}

          {booking.status === 'COMPLETED' && (
            <button
              className="action-card bundle-card"
              onClick={handleDownloadBoth}
              disabled={isDownloading}
            >
              <div className="icon">📦</div>
              <div className="label">Download Both</div>
              <div className="description">Get receipt and report together</div>
              {isDownloading && <div className="loading">Loading...</div>}
            </button>
          )}
        </div>
      </div>

      {showEmail && (
        <div className="actions-section">
          <h3>✉️ Send via Email</h3>
          <div className="actions-grid">
            <button
              className="action-card email-card"
              onClick={handleEmailReceipt}
              disabled={isSending}
            >
              <div className="icon">✉️</div>
              <div className="label">Email Receipt</div>
              <div className="description">Send receipt to {booking.patientEmail || 'your email'}</div>
              {isSending && <div className="loading">Sending...</div>}
            </button>

            {booking.status === 'COMPLETED' && (
              <button
                className="action-card email-card"
                onClick={handleEmailReport}
                disabled={isSending}
              >
                <div className="icon">📧</div>
                <div className="label">Email Report</div>
                <div className="description">Send results to {booking.patientEmail || 'your email'}</div>
                {isSending && <div className="loading">Sending...</div>}
              </button>
            )}
          </div>
        </div>
      )}

      <div className="actions-notes">
        <p>💡 All documents are encrypted and secure. Check your email spam folder if you don't receive the email.</p>
      </div>
    </div>
  );
};

export default BookingActions;
