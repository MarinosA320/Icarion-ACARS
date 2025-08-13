ALTER TABLE public.training_requests
ADD COLUMN training_category TEXT DEFAULT 'Aircraft Type Rating' NOT NULL;

UPDATE public.training_requests
SET training_category = 'Aircraft Type Rating'
WHERE training_category IS NULL;