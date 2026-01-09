-- Enable necessary extensions
create extension if not exists "uuid-ossp";

-- Create classrooms table
create table if not exists public.classrooms (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  teacher_id uuid not null references auth.users(id) on delete cascade,
  created_at timestamp with time zone default now()
);

-- Create students table
create table if not exists public.students (
  id uuid primary key default gen_random_uuid(),
  name text not null,
  repo_url text not null,
  classroom_id uuid not null references public.classrooms(id) on delete cascade,
  marks integer default null,
  feedback text,
  created_at timestamp with time zone default now()
);

-- Enable Row Level Security (RLS)
alter table public.classrooms enable row level security;
alter table public.students enable row level security;

-- Policies for classrooms
-- Allow teachers to view their own classrooms
create policy "Teachers can view own classrooms" 
on public.classrooms for select 
using (auth.uid() = teacher_id);

-- Allow teachers to create classrooms
create policy "Teachers can create classrooms" 
on public.classrooms for insert 
with check (auth.uid() = teacher_id);

-- Allow teachers to update their own classrooms
create policy "Teachers can update own classrooms" 
on public.classrooms for update 
using (auth.uid() = teacher_id);

-- Allow teachers to delete their own classrooms
create policy "Teachers can delete own classrooms" 
on public.classrooms for delete 
using (auth.uid() = teacher_id);

-- Policies for students
-- Allow teachers to view students in their classrooms
create policy "Teachers can view students in their classrooms" 
on public.students for select 
using (
  classroom_id in (
    select id from public.classrooms where teacher_id = auth.uid()
  )
);

-- Allow teachers to add students to their classrooms
create policy "Teachers can insert students into their classrooms" 
on public.students for insert 
with check (
  classroom_id in (
    select id from public.classrooms where teacher_id = auth.uid()
  )
);

-- Allow teachers to update students in their classrooms (e.g. grading)
create policy "Teachers can update students in their classrooms" 
on public.students for update 
using (
  classroom_id in (
    select id from public.classrooms where teacher_id = auth.uid()
  )
);

-- Allow teachers to delete students from their classrooms
create policy "Teachers can delete students from their classrooms" 
on public.students for delete 
using (
  classroom_id in (
    select id from public.classrooms where teacher_id = auth.uid()
  )
);

-- Enable Realtime for these tables
-- Note: You might need to check if 'supabase_realtime' publication exists, which usually does in Supabase.
do $$
begin
  if not exists (select 1 from pg_publication where pubname = 'supabase_realtime') then
    create publication supabase_realtime;
  end if;
end
$$;

alter publication supabase_realtime add table public.classrooms;
alter publication supabase_realtime add table public.students;
