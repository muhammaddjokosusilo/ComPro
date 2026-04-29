'use client';

import { useState } from 'react';
import Link from 'next/link';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import ChatbotWidget from '@/components/ChatbotWidget';
import { programs, formatCurrency } from '@/lib/data';
import { 
  Upload, CheckCircle, ArrowLeft, ArrowRight, User, Mail, Phone, 
  CreditCard, QrCode, Building
} from 'lucide-react';

export default function RegisterPage() {
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const [formData, setFormData] = useState({
    fullName: '',
    email: '',
    phone: '',
    programId: '',
    paymentFile: null,
    paymentFileName: ''
  });

  const [submitted, setSubmitted] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({
        ...formData,
        paymentFile: file,
        paymentFileName: file.name
      });
    }
  };

  // 🔥 VALIDASI PER STEP
  const validateStep = () => {
    if (step === 1) {
      if (!formData.fullName || !formData.email || !formData.phone) {
        setError('Lengkapi data diri');
        return false;
      }
    }

    if (step === 2) {
      if (!formData.programId) {
        setError('Pilih program');
        return false;
      }
    }

    if (step === 3) {
      if (!formData.paymentFile) {
        setError('Upload bukti pembayaran');
        return false;
      }
    }

    setError('');
    return true;
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep(step + 1);
  };

  // 🔥 SUBMIT KE API
  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!formData.paymentFile) {
      setError('Upload bukti pembayaran');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const form = new FormData();
      form.append('fullName', formData.fullName);
      form.append('email', formData.email);
      form.append('phone', formData.phone);
      form.append('programId', formData.programId);
      form.append('file', formData.paymentFile);

      const res = await fetch('/api/register', {
        method: 'POST',
        body: form
      });

      const result = await res.json();

      if (!res.ok) {
        setError(result.error || 'Terjadi kesalahan');
        setLoading(false);
        return;
      }

      setSubmitted(true);
    } catch (err) {
      setError('Gagal mengirim data');
    }

    setLoading(false);
  };

  const steps = [
    { num: 1, label: 'Data Diri' },
    { num: 2, label: 'Program' },
    { num: 3, label: 'Pembayaran' },
    { num: 4, label: 'Konfirmasi' },
  ];

  if (submitted) {
    return (
      <>
        <Navbar />
        <main>
          <div className="success-page">
            <div>
              <div className="success-icon">
                <CheckCircle size={40} />
              </div>
              <h1>Pendaftaran Berhasil!</h1>
              <p>
                Terima kasih, <strong>{formData.fullName}</strong>. 
                Menunggu verifikasi admin.
              </p>
              <Link href="/" className="btn btn-primary">
                Kembali
              </Link>
            </div>
          </div>
        </main>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <main>
        <div className="register-page">
          <div className="container">
            <div className="register-container">

              {/* ERROR */}
              {error && (
                <div style={{ color: 'red', marginBottom: 16 }}>
                  {error}
                </div>
              )}

              {/* STEP */}
              <div className="register-steps">
                {steps.map((s, i) => (
                  <div key={s.num}>
                    <div className={`register-step ${step === s.num ? 'active' : ''}`}>
                      {s.label}
                    </div>
                  </div>
                ))}
              </div>

              <form onSubmit={handleSubmit}>
                <div className="card">

                  {/* STEP 1 */}
                  {step === 1 && (
                    <>
                      <input name="fullName" placeholder="Nama" onChange={handleChange} />
                      <input name="email" placeholder="Email" onChange={handleChange} />
                      <input name="phone" placeholder="No HP" onChange={handleChange} />
                    </>
                  )}

                  {/* STEP 2 */}
                  {step === 2 && (
                    <>
                      {programs.map(p => (
                        <label key={p.id}>
                          <input
                            type="radio"
                            name="programId"
                            value={p.id}
                            onChange={handleChange}
                          />
                          {p.name} - {formatCurrency(p.price)}
                        </label>
                      ))}
                    </>
                  )}

                  {/* STEP 3 */}
                  {step === 3 && (
                    <>
                      <input type="file" onChange={handleFileChange} />
                      {formData.paymentFileName && <p>{formData.paymentFileName}</p>}
                    </>
                  )}

                  {/* STEP 4 */}
                  {step === 4 && (
                    <>
                      <p>{formData.fullName}</p>
                      <p>{formData.email}</p>
                    </>
                  )}

                  {/* NAV */}
                  <div style={{ marginTop: 20 }}>
                    {step > 1 && (
                      <button type="button" onClick={() => setStep(step - 1)}>
                        Back
                      </button>
                    )}

                    {step < 4 ? (
                      <button type="button" onClick={handleNext}>
                        Next
                      </button>
                    ) : (
                      <button type="submit" disabled={loading}>
                        {loading ? 'Loading...' : 'Submit'}
                      </button>
                    )}
                  </div>

                </div>
              </form>

            </div>
          </div>
        </div>
      </main>
      <Footer />
      <ChatbotWidget />
    </>
  );
}