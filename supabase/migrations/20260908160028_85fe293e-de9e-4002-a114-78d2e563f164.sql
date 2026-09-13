CREATE TABLE public.student_purchases (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  email text NOT NULL,
  full_name text NOT NULL DEFAULT '',
  phone text,
  program_slug text NOT NULL,
  program_label text NOT NULL DEFAULT '',
  amount_inr numeric NOT NULL DEFAULT 0,
  currency text NOT NULL DEFAULT 'INR',
  status text NOT NULL DEFAULT 'paid',
  provider text NOT NULL DEFAULT 'stripe',
  payment_ref text,
  enrolment jsonb NOT NULL DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX student_purchases_email_idx ON public.student_purchases (lower(email));
CREATE INDEX student_purchases_user_idx ON public.student_purchases (user_id);

GRANT SELECT ON public.student_purchases TO authenticated;
GRANT ALL ON public.student_purchases TO service_role;

ALTER TABLE public.student_purchases ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Students can read their own purchases"
ON public.student_purchases FOR SELECT TO authenticated
USING (
  user_id = auth.uid()
  OR lower(email) = lower(coalesce(auth.jwt() ->> 'email', ''))
  OR private.has_role(auth.uid(), 'admin'::app_role)
);

CREATE POLICY "Admins can manage purchases"
ON public.student_purchases FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_student_purchases_updated_at
BEFORE UPDATE ON public.student_purchases
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TABLE public.program_access (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  program_slug text NOT NULL UNIQUE,
  program_label text NOT NULL DEFAULT '',
  zoom_url text NOT NULL DEFAULT '',
  zoom_notes_en text NOT NULL DEFAULT '',
  zoom_notes_ta text NOT NULL DEFAULT '',
  materials jsonb NOT NULL DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.program_access TO authenticated;
GRANT ALL ON public.program_access TO service_role;

ALTER TABLE public.program_access ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Purchasers can read access details"
ON public.program_access FOR SELECT TO authenticated
USING (
  private.has_role(auth.uid(), 'admin'::app_role)
  OR EXISTS (
    SELECT 1 FROM public.student_purchases sp
    WHERE sp.program_slug = program_access.program_slug
      AND sp.status IN ('paid', 'confirmed')
      AND (sp.user_id = auth.uid()
           OR lower(sp.email) = lower(coalesce(auth.jwt() ->> 'email', '')))
  )
);

CREATE POLICY "Admins can manage program access"
ON public.program_access FOR ALL TO authenticated
USING (private.has_role(auth.uid(), 'admin'::app_role))
WITH CHECK (private.has_role(auth.uid(), 'admin'::app_role));

CREATE TRIGGER update_program_access_updated_at
BEFORE UPDATE ON public.program_access
FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();