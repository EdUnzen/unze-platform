-- Einmalig: Bewertungs-Aggregate mit tatsächlichen Reviews abgleichen
-- Nach 022 ausführen wenn Demo-Daten falsche rating_avg/review_count haben

UPDATE public.communities c
SET
  rating_avg = COALESCE(sub.avg, 0),
  review_count = COALESCE(sub.cnt, 0)
FROM (
  SELECT
    community_id,
    ROUND(AVG(rating)::numeric, 2) AS avg,
    COUNT(*)::integer AS cnt
  FROM public.community_reviews
  GROUP BY community_id
) sub
WHERE c.id = sub.community_id;

UPDATE public.communities
SET rating_avg = 0, review_count = 0
WHERE NOT EXISTS (
  SELECT 1 FROM public.community_reviews r WHERE r.community_id = communities.id
)
AND (rating_avg <> 0 OR review_count <> 0);

UPDATE public.community_groups g
SET
  rating_avg = COALESCE(sub.avg, 0),
  review_count = COALESCE(sub.cnt, 0)
FROM (
  SELECT
    group_id,
    ROUND(AVG(rating)::numeric, 2) AS avg,
    COUNT(*)::integer AS cnt
  FROM public.group_reviews
  GROUP BY group_id
) sub
WHERE g.id = sub.group_id;

UPDATE public.community_groups
SET rating_avg = 0, review_count = 0
WHERE NOT EXISTS (
  SELECT 1 FROM public.group_reviews r WHERE r.group_id = community_groups.id
)
AND (rating_avg <> 0 OR review_count <> 0);
