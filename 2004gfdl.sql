/* Number of files uploaded to Wikimedia Commons in 2004 that have a GFDL license */
/* Similar live version (for 2015) at http://quarry.wmflabs.org/query/3949 */

use commonswiki_p;
SELECT count(page_title)
    FROM page, image
    WHERE page.page_namespace = 6
        AND page.page_title = image.img_name
        AND image.img_timestamp LIKE '2004%'
        AND page_id IN (
            SELECT DISTINCT(cl_from) FROM categorylinks
                    WHERE categorylinks.cl_to LIKE 'GFDL'
            );
