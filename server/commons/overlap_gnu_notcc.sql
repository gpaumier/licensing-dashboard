/* Number of Commons files tagged with a GNU license template but not with a Creative Commons license template */

use commonswiki_p;
SELECT count(page_title)
    FROM page, image
    WHERE page.page_namespace = 6
        AND page.page_title = image.img_name
        AND page_id IN (
            SELECT DISTINCT(tl_from) FROM templatelinks
                    WHERE
                           tl_namespace = 10
                       AND tl_from_namespace = 6
                       AND tl_title IN ('GNU-Layout')
                       AND page_id NOT IN (
                           SELECT DISTINCT(tl_from) FROM templatelinks
                               WHERE
                                       tl_namespace = 10
                                   AND tl_from_namespace = 6
                                   AND tl_title IN ('CC-Layout')
                           )

                );
