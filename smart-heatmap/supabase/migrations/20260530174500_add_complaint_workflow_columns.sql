alter table public.complaints
  add column if not exists user_id bigint,
  add column if not exists user_email text,
  add column if not exists location_name text,
  add column if not exists completion_image_url text,
  add column if not exists notification_sent boolean not null default false,
  add column if not exists notification_sent_at timestamptz;

create index if not exists complaints_user_id_idx
  on public.complaints (user_id);

create index if not exists complaints_user_email_idx
  on public.complaints (user_email);

create index if not exists complaints_status_idx
  on public.complaints (status);

notify pgrst, 'reload schema';
