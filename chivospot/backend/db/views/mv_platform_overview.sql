CREATE MATERIALIZED VIEW IF NOT EXISTS mv_platform_overview AS
SELECT
  DATE(t AT TIME ZONE 'America/El_Salvador') AS date,
  COUNT(DISTINCT event_id) FILTER (WHERE type = 'detail_view') AS eventos_con_interaccion,
  COUNT(*) FILTER (WHERE type = 'detail_view') AS engagement_total
FROM analytics_events
GROUP BY DATE(t AT TIME ZONE 'America/El_Salvador');
