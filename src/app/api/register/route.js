import { createClient } from '@supabase/supabase-js';

export async function POST(req) {
  const formData = await req.formData();

  const fullName = formData.get('fullName');
  const email = formData.get('email');
  const phone = formData.get('phone');
  const programId = formData.get('programId');
  const file = formData.get('file');

  const supabase = createClient(
    process.env.SUPABASE_URL,
    process.env.SUPABASE_SERVICE_ROLE_KEY // 🔥 tetap di server
  );

  // upload file
  const fileName = `${Date.now()}-${file.name}`;

  const { error: uploadError } = await supabase.storage
    .from('payment')
    .upload(fileName, await file.arrayBuffer(), {
        contentType: file.type,
    });

  if (uploadError) {
    return Response.json({ error: uploadError.message }, { status: 500 });
  }

  const fileUrl = `${process.env.SUPABASE_URL}/storage/v1/object/public/payment/${fileName}`;

  // insert ke database
  const { error } = await supabase.from('registrations').insert({
    full_name: fullName,
    email,
    phone,
    program_id: programId,
    payment_file_url: fileUrl,
    status: 'pending',
  });

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ message: 'Berhasil daftar' });
}