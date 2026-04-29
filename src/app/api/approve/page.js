import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const { id, email } = await req.json();

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY
  );

  // update status
  await supabase
    .from('registrations')
    .update({ status: 'approved' })
    .eq('id', id);

  // kirim email invite
  const { error } = await supabase.auth.admin.inviteUserByEmail(email, {
    redirectTo: 'http://localhost:3000/set-password',
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: 'User diinvite' });
}