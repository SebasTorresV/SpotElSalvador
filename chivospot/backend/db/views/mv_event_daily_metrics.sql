CREATE MATERIALIZED VIEW IF NOT EXISTS mv_event_daily_metrics AS
SELECT
  event_id,
  DATE(t AT TIME ZONE 'America/El_Salvador') AS date,
  COUNT(*) FILTER (WHERE type = 'impression') AS impressions,
  COUNT(*) FILTER (WHERE type = 'detail_view') AS detail_views,
  COUNT(*) FILTER (WHERE type = 'directions_click') AS directions_clicks,
  COUNT(*) FILTER (WHERE type = 'share_click') AS shares,
  COUNT(*) FILTER (WHERE type = 'favorite_add') AS favorites_add,
  COUNT(*) FILTER (WHERE type = 'reminder_add') AS reminders_add,
  CASE WHEN COUNT(*) FILTER (WHERE type = 'impression') > 0
    THEN COUNT(*) FILTER (WHERE type = 'detail_view')::float / NULLIF(COUNT(*) FILTER (WHERE type = 'impression'), 0)
    ELSE 0 END AS ctr_listado,
  CASE WHEN COUNT(*) > 0
    THEN (COUNT(*) FILTER (WHERE type IN ('favorite_add', 'reminder_add')))::float / COUNT(*)
    ELSE 0 END AS tasa_interaccion
FROM analytics_events
GROUP BY event_id, DATE(t AT TIME ZONE 'America/El_Salvador');
