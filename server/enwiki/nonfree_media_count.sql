/* Number of images tagged with {{Non-free media}} on enwiki */
/* live version: http://quarry.wmflabs.org/query/3944 */
use enwiki_p;
SELECT count(page_title)
    FROM page, image
    WHERE page.page_namespace = 6
        AND page.page_title = image.img_name
        AND page_id IN (
            SELECT DISTINCT(tl_from) FROM templatelinks
                    WHERE
                           tl_namespace = 10
                       AND tl_from_namespace = 6
                       AND tl_title IN ('Non-free_media')
        );
