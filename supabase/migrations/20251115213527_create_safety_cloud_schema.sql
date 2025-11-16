/*
  # Safety Cloud Database Schema

  ## Overview
  This migration creates the complete database schema for Safety Cloud, a digital resource repository
  for industrial safety, occupational health, civil protection, environmental management, and industrial management systems.

  ## Tables Created

  ### 1. user_profiles
  Stores extended user profile information beyond authentication
  - `id` (uuid, primary key) - References auth.users
  - `email` (text) - User email
  - `username` (text) - Display name
  - `nombre` (text) - First name
  - `apellido_paterno` (text) - Paternal surname
  - `apellido_materno` (text) - Maternal surname
  - `fecha_nacimiento` (date) - Date of birth
  - `curp` (text) - Mexican national ID
  - `role` (text) - User role (usuario/administrador)
  - `created_at` (timestamptz) - Account creation timestamp
  - `updated_at` (timestamptz) - Last update timestamp

  ### 2. user_preferences
  Stores user content preferences for personalized notifications
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References user_profiles
  - `area` (text) - Preferred area
  - `created_at` (timestamptz)

  ### 3. recursos
  Main resources table storing all downloadable content
  - `id` (uuid, primary key)
  - `nombre` (text) - Resource name
  - `descripcion` (text) - Description
  - `clave` (text) - Unique key/code
  - `enlace` (text) - Download link
  - `tipo_recurso` (text) - Resource type
  - `imagen` (text) - Image filename
  - `descargas` (integer) - Download count
  - `me_gusta` (integer) - Likes count
  - `area` (text) - Category area
  - `funcion` (text) - Function type
  - `clasificacion` (text) - Classification
  - `modalidad` (text) - Modality
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ### 4. descargas
  Tracks user downloads
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References user_profiles
  - `recurso_id` (uuid) - References recursos
  - `created_at` (timestamptz)

  ### 5. calificaciones
  Stores user ratings for resources
  - `id` (uuid, primary key)
  - `user_id` (uuid) - References user_profiles
  - `recurso_id` (uuid) - References recursos
  - `calificacion` (boolean) - Like/dislike
  - `created_at` (timestamptz)

  ### 6. blog_posts
  Stores blog content
  - `id` (uuid, primary key)
  - `titulo` (text) - Blog title
  - `contenido` (text) - Blog content
  - `imagen` (text) - Featured image
  - `autor_id` (uuid) - References user_profiles
  - `publicado` (boolean) - Published status
  - `created_at` (timestamptz)
  - `updated_at` (timestamptz)

  ## Security
  - Row Level Security (RLS) enabled on all tables
  - Policies created for authenticated users
  - Admin-only policies for administrative operations
  - Users can only access their own profile data
  - Public read access for resources (authenticated users only for downloads)
*/

-- Create user_profiles table
CREATE TABLE IF NOT EXISTS user_profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email text UNIQUE NOT NULL,
  username text,
  nombre text,
  apellido_paterno text,
  apellido_materno text,
  fecha_nacimiento date,
  curp text,
  role text DEFAULT 'usuario' CHECK (role IN ('usuario', 'administrador')),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON user_profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id);

CREATE POLICY "Admins can view all profiles"
  ON user_profiles FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- Create user_preferences table
CREATE TABLE IF NOT EXISTS user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  area text NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, area)
);

ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can manage own preferences"
  ON user_preferences FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Create recursos table
