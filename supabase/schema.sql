-- Crea la tabla de perfiles, vinculada a los usuarios de auth.users
CREATE TABLE public.perfiles (
  id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  username text,
  idioma text CHECK (idioma IN ('es', 'en')),
  avatar_url text,
  updated_at timestamp with time zone,
  PRIMARY KEY (id)
);

-- Crea la tabla de hábitos
CREATE TABLE public.habitos (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  usuario_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  nombre text NOT NULL,
  icono text,
  frecuencia jsonb,
  creado_en timestamp with time zone DEFAULT now(),
  PRIMARY KEY (id)
);

-- Crea la tabla para los registros diarios de los hábitos
CREATE TABLE public.registros_diarios (
  id uuid NOT NULL DEFAULT gen_random_uuid(),
  habito_id uuid NOT NULL REFERENCES public.habitos (id) ON DELETE CASCADE,
  usuario_id uuid NOT NULL REFERENCES auth.users (id) ON DELETE CASCADE,
  fecha date DEFAULT current_date,
  puntuacion smallint,
  nota_diario text,
  PRIMARY KEY (id)
);

-- Habilita Row Level Security (RLS) para proteger los datos
ALTER TABLE public.perfiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.habitos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.registros_diarios ENABLE ROW LEVEL SECURITY;

-- Crea las políticas de seguridad para que cada usuario solo vea/edite sus propios datos
-- Políticas para perfiles
CREATE POLICY "Usuarios pueden ver su propio perfil" ON public.perfiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden actualizar su propio perfil" ON public.perfiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Usuarios pueden insertar su perfil" ON public.perfiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Políticas para hábitos
CREATE POLICY "Usuarios pueden ver sus propios hábitos" ON public.habitos FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios pueden insertar sus propios hábitos" ON public.habitos FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Usuarios pueden actualizar sus propios hábitos" ON public.habitos FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios pueden eliminar sus propios hábitos" ON public.habitos FOR DELETE USING (auth.uid() = usuario_id);

-- Políticas para registros_diarios
CREATE POLICY "Usuarios pueden ver sus propios registros" ON public.registros_diarios FOR SELECT USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios pueden insertar sus propios registros" ON public.registros_diarios FOR INSERT WITH CHECK (auth.uid() = usuario_id);
CREATE POLICY "Usuarios pueden actualizar sus propios registros" ON public.registros_diarios FOR UPDATE USING (auth.uid() = usuario_id);
CREATE POLICY "Usuarios pueden eliminar sus propios registros" ON public.registros_diarios FOR DELETE USING (auth.uid() = usuario_id);
