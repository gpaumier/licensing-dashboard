SELECT count(page_title)
    FROM page, image
    WHERE page.page_namespace = 6
        AND page.page_title = image.img_name
        AND image.img_timestamp LIKE ?
        AND page_id IN (
            SELECT DISTINCT(tl_from) FROM templatelinks
                    WHERE tl_namespace = 10
                        AND tl_title LIKE ?
            );
