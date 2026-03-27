-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Users Profile (Public)
CREATE TABLE public.profiles (
  id UUID REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
  email TEXT UNIQUE NOT NULL,
  display_name TEXT,
  photo_url TEXT,
  role TEXT DEFAULT 'Usuário' CHECK (role IN ('admin', 'pastor', 'secretario', 'Usuário')),
  campus_id UUID,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 2. Campuses
CREATE TABLE public.campuses (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  address TEXT NOT NULL,
  pastor_name TEXT NOT NULL,
  phone TEXT,
  image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 3. Members
CREATE TABLE public.members (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('ativo', 'inativo', 'baptizado', 'discipulado', 'não baptizado')),
  campus_id UUID REFERENCES public.campuses(id),
  function TEXT NOT NULL,
  workplace TEXT,
  marital_status TEXT,
  baptism_status TEXT CHECK (baptism_status IN ('Baptizado', 'Não Batizado')),
  birth_date DATE,
  address TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 4. Team Members
CREATE TABLE public.team (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('Pastor', 'Evangelista', 'Ancião', 'Diacono', 'Diaconisa', 'Cooperador', 'Cooperadora')),
  campus_id UUID REFERENCES public.campuses(id),
  function TEXT NOT NULL,
  workplace TEXT,
  marital_status TEXT,
  baptism_status TEXT CHECK (baptism_status IN ('Baptizado', 'Não Batizado')),
  birth_date DATE,
  address TEXT,
  department TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 5. Activities
CREATE TABLE public.activities (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  month TEXT NOT NULL,
  day TEXT NOT NULL,
  department TEXT,
  location TEXT,
  status TEXT CHECK (status IN ('Completed', 'Confirmed', 'Next Week', 'Pending')),
  success_feedback TEXT,
  failure_feedback TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);

-- 6. Notifications
CREATE TABLE public.notifications (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  type TEXT CHECK (type IN ('info', 'success', 'warning', 'error')),
  read BOOLEAN DEFAULT FALSE,
  user_id UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc'::text, NOW()) NOT NULL
);