CREATE TABLE IF NOT EXISTS recursos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  descripcion text,
  clave text UNIQUE NOT NULL,
  enlace text NOT NULL,
  tipo_recurso text NOT NULL CHECK (tipo_recurso IN (
    'Documento de Word',
    'Documento de Excel',
    'Documento de Powerpoint',
    'Documento de PDF',
    'Archivo de Imagen',
    'Archivo de Video',
    'Página Web',
    'Aplicación Móvil',
    'Software',
    'Video/canal Youtube',
    'Otros'
  )),
  imagen text NOT NULL,
  descargas integer DEFAULT 0,
  me_gusta integer DEFAULT 0,
  area text NOT NULL CHECK (area IN (
    'Seguridad Industrial',
    'Salud Laboral',
    'Proteccion Civil',
    'Medio Ambiente',
    'Sistemas de Gestión'
  )),
  funcion text NOT NULL CHECK (funcion IN (
    'Manual',
    'Guia',
    'Formato',
    'Procedimiento',
    'Normativa',
    'Evaluación',
    'Programa'
  )),
  clasificacion text NOT NULL CHECK (clasificacion IN (
    'Utilidad Alta',
    'Utilidad Media',
    'Utilidad Baja'
  )),
  modalidad text NOT NULL CHECK (modalidad IN (
    'Editable',
    'No editable'
  )),
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE recursos ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view recursos"
  ON recursos FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Admins can insert recursos"
  ON recursos FOR INSERT
  TO authenticated
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

CREATE POLICY "Admins can update recursos"
  ON recursos FOR UPDATE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'administrador'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

CREATE POLICY "Admins can delete recursos"
  ON recursos FOR DELETE
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- Create descargas table
CREATE TABLE IF NOT EXISTS descargas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  recurso_id uuid REFERENCES recursos(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recurso_id)
);

ALTER TABLE descargas ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own descargas"
  ON descargas FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own descargas"
  ON descargas FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all descargas"
  ON descargas FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- Create calificaciones table
CREATE TABLE IF NOT EXISTS calificaciones (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES user_profiles(id) ON DELETE CASCADE,
  recurso_id uuid REFERENCES recursos(id) ON DELETE CASCADE,
  calificacion boolean NOT NULL,
  created_at timestamptz DEFAULT now(),
  UNIQUE(user_id, recurso_id)
);

ALTER TABLE calificaciones ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own calificaciones"
  ON calificaciones FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own calificaciones"
  ON calificaciones FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own calificaciones"
  ON calificaciones FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins can view all calificaciones"
  ON calificaciones FOR SELECT
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- Create blog_posts table
CREATE TABLE IF NOT EXISTS blog_posts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  titulo text NOT NULL,
  contenido text NOT NULL,
  imagen text,
  autor_id uuid REFERENCES user_profiles(id) ON DELETE SET NULL,
  publicado boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE blog_posts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view published blog posts"
  ON blog_posts FOR SELECT
  TO authenticated
  USING (publicado = true);

CREATE POLICY "Admins can manage blog posts"
  ON blog_posts FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'administrador'
    )
  )
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM user_profiles
      WHERE id = auth.uid() AND role = 'administrador'
    )
  );

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_recursos_area ON recursos(area);
CREATE INDEX IF NOT EXISTS idx_recursos_tipo ON recursos(tipo_recurso);
CREATE INDEX IF NOT EXISTS idx_recursos_funcion ON recursos(funcion);
CREATE INDEX IF NOT EXISTS idx_recursos_clasificacion ON recursos(clasificacion);
CREATE INDEX IF NOT EXISTS idx_descargas_user ON descargas(user_id);
CREATE INDEX IF NOT EXISTS idx_descargas_recurso ON descargas(recurso_id);
CREATE INDEX IF NOT EXISTS idx_calificaciones_recurso ON calificaciones(recurso_id);

-- Create function to automatically create user profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
BEGIN
  INSERT INTO public.user_profiles (id, email, role)
  VALUES (new.id, new.email, 'usuario');
  RETURN new;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new user signup
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Create function to update updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS trigger AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER set_updated_at_user_profiles
  BEFORE UPDATE ON user_profiles
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_recursos
  BEFORE UPDATE ON recursos
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();

CREATE TRIGGER set_updated_at_blog_posts
  BEFORE UPDATE ON blog_posts
  FOR EACH ROW EXECUTE FUNCTION handle_updated_at();