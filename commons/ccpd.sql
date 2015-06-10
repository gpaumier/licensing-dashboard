/* Number of Commons files that are tagged with both a Creative Commons license template and a Public domain rationale template */

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
                       AND tl_title IN ('CC-Layout')
                       AND page_id IN (
                           SELECT DISTINCT(tl_from) FROM templatelinks
                               WHERE
                                       tl_namespace = 10
                                   AND tl_from_namespace = 6
                                   AND tl_title IN ('PD-Layout')
                           )
                );
