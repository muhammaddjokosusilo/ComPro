'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseBrowserClient } from '@/lib/supabase/browser-client';

export default function SetPasswordPage() {
  const router = useRouter();
  const supabase = getSupabaseBrowserClient();

  const [password, setPassword] = useState('');
  const [confirm, setConfirm] = useState('');
  const [message, setMessage] = useState('');

  useEffect(() => {
    supabase.auth.getSession();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (password !== confirm) {
      setMessage('Password tidak sama');
      return;
    }

    const { error } = await supabase.auth.updateUser({
      password,
    });

    if (error) {
      setMessage(error.message);
      return;
    }

    setMessage('Password berhasil dibuat');
    setTimeout(() => router.push('/login'), 1500);
  };

  return (
    <div style={{ maxWidth: 400, margin: '100px auto' }}>
      <h2>Buat Password</h2>

      <form onSubmit={handleSubmit}>
        <input
          type="password"
          placeholder="Password"
          onChange={(e) => setPassword(e.target.value)}
        />

        <input
          type="password"
          placeholder="Konfirmasi Password"
          onChange={(e) => setConfirm(e.target.value)}
        />

        <button type="submit">Simpan</button>
      </form>

      {message && <p>{message}</p>}
    </div>
  );
}