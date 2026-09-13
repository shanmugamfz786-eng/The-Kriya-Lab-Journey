CREATE TABLE public.program_dates (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_slug text NOT NULL,
  program_label text NOT NULL DEFAULT '',
  session_date date NOT NULL,
  start_time text,
  format text NOT NULL DEFAULT 'online',
  capacity integer NOT NULL DEFAULT 0,
  seats_taken integer NOT NULL DEFAULT 0,
  note_en text NOT NULL DEFAULT '',
  note_ta text NOT NULL DEFAULT '',
  is_open boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE (program_slug, session_date, start_time)
);

GRANT SELECT ON public.program_dates TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.program_dates TO authenticated;
GRANT ALL ON public.program_dates TO service_role;

ALTER TABLE public.program_dates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can read program dates" ON public.program_dates
  FOR SELECT TO anon, authenticated USING (true);

CREATE POLICY "Admins can manage program dates" ON public.program_dates
  FOR ALL TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_program_dates_updated_at
  BEFORE UPDATE ON public.program_dates
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

ALTER TABLE public.enquiries ADD COLUMN session_date date;
ALTER TABLE public.enquiries ADD COLUMN program_date_id uuid REFERENCES public.program_dates(id) ON DELETE SET NULL;